/**
 * NIT de Colombia con su dígito de verificación (DV), según el cálculo de la DIAN: cada dígito,
 * de derecha a izquierda, se multiplica por 3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67
 * y 71; con el residuo de la suma entre 11, el DV es ese residuo si vale 0 o 1, y si no, 11 menos
 * el residuo. Lo usan el comprobante del pago y los datos de la empresa.
 */

const WEIGHTS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71] as const;

/** Dígitos del número sin el DV: de 6 a 10 (empresas, 9; personas, su cédula). */
export const NIT_DIGITS = { min: 6, max: 10 } as const;

export interface Nit {
  /** Número sin el DV, solo dígitos. */
  readonly number: string;
  readonly checkDigit: number;
  /** Forma guardada y mostrada: «900123456-7». */
  readonly formatted: string;
}

export function nitCheckDigit(number: string): number {
  if (!/^[0-9]+$/.test(number) || number.length > WEIGHTS.length)
    throw new Error('El NIT debe tener solo dígitos');
  let sum = 0;
  for (let i = 0; i < number.length; i++) {
    const digit = Number(number[number.length - 1 - i]);
    sum += digit * (WEIGHTS[i] ?? 0);
  }
  const rest = sum % 11;
  return rest <= 1 ? rest : 11 - rest;
}

/**
 * Lee un NIT escrito por una persona: admite puntos y espacios, y exige el DV separado con guion
 * («900.123.456-7»). Devuelve null si el formato o el DV no son válidos.
 */
export function parseNit(text: string): Nit | null {
  const match = /^([0-9]+)-([0-9])$/.exec(text.replace(/[.\s]/g, ''));
  if (!match) return null;
  const number = (match[1] ?? '').replace(/^0+(?=[0-9])/, '');
  const checkDigit = Number(match[2]);
  if (number.length < NIT_DIGITS.min || number.length > NIT_DIGITS.max) return null;
  if (nitCheckDigit(number) !== checkDigit) return null;
  return { number, checkDigit, formatted: `${number}-${checkDigit}` };
}
