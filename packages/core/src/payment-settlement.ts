import { Money } from './money';
import { err, ok, type Result } from './result';

/**
 * Cuánto capturar y cuánto liberar de cada preautorización, y cuánto se puede reembolsar (PM §8).
 * Lógica pura: el backend la aplica en la misma transacción que guarda la operación.
 */

/** Estados de PaymentAuthorization (dataconnect/schema/cuenta.gql). */
export type AuthorizationStatus = 'AUTHORIZED' | 'CAPTURED' | 'VOIDED' | 'EXPIRED';

export interface AuthorizationState {
  readonly status: AuthorizationStatus;
  readonly authorized: Money;
  readonly captured: Money;
  /** Vencimiento que informó la pasarela, en milisegundos UTC; null si no lo informó. */
  readonly expiresAtMs: number | null;
}

/** Lo que la pasarela permite (ADR-0006): solo se usa lo declarado y probado. */
export interface CaptureCapabilities {
  /** Capturar menos de lo autorizado y liberar el resto en la misma operación. */
  readonly partialCapture: boolean;
}

export interface SettlementPlan {
  /** Lo que se captura de esta preautorización (puede ser cero). */
  readonly capture: Money;
  /** Lo que se libera: lo autorizado que no se captura. */
  readonly release: Money;
  /** Consumo que esta preautorización no cubre: hace falta otro pago (PM §8, paso 5). */
  readonly shortfall: Money;
}

export type SettlementError =
  | { readonly kind: 'not-authorized'; readonly status: AuthorizationStatus }
  | { readonly kind: 'expired' }
  | { readonly kind: 'invalid-amount' }
  | { readonly kind: 'partial-capture-unsupported' };

/**
 * Plan para saldar `due` con una preautorización vigente: se captura lo que cubre (nunca más de lo
 * autorizado) y se libera el resto. Vencida o ya usada, no se captura: hace falta otro pago (PM §8,
 * paso 9). Si `due` es cero (todo cancelado o pagado en efectivo), solo se libera.
 */
export function planSettlement(
  authorization: AuthorizationState,
  due: Money,
  nowMs: number,
  capabilities: CaptureCapabilities,
): Result<SettlementPlan, SettlementError> {
  if (authorization.status !== 'AUTHORIZED') {
    return err({ kind: 'not-authorized', status: authorization.status });
  }
  if (authorization.expiresAtMs !== null && nowMs >= authorization.expiresAtMs) {
    return err({ kind: 'expired' });
  }
  if (due.currency !== authorization.authorized.currency || due.isNegative()) {
    return err({ kind: 'invalid-amount' });
  }
  const available = authorization.authorized.minus(authorization.captured);
  const capture = due.compareTo(available) < 0 ? due : available;
  const release = available.minus(capture);
  if (!capture.isZero() && !release.isZero() && !capabilities.partialCapture) {
    return err({ kind: 'partial-capture-unsupported' });
  }
  return ok({ capture, release, shortfall: due.minus(capture) });
}

/** Estados de Refund (dataconnect/schema/cuenta.gql). */
export type RefundStatus = 'REQUESTED' | 'PROCESSING' | 'CONFIRMED' | 'REJECTED' | 'UNKNOWN';

export interface RefundInput {
  readonly status: RefundStatus;
  readonly amount: Money;
}

/**
 * Lo que aún se puede reembolsar de un pago: lo pagado menos los reembolsos confirmados y los que
 * siguen en curso o sin respuesta (para no pasarse si terminan confirmándose). Los rechazados no
 * cuentan.
 */
export function refundableAmount(paid: Money, refunds: readonly RefundInput[]): Money {
  return refunds
    .filter((refund) => refund.status !== 'REJECTED')
    .reduce((left, refund) => left.minus(refund.amount), paid);
}

export type RefundError =
  | { readonly kind: 'invalid-amount' }
  | { readonly kind: 'exceeds-refundable'; readonly refundable: Money }
  | { readonly kind: 'exceeds-limit'; readonly limit: Money };

/**
 * Valida un reembolso pedido (caso 10): positivo, no mayor que lo reembolsable y, si el rol tiene
 * tope (payment.refund 🔸), no mayor que el tope.
 */
export function validateRefund(
  paid: Money,
  refunds: readonly RefundInput[],
  requested: Money,
  limit: Money | null,
): Result<Money, RefundError> {
  if (requested.currency !== paid.currency || requested.isNegative() || requested.isZero()) {
    return err({ kind: 'invalid-amount' });
  }
  const refundable = refundableAmount(paid, refunds);
  if (requested.compareTo(refundable) > 0) return err({ kind: 'exceeds-refundable', refundable });
  if (limit && requested.compareTo(limit) > 0) return err({ kind: 'exceeds-limit', limit });
  return ok(requested);
}
