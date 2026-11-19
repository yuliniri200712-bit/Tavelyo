import { PaymentKeyConflictError, PaymentTimeoutError } from '@tavelyo/contracts';
import { describe, expect, it } from 'vitest';
import {
  createSimulatedPaymentGateway,
  SIMULATED_SIGNATURE_HEADER,
  type SimulatedGatewayOptions,
} from './simulated-gateway.ts';

const START = new Date('2026-11-18T20:00:00Z');
const cop = (amountMinor: string) => ({ amountMinor, currency: 'COP' });

function gatewayAt(options: SimulatedGatewayOptions = {}) {
  let now = START;
  const gateway = createSimulatedPaymentGateway('demo-tavelyo', {
    now: () => now,
    webhookSecret: 'secreto-de-prueba',
    ...options,
  });
  return {
    gateway,
    advance(ms: number) {
      now = new Date(now.getTime() + ms);
    },
    async hold(amountMinor = '6400000', key = 'quote_1') {
      const result = await gateway.authorize({
        amount: cop(amountMinor),
        idempotencyKey: key,
        reference: key,
      });
      return result.paymentRef;
    },
  };
}

describe('adaptador simulado: captura y liberación', () => {
  it('captura menos de lo autorizado y libera el resto (captura parcial declarada)', async () => {
    const { gateway, hold } = gatewayAt();
    expect(gateway.capabilities).toEqual({
      partialCapture: true,
      incrementalAuthorization: false,
      partialRefund: true,
    });
    const paymentRef = await hold();
    const amount = cop('3200000');
    expect(await gateway.capture({ paymentRef, amount, idempotencyKey: 'c1' })).toMatchObject({
      status: 'captured',
      paymentRef,
    });
    // La misma clave devuelve lo mismo; otra clave ya no captura (la retención se usó).
    expect((await gateway.capture({ paymentRef, amount, idempotencyKey: 'c1' })).status).toBe(
      'captured',
    );
    expect(await gateway.capture({ paymentRef, amount, idempotencyKey: 'c2' })).toMatchObject({
      status: 'failed',
      failureCode: 'invalid_state',
    });
  });

  it('nunca captura más de lo autorizado, ni en otra moneda, ni cero', async () => {
    const { gateway, hold } = gatewayAt();
    const paymentRef = await hold();
    const attempt = (amount: { amountMinor: string; currency: string }, key: string) =>
      gateway.capture({ paymentRef, amount, idempotencyKey: key });
    expect(await attempt(cop('6400001'), 'a')).toMatchObject({
      failureCode: 'amount_exceeds_authorization',
    });
    expect(await attempt({ amountMinor: '100', currency: 'USD' }, 'b')).toMatchObject({
      failureCode: 'currency_mismatch',
    });
    expect(await attempt(cop('0'), 'c')).toMatchObject({ failureCode: 'invalid_amount' });
    expect(
      await gateway.capture({ paymentRef: 'sim_otra', amount: cop('1'), idempotencyKey: 'd' }),
    ).toMatchObject({ failureCode: 'unknown_payment' });
  });

  it('sin captura parcial declarada, solo captura el total', async () => {
    const { gateway, hold } = gatewayAt({ capabilities: { partialCapture: false } });
    const paymentRef = await hold();
    expect(
      await gateway.capture({ paymentRef, amount: cop('100'), idempotencyKey: 'p' }),
    ).toMatchObject({ status: 'failed', failureCode: 'partial_capture_unsupported' });
    expect(
      (await gateway.capture({ paymentRef, amount: cop('6400000'), idempotencyKey: 't' })).status,
    ).toBe('captured');
  });

  it('una autorización vencida no se captura ni se libera (PM §8, paso 9)', async () => {
    const { gateway, hold, advance } = gatewayAt({ authorizationTtlMs: 60_000 });
    const paymentRef = await hold();
    advance(60_000);
    expect((await gateway.status('quote_1'))?.status).toBe('expired');
    expect(
      (await gateway.capture({ paymentRef, amount: cop('100'), idempotencyKey: 'c' })).status,
    ).toBe('expired');
    expect((await gateway.voidAuthorization({ paymentRef, idempotencyKey: 'v' })).status).toBe(
      'expired',
    );
  });

  it('liberar dos veces con claves distintas no falla; liberar lo capturado, sí', async () => {
    const { gateway, hold } = gatewayAt();
    const voided = await hold('100', 'q1');
    expect(
      (await gateway.voidAuthorization({ paymentRef: voided, idempotencyKey: 'v1' })).status,
    ).toBe('voided');
    expect(
      (await gateway.voidAuthorization({ paymentRef: voided, idempotencyKey: 'v2' })).status,
    ).toBe('voided');
    const captured = await hold('100', 'q2');
    await gateway.capture({ paymentRef: captured, amount: cop('100'), idempotencyKey: 'c' });
    expect(
      await gateway.voidAuthorization({ paymentRef: captured, idempotencyKey: 'v3' }),
    ).toMatchObject({ status: 'failed', failureCode: 'invalid_state' });
  });

  it('una clave repetida con otro importe es un error de programación', async () => {
    const { gateway, hold } = gatewayAt();
    const paymentRef = await hold();
    await gateway.capture({ paymentRef, amount: cop('100'), idempotencyKey: 'c' });
    await expect(
      gateway.capture({ paymentRef, amount: cop('200'), idempotencyKey: 'c' }),
    ).rejects.toBeInstanceOf(PaymentKeyConflictError);
  });
});

