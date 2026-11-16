import { describe, expect, it } from 'vitest';
import {
  applyOrderItemAction,
  availableOrderItemActions,
  deriveOrderStatus,
  isWasteOnCancel,
  orderItemActionRequiresReason,
  type OrderItemAction,
  type OrderItemStatus,
} from './order-status';

const STATUSES: readonly OrderItemStatus[] = [
  'RECEIVED',
  'IN_PREPARATION',
  'READY',
  'PICKED_UP',
  'DELIVERED',
  'CANCELLED',
];

describe('applyOrderItemAction', () => {
  it('recorre la secuencia completa de cocina y entrega', () => {
    const steps: Array<[OrderItemStatus, OrderItemAction, OrderItemStatus]> = [
      ['RECEIVED', 'start', 'IN_PREPARATION'],
      ['IN_PREPARATION', 'finish', 'READY'],
      ['READY', 'pickUp', 'PICKED_UP'],
      ['PICKED_UP', 'deliver', 'DELIVERED'],
    ];
    for (const [from, action, to] of steps) {
      expect(applyOrderItemAction(from, action)).toEqual({ ok: true, value: to });
    }
  });

  it('entregar sin recoger solo se puede desde «listo»', () => {
    expect(applyOrderItemAction('READY', 'deliverDirectly')).toEqual({
      ok: true,
      value: 'DELIVERED',
    });
    expect(applyOrderItemAction('IN_PREPARATION', 'deliverDirectly').ok).toBe(false);
  });

  it('rechaza saltarse pasos de cocina (p. ej. «listo» desde «recibido»)', () => {
    expect(applyOrderItemAction('RECEIVED', 'finish')).toEqual({
      ok: false,
      error: { kind: 'invalid-transition', action: 'finish', from: 'RECEIVED' },
    });
    expect(applyOrderItemAction('RECEIVED', 'pickUp').ok).toBe(false);
  });

  it('no repite un paso ya hecho: la segunda persona que pulsa «Empezar» recibe el rechazo', () => {
    expect(applyOrderItemAction('IN_PREPARATION', 'start').ok).toBe(false);
  });

  it('cancela solo antes de salir de cocina', () => {
    for (const from of ['RECEIVED', 'IN_PREPARATION', 'READY'] as const) {
      expect(applyOrderItemAction(from, 'cancel')).toEqual({ ok: true, value: 'CANCELLED' });
    }
    for (const from of ['PICKED_UP', 'DELIVERED', 'CANCELLED'] as const) {
      expect(applyOrderItemAction(from, 'cancel').ok).toBe(false);
    }
  });

  it('nunca retrocede ni sale de un estado final (D-26)', () => {
    const order = STATUSES.slice(0, 5);
    for (const from of STATUSES) {
      for (const action of availableOrderItemActions(from)) {
        const result = applyOrderItemAction(from, action);
        if (!result.ok) throw new Error(`${action} desde ${from} debía aplicarse`);
        if (result.value !== 'CANCELLED') {
          expect(order.indexOf(result.value)).toBeGreaterThan(order.indexOf(from));
        }
      }
    }
    expect(availableOrderItemActions('DELIVERED')).toEqual([]);
    expect(availableOrderItemActions('CANCELLED')).toEqual([]);
  });
});

describe('availableOrderItemActions', () => {
  it('lista lo que cada estado permite', () => {
    expect(availableOrderItemActions('RECEIVED')).toEqual(['start', 'cancel']);
    expect(availableOrderItemActions('IN_PREPARATION')).toEqual(['finish', 'cancel']);
    expect(availableOrderItemActions('READY')).toEqual(['pickUp', 'deliverDirectly', 'cancel']);
    expect(availableOrderItemActions('PICKED_UP')).toEqual(['deliver']);
  });
});

describe('motivo y merma', () => {
  it('cancelar y entregar sin recoger exigen motivo; el resto no', () => {
    expect(orderItemActionRequiresReason('cancel')).toBe(true);
    expect(orderItemActionRequiresReason('deliverDirectly')).toBe(true);
    for (const action of ['start', 'finish', 'pickUp', 'deliver'] as const) {
      expect(orderItemActionRequiresReason(action)).toBe(false);
    }
  });

  it('cancelar después de empezar a preparar cuenta como merma', () => {
    expect(isWasteOnCancel('RECEIVED')).toBe(false);
    expect(isWasteOnCancel('IN_PREPARATION')).toBe(true);
    expect(isWasteOnCancel('READY')).toBe(true);
  });
});

describe('deriveOrderStatus', () => {
  it('recibido mientras ninguna línea activa se empezó', () => {
    expect(deriveOrderStatus(['RECEIVED', 'RECEIVED', 'CANCELLED'])).toBe('RECEIVED');
  });

  it('en preparación cuando alguna empezó y ninguna salió de cocina', () => {
    expect(deriveOrderStatus(['RECEIVED', 'IN_PREPARATION'])).toBe('IN_PREPARATION');
  });

  it('parcialmente listo cuando unas salieron de cocina y otras no', () => {
    expect(deriveOrderStatus(['READY', 'RECEIVED'])).toBe('PARTIALLY_READY');
    expect(deriveOrderStatus(['DELIVERED', 'IN_PREPARATION'])).toBe('PARTIALLY_READY');
  });

  it('listo cuando todas las activas salieron de cocina y falta entregar alguna', () => {
    expect(deriveOrderStatus(['READY', 'PICKED_UP', 'DELIVERED', 'CANCELLED'])).toBe('READY');
  });

  it('entregado cuando se entregaron todas las activas', () => {
    expect(deriveOrderStatus(['DELIVERED', 'CANCELLED', 'DELIVERED'])).toBe('DELIVERED');
  });

  it('cancelado si no le queda ninguna línea activa', () => {
    expect(deriveOrderStatus(['CANCELLED', 'CANCELLED'])).toBe('CANCELLED');
    expect(deriveOrderStatus([])).toBe('CANCELLED');
  });
});
