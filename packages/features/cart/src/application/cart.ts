import type { Money } from '@tavelyo/core';
import { ORDER_LIMITS, type QuoteLineRequest, type QuoteSummary } from '@tavelyo/contracts';
import type { CartLine, CartOption, CartProduct } from '../domain/index.ts';
import { minorAmount as money } from './amount.ts';

/** Precio de una unidad con sus opciones. */
export function unitTotal(line: CartLine): Money {
  return line.options.reduce(
    (sum, option) => sum.plus(money(option.priceDeltaMinor, line.currency)),
    money(line.unitPriceMinor, line.currency),
  );
}

export function lineTotal(line: CartLine): Money {
  return unitTotal(line).times(line.quantity);
}

/**
 * Total que se muestra a la persona. Es solo una estimación: el servidor lo recalcula y, si no
 * coincide, pide confirmar el suyo (caso 5).
 */
export function cartTotal(lines: readonly CartLine[], currency: string): Money {
  return lines.reduce((sum, line) => sum.plus(lineTotal(line)), money('0', currency));
}

export function itemCount(lines: readonly CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(ORDER_LIMITS.maxQuantity, Math.max(1, Math.trunc(quantity)));
}

export function normalizeNote(note: string): string | null {
  const trimmed = note.trim().slice(0, ORDER_LIMITS.maxNoteLength);
  return trimmed === '' ? null : trimmed;
}

function sameChoice(a: CartLine, b: Omit<CartLine, 'key' | 'quantity'>): boolean {
  return (
    a.productId === b.productId &&
    a.priceId === b.priceId &&
    a.note === b.note &&
    a.options.length === b.options.length &&
    a.options.every((option, index) => option.id === b.options[index]?.id)
  );
}

export type AddResult =
  | { readonly ok: true; readonly lines: readonly CartLine[] }
  | { readonly ok: false; readonly message: string };

/** Agrega un producto. Si ya hay una línea igual (mismas opciones y nota), suma la cantidad. */
export function addToCart(
  lines: readonly CartLine[],
  product: CartProduct,
  choice: {
    readonly options: readonly CartOption[];
    readonly quantity: number;
    readonly note: string;
  },
  newKey: () => string,
): AddResult {
  const candidate = {
    productId: product.id,
    productName: product.name,
    priceId: product.priceId,
    unitPriceMinor: product.priceMinor,
    currency: product.currency,
    options: choice.options,
    note: normalizeNote(choice.note),
  };
  const quantity = clampQuantity(choice.quantity);
  const existing = lines.find((line) => sameChoice(line, candidate));
  if (existing) {
    return {
      ok: true,
      lines: lines.map((line) =>
        line === existing ? { ...line, quantity: clampQuantity(line.quantity + quantity) } : line,
      ),
    };
  }
  if (lines.length >= ORDER_LIMITS.maxLines) {
    return {
      ok: false,
      message: `Un pedido admite como máximo ${ORDER_LIMITS.maxLines} productos distintos.`,
    };
  }
  return { ok: true, lines: [...lines, { ...candidate, key: newKey(), quantity }] };
}

export function setQuantity(
  lines: readonly CartLine[],
  key: string,
  quantity: number,
): readonly CartLine[] {
  return lines.map((line) =>
    line.key === key ? { ...line, quantity: clampQuantity(quantity) } : line,
  );
}

export function removeLine(lines: readonly CartLine[], key: string): readonly CartLine[] {
  return lines.filter((line) => line.key !== key);
}

/** Lo que se envía a «Revisar pedido»: productos, versiones de precio, opciones y notas. */
export function toQuoteLines(lines: readonly CartLine[]): QuoteLineRequest[] {
  return lines.map((line) => ({
    productId: line.productId,
    priceId: line.priceId,
    quantity: line.quantity,
    optionIds: line.options.map((option) => option.id),
    note: line.note,
  }));
}

/**
 * La persona aceptó los importes actuales del servidor: el carrito pasa a la versión de precio y
 * a los adicionales que el servidor calculó (las líneas llegan en el mismo orden en que se
 * enviaron).
 */
export function acceptServerPrices(
  lines: readonly CartLine[],
  summary: QuoteSummary,
): readonly CartLine[] {
  return lines.map((line, position) => {
    const quoted = summary.lines.find((entry) => entry.position === position);
    if (!quoted || quoted.productId !== line.productId) return line;
    return {
      ...line,
      productName: quoted.productName,
      priceId: quoted.priceId,
      unitPriceMinor: quoted.unitPriceMinor,
      options: line.options.map((option) => {
        const modifier = quoted.modifiers.find((entry) => entry.optionId === option.id);
        return modifier
          ? { ...option, name: modifier.name, priceDeltaMinor: modifier.priceDeltaMinor }
          : option;
      }),
    };
  });
}
