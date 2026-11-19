import { describe, expect, it, vi } from 'vitest';
import { handlePaymentWebhook, type WebhookResponse } from '../presentation/payment-endpoints.ts';
import type { AuthorizationRecord } from './ledger.ts';
import { createMemoryLedger } from './memory-ledger.test-support.ts';
import { createPaymentProcessor } from './payment-processor.ts';
import {
  createReceiveProviderNotice,
  MAX_NOTICE_BYTES,
  type ReceiveProviderNotice,
} from './receive-provider-notice.ts';
import { createSimulatedPaymentGateway, SIMULATED_SIGNATURE_HEADER } from './simulated-gateway.ts';

const NOW = new Date('2026-11-18T20:00:00Z');
const AUTH_ID = 'a'.repeat(32);
const PAYMENT_ID = 'b'.repeat(32);

async function setup() {
  const gateway = createSimulatedPaymentGateway('demo-tavelyo', { now: () => NOW });
  const memory = createMemoryLedger(() => NOW);
  const processor = createPaymentProcessor({ gateway, ledger: memory.ledger, now: () => NOW });
  const receive = createReceiveProviderNotice({
    gateway,
    events: memory.providerEvents,
    processor,
    now: () => NOW,
  });
  const hold = await gateway.authorize({
    amount: { amountMinor: '6400000', currency: 'COP' },
    idempotencyKey: 'quote_1',
    reference: 'quote_1',
  });
  const authorization: AuthorizationRecord = {
    id: AUTH_ID,
    tenantId: '7'.repeat(32),
    branchId: '6'.repeat(32),
    provider: 'simulated',
    providerRef: hold.paymentRef,
    currency: 'COP',
    authorizedMinor: '6400000',
    capturedMinor: '0',
    status: 'AUTHORIZED',
    expiresAt: null,
  };
  memory.addAuthorization(authorization);
  // Captura cuya respuesta no llegó: el aviso es lo que la confirma.
  gateway.controls.failNext('capture', 'timeout-lost');
  await processor.capture({
    authorization,
    paymentId: PAYMENT_ID,
    amountMinor: '3200000',
    actorId: 'c',
  });
  gateway.controls.failNext('capture', 'timeout-applied');
  await gateway
    .capture({
      paymentRef: hold.paymentRef,
      amount: { amountMinor: '3200000', currency: 'COP' },
      idempotencyKey: `capture_${PAYMENT_ID}`,
    })
    .catch(() => undefined);
  const [webhook] = gateway.controls.takeWebhooks();
  if (!webhook) throw new Error('sin aviso');
  const header = (signature: string) => (name: string) =>
    name === SIMULATED_SIGNATURE_HEADER ? signature : undefined;
  return { gateway, memory, receive, webhook, header };
}

