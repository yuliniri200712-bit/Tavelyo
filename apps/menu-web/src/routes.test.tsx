// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { ok } from '@tavelyo/core';
import type { CustomerGateway } from '@tavelyo/table-session';
import { AppContext } from './app-context.tsx';
import type { Services } from './composition.ts';
import { routes } from './routes.tsx';

const customer: CustomerGateway = {
  menu: vi.fn(async (qr: string) =>
    ok(
      qr === 'qr-1'
        ? {
            tableCode: 'M1',
            branchName: 'Centro',
            currency: 'COP',
            timezone: 'America/Bogota',
            products: [],
          }
        : null,
    ),
  ),
  join: vi.fn(),
  quote: vi.fn(),
  authorize: vi.fn(),
};

function renderAt(path: string) {
  const data = new Map<string, string>();
  const services: Services = {
    customer,
    cartStorage: {
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => void data.set(key, value),
      removeItem: (key) => void data.delete(key),
    },
    usesEmulators: true,
  };
  render(
    <AppContext.Provider value={services}>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
    </AppContext.Provider>,
  );
}

describe('rutas de menu-web', () => {
  it('el inicio pide escanear el QR de la mesa', () => {
    renderAt('/');
    expect(screen.getByText(/Escanea el código QR de tu mesa/)).toBeTruthy();
  });

  it('el QR abre la carta de su mesa y el pedido se abre desde ella', async () => {
    renderAt('/mesa/qr-1');
    expect(await screen.findByRole('heading', { level: 1, name: 'Centro' })).toBeTruthy();
    expect(customer.menu).toHaveBeenCalledWith('qr-1');
  });

  it('la pantalla del pedido vuelve a la carta', async () => {
    renderAt('/mesa/qr-1/pedido');
    expect(await screen.findByRole('heading', { level: 1, name: 'Tu pedido' })).toBeTruthy();
    expect(screen.getByText('Tu pedido está vacío')).toBeTruthy();
    fireEvent.click(screen.getByRole('link', { name: 'Volver a la carta' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Centro' })).toBeTruthy();
  });

  it('un QR de otra mesa o inventado no muestra ninguna carta', async () => {
    renderAt('/mesa/otro');
    expect(
      await screen.findByText('Este código QR no corresponde a ninguna mesa activa'),
    ).toBeTruthy();
  });
});
