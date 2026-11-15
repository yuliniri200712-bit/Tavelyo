import { describe, expect, it, vi } from 'vitest';
import type { Actor } from '../shared/outcome.ts';
import type { CatalogEntry } from './pricing.ts';
import {
  createQuoteOrder,
  parseQuoteOrderInput,
  quoteFingerprint,
  type NewQuote,
  type QuoteContext,
  type QuoteStore,
  type StoredQuote,
} from './quote-order.ts';

const actor: Actor = {
  uid: 'cliente-anonimo',
  claims: { sub: 'cliente-anonimo' },
  authTimeSeconds: 1,
};
const SESSION = '5'.repeat(32);
const PRODUCT = 'a'.repeat(32);
const PRICE = 'c'.repeat(32);
const NEW_PRICE = 'd'.repeat(32);
const KEY = 'clave-idempotencia-0001';
const NOW = new Date('2026-11-13T18:00:00Z');

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
  participantId: '6'.repeat(32),
  tenantId: '7'.repeat(32),
  branchId: '8'.repeat(32),
  currency: 'COP',
  timeZone: 'America/Bogota',
  operating: true,
};
const request = {
  sessionId: SESSION,
  idempotencyKey: KEY,
  lines: [{ productId: PRODUCT, priceId: PRICE, quantity: 2, optionIds: [] }],
  expectedTotalMinor: '6480000',
};

function setup(
  options: {
    context?: QuoteContext | null;
    entry?: CatalogEntry;
    insertOk?: boolean;
    admit?: boolean;
  } = {},
) {
  const saved: StoredQuote[] = [];
  const store = {
    context: vi.fn(async () => (options.context === undefined ? context : options.context)),
    byKey: vi.fn(async () => saved[0] ?? null),
    catalog: vi.fn(async () => new Map([[PRODUCT, options.entry ?? entry]])),
    insert: vi.fn(async (quote: NewQuote) => {
      if (options.insertOk === false) return false;
      saved.push({ ...quote, status: 'QUOTED' });
      return true;
    }),
  } satisfies QuoteStore;
  const limiter = { admit: vi.fn(async () => options.admit ?? true) };
  const quoteOrder = createQuoteOrder({ quotes: store, limiter, clock: { now: () => NOW } });
  return { store, limiter, saved, quoteOrder };
}

describe('parseQuoteOrderInput', () => {
  it('normaliza los UUID, ordena las opciones y limpia la nota', () => {
    const dashed = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const parsed = parseQuoteOrderInput({
      ...request,
      lines: [
        {
          productId: dashed.toUpperCase(),
          priceId: PRICE,
          quantity: 1,
          optionIds: ['2'.repeat(32), '1'.repeat(32)],
          note: '   ',
        },
      ],
    });
    expect(parsed).toMatchObject({
      ok: true,
      value: {
        lines: [{ productId: PRODUCT, optionIds: ['1'.repeat(32), '2'.repeat(32)], note: null }],
      },
    });
  });

  it.each([
    ['campos de más', { ...request, totalMinor: '1' }],
    ['clave corta', { ...request, idempotencyKey: 'corta' }],
    ['total con decimales', { ...request, expectedTotalMinor: '64800.5' }],
    ['total negativo', { ...request, expectedTotalMinor: '-1' }],
    ['pedido vacío', { ...request, lines: [] }],
    ['cantidad cero', { ...request, lines: [{ ...request.lines[0], quantity: 0 }] }],
    ['cantidad excesiva', { ...request, lines: [{ ...request.lines[0], quantity: 100 }] }],
    ['cantidad no entera', { ...request, lines: [{ ...request.lines[0], quantity: 1.5 }] }],
    [
      'precio enviado por el cliente',
      { ...request, lines: [{ ...request.lines[0], amountMinor: '1' }] },
    ],
    ['opción no UUID', { ...request, lines: [{ ...request.lines[0], optionIds: ['x'] }] }],
    ['nota larga', { ...request, lines: [{ ...request.lines[0], note: 'x'.repeat(141) }] }],
    [
      'demasiadas líneas',
      { ...request, lines: Array.from({ length: 51 }, () => request.lines[0]) },
    ],
  ])('rechaza %s', (_label, data) => {
    expect(parseQuoteOrderInput(data)).toMatchObject({
      ok: false,
      error: { code: 'invalid-argument' },
    });
  });
});

