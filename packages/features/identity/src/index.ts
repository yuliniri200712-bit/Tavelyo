export type {
  ActivityStore,
  AuthErrorCode,
  AuthGateway,
  ProfileGateway,
  SignInOptions,
  SignOutReason,
  StaffUser,
} from './domain/index.ts';
export {
  AUTH_ERROR_MESSAGES,
  defaultDisplayName,
  validateCredentials,
  validateEmail,
} from './application/credentials.ts';
export {
  SessionProvider,
  useSession,
  type SessionContextValue,
  type SessionState,
} from './presentation/SessionProvider.tsx';
export { SignInPage } from './presentation/SignInPage.tsx';
export {
  browserActivityStore,
  InactivityGuard,
  type InactivityGuardProps,
} from './presentation/InactivityGuard.tsx';
export {
  InactivityHoldProvider,
  useInactivityHold,
  type InactivityHolds,
} from './presentation/InactivityHold.tsx';
export {
  INACTIVITY_POLICY,
  inactivityPhase,
  type InactivityPhase,
  type InactivityPolicy,
} from './application/inactivity.ts';
