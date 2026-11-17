// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { err, ok } from '@tavelyo/core';
import {
  PREAUTHORIZATION_CONSENT_VERSION,
  type QuoteOrderResponse,
  type QuoteSummary,
} from '@tavelyo/contracts';
import type { CartStorage } from '@tavelyo/cart';
import type {
  CustomerGateway,
  MenuProduct,
  MyOrder,
  MyOrdersObserver,
  PublicMenu,
} from '../domain/index.ts';
import { MyOrdersPage } from './MyOrdersPage.tsx';
import { OrderReviewPage } from './OrderReviewPage.tsx';
import { TableMenuPage } from './TableMenuPage.tsx';
import { TableOrderProvider } from './TableOrderProvider.tsx';

const burger: MenuProduct = {
  id: 'p1',
  name: 'Hamburguesa',
  priceId: 'pr1',
  priceMinor: '3200000',
  currency: 'COP',
  description: 'Con papas',
  allergens: ['gluten', 'lácteos'],
  categoryId: 'c1',
  categoryName: 'Platos fuertes',
  categorySort: 1,
  sort: 1,
  schedule: null,
  groups: [
    {
      id: 'g1',
      name: 'Término',
      minSelect: 1,
      maxSelect: 1,
      options: [
        { id: 'o1', name: 'Medio', priceDeltaMinor: '0' },
        { id: 'o2', name: 'Bien asado', priceDeltaMinor: '0' },
      ],
    },
    {
      id: 'g2',
      name: 'Adiciones',
      minSelect: 0,
      maxSelect: 2,
      options: [{ id: 'o3', name: 'Aguacate', priceDeltaMinor: '540000' }],
    },
  ],
};
const menu: PublicMenu = {
  tableCode: 'M1',
  branchName: 'Centro',
  currency: 'COP',
  timezone: 'America/Bogota',
  products: [burger],
};

function summary(unitMinor: string, priceId = 'pr1'): QuoteSummary {
  const total = (BigInt(unitMinor) + 540000n).toString();
  return {
    currency: 'COP',
    subtotalMinor: '3403704',
    taxMinor: (BigInt(total) - 3403704n).toString(),
    totalMinor: total,
    lines: [
      {
        position: 0,
        productId: 'p1',
        priceId,
        productName: 'Hamburguesa',
        quantity: 1,
        unitPriceMinor: unitMinor,
        modifiers: [
          { optionId: 'o1', name: 'Medio', priceDeltaMinor: '0' },
          { optionId: 'o3', name: 'Aguacate', priceDeltaMinor: '540000' },
        ],
        modifiersMinor: '540000',
        lineTotalMinor: total,
        taxMinor: '0',
        note: null,
      },
    ],
  };
}

const quoted = (unitMinor = '3200000'): QuoteOrderResponse => ({
  outcome: 'quoted',
  quoteId: 'q1',
  fingerprint: 'f',
  expiresAt: '2026-11-16T01:15:00Z',
  status: 'QUOTED',
  summary: summary(unitMinor),
});

const seated = {
  sessionId: 's1',
  branchId: 'b1',
  participantId: 'part1',
  tableCode: 'M1',
  expiresAt: '2026-11-16T05:00:00Z',
};

const myOrder = (status: MyOrder['items'][number]['status']): MyOrder => ({
  id: 'o1',
  sentAt: new Date('2026-11-16T00:50:00Z'),
  currency: 'COP',
  totalMinor: '3740000',
  items: [
    {
      id: 'l1',
      status,
      quantity: 1,
      productName: 'Hamburguesa',
      modifiers: ['Medio', 'Aguacate'],
      note: null,
      lineTotalMinor: '3740000',
    },
  ],
});

let ordersObserver: MyOrdersObserver | null = null;

