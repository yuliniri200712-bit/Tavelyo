import type { DataConnect } from 'firebase/data-connect';
import {
  cancelOrderItem,
  finishOrderItem,
  kitchenQueue,
  kitchenQueueRef,
  kitchenStations,
  OrderItemStatus,
  startOrderItem,
  type KitchenQueueData,
} from '@tavelyo/dataconnect-sdk';
import type { KitchenGateway, KitchenItem } from '@tavelyo/kitchen/domain';
import { readQuery, runCommand, SERVER_ONLY, watchQuery } from './live-query.ts';

/** Estados que muestra la cola; cualquier otro ya salió de cocina y no se lista. */
const QUEUE_STATUS: Partial<Record<OrderItemStatus, KitchenItem['status']>> = {
  [OrderItemStatus.RECEIVED]: 'RECEIVED',
  [OrderItemStatus.IN_PREPARATION]: 'IN_PREPARATION',
};

/** Solo las líneas de pedidos ya enviados a cocina llegan aquí (lo filtra el conector). */
export function toKitchenItems(data: KitchenQueueData): KitchenItem[] {
  return data.orderItems.flatMap((item) => {
    const sentAt = item.order.sentToKitchenAt;
    const status = QUEUE_STATUS[item.status];
    if (!sentAt || !status) return [];
    return [
      {
        id: item.id,
        version: item.version,
        status,
        quantity: item.quantity,
        productName: item.productNameSnapshot,
        allergens: item.allergensSnapshot ?? [],
        note: item.note ?? null,
        modifiers: item.orderItemModifiers_on_item.map((modifier) => modifier.nameSnapshot),
        tableCode: item.order.session.table.code,
        orderId: item.order.id,
        sentAt: new Date(sentAt),
        startedAt: item.startedAt ? new Date(item.startedAt) : null,
      },
    ];
  });
}

/** Cocina con SQL Connect: lectura completa, suscripción en tiempo real (ADR-0007) y cambios. */
export function createKitchenGateway(dataConnect: DataConnect): KitchenGateway {
  return {
    stations: (scope) =>
      readQuery(
        () => kitchenStations(dataConnect, scope, SERVER_ONLY),
        (data) =>
          data.stations.map((station) => ({
            id: station.id,
            name: station.name,
            isDefault: station.defaultForBranchId != null,
          })),
      ),
    queue: (scope, stationId) =>
      readQuery(
        () => kitchenQueue(dataConnect, { ...scope, stationId }, SERVER_ONLY),
        toKitchenItems,
      ),
    watchQueue: (scope, stationId, observer) =>
      watchQuery(kitchenQueueRef(dataConnect, { ...scope, stationId }), toKitchenItems, observer),
    start: (scope, item) =>
      runCommand(() =>
        startOrderItem(dataConnect, { ...scope, itemId: item.id, version: item.version }),
      ),
    finish: (scope, item) =>
      runCommand(() =>
        finishOrderItem(dataConnect, { ...scope, itemId: item.id, version: item.version }),
      ),
    cancel: (scope, item, reason) =>
      runCommand(() =>
        cancelOrderItem(dataConnect, { ...scope, itemId: item.id, version: item.version, reason }),
      ),
  };
}
