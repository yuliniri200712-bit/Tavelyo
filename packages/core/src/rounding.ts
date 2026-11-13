/**
 * Modos de redondeo deterministas para importes enteros (ADR-0005). La sucursal elige uno.
 * - `half-up`: mitades alejándose de cero (2,5 → 3; −2,5 → −3).
 * - `half-even`: mitades al par más cercano (2,5 → 2; 3,5 → 4), «redondeo bancario».
 * - `toward-zero`: trunca (2,9 → 2; −2,9 → −2).
 * - `away-from-zero`: cualquier fracción aleja de cero (2,1 → 3; −2,1 → −3).
 */
export type RoundingMode = 'half-up' | 'half-even' | 'toward-zero' | 'away-from-zero';

/** Divide dos enteros y redondea el cociente según `mode`. El divisor no puede ser cero. */
export function divideRounded(numerator: bigint, denominator: bigint, mode: RoundingMode): bigint {
  if (denominator === 0n) {
    throw new RangeError('División entre cero');
  }
  const negative = numerator < 0n !== denominator < 0n;
  const n = numerator < 0n ? -numerator : numerator;
  const d = denominator < 0n ? -denominator : denominator;
  const quotient = n / d;
  const remainder = n % d;
  const magnitude = quotient + (shouldRoundAway(quotient, remainder, d, mode) ? 1n : 0n);
  return negative ? -magnitude : magnitude;
}

function shouldRoundAway(
  quotient: bigint,
  remainder: bigint,
  divisor: bigint,
  mode: RoundingMode,
): boolean {
  if (remainder === 0n) return false;
  const twice = remainder * 2n;
  switch (mode) {
    case 'toward-zero':
      return false;
    case 'away-from-zero':
      return true;
    case 'half-up':
      return twice >= divisor;
    case 'half-even':
      return twice > divisor || (twice === divisor && quotient % 2n === 1n);
  }
}
