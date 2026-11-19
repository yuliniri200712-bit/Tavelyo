import type { DataConnect } from 'firebase/data-connect';
import {
  approveOrder,
  branchOrderApproval,
  OrderApprovalMode as SdkMode,
  pendingApprovalOrders,
  pendingApprovalOrdersRef,
  rejectOrder,
  setBranchOrderApproval,
  type BranchOrderApprovalData,
  type PendingApprovalOrdersData,
} from '@tavelyo/dataconnect-sdk';
import { err, ok } from '@tavelyo/core';
import type {
  OrderApprovalGateway,
  OrderApprovalMode,
  PendingApproval,
} from '@tavelyo/orders/domain';
import { readQuery, runCommand, SERVER_ONLY, watchQuery } from './live-query.ts';

const MODE: Readonly<Record<SdkMode, OrderApprovalMode>> = {
  [SdkMode.DIRECT]: 'DIRECT',
  [SdkMode.WAITER_APPROVAL]: 'WAITER_APPROVAL',
};

/** Pedidos que esperan al mesero en mesas abiertas (lo filtra el conector), sin datos del cliente. */
export function toPendingApprovals(data: PendingApprovalOrdersData): PendingApproval[] {
  return data.orders.flatMap((order) => {
    if (!order.approvalRequestedAt) return [];
    return [
      {
        id: order.id,
        sessionId: order.session.id,
        tableCode: order.session.table.code,
        requestedAt: new Date(order.approvalRequestedAt),
        currency: order.quote.currency,
        totalMinor: order.quote.totalMinor,
        lines: order.orderItems_on_order.map((item) => ({
          quantity: item.quantity,
          productName: item.productNameSnapshot,
          modifiers: item.orderItemModifiers_on_item.map((modifier) => modifier.nameSnapshot),
          note: item.note ?? null,
          allergens: item.allergensSnapshot ?? [],
        })),
      },
    ];
  });
}

/** Modo de la sucursal; si no aparece (sin acceso), se informa como falla. */
export function toApprovalMode(data: BranchOrderApprovalData): OrderApprovalMode | null {
  const branch = data.branches[0];
  return branch ? MODE[branch.orderApproval] : null;
}

/** Aprobación de pedidos con SQL Connect (conector aprobacion.gql, D-32). */
export function createOrderApprovalGateway(dataConnect: DataConnect): OrderApprovalGateway {
  return {
    pending: (scope) =>
      readQuery(() => pendingApprovalOrders(dataConnect, scope, SERVER_ONLY), toPendingApprovals),
    watchPending: (scope, observer) =>
      watchQuery(pendingApprovalOrdersRef(dataConnect, scope), toPendingApprovals, observer),
    approve: (scope, order) =>
      runCommand(() =>
        approveOrder(dataConnect, { ...scope, sessionId: order.sessionId, orderId: order.id }),
      ),
    reject: (scope, order, reason) =>
      runCommand(() =>
        rejectOrder(dataConnect, {
          ...scope,
          sessionId: order.sessionId,
          orderId: order.id,
          reason,
        }),
      ),
    mode: async (scope) => {
      const result = await readQuery(
        () => branchOrderApproval(dataConnect, scope, SERVER_ONLY),
        toApprovalMode,
      );
      if (!result.ok) return result;
      return result.value ? ok(result.value) : err({ kind: 'unknown' as const });
    },
    setMode: (scope, mode) =>
      runCommand(() =>
        setBranchOrderApproval(dataConnect, {
          ...scope,
          mode: mode === 'DIRECT' ? SdkMode.DIRECT : SdkMode.WAITER_APPROVAL,
        }),
      ),
  };
}
