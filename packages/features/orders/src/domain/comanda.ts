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
  readonly people: readonly {
    readonly id: string;
    readonly label: string;
    readonly guestNumber: number | null;
  }[];
}
type Reply<T> = Promise<Result<T, OrdersError>>;
export interface ComandaGateway {
  menu(scope: ComandaScope): Reply<ComandaMenu>;
  addGuest(scope: ComandaScope, number: number): Reply<string>;
  send(
    scope: ComandaScope,
    participantId: string,
    request: QuoteOrderRequest,
  ): Reply<StaffOrderResponse>;
}
