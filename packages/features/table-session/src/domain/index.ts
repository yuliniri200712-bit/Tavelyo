import type { LiveObserver, OrderItemStatus, Result, WeeklySchedule } from '@tavelyo/core';
import type {
  AuthorizeQuoteRequest,
  AuthorizeQuoteResponse,
  JoinTableSessionResponse,
  QuoteOrderRequest,
  QuoteOrderResponse,
  RequestServiceRequest,
  RequestServiceResponse,
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

/** Pedido propio ya enviado a cocina. */
export interface MyOrder {
  readonly id: string;
  readonly sentAt: Date;
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
  authorize(request: AuthorizeQuoteRequest): CustomerResult<AuthorizeQuoteResponse>;
  /**
   * Vuelve a la mesa sin crear una sesión anónima: null si en este teléfono nunca se inició
   * (nadie pidió ni llamó al mesero). Si ya existía, es igual que unirse (idempotente).
   */
  resume(qrPublicId: string): CustomerResult<JoinTableSessionResponse | null>;
  /** Pedidos propios enviados a cocina, con el estado de cada línea. */
  myOrders(seat: TableSeat): CustomerResult<readonly MyOrder[]>;
  /** Suscripción en tiempo real (ADR-0007); devuelve la función que la cancela. */
  watchMyOrders(seat: TableSeat, observer: MyOrdersObserver): () => void;
  /** «Llamar al mesero» o «Pedir la cuenta»: el backend aplica los límites (T11). */
  requestService(request: RequestServiceRequest): CustomerResult<RequestServiceResponse>;
}
