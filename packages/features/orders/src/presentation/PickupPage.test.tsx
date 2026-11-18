// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { err, ok } from '@tavelyo/core';
import type { PickupItem, PickupObserver, StaffOrdersGateway } from '../domain/index.ts';
import { PickupPage } from './PickupPage.tsx';

const NOW = new Date('2026-11-16T18:10:00Z');
const scope = { tenantId: 't1', branchId: 'b1' };

const item = (overrides: Partial<PickupItem>): PickupItem => ({
  id: 'l1',
  version: 3,
  status: 'READY',
  quantity: 2,
  productName: 'Bandeja paisa',
  modifiers: ['Bien asada'],
  note: 'Sin cebolla',
  stationName: 'Cocina',
  tableCode: 'M1',
  readyAt: new Date('2026-11-16T18:06:00Z'),
  ...overrides,
});

function fakeGateway(items: readonly PickupItem[] = [item({})]) {
  let observer: PickupObserver | null = null;
  const done = async () => ok(undefined);
  const gateway = {
    pickupQueue: vi.fn(async () => ok(items)),
    watchPickupQueue: vi.fn((_scope, next: PickupObserver) => {
      observer = next;
      return () => undefined;
    }),
    pickUp: vi.fn<StaffOrdersGateway['pickUp']>(done),
    deliver: vi.fn<StaffOrdersGateway['deliver']>(done),
    sessionOrders: vi.fn(async () => ok([])),
    watchSessionOrders: vi.fn(() => () => undefined),
    deliverDirectly: vi.fn(done),
    cancel: vi.fn(done),
  } satisfies StaffOrdersGateway;
  return {
    gateway,
    push: (next: readonly PickupItem[]) => act(() => observer?.onData(next)),
    fail: () => act(() => observer?.onError({ kind: 'network' })),
  };
}

function renderPage(gateway: StaffOrdersGateway, canDeliver = true) {
  render(
    <PickupPage
      gateway={gateway}
      scope={scope}
      branchName="Centro"
      timezone="America/Bogota"
      canDeliver={canDeliver}
      now={() => NOW}
    />,
  );
}

const line = async (name: RegExp) =>
  (await screen.findByRole('heading', { name })).closest('li') as HTMLElement;

describe('PickupPage', () => {
  it('muestra mesa, cantidad, espera, estación, opciones y nota, sin importes', async () => {
    const { gateway } = fakeGateway([
      item({}),
      item({ id: 'l2', status: 'PICKED_UP', tableCode: 'T4' }),
    ]);
    renderPage(gateway);
    const ready = await line(/Mesa M1 · 2 × Bandeja paisa/);
    expect(within(ready).getByText('Listo para recoger')).toBeTruthy();
    // La espera se ve grande («4 min») y se lee completa; la estación va junto al estado.
    expect(within(ready).getByText('4 min')).toBeTruthy();
    expect(within(ready).getByText('Lista hace 4 minutos')).toBeTruthy();
    expect(within(ready).getByText('Cocina')).toBeTruthy();
    expect(within(ready).getByText('Opciones: Bien asada')).toBeTruthy();
    expect(within(ready).getByText('Sin cebolla')).toBeTruthy();
    expect(
      within(ready).getByRole('button', { name: 'Recogido 2 × Bandeja paisa, mesa M1' }),
    ).toBeTruthy();
    const picked = await line(/Mesa T4/);
    expect(within(picked).getByText('Recogido')).toBeTruthy();
    expect(within(picked).getByRole('button', { name: /^Entregado/ })).toBeTruthy();
    expect(screen.getByText('1 lista para recoger · 1 recogida por entregar')).toBeTruthy();
    expect(screen.queryByText(/\$/)).toBeNull();
    expect(screen.getByText('En vivo')).toBeTruthy();
  });

  it('«Recogido» envía la versión vista, avisa y vuelve a leer', async () => {
    const { gateway } = fakeGateway();
    renderPage(gateway);
    fireEvent.click(within(await line(/Mesa M1/)).getByRole('button', { name: /^Recogido/ }));
    expect(await screen.findByText('Recogido: 2 × Bandeja paisa, mesa M1.')).toBeTruthy();
    expect(gateway.pickUp).toHaveBeenCalledWith(
      scope,
      expect.objectContaining({ id: 'l1', version: 3 }),
    );
    await waitFor(() => expect(gateway.pickupQueue).toHaveBeenCalledTimes(2));
  });

  it('si otra persona se adelantó, lo explica', async () => {
    const { gateway } = fakeGateway();
    gateway.pickUp.mockResolvedValueOnce(
      err({ kind: 'rejected', message: 'Esta línea ya cambió' }),
    );
    renderPage(gateway);
    fireEvent.click(within(await line(/Mesa M1/)).getByRole('button', { name: /^Recogido/ }));
    expect(
      await screen.findByText('Esta línea ya cambió. La pantalla muestra el estado actual.'),
    ).toBeTruthy();
  });

  it('sin delivery.deliver no ofrece «Entregado»', async () => {
    const { gateway } = fakeGateway([item({ status: 'PICKED_UP' })]);
    renderPage(gateway, false);
    expect(within(await line(/Mesa M1/)).queryByRole('button', { name: /^Entregado/ })).toBeNull();
  });

  it('anuncia en texto el plato que queda listo y, sin conexión, no deja marcar', async () => {
    const { gateway, push, fail } = fakeGateway();
    renderPage(gateway);
    await line(/Mesa M1/);
    await push([item({}), item({ id: 'l2', tableCode: 'T4', productName: 'Ajiaco' })]);
    expect(screen.getByText('Plato listo: mesa T4.')).toBeTruthy();
    await fail();
    expect(screen.getByText('Sin conexión con el servidor.')).toBeTruthy();
    expect(screen.getByText(/No puedes recoger ni entregar/)).toBeTruthy();
    const button = within(await line(/Mesa T4/)).getByRole('button', { name: /^Recogido/ });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it('sin platos listos lo explica', async () => {
    const { gateway } = fakeGateway([]);
    renderPage(gateway);
    expect(await screen.findByText('No hay platos listos')).toBeTruthy();
  });
});
