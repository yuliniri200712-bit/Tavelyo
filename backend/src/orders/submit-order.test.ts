import { describe, expect, it, vi } from 'vitest';
import type { Actor } from '../shared/outcome.ts';
import type { DispatchResult, KitchenDispatcher } from './send-to-kitchen.ts';
import {
  createSubmitOrder,
  NOT_SENT,
  parseSubmitOrderInput,
  type SubmittableQuote,
  type SubmitQuoteStore,
} from './submit-order.ts';

const actor: Actor = {
  uid: 'cliente-anonimo',
  claims: { sub: 'cliente-anonimo' },
  authTimeSeconds: 1,
};
const QUOTE = '9'.repeat(32);
const ORDER = '5'.repeat(32);
const NOW = new Date('2026-11-18T18:00:00Z');

const quote: SubmittableQuote = {
  id: QUOTE,
  tenantId: '7'.repeat(32),
  branchId: '6'.repeat(32),
  sessionId: '4'.repeat(32),
  participantId: '3'.repeat(32),
  status: 'QUOTED',
  currency: 'COP',
  totalMinor: '6400000',
  expiresAt: new Date('2026-11-18T18:15:00Z'),
  sessionOpen: true,
  participantRemoved: false,
  participantExpiresAt: new Date('2026-11-18T22:00:00Z'),
  orderApproval: 'DIRECT',
  lines: [],
};

function setup(
  found: SubmittableQuote | null,
  dispatched: DispatchResult = { kind: 'sent', orderId: ORDER },
  options: { confirmed?: boolean; admitted?: boolean } = {},
) {
  const quotes = {
    forSubmit: vi.fn(async () => found),
    confirm: vi.fn(async () => options.confirmed ?? true),
  } satisfies SubmitQuoteStore;
  const dispatch = vi.fn<KitchenDispatcher>(async () => dispatched);
  const submit = createSubmitOrder({
    quotes,
    dispatch,
    limiter: { admit: async () => options.admitted ?? true },
    clock: { now: () => NOW },
  });
  return { quotes, dispatch, submit };
}

describe('parseSubmitOrderInput', () => {
  it('solo admite el resumen: ni importes, ni consentimiento, ni resultados simulados', () => {
    expect(parseSubmitOrderInput({ quoteId: QUOTE })).toEqual({
      ok: true,
      value: { quoteId: QUOTE },
    });
    expect(parseSubmitOrderInput({ quoteId: 'no-es-uuid' }).ok).toBe(false);
    expect(parseSubmitOrderInput({ quoteId: QUOTE, amountMinor: '1' }).ok).toBe(false);
    expect(parseSubmitOrderInput({ quoteId: QUOTE, simulatedOutcome: 'declined' }).ok).toBe(false);
    expect(parseSubmitOrderInput(null).ok).toBe(false);
  });
});

