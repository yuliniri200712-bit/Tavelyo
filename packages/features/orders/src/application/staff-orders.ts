import {
  availableOrderItemActions,
  elapsedMinutes,
  type OrderItemStatus,
  type OrderStatus,
} from '@tavelyo/core';
import type { PickupItem, SessionOrderItem } from '../domain/index.ts';

export type StatusTone = 'neutral' | 'success' | 'warning' | 'info';

/** Estado de una línea en texto: el color del chip nunca es la única señal (PM §7). */
export const ITEM_STATUS: Readonly<
  Record<OrderItemStatus, { readonly label: string; readonly tone: StatusTone }>
> = {
  RECEIVED: { label: 'Recibido en cocina', tone: 'neutral' },
  IN_PREPARATION: { label: 'En preparación', tone: 'info' },
  READY: { label: 'Listo para recoger', tone: 'warning' },
  PICKED_UP: { label: 'Recogido', tone: 'info' },
  DELIVERED: { label: 'Entregado', tone: 'success' },
  CANCELLED: { label: 'Cancelado', tone: 'neutral' },
};

/** Estado del pedido derivado de sus líneas (RF-CO-02), en texto. */
export const ORDER_STATUS_TEXT: Readonly<Record<OrderStatus, string>> = {
  RECEIVED: 'Recibido en cocina',
  IN_PREPARATION: 'En preparación',
  PARTIALLY_READY: 'Parcialmente listo',
  READY: 'Listo',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

/** Resumen de «Listos para recoger», p. ej. «2 listas para recoger · 1 recogida por entregar». */
export function describePickup(items: readonly PickupItem[]): string {
  if (items.length === 0) return 'No hay platos listos para recoger';
  const ready = items.filter((item) => item.status === 'READY').length;
  const pickedUp = items.length - ready;
  const readyText = ready === 1 ? '1 lista para recoger' : `${ready} listas para recoger`;
  const pickedText =
    pickedUp === 1 ? '1 recogida por entregar' : `${pickedUp} recogidas por entregar`;
  return `${readyText} · ${pickedText}`;
}

/** Cuánto lleva lista una línea, en texto. */
export function describeReadySince(readyAt: Date | null, now: Date): string {
  if (!readyAt) return 'Lista';
  const minutes = elapsedMinutes(readyAt, now);
  if (minutes < 1) return 'Lista hace menos de un minuto';
  return minutes === 1 ? 'Lista hace 1 minuto' : `Lista hace ${minutes} minutos`;
}

/** Líneas que pasaron a «listo» desde la lectura anterior (para el aviso en texto). */
export function newlyReady(previous: ReadonlySet<string>, items: readonly PickupItem[]): string[] {
  return items
    .filter((item) => item.status === 'READY' && !previous.has(item.id))
    .map((item) => item.id);
}

/** Aviso en texto de los platos que acaban de quedar listos, con su mesa. */
export function describeNewlyReady(ids: readonly string[], items: readonly PickupItem[]): string {
  const tables = [
    ...new Set(
      ids.flatMap((id) => {
        const code = items.find((item) => item.id === id)?.tableCode;
        return code ? [code] : [];
      }),
    ),
  ];
  const list = tables.map((code) => `mesa ${code}`).join(', ');
  return ids.length === 1 ? `Plato listo: ${list}.` : `Platos listos: ${list}.`;
}

export interface SessionItemPermissions {
  /** order_item.cancel */
  readonly canCancel: boolean;
  /** delivery.skip_sequence */
  readonly canDeliverDirectly: boolean;
}

/**
 * Acciones que se ofrecen en los pedidos de la mesa: las que admite el estado (core) y permite el
 * rol. Solo orientan la interfaz: el servidor vuelve a comprobar estado, versión y permiso.
 */
export function sessionItemActions(
  item: SessionOrderItem,
  { canCancel, canDeliverDirectly }: SessionItemPermissions,
): { readonly cancel: boolean; readonly deliverDirectly: boolean } {
  const actions = availableOrderItemActions(item.status);
  return {
    cancel: canCancel && actions.includes('cancel'),
    deliverDirectly: canDeliverDirectly && actions.includes('deliverDirectly'),
  };
}
