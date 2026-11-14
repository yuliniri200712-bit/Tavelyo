import { useState, type FormEvent } from 'react';
import { Card, TavelyoButton, TextField } from '@tavelyo/design-system';
import {
  AUTH_ERROR_MESSAGES,
  validateCredentials,
  validateEmail,
  type CredentialErrors,
} from '../application/credentials.ts';
import { useSession } from './SessionProvider.tsx';

type Mode = 'sign-in' | 'reset';

/** Acceso del personal con correo y contraseña (D-17). */
export function SignInPage() {
  const { signIn, sendPasswordReset } = useSession();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<CredentialErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const credentials = validateCredentials(email, password);
    if (!credentials.ok) {
      setFieldErrors(credentials.error);
      return;
    }
    setFieldErrors({});
    setBusy(true);
    const result = await signIn(credentials.value.email, credentials.value.password);
    setBusy(false);
    if (!result.ok) {
      setFormError(AUTH_ERROR_MESSAGES[result.error]);
      setPassword('');
    }
  };

  const handleReset = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const valid = validateEmail(email);
    if (!valid.ok) {
      setFieldErrors({ email: valid.error });
      return;
    }
    setFieldErrors({});
    setBusy(true);
    const result = await sendPasswordReset(valid.value);
    setBusy(false);
    if (!result.ok && result.error !== 'invalid-credentials') {
      setFormError(AUTH_ERROR_MESSAGES[result.error]);
      return;
    }
    setNotice(
      'Si el correo está registrado, te enviamos un enlace para crear una contraseña nueva.',
    );
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setFieldErrors({});
    setFormError(null);
    setNotice(null);
  };

  return (
    <Card
      title={mode === 'sign-in' ? 'Acceso del personal' : 'Recuperar contraseña'}
      headingLevel={2}
    >
      <form
        className="tv-form"
        noValidate
        onSubmit={mode === 'sign-in' ? handleSignIn : handleReset}
        aria-describedby={formError ? 'acceso-error' : undefined}
      >
        <TextField
          label="Correo"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          {...(fieldErrors.email ? { error: fieldErrors.email } : {})}
        />
        {mode === 'sign-in' ? (
          <TextField
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            {...(fieldErrors.password ? { error: fieldErrors.password } : {})}
          />
        ) : null}
        {formError ? (
          <p id="acceso-error" className="tv-form__error" role="alert">
            {formError}
          </p>
        ) : null}
        {notice ? (
          <p className="tv-form__notice" role="status">
            {notice}
          </p>
        ) : null}
        <TavelyoButton
          type="submit"
          loading={busy}
          loadingLabel={mode === 'sign-in' ? 'Entrando…' : 'Enviando…'}
        >
          {mode === 'sign-in' ? 'Entrar' : 'Enviar enlace'}
        </TavelyoButton>
        <TavelyoButton
          variant="secondary"
          onClick={() => switchMode(mode === 'sign-in' ? 'reset' : 'sign-in')}
        >
          {mode === 'sign-in' ? '¿Olvidaste tu contraseña?' : 'Volver al acceso'}
        </TavelyoButton>
      </form>
    </Card>
  );
}
