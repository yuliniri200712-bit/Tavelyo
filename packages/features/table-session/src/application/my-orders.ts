import { deriveOrderStatus, type OrderItemStatus, type OrderStatus } from '@tavelyo/core';
import type { RequestServiceResponse, ServiceRequestKind } from '@tavelyo/contracts';
import type { MyOrder } from '../domain/index.ts';

export type StatusTone = 'neutral' | 'success' | 'warning' | 'info';

/**
 * Estado de cada línea, dicho para quien está en la mesa. El color del chip nunca es la única
 * señal (PM §7): el texto dice lo mismo.
 */
export const MY_ITEM_STATUS: Readonly<
  Record<OrderItemStatus, { readonly label: string; readonly tone: StatusTone }>
> = {
  RECEIVED: { label: 'Recibido en cocina', tone: 'neutral' },
  IN_PREPARATION: { label: 'En preparación', tone: 'info' },
  READY: { label: 'Listo, pronto llega a tu mesa', tone: 'info' },
  PICKED_UP: { label: 'En camino a tu mesa', tone: 'info' },
  DELIVERED: { label: 'Entregado', tone: 'success' },
  CANCELLED: { label: 'Cancelado por el restaurante', tone: 'warning' },
};

const ORDER_TEXT: Readonly<Record<OrderStatus, string>> = {
  RECEIVED: 'Recibido en cocina',
  IN_PREPARATION: 'En preparación',
  PARTIALLY_READY: 'Una parte está lista',
  READY: 'Listo',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado por el restaurante',
};

/** Estado del pedido, derivado de sus líneas (RF-CO-02), en texto. */
export function describeMyOrder(order: MyOrder): string {
  return ORDER_TEXT[deriveOrderStatus(order.items.map((item) => item.status))];
}

/**
 * Resumen de los pedidos propios, p. ej. «2 pedidos enviados a cocina · 1 esperando al mesero».
 */
export function describeMyOrders(orders: readonly MyOrder[]): string {
  const sent = orders.filter((order) => order.sentAt !== null).length;
  const waiting = orders.filter((order) => order.approval === 'PENDING').length;
  const parts: string[] = [];
  if (sent > 0)
    parts.push(sent === 1 ? '1 pedido enviado a cocina' : `${sent} pedidos enviados a cocina`);
  if (waiting > 0)
    parts.push(waiting === 1 ? '1 esperando al mesero' : `${waiting} esperando al mesero`);
  return parts.length > 0
    ? parts.join(' · ')
    : 'Todavía no enviaste pedidos a cocina desde este teléfono.';
}

/** Estado de un pedido que no llegó a cocina (D-32), en texto. null si llegó a cocina. */
export function describeApproval(order: MyOrder): {
  readonly label: string;
  readonly tone: StatusTone;
  readonly detail: string;
} | null {
  if (order.sentAt !== null) return null;
  switch (order.approval) {
    case 'PENDING':
      return {
        label: 'Esperando al mesero',
        tone: 'warning',
        detail:
          'El mesero revisará tu pedido antes de enviarlo a cocina. Mientras espera, puedes retirarlo.',
      };
    case 'REJECTED':
      return {
        label: 'No aprobado',
        tone: 'warning',
        detail: order.rejectionReason
          ? `El mesero no aprobó este pedido. Motivo: ${order.rejectionReason}`
          : 'El mesero no aprobó este pedido.',
      };
    case 'WITHDRAWN':
      return {
        label: 'Retirado',
        tone: 'neutral',
        detail: 'Retiraste este pedido: no llegó a cocina.',
      };
    case 'NOT_REQUIRED':
    case 'APPROVED':
      return null;
  }
}

/** Aprobación de cada pedido propio, para avisar cuando el mesero decide. */
export function approvalStates(orders: readonly MyOrder[]): Map<string, MyOrder['approval']> {
  return new Map(orders.map((order) => [order.id, order.approval] as const));
}

