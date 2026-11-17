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

/** Resumen de los pedidos propios, p. ej. «2 pedidos enviados a cocina». */
export function describeMyOrders(orders: readonly MyOrder[]): string {
  if (orders.length === 0) return 'Todavía no enviaste pedidos a cocina desde este teléfono.';
  return orders.length === 1
    ? '1 pedido enviado a cocina'
    : `${orders.length} pedidos enviados a cocina`;
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
    orders.flatMap((order) => order.items.map((item) => [item.id, item.status] as const)),
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
  const changed = orders.flatMap((order) =>
    order.items.filter((item) => previous.get(item.id) !== item.status),
  );
  if (changed.length === 0) return null;
  return changed
    .map((item) => `${item.productName}: ${MY_ITEM_STATUS[item.status].label.toLowerCase()}.`)
    .join(' ');
}
