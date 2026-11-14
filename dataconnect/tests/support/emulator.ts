// Cliente HTTP mínimo de los emuladores (validado en el spike D-13). Sin dependencias.
// Cliente: cabecera X-Firebase-Auth-Token, como el SDK web de SQL Connect.
// Servidor: token «owner» del emulador y executeGraphql, como el Admin SDK.

export const PROJECT_ID = 'demo-tavelyo';
const AUTH_URL = 'http://127.0.0.1:9099';
const SERVICE_URL = `http://127.0.0.1:9399/v1/projects/${PROJECT_ID}/locations/us-central1/services/tavelyo`;
const CONNECTOR = 'tavelyo';

export interface TestUser {
  readonly label: string;
  readonly uid: string;
  readonly token: string;
}

export interface GraphqlResult<T = Record<string, unknown>> {
  readonly data: T | null | undefined;
  readonly errors: readonly string[];
}

type Variables = Readonly<Record<string, unknown>>;

const runId = Date.now().toString(36);

export async function createUser(label: string): Promise<TestUser> {
  const response = await fetch(
    `${AUTH_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `${label}-${runId}@example.test`,
        password: 'contraseña-de-prueba',
        returnSecureToken: true,
      }),
    },
  );
  const body = (await response.json()) as { localId?: string; idToken?: string };
  if (!response.ok || !body.localId || !body.idToken) {
    throw new Error(`No se pudo crear el usuario ${label}: ${JSON.stringify(body)}`);
  }
  return { label, uid: body.localId, token: body.idToken };
}

async function post<T>(url: string, headers: Record<string, string>, payload: unknown) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  let body: { data?: T | null; errors?: Array<{ message?: string }> };
  try {
    body = JSON.parse(text) as typeof body;
  } catch {
    body = { errors: [{ message: text }] };
  }
  // El servicio responde "errors": [] cuando la operación tiene éxito.
  const errors = (body.errors ?? []).map((error) => error.message ?? JSON.stringify(error));
  if (!response.ok && errors.length === 0) errors.push(`HTTP ${response.status}: ${text}`);
  return { data: body.data, errors } satisfies GraphqlResult<T>;
}

/** Ejecuta una consulta del conector como el usuario indicado (null: sin sesión). */
export function query<T = Record<string, unknown>>(
  user: TestUser | null,
  operationName: string,
  variables: Variables = {},
): Promise<GraphqlResult<T>> {
  const headers: Record<string, string> = user ? { 'X-Firebase-Auth-Token': user.token } : {};
  return post<T>(`${SERVICE_URL}/connectors/${CONNECTOR}:executeQuery`, headers, {
    operationName,
    variables,
  });
}

/** Ejecuta una mutación del conector como el usuario indicado (null: sin sesión). */
export function mutate<T = Record<string, unknown>>(
  user: TestUser | null,
  operationName: string,
  variables: Variables = {},
): Promise<GraphqlResult<T>> {
  const headers: Record<string, string> = user ? { 'X-Firebase-Auth-Token': user.token } : {};
  return post<T>(`${SERVICE_URL}/connectors/${CONNECTOR}:executeMutation`, headers, {
    operationName,
    variables,
  });
}

/** GraphQL arbitrario con credenciales de servidor: solo aprovisionamiento y comprobaciones. */
export function admin<T = Record<string, unknown>>(
  document: string,
  variables: Variables = {},
): Promise<GraphqlResult<T>> {
  return post<T>(
    `${SERVICE_URL}:executeGraphql`,
    { Authorization: 'Bearer owner' },
    {
      query: document,
      variables,
    },
  );
}

/** Falla con el detalle del servidor si la operación devolvió errores. */
export function expectOk<T>(result: GraphqlResult<T>, context: string): T {
  if (result.errors.length > 0 || !result.data) {
    throw new Error(`${context}: ${result.errors.join(' | ') || 'sin datos'}`);
  }
  return result.data;
}
