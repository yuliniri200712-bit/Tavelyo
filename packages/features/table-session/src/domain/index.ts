import type { Result, WeeklySchedule } from '@tavelyo/core';
import type {
  AuthorizeQuoteRequest,
  AuthorizeQuoteResponse,
  JoinTableSessionResponse,
  QuoteOrderRequest,
  QuoteOrderResponse,
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

/** Contrato que implementa la capa de datos: carta por SQL Connect y backend (ADR-0011). */
export interface CustomerGateway {
  /** null si el QR no corresponde a ninguna mesa activa. */
  menu(qrPublicId: string): CustomerResult<PublicMenu | null>;
  /** Inicia la sesión anónima si hace falta y se une a la mesa abierta. */
  join(qrPublicId: string): CustomerResult<JoinTableSessionResponse>;
  quote(request: QuoteOrderRequest): CustomerResult<QuoteOrderResponse>;
  authorize(request: AuthorizeQuoteRequest): CustomerResult<AuthorizeQuoteResponse>;
}