describe('adaptador simulado: fallos inyectados', () => {
  it('rechazo: se guarda con su clave y se repite igual', async () => {
    const { gateway, hold } = gatewayAt();
    const paymentRef = await hold();
    gateway.controls.failNext('capture', 'fail');
    const request = { paymentRef, amount: cop('100'), idempotencyKey: 'c' };
    expect(await gateway.capture(request)).toMatchObject({
      status: 'failed',
      failureCode: 'sim_capture_failed',
    });
    expect((await gateway.capture(request)).status).toBe('failed');
  });

  it('tiempo agotado con la operación hecha: la consulta la encuentra (caso 7)', async () => {
    const { gateway, hold } = gatewayAt();
    const paymentRef = await hold();
    gateway.controls.failNext('capture', 'timeout-applied');
    const request = { paymentRef, amount: cop('100'), idempotencyKey: 'c' };
    await expect(gateway.capture(request)).rejects.toBeInstanceOf(PaymentTimeoutError);
    expect((await gateway.status('c'))?.status).toBe('captured');
    // Repetir con la misma clave no captura otra vez.
    expect((await gateway.capture(request)).status).toBe('captured');
    expect(gateway.controls.takeWebhooks()).toHaveLength(1);
  });

  it('tiempo agotado sin llegar a la pasarela: la consulta no la conoce y se repite', async () => {
    const { gateway, hold } = gatewayAt();
    const paymentRef = await hold();
    gateway.controls.failNext('void', 'timeout-lost');
    const request = { paymentRef, idempotencyKey: 'v' };
    await expect(gateway.voidAuthorization(request)).rejects.toBeInstanceOf(PaymentTimeoutError);
    expect(await gateway.status('v')).toBeNull();
    expect((await gateway.voidAuthorization(request)).status).toBe('voided');
  });

  it('solo un reembolso puede quedar en curso', () => {
    const { gateway } = gatewayAt();
    expect(() => gateway.controls.failNext('capture', 'pending')).toThrow();
  });
});

describe('adaptador simulado: reembolsos', () => {
  async function captured(amountMinor = '5000000') {
    const context = gatewayAt();
    const paymentRef = await context.hold(amountMinor);
    await context.gateway.capture({ paymentRef, amount: cop(amountMinor), idempotencyKey: 'c' });
    return { ...context, paymentRef };
  }

  it('admite reembolsos parciales sin pasar de lo capturado (caso 10)', async () => {
    const { gateway, paymentRef } = await captured();
    const refund = (amountMinor: string, key: string) =>
      gateway.refund({ paymentRef, amount: cop(amountMinor), idempotencyKey: key });
    expect(await refund('3000000', 'r1')).toMatchObject({
      status: 'refunded',
      paymentRef: expect.stringMatching(/^sim_rf_/),
    });
    expect(await refund('2000001', 'r2')).toMatchObject({
      failureCode: 'amount_exceeds_refundable',
    });
    expect((await refund('2000000', 'r3')).status).toBe('refunded');
  });

  it('en curso: cuenta como usado y se confirma o se rechaza después con un aviso', async () => {
    const { gateway, paymentRef } = await captured();
    gateway.controls.takeWebhooks();
    gateway.controls.failNext('refund', 'pending');
    const pending = await gateway.refund({
      paymentRef,
      amount: cop('5000000'),
      idempotencyKey: 'r',
    });
    expect(pending.status).toBe('refund_pending');
    expect(
      (await gateway.refund({ paymentRef, amount: cop('1'), idempotencyKey: 'r2' })).failureCode,
    ).toBe('amount_exceeds_refundable');
    gateway.controls.settleRefund(pending.paymentRef, 'failed');
    expect((await gateway.status('r'))?.status).toBe('failed');
    // Rechazado, lo reservado vuelve a estar disponible.
    expect(
      (await gateway.refund({ paymentRef, amount: cop('5000000'), idempotencyKey: 'r3' })).status,
    ).toBe('refunded');
    const types = gateway.controls
      .takeWebhooks()
      .map((webhook) => (JSON.parse(webhook.body) as { type: string }).type);
    expect(types).toEqual(['refund.pending', 'refund.failed', 'refund.succeeded']);
  });

  it('sin reembolso parcial declarado, solo devuelve todo', async () => {
    const context = gatewayAt({ capabilities: { partialRefund: false } });
    const paymentRef = await context.hold('100');
    await context.gateway.capture({ paymentRef, amount: cop('100'), idempotencyKey: 'c' });
    expect(
      (await context.gateway.refund({ paymentRef, amount: cop('50'), idempotencyKey: 'r' }))
        .failureCode,
    ).toBe('partial_refund_unsupported');
  });
});

