import type { QuotedLine } from '@tavelyo/contracts';
import { describe, expect, it, vi } from 'vitest';
import {
  buildOrder,
  createKitchenDispatcher,
  type AuthorizedQuote,
  type KitchenOrderStore,
  type NewOrder,
  type OrderRouting,
  type SendResult,
} from './send-to-kitchen.ts';

const line = (
  position: number,
  productId: string,
  extra: Partial<QuotedLine> = {},
): QuotedLine => ({
  position,
  productId,
  priceId: `precio-${productId}`,
  productName: `Producto ${productId}`,
  quantity: 1,
  unitPriceMinor: '3200000',
  modifiers: [],
  modifiersMinor: '0',
  lineTotalMinor: '3200000',
  taxMinor: '237037',
  note: null,
  ...extra,
});

const quote: AuthorizedQuote = {
  id: 'resumen',
  tenantId: 'empresa',
  branchId: 'sucursal',
  sessionId: 'sesion',
  participantId: 'persona',
  lines: [
    line(1, 'bandeja', {
      quantity: 2,
      note: 'Sin cebolla',
      modifiers: [
        { optionId: 'asada', name: 'Bien asada', priceDeltaMinor: '0' },
        { optionId: 'huevo', name: 'Huevo extra', priceDeltaMinor: '300000' },
      ],
    }),
    line(2, 'limonada'),
    line(3, 'ajiaco'),
  ],
};

const routing: OrderRouting = {
  products: new Map([
    ['bandeja', { stationId: 'cocina-caliente', allergens: ['huevo'] }],
    ['limonada', { stationId: 'bar', allergens: [] }],
    ['ajiaco', { stationId: null, allergens: ['leche'] }],
  ]),
  defaultStationId: 'predeterminada',
};

function counter() {
  let n = 0;
  return () => `id-${(n += 1)}`;
}

describe('buildOrder', () => {
  it('copia las líneas del resumen con su estación, sus alérgenos y sus opciones en orden', () => {
    const order = buildOrder(quote, 'uid', routing, 'predeterminada', counter());
    expect(order.id).toBe('id-1');
    expect(order.items.map((item) => [item.position, item.stationId, item.allergens])).toEqual([
      [1, 'cocina-caliente', ['huevo']],
      [2, 'bar', []],
      [3, 'predeterminada', ['leche']],
    ]);
    expect(order.items[0]).toMatchObject({
      quantity: 2,
      note: 'Sin cebolla',
      productName: 'Producto bandeja',
      modifiers: [
        { position: 1, optionId: 'asada', name: 'Bien asada', priceDeltaMinor: '0' },
        { position: 2, optionId: 'huevo', name: 'Huevo extra', priceDeltaMinor: '300000' },
      ],
    });
    expect(new Set(order.items.map((item) => item.id)).size).toBe(3);
  });

  it('un producto que ya no está en la carta de la sucursal va a la estación predeterminada', () => {
    const order = buildOrder(
      { ...quote, lines: [line(1, 'retirado')] },
      'uid',
      routing,
      'predeterminada',
      counter(),
    );
    expect(order.items[0]).toMatchObject({ stationId: 'predeterminada', allergens: [] });
  });
});

function store(initial: { id: string; sent: boolean } | null = null, send: SendResult = 'sent') {
  let existing = initial;
  let defaultStationId: string | null = 'predeterminada';
  const inserted: NewOrder[] = [];
  const orders = {
    byQuote: vi.fn(async () => existing),
    routing: vi.fn(async () => ({ ...routing, defaultStationId })),
    createDefaultStation: vi.fn(async () => {
      defaultStationId = 'creada';
      return true;
    }),
    insert: vi.fn(async (order: NewOrder) => {
      inserted.push(order);
      existing = { id: order.id, sent: false };
      return true;
    }),
    send: vi.fn(async () => send),
  } satisfies KitchenOrderStore;
  return {
    orders,
    inserted,
    withoutDefault() {
      defaultStationId = null;
    },
  };
}

describe('createKitchenDispatcher', () => {
  it('guarda el pedido y lo envía a cocina', async () => {
    const { orders, inserted } = store();
    const dispatch = createKitchenDispatcher({ orders, newId: counter() });
    expect(await dispatch(quote, 'uid')).toEqual({ kind: 'sent', orderId: 'id-1' });
    expect(inserted).toHaveLength(1);
    expect(orders.send).toHaveBeenCalledWith(
      { tenantId: 'empresa', branchId: 'sucursal', sessionId: 'sesion', orderId: 'id-1' },
      'uid',
    );
  });

  it('un pedido ya enviado se devuelve sin guardar ni enviar otra vez (caso 3)', async () => {
    const { orders } = store({ id: 'pedido', sent: true });
    const dispatch = createKitchenDispatcher({ orders });
    expect(await dispatch(quote, 'uid')).toEqual({ kind: 'sent', orderId: 'pedido' });
    expect(orders.insert).not.toHaveBeenCalled();
    expect(orders.send).not.toHaveBeenCalled();
  });

  it('tras una caída entre guardar y enviar, el reintento envía el pedido ya guardado', async () => {
    const { orders } = store({ id: 'guardado', sent: false });
    const dispatch = createKitchenDispatcher({ orders });
    expect(await dispatch(quote, 'uid')).toEqual({ kind: 'sent', orderId: 'guardado' });
    expect(orders.insert).not.toHaveBeenCalled();
    expect(orders.send).toHaveBeenCalledOnce();
  });

  it('si otra solicitud guardó el pedido a la vez, usa el suyo', async () => {
    const { orders } = store();
    orders.insert.mockResolvedValueOnce(false);
    orders.byQuote
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'ganador', sent: false });
    const dispatch = createKitchenDispatcher({ orders });
    expect(await dispatch(quote, 'uid')).toEqual({ kind: 'sent', orderId: 'ganador' });
  });

  it('si otra solicitud lo envió a la vez, también cuenta como enviado', async () => {
    const { orders } = store(null, 'already-sent');
    const dispatch = createKitchenDispatcher({ orders, newId: counter() });
    expect(await dispatch(quote, 'uid')).toEqual({ kind: 'sent', orderId: 'id-1' });
  });

  it('crea la estación predeterminada si la sucursal no la tiene', async () => {
    const { orders, inserted, withoutDefault } = store();
    withoutDefault();
    const dispatch = createKitchenDispatcher({ orders, newId: counter() });
    await dispatch(quote, 'uid');
    expect(orders.createDefaultStation).toHaveBeenCalledWith('empresa', 'sucursal');
    expect(inserted[0]?.items[2]?.stationId).toBe('creada');
  });

  it('si el servidor rechaza el envío, lo informa sin dar el pedido por enviado', async () => {
    const { orders } = store(null, 'rejected');
    const dispatch = createKitchenDispatcher({ orders });
    expect(await dispatch(quote, 'uid')).toEqual({ kind: 'rejected' });
  });
});
