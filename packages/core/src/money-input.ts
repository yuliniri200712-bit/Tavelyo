import { currencyExponent, type CurrencyCode } from './currency';
import { Money } from './money';
import { err, ok, type Result } from './result';

export type MoneyInputError =
  | { readonly kind: 'empty' }
  | { readonly kind: 'invalid' }
  | { readonly kind: 'too-many-decimals'; readonly allowed: number };

/** Monedas cuyos precios se escriben en unidades enteras (D-01: «$ 25.000», sin centavos). */
const WHOLE_UNIT_INPUT: ReadonlySet<CurrencyCode> = new Set(['COP']);

/**
 * Importe escrito por una persona en unidades mayores (pesos) a `Money` en unidades menores, sin
 * pasar por `number`. Acepta «25000», «25.000» y «$ 25.000» (punto de miles de es-CO); con
 * decimales, la coma («19,99»). Para COP no admite centavos: los precios se capturan en pesos.
 */
export function parseMajorAmount(
  text: string,
  currency: CurrencyCode,
): Result<Money, MoneyInputError> {
  // \s incluye el espacio duro que usa el formato es-CO entre «$» y el importe.
  const cleaned = text.replace(/[\s$]/g, '');
  if (cleaned === '') return err({ kind: 'empty' });
  const match = /^(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?$/.exec(cleaned);
  if (!match) return err({ kind: 'invalid' });
  const whole = (match[1] ?? '').replaceAll('.', '');
  const fraction = match[2] ?? '';
  const exponent = currencyExponent(currency);
  const allowed = WHOLE_UNIT_INPUT.has(currency) ? 0 : exponent;
  if (fraction.length > allowed) return err({ kind: 'too-many-decimals', allowed });
  const minor =
    BigInt(whole) * 10n ** BigInt(exponent) + BigInt(fraction.padEnd(exponent, '0') || '0');
  return ok(Money.ofMinor(minor, currency));
}

/** Unidades menores a texto editable en unidades mayores (inverso de parseMajorAmount). */
export function toMajorInput(money: Money): string {
  const exponent = currencyExponent(money.currency);
  const scale = 10n ** BigInt(exponent);
  const sign = money.amountMinor < 0n ? '-' : '';
  const magnitude = money.amountMinor < 0n ? -money.amountMinor : money.amountMinor;
  const whole = (magnitude / scale).toString();
  const fraction = magnitude % scale;
  return fraction === 0n
    ? `${sign}${whole}`
    : `${sign}${whole},${fraction.toString().padStart(exponent, '0')}`;
}
