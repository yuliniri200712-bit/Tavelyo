import { Money } from '@tavelyo/core';

/** Importe en unidades menores como Money. Los importes del carrito ya vienen validados. */
export function minorAmount(amountMinor: string, currency: string): Money {
  const parsed = Money.fromMinorString(amountMinor, currency);
  if (!parsed.ok) throw new Error(`Importe no válido en el carrito: ${amountMinor} ${currency}`);
  return parsed.value;
}
