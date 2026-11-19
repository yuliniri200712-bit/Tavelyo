import { PaymentKeyConflictError } from '@tavelyo/contracts';
import { describe, expect, it, vi } from 'vitest';
import type { AuthorizationRecord } from './ledger.ts';
import { createMemoryLedger } from './memory-ledger.test-support.ts';
import { createPaymentProcessor } from './payment-processor.ts';
import {
  createSimulatedPaymentGateway,
  SIMULATED_SIGNATURE_HEADER,
  type SimulatedGatewayOptions,
} from './simulated-gateway.ts';

const NOW = new Date('2026-11-18T20:00:00Z');
const TENANT = '7'.repeat(32);
const BRANCH = '6'.repeat(32);
const AUTH_ID = 'a'.repeat(32);
const PAYMENT_ID = 'b'.repeat(32);
const REFUND_ID = 'c'.repeat(32);
const CASHIER = 'cajero-uid';

async function setup(options: SimulatedGatewayOptions = {}, amountMinor = '6400000') {
  const gateway = createSimulatedPaymentGateway('demo-tavelyo', { now: () => NOW, ...options });
  const memory = createMemoryLedger(() => NOW);
  const processor = createPaymentProcessor({ gateway, ledger: memory.ledger, now: () => NOW });
  const hold = await gateway.authorize({
    amount: { amountMinor, currency: 'COP' },
    idempotencyKey: 'quote_1',
    reference: 'quote_1',
  });
  const authorization: AuthorizationRecord = {
    id: AUTH_ID,
    tenantId: TENANT,
    branchId: BRANCH,
    provider: 'simulated',
    providerRef: hold.paymentRef,
    currency: 'COP',
    authorizedMinor: amountMinor,
    capturedMinor: '0',
    status: 'AUTHORIZED',
    expiresAt: hold.expiresAt ? new Date(hold.expiresAt) : null,
  };
  memory.addAuthorization(authorization);
  gateway.controls.takeWebhooks();
  const capture = (amount: string, paymentId = PAYMENT_ID) =>
    processor.capture({ authorization, paymentId, amountMinor: amount, actorId: CASHIER });
  return { gateway, memory, processor, authorization, capture };
}

const header = (signature: string) => (name: string) =>
  name === SIMULATED_SIGNATURE_HEADER ? signature : undefined;

