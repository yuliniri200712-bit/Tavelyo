// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { err, ok } from '@tavelyo/core';
import { availableTimeZones, parseBranchForm } from '../application/branch-form.ts';
import type { BranchAdminGateway } from '../domain/index.ts';
import { BranchesAdminPage } from './BranchesAdminPage.tsx';

beforeAll(() => {
  // jsdom no implementa <dialog>: basta con alternar `open` (el foco real se prueba en Playwright).
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

const branches = [
  { id: 'b1', name: 'Centro', currency: 'COP', timezone: 'America/Bogota', archived: false },
  { id: 'b2', name: 'Norte', currency: 'COP', timezone: 'America/Bogota', archived: false },
  { id: 'b3', name: 'Usaquén', currency: 'COP', timezone: 'America/Bogota', archived: true },
];

function fakeGateway(overrides: Partial<BranchAdminGateway> = {}): BranchAdminGateway {
  return {
    branches: vi.fn(async () => ok(branches)),
    createBranch: vi.fn(async () => ok(undefined)),
    updateBranch: vi.fn(async () => ok(undefined)),
    ...overrides,
  };
}

function renderPage(gateway = fakeGateway()) {
  render(
    <BranchesAdminPage
      gateway={gateway}
      tenantId="t1"
      currency="COP"
      currentBranchId="b1"
      defaultTimezone="America/Bogota"
    />,
  );
  return gateway;
}

describe('formulario de sucursal', () => {
  it('solo ofrece zonas Región/Ciudad, como exige el servidor', () => {
    const zones = availableTimeZones();
    expect(zones).toContain('America/Bogota');
    expect(zones.every((zone) => zone.includes('/'))).toBe(true);
    expect(parseBranchForm({ name: ' Chapinero ', timezone: 'America/Bogota' }, zones)).toEqual({
      ok: true,
      value: { name: 'Chapinero', timezone: 'America/Bogota' },
    });
    expect(parseBranchForm({ name: '', timezone: 'Marte/Olympus' }, zones)).toMatchObject({
      ok: false,
      error: { name: expect.any(String), timezone: expect.any(String) },
    });
  });
});

describe('BranchesAdminPage', () => {
  it('lista las sucursales con su estado en texto y marca la actual', async () => {
    renderPage();
    const list = await screen.findByRole('list', { name: 'Sucursales de la empresa' });
    const centro = within(list).getByText('Centro').closest('li') as HTMLElement;
    expect(within(centro).getByText('Sucursal actual')).toBeTruthy();
    // La sucursal actual no se archiva desde aquí.
    expect(within(centro).queryByRole('button', { name: 'Archivar sucursal' })).toBeNull();
    const usaquen = within(list).getByText('Usaquén').closest('li') as HTMLElement;
    expect(within(usaquen).getByText('Archivada')).toBeTruthy();
    expect(within(usaquen).getByRole('button', { name: 'Restaurar sucursal' })).toBeTruthy();
  });

  it('crea una sucursal en la moneda de la empresa', async () => {
    const gateway = renderPage();
    const card = await screen.findByRole('region', { name: 'Nueva sucursal' });
    fireEvent.change(within(card).getByLabelText('Nombre de la sucursal'), {
      target: { value: 'Chapinero' },
    });
    fireEvent.click(within(card).getByRole('button', { name: 'Crear sucursal' }));
    await waitFor(() =>
      expect(gateway.createBranch).toHaveBeenCalledWith('t1', 'COP', {
        name: 'Chapinero',
        timezone: 'America/Bogota',
      }),
    );
    expect(await screen.findByText(/Sucursal «Chapinero» creada/)).toBeTruthy();
  });

  it('archivar pide confirmación y explica el efecto; el rechazo del servidor se muestra', async () => {
    const gateway = renderPage(
      fakeGateway({
        updateBranch: vi.fn(async () =>
          err({
            kind: 'rejected' as const,
            message: 'Cierra las mesas abiertas antes de archivar la sucursal',
          }),
        ),
      }),
    );
    const list = await screen.findByRole('list', { name: 'Sucursales de la empresa' });
    const norte = within(list).getByText('Norte').closest('li') as HTMLElement;
    fireEvent.click(within(norte).getByRole('button', { name: 'Archivar sucursal' }));
    const dialog = screen.getByRole('dialog', { name: '¿Archivar la sucursal Norte?' });
    expect(within(dialog).getByText(/los QR de sus mesas dejarán de abrir la carta/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Archivar sucursal' }));
    expect(
      await screen.findByText('Cierra las mesas abiertas antes de archivar la sucursal'),
    ).toBeTruthy();
    expect(gateway.updateBranch).toHaveBeenCalledWith('t1', 'b2', {
      name: 'Norte',
      timezone: 'America/Bogota',
      archived: true,
    });
  });
});
