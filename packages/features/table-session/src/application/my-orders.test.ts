import { describe, expect, it } from 'vitest';
import type { MyOrder, MyOrderItem } from '../domain/index.ts';
import {
  approvalStates,
  describeApproval,
  describeApprovalChanges,
  describeMyOrder,
  describeMyOrders,
  describeStatusChanges,
  itemStatuses,
  orderProgress,
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

const order = (items: MyOrderItem[], extra: Partial<MyOrder> = {}): MyOrder => ({
  id: 'o1',
  placedAt: new Date('2026-11-16T18:00:00Z'),
  sentAt: new Date('2026-11-16T18:00:00Z'),
  approval: 'NOT_REQUIRED',
  rejectionReason: null,
  currency: 'COP',
  totalMinor: '5000000',
  items,
  ...extra,
});

const waiting = (
  id: string,
  approval: MyOrder['approval'] = 'PENDING',
  reason: string | null = null,
) => order([item(`${id}-l`, 'RECEIVED')], { id, sentAt: null, approval, rejectionReason: reason });

describe('aprobación del mesero (D-32)', () => {
  it('describe los pedidos que no llegaron a cocina; los enviados no', () => {
    expect(describeApproval(waiting('p'))).toMatchObject({
      label: 'Esperando al mesero',
      tone: 'warning',
      detail: expect.stringMatching(/puedes retirarlo/),
    });
    expect(describeApproval(waiting('r', 'REJECTED', 'Se agotó'))?.detail).toBe(
      'El mesero no aprobó este pedido. Motivo: Se agotó',
    );
    expect(describeApproval(waiting('w', 'WITHDRAWN'))?.label).toBe('Retirado');
    expect(describeApproval(order([item('l1', 'RECEIVED')], { approval: 'APPROVED' }))).toBeNull();
    expect(describeApproval(order([item('l1', 'RECEIVED')]))).toBeNull();
  });

  it('cuenta los enviados y los que esperan', () => {
    expect(describeMyOrders([order([item('l1', 'RECEIVED')]), waiting('p')])).toBe(
      '1 pedido enviado a cocina · 1 esperando al mesero',
    );
    expect(describeMyOrders([waiting('p'), waiting('q')])).toBe('2 esperando al mesero');
    expect(describeMyOrders([waiting('r', 'REJECTED')])).toBe(
      'Todavía no enviaste pedidos a cocina desde este teléfono.',
    );
  });

  it('avisa cuando el mesero aprueba o rechaza; las líneas sin enviar no cuentan como cambios', () => {
    const before = [waiting('a'), waiting('b')];
    const previous = approvalStates(before);
    const after = [
      order([item('a-l', 'RECEIVED')], { id: 'a', approval: 'APPROVED' }),
      waiting('b', 'REJECTED', 'Sin existencias'),
    ];
    expect(describeApprovalChanges(previous, after)).toBe(
      'El mesero aprobó tu pedido: ya está en cocina. El mesero no aprobó este pedido. Motivo: Sin existencias',
    );
    expect(describeApprovalChanges(approvalStates(after), after)).toBeNull();
    expect([...itemStatuses(before).keys()]).toEqual([]);
    expect(describeStatusChanges(itemStatuses(before), after)).toBe('Ajiaco: recibido en cocina.');
  });
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

describe('seguimiento del pedido', () => {
  const states = (items: MyOrderItem[]) =>
    orderProgress(order(items))?.map((step) => `${step.label}:${step.state}`);

  it('marca hechos los pasos anteriores, en curso el actual y pendientes los siguientes', () => {
    expect(states([item('l1', 'RECEIVED')])).toEqual([
      'Recibido en cocina:current',
      'En preparación:pending',
      'Listo para servir:pending',
      'Entregado:pending',
    ]);
    expect(states([item('l1', 'IN_PREPARATION'), item('l2', 'RECEIVED')])).toEqual([
      'Recibido en cocina:done',
      'En preparación:current',
      'Listo para servir:pending',
      'Entregado:pending',
    ]);
    expect(states([item('l1', 'PICKED_UP')])).toEqual([
      'Recibido en cocina:done',
      'En preparación:done',
      'Listo para servir:current',
      'Entregado:pending',
    ]);
  });

  it('explica el paso en curso, también cuando solo una parte está lista', () => {
    const progress = orderProgress(order([item('l1', 'READY'), item('l2', 'IN_PREPARATION')]));
    expect(progress?.find((step) => step.state === 'current')).toEqual({
      label: 'Listo para servir',
      state: 'current',
      detail: 'Una parte ya está lista.',
    });
  });

  it('entregado completa todos los pasos; cancelado no tiene seguimiento', () => {
    expect(states([item('l1', 'DELIVERED'), item('l2', 'CANCELLED')])).toEqual([
      'Recibido en cocina:done',
      'En preparación:done',
      'Listo para servir:done',
      'Entregado:done',
    ]);
    expect(orderProgress(order([item('l1', 'CANCELLED')]))).toBeNull();
  });
});
