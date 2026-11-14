import type { Result } from '@tavelyo/core';

/** Fallas esperadas que el backend devuelve a quien llama. Los errores de programación se lanzan. */
export type FailureCode =
  'unauthenticated' | 'permission-denied' | 'invalid-argument' | 'unavailable';

export interface Failure {
  readonly code: FailureCode;
  /** Mensaje para la persona: nunca revela datos de otra empresa ni detalles internos. */
  readonly message: string;
}

export type Outcome<T> = Result<T, Failure>;

export function failure(code: FailureCode, message: string): Failure {
  return { code, message };
}

/** Quien llama, según su ID token verificado por Cloud Functions. */
export interface Actor {
  readonly uid: string;
  /** Afirmaciones del token, para suplantar al usuario en las operaciones del conector. */
  readonly claims: Readonly<Record<string, unknown>>;
  /** Momento del inicio de sesión (auth_time, en segundos). */
  readonly authTimeSeconds: number;
}
