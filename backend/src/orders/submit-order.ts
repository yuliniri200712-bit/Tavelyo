import { err, ok } from '@tavelyo/core';
import type { SubmitOrderRequest, SubmitOrderResponse } from '@tavelyo/contracts';
import { canonicalUuid, type Clock } from '../shared/clock.ts';
import { isUuid, readFields } from '../shared/input.ts';
import { failure, type Actor, type Outcome } from '../shared/outcome.ts';
import { RATE_LIMITED_MESSAGE, RATE_LIMITS, type RateLimiter } from '../shared/rate-limit.ts';
import type { ConfirmedQuote, KitchenDispatcher, OrderApprovalMode } from './send-to-kitchen.ts';

/** Estados del resumen. AUTHORIZED, DECLINED y RELEASE_PENDING son de antes de ADR-0012. */
export type SubmittableQuoteStatus =
  'QUOTED' | 'CONFIRMED' | 'AUTHORIZED' | 'DECLINED' | 'EXPIRED' | 'RELEASE_PENDING';

/** Resumen de quien llama, con el estado de su mesa, de su participación y el modo de la sucursal. */
export interface SubmittableQuote extends ConfirmedQuote {
  readonly status: SubmittableQuoteStatus;
  readonly currency: string;
  readonly totalMinor: string;
  readonly expiresAt: Date;
  readonly sessionOpen: boolean;
  readonly participantRemoved: boolean;
  readonly participantExpiresAt: Date;
  readonly orderApproval: OrderApprovalMode;
}

export interface SubmitQuoteStore {
  /** El resumen solo si es de quien llama (aunque la mesa ya se haya cerrado). */
  forSubmit(quoteId: string, authUid: string): Promise<SubmittableQuote | null>;
  /** QUOTED → CONFIRMED, con auditoría. false si ya cambió (otra solicitud lo confirmó o venció). */
  confirm(quote: SubmittableQuote, authUid: string): Promise<boolean>;
}

export interface SubmitOrderDeps {
  readonly quotes: SubmitQuoteStore;
  readonly dispatch: KitchenDispatcher;
  readonly limiter: RateLimiter;
  readonly clock: Clock;
}

export function parseSubmitOrderInput(data: unknown): Outcome<SubmitOrderRequest> {
  const fields = readFields(data, ['quoteId']);
  if (!fields.ok) return err(failure('invalid-argument', fields.error));
  const { quoteId } = fields.value;
  if (!isUuid(quoteId)) return err(failure('invalid-argument', 'El pedido no es válido.'));
  return ok({ quoteId: canonicalUuid(quoteId) });
}

/** La mesa sigue abierta y la persona sigue en ella: condición para enviar. */
export function isSeated(quote: SubmittableQuote, now: Date): boolean {
  return quote.sessionOpen && !quote.participantRemoved && quote.participantExpiresAt > now;
}

const NOT_FOUND = 'No encontramos ese pedido en tu mesa.';
const EXPIRED = 'El resumen del pedido venció. Revisa el pedido otra vez.';
const NO_LONGER = 'Este pedido ya no se puede enviar. Revisa el pedido otra vez.';
const REJECTED = 'El mesero no aprobó este pedido. Revisa el motivo en «Mis pedidos».';
const WITHDRAWN = 'Retiraste este pedido.';
export const NOT_SENT = 'El pedido no se envió porque la mesa se cerró o ya no estás en ella.';

/**
 * «Enviar pedido» (ADR-0012): el comensal confirma su resumen verificable y el pedido se crea y,
 * según su sucursal (D-32), llega a cocina o queda pendiente del mesero. No hay pasarela: se paga
 * al final en el restaurante. El resumen es la clave de idempotencia: reintentar no crea dos
 * pedidos, y si una caída dejó el resumen confirmado sin pedido, repetir la llamada termina el
 * trabajo. Si la mesa o la persona ya no están vigentes, no se envía nada.
 */
export function createSubmitOrder(deps: SubmitOrderDeps) {
  const deliver = async (
    quote: SubmittableQuote,
    authUid: string,
  ): Promise<Outcome<SubmitOrderResponse>> => {
    if (!isSeated(quote, deps.clock.now())) return err(failure('failed-precondition', NOT_SENT));
    const result = await deps.dispatch(quote, authUid, quote.orderApproval);
    switch (result.kind) {
      case 'sent':
        return ok({ quoteId: quote.id, status: 'sent', orderId: result.orderId });
      case 'pending_approval':
        return ok({ quoteId: quote.id, status: 'pending_approval', orderId: result.orderId });
      case 'closed':
        return err(
          failure('failed-precondition', result.approval === 'REJECTED' ? REJECTED : WITHDRAWN),
        );
      case 'rejected':
        return err(failure('failed-precondition', NOT_SENT));
    }
  };

  return async (actor: Actor, data: unknown): Promise<Outcome<SubmitOrderResponse>> => {
    const input = parseSubmitOrderInput(data);
    if (!input.ok) return input;

    if (!(await deps.limiter.admit(RATE_LIMITS.submitPerUser, actor.uid))) {
      return err(failure('resource-exhausted', RATE_LIMITED_MESSAGE));
    }

    const quote = await deps.quotes.forSubmit(input.value.quoteId, actor.uid);
    if (!quote) return err(failure('not-found', NOT_FOUND));

    switch (quote.status) {
      case 'CONFIRMED':
      case 'AUTHORIZED':
        return deliver(quote, actor.uid);
      case 'DECLINED':
      case 'RELEASE_PENDING':
        return err(failure('failed-precondition', NO_LONGER));
      case 'EXPIRED':
        return err(failure('failed-precondition', EXPIRED));
      case 'QUOTED':
        break;
    }
    if (!isSeated(quote, deps.clock.now())) return err(failure('not-found', NOT_FOUND));
    if (quote.expiresAt <= deps.clock.now()) return err(failure('failed-precondition', EXPIRED));

    if (await deps.quotes.confirm(quote, actor.uid)) {
      return deliver({ ...quote, status: 'CONFIRMED' }, actor.uid);
    }
    // Otra solicitud simultánea lo confirmó (doble pulsación) o venció justo ahora.
    const latest = await deps.quotes.forSubmit(quote.id, actor.uid);
    if (latest?.status === 'CONFIRMED') return deliver(latest, actor.uid);
    return err(failure('failed-precondition', EXPIRED));
  };
}
