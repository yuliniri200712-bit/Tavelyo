import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { err, ok } from '@tavelyo/core';
import type { AuthErrorCode, AuthGateway, StaffUser } from '@tavelyo/identity/domain';

/** Códigos de Firebase Auth que no deben revelar si una cuenta existe. */
const INVALID_CREDENTIALS = new Set([
  'auth/invalid-credential',
  'auth/invalid-login-credentials',
  'auth/user-not-found',
  'auth/wrong-password',
  'auth/invalid-email',
  'auth/user-disabled',
  'auth/missing-password',
]);

export function mapAuthError(error: unknown): AuthErrorCode {
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  if (INVALID_CREDENTIALS.has(code)) return 'invalid-credentials';
  if (code === 'auth/too-many-requests') return 'too-many-attempts';
  if (code === 'auth/network-request-failed') return 'network';
  return 'unknown';
}

function toStaffUser(user: User): StaffUser {
  return { uid: user.uid, email: user.email ?? '', displayName: user.displayName ?? '' };
}

export function createFirebaseAuthGateway(auth: Auth): AuthGateway {
  return {
    async signIn(email, password) {
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        return ok(toStaffUser(credential.user));
      } catch (error) {
        return err(mapAuthError(error));
      }
    },
    signOut: () => signOut(auth),
    async sendPasswordReset(email) {
      try {
        await sendPasswordResetEmail(auth, email);
        return ok(undefined);
      } catch (error) {
        const code = mapAuthError(error);
        // Un correo inexistente responde igual que uno registrado.
        return code === 'invalid-credentials' ? ok(undefined) : err(code);
      }
    },
    onUserChanged: (listener) =>
      onAuthStateChanged(auth, (user) => listener(user ? toStaffUser(user) : null)),
  };
}
