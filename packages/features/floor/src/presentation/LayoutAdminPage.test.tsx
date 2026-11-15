// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { err, ok } from '@tavelyo/core';
import type { FloorAdminGateway, SectorAdmin } from '../domain/index.ts';
import { LayoutAdminPage } from './LayoutAdminPage.tsx';
import { PrintQrPage } from './PrintQrPage.tsx';
import { qrPath } from './TableQrCode.tsx';

beforeAll(() => {
  // jsdom no implementa <dialog>: basta con alternar `open` (el foco real se prueba en Playwright).
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

const scope = { tenantId: 't1', branchId: 'b1' };
const sectors: SectorAdmin[] = [
  {
    id: 's1',
    name: 'Salón',
    sort: 1,
    archived: false,
    tables: [
      { id: 'm1', code: 'M1', seats: 4, qrPublicId: 'qr-m1', archived: false },
      { id: 'm2', code: 'M2', seats: 2, qrPublicId: 'qr-m2', archived: true },
    ],
  },
  { id: 's2', name: 'Terraza vieja', sort: 2, archived: true, tables: [] },
];

function fakeGateway(overrides: Partial<FloorAdminGateway> = {}): FloorAdminGateway {
  return {
    layout: vi.fn(async () => ok(sectors)),
    createSector: vi.fn(async () => ok(undefined)),
    updateSector: vi.fn(async () => ok(undefined)),
    createTable: vi.fn(async () => ok(undefined)),
    updateTable: vi.fn(async () => ok(undefined)),
    rotateQr: vi.fn(async () => ok(undefined)),
    ...overrides,
  };
}

function renderPage(gateway = fakeGateway()) {
  render(
    <LayoutAdminPage
      gateway={gateway}
      scope={scope}
      branchName="Centro"
      menuWebUrl="https://carta.example"
      printLink={<a href="/mesas/imprimir">Imprimir códigos QR</a>}
    />,
  );
  return gateway;
}

describe('LayoutAdminPage', () => {
  it('muestra sectores y mesas con su estado en texto, no solo con color', async () => {
    renderPage();
    const salon = await screen.findByRole('region', { name: 'Salón' });
    expect(within(salon).getByText('Mesa M1')).toBeTruthy();
    expect(within(salon).getByText('Activa')).toBeTruthy();
    expect(within(salon).getByText('Archivada')).toBeTruthy();
    expect(
      within(screen.getByRole('region', { name: 'Terraza vieja' })).getByText('Archivado'),
    ).toBeTruthy();
  });

  it('valida en el cliente antes de llamar al servidor', async () => {
    const gateway = renderPage();
    await screen.findByText('Mesa M1');
    fireEvent.click(screen.getByRole('button', { name: 'Agregar sector' }));
    expect(await screen.findByText('Escribe el nombre del sector.')).toBeTruthy();
    expect(gateway.createSector).not.toHaveBeenCalled();
  });

  it('agrega una mesa y vuelve a leer el salón del servidor', async () => {
    const gateway = renderPage();
    const salon = await screen.findByRole('region', { name: 'Salón' });
    fireEvent.change(within(salon).getByLabelText('Código de la mesa'), {
      target: { value: 'M3' },
    });
    fireEvent.click(within(salon).getByRole('button', { name: 'Agregar mesa' }));
    expect(await screen.findByText('Mesa M3 agregada.')).toBeTruthy();
    expect(gateway.createTable).toHaveBeenCalledWith(scope, {
      sectorId: 's1',
      code: 'M3',
      seats: 4,
    });
    await waitFor(() => expect(gateway.layout).toHaveBeenCalledTimes(2));
  });

  it('muestra el motivo que da el servidor cuando rechaza un cambio', async () => {
    const gateway = renderPage(
      fakeGateway({
        updateTable: vi.fn(async () =>
          err({ kind: 'rejected' as const, message: 'Cierra la mesa antes de archivarla' }),
        ),
      }),
    );
    await screen.findByText('Mesa M1');
    fireEvent.click(screen.getByRole('button', { name: 'Archivar mesa' }));
    expect(await screen.findByText('Cierra la mesa antes de archivarla')).toBeTruthy();
    expect(gateway.layout).toHaveBeenCalledTimes(1);
  });

  it('muestra el QR con la dirección pública de la mesa', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Ver QR' }));
    expect(screen.getByRole('img', { name: 'Código QR de la mesa M1' })).toBeTruthy();
    expect(screen.getByText('https://carta.example/mesa/qr-m1')).toBeTruthy();
  });

  it('generar un QR nuevo pide confirmación y explica el efecto', async () => {
    const gateway = renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Generar QR nuevo' }));
    const dialog = screen.getByRole('dialog', { name: '¿Generar un QR nuevo para la mesa M1?' });
    expect(within(dialog).getByText(/dejará de abrir la carta/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Generar QR nuevo' }));
    await waitFor(() => expect(gateway.rotateQr).toHaveBeenCalledWith(scope, 'm1'));
    expect(await screen.findByText(/QR de la mesa M1 renovado/)).toBeTruthy();
  });

  it('un error de carga se distingue de no tener datos y permite reintentar', async () => {
    const layout = vi
      .fn()
      .mockResolvedValueOnce(err({ kind: 'network' as const }))
      .mockResolvedValueOnce(ok([]));
    renderPage(fakeGateway({ layout }));
    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('heading', { name: 'Todavía no hay sectores' })).toBeTruthy();
  });
});

describe('PrintQrPage', () => {
  it('solo imprime las mesas activas de sectores activos', async () => {
    render(
      <PrintQrPage
        gateway={fakeGateway()}
        scope={scope}
        branchName="Centro"
        menuWebUrl="https://carta.example"
        backLink={<a href="/mesas">Volver</a>}
      />,
    );
    const sheet = await screen.findByRole('list', { name: 'Códigos QR de las mesas' });
    expect(
      within(sheet)
        .getAllByRole('img')
        .map((img) => img.getAttribute('aria-label')),
    ).toEqual(['Código QR de la mesa M1']);
    expect(screen.getByRole('button', { name: 'Imprimir' })).toBeTruthy();
  });
});

describe('qrPath', () => {
  it('genera un código con zona de silencio y es estable para la misma dirección', () => {
    const first = qrPath('https://carta.example/mesa/qr-m1');
    expect(first.size).toBeGreaterThanOrEqual(21 + 8);
    expect(first.path).toMatch(/^M\d+ \d+h1v1h-1z/);
    expect(qrPath('https://carta.example/mesa/qr-m1')).toEqual(first);
    expect(qrPath('https://carta.example/mesa/otra').path).not.toBe(first.path);
  });
});
