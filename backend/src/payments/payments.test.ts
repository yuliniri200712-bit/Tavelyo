import { PaymentTimeoutError } from '@tavelyo/contracts';
import { describe, expect, it, vi } from 'vitest';
import type { Actor } from '../shared/outcome.ts';
import {
  createAuthorizeQuote,
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

const actor: Actor = {
  uid: 'cliente-anonimo',
  claims: { sub: 'cliente-anonimo' },
  authTimeSeconds: 1,
};
const QUOTE = '9'.repeat(32);
const NOW = new Date('2026-11-13T18:00:00Z');
const quote: PayableQuote = {
  id: QUOTE,
  tenantId: '7'.repeat(32),
  status: 'QUOTED',
  currency: 'COP',
  totalMinor: '6480000',
  expiresAt: new Date('2026-11-13T18:15:00Z'),
};

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
    await expect(gateway.refund(auth.paymentRef, amount)).rejects.toThrow();
    expect((await gateway.capture(auth.paymentRef, amount)).status).toBe('captured');
    expect((await gateway.status('k2'))?.status).toBe('captured');
    expect((await gateway.refund(auth.paymentRef, amount)).status).toBe('refunded');
    const other = await gateway.authorize({ amount, idempotencyKey: 'k3', reference: 'q3' });
    expect((await gateway.voidAuthorization(other.paymentRef)).status).toBe('voided');
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

function setup(found: PayableQuote | null) {
  const quotes = {
    forPayment: vi.fn(async () => found),
    setPayment: vi.fn(async () => undefined),
  } satisfies PaymentQuoteStore;
  const payments = createSimulatedPaymentGateway('demo-tavelyo');
  const authorize = createAuthorizeQuote({
    quotes,
    payments,
    limiter: { admit: async () => true },
    clock: { now: () => NOW },
  });
  return { quotes, payments, authorize };
}

describe('authorizeQuote', () => {
  it('solo admite el resultado forzado con el adaptador simulado', () => {
    expect(
      parseAuthorizeQuoteInput({ quoteId: QUOTE, simulatedOutcome: 'declined' }, true).ok,
    ).toBe(true);
    expect(
      parseAuthorizeQuoteInput({ quoteId: QUOTE, simulatedOutcome: 'declined' }, false).ok,
    ).toBe(false);
    expect(
      parseAuthorizeQuoteInput({ quoteId: QUOTE, simulatedOutcome: 'lo-que-sea' }, true).ok,
    ).toBe(false);
    expect(parseAuthorizeQuoteInput({ quoteId: QUOTE, amountMinor: '1' }, true).ok).toBe(false);
  });

  it('autoriza el importe del resumen guardado y lo marca como autorizado', async () => {
    const { authorize, quotes, payments } = setup(quote);
    const spy = vi.spyOn(payments, 'authorize');
    expect(await authorize(actor, { quoteId: QUOTE })).toEqual({
      ok: true,
      value: { quoteId: QUOTE, status: 'authorized', simulated: true },
    });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ amount: { amountMinor: '6480000', currency: 'COP' } }),
    );
    expect(quotes.setPayment).toHaveBeenCalledWith(
      quote,
      actor.uid,
      'AUTHORIZED',
      expect.stringMatching(/^sim_/),
    );
  });

  it('rechazado, requiere acción y tiempo agotado', async () => {
    const declined = setup(quote);
    expect(
      await declined.authorize(actor, { quoteId: QUOTE, simulatedOutcome: 'declined' }),
    ).toMatchObject({
      ok: true,
      value: { status: 'declined' },
    });
    expect(declined.quotes.setPayment).toHaveBeenCalledWith(
      quote,
      actor.uid,
      'DECLINED',
      expect.any(String),
    );

    const action = setup(quote);
    expect(
      await action.authorize(actor, { quoteId: QUOTE, simulatedOutcome: 'requires_action' }),
    ).toMatchObject({
      ok: true,
      value: { status: 'requires_action' },
    });
    expect(action.quotes.setPayment).not.toHaveBeenCalled();

    // La respuesta se pierde, pero la consulta posterior encuentra la autorización: sin cobro doble.
    const timeout = setup(quote);
    expect(
      await timeout.authorize(actor, { quoteId: QUOTE, simulatedOutcome: 'timeout' }),
    ).toMatchObject({
      ok: true,
      value: { status: 'authorized' },
    });
  });

  it('no autoriza resúmenes ajenos, vencidos o rechazados; repetir uno autorizado no cobra otra vez', async () => {
    expect(await setup(null).authorize(actor, { quoteId: QUOTE })).toMatchObject({
      ok: false,
      error: { code: 'not-found' },
    });
    const expired = { ...quote, expiresAt: new Date('2026-11-13T17:59:00Z') };
    expect(await setup(expired).authorize(actor, { quoteId: QUOTE })).toMatchObject({
      ok: false,
      error: { code: 'failed-precondition' },
    });
    expect(
      await setup({ ...quote, status: 'DECLINED' }).authorize(actor, { quoteId: QUOTE }),
    ).toMatchObject({
      ok: false,
      error: { code: 'failed-precondition' },
    });
    const done = setup({ ...quote, status: 'AUTHORIZED' });
    const spy = vi.spyOn(done.payments, 'authorize');
    expect(await done.authorize(actor, { quoteId: QUOTE })).toMatchObject({
      ok: true,
      value: { status: 'authorized' },
    });
    expect(spy).not.toHaveBeenCalled();
  });
});
