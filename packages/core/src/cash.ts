import { Money } from './money';
import { err, ok, type Result } from './result';

/**
 * Caja (RF-PA-07): cambio de un cobro en efectivo, efectivo esperado del turno y conteo de cierre.
 * Lógica pura que usa el servidor al registrar cada movimiento y al cerrar.
 */

export type ChangeError =
  { readonly kind: 'invalid-amount' } | { readonly kind: 'insufficient'; readonly missing: Money };

/** Cambio que se entrega: lo recibido menos lo que se cobra. Si no alcanza, dice cuánto falta. */
export function cashChange(due: Money, received: Money): Result<Money, ChangeError> {
  if (due.currency !== received.currency || due.isNegative() || received.isNegative()) {
    return err({ kind: 'invalid-amount' });
  }
  const change = received.minus(due);
  if (change.isNegative()) return err({ kind: 'insufficient', missing: change.negated() });
  return ok(change);
}

/** Tipos de CashMovement (dataconnect/schema/caja.gql). */
export type CashMovementKind = 'CASH_IN' | 'CASH_OUT' | 'SALE' | 'REFUND';

export interface CashMovementInput {
  readonly kind: CashMovementKind;
  /** Siempre positivo: el tipo dice si entra o sale. */
  readonly amount: Money;
}

const INFLOWS: ReadonlySet<CashMovementKind> = new Set(['CASH_IN', 'SALE']);

/**
 * Efectivo que debería haber en la caja: el fondo inicial más entradas y ventas, menos salidas y
 * reembolsos entregados en efectivo.
 */
export function expectedCash(openingFloat: Money, movements: readonly CashMovementInput[]): Money {
  return movements.reduce((sum, movement) => {
    if (movement.amount.isNegative()) {
      throw new RangeError('Un movimiento de caja no puede ser negativo');
    }
    return INFLOWS.has(movement.kind) ? sum.plus(movement.amount) : sum.minus(movement.amount);
  }, openingFloat);
}

export interface CashCountResult {
  readonly expected: Money;
  readonly counted: Money;
  /** Contado menos esperado: positivo si sobra, negativo si falta. */
  readonly difference: Money;
}

export type CashCountError =
  | { readonly kind: 'invalid-amount' }
  | { readonly kind: 'reason-required'; readonly difference: Money };

/** Mínimo de caracteres del motivo de una diferencia (sin contar espacios al inicio y al final). */
export const CASH_REASON_MIN = 5;

/**
 * Conteo de cierre: guarda lo esperado, lo contado y la diferencia. Una diferencia distinta de cero
 * exige un motivo (state-machines.md §5).
 */
export function closeCashCount(
  expected: Money,
  counted: Money,
  reason: string | null,
): Result<CashCountResult, CashCountError> {
  if (counted.currency !== expected.currency || counted.isNegative()) {
    return err({ kind: 'invalid-amount' });
  }
  const difference = counted.minus(expected);
  if (!difference.isZero() && (reason?.trim().length ?? 0) < CASH_REASON_MIN) {
    return err({ kind: 'reason-required', difference });
  }
  return ok({ expected, counted, difference });
}
