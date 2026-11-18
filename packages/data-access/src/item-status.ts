import { OrderItemStatus } from '@tavelyo/dataconnect-sdk';
import type { OrderItemStatus as ItemStatus } from '@tavelyo/core';

/** Los estados del SDK son los mismos códigos que la máquina de estados de core. */
export const ITEM_STATUS: Readonly<Record<OrderItemStatus, ItemStatus>> = {
  [OrderItemStatus.RECEIVED]: 'RECEIVED',
  [OrderItemStatus.IN_PREPARATION]: 'IN_PREPARATION',
  [OrderItemStatus.READY]: 'READY',
  [OrderItemStatus.PICKED_UP]: 'PICKED_UP',
  [OrderItemStatus.DELIVERED]: 'DELIVERED',
  [OrderItemStatus.CANCELLED]: 'CANCELLED',
};
