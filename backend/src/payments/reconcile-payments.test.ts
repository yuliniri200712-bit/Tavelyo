import { describe, expect, it, vi } from 'vitest';
import type { AuthorizationRecord } from './ledger.ts';
import { createMemoryLedger } from './memory-ledger.test-support.ts';
import { createPaymentProcessor } from './payment-processor.ts';
import {
  createReconcilePayments,
  outboxBackoffMs,
  RECONCILE_LIMITS,
  RELEASE_AUTHORIZATION_TASK,
} from './reconcile-payments.ts';
import { createSimulatedPaymentGateway } from './simulated-gateway.ts';

const START = new Date('2026-11-18T20:00:00Z');
const TENANT = '7'.repeat(32);
const BRANCH = '6'.repeat(32);
const QUOTE_ID = '9'.repeat(32);
const AUTH_ID = 'a'.repeat(32);
const LATER = new Date(START.getTime() + 10 * 60_000);

function setup() {
  let now = START;
  const clock = () => now;
  const gateway = createSimulatedPaymentGateway('demo-tavelyo', { now: clock });
  const memory = createMemoryLedger(clock);
  const processor = createPaymentProcessor({ gateway, ledger: memory.ledger, now: clock });
  const log = { warn: vi.fn(), error: vi.fn() };
  const reconcile = createReconcilePayments({
    store: memory.store,
    ledger: memory.ledger,
    processor,
    gateway,
    now: clock,
    log,
  });
  return {
    gateway,
    memory,
    processor,
    log,
    reconcile,
    at(date: Date) {
      now = date;
    },
    async hold(key: string, amountMinor = '6400000') {
      const result = await gateway.authorize({
        amount: { amountMinor, currency: 'COP' },
        idempotencyKey: key,
        reference: key,
      });
      return result;
    },
  };
}

function authorizationOf(providerRef: string, expiresAt: Date | null): AuthorizationRecord {
  return {
    id: AUTH_ID,
    tenantId: TENANT,
    branchId: BRANCH,
    provider: 'simulated',
    providerRef,
    currency: 'COP',
    authorizedMinor: '6400000',
    capturedMinor: '0',
    status: 'AUTHORIZED',
    expiresAt,
  };
}

