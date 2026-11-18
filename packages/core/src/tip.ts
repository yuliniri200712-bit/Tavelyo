import { wholeUnitMinor } from './bill';
import { Money } from './money';
import { err, ok, type Result } from './result';
import { divideRounded } from './rounding';

/**
 * Propina voluntaria (D-05): se ofrece al pagar la cuenta, sugerida en 10 %; la persona la cambia
 * o la quita, y nunca se incluye sin que la elija. No forma parte de la preautorización.
 */

/** Propina sugerida: 10 % (1000 puntos básicos). */
export const SUGGESTED_TIP_BASIS_POINTS = 1_000;

/**
 * Propina sugerida sobre el consumo, redondeada a la unidad entera de la moneda (en COP, al peso)
 * con mitades hacia arriba: en efectivo no circulan fracciones.
 */
export function suggestTip(consumption: Money, basisPoints = SUGGESTED_TIP_BASIS_POINTS): Money {
  if (consumption.isNegative()) throw new RangeError('El consumo no puede ser negativo');
  if (!Number.isSafeInteger(basisPoints) || basisPoints < 0) {
    throw new RangeError('La tasa debe ser un entero no negativo');
  }
  const unit = wholeUnitMinor(consumption.currency);
  const exact = consumption.amountMinor * BigInt(basisPoints);
  const units = divideRounded(exact, 10_000n * unit, 'half-up');
  return Money.ofMinor(units * unit, consumption.currency);
}

export type TipError =
  | { readonly kind: 'invalid-amount' }
  | { readonly kind: 'not-whole-unit' }
  | { readonly kind: 'exceeds-consumption' };

/**
 * Valida la propina que eligió la persona: cero o positiva, en unidades enteras de la moneda y no
 * mayor que el consumo. Ese tope evita errores al escribir (un cero de más); una propina mayor se
 * puede dar en efectivo fuera de la cuenta.
 */
export function validateTip(tip: Money, consumption: Money): Result<Money, TipError> {
  if (tip.currency !== consumption.currency || tip.isNegative()) {
    return err({ kind: 'invalid-amount' });
  }
  if (tip.amountMinor % wholeUnitMinor(tip.currency) !== 0n) return err({ kind: 'not-whole-unit' });
  if (tip.compareTo(consumption) > 0) return err({ kind: 'exceeds-consumption' });
  return ok(tip);
}
