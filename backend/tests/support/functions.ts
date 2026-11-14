// Cliente de las funciones callable del emulador (protocolo HTTP de Cloud Functions) y operaciones
// de Auth del emulador que usan las pruebas. Sin el SDK web: la petición es exactamente la que
// recibiría el backend desde cualquier cliente, incluido uno malicioso.
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import {
  AUTH_URL,
  PROJECT_ID,
  TEST_PASSWORD,
  type TestUser,
} from '../../../dataconnect/tests/support/emulator.ts';

const FUNCTIONS_URL = `http://127.0.0.1:5001/${PROJECT_ID}/us-central1`;
const API_KEY = 'demo-api-key';

/** Admin SDK de las pruebas; emulators:exec define FIREBASE_AUTH_EMULATOR_HOST. */
export const adminAuth = getAuth(initializeApp({ projectId: PROJECT_ID }, 'pruebas-backend'));

export type CallResult<T> =
  | { readonly ok: true; readonly result: T }
  | { readonly ok: false; readonly status: string; readonly message: string };

export async function callFunction<T = Record<string, unknown>>(
  user: Pick<TestUser, 'token'> | null,
  name: string,
  data: unknown,
): Promise<CallResult<T>> {
  const response = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(user ? { Authorization: `Bearer ${user.token}` } : {}),
    },
    body: JSON.stringify({ data }),
  });
  const body = (await response.json()) as {
    result?: T;
    error?: { status: string; message: string };
  };
  if (body.error) return { ok: false, status: body.error.status, message: body.error.message };
  return { ok: true, result: body.result as T };
}

async function authPost<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${AUTH_URL}/${path}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as T & { error?: { message: string } };
  if (!response.ok) throw new Error(`${path}: ${body.error?.message ?? response.status}`);
  return body;
}

/**
 * ¿Están revocadas las sesiones de la persona? Mismo criterio que verifyIdToken(token, true) en
 * producción. (El emulador de Auth no aplica la revocación al canjear refresh tokens.)
 */
export async function sessionsRevoked(user: Pick<TestUser, 'token'>): Promise<boolean> {
  try {
    await adminAuth.verifyIdToken(user.token, true);
    return false;
  } catch (error) {
    if ((error as { code?: string }).code === 'auth/id-token-revoked') return true;
    throw error;
  }
}

/** Auth guarda el corte de revocación con precisión de segundos. */
export function nextSecond(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1_100));
}

/** Inicia sesión con una afirmación inventada dentro del token (no queda guardada en la cuenta). */
export async function signInWithForgedClaim(
  uid: string,
  claims: object,
): Promise<{ token: string }> {
  const customToken = await adminAuth.createCustomToken(uid, claims);
  const body = await authPost<{ idToken: string }>(
    'identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken',
    { token: customToken, returnSecureToken: true },
  );
  return { token: body.idToken };
}

/**
 * Recorrido de la persona propietaria creada por el aprovisionamiento: pide «¿Olvidaste tu
 * contraseña?», usa el código del correo (el emulador lo expone) e inicia sesión.
 */
export async function setPasswordThroughReset(
  email: string,
): Promise<{ uid: string; token: string }> {
  await authPost('identitytoolkit.googleapis.com/v1/accounts:sendOobCode', {
    requestType: 'PASSWORD_RESET',
    email,
  });
  const codes = (await (
    await fetch(`${AUTH_URL}/emulator/v1/projects/${PROJECT_ID}/oobCodes`)
  ).json()) as { oobCodes: Array<{ email: string; oobCode: string; requestType: string }> };
  const code = codes.oobCodes.findLast(
    (entry) => entry.email === email && entry.requestType === 'PASSWORD_RESET',
  );
  if (!code) throw new Error(`Sin código de restablecimiento para ${email}`);
  await authPost('identitytoolkit.googleapis.com/v1/accounts:resetPassword', {
    oobCode: code.oobCode,
    newPassword: TEST_PASSWORD,
  });
  const session = await authPost<{ localId: string; idToken: string }>(
    'identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
    { email, password: TEST_PASSWORD, returnSecureToken: true },
  );
  return { uid: session.localId, token: session.idToken };
}
