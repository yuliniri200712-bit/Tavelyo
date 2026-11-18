import { describe, expect, it } from 'vitest';
import type { MyOrder, MyOrderItem } from '../domain/index.ts';
import {
  describeMyOrder,
  describeMyOrders,
  describeStatusChanges,
  itemStatuses,
  serviceRequestText,
} from './my-orders.ts';

const item = (id: string, status: MyOrderItem['status'], productName = 'Ajiaco'): MyOrderItem => ({
  id,
  status,
  quantity: 1,
  productName,
  modifiers: [],
  note: null,
  lineTotalMinor: '2500000',
});

const order = (items: MyOrderItem[]): MyOrder => ({
  id: 'o1',
  sentAt: new Date('2026-11-16T18:00:00Z'),
  currency: 'COP',
  totalMinor: '5000000',
  items,
});

describe('«Mis pedidos» en texto', () => {
  it('dice el estado del pedido derivado de sus líneas', () => {
    expect(describeMyOrder(order([item('l1', 'RECEIVED')]))).toBe('Recibido en cocina');
    expect(describeMyOrder(order([item('l1', 'READY'), item('l2', 'IN_PREPARATION')]))).toBe(
      'Una parte está lista',
    );
    expect(describeMyOrder(order([item('l1', 'DELIVERED'), item('l2', 'CANCELLED')]))).toBe(
      'Entregado',
    );
    expect(describeMyOrder(order([item('l1', 'CANCELLED')]))).toBe('Cancelado por el restaurante');
  });

  it('resume cuántos pedidos se enviaron', () => {
    expect(describeMyOrders([])).toBe('Todavía no enviaste pedidos a cocina desde este teléfono.');
    expect(describeMyOrders([order([])])).toBe('1 pedido enviado a cocina');
    expect(describeMyOrders([order([]), order([])])).toBe('2 pedidos enviados a cocina');
  });

  it('anuncia solo las líneas que cambiaron o llegaron desde la lectura anterior', () => {
    const before = itemStatuses([order([item('l1', 'RECEIVED'), item('l2', 'RECEIVED', 'Arepa')])]);
    expect(
      describeStatusChanges(before, [order([item('l1', 'RECEIVED'), item('l2', 'RECEIVED')])]),
    ).toBeNull();
    expect(
      describeStatusChanges(before, [
        order([
          item('l1', 'READY'),
          item('l2', 'RECEIVED', 'Arepa'),
          item('l3', 'RECEIVED', 'Jugo'),
        ]),
      ]),
    ).toBe('Ajiaco: listo, pronto llega a tu mesa. Jugo: recibido en cocina.');
  });

  it('responde a cada solicitud, nueva o repetida', () => {
    expect(serviceRequestText('call_waiter', 'sent')).toBe('Avisamos al mesero. Viene a tu mesa.');
    expect(serviceRequestText('call_waiter', 'already-pending')).toBe(
      'El mesero ya tiene tu aviso. Viene en camino.',
    );
    expect(serviceRequestText('request_bill', 'sent')).toBe(
      'Avisamos al mesero que quieres la cuenta.',
    );
    expect(serviceRequestText('request_bill', 'already-pending')).toBe(
      'El mesero ya sabe que quieres la cuenta. Viene en camino.',
    );
  });
});
