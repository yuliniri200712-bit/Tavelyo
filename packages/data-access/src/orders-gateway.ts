import type { DataConnect } from 'firebase/data-connect';
import {
  cancelOrderItem,
  deliverOrderItem,
  deliverOrderItemDirectly,
  pickUpOrderItem,
  pickupQueue,
  pickupQueueRef,
  sessionOrders,
  sessionOrdersRef,
  type PickupQueueData,
  type SessionOrdersData,
} from '@tavelyo/dataconnect-sdk';
import type { PickupItem, SessionOrder, StaffOrdersGateway } from '@tavelyo/orders/domain';
import { ITEM_STATUS } from './item-status.ts';
import { readQuery, runCommand, SERVER_ONLY, watchQuery } from './live-query.ts';

/** «Listos para recoger»: solo líneas listas o recogidas (lo filtra el conector). */
export function toPickupItems(data: PickupQueueData): PickupItem[] {
  return data.orderItems.flatMap((item) => {
    const status = ITEM_STATUS[item.status];
    if (status !== 'READY' && status !== 'PICKED_UP') return [];
    return [
      {
        id: item.id,
        version: item.version,
        status,
        quantity: item.quantity,
        productName: item.productNameSnapshot,
        modifiers: item.orderItemModifiers_on_item.map((modifier) => modifier.nameSnapshot),
        note: item.note ?? null,
        stationName: item.station.name,
        tableCode: item.order.session.table.code,
        readyAt: item.readyAt ? new Date(item.readyAt) : null,
      },
    ];
  });
}

/** Pedidos de la mesa ya enviados a cocina (lo filtra el conector). */
export function toSessionOrders(data: SessionOrdersData): SessionOrder[] {
  return data.orders.flatMap((order) => {
    if (!order.sentToKitchenAt) return [];
    return [
      {
        id: order.id,
        sentAt: new Date(order.sentToKitchenAt),
        items: order.orderItems_on_order.map((item) => ({
          id: item.id,
          version: item.version,
          status: ITEM_STATUS[item.status],
          quantity: item.quantity,
          productName: item.productNameSnapshot,
          modifiers: item.orderItemModifiers_on_item.map((modifier) => modifier.nameSnapshot),
          note: item.note ?? null,
          cancelReason: item.cancelReason ?? null,
        })),
      },
    ];
  });
}

/** Pedidos para el personal del salón con SQL Connect (conector pedidos.gql). */
export function createStaffOrdersGateway(dataConnect: DataConnect): StaffOrdersGateway {
  const ref = (item: { id: string; version: number }) => ({
    itemId: item.id,
    version: item.version,
  });
  return {
    pickupQueue: (scope) =>
      readQuery(() => pickupQueue(dataConnect, scope, SERVER_ONLY), toPickupItems),
    watchPickupQueue: (scope, observer) =>
      watchQuery(pickupQueueRef(dataConnect, scope), toPickupItems, observer),
    pickUp: (scope, item) =>
      runCommand(() => pickUpOrderItem(dataConnect, { ...scope, ...ref(item) })),
    deliver: (scope, item) =>
      runCommand(() => deliverOrderItem(dataConnect, { ...scope, ...ref(item) })),
    sessionOrders: (scope, sessionId) =>
      readQuery(
        () => sessionOrders(dataConnect, { ...scope, sessionId }, SERVER_ONLY),
        toSessionOrders,
      ),
    watchSessionOrders: (scope, sessionId, observer) =>
      watchQuery(sessionOrdersRef(dataConnect, { ...scope, sessionId }), toSessionOrders, observer),
    deliverDirectly: (scope, item, reason) =>
      runCommand(() => deliverOrderItemDirectly(dataConnect, { ...scope, ...ref(item), reason })),
    cancel: (scope, item, reason) =>
      runCommand(() => cancelOrderItem(dataConnect, { ...scope, ...ref(item), reason })),
  };
}
