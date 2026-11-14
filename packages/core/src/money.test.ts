import { describe, expect, it } from 'vitest';
import { CurrencyMismatchError, Money } from './money';

const cop = (minor: bigint) => Money.ofMinor(minor, 'COP');

function parse(amount: string, currency = 'COP'): Money {
  const result = Money.fromMinorString(amount, currency);
  if (!result.ok) throw new Error(`fixture inválido: ${amount}`);
  return result.value;
}

describe('Money: frontera de datos (Int64 como cadena)', () => {
  it('conserva exactamente valores mayores que 2^53', () => {
    const big = '9007199254740993'; // 2^53 + 1: un number de JavaScript no lo representa
    const money = parse(big);
    expect(money.amountMinor).toBe(9007199254740993n);
    expect(money.toMinorString()).toBe(big);
  });

  it('acepta cero y negativos canónicos', () => {
    expect(parse('0').toMinorString()).toBe('0');
    expect(parse('-1500').amountMinor).toBe(-1500n);
  });

  it.each(['', ' 1', '1 ', '+1', '01', '-0', '1.5', '1e3', '0x10', 'abc', '١٢'])(
    'rechaza la cadena no canónica %j',
    (input) => {
      expect(Money.fromMinorString(input, 'COP')).toEqual({
        ok: false,
        error: { kind: 'invalid-amount', input },
      });
    },
  );

  it('rechaza monedas no admitidas', () => {
    expect(Money.fromMinorString('100', 'XYZ')).toEqual({
      ok: false,
      error: { kind: 'unsupported-currency', input: 'XYZ' },
    });
  });
});

describe('Money: aritmética', () => {
  it('suma, resta, multiplica y niega sin perder precisión', () => {
    expect(cop(1500n).plus(cop(250n)).amountMinor).toBe(1750n);
    expect(cop(1500n).minus(cop(2000n)).amountMinor).toBe(-500n);
    expect(cop(1500n).times(3).amountMinor).toBe(4500n);
    expect(cop(9007199254740993n).times(2n).amountMinor).toBe(18014398509481986n);
    expect(cop(10n).negated().amountMinor).toBe(-10n);
  });

  it('es inmutable', () => {
    const base = cop(100n);
    base.plus(cop(1n));
    expect(base.amountMinor).toBe(100n);
  });

  it('impide operar entre monedas distintas', () => {
    const usd = Money.ofMinor(100n, 'USD');
    expect(() => cop(100n).plus(usd)).toThrow(CurrencyMismatchError);
    expect(() => cop(100n).minus(usd)).toThrow(CurrencyMismatchError);
    expect(() => cop(100n).compareTo(usd)).toThrow(CurrencyMismatchError);
    expect(cop(100n).equals(usd)).toBe(false);
  });

  it('rechaza cantidades que no son enteros seguros', () => {
    expect(() => cop(100n).times(1.5)).toThrow(RangeError);
    expect(() => cop(100n).times(Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
  });

  it('compara importes', () => {
    expect(cop(1n).compareTo(cop(2n))).toBe(-1);
    expect(cop(2n).compareTo(cop(2n))).toBe(0);
    expect(cop(3n).compareTo(cop(2n))).toBe(1);
    expect(cop(0n).isZero()).toBe(true);
    expect(cop(-1n).isNegative()).toBe(true);
  });
});

describe('Money: porcentajes en puntos básicos', () => {
  it('aplica 19 % (1900 pb) con redondeo explícito', () => {
    // 1 234 × 0,19 = 234,46
    expect(cop(1234n).applyBasisPoints(1900, 'half-up').amountMinor).toBe(234n);
    expect(cop(1234n).applyBasisPoints(1900, 'away-from-zero').amountMinor).toBe(235n);
  });

  it('distingue half-up de half-even en mitades exactas', () => {
    // 250 × 0,01 = 2,5 · 350 × 0,01 = 3,5
    expect(cop(250n).applyBasisPoints(100, 'half-up').amountMinor).toBe(3n);
    expect(cop(250n).applyBasisPoints(100, 'half-even').amountMinor).toBe(2n);
    expect(cop(350n).applyBasisPoints(100, 'half-even').amountMinor).toBe(4n);
    expect(cop(-250n).applyBasisPoints(100, 'half-up').amountMinor).toBe(-3n);
  });
});

describe('Money: reparto exacto', () => {
  it('reparte 100 en 3 partes iguales sumando exactamente 100', () => {
    const parts = cop(100n)
      .split(3)
      .map((m) => m.amountMinor);
    expect(parts).toEqual([34n, 33n, 33n]);
  });

  it('asigna el residuo por mayor resto y luego por índice', () => {
    // 10 con pesos 1:1:1:1 → restos iguales → el residuo va a las primeras partes
    expect(
      cop(10n)
        .allocate([1, 1, 1, 1])
        .map((m) => m.amountMinor),
    ).toEqual([3n, 3n, 2n, 2n]);
    // 100 con pesos 1:2 → 33,33 y 66,66 → la segunda tiene mayor resto
    expect(
      cop(100n)
        .allocate([1, 2])
        .map((m) => m.amountMinor),
    ).toEqual([33n, 67n]);
  });

  it('conserva el signo de importes negativos', () => {
    expect(
      cop(-100n)
        .split(3)
        .map((m) => m.amountMinor),
    ).toEqual([-34n, -33n, -33n]);
  });

  it('la suma de las partes es siempre exactamente el total', () => {
    const totals = [0n, 1n, 7n, 99n, 100n, 101n, 123456789n, 9007199254740993n, -55n];
    const weightSets = [
      [1],
      [1, 1],
      [1, 1, 1],
      [3, 7],
      [1, 0, 2],
      [5, 5, 5, 5, 5, 5, 5],
      [2, 3, 5, 7],
    ];
    for (const total of totals) {
      for (const weights of weightSets) {
        const parts = cop(total).allocate(weights);
        expect(parts).toHaveLength(weights.length);
        expect(parts.reduce((sum, m) => sum + m.amountMinor, 0n)).toBe(total);
      }
    }
  });

  it('una parte con peso cero no recibe nada', () => {
    expect(
      cop(100n)
        .allocate([1, 0, 1])
        .map((m) => m.amountMinor),
    ).toEqual([50n, 0n, 50n]);
  });

  it('rechaza repartos inválidos', () => {
    expect(() => cop(100n).allocate([])).toThrow(RangeError);
    expect(() => cop(100n).allocate([0, 0])).toThrow(RangeError);
    expect(() => cop(100n).allocate([1, -1])).toThrow(RangeError);
    expect(() => cop(100n).split(0)).toThrow(RangeError);
  });
});
