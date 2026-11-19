// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { err, ok } from '@tavelyo/core';
import { parseRejectionReason } from '../application/order-approval.ts';
import type {
  OrderApprovalGateway,
  PendingApproval,
  PendingApprovalsObserver,
} from '../domain/index.ts';
import { OrderApprovalPanel } from './OrderApprovalPanel.tsx';
import { OrderApprovalSettings } from './OrderApprovalSettings.tsx';

beforeAll(() => {
  // jsdom no implementa <dialog>: basta con alternar `open` (el foco real se prueba en Playwright).
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

const NOW = new Date('2026-11-18T01:00:00Z');
const scope = { tenantId: 't1', branchId: 'b1' };
const pending: PendingApproval = {
  id: 'o1',
  sessionId: 's1',
  tableCode: 'M1',
  requestedAt: new Date('2026-11-18T00:55:00Z'),
  currency: 'COP',
  totalMinor: '3200000',
  lines: [
    {
      quantity: 1,
      productName: 'Bandeja paisa',
      modifiers: ['Bien asada'],
      note: 'Sin cebolla',
      allergens: ['huevo'],
    },
  ],
};

function fakeGateway(orders: readonly PendingApproval[] = [pending]) {
  let observer: PendingApprovalsObserver | null = null;
  const gateway = {
    pending: vi.fn(async () => ok(orders)),
    watchPending: vi.fn((_scope, next: PendingApprovalsObserver) => {
      observer = next;
      return () => undefined;
    }),
    approve: vi.fn<OrderApprovalGateway['approve']>(async () => ok(undefined)),
    reject: vi.fn<OrderApprovalGateway['reject']>(async () => ok(undefined)),
    mode: vi.fn<OrderApprovalGateway['mode']>(async () => ok('DIRECT')),
    setMode: vi.fn<OrderApprovalGateway['setMode']>(async () => ok(undefined)),
  } satisfies OrderApprovalGateway;
  return { gateway, push: (next: PendingApproval[]) => act(() => observer?.onData(next)) };
}

function renderPanel(gateway: OrderApprovalGateway) {
  render(
    <OrderApprovalPanel
      gateway={gateway}
      scope={scope}
      timezone="America/Bogota"
      now={() => NOW}
    />,
  );
}

describe('OrderApprovalPanel (D-32)', () => {
  it('muestra la mesa, lo pedido, el total y cuánto lleva esperando, en texto', async () => {
    const { gateway } = fakeGateway();
    renderPanel(gateway);
    const list = await screen.findByRole('list', { name: 'Pedidos por aprobar' });
    const item = within(list).getByText('Mesa M1').closest('li') as HTMLElement;
    expect(
      within(item).getByText(/Espera desde hace 5 minutos · a las 19:55 · Total/),
    ).toBeTruthy();
    expect(within(item).getByText('1 × Bandeja paisa')).toBeTruthy();
    expect(within(item).getByText('Nota: Sin cebolla')).toBeTruthy();
    expect(within(item).getByText('Alérgenos: huevo')).toBeTruthy();
    expect(screen.getByText('1 pedido por aprobar')).toBeTruthy();
  });

  it('«Aprobar» lo envía a cocina y vuelve a leer', async () => {
    const { gateway } = fakeGateway();
    renderPanel(gateway);
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Aprobar y enviar a cocina: pedido de la mesa M1',
      }),
    );
    expect(await screen.findByText('Mesa M1: pedido aprobado y enviado a cocina.')).toBeTruthy();
    expect(gateway.approve).toHaveBeenCalledWith(scope, pending);
    await waitFor(() => expect(gateway.pending).toHaveBeenCalledTimes(2));
  });

  it('«Rechazar» exige un motivo que verá el cliente', async () => {
    const { gateway } = fakeGateway();
    renderPanel(gateway);
    fireEvent.click(await screen.findByRole('button', { name: 'Rechazar: pedido de la mesa M1' }));
    const dialog = screen.getByRole('dialog', { name: 'Rechazar el pedido de la mesa M1' });
    fireEvent.change(within(dialog).getByLabelText(/Motivo/), { target: { value: 'no' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Rechazar pedido' }));
    expect(within(dialog).getByText('Escribe un motivo de 5 a 200 caracteres.')).toBeTruthy();
    expect(gateway.reject).not.toHaveBeenCalled();
    fireEvent.change(within(dialog).getByLabelText(/Motivo/), {
      target: { value: '  Se agotó la bandeja ' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Rechazar pedido' }));
    expect(await screen.findByText('Mesa M1: pedido rechazado.')).toBeTruthy();
    expect(gateway.reject).toHaveBeenCalledWith(scope, pending, 'Se agotó la bandeja');
  });

  it('si otra persona ya lo decidió, lo dice', async () => {
    const { gateway } = fakeGateway();
    gateway.approve.mockResolvedValueOnce(
      err({ kind: 'rejected', message: 'Este pedido ya se decidió' }),
    );
    renderPanel(gateway);
    fireEvent.click(await screen.findByRole('button', { name: /^Aprobar y enviar a cocina/ }));
    expect(await screen.findByText('Este pedido ya se decidió')).toBeTruthy();
  });

  it('anuncia en texto el pedido nuevo que llega en vivo', async () => {
    const { gateway, push } = fakeGateway([]);
    renderPanel(gateway);
    expect(await screen.findByText('No hay pedidos por aprobar')).toBeTruthy();
    push([pending]);
    expect(await screen.findByText('Mesa M1: pedido por aprobar.')).toBeTruthy();
  });

  it('el motivo se limpia y debe tener de 5 a 200 caracteres', () => {
    expect(parseRejectionReason('  Sin existencias  ')).toBe('Sin existencias');
    expect(parseRejectionReason('abcd')).toBeNull();
    expect(parseRejectionReason('x'.repeat(201))).toBeNull();
  });
});

describe('OrderApprovalSettings (D-32)', () => {
  it('muestra el modo guardado y guarda el nuevo solo si cambió', async () => {
    const { gateway } = fakeGateway();
    render(<OrderApprovalSettings gateway={gateway} scope={scope} branchName="Centro" />);
    const direct = (await screen.findByLabelText('Directo a cocina')) as HTMLInputElement;
    expect(direct.checked).toBe(true);
    const save = screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
    fireEvent.click(screen.getByLabelText('El mesero aprueba cada pedido'));
    fireEvent.click(save);
    expect(await screen.findByText('Guardado: el mesero aprueba cada pedido.')).toBeTruthy();
    expect(gateway.setMode).toHaveBeenCalledWith(scope, 'WAITER_APPROVAL');
  });

  it('sin permiso, el servidor lo rechaza y se dice', async () => {
    const { gateway } = fakeGateway();
    gateway.mode.mockResolvedValueOnce(
      err({ kind: 'rejected', message: 'Sin permiso: branch.settings' }),
    );
    render(<OrderApprovalSettings gateway={gateway} scope={scope} branchName="Centro" />);
    expect(await screen.findByText('No se pudo cargar el ajuste')).toBeTruthy();
  });
});
