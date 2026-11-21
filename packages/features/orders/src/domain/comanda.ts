import type { CartProduct } from '@tavelyo/cart/domain';
import type { QuoteOrderRequest, StaffOrderResponse } from '@tavelyo/contracts';
import type { Result } from '@tavelyo/core';
import type { BranchScope, OrdersError } from './index.ts';
export interface ComandaScope extends BranchScope {
  readonly sessionId: string;
}
export interface ComandaProduct extends CartProduct {
  readonly categoryName: string;
}
export interface ComandaMenu {
  readonly products: readonly ComandaProduct[];
  readonly currency: string;
  /** Personas vigentes, con el mismo nombre que en el salón y la caja (D-43). */
  readonly people: readonly {
    readonly id: string;
    readonly label: string;
    readonly guestNumber: number | null;
  }[];
  /** Número para la siguiente persona sin teléfono; null si la mesa llegó al máximo. */
  readonly nextGuestNumber: number | null;
}
/**
 * added: se agregó ahora. taken: ese número ya existe en la mesa (la agregó este mismo intento,
 * cuya respuesta se perdió, u otra persona del equipo a la vez).
 */
export type GuestAdded =
  { readonly outcome: 'added'; readonly participantId: string } | { readonly outcome: 'taken' };
type Reply<T> = Promise<Result<T, OrdersError>>;
export interface ComandaGateway {
  menu(scope: ComandaScope): Reply<ComandaMenu>;
  addGuest(scope: ComandaScope, number: number): Reply<GuestAdded>;
  send(
    scope: ComandaScope,
    participantId: string,
    request: QuoteOrderRequest,
  ): Reply<StaffOrderResponse>;
}
