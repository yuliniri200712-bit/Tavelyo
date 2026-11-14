import { describe, expect, it } from 'vitest';
import { compareUtcInstants, parseUtcInstant, type UtcInstant } from './utc-instant';

function instant(value: string): UtcInstant {
  const result = parseUtcInstant(value);
  if (!result.ok) throw new Error(`fixture inválido: ${value}`);
  return result.value;
}

describe('UtcInstant', () => {
  it.each(['2026-11-13T22:45:49Z', '2026-11-13T22:45:49.434Z', '2024-02-29T00:00:00Z'])(
    'acepta %s',
    (value) => {
      expect(parseUtcInstant(value).ok).toBe(true);
    },
  );

  it.each([
    '2026-11-13T22:45:49', // sin zona
    '2026-11-13T22:45:49+00:00', // desfase en lugar de Z
    '2026-11-13 22:45:49Z',
    '2026-02-31T00:00:00Z', // fecha inexistente
    '2025-02-29T00:00:00Z', // no bisiesto
    'ayer',
  ])('rechaza %s', (value) => {
    expect(parseUtcInstant(value)).toEqual({
      ok: false,
      error: { kind: 'invalid-utc-instant', input: value },
    });
  });

  it('compara por instante, no por texto', () => {
    const a = instant('2026-11-13T22:45:49.5Z');
    const b = instant('2026-11-13T22:45:49.434Z');
    expect(compareUtcInstants(a, b)).toBe(1);
    expect(compareUtcInstants(b, a)).toBe(-1);
    expect(compareUtcInstants(a, instant('2026-11-13T22:45:49.500Z'))).toBe(0);
  });
});