describe('conciliación de pagos', () => {
  it('resuelve una captura sin respuesta repitiendo la misma operación (caso 7)', async () => {
    const context = setup();
    const hold = await context.hold('quote_1');
    const authorization = authorizationOf(hold.paymentRef, null);
    context.memory.addAuthorization(authorization);
    context.gateway.controls.failNext('capture', 'timeout-lost');
    const payment = 'b'.repeat(32);
    expect(
      (
        await context.processor.capture({
          authorization,
          paymentId: payment,
          amountMinor: '3200000',
          actorId: 'cajero',
        })
      ).kind,
    ).toBe('unknown');

    // Recién ocurrida no se toca: puede seguir en curso.
    expect((await context.reconcile()).resolved).toBe(0);
    context.at(LATER);
    const report = await context.reconcile();
    expect(report).toMatchObject({ resolved: 1, unresolved: 0, errors: 0 });
    expect(context.memory.payments.get(payment)?.status).toBe('CONFIRMED');
    // Repetirla no hace nada más.
    expect((await context.reconcile()).resolved).toBe(0);
  });

  it('autorización perdida con el resumen vencido: registra la retención y la libera', async () => {
    const context = setup();
    context.memory.quotes.set(QUOTE_ID, {
      status: 'QUOTED',
      sessionId: '4'.repeat(32),
      participantId: '3'.repeat(32),
      expiresAt: new Date(START.getTime() + 5 * 60_000),
    });
    const { operation } = await context.memory.ledger.begin({
      tenantId: TENANT,
      branchId: BRANCH,
      kind: 'AUTHORIZE',
      idempotencyKey: `quote_${QUOTE_ID}`,
      currency: 'COP',
      amountMinor: '6400000',
      providerRef: null,
      quoteId: QUOTE_ID,
    });
    // La pasarela sí la autorizó, pero la respuesta no llegó a Tavelyo.
    await context.hold(`quote_${QUOTE_ID}`);
    await context.memory.ledger.markUnknown(operation);

    // Mientras el resumen está vigente, el cliente puede reintentar: se espera.
    context.at(new Date(START.getTime() + 3 * 60_000));
    expect(await context.reconcile()).toMatchObject({ unresolved: 1, adopted: 0 });

    context.at(LATER);
    const report = await context.reconcile();
    expect(report).toMatchObject({ adopted: 1, released: 1, errors: 0 });
    expect(context.memory.quotes.get(QUOTE_ID)?.status).toBe('RELEASE_PENDING');
    const [adopted] = [...context.memory.authorizations.values()];
    expect(adopted?.status).toBe('VOIDED');
    expect(context.memory.effects.filter((effect) => effect.startsWith('void:'))).toHaveLength(1);
  });

  it('autorización perdida que la pasarela no conoce: la operación falla, sin retención', async () => {
    const context = setup();
    context.memory.quotes.set(QUOTE_ID, {
      status: 'QUOTED',
      sessionId: '4'.repeat(32),
      participantId: '3'.repeat(32),
      expiresAt: START,
    });
    await context.memory.ledger.begin({
      tenantId: TENANT,
      branchId: BRANCH,
      kind: 'AUTHORIZE',
      idempotencyKey: `quote_${QUOTE_ID}`,
      currency: 'COP',
      amountMinor: '6400000',
      providerRef: null,
      quoteId: QUOTE_ID,
    });
    context.at(LATER);
    expect(await context.reconcile()).toMatchObject({ resolved: 1, adopted: 0, released: 0 });
    expect([...context.memory.operations.values()][0]).toMatchObject({
      status: 'FAILED',
      failureCode: 'not_found',
    });
    expect(context.memory.authorizations.size).toBe(0);
  });

  it('libera las retenciones de pedidos que no llegaron a cocina (RELEASE_PENDING)', async () => {
    const context = setup();
    const hold = await context.hold('quote_1');
    context.memory.quotes.set(QUOTE_ID, {
      status: 'RELEASE_PENDING',
      sessionId: '4'.repeat(32),
      participantId: '3'.repeat(32),
      expiresAt: START,
    });
    context.memory.addAuthorization(authorizationOf(hold.paymentRef, null), QUOTE_ID);
    expect(await context.reconcile()).toMatchObject({ released: 1 });
    expect(context.memory.authorizations.get(AUTH_ID)?.status).toBe('VOIDED');
    expect(await context.reconcile()).toMatchObject({ released: 0 });
  });

  it('marca vencidas las que pasaron su plazo y avisa de las que vencen en menos de 24 h', async () => {
    const context = setup();
    const hold = await context.hold('quote_1');
    context.memory.addAuthorization(
      authorizationOf(hold.paymentRef, new Date(START.getTime() + 3_600_000)),
    );
    const report = await context.reconcile();
    expect(report).toMatchObject({ expiringSoon: 1, expired: 0 });
    expect(context.log.warn).toHaveBeenCalledWith(expect.stringMatching(/vencen/), {
      authorizationIds: [AUTH_ID],
    });
    context.at(new Date(START.getTime() + 3_600_000));
    expect(await context.reconcile()).toMatchObject({ expired: 1, expiringSoon: 0 });
    expect(context.memory.authorizations.get(AUTH_ID)?.status).toBe('EXPIRED');
  });

  it('outbox: libera, reintenta con espera creciente y abandona tras el máximo', async () => {
    const context = setup();
    const hold = await context.hold('quote_1');
    context.memory.addAuthorization(authorizationOf(hold.paymentRef, null));
    const payload = JSON.stringify({ authorizationId: AUTH_ID });
    context.memory.addOutboxTask(
      { id: 'o1', kind: RELEASE_AUTHORIZATION_TASK, payload, attempts: 0 },
      START,
    );
    context.gateway.controls.failNext('void', 'fail');
    expect(await context.reconcile()).toMatchObject({ outboxRetried: 1, outboxDone: 0 });
    expect(context.memory.outbox.get('o1')).toMatchObject({
      status: 'PENDING',
      attempts: 1,
      nextAttemptAt: new Date(START.getTime() + 60_000),
    });

    expect(context.memory.authorizations.get(AUTH_ID)?.status).toBe('AUTHORIZED');

    context.memory.addOutboxTask(
      { id: 'o2', kind: 'otra-cosa', payload: '{}', attempts: 0 },
      START,
    );
    context.memory.addOutboxTask(
      {
        id: 'o3',
        kind: RELEASE_AUTHORIZATION_TASK,
        payload: '{"authorizationId":"x"}',
        attempts: 0,
      },
      START,
    );
    const second = await context.reconcile();
    expect(second.outboxFailed).toBe(2);
    expect(context.memory.outbox.get('o2')?.status).toBe('FAILED');
    expect(context.memory.outbox.get('o3')?.status).toBe('FAILED');

    // Llegado su turno, se reintenta (con la clave siguiente) y la retención se libera.
    context.at(new Date(START.getTime() + 60_000));
    expect(await context.reconcile()).toMatchObject({ outboxDone: 1 });
    expect(context.memory.outbox.get('o1')?.status).toBe('DONE');
    expect(context.memory.authorizations.get(AUTH_ID)?.status).toBe('VOIDED');
  });

  it('outbox: tras el máximo de intentos, la tarea se abandona y se informa', async () => {
    const context = setup();
    context.memory.addAuthorization(authorizationOf('sim_desconocida', null));
    context.memory.addOutboxTask(
      {
        id: 'o1',
        kind: RELEASE_AUTHORIZATION_TASK,
        payload: JSON.stringify({ authorizationId: AUTH_ID }),
        attempts: RECONCILE_LIMITS.outboxMaxAttempts - 1,
      },
      START,
    );
    expect(await context.reconcile()).toMatchObject({ outboxFailed: 1, outboxRetried: 0 });
    expect(context.memory.outbox.get('o1')?.status).toBe('FAILED');
    expect(context.log.error).toHaveBeenCalledWith(expect.stringMatching(/abandonada/), {
      outboxId: 'o1',
      kind: RELEASE_AUTHORIZATION_TASK,
      reason: 'unknown_payment',
    });
  });

  it('outbox: una autorización ya liberada o capturada se da por hecha', async () => {
    const context = setup();
    const hold = await context.hold('quote_1');
    context.memory.addAuthorization({
      ...authorizationOf(hold.paymentRef, null),
      status: 'CAPTURED',
    });
    context.memory.addOutboxTask(
      {
        id: 'o1',
        kind: RELEASE_AUTHORIZATION_TASK,
        payload: JSON.stringify({ authorizationId: AUTH_ID }),
        attempts: 0,
      },
      START,
    );
    expect(await context.reconcile()).toMatchObject({ outboxDone: 1 });
    expect(context.memory.outbox.get('o1')?.status).toBe('DONE');
  });

  it('las operaciones con demasiados intentos se informan y no se repiten', async () => {
    const context = setup();
    const { operation } = await context.memory.ledger.begin({
      tenantId: TENANT,
      branchId: BRANCH,
      kind: 'VOID',
      idempotencyKey: 'void_x',
      currency: 'COP',
      amountMinor: '1',
      providerRef: 'sim_x',
      authorizationId: AUTH_ID,
    });
    const stored = context.memory.operations.get(operation.id);
    if (stored) stored.attempts = RECONCILE_LIMITS.maxAttempts;
    context.at(LATER);
    const spy = vi.spyOn(context.gateway, 'voidAuthorization');
    expect(await context.reconcile()).toMatchObject({ stuck: 1 });
    expect(spy).not.toHaveBeenCalled();
    expect(context.log.error).toHaveBeenCalledWith(expect.stringMatching(/máximo de intentos/), {
      operationId: operation.id,
      kind: 'VOID',
      tenantId: TENANT,
    });
  });

  it('la espera del outbox crece y se limita a una hora', () => {
    expect(outboxBackoffMs(0)).toBe(60_000);
    expect(outboxBackoffMs(3)).toBe(8 * 60_000);
    expect(outboxBackoffMs(20)).toBe(RECONCILE_LIMITS.outboxMaxBackoffMs);
  });
});
