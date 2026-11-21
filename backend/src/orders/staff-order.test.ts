import { describe, expect, it, vi } from 'vitest';
import type { Actor } from '../shared/outcome.ts';
import type { CatalogEntry } from './pricing.ts';
import type { NewQuote, QuoteContext, QuoteStore, StoredQuote } from './quote-order.ts';
import type { DispatchResult, KitchenDispatcher } from './send-to-kitchen.ts';
import { createStaffOrder } from './staff-order.ts';

const waiter: Actor = { uid: 'mesero-1', claims: { sub: 'mesero-1' }, authTimeSeconds: 1 };
const TENANT = '7'.repeat(32);
const BRANCH = '8'.repeat(32);
const SESSION = '5'.repeat(32);
const GUEST = '6'.repeat(32);
const PRODUCT = 'a'.repeat(32);
const PRICE = 'c'.repeat(32);
const ORDER = 'e'.repeat(32);
const NOW = new Date('2026-11-21T18:00:00Z');

const entry: CatalogEntry = {
  productId: PRODUCT,
  name: 'Bandeja paisa',
  orderable: true,
  schedule: null,
  currentPrice: { id: PRICE, amountMinor: '3240000', currency: 'COP' },
  taxRateBp: 800,
  groups: [],
};
const context: QuoteContext = {
  participantId: GUEST,
  tenantId: TENANT,
  branchId: BRANCH,
  currency: 'COP',
  timeZone: 'America/Bogota',
  operating: true,
};
const request = {
  tenantId: TENANT,
  branchId: BRANCH,
  participantId: GUEST,
  sessionId: SESSION,
  idempotencyKey: '0b4f6c1e-2d3a-4b5c-8d9e-0f1a2b3c4d5e',
  lines: [{ productId: PRODUCT, priceId: PRICE, quantity: 1, optionIds: [] }],
  expectedTotalMinor: '3240000',
};

function setup(
  options: {
    context?: QuoteContext | null;
    dispatched?: DispatchResult;
    entry?: CatalogEntry;
  } = {},
) {
  const saved: StoredQuote[] = [];
  const store = {
    context: vi.fn(async () => null),
    byKey: vi.fn(async () => saved[0] ?? null),
    catalog: vi.fn(async () => new Map([[PRODUCT, options.entry ?? entry]])),
    insert: vi.fn(async (quote: NewQuote) => {
      saved.push({ ...quote, status: 'CONFIRMED' });
      return true;
    }),
  } satisfies QuoteStore;
  const staffContext = vi.fn(async () =>
    options.context === undefined ? context : options.context,
  );
  const quotesFor = vi.fn(() => store);
  const dispatch = vi.fn<KitchenDispatcher>(
    async () => options.dispatched ?? { kind: 'sent', orderId: ORDER },
  );
  const submit = createStaffOrder({
    context: staffContext,
    quotes: quotesFor,
    dispatch,
    limiter: { admit: async () => true },
    clock: { now: () => NOW },
  });
  return { store, staffContext, quotesFor, dispatch, submit };
}

describe('submitStaffOrder (bloque 6b, D-42 y D-43)', () => {
  it('valida en el servidor el pedido del mesero y lo envía directo a cocina', async () => {
    const { submit, staffContext, quotesFor, dispatch } = setup();
    expect(await submit(waiter, request)).toEqual({
      ok: true,
      value: { outcome: 'sent', orderId: ORDER },
    });
    expect(quotesFor).toHaveBeenCalledWith(waiter.uid);
    expect(staffContext).toHaveBeenCalledWith(
      { tenantId: TENANT, branchId: BRANCH, sessionId: SESSION },
      GUEST,
      waiter.uid,
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: TENANT, branchId: BRANCH, participantId: GUEST }),
      waiter.uid,
      'DIRECT',
    );
  });

  it('rechaza identificadores que no son UUID sin consultar nada', async () => {
    const { submit, staffContext, dispatch } = setup();
    const result = await submit(waiter, { ...request, participantId: 'otra-persona' });
    expect(result.ok).toBe(false);
    expect(staffContext).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('rechaza campos que no forman parte del pedido, como un importe impuesto por el cliente', async () => {
    const { submit, dispatch } = setup();
    expect((await submit(waiter, { ...request, amountMinor: '1' })).ok).toBe(false);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('no envía nada si el mesero no tiene acceso a la mesa o la persona ya no está', async () => {
    const { submit, dispatch } = setup({ context: null });
    const result = await submit(waiter, request);
    expect(result).toMatchObject({ ok: false, error: { code: 'permission-denied' } });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('si el precio cambió devuelve el nuevo resumen y no envía a cocina', async () => {
    const { submit, dispatch } = setup({
      entry: { ...entry, currentPrice: { id: PRICE, amountMinor: '3500000', currency: 'COP' } },
    });
    const result = await submit(waiter, request);
    expect(result).toMatchObject({ ok: true, value: { outcome: 'changed' } });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('informa cuando la mesa se cerró antes de enviar', async () => {
    const { submit } = setup({ dispatched: { kind: 'rejected' } });
    expect(await submit(waiter, request)).toMatchObject({
      ok: false,
      error: { code: 'failed-precondition' },
    });
  });

  it('al reintentar con la misma clave reutiliza el mismo resumen y no crea otro', async () => {
    const { submit, store, dispatch } = setup();
    await submit(waiter, request);
    await submit(waiter, request);
    expect(store.insert).toHaveBeenCalledTimes(1);
    const ids = dispatch.mock.calls.map(([quote]) => quote.id);
    expect(new Set(ids).size).toBe(1);
  });
});
