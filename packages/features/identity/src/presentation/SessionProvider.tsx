import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Result } from '@tavelyo/core';
import type { AuthErrorCode, AuthGateway, ProfileGateway, StaffUser } from '../domain/index.ts';
import { defaultDisplayName } from '../application/credentials.ts';

export type SessionState =
  | { readonly status: 'checking' }
  | { readonly status: 'signed-out' }
  | { readonly status: 'signed-in'; readonly user: StaffUser };

export interface SessionContextValue {
  readonly session: SessionState;
  signIn(email: string, password: string): Promise<Result<StaffUser, AuthErrorCode>>;
  signOut(): Promise<void>;
  sendPasswordReset(email: string): Promise<Result<void, AuthErrorCode>>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export interface SessionProviderProps {
  readonly auth: AuthGateway;
  readonly profiles: ProfileGateway;
  readonly children: ReactNode;
}

/** Fuente única de la sesión del personal. La autorización real la decide el servidor. */
export function SessionProvider({ auth, profiles, children }: SessionProviderProps) {
  const [session, setSession] = useState<SessionState>({ status: 'checking' });

  useEffect(
    () =>
      auth.onUserChanged((user) =>
        setSession(user ? { status: 'signed-in', user } : { status: 'signed-out' }),
      ),
    [auth],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      async signIn(email, password) {
        const result = await auth.signIn(email, password);
        if (result.ok) {
          // El perfil es necesario para recibir membresías; si falla, se reintenta en el próximo acceso.
          await profiles.ensureProfile(result.value.displayName || defaultDisplayName(email));
        }
        return result;
      },
      signOut: () => auth.signOut(),
      sendPasswordReset: (email) => auth.sendPasswordReset(email),
    }),
    [auth, profiles, session],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession debe usarse dentro de <SessionProvider>.');
  return value;
}
