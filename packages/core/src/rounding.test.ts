import { describe, expect, it } from 'vitest';
import { divideRounded, type RoundingMode } from './rounding';

describe('divideRounded', () => {
  // [numerador, divisor, half-up, half-even, toward-zero, away-from-zero]
  const cases: [bigint, bigint, bigint, bigint, bigint, bigint][] = [
    [7n, 2n, 4n, 4n, 3n, 4n], // 3,5
    [5n, 2n, 3n, 2n, 2n, 3n], // 2,5
    [-5n, 2n, -3n, -2n, -2n, -3n], // −2,5
    [5n, -2n, -3n, -2n, -2n, -3n], // divisor negativo
    [29n, 10n, 3n, 3n, 2n, 3n], // 2,9
    [21n, 10n, 2n, 2n, 2n, 3n], // 2,1
    [10n, 5n, 2n, 2n, 2n, 2n], // exacto
    [0n, 3n, 0n, 0n, 0n, 0n],
  ];
  const modes: RoundingMode[] = ['half-up', 'half-even', 'toward-zero', 'away-from-zero'];

  for (const [n, d, ...expected] of cases) {
    modes.forEach((mode, i) => {
      it(`${n}/${d} con ${mode} = ${expected[i]}`, () => {
        expect(divideRounded(n, d, mode)).toBe(expected[i]);
      });
    });
  }

  it('rechaza la división entre cero', () => {
    expect(() => divideRounded(1n, 0n, 'half-up')).toThrow(RangeError);
  });
});
