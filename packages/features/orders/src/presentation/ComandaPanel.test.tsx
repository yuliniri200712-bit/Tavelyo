// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { err, ok } from '@tavelyo/core';
import type { QuoteOrderRequest, StaffOrderResponse } from '@tavelyo/contracts';
import type { ComandaGateway, ComandaMenu, GuestAdded } from '../domain/index.ts';
import { ComandaPanel } from './ComandaPanel.tsx';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
});
afterEach(cleanup);

const scope = { tenantId: 't1', branchId: 'b1', sessionId: 's1' };
const product = {
  id: 'p1',
  name: 'Bandeja',
  categoryName: 'Platos',
  priceId: 'pr1',
  priceMinor: '3200000',
  currency: 'COP',
  groups: [],
};
const menu = (people: ComandaMenu['people'], nextGuestNumber: number | null = 1): ComandaMenu => ({
  products: [product],
  currency: 'COP',
  people,
  nextGuestNumber,
});
const phone = { id: 'a', guestNumber: null, label: 'Persona 1' };
const guest1 = { id: 'g1', guestNumber: 1, label: 'Persona sin teléfono 1' };
const sent: StaffOrderResponse = { outcome: 'sent', orderId: 'o1' };

function fakeGateway(overrides: Partial<ComandaGateway> = {}): ComandaGateway {
  return {
    menu: vi.fn(async () => ok(menu([phone]))),
    addGuest: vi.fn<ComandaGateway['addGuest']>(async () =>
      ok<GuestAdded>({ outcome: 'added', participantId: 'g1' }),
    ),
    send: vi.fn(async () => ok(sent)),
    ...overrides,
  };
}

function renderPanel(gateway: ComandaGateway, offline = false) {
  render(
    <ComandaPanel
      gateway={gateway}
      scope={scope}
      tableCode="M1"
      sector="Terraza"
      offline={offline}
    />,
  );
  return gateway;
}

async function addProduct() {
  fireEvent.click(await screen.findByRole('button', { name: 'Elegir Bandeja' }));
  const form = screen.getByRole('form', { name: 'Elegir Bandeja' });
  fireEvent.click(within(form).getByRole('button', { name: /Agregar al pedido/ }));
  await screen.findByRole('list', { name: 'Productos de tu pedido' });
}

const choose = (id: string) =>
  fireEvent.change(screen.getByLabelText('Persona de la mesa'), { target: { value: id } });

const reviewAndSend = async () => {
  fireEvent.click(screen.getByRole('button', { name: /Revisar comanda|Reintentar la misma/ }));
  const dialog = screen.getByRole('dialog', { name: 'Enviar pedido de la mesa M1' });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar a cocina' }));
};

const sentKey = (gateway: ComandaGateway, call: number) =>
  (vi.mocked(gateway.send).mock.calls[call]?.[2] as QuoteOrderRequest).idempotencyKey;

