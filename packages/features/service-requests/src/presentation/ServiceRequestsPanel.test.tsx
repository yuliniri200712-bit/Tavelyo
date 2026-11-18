// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { err, ok } from '@tavelyo/core';
import type {
  PendingRequest,
  PendingRequestsObserver,
  ServiceRequestsGateway,
} from '../domain/index.ts';
import { ServiceRequestsPanel } from './ServiceRequestsPanel.tsx';

const NOW = new Date('2026-11-16T01:00:00Z');
const scope = { tenantId: 't1', branchId: 'b1' };
const call: PendingRequest = {
  id: 'r1',
  kind: 'CALL_WAITER',
  createdAt: new Date('2026-11-16T00:52:00Z'),
  tableCode: 'M1',
};

function fakeGateway(requests: readonly PendingRequest[] = [call]) {
  let observer: PendingRequestsObserver | null = null;
  const gateway = {
    pending: vi.fn(async () => ok(requests)),
    watchPending: vi.fn((_scope, next: PendingRequestsObserver) => {
      observer = next;
      return () => undefined;
    }),
    attend: vi.fn<ServiceRequestsGateway['attend']>(async () => ok(undefined)),
  } satisfies ServiceRequestsGateway;
  return { gateway, push: (next: PendingRequest[]) => act(() => observer?.onData(next)) };
}

function renderPanel(gateway: ServiceRequestsGateway) {
  render(
    <ServiceRequestsPanel
      gateway={gateway}
      scope={scope}
      timezone="America/Bogota"
      now={() => NOW}
    />,
  );
}

describe('ServiceRequestsPanel', () => {
  it('muestra la mesa, qué pidió y cuánto lleva esperando, en texto', async () => {
    const { gateway } = fakeGateway();
    renderPanel(gateway);
    const list = await screen.findByRole('list', { name: 'Solicitudes pendientes' });
    const item = within(list).getByText('Mesa M1').closest('li') as HTMLElement;
    expect(within(item).getByText('Llamó al mesero')).toBeTruthy();
    expect(within(item).getByText('Hace 8 minutos · a las 19:52')).toBeTruthy();
    expect(screen.getByText('1 solicitud pendiente')).toBeTruthy();
  });

  it('«Atendida» la marca y vuelve a leer', async () => {
    const { gateway } = fakeGateway();
    renderPanel(gateway);
    fireEvent.click(
      await screen.findByRole('button', { name: 'Atendida: mesa M1, llamó al mesero' }),
    );
    expect(await screen.findByText('Mesa M1: solicitud atendida.')).toBeTruthy();
    expect(gateway.attend).toHaveBeenCalledWith(scope, 'r1');
    await waitFor(() => expect(gateway.pending).toHaveBeenCalledTimes(2));
  });

  it('si otra persona ya la atendió, lo dice', async () => {
    const { gateway } = fakeGateway();
    gateway.attend.mockResolvedValueOnce(
      err({ kind: 'rejected', message: 'Esta solicitud ya fue atendida' }),
    );
    renderPanel(gateway);
    fireEvent.click(await screen.findByRole('button', { name: /^Atendida/ }));
    expect(await screen.findByText('Esta solicitud ya fue atendida')).toBeTruthy();
  });

  it('anuncia en texto la solicitud nueva que llega en vivo', async () => {
    const { gateway, push } = fakeGateway([]);
    renderPanel(gateway);
    expect(await screen.findByText('No hay solicitudes pendientes')).toBeTruthy();
    await push([{ ...call, id: 'r2', kind: 'REQUEST_BILL', tableCode: 'T4' }]);
    expect(screen.getByText('Mesa T4: pidió la cuenta.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Atendida: mesa T4, pidió la cuenta' })).toBeTruthy();
  });
});
