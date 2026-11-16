import { describe, expect, it } from 'vitest';
import { formatMoney } from '@tavelyo/core';
import type { QuoteSummary } from '@tavelyo/contracts';
import type { CartOptionGroup, CartProduct } from '../domain/index.ts';
import {
  acceptServerPrices,
  addToCart,
  cartTotal,
  itemCount,
  lineTotal,
  removeLine,
  setQuantity,
  toQuoteLines,
} from './cart.ts';
import {
  describeGroupRule,
  isSingleChoice,
  selectedOptions,
  toggleOption,
  validateSelection,
} from './selection.ts';

function at<T>(list: readonly T[], index: number): T {
  const value = list[index];
  if (value === undefined) throw new Error('Falta el elemento ' + index);
  return value;
}

const term: CartOptionGroup = {
  id: 'g1',
  name: 'Término',
  minSelect: 1,
  maxSelect: 1,
  options: [
    { id: 'o1', name: 'Medio', priceDeltaMinor: '0' },
    { id: 'o2', name: 'Bien asado', priceDeltaMinor: '0' },
  ],
};
const extras: CartOptionGroup = {
  id: 'g2',
  name: 'Adiciones',
  minSelect: 0,
  maxSelect: 2,
  options: [
    { id: 'o3', name: 'Aguacate', priceDeltaMinor: '540000' },
    { id: 'o4', name: 'Tocineta', priceDeltaMinor: '600000' },
    { id: 'o5', name: 'Queso', priceDeltaMinor: '300000' },
  ],
};
const burger: CartProduct = {
  id: 'p1',
  name: 'Hamburguesa',
  priceId: 'pr1',
  priceMinor: '3200000',
  currency: 'COP',
  groups: [term, extras],
};

let counter = 0;
const newKey = () => `k${(counter += 1)}`;

function cartWithBurger(quantity = 2) {
  const result = addToCart(
    [],
    burger,
    { options: [at(term.options, 0), at(extras.options, 0)], quantity, note: '  sin cebolla ' },
    newKey,
  );
  if (!result.ok) throw new Error(result.message);
  return result.lines;
}

describe('carrito', () => {
  it('suma precio y opciones por unidad con Money, sin decimales en COP', () => {
    const lines = cartWithBurger(2);
    expect(lineTotal(at(lines, 0)).toMinorString()).toBe('7480000');
    expect(formatMoney(cartTotal(lines, 'COP'))).toBe(formatMoney(lineTotal(at(lines, 0))));
    expect(itemCount(lines)).toBe(2);
    expect(at(lines, 0).note).toBe('sin cebolla');
  });

  it('la misma elección suma cantidad; otra elección es otra línea', () => {
    const lines = cartWithBurger(2);
    const same = addToCart(
      lines,
      burger,
      { options: [at(term.options, 0), at(extras.options, 0)], quantity: 1, note: 'sin cebolla' },
      newKey,
    );
    expect(same.ok && same.lines).toHaveLength(1);
    expect(same.ok && at(same.lines, 0).quantity).toBe(3);
    const other = addToCart(
      lines,
      burger,
      { options: [at(term.options, 1)], quantity: 1, note: '' },
      newKey,
    );
    expect(other.ok && other.lines).toHaveLength(2);
  });

  it('la cantidad queda entre 1 y 99 y se puede quitar una línea', () => {
    const lines = cartWithBurger(98);
    const key = at(lines, 0).key;
    expect(at(setQuantity(lines, key, 500), 0).quantity).toBe(99);
    expect(at(setQuantity(lines, key, 0), 0).quantity).toBe(1);
    expect(removeLine(lines, key)).toEqual([]);
  });

  it('no admite más de 50 productos distintos, como el servidor', () => {
    let lines = cartWithBurger(1);
    for (let index = 0; lines.length < 50; index += 1) {
      const result = addToCart(
        lines,
        { ...burger, id: `p-${index}` },
        { options: [], quantity: 1, note: '' },
        newKey,
      );
      if (result.ok) lines = result.lines;
    }
    const full = addToCart(
      lines,
      { ...burger, id: 'p-extra' },
      { options: [], quantity: 1, note: '' },
      newKey,
    );
    expect(full).toEqual({
      ok: false,
      message: 'Un pedido admite como máximo 50 productos distintos.',
    });
  });

  it('envía al servidor productos, versión de precio, opciones y nota; nunca importes', () => {
    expect(toQuoteLines(cartWithBurger(2))).toEqual([
      {
        productId: 'p1',
        priceId: 'pr1',
        quantity: 2,
        optionIds: ['o1', 'o3'],
        note: 'sin cebolla',
      },
    ]);
  });

  it('al aceptar los importes del servidor, toma su versión de precio y sus adicionales', () => {
    const lines = cartWithBurger(1);
    const summary: QuoteSummary = {
      currency: 'COP',
      subtotalMinor: '0',
      taxMinor: '0',
      totalMinor: '4000000',
      lines: [
        {
          position: 0,
          productId: 'p1',
          priceId: 'pr2',
          productName: 'Hamburguesa',
          quantity: 1,
          unitPriceMinor: '3400000',
          modifiers: [
            { optionId: 'o1', name: 'Medio', priceDeltaMinor: '0' },
            { optionId: 'o3', name: 'Aguacate', priceDeltaMinor: '600000' },
          ],
          modifiersMinor: '600000',
          lineTotalMinor: '4000000',
          taxMinor: '0',
          note: 'sin cebolla',
        },
      ],
    };
    const accepted = acceptServerPrices(lines, summary);
    expect(at(accepted, 0).priceId).toBe('pr2');
    expect(cartTotal(accepted, 'COP').toMinorString()).toBe('4000000');
  });
});

describe('opciones de un producto', () => {
  it('explica la regla de cada grupo en texto', () => {
    expect(describeGroupRule(term)).toBe('Elige 1');
    expect(describeGroupRule(extras)).toBe('Opcional: elige hasta 2');
    expect(describeGroupRule({ ...extras, minSelect: 1 })).toBe('Elige de 1 a 2');
    expect(isSingleChoice(term)).toBe(true);
    expect(isSingleChoice({ ...term, minSelect: 0 })).toBe(false);
  });

  it('valida mínimo y máximo, y conserva el orden de la carta', () => {
    expect(validateSelection([term, extras], new Set())).toEqual({
      g1: 'Elige una opción de «Término».',
    });
    expect(validateSelection([term, extras], new Set(['o1', 'o3', 'o4', 'o5']))).toEqual({
      g2: 'Elige como máximo 2 de «Adiciones».',
    });
    expect(selectedOptions([term, extras], new Set(['o4', 'o2'])).map((o) => o.id)).toEqual([
      'o2',
      'o4',
    ]);
  });

  it('en un grupo de máximo 1 la elección se reemplaza; si es opcional, se puede quitar', () => {
    expect([...toggleOption(term, new Set(['o1']), 'o2')]).toEqual(['o2']);
    expect([...toggleOption(term, new Set(['o1']), 'o1')]).toEqual(['o1']);
    const optional = { ...term, minSelect: 0 };
    expect([...toggleOption(optional, new Set(['o1']), 'o1')]).toEqual([]);
    expect([...toggleOption(extras, new Set(['o3']), 'o4')].sort()).toEqual(['o3', 'o4']);
  });
});
