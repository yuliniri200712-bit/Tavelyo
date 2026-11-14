import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Result } from '@tavelyo/core';
import type {
  AuthErrorCode,
  AuthGateway,
  ProfileGateway,
  SignInOptions,
  SignOutReason,
  StaffUser,
} from '../domain/index.ts';
import { defaultDisplayName } from '../application/credentials.ts';

export type SessionState =
  | { readonly status: 'checking' }
  | { readonly status: 'signed-out'; readonly reason?: SignOutReason }
  | { readonly status: 'signed-in'; readonly user: StaffUser };

export interface SessionContextValue {
  readonly session: SessionState;
  signIn(
    email: string,
    password: string,
    options: SignInOptions,
  ): Promise<Result<StaffUser, AuthErrorCode>>;
  /** Sin motivo: la persona cerró la sesión. Con motivo, la pantalla de acceso lo explica. */
  signOut(reason?: SignOutReason): Promise<void>;
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
  const pendingReason = useRef<SignOutReason | null>(null);

  useEffect(
    () =>
      auth.onUserChanged((user) => {
        if (user) {
          setSession({ status: 'signed-in', user });
          return;
        }
        const reason = pendingReason.current;
        pendingReason.current = null;
        setSession(reason ? { status: 'signed-out', reason } : { status: 'signed-out' });
      }),
    [auth],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      async signIn(email, password, options) {
        const result = await auth.signIn(email, password, options);
        if (result.ok) {
          // El perfil es necesario para recibir membresías; si falla, se reintenta en el próximo acceso.
          await profiles.ensureProfile(result.value.displayName || defaultDisplayName(email));
        }
        return result;
      },
      signOut(reason) {
        pendingReason.current = reason ?? null;
        return auth.signOut();
      },
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
