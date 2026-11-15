import { describe, expect, it } from 'vitest';
import { Money } from './money';
import { parseMajorAmount, toMajorInput } from './money-input';

const minorOf = (text: string, currency: 'COP' | 'USD' | 'CLP' | 'KWD' = 'COP') => {
  const result = parseMajorAmount(text, currency);
  return result.ok ? result.value.amountMinor : result.error;
};

describe('parseMajorAmount', () => {
  it('pesos colombianos escritos de varias formas', () => {
    for (const text of ['25000', '25.000', '$ 25.000', ' $25.000 ', '25 000']) {
      expect(minorOf(text), text).toBe(2_500_000n);
    }
    expect(minorOf('1.234.567')).toBe(123_456_700n);
    expect(minorOf('0')).toBe(0n);
  });

  it('en COP no admite centavos', () => {
    expect(minorOf('25000,50')).toEqual({ kind: 'too-many-decimals', allowed: 0 });
  });

  it('otras monedas con su exponente', () => {
    expect(minorOf('19,99', 'USD')).toBe(1999n);
    expect(minorOf('19,9', 'USD')).toBe(1990n);
    expect(minorOf('19,999', 'USD')).toEqual({ kind: 'too-many-decimals', allowed: 2 });
    expect(minorOf('1.500', 'CLP')).toBe(1500n);
    expect(minorOf('1,005', 'KWD')).toBe(1005n);
  });

  it('rechaza lo que no es un importe positivo bien escrito', () => {
    expect(minorOf('')).toEqual({ kind: 'empty' });
    for (const text of ['-100', '25.00', '2.5000', '1e5', 'veinte', '25,', '12.345,6.7', '0x10']) {
      expect(minorOf(text), text).toEqual({ kind: 'invalid' });
    }
  });

  it('no pierde precisión con importes enormes', () => {
    expect(minorOf('90.071.992.547.409.931')).toBe(9_007_199_254_740_993_100n);
  });
});

describe('toMajorInput', () => {
  it('es el inverso para editar un importe guardado', () => {
    expect(toMajorInput(Money.ofMinor(2_500_000n, 'COP'))).toBe('25000');
    expect(toMajorInput(Money.ofMinor(2_500_050n, 'COP'))).toBe('25000,50');
    expect(toMajorInput(Money.ofMinor(1999n, 'USD'))).toBe('19,99');
    expect(toMajorInput(Money.ofMinor(1500n, 'CLP'))).toBe('1500');
  });
});
