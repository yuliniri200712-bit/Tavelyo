// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { err, ok } from '@tavelyo/core';
import type {
  FloorError,
  FloorSector,
  FloorServiceGateway,
  SessionParticipant,
} from '../domain/index.ts';
import type { LiveObserver } from '@tavelyo/core';
import { FloorServicePage } from './FloorServicePage.tsx';

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
const now = () => new Date('2026-11-16T01:00:00Z');
// 00:42 UTC del 16 = 19:42 del 15 en Bogotá.
const sectors: FloorSector[] = [
  {
    id: 's1',
    name: 'Terraza',
    tables: [
      { id: 'm1', code: '1', seats: 4, session: null },
      {
        id: 'm2',
        code: '2',
        seats: 2,
        session: {
          id: 'ses2',
          openedAt: new Date('2026-11-16T00:42:00Z'),
          activity: {
            inKitchen: 2,
            ready: 1,
            pickedUp: 0,
            requests: [{ kind: 'REQUEST_BILL', createdAt: new Date('2026-11-16T00:58:00Z') }],
          },
        },
      },
    ],
  },
  { id: 's2', name: 'Bodega', tables: [] },
];
const people: SessionParticipant[] = [
  {
    id: 'p1',
    joinedAt: new Date('2026-11-16T00:45:00Z'),
    expiresAt: new Date('2026-11-16T04:45:00Z'),
    removedAt: null,
  },
  {
    id: 'p2',
    joinedAt: new Date('2026-11-16T00:50:00Z'),
    expiresAt: new Date('2026-11-16T04:50:00Z'),
    removedAt: new Date('2026-11-16T00:55:00Z'),
  },
];

type FloorObserver = LiveObserver<readonly FloorSector[], FloorError>;
let observer: FloorObserver | null = null;

function fakeGateway(overrides: Partial<FloorServiceGateway> = {}): FloorServiceGateway {
  return {
    floor: vi.fn(async () => ok(sectors)),
    watchFloor: vi.fn((_scope, next: FloorObserver) => {
      observer = next;
      return () => undefined;
    }),
    participants: vi.fn(async () => ok(people)),
    openTable: vi.fn(async () => ok(undefined)),
    transfer: vi.fn(async () => ok(undefined)),
    closeSession: vi.fn(async () => ok(undefined)),
    removeParticipant: vi.fn(async () => ok(undefined)),
    ...overrides,
  };
}

function renderPage(
  gateway = fakeGateway(),
  canClose = true,
  slots: Pick<Parameters<typeof FloorServicePage>[0], 'requestsPanel' | 'renderOrders'> = {},
) {
  render(
    <FloorServicePage
      gateway={gateway}
      scope={scope}
      branchName="Centro"
      timezone="America/Bogota"
      canClose={canClose}
      now={now}
      {...slots}
    />,
  );
  return gateway;
}

async function tableItem(code: string) {
  const list = await screen.findByRole('list', { name: 'Mesas de Terraza' });
  return within(list).getByText(`Mesa ${code}`).closest('li') as HTMLElement;
}

