import { describe, expect, it } from 'vitest';
import type { PickupItem, SessionOrderItem } from '../domain/index.ts';
import {
  describeNewlyReady,
  describePickup,
  describeReadySince,
  newlyReady,
  sessionItemActions,
} from './staff-orders.ts';

const pickup = (overrides: Partial<PickupItem>): PickupItem => ({
  id: 'l1',
  version: 3,
  status: 'READY',
  quantity: 1,
  productName: 'Ajiaco',
  modifiers: [],
  note: null,
  stationName: 'Cocina',
  tableCode: 'M1',
  readyAt: new Date('2026-11-16T18:00:00Z'),
  ...overrides,
});

const line = (status: SessionOrderItem['status']): SessionOrderItem => ({
  id: 'l1',
  version: 1,
  status,
  quantity: 1,
  productName: 'Ajiaco',
  modifiers: [],
  note: null,
  cancelReason: null,
});

describe('«Listos para recoger»', () => {
  it('resume en texto las listas y las recogidas', () => {
    expect(describePickup([])).toBe('No hay platos listos para recoger');
    expect(
      describePickup([pickup({}), pickup({ id: 'l2' }), pickup({ id: 'l3', status: 'PICKED_UP' })]),
    ).toBe('2 listas para recoger · 1 recogida por entregar');
  });

  it('cuenta cuánto lleva lista, nunca en negativo', () => {
    const readyAt = new Date('2026-11-16T18:00:00Z');
    expect(describeReadySince(readyAt, new Date('2026-11-16T17:59:00Z'))).toBe(
      'Lista hace menos de un minuto',
    );
    expect(describeReadySince(readyAt, new Date('2026-11-16T18:01:30Z'))).toBe(
      'Lista hace 1 minuto',
    );
    expect(describeReadySince(readyAt, new Date('2026-11-16T18:07:00Z'))).toBe(
      'Lista hace 7 minutos',
    );
    expect(describeReadySince(null, readyAt)).toBe('Lista');
  });

  it('anuncia solo los platos que quedaron listos después de la lectura anterior', () => {
    const items = [
      pickup({}),
      pickup({ id: 'l2', tableCode: 'T4' }),
      pickup({ id: 'l3', status: 'PICKED_UP' }),
    ];
    const added = newlyReady(new Set(['l1']), items);
    expect(added).toEqual(['l2']);
    expect(describeNewlyReady(added, items)).toBe('Plato listo: mesa T4.');
    expect(describeNewlyReady(['l1', 'l2'], items)).toBe('Platos listos: mesa M1, mesa T4.');
  });
});

describe('acciones en los pedidos de la mesa', () => {
  const all = { canCancel: true, canDeliverDirectly: true };

  it('cancelar mientras no salió de cocina; entregar sin recoger solo si está lista', () => {
    expect(sessionItemActions(line('RECEIVED'), all)).toEqual({
      cancel: true,
      deliverDirectly: false,
    });
    expect(sessionItemActions(line('READY'), all)).toEqual({ cancel: true, deliverDirectly: true });
    expect(sessionItemActions(line('PICKED_UP'), all)).toEqual({
      cancel: false,
      deliverDirectly: false,
    });
    expect(sessionItemActions(line('DELIVERED'), all)).toEqual({
      cancel: false,
      deliverDirectly: false,
    });
  });

  it('sin el permiso no se ofrece (el servidor también lo rechaza)', () => {
    expect(
      sessionItemActions(line('READY'), { canCancel: false, canDeliverDirectly: false }),
    ).toEqual({
      cancel: false,
      deliverDirectly: false,
    });
  });
});
