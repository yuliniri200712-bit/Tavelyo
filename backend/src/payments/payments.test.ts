import { PaymentTimeoutError, PREAUTHORIZATION_CONSENT_VERSION } from '@tavelyo/contracts';
import { describe, expect, it, vi } from 'vitest';
import type { Actor } from '../shared/outcome.ts';
import type { DispatchResult } from '../orders/send-to-kitchen.ts';
import {
  createAuthorizeQuote,
  NOT_SENT,
  parseAuthorizeQuoteInput,
  type PayableQuote,
  type PaymentQuoteStore,
} from './authorize-quote.ts';
import {
  assertSimulatedPaymentsAllowed,
  configuredProjectId,
  createSimulatedPaymentGateway,
  SimulatedPaymentsNotAllowedError,
} from './simulated-gateway.ts';
import { createMemoryLedger } from './memory-ledger.test-support.ts';

const actor: Actor = {
  uid: 'cliente-anonimo',
  claims: { sub: 'cliente-anonimo' },
  authTimeSeconds: 1,
};
const QUOTE = '9'.repeat(32);
const NOW = new Date('2026-11-13T18:00:00Z');
const ORDER = '5'.repeat(32);
const quote: PayableQuote = {
  id: QUOTE,
  tenantId: '7'.repeat(32),
  branchId: '6'.repeat(32),
  sessionId: '4'.repeat(32),
  participantId: '3'.repeat(32),
  status: 'QUOTED',
  currency: 'COP',
  totalMinor: '6480000',
  expiresAt: new Date('2026-11-13T18:15:00Z'),
  sessionOpen: true,
  participantRemoved: false,
  participantExpiresAt: new Date('2026-11-13T22:00:00Z'),
  lines: [],
};
const CONSENT = { consentTextVersion: PREAUTHORIZATION_CONSENT_VERSION };

describe('adaptador de pago simulado', () => {
  it('se niega a crearse fuera de un proyecto demo-*', () => {
    for (const projectId of ['tavelyo-e2b57', 'demo', 'DEMO-x', 'mi-demo-tavelyo', '', undefined]) {
      expect(() => createSimulatedPaymentGateway(projectId)).toThrow(
        SimulatedPaymentsNotAllowedError,
      );
    }
    expect(() => assertSimulatedPaymentsAllowed('demo-tavelyo')).not.toThrow();
  });

  it('lee el proyecto de Cloud Functions o de FIREBASE_CONFIG', () => {
    expect(configuredProjectId({ GCLOUD_PROJECT: 'tavelyo-e2b57' })).toBe('tavelyo-e2b57');
    expect(configuredProjectId({ FIREBASE_CONFIG: '{"projectId":"demo-tavelyo"}' })).toBe(
      'demo-tavelyo',
    );
    expect(configuredProjectId({ FIREBASE_CONFIG: 'no es json' })).toBeUndefined();
    expect(configuredProjectId({})).toBeUndefined();
  });

  it('rotula cada resultado como simulado y es idempotente por clave', async () => {
    const gateway = createSimulatedPaymentGateway('demo-tavelyo');
    const request = {
      amount: { amountMinor: '100', currency: 'COP' },
      idempotencyKey: 'k1',
      reference: 'q1',
    };
    const first = await gateway.authorize(request);
    expect(first).toMatchObject({
      status: 'authorized',
      simulated: true,
      paymentRef: expect.stringMatching(/^sim_/),
    });
    expect(await gateway.authorize({ ...request, simulatedOutcome: 'declined' })).toEqual(first);
    expect(gateway.simulated).toBe(true);
  });

  it('separa autorizar, capturar, anular y reembolsar', async () => {
    const gateway = createSimulatedPaymentGateway('demo-tavelyo');
    const amount = { amountMinor: '100', currency: 'COP' };
    const auth = await gateway.authorize({ amount, idempotencyKey: 'k2', reference: 'q2' });
    const paymentRef = auth.paymentRef;
    expect(await gateway.refund({ paymentRef, amount, idempotencyKey: 'r0' })).toMatchObject({
      status: 'failed',
      failureCode: 'invalid_state',
    });
    expect((await gateway.capture({ paymentRef, amount, idempotencyKey: 'c1' })).status).toBe(
      'captured',
    );
    expect((await gateway.status('k2'))?.status).toBe('captured');
    expect((await gateway.refund({ paymentRef, amount, idempotencyKey: 'r1' })).status).toBe(
      'refunded',
    );
    const other = await gateway.authorize({ amount, idempotencyKey: 'k3', reference: 'q3' });
    expect(
      (await gateway.voidAuthorization({ paymentRef: other.paymentRef, idempotencyKey: 'v1' }))
        .status,
    ).toBe('voided');
  });

  it('tiempo agotado: la respuesta se pierde, pero la consulta encuentra la autorización', async () => {
    const gateway = createSimulatedPaymentGateway('demo-tavelyo');
    const request = {
      amount: { amountMinor: '100', currency: 'COP' },
      idempotencyKey: 'k4',
      reference: 'q4',
      simulatedOutcome: 'timeout' as const,
    };
    await expect(gateway.authorize(request)).rejects.toBeInstanceOf(PaymentTimeoutError);
    expect((await gateway.status('k4'))?.status).toBe('authorized');
  });
});

