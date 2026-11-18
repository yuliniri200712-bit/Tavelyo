// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ok } from '@tavelyo/core';
import type { SessionOrder, StaffOrdersGateway } from '../domain/index.ts';
import { SessionOrdersPanel } from './SessionOrdersPanel.tsx';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

const scope = { tenantId: 't1', branchId: 'b1' };
const base = { modifiers: [], note: null, cancelReason: null, quantity: 1 };
const orders: SessionOrder[] = [
  {
    id: 'o1',
    sentAt: new Date('2026-11-16T00:45:00Z'),
    items: [
      { ...base, id: 'l1', version: 2, status: 'IN_PREPARATION', productName: 'Ajiaco' },
      { ...base, id: 'l2', version: 3, status: 'READY', productName: 'Limonada', quantity: 2 },
      {
        ...base,
        id: 'l3',
        version: 2,
        status: 'CANCELLED',
        productName: 'Arepa',
        cancelReason: 'Se acabó',
      },
    ],
  },
];

function fakeGateway() {
  const done = async () => ok(undefined);
  return {
    pickupQueue: vi.fn(async () => ok([])),
    watchPickupQueue: vi.fn(() => () => undefined),
    pickUp: vi.fn(done),
    deliver: vi.fn(done),
    sessionOrders: vi.fn(async () => ok(orders)),
    watchSessionOrders: vi.fn(() => () => undefined),
    deliverDirectly: vi.fn<StaffOrdersGateway['deliverDirectly']>(done),
    cancel: vi.fn<StaffOrdersGateway['cancel']>(done),
  } satisfies StaffOrdersGateway;
}

function renderPanel(gateway: StaffOrdersGateway, canCancel = true, canDeliverDirectly = true) {
  render(
    <SessionOrdersPanel
      gateway={gateway}
      scope={scope}
      sessionId="ses1"
      tableCode="M1"
      timezone="America/Bogota"
      canCancel={canCancel}
      canDeliverDirectly={canDeliverDirectly}
    />,
  );
}

const lineOf = async (name: string) => (await screen.findByText(name)).closest('li') as HTMLElement;

describe('SessionOrdersPanel', () => {
  it('muestra cada pedido con su estado derivado y el estado de cada línea en texto', async () => {
    const gateway = fakeGateway();
    renderPanel(gateway);
    expect(
      await screen.findByRole('heading', { name: 'Pedido de las 19:45 · Parcialmente listo' }),
    ).toBeTruthy();
    expect(within(await lineOf('1 × Ajiaco')).getByText('En preparación')).toBeTruthy();
    expect(within(await lineOf('2 × Limonada')).getByText('Listo para recoger')).toBeTruthy();
    const cancelled = await lineOf('1 × Arepa');
    expect(within(cancelled).getByText('Cancelado')).toBeTruthy();
    expect(within(cancelled).getByText('Motivo de la cancelación: Se acabó')).toBeTruthy();
    expect(within(cancelled).queryByRole('button')).toBeNull();
    expect(gateway.watchSessionOrders).toHaveBeenCalledWith(scope, 'ses1', expect.any(Object));
  });

  it('cancelar exige motivo, avisa la merma y envía la versión vista', async () => {
    const gateway = fakeGateway();
    renderPanel(gateway);
    fireEvent.click(within(await lineOf('1 × Ajiaco')).getByRole('button', { name: /^Cancelar/ }));
    const dialog = screen.getByRole('dialog', { name: '¿Cancelar 1 × Ajiaco?' });
    expect(within(dialog).getByText(/quedará registrada como merma/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar línea' }));
    expect(within(dialog).getByText(/Escribe el motivo/)).toBeTruthy();
    expect(gateway.cancel).not.toHaveBeenCalled();
    fireEvent.change(within(dialog).getByLabelText('Motivo de la cancelación'), {
      target: { value: ' El cliente se fue ' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar línea' }));
    await waitFor(() =>
      expect(gateway.cancel).toHaveBeenCalledWith(
        scope,
        expect.objectContaining({ id: 'l1', version: 2 }),
        'El cliente se fue',
      ),
    );
    expect(await screen.findByText('1 × Ajiaco cancelado.')).toBeTruthy();
  });

  it('entrega sin recoger una línea lista, con motivo', async () => {
    const gateway = fakeGateway();
    renderPanel(gateway);
    fireEvent.click(
      within(await lineOf('2 × Limonada')).getByRole('button', { name: /^Entregar sin recoger/ }),
    );
    const dialog = screen.getByRole('dialog', { name: '¿Entregar 2 × Limonada sin recoger?' });
    fireEvent.change(within(dialog).getByLabelText('Motivo'), {
      target: { value: 'La llevó el bartender' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Entregar sin recoger' }));
    await waitFor(() =>
      expect(gateway.deliverDirectly).toHaveBeenCalledWith(
        scope,
        expect.objectContaining({ id: 'l2', version: 3 }),
        'La llevó el bartender',
      ),
    );
  });

  it('sin permisos solo muestra los estados', async () => {
    renderPanel(fakeGateway(), false, false);
    await lineOf('1 × Ajiaco');
    expect(screen.queryByRole('button', { name: /^Cancelar/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Entregar sin recoger/ })).toBeNull();
  });
});