/** Aviso en texto de las decisiones del mesero desde la lectura anterior. null si no hubo. */
export function describeApprovalChanges(
  previous: ReadonlyMap<string, MyOrder['approval']>,
  orders: readonly MyOrder[],
): string | null {
  const texts = orders.flatMap((order) => {
    if (previous.get(order.id) !== 'PENDING') return [];
    if (order.approval === 'APPROVED') return ['El mesero aprobó tu pedido: ya está en cocina.'];
    if (order.approval === 'REJECTED') return [describeApproval(order)?.detail ?? ''];
    return [];
  });
  return texts.length > 0 ? texts.join(' ') : null;
}

/** Respuesta a «Llamar al mesero» o «Pedir la cuenta», en texto. */
export function serviceRequestText(
  kind: ServiceRequestKind,
  status: RequestServiceResponse['status'],
): string {
  if (kind === 'call_waiter') {
    return status === 'sent'
      ? 'Avisamos al mesero. Viene a tu mesa.'
      : 'El mesero ya tiene tu aviso. Viene en camino.';
  }
  return status === 'sent'
    ? 'Avisamos al mesero que quieres la cuenta.'
    : 'El mesero ya sabe que quieres la cuenta. Viene en camino.';
}

/** Estado de cada línea propia, para detectar qué cambió desde la lectura anterior. */
export function itemStatuses(orders: readonly MyOrder[]): Map<string, OrderItemStatus> {
  return new Map(
    orders
      .filter((order) => order.sentAt !== null)
      .flatMap((order) => order.items.map((item) => [item.id, item.status] as const)),
  );
}

/**
 * Aviso en texto de las líneas que cambiaron de estado (o llegaron) desde la lectura anterior,
 * p. ej. «Bandeja paisa: en camino a tu mesa.». null si nada cambió.
 */
export function describeStatusChanges(
  previous: ReadonlyMap<string, OrderItemStatus>,
  orders: readonly MyOrder[],
): string | null {
  const changed = orders
    .filter((order) => order.sentAt !== null)
    .flatMap((order) => order.items.filter((item) => previous.get(item.id) !== item.status));
  if (changed.length === 0) return null;
  return changed
    .map((item) => `${item.productName}: ${MY_ITEM_STATUS[item.status].label.toLowerCase()}.`)
    .join(' ');
}

export type ProgressState = 'done' | 'current' | 'pending';

export interface ProgressStep {
  readonly label: string;
  readonly state: ProgressState;
  readonly detail?: string;
}

const PROGRESS_LABELS = ['Recibido en cocina', 'En preparación', 'Listo para servir', 'Entregado'];

/** Paso en curso de cada estado del pedido y su explicación breve. */
const PROGRESS: Readonly<
  Record<Exclude<OrderStatus, 'CANCELLED'>, { readonly step: number; readonly detail?: string }>
> = {
  RECEIVED: { step: 0, detail: 'La cocina ya tiene tu pedido.' },
  IN_PREPARATION: { step: 1, detail: 'Estamos preparando tus platos.' },
  PARTIALLY_READY: { step: 2, detail: 'Una parte ya está lista.' },
  READY: { step: 2, detail: 'Pronto llega a tu mesa.' },
  DELIVERED: { step: 4 },
};

/**
 * Seguimiento del pedido (recibido → en preparación → listo → entregado), derivado de sus líneas.
 * null si todo se canceló: entonces no hay nada que seguir. El estado de cada plato se sigue
 * mostrando aparte, porque un pedido puede tener platos en pasos distintos.
 */
export function orderProgress(order: MyOrder): readonly ProgressStep[] | null {
  const status = deriveOrderStatus(order.items.map((item) => item.status));
  if (status === 'CANCELLED') return null;
  const { step, detail } = PROGRESS[status];
  return PROGRESS_LABELS.map((label, index) => {
    if (index < step) return { label, state: 'done' as const };
    if (index > step) return { label, state: 'pending' as const };
    return detail
      ? { label, state: 'current' as const, detail }
      : { label, state: 'current' as const };
  });
}
