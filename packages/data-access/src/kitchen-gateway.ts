import { QueryFetchPolicy, subscribe, type DataConnect } from 'firebase/data-connect';
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
import { err, ok } from '@tavelyo/core';
import type { KitchenGateway, KitchenItem } from '@tavelyo/kitchen/domain';

import { mapCommandError } from './command-errors.ts';

// Siempre al servidor: la PWA no conserva respuestas de datos (ADR-0008 §8, ADR-0009). La
// suscripción usa el registro propio del SDK, sin caché persistente.
const SERVER_ONLY = { fetchPolicy: QueryFetchPolicy.SERVER_ONLY } as const;

/** Estados que muestra la cola; cualquier otro ya salió de cocina y no se lista. */
const QUEUE_STATUS: Partial<Record<OrderItemStatus, KitchenItem['status']>> = {
  [OrderItemStatus.RECEIVED]: 'RECEIVED',
  [OrderItemStatus.IN_PREPARATION]: 'IN_PREPARATION',
};

async function command(run: () => Promise<unknown>) {
  try {
    await run();
    return ok(undefined);
  } catch (error) {
    return err(mapCommandError(error));
  }
}

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
    async stations(scope) {
      try {
        const { data } = await kitchenStations(dataConnect, scope, SERVER_ONLY);
        return ok(
          data.stations.map((station) => ({
            id: station.id,
            name: station.name,
            isDefault: station.defaultForBranchId != null,
          })),
        );
      } catch (error) {
        return err(mapCommandError(error));
      }
    },

    async queue(scope, stationId) {
      try {
        const { data } = await kitchenQueue(dataConnect, { ...scope, stationId }, SERVER_ONLY);
        return ok(toKitchenItems(data));
      } catch (error) {
        return err(mapCommandError(error));
      }
    },

    watchQueue(scope, stationId, observer) {
      try {
        return subscribe(kitchenQueueRef(dataConnect, { ...scope, stationId }), {
          onNext: (result) => observer.onData(toKitchenItems(result.data)),
          onErr: (error) => {
            if (error) observer.onError(mapCommandError(error));
          },
        });
      } catch (error) {
        // Sin conexión de streaming, el SDK lanza al suscribir: la pantalla lo trata como sin red.
        observer.onError(mapCommandError(error));
        return () => undefined;
      }
    },

    start: (scope, item) =>
      command(() =>
        startOrderItem(dataConnect, { ...scope, itemId: item.id, version: item.version }),
      ),
    finish: (scope, item) =>
      command(() =>
        finishOrderItem(dataConnect, { ...scope, itemId: item.id, version: item.version }),
      ),
    cancel: (scope, item, reason) =>
      command(() =>
        cancelOrderItem(dataConnect, { ...scope, itemId: item.id, version: item.version, reason }),
      ),
  };
}
