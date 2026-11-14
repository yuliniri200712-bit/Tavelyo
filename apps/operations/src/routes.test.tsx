// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { ok } from '@tavelyo/core';
import { SessionProvider, type AuthGateway, type StaffUser } from '@tavelyo/identity';
import type { TenancyGateway } from '@tavelyo/tenancy';
import { AppContext } from './app-context.tsx';
import { routes } from './routes.tsx';

const ana: StaffUser = { uid: 'u1', email: 'ana@lafonda.co', displayName: 'Ana' };

function fakeAuth(initial: StaffUser | null): AuthGateway {
  let listener: (user: StaffUser | null) => void = () => undefined;
  return {
    onUserChanged: (next) => {
      listener = next;
      next(initial);
      return () => undefined;
    },
    signIn: vi.fn(async () => {
      listener(ana);
      return ok(ana);
    }),
    signOut: vi.fn(async () => listener(null)),
    sendPasswordReset: vi.fn(async () => ok(undefined)),
  };
}

const tenancy: TenancyGateway = {
  myMemberships: vi.fn(async () =>
    ok([
      {
        tenantId: 'a',
        tenantName: 'La Fonda',
        roleCode: 'waiter',
        roleName: 'Mesero',
        permissions: [],
      },
      {
        tenantId: 'b',
        tenantName: 'El Puerto',
        roleCode: 'cashier',
        roleName: 'Cajero',
        permissions: [],
      },
    ]),
  ),
  myBranches: vi.fn(async (tenantId: string) =>
    ok([
      {
        id: `${tenantId}1`,
        name: tenantId === 'a' ? 'Centro' : 'Malecón',
        currency: 'COP',
        timezone: 'America/Bogota',
      },
    ]),
  ),
};

function renderAt(path: string, user: StaffUser | null) {
  const auth = fakeAuth(user);
  const services = {
    auth,
    profiles: { ensureProfile: vi.fn(async () => ok(undefined)) },
    tenancy,
    usesEmulators: true,
  };
  const update = { needRefresh: false, onUpdate: vi.fn(), onDismiss: vi.fn() };
  render(
    <AppContext.Provider value={{ services, update }}>
      <SessionProvider auth={auth} profiles={services.profiles}>
        <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
      </SessionProvider>
    </AppContext.Provider>,
  );
  return auth;
}

describe('rutas de operations', () => {
  it('sin sesión, el inicio lleva al acceso del personal', async () => {
    renderAt('/', null);
    expect(await screen.findByRole('heading', { name: 'Acceso del personal' })).toBeTruthy();
  });

  it('el catálogo no necesita sesión ni datos', async () => {
    renderAt('/catalogo', null);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Catálogo del sistema de diseño' }),
    ).toBeTruthy();
  });

  it('con sesión pide la empresa y muestra el contexto elegido', async () => {
    renderAt('/', ana);
    fireEvent.click(await screen.findByRole('button', { name: 'La Fonda · Mesero' }));
    expect(await screen.findByRole('heading', { name: 'La Fonda · Centro' })).toBeTruthy();
    expect(screen.getByText('Ana · La Fonda · Centro · Mesero')).toBeTruthy();
  });

  it('cambiar de empresa quita el contenido de la anterior', async () => {
    renderAt('/', ana);
    fireEvent.click(await screen.findByRole('button', { name: 'La Fonda · Mesero' }));
    await screen.findByRole('heading', { name: 'La Fonda · Centro' });
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar empresa o sucursal' }));
    expect(screen.queryByRole('heading', { name: 'La Fonda · Centro' })).toBeNull();
    fireEvent.click(await screen.findByRole('button', { name: 'El Puerto · Cajero' }));
    expect(await screen.findByRole('heading', { name: 'El Puerto · Malecón' })).toBeTruthy();
  });

  it('cerrar sesión vuelve al acceso y no deja datos visibles', async () => {
    const auth = renderAt('/', ana);
    fireEvent.click(await screen.findByRole('button', { name: 'La Fonda · Mesero' }));
    await screen.findByRole('heading', { name: 'La Fonda · Centro' });
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(auth.signOut).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('heading', { name: 'Acceso del personal' })).toBeTruthy();
    expect(screen.queryByText(/La Fonda/)).toBeNull();
  });

  it('una ruta desconocida explica qué pasó', async () => {
    renderAt('/no-existe', null);
    expect(await screen.findByRole('heading', { name: 'No encontramos esta página' })).toBeTruthy();
  });
});
