import type { DataConnect } from 'firebase-admin/data-connect';
import type {
  ApprovalRequestResult,
  KitchenOrderStore,
  NewOrder,
  OrderApprovalState,
  OrderRouting,
  SendResult,
} from '../orders/send-to-kitchen.ts';
import { isConnectorRejection } from './sql-connect.ts';
import { isUniqueViolation } from './table-sessions.ts';

// Pedidos enviados a cocina con el Admin SDK. El pedido con sus líneas se guarda con un documento
// fijo (el SDK web generado no admite listas de tipo _Data) y queda invisible; el envío usa la
// operación del conector ServerSendOrderToKitchen, que comprueba D-04 y avisa a las pantallas
// (ADR-0007, regla 3).

interface RoutingData {
  productBranches: Array<{
    productId: string;
    station: { id: string; archivedAt: string | null } | null;
    product: { allergensDeclared: string[] | null };
  }>;
  defaultStation: Array<{ id: string }>;
}

const ORDER_HEADER = `$orderId: UUID!, $orderRef: String!, $tenantId: UUID!, $branchId: UUID!, $sessionId: UUID!, $participantId: UUID!, $quoteId: UUID!, $authUid: String!, $items: [OrderItem_Data!]!`;

/** Documento fijo: pedido, líneas, opciones (si las hay) y auditoría en una transacción. */
export function insertOrderDocument(withModifiers: boolean): string {
  const modifiersVariable = withModifiers ? ', $modifiers: [OrderItemModifier_Data!]!' : '';
  const modifiersStep = withModifiers ? '\n  orderItemModifier_insertMany(data: $modifiers)' : '';
  return `mutation InsertOrder(${ORDER_HEADER}${modifiersVariable}) @transaction {
  order_insert(data: { id: $orderId, tenantId: $tenantId, branchId: $branchId, sessionId: $sessionId, participantId: $participantId, quoteId: $quoteId })
  orderItem_insertMany(data: $items)${modifiersStep}
  auditEvent_insert(data: { tenantId: $tenantId, actorId: $authUid, operation: "order.create", resourceType: "order", resourceId: $orderRef })
}`;
}

export function orderVariables(order: NewOrder) {
  const { quote } = order;
  const scope = { tenantId: quote.tenantId, branchId: quote.branchId };
  const modifiers = order.items.flatMap((item) =>
    item.modifiers.map((modifier) => ({
      ...scope,
      itemId: item.id,
      position: modifier.position,
      optionId: modifier.optionId,
      nameSnapshot: modifier.name,
      priceDeltaMinor: modifier.priceDeltaMinor,
    })),
  );
  return {
    orderId: order.id,
    orderRef: order.id,
    ...scope,
    sessionId: quote.sessionId,
    participantId: quote.participantId,
    quoteId: quote.id,
    authUid: order.authUid,
    items: order.items.map((item) => ({
      ...scope,
      id: item.id,
      orderId: order.id,
      position: item.position,
      productId: item.productId,
      stationId: item.stationId,
      productNameSnapshot: item.productName,
      allergensSnapshot: item.allergens,
      quantity: item.quantity,
      unitPriceMinor: item.unitPriceMinor,
      modifiersMinor: item.modifiersMinor,
      lineTotalMinor: item.lineTotalMinor,
      taxMinor: item.taxMinor,
      note: item.note,
      status: 'RECEIVED',
    })),
    ...(modifiers.length > 0 ? { modifiers } : {}),
  };
}

const ALREADY_SENT = /ya está en cocina/;
const ALREADY_REQUESTED = /La aprobación ya se pidió/;

export function createKitchenOrderStore(dataConnect: DataConnect): KitchenOrderStore {
  return {
    async byQuote(quoteId) {
      const { data } = await dataConnect.executeQuery<
        {
          orders: Array<{
            id: string;
            sentToKitchenAt: string | null;
            approval: OrderApprovalState;
          }>;
        },
        { quoteId: string }
      >('ServerOrderByQuote', { quoteId });
      const order = data.orders[0];
      return order
        ? { id: order.id, sent: order.sentToKitchenAt !== null, approval: order.approval }
        : null;
    },

    async routing(tenantId, branchId, productIds): Promise<OrderRouting> {
      const { data } = await dataConnect.executeQuery<
        RoutingData,
        { tenantId: string; branchId: string; productIds: readonly string[] }
      >('ServerProductsForOrder', { tenantId, branchId, productIds });
      return {
        products: new Map(
          data.productBranches.map((row) => [
            row.productId,
            {
              stationId: row.station && row.station.archivedAt === null ? row.station.id : null,
              allergens: row.product.allergensDeclared ?? [],
            },
          ]),
        ),
        defaultStationId: data.defaultStation[0]?.id ?? null,
      };
    },

    async createDefaultStation(tenantId, branchId) {
      try {
        await dataConnect.executeMutation('ServerCreateDefaultStation', { tenantId, branchId });
        return true;
      } catch (error) {
        if (isUniqueViolation(error)) return false;
        throw error;
      }
    },

    async insert(order) {
      const variables = orderVariables(order);
      try {
        await dataConnect.executeGraphql(insertOrderDocument('modifiers' in variables), {
          variables,
        });
        return true;
      } catch (error) {
        if (isUniqueViolation(error)) return false;
        throw error;
      }
    },

    async send(target, authUid): Promise<SendResult> {
      try {
        await dataConnect.executeMutation('ServerSendOrderToKitchen', { ...target, authUid });
        return 'sent';
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (ALREADY_SENT.test(message)) return 'already-sent';
        if (isConnectorRejection(error)) return 'rejected';
        throw error;
      }
    },

    async requestApproval(target, authUid): Promise<ApprovalRequestResult> {
      try {
        await dataConnect.executeMutation('ServerRequestOrderApproval', { ...target, authUid });
        return 'requested';
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (ALREADY_REQUESTED.test(message)) return 'already-requested';
        if (isConnectorRejection(error)) return 'rejected';
        throw error;
      }
    },
  };
}