function setup(
  found: PayableQuote | null,
  dispatched: DispatchResult = { kind: 'sent', orderId: ORDER },
) {
  const quotes = {
    forPayment: vi.fn(async () => found),
    setAuthorized: vi.fn(async () => true),
    setDeclined: vi.fn(async () => true),
    markReleasePending: vi.fn(async () => undefined),
  } satisfies PaymentQuoteStore;
  const payments = createSimulatedPaymentGateway('demo-tavelyo', { now: () => NOW });
  const memory = createMemoryLedger(() => NOW);
  const dispatch = vi.fn(async () => dispatched);
  const authorize = createAuthorizeQuote({
    quotes,
    payments,
    ledger: memory.ledger,
    dispatch,
    limiter: { admit: async () => true },
    clock: { now: () => NOW },
  });
  return { quotes, payments, memory, dispatch, authorize };
}

const request = (extra: Record<string, unknown> = {}) => ({
  quoteId: QUOTE,
  ...CONSENT,
  ...extra,
});

describe('authorizeQuote', () => {
  it('exige la versión vigente del texto y solo admite el resultado forzado en simulado', async () => {
    expect(parseAuthorizeQuoteInput(request({ simulatedOutcome: 'declined' }), true).ok).toBe(true);
    expect(parseAuthorizeQuoteInput(request({ simulatedOutcome: 'declined' }), false).ok).toBe(
      false,
    );
    expect(parseAuthorizeQuoteInput(request({ simulatedOutcome: 'lo-que-sea' }), true).ok).toBe(
      false,
    );
    expect(parseAuthorizeQuoteInput(request({ amountMinor: '1' }), true).ok).toBe(false);
    expect(parseAuthorizeQuoteInput({ quoteId: QUOTE }, true).ok).toBe(false);

    const old = setup(quote);
    expect(await old.authorize(actor, request({ consentTextVersion: '2020-01-01' }))).toMatchObject(
      {
        ok: false,
        error: {
          code: 'failed-precondition',
          message: expect.stringMatching(/texto de la autorización cambió/),
        },
      },
    );
    expect(old.quotes.forPayment).not.toHaveBeenCalled();
  });

  it('autoriza el importe del resumen, guarda el consentimiento y envía el pedido a cocina', async () => {
    const { authorize, quotes, payments, memory, dispatch } = setup(quote);
    const spy = vi.spyOn(payments, 'authorize');
    expect(await authorize(actor, request())).toEqual({
      ok: true,
      value: { quoteId: QUOTE, status: 'authorized', orderId: ORDER, simulated: true },
    });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ amount: { amountMinor: '6480000', currency: 'COP' } }),
    );
    // La operación se guardó ANTES de llamar a la pasarela, con la misma clave (PM §8).
    const [operation] = [...memory.operations.values()];
    expect(operation).toMatchObject({
      kind: 'AUTHORIZE',
      idempotencyKey: `quote_${QUOTE}`,
      amountMinor: '6480000',
      quoteId: QUOTE,
    });
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ idempotencyKey: `quote_${QUOTE}` }));
    expect(quotes.setAuthorized).toHaveBeenCalledWith(
      quote,
      operation?.id,
      actor.uid,
      {
        provider: 'simulated',
        paymentRef: expect.stringMatching(/^sim_/),
        // Vigencia de la autorización simulada: 7 días desde ahora.
        expiresAt: new Date('2026-11-20T18:00:00Z'),
      },
      PREAUTHORIZATION_CONSENT_VERSION,
    );
    expect(dispatch).toHaveBeenCalledWith(quote, actor.uid);
  });

  it('sin respuesta ni rastro en la pasarela: la operación queda UNKNOWN y no se cobra dos veces', async () => {
    const lost = setup(quote);
    vi.spyOn(lost.payments, 'authorize').mockRejectedValueOnce(
      new PaymentTimeoutError(`quote_${QUOTE}`),
    );
    expect(await lost.authorize(actor, request())).toMatchObject({
      ok: false,
      error: { code: 'unavailable', message: expect.stringMatching(/no se cobrará dos veces/) },
    });
    expect([...lost.memory.operations.values()][0]?.status).toBe('UNKNOWN');
    expect(lost.quotes.setAuthorized).not.toHaveBeenCalled();

    // El reintento del cliente usa la misma operación y la misma clave.
    expect(await lost.authorize(actor, request())).toMatchObject({
      ok: true,
      value: { status: 'authorized' },
    });
    expect(lost.memory.operations.size).toBe(1);
    expect([...lost.memory.operations.values()][0]?.attempts).toBe(1);
  });

  it('si la conciliación ya cerró la operación (resumen vencido), no vuelve a autorizar', async () => {
    const closed = setup(quote);
    const { operation } = await closed.memory.ledger.begin({
      tenantId: quote.tenantId,
      branchId: quote.branchId,
      kind: 'AUTHORIZE',
      idempotencyKey: `quote_${QUOTE}`,
      currency: 'COP',
      amountMinor: quote.totalMinor,
      providerRef: null,
      quoteId: QUOTE,
    });
    await closed.memory.ledger.fail(operation, 'not_found');
    const spy = vi.spyOn(closed.payments, 'authorize');
    expect(await closed.authorize(actor, request())).toMatchObject({
      ok: false,
      error: { code: 'failed-precondition' },
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('rechazado o con acción pendiente no llega a cocina (D-04)', async () => {
    const declined = setup(quote);
    expect(
      await declined.authorize(actor, request({ simulatedOutcome: 'declined' })),
    ).toMatchObject({ ok: true, value: { status: 'declined' } });
    expect(declined.quotes.setDeclined).toHaveBeenCalledWith(
      quote,
      expect.any(String),
      actor.uid,
      expect.any(String),
      PREAUTHORIZATION_CONSENT_VERSION,
    );
    expect(declined.dispatch).not.toHaveBeenCalled();

    const action = setup(quote);
    expect(
      await action.authorize(actor, request({ simulatedOutcome: 'requires_action' })),
    ).toMatchObject({ ok: true, value: { status: 'requires_action' } });
    expect(action.quotes.setAuthorized).not.toHaveBeenCalled();
    expect(action.quotes.setDeclined).not.toHaveBeenCalled();
    expect(action.dispatch).not.toHaveBeenCalled();

    // La respuesta se pierde, pero la consulta posterior encuentra la autorización: sin cobro doble.
    const timeout = setup(quote);
    expect(await timeout.authorize(actor, request({ simulatedOutcome: 'timeout' }))).toMatchObject({
      ok: true,
      value: { status: 'authorized', orderId: ORDER },
    });
  });

  it('un resumen ya autorizado (reintento o caída antes del envío) termina el envío sin volver a cobrar', async () => {
    const done = setup({ ...quote, status: 'AUTHORIZED' });
    const spy = vi.spyOn(done.payments, 'authorize');
    expect(await done.authorize(actor, request())).toMatchObject({
      ok: true,
      value: { status: 'authorized', orderId: ORDER },
    });
    expect(spy).not.toHaveBeenCalled();
    expect(done.dispatch).toHaveBeenCalledOnce();
  });

  it('si la mesa se cerró o la persona ya no está, no se envía y la retención queda para liberar', async () => {
    const closed = setup({ ...quote, status: 'AUTHORIZED', sessionOpen: false });
    expect(await closed.authorize(actor, request())).toEqual({
      ok: false,
      error: { code: 'failed-precondition', message: NOT_SENT },
    });
    expect(closed.dispatch).not.toHaveBeenCalled();
    expect(closed.quotes.markReleasePending).toHaveBeenCalledOnce();

    // El servidor rechazó el envío aunque al autorizar la persona seguía en la mesa.
    const raced = setup(quote, { kind: 'rejected' });
    expect(await raced.authorize(actor, request())).toMatchObject({
      ok: false,
      error: { message: NOT_SENT },
    });
    expect(raced.quotes.markReleasePending).toHaveBeenCalledOnce();

    const pending = setup({ ...quote, status: 'RELEASE_PENDING' });
    expect(await pending.authorize(actor, request())).toMatchObject({
      ok: false,
      error: { message: NOT_SENT },
    });
    expect(pending.dispatch).not.toHaveBeenCalled();
  });

  it('no autoriza resúmenes ajenos, vencidos, rechazados ni de una mesa ya cerrada', async () => {
    expect(await setup(null).authorize(actor, request())).toMatchObject({
      ok: false,
      error: { code: 'not-found' },
    });
    const expired = { ...quote, expiresAt: new Date('2026-11-13T17:59:00Z') };
    expect(await setup(expired).authorize(actor, request())).toMatchObject({
      ok: false,
      error: { code: 'failed-precondition' },
    });
    expect(await setup({ ...quote, status: 'DECLINED' }).authorize(actor, request())).toMatchObject(
      { ok: false, error: { code: 'failed-precondition' } },
    );
    for (const gone of [
      { ...quote, sessionOpen: false },
      { ...quote, participantRemoved: true },
      { ...quote, participantExpiresAt: new Date('2026-11-13T17:00:00Z') },
    ]) {
      const result = setup(gone);
      const spy = vi.spyOn(result.payments, 'authorize');
      expect(await result.authorize(actor, request())).toMatchObject({
        ok: false,
        error: { code: 'not-found' },
      });
      expect(spy).not.toHaveBeenCalled();
    }
  });
});
