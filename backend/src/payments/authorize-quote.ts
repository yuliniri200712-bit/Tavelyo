import { err, ok } from '@tavelyo/core';
import {
  PaymentTimeoutError,
  PREAUTHORIZATION_CONSENT_VERSION,
  type AuthorizeQuoteRequest,
  type AuthorizeQuoteResponse,
  type PaymentGateway,
  type PaymentResult,
  type SimulatedPaymentOutcome,
} from '@tavelyo/contracts';
import type { AuthorizedQuote, KitchenDispatcher } from '../orders/send-to-kitchen.ts';
import { canonicalUuid, type Clock } from '../shared/clock.ts';
import { isUuid, readFields } from '../shared/input.ts';
import { failure, type Actor, type Outcome } from '../shared/outcome.ts';
import { RATE_LIMITED_MESSAGE, RATE_LIMITS, type RateLimiter } from '../shared/rate-limit.ts';
import { isClosed, operationKeys, type ConfirmedHold, type PaymentLedger } from './ledger.ts';

export type PayableQuoteStatus =
  'QUOTED' | 'AUTHORIZED' | 'DECLINED' | 'EXPIRED' | 'RELEASE_PENDING';

/** Resumen de quien llama, con el estado de su mesa y de su participación. */
export interface PayableQuote extends AuthorizedQuote {
  readonly status: PayableQuoteStatus;
  readonly currency: string;
  readonly totalMinor: string;
  readonly expiresAt: Date;
  readonly sessionOpen: boolean;
  readonly participantRemoved: boolean;
  readonly participantExpiresAt: Date;
}

export interface PaymentQuoteStore {
  /** El resumen solo si es de quien llama (aunque la mesa ya se haya cerrado). */
  forPayment(quoteId: string, authUid: string): Promise<PayableQuote | null>;
  /**
   * Autorización confirmada: el resumen queda AUTHORIZED, nace su PaymentAuthorization y la
   * operación se cierra, todo en una transacción. false si otra llamada ya la registró.
   */
  setAuthorized(
    quote: PayableQuote,
    operationId: string,
    authUid: string,
    hold: ConfirmedHold,
    consentTextVersion: string,
  ): Promise<boolean>;
  /** Autorización rechazada: el resumen queda DECLINED y la operación FAILED. */
  setDeclined(
    quote: PayableQuote,
    operationId: string,
    authUid: string,
    paymentRef: string,
    consentTextVersion: string,
  ): Promise<boolean>;
  /** Autorizado pero no enviado a cocina: la retención queda para liberar (Fase 4). */
  markReleasePending(quote: PayableQuote, authUid: string): Promise<void>;
}

export interface AuthorizeQuoteDeps {
  readonly quotes: PaymentQuoteStore;
  readonly payments: PaymentGateway;
  readonly ledger: Pick<PaymentLedger, 'begin' | 'markUnknown'>;
  readonly dispatch: KitchenDispatcher;
  readonly limiter: RateLimiter;
  readonly clock: Clock;
}

const OUTCOMES: readonly SimulatedPaymentOutcome[] = [
  'approved',
  'declined',
  'requires_action',
  'timeout',
];

export function parseAuthorizeQuoteInput(
  data: unknown,
  simulated: boolean,
): Outcome<AuthorizeQuoteRequest> {
  const fields = readFields(data, ['quoteId', 'consentTextVersion', 'simulatedOutcome']);
  if (!fields.ok) return err(failure('invalid-argument', fields.error));
  const { quoteId, consentTextVersion, simulatedOutcome } = fields.value;
  if (!isUuid(quoteId)) return err(failure('invalid-argument', 'El pedido no es válido.'));
  if (typeof consentTextVersion !== 'string' || consentTextVersion.length > 40) {
    return err(failure('invalid-argument', 'Falta aceptar el texto de la autorización.'));
  }
  const request = { quoteId: canonicalUuid(quoteId), consentTextVersion };
  if (simulatedOutcome === undefined) return ok(request);
  if (!simulated || !OUTCOMES.includes(simulatedOutcome as SimulatedPaymentOutcome)) {
    return err(failure('invalid-argument', 'La solicitud incluye campos no admitidos.'));
  }
  return ok({ ...request, simulatedOutcome: simulatedOutcome as SimulatedPaymentOutcome });
}

/** La mesa sigue abierta y la persona sigue en ella: condición para autorizar y para enviar. */
export function isSeated(quote: PayableQuote, now: Date): boolean {
  return quote.sessionOpen && !quote.participantRemoved && quote.participantExpiresAt > now;
}

const NOT_FOUND = 'No encontramos ese pedido en tu mesa.';
const EXPIRED = 'El resumen del pedido venció. Revisa el pedido otra vez.';
const DECLINED = 'El pago fue rechazado. Revisa el pedido para intentarlo de nuevo.';
const NO_ANSWER = 'No pudimos confirmar el pago. Inténtalo de nuevo: no se cobrará dos veces.';
const CONSENT_CHANGED =
  'El texto de la autorización cambió. Revisa el pedido y vuelve a autorizarlo.';