describe('captura (PM §8)', () => {
  it('guarda la operación antes de llamar, captura lo consumido y confirma el pago', async () => {
    const { gateway, memory, capture, authorization } = await setup();
    const spy = vi.spyOn(gateway, 'capture');
    expect(await capture('3200000')).toEqual({ kind: 'succeeded' });
    expect(spy).toHaveBeenCalledWith({
      paymentRef: authorization.providerRef,
      amount: { amountMinor: '3200000', currency: 'COP' },
      idempotencyKey: `capture_${PAYMENT_ID}`,
    });
    expect(memory.operations.size).toBe(1);
    expect([...memory.operations.values()][0]).toMatchObject({
      kind: 'CAPTURE',
      status: 'SUCCEEDED',
      authorizationId: AUTH_ID,
      paymentId: PAYMENT_ID,
    });
    expect(memory.authorizations.get(AUTH_ID)).toMatchObject({
      status: 'CAPTURED',
      capturedMinor: '3200000',
    });
    expect(memory.payments.get(PAYMENT_ID)?.status).toBe('CONFIRMED');
  });

  it('doble pulsación o reintento: una sola captura (caso 3)', async () => {
    const { gateway, memory, capture } = await setup();
    const spy = vi.spyOn(gateway, 'capture');
    const results = await Promise.all([capture('3200000'), capture('3200000')]);
    expect(results.every((result) => result.kind === 'succeeded')).toBe(true);
    expect(await capture('3200000')).toEqual({ kind: 'succeeded' });
    expect(memory.effects.filter((effect) => effect.startsWith('capture:'))).toHaveLength(1);
    // La tercera ya encontró la operación cerrada y no llamó a la pasarela.
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('la misma clave con otro importe se rechaza: no es el mismo cobro', async () => {
    const { capture } = await setup();
    await capture('3200000');
    await expect(capture('3300000')).rejects.toBeInstanceOf(PaymentKeyConflictError);
  });

  it('nunca captura más de lo autorizado ni de una autorización usada o vencida', async () => {
    const { memory, processor, authorization, capture } = await setup();
    expect(await capture('6400001')).toEqual({ kind: 'failed', code: 'exceeds-authorization' });
    expect(await capture('0')).toEqual({ kind: 'failed', code: 'invalid-amount' });
    expect(
      await processor.capture({
        authorization: { ...authorization, status: 'VOIDED' },
        paymentId: PAYMENT_ID,
        amountMinor: '100',
        actorId: CASHIER,
      }),
    ).toEqual({ kind: 'failed', code: 'not-authorized' });
    const lapsed = { ...authorization, expiresAt: new Date(NOW.getTime() - 1) };
    expect(
      await processor.capture({
        authorization: lapsed,
        paymentId: PAYMENT_ID,
        amountMinor: '100',
        actorId: CASHIER,
      }),
    ).toEqual({ kind: 'expired' });
    expect(memory.authorizations.get(AUTH_ID)?.status).toBe('EXPIRED');
    // Ninguno de estos intentos llegó a guardar una operación ni a llamar a la pasarela.
    expect(memory.operations.size).toBe(0);
  });

  it('sin captura parcial en la pasarela, no la intenta', async () => {
    const { memory, capture } = await setup({ capabilities: { partialCapture: false } });
    expect(await capture('3200000')).toEqual({
      kind: 'failed',
      code: 'partial-capture-unsupported',
    });
    expect(memory.operations.size).toBe(0);
  });

  it('rechazada por la pasarela: el pago queda FAILED y la retención sigue vigente', async () => {
    const { gateway, memory, capture } = await setup();
    gateway.controls.failNext('capture', 'fail');
    expect(await capture('3200000')).toEqual({ kind: 'failed', code: 'sim_capture_failed' });
    expect(memory.payments.get(PAYMENT_ID)?.status).toBe('FAILED');
    expect(memory.authorizations.get(AUTH_ID)?.status).toBe('AUTHORIZED');
  });

  it('vencida en la pasarela: el pago falla y la autorización queda EXPIRED', async () => {
    const { gateway, memory, capture, authorization } = await setup();
    gateway.controls.expire(authorization.providerRef);
    expect(await capture('3200000')).toEqual({ kind: 'expired' });
    expect(memory.authorizations.get(AUTH_ID)?.status).toBe('EXPIRED');
    expect([...memory.operations.values()][0]?.failureCode).toBe('expired');
  });
});

describe('tiempo agotado y resolución (caso 7)', () => {
  it('respuesta perdida pero hecha: la consulta con la misma clave la confirma', async () => {
    const { gateway, memory, capture } = await setup();
    gateway.controls.failNext('capture', 'timeout-applied');
    expect(await capture('3200000')).toEqual({ kind: 'succeeded' });
    expect(memory.payments.get(PAYMENT_ID)?.status).toBe('CONFIRMED');
  });

  it('sin rastro en la pasarela: queda UNKNOWN y la resolución repite la MISMA operación', async () => {
    const { gateway, memory, processor, capture } = await setup();
    gateway.controls.failNext('capture', 'timeout-lost');
    expect(await capture('3200000')).toEqual({ kind: 'unknown' });
    const [operation] = [...memory.operations.values()];
    if (!operation) throw new Error('sin operación');
    expect(operation.status).toBe('UNKNOWN');
    expect(memory.payments.has(PAYMENT_ID)).toBe(false);

    const spy = vi.spyOn(gateway, 'capture');
    expect(await processor.resolve({ ...operation })).toEqual({ kind: 'succeeded' });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ idempotencyKey: `capture_${PAYMENT_ID}` }),
    );
    expect(memory.operations.get(operation.id)).toMatchObject({ status: 'SUCCEEDED', attempts: 2 });
    expect(memory.effects.filter((effect) => effect.startsWith('capture:'))).toHaveLength(1);
  });

  it('un error inesperado deja la operación UNKNOWN para la conciliación', async () => {
    const { gateway, memory, capture } = await setup();
    vi.spyOn(gateway, 'capture').mockRejectedValueOnce(new Error('ECONNRESET'));
    await expect(capture('3200000')).rejects.toThrow('ECONNRESET');
    expect([...memory.operations.values()][0]?.status).toBe('UNKNOWN');
  });

  it('una operación cerrada no se resuelve otra vez', async () => {
    const { gateway, memory, processor, capture } = await setup();
    await capture('3200000');
    const spy = vi.spyOn(gateway, 'status');
    const [operation] = [...memory.operations.values()];
    if (!operation) throw new Error('sin operación');
    expect(await processor.resolve({ ...operation })).toEqual({ kind: 'succeeded' });
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('liberación', () => {
  it('libera una vez por autorización, con una clave fija', async () => {
    const { gateway, memory, processor, authorization } = await setup();
    const spy = vi.spyOn(gateway, 'voidAuthorization');
    expect(await processor.release(authorization, CASHIER)).toEqual({ kind: 'succeeded' });
    expect(await processor.release(authorization, CASHIER)).toEqual({ kind: 'succeeded' });
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith({
      paymentRef: authorization.providerRef,
      idempotencyKey: `void_${AUTH_ID}`,
    });
    expect(memory.authorizations.get(AUTH_ID)?.status).toBe('VOIDED');
    expect(await processor.release({ ...authorization, status: 'VOIDED' }, CASHIER)).toEqual({
      kind: 'succeeded',
    });
    expect(await processor.release({ ...authorization, status: 'CAPTURED' }, CASHIER)).toEqual({
      kind: 'failed',
      code: 'not-authorized',
    });
  });

  it('vencida en la pasarela: no hay nada que liberar y queda EXPIRED', async () => {
    const { gateway, memory, processor, authorization } = await setup();
    gateway.controls.expire(authorization.providerRef);
    expect(await processor.release(authorization, CASHIER)).toEqual({ kind: 'expired' });
    expect(memory.authorizations.get(AUTH_ID)?.status).toBe('EXPIRED');
  });

  it('rechazada: la retención sigue y se reintenta con la clave siguiente', async () => {
    const { gateway, memory, processor, authorization } = await setup();
    gateway.controls.failNext('void', 'fail');
    expect(await processor.release(authorization, CASHIER)).toEqual({
      kind: 'failed',
      code: 'sim_void_failed',
    });
    expect(memory.authorizations.get(AUTH_ID)?.status).toBe('AUTHORIZED');
    const spy = vi.spyOn(gateway, 'voidAuthorization');
    expect(await processor.release(authorization, CASHIER)).toEqual({ kind: 'succeeded' });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ idempotencyKey: `void_${AUTH_ID}_2` }),
    );
    expect(memory.authorizations.get(AUTH_ID)?.status).toBe('VOIDED');
  });

  it('sin respuesta, se repite la misma clave; tras cinco rechazos, se deja de intentar', async () => {
    const { gateway, memory, processor, authorization } = await setup();
    gateway.controls.failNext('void', 'timeout-lost');
    expect(await processor.release(authorization, CASHIER)).toEqual({ kind: 'unknown' });
    const spy = vi.spyOn(gateway, 'voidAuthorization');
    for (let index = 0; index < 5; index += 1) gateway.controls.failNext('void', 'fail');
    for (let index = 0; index < 5; index += 1) await processor.release(authorization, CASHIER);
    expect(spy.mock.calls.map(([request]) => request.idempotencyKey)).toEqual([
      `void_${AUTH_ID}`,
      `void_${AUTH_ID}_2`,
      `void_${AUTH_ID}_3`,
      `void_${AUTH_ID}_4`,
      `void_${AUTH_ID}_5`,
    ]);
    expect(await processor.release(authorization, CASHIER)).toEqual({
      kind: 'failed',
      code: 'release-attempts-exhausted',
    });
    expect(memory.authorizations.get(AUTH_ID)?.status).toBe('AUTHORIZED');
  });
});