describe('comanda del mesero (bloque 6b)', () => {
  it('exige elegir a la persona y muestra en la revisión a quién va el pedido', async () => {
    const gateway = renderPanel(fakeGateway());
    await addProduct();
    const review = screen.getByRole('button', { name: 'Revisar comanda' });
    expect((review as HTMLButtonElement).disabled).toBe(true);
    choose('a');
    expect((review as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(review);
    const dialog = screen.getByRole('dialog', { name: 'Enviar pedido de la mesa M1' });
    expect(within(dialog).getByText('Terraza · Mesa M1 · Persona 1')).toBeTruthy();
    expect(within(dialog).getByText(/1 × Bandeja/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar a cocina' }));
    expect(await screen.findByText('Pedido enviado a cocina para Persona 1.')).toBeTruthy();
    expect(gateway.send).toHaveBeenCalledWith(
      scope,
      'a',
      expect.objectContaining({ sessionId: 's1', expectedTotalMinor: '3200000' }),
    );
  });

  it('si se pierde la respuesta, bloquea la comanda y reintenta con la misma clave', async () => {
    const send = vi
      .fn<ComandaGateway['send']>()
      .mockResolvedValueOnce(err({ kind: 'network' }))
      .mockResolvedValueOnce(ok(sent));
    const gateway = renderPanel(fakeGateway({ send }));
    await addProduct();
    choose('a');
    await reviewAndSend();
    expect(await screen.findByText(/Falta confirmar el envío/)).toBeTruthy();
    expect(screen.getByLabelText('Persona de la mesa').matches(':disabled')).toBe(true);
    await reviewAndSend();
    expect(await screen.findByText('Pedido enviado a cocina para Persona 1.')).toBeTruthy();
    expect(sentKey(gateway, 1)).toBe(sentKey(gateway, 0));
  });

  it('tras un rechazo, cambiar la comanda la envía con otra clave', async () => {
    const send = vi
      .fn<ComandaGateway['send']>()
      .mockResolvedValueOnce(err({ kind: 'rejected', message: 'La mesa está cerrada' }))
      .mockResolvedValueOnce(ok(sent));
    const gateway = renderPanel(fakeGateway({ send }));
    await addProduct();
    choose('a');
    await reviewAndSend();
    expect(await screen.findByText('La mesa está cerrada')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Elegir Bandeja' }));
    fireEvent.click(screen.getByRole('button', { name: /Agregar al pedido/ }));
    await reviewAndSend();
    await waitFor(() => expect(send).toHaveBeenCalledTimes(2));
    expect(sentKey(gateway, 1)).not.toBe(sentKey(gateway, 0));
  });

  it('sin conexión no deja revisar ni enviar', async () => {
    const gateway = renderPanel(fakeGateway(), true);
    await screen.findByRole('button', { name: 'Elegir Bandeja' });
    expect(screen.getByLabelText('Persona de la mesa').matches(':disabled')).toBe(true);
    expect(
      (screen.getByRole('button', { name: 'Revisar comanda' }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(gateway.send).not.toHaveBeenCalled();
  });

  it('agrega a una persona sin teléfono y la deja elegida', async () => {
    const menuFn = vi
      .fn<ComandaGateway['menu']>()
      .mockResolvedValueOnce(ok(menu([phone])))
      .mockResolvedValue(ok(menu([phone, guest1], 2)));
    const gateway = renderPanel(fakeGateway({ menu: menuFn }));
    fireEvent.click(await screen.findByRole('button', { name: 'Agregar persona sin teléfono' }));
    expect(await screen.findByText('Persona sin teléfono 1 agregada a la mesa.')).toBeTruthy();
    expect(gateway.addGuest).toHaveBeenCalledWith(scope, 1);
    await waitFor(() =>
      expect((screen.getByLabelText('Persona de la mesa') as HTMLSelectElement).value).toBe('g1'),
    );
  });

  it('si se pierde la respuesta al agregarla, reintenta el mismo número y no crea otra', async () => {
    const addGuest = vi
      .fn<ComandaGateway['addGuest']>()
      .mockResolvedValueOnce(err({ kind: 'network' }))
      .mockResolvedValueOnce(ok({ outcome: 'taken' }));
    const menuFn = vi
      .fn<ComandaGateway['menu']>()
      .mockResolvedValueOnce(ok(menu([phone])))
      .mockResolvedValue(ok(menu([phone, guest1], 2)));
    renderPanel(fakeGateway({ addGuest, menu: menuFn }));
    fireEvent.click(await screen.findByRole('button', { name: 'Agregar persona sin teléfono' }));
    expect(
      await screen.findByText(/Falta confirmar si se agregó la Persona sin teléfono 1/),
    ).toBeTruthy();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Reintentar agregar Persona sin teléfono 1' }),
    );
    expect(
      await screen.findByText('La Persona sin teléfono 1 ya estaba en la mesa y quedó elegida.'),
    ).toBeTruthy();
    expect(addGuest).toHaveBeenNthCalledWith(2, scope, 1);
    await waitFor(() =>
      expect((screen.getByLabelText('Persona de la mesa') as HTMLSelectElement).value).toBe('g1'),
    );
  });

  it('si otra persona del equipo tomó el número a la vez, avisa y no elige a nadie', async () => {
    const addGuest = vi.fn<ComandaGateway['addGuest']>(async () => ok({ outcome: 'taken' }));
    renderPanel(fakeGateway({ addGuest }));
    fireEvent.click(await screen.findByRole('button', { name: 'Agregar persona sin teléfono' }));
    expect(await screen.findByText(/Otra persona del equipo acaba de agregar/)).toBeTruthy();
    expect((screen.getByLabelText('Persona de la mesa') as HTMLSelectElement).value).toBe('');
  });

  it('con 99 personas sin teléfono no intenta agregar otra', async () => {
    const gateway = renderPanel(fakeGateway({ menu: vi.fn(async () => ok(menu([phone], null))) }));
    fireEvent.click(await screen.findByRole('button', { name: 'Agregar persona sin teléfono' }));
    expect(await screen.findByText(/ya tiene 99 personas sin teléfono/)).toBeTruthy();
    expect(gateway.addGuest).not.toHaveBeenCalled();
  });
});