describe('recepción de avisos de la pasarela (caso 8)', () => {
  it('verifica, guarda una sola vez y aplica; el repetido no se procesa otra vez', async () => {
    const { memory, receive, webhook, header } = await setup();
    expect(await receive(webhook.body, header(webhook.signature))).toEqual({
      status: 200,
      outcome: 'applied',
    });
    expect(memory.payments.get(PAYMENT_ID)?.status).toBe('CONFIRMED');
    expect(await receive(webhook.body, header(webhook.signature))).toEqual({
      status: 200,
      outcome: 'duplicate',
    });
    expect(memory.effects.filter((effect) => effect.startsWith('capture:'))).toHaveLength(1);
    expect([...memory.events.values()]).toEqual([
      expect.objectContaining({ processed: true, outcome: 'applied' }),
    ]);
  });

  it('sin firma válida no se guarda ni se aplica nada', async () => {
    const { memory, receive, webhook, header } = await setup();
    const tampered = webhook.body.replace('3200000', '6400000');
    expect(await receive(tampered, header(webhook.signature))).toEqual({
      status: 400,
      reason: 'invalid-signature',
    });
    expect(await receive(webhook.body, () => undefined)).toMatchObject({ status: 400 });
    expect(memory.events.size).toBe(0);
    expect(memory.payments.has(PAYMENT_ID)).toBe(false);
  });

  it('un aviso que llegó pero no terminó de procesarse se procesa al repetirse', async () => {
    const { memory, receive, webhook, header } = await setup();
    const finish = vi
      .spyOn(memory.providerEvents, 'finish')
      .mockRejectedValueOnce(new Error('caída'));
    await expect(receive(webhook.body, header(webhook.signature))).rejects.toThrow('caída');
    finish.mockRestore();
    expect(await receive(webhook.body, header(webhook.signature))).toEqual({
      status: 200,
      outcome: 'ignored',
    });
    expect([...memory.events.values()][0]).toMatchObject({ processed: true });
  });

  it('el mismo id con otro cuerpo se rechaza', async () => {
    const { gateway, receive, webhook, header } = await setup();
    await receive(webhook.body, header(webhook.signature));
    const other = webhook.body.replace('capture.succeeded', 'capture.otro');
    expect(await receive(other, header(gateway.controls.sign(other, NOW)))).toEqual({
      status: 400,
      reason: 'conflict',
    });
  });

  it('rechaza cuerpos demasiado grandes sin leerlos', async () => {
    const { receive } = await setup();
    expect(await receive('x'.repeat(MAX_NOTICE_BYTES + 1), () => undefined)).toEqual({
      status: 400,
      reason: 'too-large',
    });
  });
});

describe('punto de entrada HTTP del aviso', () => {
  function response() {
    const calls: {
      status?: number;
      body?: unknown;
      headers: Record<string, string>;
      ended: boolean;
    } = { headers: {}, ended: false };
    const res: WebhookResponse = {
      status(code) {
        calls.status = code;
        return res;
      },
      set(field, value) {
        calls.headers[field] = value;
        return res;
      },
      json(body) {
        calls.body = body;
      },
      end() {
        calls.ended = true;
      },
    };
    return { res, calls };
  }
  const log = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

  it('solo admite POST', async () => {
    const { res, calls } = response();
    const handler = handlePaymentWebhook(vi.fn(), log);
    await handler({ method: 'GET', rawBody: Buffer.from(''), get: () => undefined }, res);
    expect(calls).toMatchObject({ status: 405, headers: { Allow: 'POST' }, ended: true });
  });

  it('no explica el rechazo al que llama; lo deja en el registro', async () => {
    const { res, calls } = response();
    const receive = vi.fn(async () => ({
      status: 400 as const,
      reason: 'invalid-signature' as const,
    }));
    await handlePaymentWebhook(receive, log)(
      { method: 'POST', rawBody: Buffer.from('{}'), get: () => undefined },
      res,
    );
    expect(calls).toMatchObject({ status: 400, body: { error: 'rejected' } });
    expect(log.warn).toHaveBeenCalledWith(expect.any(String), { reason: 'invalid-signature' });
  });

  it('pasa el cuerpo exacto y la cabecera; un error responde 500 para que se repita', async () => {
    const ok = response();
    const receive = vi.fn<ReceiveProviderNotice>(async () => ({ status: 200, outcome: 'applied' }));
    const get = (name: string) => (name === SIMULATED_SIGNATURE_HEADER ? 'firma' : undefined);
    await handlePaymentWebhook(receive, log)(
      { method: 'POST', rawBody: Buffer.from('{"a": 1}'), get },
      ok.res,
    );
    expect(receive).toHaveBeenCalledWith('{"a": 1}', expect.any(Function));
    expect(receive.mock.calls[0]?.[1](SIMULATED_SIGNATURE_HEADER)).toBe('firma');
    expect(ok.calls).toMatchObject({ status: 200, body: { received: true } });

    const failing = response();
    await handlePaymentWebhook(vi.fn().mockRejectedValue(new Error('x')), log)(
      { method: 'POST', rawBody: Buffer.from('{}'), get: () => undefined },
      failing.res,
    );
    expect(failing.calls.status).toBe(500);
  });
});