describe('reembolso (caso 10)', () => {
  async function capturedSetup() {
    const context = await setup();
    await context.capture('5000000');
    context.gateway.controls.takeWebhooks();
    const refund = (amountMinor: string, refundId = REFUND_ID) =>
      context.processor.refund({
        tenantId: TENANT,
        branchId: BRANCH,
        refundId,
        paymentId: PAYMENT_ID,
        paymentRef: context.authorization.providerRef,
        currency: 'COP',
        amountMinor,
        actorId: CASHIER,
      });
    return { ...context, refund };
  }

  it('confirmado por la pasarela: solo entonces queda CONFIRMED', async () => {
    const { memory, refund } = await capturedSetup();
    expect(await refund('2000000')).toEqual({ kind: 'succeeded' });
    expect(memory.refunds.get(REFUND_ID)).toEqual({
      status: 'CONFIRMED',
      providerRef: expect.stringMatching(/^sim_rf_/),
    });
  });

  it('en curso: queda PROCESSING hasta el aviso o la consulta', async () => {
    const { gateway, memory, processor, refund } = await capturedSetup();
    gateway.controls.failNext('refund', 'pending');
    expect(await refund('2000000')).toEqual({ kind: 'pending' });
    const [, operation] = [...memory.operations.values()];
    if (!operation) throw new Error('sin operación');
    expect(operation.status).toBe('PROCESSING');
    expect(memory.refunds.get(REFUND_ID)?.status).toBe('PROCESSING');
    // La conciliación consulta y sigue en curso; cuando la pasarela confirma, se cierra.
    expect(await processor.resolve({ ...operation })).toEqual({ kind: 'pending' });
    const refundRef = memory.refunds.get(REFUND_ID)?.providerRef ?? '';
    gateway.controls.settleRefund(refundRef, 'refunded');
    expect(await processor.resolve({ ...operation })).toEqual({ kind: 'succeeded' });
    expect(memory.refunds.get(REFUND_ID)?.status).toBe('CONFIRMED');
  });

  it('rechazado por la pasarela: REJECTED', async () => {
    const { memory, refund } = await capturedSetup();
    expect(await refund('5000001')).toEqual({
      kind: 'failed',
      code: 'amount_exceeds_refundable',
    });
    expect(memory.refunds.get(REFUND_ID)?.status).toBe('REJECTED');
  });
});

