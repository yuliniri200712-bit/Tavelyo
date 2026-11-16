import { currencyExponent, type CurrencyCode } from './currency';
import type { Money } from './money';

/**
 * Monedas cuyos precios se capturan y muestran en unidades enteras aunque ISO 4217 les asigne
 * decimales (D-01: en Colombia los precios se escriben sin centavos, «$ 25.000»). Si el importe
 * tiene fracción, se muestra con todos sus decimales para no ocultar ningún valor.
 */
const WHOLE_UNIT_DISPLAY: ReadonlySet<CurrencyCode> = new Set(['COP']);

/** Locale de presentación por defecto (D-01: Colombia). */
export const DEFAULT_LOCALE = 'es-CO';

/** Importe como texto para la interfaz, sin pasar nunca por `number` (ADR-0005). */
export function formatMoney(money: Money, locale: string = DEFAULT_LOCALE): string {
  const exponent = currencyExponent(money.currency);
  const scale = 10n ** BigInt(exponent);
  const magnitude = money.amountMinor < 0n ? -money.amountMinor : money.amountMinor;
  const whole = magnitude / scale;
  const fraction = magnitude % scale;
  const digits = WHOLE_UNIT_DISPLAY.has(money.currency) && fraction === 0n ? 0 : exponent;
  const decimal =
    (money.amountMinor < 0n ? '-' : '') +
    whole.toString() +
    (exponent > 0 ? `.${fraction.toString().padStart(exponent, '0')}` : '');
  const format = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  // Cadena decimal exacta: Intl la formatea sin convertirla a coma flotante.
  return format.format(decimal as Intl.StringNumericLiteral);
}
