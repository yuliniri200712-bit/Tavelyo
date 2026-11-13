import { err, ok, type Result } from './result';

declare const utcInstantBrand: unique symbol;

/**
 * Instante en UTC con formato ISO 8601 y sufijo `Z` (p. ej. `2026-11-13T22:45:49.434Z`).
 * Las marcas de tiempo críticas las asigna el servidor; el cliente no ordena eventos con su
 * propio reloj (arquitectura §5).
 */
export type UtcInstant = string & { readonly [utcInstantBrand]: true };

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/;

export type UtcInstantParseError = { readonly kind: 'invalid-utc-instant'; readonly input: string };

export function parseUtcInstant(value: string): Result<UtcInstant, UtcInstantParseError> {
  if (!ISO_UTC.test(value) || Number.isNaN(Date.parse(value))) {
    return err({ kind: 'invalid-utc-instant', input: value });
  }
  // Rechaza fechas que Date normaliza en silencio (p. ej. 31 de febrero).
  if (new Date(value).toISOString().slice(0, 19) !== value.slice(0, 19)) {
    return err({ kind: 'invalid-utc-instant', input: value });
  }
  return ok(value as UtcInstant);
}

/** Compara dos instantes UTC; −1 si `a` es anterior, 1 si es posterior y 0 si son iguales. */
export function compareUtcInstants(a: UtcInstant, b: UtcInstant): -1 | 0 | 1 {
  const ta = Date.parse(a);
  const tb = Date.parse(b);
  if (ta === tb) return 0;
  return ta < tb ? -1 : 1;
}
