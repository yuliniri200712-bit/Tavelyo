import {
  isWithinWeeklySchedule,
  Money,
  type CurrencyCode,
  type RoundingMode,
  type WeeklySchedule,
} from '@tavelyo/core';
import type {
  QuoteChange,
  QuotedLine,
  QuoteLineRequest,
  QuoteProblem,
  QuoteSummary,
} from '@tavelyo/contracts';

/**
 * Redondeo del impuesto contenido por línea (D-01b). Se documenta en testing/fase-2.md y se
 * concilia con la facturación del restaurante cuando se decida D-02 y la facturación electrónica.
 */
export const TAX_ROUNDING: RoundingMode = 'half-up';

export interface CatalogOption {
  readonly id: string;
  readonly name: string;
  readonly priceDeltaMinor: string;
}

export interface CatalogGroup {
  readonly id: string;
  readonly minSelect: number;
  readonly maxSelect: number;
  readonly options: readonly CatalogOption[];
}

/** Un producto tal como está ahora en la sucursal (lo lee el backend, nunca lo envía el cliente). */
export interface CatalogEntry {
  readonly productId: string;
  readonly name: string;
  /** Disponible en la sucursal y con producto y categoría sin archivar. */
  readonly orderable: boolean;
  readonly schedule: WeeklySchedule | null;
  readonly currentPrice: {
    readonly id: string;
    readonly amountMinor: string;
    readonly currency: string;
  } | null;
  /** Tasa del impuesto contenido en puntos básicos (0 si el producto no tiene impuesto). */
  readonly taxRateBp: number;
  readonly groups: readonly CatalogGroup[];
}

export interface PricingContext {
  readonly currency: CurrencyCode;
  readonly timeZone: string;
  readonly now: Date;
}

export type PricingResult =
  | { readonly kind: 'rejected'; readonly problems: readonly QuoteProblem[] }
  | {
      readonly kind: 'priced';
      readonly summary: QuoteSummary;
      /** Precios que cambiaron respecto a lo que vio el cliente (caso 5). */
      readonly priceChanges: readonly QuoteChange[];
    };

/** ¿Respetan las opciones elegidas los grupos del producto (mínimo, máximo, sin repetir)? */
export function optionsAreValid(entry: CatalogEntry, optionIds: readonly string[]): boolean {
  if (new Set(optionIds).size !== optionIds.length) return false;
  const known = new Set(entry.groups.flatMap((group) => group.options.map((o) => o.id)));
  if (!optionIds.every((id) => known.has(id))) return false;
  return entry.groups.every((group) => {
    const chosen = group.options.filter((option) => optionIds.includes(option.id)).length;
    return chosen >= group.minSelect && chosen <= group.maxSelect;
  });
}

function money(amountMinor: string, currency: CurrencyCode): Money {
  const parsed = Money.fromMinorString(amountMinor, currency);
  if (!parsed.ok) throw new Error(`Importe guardado no válido: ${amountMinor}`);
  return parsed.value;
}

/**
 * Calcula el pedido con los precios vigentes del servidor (D-01b: precios con impuestos
 * incluidos). Por línea: (precio + adicionales) × cantidad; el impuesto contenido se calcula por
 * línea y se suma, y el subtotal es total − impuesto, así que los totales siempre cuadran.
 */
export function priceOrder(
  lines: readonly QuoteLineRequest[],
  catalog: ReadonlyMap<string, CatalogEntry>,
  context: PricingContext,
): PricingResult {
  const problems: QuoteProblem[] = [];
  const priceChanges: QuoteChange[] = [];
  const quoted: QuotedLine[] = [];
  const zero = Money.zero(context.currency);
  let total = zero;
  let tax = zero;

  lines.forEach((line, position) => {
    const entry = catalog.get(line.productId);
    const price = entry?.currentPrice;
    if (
      !entry ||
      !price ||
      !entry.orderable ||
      price.currency !== context.currency ||
      !isWithinWeeklySchedule(entry.schedule, context.now, context.timeZone)
    ) {
      problems.push({ kind: 'unavailable', position, productId: line.productId });
      return;
    }
    if (!optionsAreValid(entry, line.optionIds)) {
      problems.push({ kind: 'invalid-options', position, productId: line.productId });
      return;
    }
    if (price.id !== line.priceId) {
      priceChanges.push({
        kind: 'price-changed',
        position,
        productId: line.productId,
        previousPriceId: line.priceId,
        priceId: price.id,
      });
    }

    const options = entry.groups
      .flatMap((group) => group.options)
      .filter((option) => line.optionIds.includes(option.id));
    const unit = money(price.amountMinor, context.currency);
    const modifiers = options.reduce(
      (sum, option) => sum.plus(money(option.priceDeltaMinor, context.currency)),
      zero,
    );
    const lineTotal = unit.plus(modifiers).times(line.quantity);
    const lineTax = lineTotal.includedTax(entry.taxRateBp, TAX_ROUNDING);
    total = total.plus(lineTotal);
    tax = tax.plus(lineTax);
    quoted.push({
      position,
      productId: line.productId,
      priceId: price.id,
      productName: entry.name,
      quantity: line.quantity,
      unitPriceMinor: unit.toMinorString(),
      modifiers: options.map((option) => ({
        optionId: option.id,
        name: option.name,
        priceDeltaMinor: option.priceDeltaMinor,
      })),
      modifiersMinor: modifiers.toMinorString(),
      lineTotalMinor: lineTotal.toMinorString(),
      taxMinor: lineTax.toMinorString(),
      note: line.note ?? null,
    });
  });

  if (problems.length > 0) return { kind: 'rejected', problems };
  return {
    kind: 'priced',
    priceChanges,
    summary: {
      currency: context.currency,
      lines: quoted,
      subtotalMinor: total.minus(tax).toMinorString(),
      taxMinor: tax.toMinorString(),
      totalMinor: total.toMinorString(),
    },
  };
}