function fakeGateway(overrides: Partial<CustomerGateway> = {}): CustomerGateway {
  return {
    menu: vi.fn(async () => ok(menu)),
    join: vi.fn(async () => ok(seated)),
    resume: vi.fn(async () => ok(seated)),
    myOrders: vi.fn(async () => ok([myOrder('RECEIVED')])),
    watchMyOrders: vi.fn((_seat, observer: MyOrdersObserver) => {
      ordersObserver = observer;
      return () => undefined;
    }),
    requestService: vi.fn(async () => ok({ status: 'sent' as const })),
    quote: vi.fn(async () => ok(quoted())),
    authorize: vi.fn(async () =>
      ok({ quoteId: 'q1', status: 'authorized' as const, orderId: 'o1', simulated: true }),
    ),
    ...overrides,
  };
}

/** Nombre accesible exacto con importes: Intl separa «$» del número con un espacio duro. */
const named = (text: string) =>
  new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s')}$`);

function memoryStorage(): CartStorage {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

function Harness({ gateway, storage }: { gateway: CustomerGateway; storage: CartStorage }) {
  const [page, setPage] = useState<'menu' | 'order' | 'mine'>('menu');
  const myOrdersLink = <button onClick={() => setPage('mine')}>Mis pedidos</button>;
  let uuid = 0;
  return (
    <TableOrderProvider
      gateway={gateway}
      qrPublicId="qr-1"
      storage={storage}
      now={() => new Date('2026-11-16T01:00:00Z')}
      randomUuid={() => `00000000-0000-4000-8000-${String((uuid += 1)).padStart(12, '0')}`}
    >
      {page === 'menu' ? (
        <TableMenuPage
          orderLink={(label) => <button onClick={() => setPage('order')}>{label}</button>}
          myOrdersLink={myOrdersLink}
        />
      ) : null}
      {page === 'order' ? (
        <OrderReviewPage
          offerSimulatedOutcomes
          myOrdersLink={(label) => <button onClick={() => setPage('mine')}>{label}</button>}
          menuLink={<button onClick={() => setPage('menu')}>Volver a la carta</button>}
        />
      ) : null}
      {page === 'mine' ? (
        <MyOrdersPage
          menuLink={<button onClick={() => setPage('menu')}>Volver a la carta</button>}
        />
      ) : null}
    </TableOrderProvider>
  );
}

function renderFlow(gateway = fakeGateway(), storage = memoryStorage()) {
  render(<Harness gateway={gateway} storage={storage} />);
  return { gateway, storage };
}

/** Elige Medio + Aguacate y agrega una hamburguesa ($ 37.400). */
async function addBurger() {
  fireEvent.click(await screen.findByRole('button', { name: 'Agregar Hamburguesa' }));
  const form = screen.getByRole('form', { name: 'Elegir Hamburguesa' });
  fireEvent.click(within(form).getByRole('button', { name: /Agregar al pedido/ }));
  expect(within(form).getByText('Elige una opción de «Término».')).toBeTruthy();
  fireEvent.click(within(form).getByLabelText('Medio'));
  fireEvent.click(within(form).getByLabelText(/Aguacate/));
  fireEvent.click(
    within(form).getByRole('button', { name: named('Agregar al pedido · $ 37.400') }),
  );
  expect(await screen.findByText('Agregaste 1 × Hamburguesa a tu pedido.')).toBeTruthy();
}

async function openOrder() {
  fireEvent.click(
    screen.getByRole('button', { name: named('Ver mi pedido · 1 producto · $ 37.400') }),
  );
  await screen.findByRole('heading', { level: 1, name: 'Tu pedido' });
}

describe('carta y pedido del cliente', () => {
  it('muestra la carta de la mesa con alérgenos declarados y el aviso de trazas', async () => {
    renderFlow();
    expect(await screen.findByRole('heading', { level: 1, name: 'Centro' })).toBeTruthy();
    expect(screen.getByText('Mesa M1')).toBeTruthy();
    expect(screen.getByText('Alérgenos declarados: gluten, lácteos')).toBeTruthy();
    expect(screen.getByText(/no garantizan que un plato no tenga trazas/)).toBeTruthy();
  });

  it('un QR que no es de ninguna mesa activa lo explica', async () => {
    renderFlow(fakeGateway({ menu: vi.fn(async () => ok(null)) }));
    expect(
      await screen.findByText('Este código QR no corresponde a ninguna mesa activa'),
    ).toBeTruthy();
  });

  it('revisa con el servidor, autoriza y envía a cocina, y lleva a «Mis pedidos»', async () => {
    const { gateway } = renderFlow();
    await addBurger();
    await openOrder();
    fireEvent.click(screen.getByRole('button', { name: 'Revisar pedido' }));
    expect(await screen.findByText('Resumen confirmado por el restaurante')).toBeTruthy();
    expect(gateway.join).toHaveBeenCalledWith('qr-1');
    expect(gateway.quote).toHaveBeenCalledWith({
      sessionId: 's1',
      idempotencyKey: expect.stringMatching(/^rev_[0-9a-f-]{36}$/),
      lines: [
        { productId: 'p1', priceId: 'pr1', quantity: 1, optionIds: ['o1', 'o3'], note: null },
      ],
      expectedTotalMinor: '3740000',
    });
    expect(screen.getByText('Impuestos incluidos')).toBeTruthy();
    expect(screen.getByText(/Este resumen vale hasta las 20:15/)).toBeTruthy();
    expect(screen.getByText(/no cobra dinero real/)).toBeTruthy();

    expect(screen.getByText(/Sin autorización no se envía/)).toBeTruthy();
    fireEvent.click(
      screen.getByRole('button', { name: named('Autorizar y enviar a cocina · $ 37.400') }),
    );
    expect(await screen.findByText('Pedido enviado a cocina')).toBeTruthy();
    expect(gateway.authorize).toHaveBeenCalledWith({
      quoteId: 'q1',
      consentTextVersion: PREAUTHORIZATION_CONSENT_VERSION,
      simulatedOutcome: 'approved',
    });
    expect(screen.getByText(/Tu pedido llegó a cocina/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Hacer otro pedido' }));
    expect(screen.getByText('Tu pedido está vacío')).toBeTruthy();
    // La mesa ya está en este teléfono: «Mis pedidos» no vuelve a unirse.
    fireEvent.click(screen.getByRole('button', { name: 'Volver a la carta' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Mis pedidos' }));
    expect(await screen.findByText('1 × Hamburguesa')).toBeTruthy();
    expect(gateway.resume).not.toHaveBeenCalled();
    expect(gateway.watchMyOrders).toHaveBeenCalledWith(
      { sessionId: 's1', branchId: 'b1' },
      expect.any(Object),
    );
  });

  it('si el precio cambió, muestra antes y ahora y no sigue sin confirmación (caso 5)', async () => {
    const changed: QuoteOrderResponse = {
      outcome: 'changed',
      changes: [
        {
          kind: 'price-changed',
          position: 0,
          productId: 'p1',
          previousPriceId: 'pr1',
          priceId: 'pr2',
        },
        { kind: 'total-changed', expectedTotalMinor: '3740000', totalMinor: '3940000' },
      ],
      summary: { ...summary('3400000', 'pr2') },
    };
    const quote = vi
      .fn()
      .mockResolvedValueOnce(ok(changed))
      .mockResolvedValueOnce(ok(quoted('3400000')));
    const { gateway } = renderFlow(fakeGateway({ quote }));
    await addBurger();
    await openOrder();
    fireEvent.click(screen.getByRole('button', { name: 'Revisar pedido' }));
    expect(await screen.findByText('Algunos importes cambiaron')).toBeTruthy();
    expect(
      screen.getByText('Hamburguesa: antes $ 37.400, ahora $ 39.400 por unidad.'),
    ).toBeTruthy();
    expect(screen.getByText('El total cambió: antes $ 37.400, ahora $ 39.400.')).toBeTruthy();
    expect(gateway.authorize).not.toHaveBeenCalled();
    // La carta en pantalla se vuelve a leer para que lo siguiente tenga el precio actual.
    await waitFor(() => expect(gateway.menu).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByRole('button', { name: 'Aceptar los importes actuales' }));
    expect(await screen.findByText('Resumen confirmado por el restaurante')).toBeTruthy();
    const second = quote.mock.calls[1]?.[0];
    expect(second.lines[0].priceId).toBe('pr2');
    expect(second.expectedTotalMinor).toBe('3940000');
    // Otro intento, otra clave de idempotencia.
    expect(second.idempotencyKey).not.toBe(quote.mock.calls[0]?.[0].idempotencyKey);
  });

  it('lo que ya no está disponible se explica y se quita del carrito', async () => {
    const quote = vi.fn(async () =>
      ok({
        outcome: 'rejected' as const,
        problems: [{ kind: 'unavailable' as const, position: 0, productId: 'p1' }],
      }),
    );
    renderFlow(fakeGateway({ quote }));
    await addBurger();
    await openOrder();
    fireEvent.click(screen.getByRole('button', { name: 'Revisar pedido' }));
    expect(await screen.findByText('Hamburguesa ya no está disponible.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Quitar estos productos' }));
    expect(screen.getByText('Tu pedido está vacío')).toBeTruthy();
  });

  it('si la mesa no está abierta, lo dice con el mensaje del servidor', async () => {
    const join = vi.fn(async () =>
      err({
        kind: 'rejected' as const,
        reason: 'other' as const,
        message: 'La mesa todavía no está abierta. Pide al mesero que la abra.',
      }),
    );
    const { gateway } = renderFlow(fakeGateway({ join }));
    await addBurger();
    await openOrder();
    fireEvent.click(screen.getByRole('button', { name: 'Revisar pedido' }));
    expect(
      await screen.findByText('La mesa todavía no está abierta. Pide al mesero que la abra.'),
    ).toBeTruthy();
    expect(gateway.quote).not.toHaveBeenCalled();
  });

  it('si la participación venció, se vuelve a unir a la mesa una vez', async () => {
    const quote = vi
      .fn()
      .mockResolvedValueOnce(
        err({
          kind: 'rejected',
          reason: 'not-participant',
          message: 'Ya no formas parte de esta mesa.',
        }),
      )
      .mockResolvedValueOnce(ok(quoted()));
    const { gateway } = renderFlow(fakeGateway({ quote }));
    await addBurger();
    await openOrder();
    fireEvent.click(screen.getByRole('button', { name: 'Revisar pedido' }));
    expect(await screen.findByText('Resumen confirmado por el restaurante')).toBeTruthy();
    expect(gateway.join).toHaveBeenCalledTimes(2);
  });

  it('sin conexión al revisar, un reintento usa la misma clave (no duplica el resumen)', async () => {
    const quote = vi
      .fn()
      .mockResolvedValueOnce(err({ kind: 'network' }))
      .mockResolvedValueOnce(ok(quoted()));
    renderFlow(fakeGateway({ quote }));
    await addBurger();
    await openOrder();
    fireEvent.click(screen.getByRole('button', { name: 'Revisar pedido' }));
    expect(await screen.findByText(/No hay conexión con el restaurante/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Revisar pedido' }));
    await screen.findByText('Resumen confirmado por el restaurante');
    expect(quote.mock.calls[1]?.[0].idempotencyKey).toBe(quote.mock.calls[0]?.[0].idempotencyKey);
  });

  it('un pago simulado rechazado vuelve al pedido para revisarlo de nuevo', async () => {
    const authorize = vi.fn(async () =>
      ok({ quoteId: 'q1', status: 'declined' as const, simulated: true }),
    );
    const { gateway } = renderFlow(fakeGateway({ authorize }));
    await addBurger();
    await openOrder();
    fireEvent.click(screen.getByRole('button', { name: 'Revisar pedido' }));
    await screen.findByText('Resumen confirmado por el restaurante');
    fireEvent.change(screen.getByLabelText('Resultado del pago simulado'), {
      target: { value: 'declined' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Autorizar y enviar a cocina/ }));
    expect(await screen.findByText(/El pago simulado fue rechazado/)).toBeTruthy();
    expect(gateway.authorize).toHaveBeenCalledWith({
      quoteId: 'q1',
      consentTextVersion: PREAUTHORIZATION_CONSENT_VERSION,
      simulatedOutcome: 'declined',
    });
    expect(screen.getByRole('button', { name: 'Revisar pedido' })).toBeTruthy();
  });

  it('el carrito sigue en el teléfono al recargar la carta', async () => {
    const storage = memoryStorage();
    const first = render(<Harness gateway={fakeGateway()} storage={storage} />);
    await addBurger();
    first.unmount();
    render(<Harness gateway={fakeGateway()} storage={storage} />);
    expect(
      await screen.findByRole('button', { name: named('Ver mi pedido · 1 producto · $ 37.400') }),
    ).toBeTruthy();
    await waitFor(() => expect(screen.queryByText('Cargando la carta…')).toBeNull());
  });

  it('«Mis pedidos» muestra el estado de cada línea y anuncia en texto lo que cambia', async () => {
    const { gateway } = renderFlow();
    fireEvent.click(await screen.findByRole('button', { name: 'Mis pedidos' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Mis pedidos' })).toBeTruthy();
    const line = (await screen.findByText('1 × Hamburguesa')).closest('li') as HTMLElement;
    expect(within(line).getByText('Recibido en cocina')).toBeTruthy();
    expect(within(line).getByText(named('$ 37.400'))).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: 'Pedido de las 19:50 · Recibido en cocina' }),
    ).toBeTruthy();
    expect(screen.getByText('En vivo')).toBeTruthy();
    // Tras recargar el teléfono, la mesa se recupera sin crear otra sesión anónima.
    expect(gateway.resume).toHaveBeenCalledWith('qr-1');
    expect(gateway.join).not.toHaveBeenCalled();

    act(() => ordersObserver?.onData([myOrder('PICKED_UP')]));
    expect(within(line).getByText('En camino a tu mesa')).toBeTruthy();
    expect(screen.getByText('Hamburguesa: en camino a tu mesa.')).toBeTruthy();
  });

  it('sin pedidos en este teléfono lo dice y no se une a la mesa solo por mirar', async () => {
    const { gateway } = renderFlow(fakeGateway({ resume: vi.fn(async () => ok(null)) }));
    fireEvent.click(await screen.findByRole('button', { name: 'Mis pedidos' }));
    expect(await screen.findByText('Todavía no tienes pedidos')).toBeTruthy();
    expect(gateway.join).not.toHaveBeenCalled();
    expect(gateway.watchMyOrders).not.toHaveBeenCalled();
  });

  it('llamar al mesero y pedir la cuenta avisan, y un aviso repetido no crea otro', async () => {
    const requestService = vi
      .fn<CustomerGateway['requestService']>()
      .mockResolvedValueOnce(ok({ status: 'sent' }))
      .mockResolvedValueOnce(ok({ status: 'already-pending' }))
      .mockResolvedValueOnce(ok({ status: 'sent' }));
    const { gateway } = renderFlow(
      fakeGateway({ resume: vi.fn(async () => ok(null)), requestService }),
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Mis pedidos' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Llamar al mesero' }));
    expect(await screen.findByText('Avisamos al mesero. Viene a tu mesa.')).toBeTruthy();
    // Sin estar en la mesa todavía, se une para poder avisar.
    expect(gateway.join).toHaveBeenCalledWith('qr-1');
    expect(requestService).toHaveBeenCalledWith({ sessionId: 's1', kind: 'call_waiter' });
    fireEvent.click(screen.getByRole('button', { name: 'Llamar al mesero' }));
    expect(await screen.findByText('El mesero ya tiene tu aviso. Viene en camino.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Pedir la cuenta' }));
    expect(await screen.findByText('Avisamos al mesero que quieres la cuenta.')).toBeTruthy();
    expect(requestService).toHaveBeenLastCalledWith({ sessionId: 's1', kind: 'request_bill' });
  });

  it('un aviso rechazado por el límite muestra el motivo del servidor', async () => {
    renderFlow(
      fakeGateway({
        requestService: vi.fn(async () =>
          err({
            kind: 'rejected' as const,
            reason: 'other' as const,
            message: 'Hiciste demasiados intentos. Espera unos minutos.',
          }),
        ),
      }),
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Mis pedidos' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Pedir la cuenta' }));
    expect(
      await screen.findByText('Hiciste demasiados intentos. Espera unos minutos.'),
    ).toBeTruthy();
  });
});
