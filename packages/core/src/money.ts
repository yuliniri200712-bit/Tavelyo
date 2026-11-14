import { isCurrencyCode, type CurrencyCode } from './currency';
import { err, ok, type Result } from './result';
import { divideRounded, type RoundingMode } from './rounding';

/** Puntos básicos en una unidad: 10 000 pb = 100 %. */
const BASIS_POINTS_PER_UNIT = 10_000n;

/** Cadena decimal canónica de un entero: sin signo «+», sin ceros a la izquierda y sin «-0». */
const CANONICAL_INTEGER = /^(?:0|-?[1-9]\d*)$/;

export class CurrencyMismatchError extends Error {
  constructor(left: CurrencyCode, right: CurrencyCode) {
    super(`No se pueden operar importes en monedas distintas: ${left} y ${right}`);
    this.name = 'CurrencyMismatchError';
  }
}

export type MoneyParseError =
  | { readonly kind: 'invalid-amount'; readonly input: string }
  | { readonly kind: 'unsupported-currency'; readonly input: string };

/**
 * Importe inmutable en unidades menores de una moneda ISO 4217 (ADR-0005).
 * El importe es `bigint`: nunca se convierte a `number`. En la frontera de datos
 * (SQL Connect `Int64`) viaja como cadena decimal canónica.
 */
export class Money {
  readonly amountMinor: bigint;
  readonly currency: CurrencyCode;

  private constructor(amountMinor: bigint, currency: CurrencyCode) {
    this.amountMinor = amountMinor;
    this.currency = currency;
  }

  static ofMinor(amountMinor: bigint, currency: CurrencyCode): Money {
    return new Money(amountMinor, currency);
  }

  static zero(currency: CurrencyCode): Money {
    return new Money(0n, currency);
  }

  /** Construye un importe desde la cadena que entrega SQL Connect (`Int64String`). */
  static fromMinorString(amountMinor: string, currency: string): Result<Money, MoneyParseError> {
    if (!isCurrencyCode(currency)) {
      return err({ kind: 'unsupported-currency', input: currency });
    }
    if (!CANONICAL_INTEGER.test(amountMinor)) {
      return err({ kind: 'invalid-amount', input: amountMinor });
    }
    return ok(new Money(BigInt(amountMinor), currency));
  }

  /** Cadena decimal canónica para enviar a SQL Connect o al backend. */
  toMinorString(): string {
    return this.amountMinor.toString();
  }

  plus(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amountMinor + other.amountMinor, this.currency);
  }

  minus(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amountMinor - other.amountMinor, this.currency);
  }

  /** Multiplica por una cantidad entera (p. ej. unidades de un producto). */
  times(quantity: bigint | number): Money {
    return new Money(this.amountMinor * toInteger(quantity, 'quantity'), this.currency);
  }

  negated(): Money {
    return new Money(-this.amountMinor, this.currency);
  }

  isZero(): boolean {
    return this.amountMinor === 0n;
  }

  isNegative(): boolean {
    return this.amountMinor < 0n;
  }

  /** −1, 0 o 1. Lanza si las monedas difieren. */
  compareTo(other: Money): -1 | 0 | 1 {
    this.assertSameCurrency(other);
    if (this.amountMinor === other.amountMinor) return 0;
    return this.amountMinor < other.amountMinor ? -1 : 1;
  }

  equals(other: Money): boolean {
    return this.currency === other.currency && this.amountMinor === other.amountMinor;
  }

  /** Porcentaje expresado en puntos básicos enteros (1 pb = 0,01 %), con redondeo explícito. */
  applyBasisPoints(basisPoints: bigint | number, mode: RoundingMode): Money {
    const bp = toInteger(basisPoints, 'basisPoints');
    return new Money(
      divideRounded(this.amountMinor * bp, BASIS_POINTS_PER_UNIT, mode),
      this.currency,
    );
  }

  /**
   * Reparte el importe en partes proporcionales a `weights` cuya suma es **exactamente**
   * el total. Cada parte recibe primero su cociente entero; las unidades menores que sobran
   * se asignan una a una a las partes con mayor resto y, a igual resto, a la de menor índice.
   * Con importes negativos se reparte el valor absoluto y se conserva el signo.
   */
  allocate(weights: readonly (bigint | number)[]): Money[] {
    const ws = weights.map((w) => toInteger(w, 'weight'));
    if (ws.length === 0) {
      throw new RangeError('Se necesita al menos una parte');
    }
    if (ws.some((w) => w < 0n)) {
      throw new RangeError('Los pesos no pueden ser negativos');
    }
    const total = ws.reduce((sum, w) => sum + w, 0n);
    if (total === 0n) {
      throw new RangeError('La suma de los pesos debe ser positiva');
    }
    const sign = this.amountMinor < 0n ? -1n : 1n;
    const magnitude = this.amountMinor * sign;
    const parts = ws.map((w, index) => ({
      index,
      share: (magnitude * w) / total,
      remainder: (magnitude * w) % total,
    }));
    let leftover = magnitude - parts.reduce((sum, p) => sum + p.share, 0n);
    const byRemainder = [...parts].sort((a, b) =>
      a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1,
    );
    for (const part of byRemainder) {
      if (leftover === 0n) break;
      part.share += 1n;
      leftover -= 1n;
    }
    return parts.map((p) => new Money(p.share * sign, this.currency));
  }

  /** Reparto en `count` partes iguales con la misma regla de residuo que `allocate`. */
  split(count: number): Money[] {
    if (!Number.isSafeInteger(count) || count < 1) {
      throw new RangeError('El número de partes debe ser un entero positivo');
    }
    return this.allocate(Array.from({ length: count }, () => 1n));
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError(this.currency, other.currency);
    }
  }
}

function toInteger(value: bigint | number, name: string): bigint {
  if (typeof value === 'bigint') return value;
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${name} debe ser un entero seguro`);
  }
  return BigInt(value);
}
