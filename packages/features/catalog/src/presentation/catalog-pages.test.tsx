// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { err, ok } from '@tavelyo/core';
import type {
  BranchProduct,
  CatalogAdmin,
  CatalogAdminGateway,
  StationAdmin,
} from '../domain/index.ts';
import { BranchMenuPage } from './BranchMenuPage.tsx';
import { CatalogAdminPage } from './CatalogAdminPage.tsx';
import { StationsAdminPage } from './StationsAdminPage.tsx';

beforeAll(() => {
  // jsdom no implementa <dialog>: basta con alternar `open` (el foco real se prueba en Playwright).
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

const catalog: CatalogAdmin = {
  taxRules: [{ id: 'tx1', name: 'Impoconsumo', rateBp: 800, archived: false }],
  categories: [
    {
      id: 'c1',
      name: 'Platos fuertes',
      sort: 1,
      archived: false,
      products: [
        {
          id: 'p1',
          name: 'Bandeja paisa',
          description: 'Con chicharrón',
          allergens: ['huevo'],
          sort: 1,
          taxRuleId: 'tx1',
          archived: false,
          groups: [
            {
              id: 'g1',
              name: 'Término',
              minSelect: 1,
              maxSelect: 1,
              sort: 1,
              archived: false,
              options: [
                { id: 'o1', name: 'Bien asada', priceDeltaMinor: '0', sort: 1, archived: false },
                {
                  id: 'o2',
                  name: 'Con aguacate',
                  priceDeltaMinor: '540000',
                  sort: 2,
                  archived: false,
                },
              ],
            },
          ],
        },
        {
          id: 'p2',
          name: 'Ajiaco',
          description: null,
          allergens: [],
          sort: 2,
          taxRuleId: null,
          archived: false,
          groups: [],
        },
      ],
    },
  ],
};

const branchProducts: BranchProduct[] = [
  {
    productId: 'p1',
    available: true,
    schedule: null,
    currentPrice: {
      id: 'pr1',
      amountMinor: '3200000',
      currency: 'COP',
      validFrom: '2026-11-14T00:00:00Z',
    },
    stationId: null,
  },
];

const stations: StationAdmin[] = [
  { id: 's1', name: 'Cocina', sort: 0, isDefault: true, archived: false },
  { id: 's2', name: 'Bar', sort: 1, isDefault: false, archived: false },
  { id: 's3', name: 'Parrilla', sort: 2, isDefault: false, archived: true },
];

function fakeGateway(overrides: Partial<CatalogAdminGateway> = {}): CatalogAdminGateway {
  const done = vi.fn(async () => ok(undefined));
  return {
    catalog: vi.fn(async () => ok(catalog)),
    branchProducts: vi.fn(async () => ok(branchProducts)),
    createTaxRule: done,
    updateTaxRule: done,
    createCategory: vi.fn(async () => ok(undefined)),
    updateCategory: done,
    createProduct: done,
    updateProduct: done,
    createModifierGroup: done,
    updateModifierGroup: done,
    createModifierOption: done,
    updateModifierOption: done,
    setAvailability: vi.fn(async () => ok(undefined)),
    changePrice: vi.fn(async () => ok(undefined)),
    stations: vi.fn(async () => ok(stations)),
    createStation: vi.fn(async () => ok(undefined)),
    updateStation: vi.fn(async () => ok(undefined)),
    setProductStation: vi.fn(async () => ok(undefined)),
    ...overrides,
  };
}

const scope = { tenantId: 't1', branchId: 'b1' };

describe('CatalogAdminPage', () => {
  it('el propietario ve impuestos, productos, alérgenos declarados y opciones con su valor', async () => {
    render(
      <CatalogAdminPage
        gateway={fakeGateway()}
        tenantId="t1"
        currency="COP"
        canEditCatalog
        canEditTaxes
      />,
    );
    const taxes = await screen.findByRole('region', { name: 'Impuestos' });
    expect(within(taxes).getByText('8 %')).toBeTruthy();
    expect(screen.getByText('Alérgenos declarados: huevo')).toBeTruthy();
    expect(screen.getByText('Sin alérgenos declarados')).toBeTruthy();
    expect(screen.getByText('Impoconsumo 8 % incluido')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Opciones (1)' }));
    expect(screen.getByText('Elige 1')).toBeTruthy();
    expect(screen.getByText('+ $ 5.400')).toBeTruthy();
    expect(screen.getByText('Sin costo adicional')).toBeTruthy();
  });

  it('agrega una categoría y vuelve a leer la carta', async () => {
    const gateway = fakeGateway();
    render(
      <CatalogAdminPage
        gateway={gateway}
        tenantId="t1"
        currency="COP"
        canEditCatalog
        canEditTaxes
      />,
    );
    const card = await screen.findByRole('region', { name: 'Nueva categoría' });
    fireEvent.change(within(card).getByLabelText('Nombre de la categoría'), {
      target: { value: 'Postres' },
    });
    fireEvent.click(within(card).getByRole('button', { name: 'Agregar categoría' }));
    expect(await screen.findByText('Categoría «Postres» agregada.')).toBeTruthy();
    expect(gateway.createCategory).toHaveBeenCalledWith('t1', { name: 'Postres', sort: 0 });
    await waitFor(() => expect(gateway.catalog).toHaveBeenCalledTimes(2));
  });

  it('el administrador de sucursal la consulta sin controles de edición', async () => {
    render(
      <CatalogAdminPage
        gateway={fakeGateway()}
        tenantId="t1"
        currency="COP"
        canEditCatalog={false}
        canEditTaxes={false}
      />,
    );
    await screen.findByText('Bandeja paisa');
    expect(screen.getByText(/Solo el propietario puede modificarlos/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Editar|Archivar|Agregar/ })).toBeNull();
  });

  it('distingue el error de carga y permite reintentar', async () => {
    const load = vi
      .fn()
      .mockResolvedValueOnce(err({ kind: 'network' as const }))
      .mockResolvedValueOnce(ok(catalog));
    render(
      <CatalogAdminPage
        gateway={fakeGateway({ catalog: load })}
        tenantId="t1"
        currency="COP"
        canEditCatalog
        canEditTaxes
      />,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Bandeja paisa')).toBeTruthy();
  });
});

function renderBranch(gateway = fakeGateway(), permissions = { availability: true, price: true }) {
  render(
    <BranchMenuPage
      gateway={gateway}
      scope={scope}
      branchName="Centro"
      currency="COP"
      canManageAvailability={permissions.availability}
      canChangePrice={permissions.price}
    />,
  );
  return gateway;
}

describe('BranchMenuPage', () => {
  it('muestra el estado de cada producto en texto y el precio con formato de pesos', async () => {
    renderBranch();
    const bandeja = (await screen.findByText('Bandeja paisa')).closest('li') as HTMLElement;
    expect(within(bandeja).getByText('En la carta')).toBeTruthy();
    expect(within(bandeja).getByText(/Precio: \$ 32\.000/)).toBeTruthy();
    const ajiaco = screen.getByText('Ajiaco').closest('li') as HTMLElement;
    expect(within(ajiaco).getByText('No está en esta sucursal')).toBeTruthy();
  });

  it('cambiar el precio pide confirmación con el importe anterior y el nuevo', async () => {
    const gateway = renderBranch();
    const bandeja = (await screen.findByText('Bandeja paisa')).closest('li') as HTMLElement;
    fireEvent.click(within(bandeja).getByRole('button', { name: 'Editar en esta sucursal' }));
    fireEvent.change(within(bandeja).getByLabelText('Precio nuevo en pesos'), {
      target: { value: '35.000' },
    });
    fireEvent.click(within(bandeja).getByRole('button', { name: 'Cambiar precio' }));
    const dialog = screen.getByRole('dialog', { name: '¿Cambiar el precio de Bandeja paisa?' });
    expect(within(dialog).getByText(/De \$ 32\.000 a \$ 35\.000 en Centro/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cambiar precio' }));
    await waitFor(() =>
      expect(gateway.changePrice).toHaveBeenCalledWith(scope, 'p1', '3500000', 'COP'),
    );
    expect(await screen.findByText('Precio de «Bandeja paisa» cambiado a $ 35.000.')).toBeTruthy();
  });

  it('un precio no válido se explica sin llamar al servidor', async () => {
    const gateway = renderBranch();
    const bandeja = (await screen.findByText('Bandeja paisa')).closest('li') as HTMLElement;
    fireEvent.click(within(bandeja).getByRole('button', { name: 'Editar en esta sucursal' }));
    fireEvent.change(within(bandeja).getByLabelText('Precio nuevo en pesos'), {
      target: { value: '35000,50' },
    });
    fireEvent.click(within(bandeja).getByRole('button', { name: 'Cambiar precio' }));
    expect(within(bandeja).getByText(/Escribe el precio en pesos, sin centavos/)).toBeTruthy();
    expect(gateway.changePrice).not.toHaveBeenCalled();
  });

  it('guarda la disponibilidad con horario y exige elegir días', async () => {
    const gateway = renderBranch();
    const ajiaco = (await screen.findByText('Ajiaco')).closest('li') as HTMLElement;
    fireEvent.click(within(ajiaco).getByRole('button', { name: 'Editar en esta sucursal' }));
    expect(within(ajiaco).getByText(/primero guarda la disponibilidad/)).toBeTruthy();
    fireEvent.click(within(ajiaco).getByLabelText('Solo en un horario'));
    for (const day of ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']) {
      fireEvent.click(within(ajiaco).getByLabelText(day));
    }
    fireEvent.click(within(ajiaco).getByRole('button', { name: 'Guardar disponibilidad' }));
    expect(within(ajiaco).getByText('Elige al menos un día.')).toBeTruthy();
    fireEvent.click(within(ajiaco).getByLabelText('Viernes'));
    fireEvent.click(within(ajiaco).getByRole('button', { name: 'Guardar disponibilidad' }));
    await waitFor(() =>
      expect(gateway.setAvailability).toHaveBeenCalledWith(scope, 'p2', {
        available: true,
        schedule: { daysMask: 16, startMinute: 720, endMinute: 900 },
      }),
    );
  });

  it('sin permisos de sucursal solo se consulta', async () => {
    const gateway = renderBranch(fakeGateway(), { availability: false, price: false });
    await screen.findByText('Bandeja paisa');
    expect(screen.queryByRole('button', { name: 'Editar en esta sucursal' })).toBeNull();
    // Las estaciones se gestionan con catalog.manage: sin ese permiso ni se consultan.
    expect(gateway.stations).not.toHaveBeenCalled();
  });

  it('muestra la estación de cada producto y la cambia entre las activas', async () => {
    const gateway = renderBranch();
    const bandeja = (await screen.findByText('Bandeja paisa')).closest('li') as HTMLElement;
    expect(within(bandeja).getByText(/Estación: Cocina \(predeterminada\)/)).toBeTruthy();
    fireEvent.click(within(bandeja).getByRole('button', { name: 'Editar en esta sucursal' }));
    const select = within(bandeja).getByLabelText('Estación que lo prepara');
    const options = within(select)
      .getAllByRole('option')
      .map((option) => option.textContent);
    expect(options).toEqual(['Cocina (predeterminada)', 'Bar']);
    fireEvent.change(select, { target: { value: 's2' } });
    fireEvent.click(within(bandeja).getByRole('button', { name: 'Guardar estación' }));
    await waitFor(() => expect(gateway.setProductStation).toHaveBeenCalledWith(scope, 'p1', 's2'));
    expect(await screen.findByText('«Bandeja paisa» se prepara en Bar.')).toBeTruthy();
  });
});

describe('StationsAdminPage', () => {
  function renderStations(gateway = fakeGateway()) {
    render(<StationsAdminPage gateway={gateway} scope={scope} branchName="Centro" />);
    return gateway;
  }

  it('lista las estaciones con su estado en texto; la predeterminada no se archiva', async () => {
    renderStations();
    const list = await screen.findByRole('list', { name: 'Estaciones de la sucursal' });
    const items = within(list).getAllByRole('listitem');
    expect(within(items[0] as HTMLElement).getByText('Predeterminada')).toBeTruthy();
    expect(within(items[0] as HTMLElement).queryByRole('button', { name: /Archivar/ })).toBeNull();
    expect(within(items[2] as HTMLElement).getByText('Archivada')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Restaurar Parrilla' })).toBeTruthy();
  });

  it('crea, valida y archiva estaciones', async () => {
    const gateway = renderStations();
    await screen.findByRole('list', { name: 'Estaciones de la sucursal' });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar estación' }));
    expect(screen.getByText('Escribe el nombre de la estación.')).toBeTruthy();
    expect(gateway.createStation).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Nombre de la estación'), {
      target: { value: ' Postres ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar estación' }));
    await waitFor(() =>
      expect(gateway.createStation).toHaveBeenCalledWith(scope, { name: 'Postres', sort: 0 }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Archivar Bar' }));
    await waitFor(() =>
      expect(gateway.updateStation).toHaveBeenCalledWith(scope, 's2', {
        name: 'Bar',
        sort: 1,
        archived: true,
      }),
    );
  });
});
