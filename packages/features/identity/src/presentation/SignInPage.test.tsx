// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { err, ok } from '@tavelyo/core';
import type { AuthGateway, ProfileGateway, StaffUser } from '../domain/index.ts';
import { SessionProvider, useSession } from './SessionProvider.tsx';
import { SignInPage } from './SignInPage.tsx';

const ana: StaffUser = { uid: 'u1', email: 'ana@lafonda.co', displayName: '' };

function fakeAuth(overrides: Partial<AuthGateway> = {}): AuthGateway {
  let listener: (user: StaffUser | null) => void = () => undefined;
  return {
    onUserChanged: (next) => {
      listener = next;
      next(null);
      return () => undefined;
    },
    signIn: vi.fn(async () => {
      listener(ana);
      return ok(ana);
    }),
    signOut: vi.fn(async () => listener(null)),
    sendPasswordReset: vi.fn(async () => ok(undefined)),
    ...overrides,
  };
}

function SessionStatus() {
  const { session } = useSession();
  return <output aria-label="estado">{session.status}</output>;
}

function renderPage(
  auth: AuthGateway,
  profiles: ProfileGateway = { ensureProfile: vi.fn(async () => ok(undefined)) },
) {
  render(
    <SessionProvider auth={auth} profiles={profiles}>
      <SignInPage />
      <SessionStatus />
    </SessionProvider>,
  );
  return profiles;
}

const fill = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('SignInPage', () => {
  it('valida la forma de los datos antes de llamar al servidor', async () => {
    const auth = fakeAuth();
    renderPage(auth);
    fill('Correo', 'ana');
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText(/Escribe un correo completo/)).toBeTruthy();
    expect(screen.getByText('Escribe tu contraseña.')).toBeTruthy();
    expect(auth.signIn).not.toHaveBeenCalled();
  });

  it('inicia sesión y crea el perfil mínimo', async () => {
    const auth = fakeAuth();
    const profiles = renderPage(auth);
    fill('Correo', ' ana@lafonda.co ');
    fill('Contraseña', 'secreta-123');
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect((await screen.findByLabelText('estado')).textContent).toBe('signed-in');
    expect(auth.signIn).toHaveBeenCalledWith('ana@lafonda.co', 'secreta-123');
    expect(profiles.ensureProfile).toHaveBeenCalledWith('ana');
  });

  it('con credenciales incorrectas da un mensaje que no revela si el correo existe', async () => {
    const auth = fakeAuth({ signIn: vi.fn(async () => err('invalid-credentials' as const)) });
    renderPage(auth);
    fill('Correo', 'ana@lafonda.co');
    fill('Contraseña', 'mala');
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect((await screen.findByRole('alert')).textContent).toBe(
      'El correo o la contraseña no son correctos.',
    );
    expect((screen.getByLabelText('Contraseña') as HTMLInputElement).value).toBe('');
  });

  it('mientras entra no permite enviar dos veces', async () => {
    let finish: () => void = () => undefined;
    const signIn = vi.fn(
      () =>
        new Promise<ReturnType<typeof ok<StaffUser>>>(
          (resolve) => (finish = () => resolve(ok(ana))),
        ),
    );
    renderPage(fakeAuth({ signIn }));
    fill('Correo', 'ana@lafonda.co');
    fill('Contraseña', 'secreta-123');
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    const busy = await screen.findByRole('button', { name: 'Entrando…' });
    fireEvent.click(busy);
    expect(signIn).toHaveBeenCalledTimes(1);
    finish();
    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeTruthy();
  });

  it('recuperar la contraseña responde igual exista o no el correo', async () => {
    const auth = fakeAuth();
    renderPage(auth);
    fireEvent.click(screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' }));
    expect(screen.getByRole('heading', { name: 'Recuperar contraseña' })).toBeTruthy();
    fill('Correo', 'nadie@ejemplo.com');
    fireEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }));
    expect((await screen.findByRole('status', { name: '' })).textContent).toContain(
      'Si el correo está registrado',
    );
    expect(auth.sendPasswordReset).toHaveBeenCalledWith('nadie@ejemplo.com');
  });
});
