import { formatMoney, Money } from '@tavelyo/core';
import type { QuoteChange, QuoteProblem, QuoteSummary } from '@tavelyo/contracts';
import { unitTotal, type CartLine } from '@tavelyo/cart';

/** Importe en unidades menores como texto para la persona («$ 25.000»). */
export function formatMinor(minor: string, currency: string): string {
  const parsed = Money.fromMinorString(minor, currency);
  return parsed.ok ? formatMoney(parsed.value) : minor;
}

/**
 * Qué cambió, en texto, para que la persona lo confirme (caso 5): el precio que vio en su
 * carrito y el que calcula ahora el servidor. Nunca se aplica en silencio.
 */
export function describeChange(
  change: QuoteChange,
  lines: readonly CartLine[],
  summary: QuoteSummary,
): string {
  if (change.kind === 'total-changed') {
    return `El total cambió: antes ${formatMinor(change.expectedTotalMinor, summary.currency)}, ahora ${formatMinor(change.totalMinor, summary.currency)}.`;
  }
  const line = lines[change.position];
  const quoted = summary.lines.find((entry) => entry.position === change.position);
  const name = quoted?.productName ?? line?.productName ?? 'Un producto';
  if (!line || !quoted) return `${name} cambió de precio.`;
  const before = formatMoney(unitTotal(line));
  const now = Money.fromMinorString(quoted.unitPriceMinor, summary.currency);
  const modifiers = Money.fromMinorString(quoted.modifiersMinor, summary.currency);
  const after = now.ok && modifiers.ok ? formatMoney(now.value.plus(modifiers.value)) : '';
  return `${name}: antes ${before}, ahora ${after} por unidad.`;
}

/** Qué ya no se puede pedir y qué hacer. */
export function describeProblem(problem: QuoteProblem, lines: readonly CartLine[]): string {
  const name = lines[problem.position]?.productName ?? 'Un producto';
  return problem.kind === 'unavailable'
    ? `${name} ya no está disponible.`
    : `Las opciones de ${name} cambiaron: quítalo y vuelve a elegirlas.`;
}

/** Clave de idempotencia de un intento de «Revisar pedido» (16 a 64 caracteres, sin espacios). */
export function newAttemptKey(randomUuid: () => string): string {
  return `rev_${randomUuid()}`;
}
