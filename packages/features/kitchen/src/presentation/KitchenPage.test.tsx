// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { err, ok } from '@tavelyo/core';
import type {
  KitchenGateway,
  KitchenItem,
  KitchenStation,
  QueueObserver,
} from '../domain/index.ts';
import { KitchenPage, type StationMemory } from './KitchenPage.tsx';

beforeAll(() => {
  // jsdom no implementa <dialog>: basta con alternar `open` (el foco real se prueba en Playwright).
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

const NOW = new Date('2026-11-16T18:12:30Z');
const scope = { tenantId: 't1', branchId: 'b1' };

const item = (overrides: Partial<KitchenItem>): KitchenItem => ({
  id: 'l1',
  version: 1,
  status: 'RECEIVED',
  quantity: 2,
  productName: 'Bandeja paisa',
  allergens: ['huevo'],
  note: 'Sin cebolla',
  modifiers: ['Bien asada'],
  tableCode: 'M1',
  orderId: 'o1',
  sentAt: new Date('2026-11-16T18:00:00Z'),
  startedAt: null,
  ...overrides,
});

const COCINA: KitchenStation = { id: 's1', name: 'Cocina', isDefault: true };
const BAR: KitchenStation = { id: 's2', name: 'Bar', isDefault: false };

function fakeGateway(
  stations: readonly KitchenStation[] = [COCINA],
  items: readonly KitchenItem[] = [item({})],
) {
  let observer: QueueObserver | null = null;
  const gateway = {
    stations: vi.fn(async () => ok(stations)),
    queue: vi.fn(async () => ok(items)),
    watchQueue: vi.fn((_scope, _station, next: QueueObserver) => {
      observer = next;
      return () => undefined;
    }),
    start: vi.fn<KitchenGateway['start']>(async () => ok(undefined)),
    finish: vi.fn<KitchenGateway['finish']>(async () => ok(undefined)),
    cancel: vi.fn<KitchenGateway['cancel']>(async () => ok(undefined)),
  } satisfies KitchenGateway;
  return {
    gateway,
    push: (next: readonly KitchenItem[]) => act(() => observer?.onData(next)),
    fail: () => act(() => observer?.onError({ kind: 'network' })),
  };
}

function memory(initial: string | null = null): StationMemory & { saved: string[] } {
  const saved: string[] = [];
  return { saved, read: () => initial, write: (_branch, id) => saved.push(id) };
}

function renderKitchen(
  gateway: KitchenGateway,
  options: { memory?: StationMemory; chime?: () => void } = {},
) {
  render(
    <KitchenPage
      gateway={gateway}
      scope={scope}
      branchName="Centro"
      timezone="America/Bogota"
      memory={options.memory ?? memory()}
      chime={options.chime ?? vi.fn()}
      now={() => NOW}
    />,
  );
}

const line = async (name: RegExp) =>
  (await screen.findByRole('heading', { name })).closest('li') as HTMLElement;

describe('KitchenPage', () => {
  it('con una sola estación la abre y muestra mesa, cantidad, espera, opciones, nota y alérgenos', async () => {
    const { gateway } = fakeGateway();
    renderKitchen(gateway);
    const bandeja = await line(/Mesa M1 · 2 × Bandeja paisa/);
    expect(within(bandeja).getByText('Por empezar')).toBeTruthy();
    expect(within(bandeja).getByText(/Hace 12 minutos · llegó a las 13:00/)).toBeTruthy();
    expect(within(bandeja).getByText('Opciones: Bien asada')).toBeTruthy();
    expect(within(bandeja).getByText('Sin cebolla')).toBeTruthy();
    expect(within(bandeja).getByText('Alérgenos declarados:').parentElement?.textContent).toBe(
      'Alérgenos declarados: huevo',
    );
    expect(screen.getByText('1 por empezar · 0 en preparación')).toBeTruthy();
    expect(screen.getByText('En vivo')).toBeTruthy();
    expect(gateway.watchQueue).toHaveBeenCalledWith(scope, 's1', expect.any(Object));
  });

  it('«Empezar» envía la versión vista y vuelve a leer la cola', async () => {
    const { gateway } = fakeGateway();
    renderKitchen(gateway);
    const bandeja = await line(/Mesa M1/);
    fireEvent.click(within(bandeja).getByRole('button', { name: /^Empezar 2 × Bandeja paisa/ }));
    await waitFor(() =>
      expect(gateway.start).toHaveBeenCalledWith(
        scope,
        expect.objectContaining({ id: 'l1', version: 1 }),
      ),
    );
    await waitFor(() => expect(gateway.queue).toHaveBeenCalledTimes(2));
  });

  it('si otra persona se adelantó, lo explica y muestra el estado actual', async () => {
    const { gateway } = fakeGateway([COCINA], [item({ status: 'IN_PREPARATION' })]);
    gateway.finish.mockResolvedValueOnce(
      err({ kind: 'rejected', message: 'Esta línea ya cambió' }),
    );
    renderKitchen(gateway);
    const bandeja = await line(/Mesa M1/);
    expect(within(bandeja).getByText('En preparación')).toBeTruthy();
    fireEvent.click(within(bandeja).getByRole('button', { name: /^Listo/ }));
    expect(
      await screen.findByText('Esta línea ya cambió. La pantalla muestra el estado actual.'),
    ).toBeTruthy();
    expect(gateway.queue).toHaveBeenCalledTimes(2);
  });

  it('un pedido nuevo se anuncia en texto, se marca y suena solo si se activó el sonido', async () => {
    const chime = vi.fn();
    const { gateway, push } = fakeGateway();
    renderKitchen(gateway, { chime });
    await line(/Mesa M1/);
    const second = item({ id: 'l2', orderId: 'o2', tableCode: 'T4', productName: 'Ajiaco' });
    await push([item({}), second]);
    expect(screen.getByText('Pedido nuevo: mesa T4.')).toBeTruthy();
    expect(within(await line(/Mesa T4/)).getByText('Nuevo')).toBeTruthy();
    expect(within(await line(/Mesa M1/)).queryByText('Nuevo')).toBeNull();
    expect(chime).not.toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Sonido con cada pedido nuevo'));
    await push([item({}), second, item({ id: 'l3', orderId: 'o3', tableCode: 'B2' })]);
    expect(screen.getByText('Pedido nuevo: mesa B2.')).toBeTruthy();
    expect(chime).toHaveBeenCalledTimes(1);
  });

  it('sin conexión lo dice, conserva la última lectura y no deja avanzar; al reintentar vuelve', async () => {
    const { gateway, fail } = fakeGateway();
    renderKitchen(gateway);
    const bandeja = await line(/Mesa M1/);
    await fail();
    expect(screen.getByText('Sin conexión con el servidor.')).toBeTruthy();
    expect(screen.getByText(/Última actualización a las 13:12/)).toBeTruthy();
    const start = within(bandeja).getByRole('button', { name: /^Empezar/ }) as HTMLButtonElement;
    expect(start.disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar ahora' }));
    await waitFor(() => expect(screen.getByText('En vivo')).toBeTruthy());
    expect(start.disabled).toBe(false);
  });

  it('con varias estaciones se elige una y se recuerda en este equipo', async () => {
    const remembered = memory('s2');
    const { gateway } = fakeGateway([COCINA, BAR]);
    renderKitchen(gateway, { memory: remembered });
    const select = (await screen.findByLabelText('Estación que atiendes')) as HTMLSelectElement;
    expect(select.value).toBe('s2');
    await waitFor(() =>
      expect(gateway.watchQueue).toHaveBeenCalledWith(scope, 's2', expect.any(Object)),
    );
    fireEvent.change(select, { target: { value: 's1' } });
    expect(remembered.saved).toEqual(['s1']);
    await waitFor(() =>
      expect(gateway.watchQueue).toHaveBeenCalledWith(scope, 's1', expect.any(Object)),
    );
  });

  it('cancelar exige el motivo y avisa la merma si ya se empezó', async () => {
    const { gateway } = fakeGateway([COCINA], [item({ status: 'IN_PREPARATION', version: 2 })]);
    renderKitchen(gateway);
    const bandeja = await line(/Mesa M1/);
    fireEvent.click(within(bandeja).getByRole('button', { name: /^Cancelar/ }));
    const dialog = screen.getByRole('dialog', { name: '¿Cancelar 2 × Bandeja paisa?' });
    expect(within(dialog).getByText(/quedará registrada como merma/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar línea' }));
    expect(within(dialog).getByText(/Escribe el motivo/)).toBeTruthy();
    expect(gateway.cancel).not.toHaveBeenCalled();
    fireEvent.change(within(dialog).getByLabelText('Motivo de la cancelación'), {
      target: { value: ' Se acabó el chicharrón ' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar línea' }));
    await waitFor(() =>
      expect(gateway.cancel).toHaveBeenCalledWith(
        scope,
        expect.objectContaining({ id: 'l1', version: 2 }),
        'Se acabó el chicharrón',
      ),
    );
  });
});
