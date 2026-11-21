import { describe, expect, it } from 'vitest';
import { nitCheckDigit, parseNit } from './nit';

describe('NIT con dígito de verificación (DIAN)', () => {
  it.each([
    ['800197268', 4], // NIT de la DIAN
    ['890903938', 8],
    ['860034313', 7],
    ['1', 8],
    ['10', 4],
  ])('el DV de %s es %i', (number, dv) => {
    expect(nitCheckDigit(number)).toBe(dv);
  });

  it('acepta puntos y espacios, y guarda la forma «número-DV»', () => {
    expect(parseNit(' 800.197.268-4 ')).toEqual({
      number: '800197268',
      checkDigit: 4,
      formatted: '800197268-4',
    });
  });

  it.each([
    ['800197268-5', 'DV equivocado'],
    ['8001972684', 'sin guion'],
    ['80019-1', 'muy corto'],
    ['12345678901-0', 'muy largo'],
    ['800197268-', 'sin DV'],
    ['NIT 800197268-4', 'con letras'],
    ['', 'vacío'],
  ])('rechaza %s (%s)', (text) => {
    expect(parseNit(text)).toBeNull();
  });
});
