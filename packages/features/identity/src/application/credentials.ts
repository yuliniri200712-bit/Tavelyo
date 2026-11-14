import { err, ok, type Result } from '@tavelyo/core';

export interface Credentials {
  readonly email: string;
  readonly password: string;
}

export interface CredentialErrors {
  readonly email?: string;
  readonly password?: string;
}

// Validación de forma en el cliente para orientar a la persona; la autoridad es Firebase Auth.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCredentials(
  email: string,
  password: string,
): Result<Credentials, CredentialErrors> {
  const trimmed = email.trim();
  const errors: { email?: string; password?: string } = {};
  if (trimmed === '') errors.email = 'Escribe tu correo.';
  else if (!EMAIL.test(trimmed))
    errors.email = 'Escribe un correo completo, por ejemplo nombre@restaurante.com.';
  if (password === '') errors.password = 'Escribe tu contraseña.';
  return errors.email || errors.password ? err(errors) : ok({ email: trimmed, password });
}

export function validateEmail(email: string): Result<string, string> {
  const result = validateCredentials(email, '-');
  return result.ok ? ok(result.value.email) : err(result.error.email ?? 'Correo no válido.');
}

/** Mensajes para la persona. Nunca indican si el correo existe. */
export const AUTH_ERROR_MESSAGES = {
  'invalid-credentials': 'El correo o la contraseña no son correctos.',
  'too-many-attempts': 'Demasiados intentos. Espera unos minutos o recupera tu contraseña.',
  network: 'No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.',
  unknown: 'No se pudo iniciar sesión. Inténtalo de nuevo.',
} as const;

/** Nombre visible por defecto a partir del correo, si la cuenta no tiene uno. */
export function defaultDisplayName(email: string): string {
  return email.split('@')[0] ?? email;
}
