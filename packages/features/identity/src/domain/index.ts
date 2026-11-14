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

export interface SignInOptions {
  /**
   * Equipo compartido de la sucursal (D-20): la sesión vive solo en esta pestaña y se borra al
   * cerrarla. En un teléfono personal la sesión se recuerda.
   */
  readonly sharedDevice: boolean;
}

/** Por qué se cerró la sesión sin que la persona lo pidiera. */
export type SignOutReason = 'inactivity';

/** Contrato que implementa la capa de datos (Firebase Auth). */
export interface AuthGateway {
  signIn(
    email: string,
    password: string,
    options: SignInOptions,
  ): Promise<Result<StaffUser, AuthErrorCode>>;
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

/** Última actividad por persona, compartida entre pestañas del mismo navegador. */
export interface ActivityStore {
  read(uid: string): number | null;
  write(uid: string, at: number): void;
  clear(uid: string): void;
}
