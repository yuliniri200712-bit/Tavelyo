import { describe, expect, it } from 'vitest';
import { optionsAreValid, priceOrder, type CatalogEntry } from './pricing.ts';

const BANDEJA = 'a'.repeat(32);
const AJIACO = 'b'.repeat(32);
const PRICE_BANDEJA = 'c'.repeat(32);
const PRICE_AJIACO = 'd'.repeat(32);
const TERMINO = 'e'.repeat(32);
const ASADA = '1'.repeat(32);
const TRES_CUARTOS = '2'.repeat(32);
const ADICIONES = 'f'.repeat(32);
const AGUACATE = '3'.repeat(32);
const CHICHARRON = '4'.repeat(32);

const bandeja: CatalogEntry = {
  productId: BANDEJA,
  name: 'Bandeja paisa',
  orderable: true,
  schedule: null,
  currentPrice: { id: PRICE_BANDEJA, amountMinor: '3240000', currency: 'COP' },
  taxRateBp: 800,
  groups: [
    {
      id: TERMINO,
      minSelect: 1,
      maxSelect: 1,
      options: [
        { id: ASADA, name: 'Bien asada', priceDeltaMinor: '0' },
        { id: TRES_CUARTOS, name: 'Tres cuartos', priceDeltaMinor: '0' },
      ],
    },
    {
      id: ADICIONES,
      minSelect: 0,
      maxSelect: 2,
      options: [
        { id: AGUACATE, name: 'Aguacate', priceDeltaMinor: '540000' },
        { id: CHICHARRON, name: 'Chicharrón extra', priceDeltaMinor: '1080000' },
      ],
    },
  ],
};

const ajiaco: CatalogEntry = {
  productId: AJIACO,
  name: 'Ajiaco',
  orderable: true,
  // Solo de 12:00 a 15:00, viernes.
  schedule: { daysMask: 1 << 4, startMinute: 720, endMinute: 900 },
  currentPrice: { id: PRICE_AJIACO, amountMinor: '2800000', currency: 'COP' },
  taxRateBp: 0,
  groups: [],
};

const catalog = new Map([
  [BANDEJA, bandeja],
  [AJIACO, ajiaco],
]);
// Viernes 2026-11-13 a las 13:00 en Bogotá.
const context = {
  currency: 'COP' as const,
  timeZone: 'America/Bogota',
  now: new Date('2026-11-13T18:00:00Z'),
};
const line = (
  overrides: Partial<{
    productId: string;
    priceId: string;
    quantity: number;
    optionIds: string[];
    note: string | null;
  }> = {},
) => ({
  productId: BANDEJA,
  priceId: PRICE_BANDEJA,
  quantity: 1,
  optionIds: [ASADA],
  note: null,
  ...overrides,
});

describe('reglas de opciones', () => {
  it('exige el mínimo y respeta el máximo de cada grupo', () => {
    expect(optionsAreValid(bandeja, [ASADA])).toBe(true);
    expect(optionsAreValid(bandeja, [ASADA, AGUACATE, CHICHARRON])).toBe(true);
    expect(optionsAreValid(bandeja, [])).toBe(false);
    expect(optionsAreValid(bandeja, [ASADA, TRES_CUARTOS])).toBe(false);
  });

  it('rechaza opciones repetidas o de otro producto', () => {
    expect(optionsAreValid(bandeja, [ASADA, AGUACATE, AGUACATE])).toBe(false);
    expect(optionsAreValid(bandeja, [ASADA, '9'.repeat(32)])).toBe(false);
    expect(optionsAreValid(ajiaco, [ASADA])).toBe(false);
  });
});

describe('priceOrder', () => {
  it('suma precio y adicionales por cantidad, con el impuesto contenido por línea', () => {
    const result = priceOrder(
      [
        line({ quantity: 2, optionIds: [ASADA, AGUACATE], note: 'Sin cebolla' }),
        line({ productId: AJIACO, priceId: PRICE_AJIACO, optionIds: [] }),
      ],
      catalog,
      context,
    );
    expect(result.kind).toBe('priced');
    if (result.kind !== 'priced') return;
    const [first, second] = result.summary.lines;
    // (32.400 + 5.400) × 2 = 75.600; 8 % contenido = 5.600.
    expect(first).toMatchObject({
      unitPriceMinor: '3240000',
      modifiersMinor: '540000',
      lineTotalMinor: '7560000',
      taxMinor: '560000',
      note: 'Sin cebolla',
      modifiers: [
        { optionId: ASADA, name: 'Bien asada', priceDeltaMinor: '0' },
        { optionId: AGUACATE, name: 'Aguacate', priceDeltaMinor: '540000' },
      ],
    });
    expect(second).toMatchObject({ lineTotalMinor: '2800000', taxMinor: '0' });
    expect(result.summary).toMatchObject({
      totalMinor: '10360000',
      taxMinor: '560000',
      subtotalMinor: '9800000',
    });
    expect(result.priceChanges).toEqual([]);
  });

  it('informa el precio cambiado con el precio vigente, sin rechazar', () => {
    const result = priceOrder([line({ priceId: 'old'.padEnd(32, '0') })], catalog, context);
    expect(result).toMatchObject({
      kind: 'priced',
      priceChanges: [
        {
          kind: 'price-changed',
          position: 0,
          previousPriceId: 'old'.padEnd(32, '0'),
          priceId: PRICE_BANDEJA,
        },
      ],
      summary: { totalMinor: '3240000' },
    });
  });

  it('rechaza lo no disponible, fuera de horario, archivado, sin precio o en otra moneda', () => {
    const later = { ...context, now: new Date('2026-11-13T21:00:00Z') }; // viernes 16:00
    expect(
      priceOrder(
        [line({ productId: AJIACO, priceId: PRICE_AJIACO, optionIds: [] })],
        catalog,
        later,
      ),
    ).toEqual({
      kind: 'rejected',
      problems: [{ kind: 'unavailable', position: 0, productId: AJIACO }],
    });
    for (const changed of [
      { ...bandeja, orderable: false },
      { ...bandeja, currentPrice: null },
      { ...bandeja, currentPrice: { id: PRICE_BANDEJA, amountMinor: '100', currency: 'USD' } },
    ]) {
      expect(priceOrder([line()], new Map([[BANDEJA, changed]]), context).kind).toBe('rejected');
    }
    expect(priceOrder([line({ productId: '9'.repeat(32) })], catalog, context)).toMatchObject({
      kind: 'rejected',
      problems: [{ kind: 'unavailable' }],
    });
  });

  it('rechaza opciones no válidas indicando la línea', () => {
    expect(priceOrder([line(), line({ optionIds: [] })], catalog, context)).toEqual({
      kind: 'rejected',
      problems: [{ kind: 'invalid-options', position: 1, productId: BANDEJA }],
    });
  });

  it('total = subtotal + impuesto en cualquier combinación', () => {
    for (let quantity = 1; quantity <= 99; quantity += 7) {
      const result = priceOrder(
        [line({ quantity, optionIds: [TRES_CUARTOS, CHICHARRON] })],
        catalog,
        context,
      );
      if (result.kind !== 'priced') throw new Error('debía calcularse');
      const { subtotalMinor, taxMinor, totalMinor } = result.summary;
      expect(BigInt(subtotalMinor) + BigInt(taxMinor)).toBe(BigInt(totalMinor));
    }
  });
});
