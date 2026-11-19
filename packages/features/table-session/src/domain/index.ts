import type { LiveObserver, OrderItemStatus, Result, WeeklySchedule } from '@tavelyo/core';
import type {
  JoinTableSessionResponse,
  QuoteOrderRequest,
  QuoteOrderResponse,
  RequestServiceRequest,
  RequestServiceResponse,
  SubmitOrderRequest,
  SubmitOrderResponse,
} from '@tavelyo/contracts';
import type { CartProduct } from '@tavelyo/cart/domain';

/** Producto de la carta pública: lo que se puede pedir, con su precio vigente (D-01b). */
export interface MenuProduct extends CartProduct {
  readonly description: string | null;
  /** Alérgenos que declara el restaurante. No garantiza su ausencia. */
  readonly allergens: readonly string[];
  readonly categoryId: string;
  readonly categoryName: string;
  readonly categorySort: number;
  readonly sort: number;
  /** Horario en la hora local de la sucursal; null si se ofrece todo el día. */
  readonly schedule: WeeklySchedule | null;
}

/** Carta de la mesa del QR. Nunca incluye sesiones, pedidos ni datos del personal. */
export interface PublicMenu {
  readonly tableCode: string;
  readonly branchName: string;
  readonly currency: string;
  readonly timezone: string;
  readonly products: readonly MenuProduct[];
}

/**
 * Falla de una operación del cliente. `rejected` lleva un mensaje escrito por el servidor para la
 * persona («La mesa todavía no está abierta…»); el resto son fallas de red o inesperadas.
 */
export type CustomerError =
  | { readonly kind: 'rejected'; readonly reason: CustomerRejection; readonly message: string }
  | { readonly kind: 'network' | 'unknown' };

/**
 * Motivo del rechazo: «not-participant», hay que volver a unirse a la mesa; «retry», el servidor
 * no pudo confirmar el resultado y se puede reintentar lo mismo sin riesgo de cobrar dos veces.
 */
export type CustomerRejection = 'not-participant' | 'retry' | 'other';

export type CustomerResult<T> = Promise<Result<T, CustomerError>>;

/** Mesa en la que está la persona en este teléfono: su sesión y la sucursal (ADR-0011). */
export interface TableSeat {
  readonly sessionId: string;
  readonly branchId: string;
}

/** Línea de un pedido propio, con su estado y su importe (D-06: solo los propios). */
export interface MyOrderItem {
  readonly id: string;
  readonly status: OrderItemStatus;
  readonly quantity: number;
  readonly productName: string;
  readonly modifiers: readonly string[];
  readonly note: string | null;
  readonly lineTotalMinor: string;
}

/** Aprobación del mesero de un pedido propio (D-32). */
export type MyOrderApproval = 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';

/** Pedido propio: enviado a cocina o que pasó por la aprobación del mesero (D-32). */
export interface MyOrder {
  readonly id: string;
  /** Cuándo se envió: a cocina o, con aprobación, al mesero. */
  readonly placedAt: Date;
  /** Cuándo llegó a cocina; null si espera al mesero, o si lo rechazó o se retiró. */
  readonly sentAt: Date | null;
  readonly approval: MyOrderApproval;
  /** Motivo del mesero si no lo aprobó. */
  readonly rejectionReason: string | null;
  readonly currency: string;
  readonly totalMinor: string;
  readonly items: readonly MyOrderItem[];
}

export type MyOrdersObserver = LiveObserver<readonly MyOrder[], CustomerError>;

/** Contrato que implementa la capa de datos: carta por SQL Connect y backend (ADR-0011). */
export interface CustomerGateway {
  /** null si el QR no corresponde a ninguna mesa activa. */
  menu(qrPublicId: string): CustomerResult<PublicMenu | null>;
  /** Inicia la sesión anónima si hace falta y se une a la mesa abierta. */
  join(qrPublicId: string): CustomerResult<JoinTableSessionResponse>;
  quote(request: QuoteOrderRequest): CustomerResult<QuoteOrderResponse>;
  /** «Enviar pedido» (ADR-0012): sin pasarela; según la sucursal, a cocina o al mesero (D-32). */
  submit(request: SubmitOrderRequest): CustomerResult<SubmitOrderResponse>;
  /** Retira un pedido propio mientras espera al mesero (D-32). */
  withdraw(seat: TableSeat, orderId: string): CustomerResult<void>;
  /**
   * Vuelve a la mesa sin crear una sesión anónima: null si en este teléfono nunca se inició
   * (nadie pidió ni llamó al mesero). Si ya existía, es igual que unirse (idempotente).
   */
  resume(qrPublicId: string): CustomerResult<JoinTableSessionResponse | null>;
  /** Pedidos propios (enviados a cocina o pasados por el mesero), con el estado de cada línea. */
  myOrders(seat: TableSeat): CustomerResult<readonly MyOrder[]>;
  /** Suscripción en tiempo real (ADR-0007); devuelve la función que la cancela. */
  watchMyOrders(seat: TableSeat, observer: MyOrdersObserver): () => void;
  /** «Llamar al mesero» o «Pedir la cuenta»: el backend aplica los límites (T11). */
  requestService(request: RequestServiceRequest): CustomerResult<RequestServiceResponse>;
}