describe('avisos de la pasarela (caso 8)', () => {
  it('confirma un reembolso en curso; repetido, tardío o fuera de orden no lo retrocede', async () => {
    const { gateway, memory, processor, capture, authorization } = await setup();
    await capture('5000000');
    gateway.controls.takeWebhooks();
    gateway.controls.failNext('refund', 'pending');
    await processor.refund({
      tenantId: TENANT,
      branchId: BRANCH,
      refundId: REFUND_ID,
      paymentId: PAYMENT_ID,
      paymentRef: authorization.providerRef,
      currency: 'COP',
      amountMinor: '1000000',
      actorId: CASHIER,
    });
    const refundRef = memory.refunds.get(REFUND_ID)?.providerRef ?? '';
    gateway.controls.settleRefund(refundRef, 'refunded');
    const [pendingNotice, doneNotice] = gateway.controls.takeWebhooks().map((webhook) => {
      const verified = gateway.verifyWebhook(webhook.body, header(webhook.signature), NOW);
      if (!verified.ok) throw new Error(verified.reason);
      return verified.notice;
    });
    if (!pendingNotice || !doneNotice) throw new Error('faltan avisos');

    expect(await processor.applyNotice(doneNotice)).toEqual({
      outcome: 'applied',
      tenantId: TENANT,
    });
    expect(memory.refunds.get(REFUND_ID)?.status).toBe('CONFIRMED');
    // El «en curso» llega después (desordenado) y el confirmado se repite: no cambian nada.
    expect((await processor.applyNotice(pendingNotice)).outcome).toBe('ignored');
    expect((await processor.applyNotice(doneNotice)).outcome).toBe('ignored');
    expect(memory.refunds.get(REFUND_ID)?.status).toBe('CONFIRMED');
    expect(memory.effects.filter((effect) => effect.startsWith('refund:'))).toHaveLength(1);
  });

  it('un aviso con otro importe, moneda o referencia no se aplica', async () => {
    const { gateway, memory, processor, capture, authorization } = await setup();
    gateway.controls.failNext('capture', 'timeout-lost');
    expect((await capture('3200000')).kind).toBe('unknown');
    const base = {
      eventId: 'evt_x',
      type: 'capture.succeeded',
      operationKey: `capture_${PAYMENT_ID}`,
      paymentRef: authorization.providerRef,
      status: 'captured' as const,
      amount: { amountMinor: '3200000', currency: 'COP' },
      occurredAt: NOW.toISOString(),
    };
    for (const notice of [
      { ...base, amount: { amountMinor: '6400000', currency: 'COP' } },
      { ...base, amount: { amountMinor: '3200000', currency: 'USD' } },
      { ...base, paymentRef: 'sim_ajena' },
    ]) {
      expect((await processor.applyNotice(notice)).outcome).toBe('mismatch');
    }
    expect(memory.payments.has(PAYMENT_ID)).toBe(false);
    // El aviso correcto sí cierra la operación desconocida.
    expect((await processor.applyNotice(base)).outcome).toBe('applied');
    expect(memory.payments.get(PAYMENT_ID)?.status).toBe('CONFIRMED');
  });

  it('un estado que no corresponde a la operación se ignora sin tocarla', async () => {
    const { gateway, memory, processor, capture, authorization } = await setup();
    gateway.controls.failNext('capture', 'timeout-lost');
    await capture('3200000');
    const notice = {
      eventId: 'evt_y',
      type: 'refund.succeeded',
      operationKey: `capture_${PAYMENT_ID}`,
      paymentRef: authorization.providerRef,
      status: 'refunded' as const,
      amount: { amountMinor: '3200000', currency: 'COP' },
      occurredAt: NOW.toISOString(),
    };
    expect((await processor.applyNotice(notice)).outcome).toBe('ignored');
    expect([...memory.operations.values()][0]?.status).toBe('UNKNOWN');
  });

  it('vencimiento de una autorización por su referencia; sin relación, unmatched', async () => {
    const { gateway, memory, processor, authorization } = await setup();
    gateway.controls.expire(authorization.providerRef);
    const [webhook] = gateway.controls.takeWebhooks();
    if (!webhook) throw new Error('sin aviso');
    const verified = gateway.verifyWebhook(webhook.body, header(webhook.signature), NOW);
    if (!verified.ok) throw new Error(verified.reason);
    // La operación AUTHORIZE de esta prueba no está en el libro: se busca por la referencia.
    expect(await processor.applyNotice(verified.notice)).toEqual({
      outcome: 'applied',
      tenantId: null,
    });
    expect(memory.authorizations.get(AUTH_ID)?.status).toBe('EXPIRED');
    expect(
      (await processor.applyNotice({ ...verified.notice, operationKey: 'otra', paymentRef: 'x' }))
        .outcome,
    ).toBe('unmatched');
  });
});
