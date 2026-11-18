// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { ok } from '@tavelyo/core';
import { SessionProvider, type AuthGateway, type StaffUser } from '@tavelyo/identity';
import type { CatalogAdminGateway } from '@tavelyo/catalog';
import type { FloorAdminGateway, FloorServiceGateway } from '@tavelyo/floor';
import type { KitchenGateway } from '@tavelyo/kitchen';
import type { StaffOrdersGateway } from '@tavelyo/orders';
import type { ServiceRequestsGateway } from '@tavelyo/service-requests';
import type { BranchAdminGateway, TenancyGateway } from '@tavelyo/tenancy';
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
        permissions: [
          'session.open',
          'session.close',
          'delivery.pickup',
          'delivery.deliver',
          'service_request.handle',
        ],
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

const floorService: FloorServiceGateway = {
  floor: vi.fn(async () =>
    ok([
      {
        id: 's1',
        name: 'Terraza',
        tables: [{ id: 't1', code: 'T1', seats: 2, session: null }],
      },
    ]),
  ),
  watchFloor: vi.fn(() => () => undefined),
  participants: vi.fn(async () => ok([])),
  openTable: vi.fn(async () => ok(undefined)),
  closeSession: vi.fn(async () => ok(undefined)),
  removeParticipant: vi.fn(async () => ok(undefined)),
};

const done = vi.fn(async () => ok(undefined));
const catalogAdmin: CatalogAdminGateway = {
  catalog: vi.fn(async () => ok({ taxRules: [], categories: [] })),
  branchProducts: vi.fn(async () => ok([])),
  createTaxRule: done,
  updateTaxRule: done,
  createCategory: done,
  updateCategory: done,
  createProduct: done,
  updateProduct: done,
  createModifierGroup: done,
  updateModifierGroup: done,
  createModifierOption: done,
  updateModifierOption: done,
  setAvailability: done,
  changePrice: done,
  stations: vi.fn(async () => ok([])),
  createStation: done,
  updateStation: done,
  setProductStation: done,
};

const branchAdmin: BranchAdminGateway = {
  branches: vi.fn(async () => ok([])),
  createBranch: done,
  updateBranch: done,
};

const kitchen: KitchenGateway = {
  stations: vi.fn(async () => ok([])),
  queue: vi.fn(async () => ok([])),
  watchQueue: vi.fn(() => () => undefined),
  start: done,
  finish: done,
  cancel: done,
};

const orders: StaffOrdersGateway = {
  pickupQueue: vi.fn(async () => ok([])),
  watchPickupQueue: vi.fn(() => () => undefined),
  pickUp: done,
  deliver: done,
  sessionOrders: vi.fn(async () => ok([])),
  watchSessionOrders: vi.fn(() => () => undefined),
  deliverDirectly: done,
  cancel: done,
};

const serviceRequests: ServiceRequestsGateway = {
  pending: vi.fn(async () => ok([])),
  watchPending: vi.fn(() => () => undefined),
  attend: done,
};

function renderAt(path: string, user: StaffUser | null) {
  const auth = fakeAuth(user);
  const services = {
    auth,
    profiles: { ensureProfile: vi.fn(async () => ok(undefined)) },
    tenancy,
    floorAdmin,
    floorService,
    catalogAdmin,
    branchAdmin,
    kitchen,
    orders,
    serviceRequests,
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

  it('el mesero ve el salón con las solicitudes de su sucursal y no la gestión de mesas', async () => {
    renderAt('/', ana);
    fireEvent.click(await screen.findByRole('button', { name: 'La Fonda · Mesero' }));
    expect(await screen.findByRole('link', { name: 'Listos para recoger' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Mesas y códigos QR' })).toBeNull();
    fireEvent.click(screen.getByRole('link', { name: 'Salón' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Salón' })).toBeTruthy();
    expect(await screen.findByText('Mesa T1')).toBeTruthy();
    expect(floorService.floor).toHaveBeenCalledWith({ tenantId: 'a', branchId: 'a1' });
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Solicitudes de las mesas' }),
    ).toBeTruthy();
    expect(serviceRequests.pending).toHaveBeenCalledWith({ tenantId: 'a', branchId: 'a1' });
  });

  it('el mesero abre «Listos para recoger» de su sucursal', async () => {
    renderAt('/entregas', ana);
    fireEvent.click(await screen.findByRole('button', { name: 'La Fonda · Mesero' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Listos para recoger' }),
    ).toBeTruthy();
    expect(await screen.findByText('No hay platos listos')).toBeTruthy();
    expect(orders.pickupQueue).toHaveBeenCalledWith({ tenantId: 'a', branchId: 'a1' });
  });

  it('un rol sin delivery.pickup no ve «Listos para recoger»', async () => {
    renderAt('/entregas', ana);
    fireEvent.click(await screen.findByRole('button', { name: 'El Puerto · Cajero' }));
    expect(
      await screen.findByRole('heading', { name: 'Esta sección no está disponible para tu rol' }),
    ).toBeTruthy();
  });

  it('un rol sin session.open no ve el salón', async () => {
    renderAt('/salon', ana);
    fireEvent.click(await screen.findByRole('button', { name: 'El Puerto · Cajero' }));
    expect(
      await screen.findByRole('heading', { name: 'Esta sección no está disponible para tu rol' }),
    ).toBeTruthy();
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
