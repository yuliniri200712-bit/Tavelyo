import { err, ok } from '@tavelyo/core';
import {
  PaymentTimeoutError,
  type AuthorizeQuoteRequest,
  type AuthorizeQuoteResponse,
  type PaymentGateway,
  type PaymentResult,
  type SimulatedPaymentOutcome,
} from '@tavelyo/contracts';
import { canonicalUuid, type Clock } from '../shared/clock.ts';
import { isUuid, readFields } from '../shared/input.ts';
import { failure, type Actor, type Outcome } from '../shared/outcome.ts';
import { RATE_LIMITED_MESSAGE, RATE_LIMITS, type RateLimiter } from '../shared/rate-limit.ts';

export interface PayableQuote {
  readonly id: string;
  readonly tenantId: string;
  readonly status: 'QUOTED' | 'AUTHORIZED' | 'DECLINED' | 'EXPIRED';
  readonly currency: string;
  readonly totalMinor: string;
  readonly expiresAt: Date;
}

export interface PaymentQuoteStore {
  /** El resumen solo si es de quien llama, sigue en la mesa y la mesa está abierta. */
  forPayment(quoteId: string, authUid: string): Promise<PayableQuote | null>;
  setPayment(
    quote: PayableQuote,
    authUid: string,
    status: 'AUTHORIZED' | 'DECLINED',
    paymentRef: string,
  ): Promise<void>;
}

export interface AuthorizeQuoteDeps {
  readonly quotes: PaymentQuoteStore;
  readonly payments: PaymentGateway;
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
  const fields = readFields(data, ['quoteId', 'simulatedOutcome']);
  if (!fields.ok) return err(failure('invalid-argument', fields.error));
  const { quoteId, simulatedOutcome } = fields.value;
  if (!isUuid(quoteId)) return err(failure('invalid-argument', 'El pedido no es válido.'));
  if (simulatedOutcome === undefined) return ok({ quoteId: canonicalUuid(quoteId) });
  if (!simulated || !OUTCOMES.includes(simulatedOutcome as SimulatedPaymentOutcome)) {
    return err(failure('invalid-argument', 'La solicitud incluye campos no admitidos.'));
  }
  return ok({
    quoteId: canonicalUuid(quoteId),
    simulatedOutcome: simulatedOutcome as SimulatedPaymentOutcome,
  });
}

const NOT_FOUND = 'No encontramos ese pedido en tu mesa.';
const EXPIRED = 'El resumen del pedido venció. Revisa el pedido otra vez.';
const DECLINED = 'El pago fue rechazado. Revisa el pedido para intentarlo de nuevo.';
const NO_ANSWER = 'No pudimos confirmar el pago. Inténtalo de nuevo: no se cobrará dos veces.';

/**
 * Autoriza el importe de un resumen verificable (Fase 2: con el adaptador simulado, sin enviar
 * nada a cocina). El importe sale del resumen guardado, nunca del cliente. La clave de
 * idempotencia es el resumen: reintentar no autoriza dos veces. Si el proveedor no responde, se
 * consulta el estado antes de dar el resultado.
 */
export function createAuthorizeQuote(deps: AuthorizeQuoteDeps) {
  return async (actor: Actor, data: unknown): Promise<Outcome<AuthorizeQuoteResponse>> => {
    const input = parseAuthorizeQuoteInput(data, deps.payments.simulated);
    if (!input.ok) return input;

    if (!(await deps.limiter.admit(RATE_LIMITS.paymentPerUser, actor.uid))) {
      return err(failure('resource-exhausted', RATE_LIMITED_MESSAGE));
    }

    const quote = await deps.quotes.forPayment(input.value.quoteId, actor.uid);
    if (!quote) return err(failure('not-found', NOT_FOUND));
    const respond = (status: AuthorizeQuoteResponse['status']) =>
      ok({ quoteId: quote.id, status, simulated: deps.payments.simulated });
    if (quote.status === 'AUTHORIZED') return respond('authorized');
    if (quote.status === 'DECLINED') return err(failure('failed-precondition', DECLINED));
    if (quote.status === 'EXPIRED' || quote.expiresAt <= deps.clock.now()) {
      return err(failure('failed-precondition', EXPIRED));
    }

    const idempotencyKey = `quote_${quote.id}`;
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
    if (!result) return err(failure('unavailable', NO_ANSWER));

    switch (result.status) {
      case 'authorized':
        await deps.quotes.setPayment(quote, actor.uid, 'AUTHORIZED', result.paymentRef);
        return respond('authorized');
      case 'declined':
        await deps.quotes.setPayment(quote, actor.uid, 'DECLINED', result.paymentRef);
        return respond('declined');
      case 'requires_action':
        return respond('requires_action');
      default:
        throw new Error(`Estado inesperado al autorizar: ${result.status}`);
    }
  };
}