describe('FloorServicePage', () => {
  it('muestra cada mesa libre o abierta en texto, con la hora de la sucursal', async () => {
    renderPage();
    expect(await screen.findByText('Centro · 1 mesa abierta · 1 libre')).toBeTruthy();
    const free = await tableItem('1');
    expect(within(free).getByText('Libre')).toBeTruthy();
    expect(within(free).getByRole('button', { name: 'Abrir mesa' })).toBeTruthy();
    const open = await tableItem('2');
    expect(within(open).getByText('Abierta')).toBeTruthy();
    expect(within(open).getByText('Abierta desde las 19:42')).toBeTruthy();
    // RF-ME-01: pedidos y solicitudes de la mesa, en texto.
    expect(within(open).getByText('2 líneas en cocina · 1 lista para recoger')).toBeTruthy();
    expect(within(open).getByText('Pidió la cuenta a las 19:58')).toBeTruthy();
    expect(within(open).getByText('Solicitud pendiente')).toBeTruthy();
    expect(within(open).getByText('Platos listos')).toBeTruthy();
    expect(screen.getByText('En vivo')).toBeTruthy();
    // Un sector sin mesas no ocupa la pantalla del servicio.
    expect(screen.queryByRole('heading', { name: 'Bodega' })).toBeNull();
  });

  it('abre una mesa libre y vuelve a leer el salón', async () => {
    const gateway = renderPage();
    fireEvent.click(within(await tableItem('1')).getByRole('button', { name: 'Abrir mesa' }));
    expect(
      await screen.findByText('Mesa 1 abierta. Los clientes ya pueden unirse desde el QR.'),
    ).toBeTruthy();
    expect(gateway.openTable).toHaveBeenCalledWith(scope, 'm1');
    await waitFor(() => expect(gateway.floor).toHaveBeenCalledTimes(2));
  });

  it('si otra persona abrió la mesa antes, lo explica', async () => {
    renderPage(
      fakeGateway({
        openTable: vi.fn(async () =>
          err({
            kind: 'rejected' as const,
            message: 'La mesa ya está abierta. Actualiza el salón para verla.',
          }),
        ),
      }),
    );
    fireEvent.click(within(await tableItem('1')).getByRole('button', { name: 'Abrir mesa' }));
    expect(
      await screen.findByText('La mesa ya está abierta. Actualiza el salón para verla.'),
    ).toBeTruthy();
  });

  it('cerrar la mesa pide confirmación y explica que los clientes pierden el acceso', async () => {
    const gateway = renderPage();
    fireEvent.click(within(await tableItem('2')).getByRole('button', { name: 'Cerrar mesa' }));
    const dialog = screen.getByRole('dialog', { name: '¿Cerrar la mesa 2?' });
    expect(within(dialog).getByText(/pierden el acceso/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cerrar mesa' }));
    expect(await screen.findByText('Mesa 2 cerrada. Quedó libre.')).toBeTruthy();
    expect(gateway.closeSession).toHaveBeenCalledWith(scope, 'ses2');
  });

  it('lista las personas de la mesa sin datos de su cuenta y retira a una', async () => {
    const gateway = renderPage();
    const open = await tableItem('2');
    const toggle = within(open).getByRole('button', { name: 'Ver personas en la mesa' });
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    const list = await screen.findByRole('list', { name: 'Personas en la mesa 2' });
    const first = within(list).getByText('Persona 1').closest('li') as HTMLElement;
    expect(within(first).getByText('En la mesa')).toBeTruthy();
    expect(within(first).getByText('Se unió a las 19:45')).toBeTruthy();
    const second = within(list).getByText('Persona 2').closest('li') as HTMLElement;
    expect(within(second).getByText('Retirada')).toBeTruthy();
    expect(within(second).queryByRole('button', { name: 'Retirar de la mesa' })).toBeNull();
    expect(gateway.participants).toHaveBeenCalledWith(scope, 'ses2');

    fireEvent.click(within(first).getByRole('button', { name: 'Retirar de la mesa' }));
    const dialog = screen.getByRole('dialog', { name: '¿Retirar a la persona 1 de la mesa 2?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Retirar de la mesa' }));
    expect(await screen.findByText('Persona 1 retirada de la mesa 2.')).toBeTruthy();
    expect(gateway.removeParticipant).toHaveBeenCalledWith(scope, 'p1');
  });

  it('sin session.close no ofrece cerrar ni retirar (el servidor también lo rechaza)', async () => {
    renderPage(fakeGateway(), false);
    const open = await tableItem('2');
    expect(within(open).queryByRole('button', { name: 'Cerrar mesa' })).toBeNull();
    fireEvent.click(within(open).getByRole('button', { name: 'Ver personas en la mesa' }));
    await screen.findByRole('list', { name: 'Personas en la mesa 2' });
    expect(screen.queryByRole('button', { name: 'Retirar de la mesa' })).toBeNull();
  });

  it('sin mesas explica dónde se crean', async () => {
    const gateway = fakeGateway({ floor: vi.fn(async () => ok([])) });
    renderPage(gateway);
    expect(await screen.findByText('Todavía no hay mesas')).toBeTruthy();
  });

  it('un rechazo del servidor al cargar se muestra con su motivo', async () => {
    renderPage(
      fakeGateway({
        floor: vi.fn(async () =>
          err({ kind: 'rejected' as const, message: 'Sin acceso a la sucursal' }),
        ),
      }),
    );
    expect(await screen.findByText('No se pudo cargar el salón')).toBeTruthy();
    expect(screen.getByText('Sin acceso a la sucursal')).toBeTruthy();
  });

  it('se actualiza solo con cada cambio que llega del servidor', async () => {
    renderPage();
    await tableItem('1');
    const [terraza] = sectors;
    if (!terraza) throw new Error('sin sector');
    const opened = {
      ...terraza,
      tables: terraza.tables.map((table) =>
        table.id === 'm1'
          ? {
              ...table,
              session: {
                id: 'ses1',
                openedAt: new Date('2026-11-16T00:59:00Z'),
                activity: {
                  inKitchen: 0,
                  ready: 0,
                  pickedUp: 0,
                  requests: [
                    { kind: 'CALL_WAITER' as const, createdAt: new Date('2026-11-16T01:00:00Z') },
                  ],
                },
              },
            }
          : table,
      ),
    };
    act(() => observer?.onData([opened]));
    const first = await tableItem('1');
    expect(within(first).getByText('Abierta')).toBeTruthy();
    expect(within(first).getByText('Sin pedidos en curso')).toBeTruthy();
    expect(within(first).getByText('Llamó al mesero a las 20:00')).toBeTruthy();
    expect(screen.getByText('Centro · 2 mesas abiertas · 0 libres')).toBeTruthy();
  });

  it('sin conexión lo dice y no deja abrir ni cerrar mesas', async () => {
    renderPage();
    const free = await tableItem('1');
    act(() => observer?.onError({ kind: 'network' }));
    expect(screen.getByText('Sin conexión con el servidor.')).toBeTruthy();
    expect(screen.getByText(/No puedes abrir ni cerrar mesas/)).toBeTruthy();
    const openButton = within(free).getByRole('button', {
      name: 'Abrir mesa',
    }) as HTMLButtonElement;
    expect(openButton.disabled).toBe(true);
  });

  it('muestra las solicitudes arriba y los pedidos de la mesa al pedirlos', async () => {
    const renderOrders = vi.fn((_session, tableCode: string) => (
      <p>Pedidos de la mesa {tableCode}</p>
    ));
    renderPage(fakeGateway(), true, {
      requestsPanel: <p>Solicitudes pendientes</p>,
      renderOrders,
    });
    expect(await screen.findByText('Solicitudes pendientes')).toBeTruthy();
    const open = await tableItem('2');
    const toggle = within(open).getByRole('button', { name: 'Ver pedidos' });
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(within(open).getByText('Pedidos de la mesa 2')).toBeTruthy();
    expect(renderOrders).toHaveBeenCalledWith(expect.objectContaining({ id: 'ses2' }), '2');
    // Una mesa libre no tiene pedidos que ver.
    expect(within(await tableItem('1')).queryByRole('button', { name: 'Ver pedidos' })).toBeNull();
  });
});
