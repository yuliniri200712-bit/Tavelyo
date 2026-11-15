// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { ok } from '@tavelyo/core';
import { SessionProvider, type AuthGateway, type StaffUser } from '@tavelyo/identity';
import type { FloorAdminGateway } from '@tavelyo/floor';
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
      {
        tenantId: 'c',
        tenantName: 'Casa Ana',
        roleCode: 'branch_admin',
        roleName: 'Administrador de sucursal',
        permissions: ['table.manage'],
      },
    ]),
  ),
  myBranches: vi.fn(async (tenantId: string) =>
    ok([
      {
        id: `${tenantId}1`,
        name: { a: 'Centro', b: 'Malecón' }[tenantId] ?? 'Chapinero',
        currency: 'COP',
        timezone: 'America/Bogota',
      },
    ]),
  ),
};

const floorAdmin: FloorAdminGateway = {
  layout: vi.fn(async () =>
    ok([
      {
        id: 's1',
        name: 'Terraza',
        sort: 1,
        archived: false,
        tables: [{ id: 't1', code: 'T1', seats: 2, qrPublicId: 'q1', archived: false }],
      },
    ]),
  ),
  createSector: vi.fn(async () => ok(undefined)),
  updateSector: vi.fn(async () => ok(undefined)),
  createTable: vi.fn(async () => ok(undefined)),
  updateTable: vi.fn(async () => ok(undefined)),
  rotateQr: vi.fn(async () => ok(undefined)),
};

function renderAt(path: string, user: StaffUser | null) {
  const auth = fakeAuth(user);
  const services = {
    auth,
    profiles: { ensureProfile: vi.fn(async () => ok(undefined)) },
    tenancy,
    floorAdmin,
    menuWebUrl: 'https://carta.example',
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

  it('el inicio muestra los módulos del rol y abre la gestión de mesas', async () => {
    renderAt('/', ana);
    fireEvent.click(
      await screen.findByRole('button', { name: 'Casa Ana · Administrador de sucursal' }),
    );
    fireEvent.click(await screen.findByRole('link', { name: 'Mesas y códigos QR' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Mesas y códigos QR' }),
    ).toBeTruthy();
    expect(await screen.findByText('Mesa T1')).toBeTruthy();
    expect(floorAdmin.layout).toHaveBeenCalledWith({ tenantId: 'c', branchId: 'c1' });
  });

  it('un rol sin table.manage no ve el módulo ni la pantalla', async () => {
    renderAt('/mesas', ana);
    fireEvent.click(await screen.findByRole('button', { name: 'La Fonda · Mesero' }));
    expect(
      await screen.findByRole('heading', { name: 'Esta sección no está disponible para tu rol' }),
    ).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Mesas y códigos QR' })).toBeNull();
  });

  it('una ruta desconocida explica qué pasó', async () => {
    renderAt('/no-existe', null);
    expect(await screen.findByRole('heading', { name: 'No encontramos esta página' })).toBeTruthy();
  });
});