describe('submitOrder (ADR-0012)', () => {
  it('confirma el resumen y, en una sucursal directa, envía el pedido a cocina sin pasarela', async () => {
    const { submit, quotes, dispatch } = setup(quote);
    expect(await submit(actor, { quoteId: QUOTE })).toEqual({
      ok: true,
      value: { quoteId: QUOTE, status: 'sent', orderId: ORDER },
    });
    expect(quotes.confirm).toHaveBeenCalledWith(quote, actor.uid);
    expect(dispatch).toHaveBeenCalledWith({ ...quote, status: 'CONFIRMED' }, actor.uid, 'DIRECT');
  });

  it('en una sucursal con aprobación, el pedido queda esperando al mesero (D-32)', async () => {
    const waiter = { ...quote, orderApproval: 'WAITER_APPROVAL' as const };
    const { submit, dispatch } = setup(waiter, { kind: 'pending_approval', orderId: ORDER });
    expect(await submit(actor, { quoteId: QUOTE })).toEqual({
      ok: true,
      value: { quoteId: QUOTE, status: 'pending_approval', orderId: ORDER },
    });
    expect(dispatch).toHaveBeenCalledWith(expect.anything(), actor.uid, 'WAITER_APPROVAL');
  });

  it('un resumen ya confirmado (reintento o caída) termina el envío sin confirmarlo otra vez', async () => {
    for (const status of ['CONFIRMED', 'AUTHORIZED'] as const) {
      const { submit, quotes, dispatch } = setup({ ...quote, status });
      expect(await submit(actor, { quoteId: QUOTE })).toMatchObject({
        ok: true,
        value: { status: 'sent', orderId: ORDER },
      });
      expect(quotes.confirm).not.toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledOnce();
    }
  });

  it('doble pulsación: si otra solicitud ya lo confirmó, se continúa con ese', async () => {
    const { submit, quotes, dispatch } = setup(quote, undefined, { confirmed: false });
    quotes.forSubmit
      .mockResolvedValueOnce(quote)
      .mockResolvedValueOnce({ ...quote, status: 'CONFIRMED' });
    expect(await submit(actor, { quoteId: QUOTE })).toMatchObject({
      ok: true,
      value: { status: 'sent' },
    });
    expect(dispatch).toHaveBeenCalledOnce();
  });

  it('si no se pudo confirmar porque venció justo ahora, pide revisarlo otra vez', async () => {
    const { submit, quotes, dispatch } = setup(quote, undefined, { confirmed: false });
    quotes.forSubmit
      .mockResolvedValueOnce(quote)
      .mockResolvedValueOnce({ ...quote, status: 'EXPIRED' });
    expect(await submit(actor, { quoteId: QUOTE })).toMatchObject({
      ok: false,
      error: { code: 'failed-precondition', message: expect.stringMatching(/venció/) },
    });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('rechazado por el mesero o retirado por su comensal: lo explica sin reenviarlo', async () => {
    const rejected = setup(
      { ...quote, status: 'CONFIRMED' },
      {
        kind: 'closed',
        orderId: ORDER,
        approval: 'REJECTED',
      },
    );
    expect(await rejected.submit(actor, { quoteId: QUOTE })).toMatchObject({
      ok: false,
      error: { code: 'failed-precondition', message: expect.stringMatching(/no aprobó/) },
    });
    const withdrawn = setup(
      { ...quote, status: 'CONFIRMED' },
      {
        kind: 'closed',
        orderId: ORDER,
        approval: 'WITHDRAWN',
      },
    );
    expect(await withdrawn.submit(actor, { quoteId: QUOTE })).toMatchObject({
      ok: false,
      error: { message: 'Retiraste este pedido.' },
    });
  });

  it('si la mesa se cerró o la persona ya no está, no se envía', async () => {
    const closed = setup({ ...quote, status: 'CONFIRMED', sessionOpen: false });
    expect(await closed.submit(actor, { quoteId: QUOTE })).toEqual({
      ok: false,
      error: { code: 'failed-precondition', message: NOT_SENT },
    });
    expect(closed.dispatch).not.toHaveBeenCalled();

    const raced = setup(quote, { kind: 'rejected' });
    expect(await raced.submit(actor, { quoteId: QUOTE })).toEqual({
      ok: false,
      error: { code: 'failed-precondition', message: NOT_SENT },
    });
  });

  it('no envía resúmenes ajenos, vencidos, de antes del cambio o de una mesa ya cerrada', async () => {
    expect(await setup(null).submit(actor, { quoteId: QUOTE })).toMatchObject({
      ok: false,
      error: { code: 'not-found' },
    });
    const expired = { ...quote, expiresAt: new Date('2026-11-18T17:59:00Z') };
    expect(await setup(expired).submit(actor, { quoteId: QUOTE })).toMatchObject({
      ok: false,
      error: { code: 'failed-precondition' },
    });
    for (const status of ['EXPIRED', 'DECLINED', 'RELEASE_PENDING'] as const) {
      const result = setup({ ...quote, status });
      expect(await result.submit(actor, { quoteId: QUOTE })).toMatchObject({
        ok: false,
        error: { code: 'failed-precondition' },
      });
      expect(result.dispatch).not.toHaveBeenCalled();
    }
    for (const gone of [
      { ...quote, sessionOpen: false },
      { ...quote, participantRemoved: true },
      { ...quote, participantExpiresAt: new Date('2026-11-18T17:00:00Z') },
    ]) {
      const result = setup(gone);
      expect(await result.submit(actor, { quoteId: QUOTE })).toMatchObject({
        ok: false,
        error: { code: 'not-found' },
      });
      expect(result.quotes.confirm).not.toHaveBeenCalled();
    }
  });

  it('respeta el límite de solicitudes por persona', async () => {
    const { submit, quotes } = setup(quote, undefined, { admitted: false });
    expect(await submit(actor, { quoteId: QUOTE })).toMatchObject({
      ok: false,
      error: { code: 'resource-exhausted' },
    });
    expect(quotes.forSubmit).not.toHaveBeenCalled();
  });
});
