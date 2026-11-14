import type { Auth } from 'firebase-admin/auth';
import { defaultDisplayName } from '@tavelyo/identity/application';
import type { SessionRevoker } from '../members/revoke-member.ts';
import {
  PLATFORM_OPERATOR_CLAIM,
  type OperatorDirectory,
  type StaffAccounts,
} from '../provisioning/provision-tenant.ts';

// Adaptadores de Firebase Auth con el Admin SDK.

export function createSessionRevoker(auth: Auth): SessionRevoker {
  return {
    async revokeSessions(userId) {
      await auth.revokeRefreshTokens(userId);
    },
  };
}

/**
 * Misma regla que verifyIdToken(token, true): una sesión iniciada antes de tokensValidAfterTime
 * (que Auth guarda con precisión de segundos) está revocada.
 */
export function sessionRevoked(authTimeSeconds: number, tokensValidAfterTime?: string): boolean {
  if (!tokensValidAfterTime) return false;
  const validSinceMs = Math.floor(new Date(tokensValidAfterTime).getTime() / 1000) * 1000;
  return authTimeSeconds * 1000 < validSinceMs;
}

export function createOperatorDirectory(auth: Auth): OperatorDirectory {
  return {
    async isPlatformOperator(actor) {
      const user = await auth.getUser(actor.uid);
      return (
        !user.disabled &&
        user.customClaims?.[PLATFORM_OPERATOR_CLAIM] === true &&
        !sessionRevoked(actor.authTimeSeconds, user.tokensValidAfterTime)
      );
    },
  };
}

function isUserNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'auth/user-not-found'
  );
}

export function createStaffAccounts(auth: Auth): StaffAccounts {
  return {
    async findOrCreate(email) {
      try {
        const user = await auth.getUserByEmail(email);
        return {
          uid: user.uid,
          displayName: user.displayName ?? defaultDisplayName(email),
          created: false,
        };
      } catch (error) {
        if (!isUserNotFound(error)) throw error;
      }
      const user = await auth.createUser({ email, emailVerified: false });
      return { uid: user.uid, displayName: defaultDisplayName(email), created: true };
    },
  };
}
