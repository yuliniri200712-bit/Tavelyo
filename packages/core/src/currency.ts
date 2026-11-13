/**
 * Monedas ISO 4217 admitidas y su exponente (número de decimales de la unidad menor).
 * El país inicial está pendiente (D-01): la tabla incluye las monedas candidatas y
 * casos de 0 y 3 decimales para garantizar el soporte que exige ADR-0005.
 * Añadir una moneda exige confirmar su exponente en la norma ISO 4217 vigente.
 */
const CURRENCY_EXPONENTS = {
  ARS: 2,
  BHD: 3,
  BRL: 2,
  CLP: 0,
  COP: 2,
  EUR: 2,
  JPY: 0,
  KWD: 3,
  MXN: 2,
  PEN: 2,
  USD: 2,
} as const satisfies Record<string, 0 | 2 | 3>;

export type CurrencyCode = keyof typeof CURRENCY_EXPONENTS;

export function isCurrencyCode(value: string): value is CurrencyCode {
  return Object.hasOwn(CURRENCY_EXPONENTS, value);
}

export function currencyExponent(code: CurrencyCode): number {
  return CURRENCY_EXPONENTS[code];
}
