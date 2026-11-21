export type { ComandaScope, ComandaMenu, ComandaProduct, ComandaGateway } from './comanda.ts';
import type { LiveObserver, OrderItemStatus, Result } from '@tavelyo/core';

/** Sucursal en la que se trabaja: el servidor vuelve a comprobar empresa, sucursal y permiso. */
export interface BranchScope {
  readonly tenantId: string;
  readonly branchId: string;
}

/**
 * Falla de una operación. `rejected` lleva el motivo que da el servidor (p. ej. «Esta línea ya
 * cambió»); `unauthorized` indica que la sesión perdió el permiso (revocación).
 */
export type OrdersError =
  | { readonly kind: 'rejected'; readonly message: string }
  | { readonly kind: 'unauthorized' | 'network' | 'unknown' };

export type OrdersResult<T> = Promise<Result<T, OrdersError>>;

/** Línea a la que se aplica un cambio, con la versión que vio la persona (caso 4). */
export interface ItemRef {
  readonly id: string;
  readonly version: number;
}

/** Línea lista o recogida en «Listos para recoger». Sin importes ni datos del cliente. */
export interface PickupItem extends ItemRef {
  readonly status: 'READY' | 'PICKED_UP';
  readonly quantity: number;
  readonly productName: string;
  readonly modifiers: readonly string[];
  readonly note: string | null;
  readonly stationName: string;
  readonly tableCode: string;
  /** Cuándo cocina la marcó lista: la espera se cuenta desde aquí. */
  readonly readyAt: Date | null;
}

/** Línea de un pedido de la mesa, en cualquier estado. */
export interface SessionOrderItem extends ItemRef {
  readonly status: OrderItemStatus;
  readonly quantity: number;
  readonly productName: string;
  readonly modifiers: readonly string[];
  readonly note: string | null;
  readonly cancelReason: string | null;
}

/** Pedido de la mesa ya enviado a cocina. */
export interface SessionOrder {
  readonly id: string;
  readonly sentAt: Date;
  readonly items: readonly SessionOrderItem[];
}

export type PickupObserver = LiveObserver<readonly PickupItem[], OrdersError>;
export type SessionOrdersObserver = LiveObserver<readonly SessionOrder[], OrdersError>;

/** Contrato que implementa la capa de datos (SQL Connect, conector pedidos.gql). */
export interface StaffOrdersGateway {
  /** Lectura completa de «Listos para recoger» (al abrir, al reconectar y tras cada cambio). */
  pickupQueue(scope: BranchScope): OrdersResult<readonly PickupItem[]>;
  /** Suscripción en tiempo real (ADR-0007); devuelve la función que la cancela. */
  watchPickupQueue(scope: BranchScope, observer: PickupObserver): () => void;
  /** «Recogido» (delivery.pickup). */
  pickUp(scope: BranchScope, item: ItemRef): OrdersResult<void>;
  /** «Entregado» (delivery.deliver). */
  deliver(scope: BranchScope, item: ItemRef): OrdersResult<void>;

  sessionOrders(scope: BranchScope, sessionId: string): OrdersResult<readonly SessionOrder[]>;
  watchSessionOrders(
    scope: BranchScope,
    sessionId: string,
    observer: SessionOrdersObserver,
  ): () => void;
  /** Entrega una línea lista sin pasar por «recogido» (delivery.skip_sequence y motivo). */
  deliverDirectly(scope: BranchScope, item: ItemRef, reason: string): OrdersResult<void>;
  /** Cancela con motivo (order_item.cancel); si ya se empezó, queda como merma. */
  cancel(scope: BranchScope, item: ItemRef, reason: string): OrdersResult<void>;
}

/** Cómo llegan a cocina los pedidos del comensal en la sucursal (D-32, ADR-0012). */
export type OrderApprovalMode = 'DIRECT' | 'WAITER_APPROVAL';

/** Línea de un pedido que espera aprobación: lo que necesita el mesero para decidir. */
export interface ApprovalLine {
  readonly quantity: number;
  readonly productName: string;
  readonly modifiers: readonly string[];
  readonly note: string | null;
  readonly allergens: readonly string[];
}

/** Pedido de un comensal que espera la aprobación del mesero. Sin datos de quien lo pidió. */
export interface PendingApproval {
  readonly id: string;
  readonly sessionId: string;
  readonly tableCode: string;
  /** Desde cuándo espera: el mesero ve cuánto lleva. */
  readonly requestedAt: Date;
  readonly currency: string;
  readonly totalMinor: string;
  readonly lines: readonly ApprovalLine[];
}

export type PendingApprovalsObserver = LiveObserver<readonly PendingApproval[], OrdersError>;

/** Contrato que implementa la capa de datos (conector aprobacion.gql). */
export interface OrderApprovalGateway {
  /** «Pedidos por aprobar» (order.approve). */
  pending(scope: BranchScope): OrdersResult<readonly PendingApproval[]>;
  watchPending(scope: BranchScope, observer: PendingApprovalsObserver): () => void;
  /** Aprobar: el pedido llega a cocina. */
  approve(scope: BranchScope, order: Pick<PendingApproval, 'id' | 'sessionId'>): OrdersResult<void>;
  /** Rechazar con motivo: no llega a cocina; su comensal ve el motivo. */
  reject(
    scope: BranchScope,
    order: Pick<PendingApproval, 'id' | 'sessionId'>,
    reason: string,
  ): OrdersResult<void>;
  /** Modo de la sucursal (branch.settings). */
  mode(scope: BranchScope): OrdersResult<OrderApprovalMode>;
  setMode(scope: BranchScope, mode: OrderApprovalMode): OrdersResult<void>;
}