describe('adaptador simulado: avisos firmados (caso 8)', () => {
  it('firma cada aviso y solo acepta el cuerpo exacto, con la firma correcta y reciente', async () => {
    const { gateway, hold } = gatewayAt();
    const paymentRef = await hold();
    await gateway.capture({ paymentRef, amount: cop('100'), idempotencyKey: 'c' });
    const [webhook] = gateway.controls.takeWebhooks();
    if (!webhook) throw new Error('sin aviso');
    const header = (signature: string | undefined) => (name: string) =>
      name === SIMULATED_SIGNATURE_HEADER ? signature : undefined;

    const verified = gateway.verifyWebhook(webhook.body, header(webhook.signature), START);
    expect(verified).toEqual({
      ok: true,
      notice: {
        eventId: expect.stringMatching(/^evt_sim_/),
        type: 'capture.succeeded',
        operationKey: 'c',
        paymentRef,
        status: 'captured',
        amount: cop('100'),
        occurredAt: START.toISOString(),
      },
    });

    const altered = webhook.body.replace('"100"', '"999"');
    expect(gateway.verifyWebhook(altered, header(webhook.signature), START)).toEqual({
      ok: false,
      reason: 'invalid-signature',
    });
    expect(gateway.verifyWebhook(webhook.body, header(undefined), START)).toMatchObject({
      reason: 'invalid-signature',
    });
    expect(gateway.verifyWebhook(webhook.body, header('t=1,v1=zz'), START)).toMatchObject({
      reason: 'invalid-signature',
    });
    const late = new Date(START.getTime() + 5 * 60_000 + 1_000);
    expect(gateway.verifyWebhook(webhook.body, header(webhook.signature), late)).toMatchObject({
      reason: 'stale',
    });
    const garbage = '{"id":1}';
    expect(
      gateway.verifyWebhook(garbage, header(gateway.controls.sign(garbage, START)), START),
    ).toMatchObject({ reason: 'malformed' });
  });

  it('los avisos y las referencias no se repiten entre instancias (como en una pasarela real)', async () => {
    const first = gatewayAt();
    const second = gatewayAt();
    const refs = [await first.hold(), await second.hold()];
    expect(new Set(refs).size).toBe(2);
    first.gateway.controls.expire(refs[0] ?? '');
    second.gateway.controls.expire(refs[1] ?? '');
    const ids = [first, second].map(
      ({ gateway }) =>
        (JSON.parse(gateway.controls.takeWebhooks()[0]?.body ?? '{}') as { id: string }).id,
    );
    expect(new Set(ids).size).toBe(2);
  });

  it('otra instancia (otro secreto) no acepta los avisos firmados por esta', async () => {
    const first = gatewayAt();
    const second = createSimulatedPaymentGateway('demo-tavelyo', { now: () => START });
    const paymentRef = await first.hold();
    first.gateway.controls.expire(paymentRef);
    const [webhook] = first.gateway.controls.takeWebhooks();
    if (!webhook) throw new Error('sin aviso');
    expect(second.verifyWebhook(webhook.body, () => webhook.signature, START)).toMatchObject({
      ok: false,
      reason: 'invalid-signature',
    });
  });
});
