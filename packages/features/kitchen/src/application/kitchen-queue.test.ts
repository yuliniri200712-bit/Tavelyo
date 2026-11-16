import { describe, expect, it } from 'vitest';
import type { KitchenItem } from '../domain/index.ts';
import {
  describeElapsed,
  describeNewOrders,
  describeQueue,
  elapsedMinutes,
  newOrderIds,
  parseCancelReason,
} from './kitchen-queue.ts';

const item = (overrides: Partial<KitchenItem>): KitchenItem => ({
  id: 'l1',
  version: 1,
  status: 'RECEIVED',
  quantity: 1,
  productName: 'Bandeja paisa',
  allergens: [],
  note: null,
  modifiers: [],
  tableCode: 'M1',
  orderId: 'o1',
  sentAt: new Date('2026-11-16T18:00:00Z'),
  startedAt: null,
  ...overrides,
});

describe('cola de cocina', () => {
  it('cuenta los minutos completos de espera y los dice en texto', () => {
    const sentAt = new Date('2026-11-16T18:00:00Z');
    expect(elapsedMinutes(sentAt, new Date('2026-11-16T18:00:59Z'))).toBe(0);
    expect(elapsedMinutes(sentAt, new Date('2026-11-16T18:12:30Z'))).toBe(12);
    // Un reloj del equipo atrasado nunca da minutos negativos.
    expect(elapsedMinutes(sentAt, new Date('2026-11-16T17:59:00Z'))).toBe(0);
    expect(describeElapsed(0)).toBe('Recién llegado');
    expect(describeElapsed(1)).toBe('Hace 1 minuto');
    expect(describeElapsed(12)).toBe('Hace 12 minutos');
  });

  it('resume la cola en texto', () => {
    expect(describeQueue([])).toBe('No hay nada pendiente en esta estación');
    expect(
      describeQueue([
        item({ id: 'a' }),
        item({ id: 'b' }),
        item({ id: 'c', status: 'IN_PREPARATION' }),
      ]),
    ).toBe('2 por empezar · 1 en preparación');
  });

  it('detecta los pedidos nuevos y los anuncia con su mesa', () => {
    const items = [
      item({ id: 'a', orderId: 'o1', tableCode: 'M1' }),
      item({ id: 'b', orderId: 'o2', tableCode: 'T4' }),
      item({ id: 'c', orderId: 'o2', tableCode: 'T4' }),
    ];
    expect(newOrderIds(new Set(['o1']), items)).toEqual(['o2']);
    expect(describeNewOrders(['o2'], items)).toBe('Pedido nuevo: mesa T4.');
    expect(describeNewOrders(['o1', 'o2'], items)).toBe('Pedidos nuevos: mesa M1, mesa T4.');
    expect(describeNewOrders([], items)).toBeNull();
  });

  it('el motivo de cancelación sigue la regla del servidor', () => {
    expect(parseCancelReason('  ')).toBeNull();
    expect(parseCancelReason('no')).toBeNull();
    expect(parseCancelReason('  Se acabó el chicharrón ')).toBe('Se acabó el chicharrón');
    expect(parseCancelReason('x'.repeat(201))).toBeNull();
  });
});