describe('quoteOrder', () => {
  it('guarda el resumen cuando el total coincide y lo devuelve con su huella', async () => {
    const { quoteOrder, store } = setup();
    const result = await quoteOrder(actor, request);
    expect(result).toMatchObject({
      ok: true,
      value: {
        outcome: 'quoted',
        status: 'QUOTED',
        expiresAt: '2026-11-13T18:15:00.000Z',
        summary: { totalMinor: '6480000', taxMinor: '480000' },
      },
    });
    expect(store.insert).toHaveBeenCalledOnce();
    const stored = store.insert.mock.calls[0]?.[0];
    const parsed = parseQuoteOrderInput(request);
    if (!parsed.ok) throw new Error('entrada de prueba no válida');
    expect(stored?.fingerprint).toBe(quoteFingerprint(context.participantId, parsed.value));
    expect(stored).toMatchObject({
      authUid: actor.uid,
      participantId: context.participantId,
      tenantId: context.tenantId,
    });
  });

  it('con la misma clave y el mismo contenido devuelve el mismo resumen sin guardar otro', async () => {
    const { quoteOrder, store } = setup();
    const first = await quoteOrder(actor, request);
    const second = await quoteOrder(actor, request);
    expect(second).toEqual(first);
    expect(store.insert).toHaveBeenCalledOnce();
  });

  it('con la misma clave y otro contenido lo rechaza', async () => {
    const { quoteOrder } = setup();
    await quoteOrder(actor, request);
    const other = {
      ...request,
      lines: [{ ...request.lines[0], quantity: 3 }],
      expectedTotalMinor: '9720000',
    };
    expect(await quoteOrder(actor, other)).toMatchObject({
      ok: false,
      error: { code: 'invalid-argument' },
    });
  });

  it('precio cambiado con el carrito abierto: devuelve el importe nuevo y no guarda nada (caso 5)', async () => {
    const { quoteOrder, store } = setup({
      entry: { ...entry, currentPrice: { id: NEW_PRICE, amountMinor: '3500000', currency: 'COP' } },
    });
    const result = await quoteOrder(actor, request);
    expect(result).toMatchObject({
      ok: true,
      value: {
        outcome: 'changed',
        changes: [
          { kind: 'price-changed', previousPriceId: PRICE, priceId: NEW_PRICE },
          { kind: 'total-changed', expectedTotalMinor: '6480000', totalMinor: '7000000' },
        ],
        summary: { totalMinor: '7000000' },
      },
    });
    expect(store.insert).not.toHaveBeenCalled();
  });

  it('un total que no coincide nunca se guarda, aunque el precio sea el mismo', async () => {
    const { quoteOrder, store } = setup();
    const result = await quoteOrder(actor, { ...request, expectedTotalMinor: '1' });
    expect(result).toMatchObject({
      ok: true,
      value: { outcome: 'changed', changes: [{ kind: 'total-changed' }] },
    });
    expect(store.insert).not.toHaveBeenCalled();
  });

  it('producto no disponible: rechazo sin guardar', async () => {
    const { quoteOrder, store } = setup({ entry: { ...entry, orderable: false } });
    expect(await quoteOrder(actor, request)).toMatchObject({
      ok: true,
      value: { outcome: 'rejected' },
    });
    expect(store.insert).not.toHaveBeenCalled();
  });

  it('sin participación vigente o con la sucursal sin operar, no calcula nada', async () => {
    const outside = setup({ context: null });
    expect(await outside.quoteOrder(actor, request)).toMatchObject({
      ok: false,
      error: { code: 'permission-denied' },
    });
    expect(outside.store.catalog).not.toHaveBeenCalled();
    const closed = setup({ context: { ...context, operating: false } });
    expect(await closed.quoteOrder(actor, request)).toMatchObject({
      ok: false,
      error: { code: 'failed-precondition' },
    });
  });

  it('respeta el límite de solicitudes antes de leer nada', async () => {
    const { quoteOrder, store } = setup({ admit: false });
    expect(await quoteOrder(actor, request)).toMatchObject({
      ok: false,
      error: { code: 'resource-exhausted' },
    });
    expect(store.context).not.toHaveBeenCalled();
  });

  it('doble pulsación simultánea: devuelve el que guardó la otra solicitud', async () => {
    const racedQuote: StoredQuote = {
      id: '9'.repeat(32),
      fingerprint: '',
      status: 'QUOTED',
      expiresAt: new Date('2026-11-13T18:15:00Z'),
      summary: { currency: 'COP', lines: [], subtotalMinor: '0', taxMinor: '0', totalMinor: '0' },
    };
    const { quoteOrder, store } = setup({ insertOk: false });
    const parsed = parseQuoteOrderInput(request);
    if (!parsed.ok) throw new Error('entrada de prueba no válida');
    store.byKey.mockResolvedValueOnce(null).mockResolvedValueOnce({
      ...racedQuote,
      fingerprint: quoteFingerprint(context.participantId, parsed.value),
    });
    expect(await quoteOrder(actor, request)).toMatchObject({
      ok: true,
      value: { outcome: 'quoted', quoteId: racedQuote.id },
    });
  });

  it('un resumen guardado y vencido se informa como vencido', async () => {
    const { quoteOrder, store } = setup();
    await quoteOrder(actor, request);
    const later = createQuoteOrder({
      quotes: store,
      limiter: { admit: async () => true },
      clock: { now: () => new Date('2026-11-13T18:16:00Z') },
    });
    expect(await later(actor, request)).toMatchObject({ ok: true, value: { status: 'EXPIRED' } });
  });
});
