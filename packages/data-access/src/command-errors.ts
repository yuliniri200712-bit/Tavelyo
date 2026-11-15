import { mapDataError } from './sql-connect-gateways.ts';

/**
 * Falla de una operación de escritura o lectura protegida, para mostrar a la persona.
 * `rejected` solo lleva mensajes de las reglas `@check` del conector: textos fijos escritos para el
 * personal, sin datos de otras empresas. Cualquier otro error de la base se trata como inesperado
 * para no mostrar detalles internos.
 */
export type CommandError =
  | { readonly kind: 'rejected'; readonly message: string }
  | { readonly kind: 'unauthorized' | 'network' | 'unknown' };

interface ServerError {
  readonly message?: unknown;
  readonly extensions?: { readonly code?: unknown };
}

function serverErrors(error: unknown): readonly ServerError[] {
  if (typeof error !== 'object' || error === null || !('response' in error)) return [];
  const response = (error as { response?: { errors?: unknown } }).response;
  return Array.isArray(response?.errors) ? (response.errors as ServerError[]) : [];
}

/** Mensaje de una regla @check: el servidor añade « (aborted)» y, en transacciones, «(rolled back)». */
const CHECK_MESSAGE = /^(.+?) \(aborted\)(?:\s*\(rolled back\))?\s*$/s;
const DUPLICATE = /duplicate|unique|already exists/i;

export function mapCommandError(error: unknown, duplicateMessage?: string): CommandError {
  for (const entry of serverErrors(error)) {
    const message = typeof entry.message === 'string' ? entry.message : '';
    const code = typeof entry.extensions?.code === 'string' ? entry.extensions.code : '';
    const check = CHECK_MESSAGE.exec(message);
    if (code === 'PERMISSION_DENIED' && check?.[1] && !/@auth/.test(message)) {
      return { kind: 'rejected', message: check[1].trim() };
    }
    if (duplicateMessage && DUPLICATE.test(message)) {
      return { kind: 'rejected', message: duplicateMessage };
    }
  }
  return { kind: mapDataError(error) };
}
