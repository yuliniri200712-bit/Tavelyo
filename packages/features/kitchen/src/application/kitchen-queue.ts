import { elapsedMinutes, ORDER_ITEM_REASON_MAX, parseOrderItemReason } from '@tavelyo/core';
import type { KitchenItem } from '../domain/index.ts';

/** Minutos completos desde que la línea llegó a cocina (nunca negativos). */
export { elapsedMinutes };

/** Tiempo de espera en texto: el estado nunca depende solo del color (PM §7). */
export function describeElapsed(minutes: number): string {
  if (minutes < 1) return 'Recién llegado';
  return minutes === 1 ? 'Hace 1 minuto' : `Hace ${minutes} minutos`;
}

/** Resumen de la cola en texto, p. ej. «3 por empezar · 1 en preparación». */
export function describeQueue(items: readonly KitchenItem[]): string {
  if (items.length === 0) return 'No hay nada pendiente en esta estación';
  const waiting = items.filter((item) => item.status === 'RECEIVED').length;
  return `${waiting} por empezar · ${items.length - waiting} en preparación`;
}

/** Pedidos que no estaban en la lectura anterior (para el aviso de pedido nuevo). */
export function newOrderIds(
  previous: ReadonlySet<string>,
  items: readonly KitchenItem[],
): string[] {
  return [...new Set(items.map((item) => item.orderId))].filter((id) => !previous.has(id));
}

/** Aviso en texto de los pedidos nuevos, con su mesa. */
export function describeNewOrders(
  orderIds: readonly string[],
  items: readonly KitchenItem[],
): string | null {
  const tables = [
    ...new Set(
      orderIds.flatMap((id) => {
        const code = items.find((item) => item.orderId === id)?.tableCode;
        return code ? [code] : [];
      }),
    ),
  ];
  if (tables.length === 0) return null;
  const list = tables.map((code) => `mesa ${code}`).join(', ');
  return orderIds.length === 1 ? `Pedido nuevo: ${list}.` : `Pedidos nuevos: ${list}.`;
}

/** Mismo criterio que el servidor (pedidos.gql), compartido con el salón en `@tavelyo/core`. */
export const CANCEL_REASON_MAX = ORDER_ITEM_REASON_MAX;
export const parseCancelReason = parseOrderItemReason;
