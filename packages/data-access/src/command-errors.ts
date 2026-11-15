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

/**
 * Errores del servidor dentro del error del SDK web (firebase 12.19):
 * - respuesta 200 con errores: `DataConnectOperationError` con `response.errors`;
 * - respuesta 4xx: `DataConnectError` cuyo mensaje es el cuerpo JSON (`{ "errors": [...] }`).
 */
function serverErrors(error: unknown): readonly ServerError[] {
  if (typeof error !== 'object' || error === null) return [];
  const response = (error as { response?: { errors?: unknown } }).response;
  if (Array.isArray(response?.errors)) return response.errors as ServerError[];
  const message = (error as { message?: unknown }).message;
  if (typeof message !== 'string' || !message.trimStart().startsWith('{')) return [];
  try {
    const body = JSON.parse(message) as {
      errors?: unknown;
      error?: { message?: unknown; status?: unknown };
    };
    if (Array.isArray(body.errors)) return body.errors as ServerError[];
    // Formato de error de las API de Google: { "error": { "code", "message", "status" } }.
    return typeof body.error?.message === 'string'
      ? [{ message: body.error.message, extensions: { code: body.error.status } }]
      : [];
  } catch {
    return [];
  }
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