export const NOT_SENT =
  'El pedido no se envió a cocina porque la mesa se cerró o ya no estás en ella. ' +
  'La reserva de tu pago se liberará.';

/**
 * Autoriza el importe de un resumen verificable y, solo si la autorización se confirma, crea el
 * pedido y lo envía a cocina (D-04). El importe sale del resumen guardado, nunca del cliente, y
 * la clave de idempotencia es el resumen: reintentar no autoriza dos veces ni crea dos pedidos.
 * Antes de llamar a la pasarela se guarda la operación AUTHORIZE (PM §8): si la respuesta se pierde
 * y la consulta no la encuentra, queda UNKNOWN y la conciliación la resuelve (caso 7).
 * Si una caída dejó el resumen autorizado sin pedido, repetir la llamada termina el envío. Si la
 * mesa o la persona ya no están vigentes, no se envía nada y la retención queda para liberar.
 */
export function createAuthorizeQuote(deps: AuthorizeQuoteDeps) {
  return async (actor: Actor, data: unknown): Promise<Outcome<AuthorizeQuoteResponse>> => {
    const input = parseAuthorizeQuoteInput(data, deps.payments.simulated);
    if (!input.ok) return input;
    if (input.value.consentTextVersion !== PREAUTHORIZATION_CONSENT_VERSION) {
      return err(failure('failed-precondition', CONSENT_CHANGED));
    }

    if (!(await deps.limiter.admit(RATE_LIMITS.paymentPerUser, actor.uid))) {
      return err(failure('resource-exhausted', RATE_LIMITED_MESSAGE));
    }

    const quote = await deps.quotes.forPayment(input.value.quoteId, actor.uid);
    if (!quote) return err(failure('not-found', NOT_FOUND));
    const simulated = deps.payments.simulated;

    const sendToKitchen = async (): Promise<Outcome<AuthorizeQuoteResponse>> => {
      const result = isSeated(quote, deps.clock.now())
        ? await deps.dispatch(quote, actor.uid)
        : ({ kind: 'rejected' } as const);
      if (result.kind === 'sent') {
        return ok({ quoteId: quote.id, status: 'authorized', orderId: result.orderId, simulated });
      }
      await deps.quotes.markReleasePending(quote, actor.uid);
      return err(failure('failed-precondition', NOT_SENT));
    };

    switch (quote.status) {
      case 'AUTHORIZED':
        return sendToKitchen();
      case 'RELEASE_PENDING':
        return err(failure('failed-precondition', NOT_SENT));
      case 'DECLINED':
        return err(failure('failed-precondition', DECLINED));
      case 'EXPIRED':
        return err(failure('failed-precondition', EXPIRED));
      case 'QUOTED':
        break;
    }
    if (!isSeated(quote, deps.clock.now())) return err(failure('not-found', NOT_FOUND));
    if (quote.expiresAt <= deps.clock.now()) return err(failure('failed-precondition', EXPIRED));

    const idempotencyKey = operationKeys.authorizeQuote(quote.id);
    const { operation } = await deps.ledger.begin({
      tenantId: quote.tenantId,
      branchId: quote.branchId,
      kind: 'AUTHORIZE',
      idempotencyKey,
      currency: quote.currency,
      amountMinor: quote.totalMinor,
      providerRef: null,
      quoteId: quote.id,
    });
    // Cerrada con el resumen aún sin autorizar: la resolvió la conciliación tras vencer el resumen.
    if (isClosed(operation.status)) return err(failure('failed-precondition', EXPIRED));

    let result: PaymentResult | null;
    try {
      result = await deps.payments.authorize({
        amount: { amountMinor: quote.totalMinor, currency: quote.currency },
        idempotencyKey,
        reference: quote.id,
        ...(input.value.simulatedOutcome ? { simulatedOutcome: input.value.simulatedOutcome } : {}),
      });
    } catch (error) {
      if (!(error instanceof PaymentTimeoutError)) throw error;
      result = await deps.payments.status(idempotencyKey);
    }
    if (!result) {
      await deps.ledger.markUnknown(operation);
      return err(failure('unavailable', NO_ANSWER));
    }

    const consent = input.value.consentTextVersion;
    switch (result.status) {
      case 'authorized': {
        const hold = {
          provider: deps.payments.provider,
          paymentRef: result.paymentRef,
          expiresAt: result.expiresAt ? new Date(result.expiresAt) : null,
        };
        // Si otra llamada simultánea ya la registró, el envío a cocina sigue siendo uno solo.
        await deps.quotes.setAuthorized(quote, operation.id, actor.uid, hold, consent);
        return sendToKitchen();
      }
      case 'declined':
        await deps.quotes.setDeclined(quote, operation.id, actor.uid, result.paymentRef, consent);
        return ok({ quoteId: quote.id, status: 'declined', simulated });
      case 'requires_action':
        return ok({ quoteId: quote.id, status: 'requires_action', simulated });
      default:
        throw new Error(`Estado inesperado al autorizar: ${result.status}`);
    }
  };
}
