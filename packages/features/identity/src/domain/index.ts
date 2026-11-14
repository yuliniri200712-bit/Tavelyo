import type { Result } from '@tavelyo/core';

/** Persona del personal con sesión iniciada en Firebase Auth. */
export interface StaffUser {
  readonly uid: string;
  readonly email: string;
  readonly displayName: string;
}

/**
 * Errores de acceso que la interfaz sabe explicar. `invalid-credentials` agrupa usuario
 * inexistente y contraseña incorrecta para no revelar qué correos están registrados.
 */
export type AuthErrorCode = 'invalid-credentials' | 'too-many-attempts' | 'network' | 'unknown';

/** Contrato que implementa la capa de datos (Firebase Auth). */
export interface AuthGateway {
  signIn(email: string, password: string): Promise<Result<StaffUser, AuthErrorCode>>;
  signOut(): Promise<void>;
  /** Envía el enlace de recuperación. No revela si el correo existe. */
  sendPasswordReset(email: string): Promise<Result<void, AuthErrorCode>>;
  /** Notifica el usuario actual (o null) y devuelve la función para dejar de escuchar. */
  onUserChanged(listener: (user: StaffUser | null) => void): () => void;
}

/** Perfil mínimo en SQL Connect, necesario para recibir membresías. */
export interface ProfileGateway {
  ensureProfile(displayName: string): Promise<Result<void, AuthErrorCode>>;
}
