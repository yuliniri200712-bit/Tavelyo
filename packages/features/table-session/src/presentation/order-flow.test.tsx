// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { err, ok } from '@tavelyo/core';
import type { QuoteOrderResponse, QuoteSummary } from '@tavelyo/contracts';
import type { CartStorage } from '@tavelyo/cart';
import type { CustomerGateway, MenuProduct, PublicMenu } from '../domain/index.ts';
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

function fakeGateway(overrides: Partial<CustomerGateway> = {}): CustomerGateway {
  return {
    menu: vi.fn(async () => ok(menu)),
    join: vi.fn(async () =>
      ok({
        sessionId: 's1',
        participantId: 'part1',
        tableCode: 'M1',
        expiresAt: '2026-11-16T05:00:00Z',
      }),
    ),
    quote: vi.fn(async () => ok(quoted())),
    authorize: vi.fn(async () =>
      ok({ quoteId: 'q1', status: 'authorized' as const, simulated: true }),
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
  const [page, setPage] = useState<'menu' | 'order'>('menu');
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
        />
      ) : (
        <OrderReviewPage
          offerSimulatedOutcomes
          menuLink={<button onClick={() => setPage('menu')}>Volver a la carta</button>}
        />
      )}
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

  it('revisa con el servidor, muestra su resumen y autoriza el pago simulado', async () => {
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

    fireEvent.click(
      screen.getByRole('button', { name: named('Autorizar pago simulado · $ 37.400') }),
    );
    expect(await screen.findByText('Pedido listo')).toBeTruthy();
    expect(gateway.authorize).toHaveBeenCalledWith({ quoteId: 'q1', simulatedOutcome: 'approved' });
    expect(screen.getByText(/El envío a cocina todavía no está disponible/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Hacer otro pedido' }));
    expect(screen.getByText('Tu pedido está vacío')).toBeTruthy();
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
    fireEvent.click(screen.getByRole('button', { name: /Autorizar pago simulado/ }));
    expect(await screen.findByText(/El pago simulado fue rechazado/)).toBeTruthy();
    expect(gateway.authorize).toHaveBeenCalledWith({ quoteId: 'q1', simulatedOutcome: 'declined' });
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
});
