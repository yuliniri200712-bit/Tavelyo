/**
 * Resultado explícito de una operación que puede fallar por causas esperadas
 * (entrada inválida, regla de negocio). Los errores de programación se lanzan.
 */
export type Result<T, E> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
