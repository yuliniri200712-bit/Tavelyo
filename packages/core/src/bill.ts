import { currencyExponent, type CurrencyCode } from './currency';
import { Money } from './money';
import type { OrderItemStatus } from './order-status';
import { err, ok, type Result } from './result';

/**
 * Cuenta de una mesa (Fase 4, D-06 y D-30). Lógica pura: el servidor la usa con los datos de la
 * base para decidir cuánto cobrar y si la mesa se puede cerrar; la interfaz solo la muestra.
 */

/** Línea del pedido tal como la guarda el servidor (instantánea de OrderItem). */
export interface BillLineInput {
  readonly id: string;
  /** Quien la pidió: por D-06, paga lo que pidió. */
  readonly participantId: string;
  readonly status: OrderItemStatus;
  readonly lineTotal: Money;
  /** Impuesto contenido en lineTotal (D-01b), calculado al pedir. */
  readonly tax: Money;
}

/** Parte de una línea ya cubierta por un pago confirmado o en curso. */
export interface AllocationInput {
  readonly orderItemId: string;
  readonly amount: Money;
}

export interface BillLine {
  readonly id: string;
  readonly participantId: string;
  readonly status: OrderItemStatus;
  readonly total: Money;
  readonly tax: Money;
  readonly paid: Money;
  readonly outstanding: Money;
}

export interface BillPart {
  readonly total: Money;
  readonly paid: Money;
  readonly outstanding: Money;
}

export interface BillSummary {
  readonly currency: CurrencyCode;
  /** Solo las líneas que se cobran: las canceladas no entran en la cuenta. */
  readonly lines: readonly BillLine[];
  readonly total: Money;
  readonly tax: Money;
  readonly paid: Money;
  readonly outstanding: Money;
  /** Lo de cada persona (D-06), en el orden en que aparece cada una. */
  readonly byParticipant: ReadonlyMap<string, BillPart>;
}

export type BillError =
  | { readonly kind: 'currency-mismatch'; readonly lineId: string }
  | { readonly kind: 'unknown-line'; readonly orderItemId: string }
  | { readonly kind: 'over-allocated'; readonly orderItemId: string }
  | { readonly kind: 'invalid-allocation'; readonly orderItemId: string };

/**
 * Arma la cuenta con sus líneas y lo ya pagado. Comprueba las invariantes que SQL Connect no puede
 * expresar entre filas: ninguna asignación es negativa ni apunta a una línea que no se cobra, y lo
 * asignado a una línea nunca supera su importe (una línea no se cobra dos veces).
 */
export function buildBill(
  currency: CurrencyCode,
  lines: readonly BillLineInput[],
  allocations: readonly AllocationInput[],
): Result<BillSummary, BillError> {
  const zero = Money.zero(currency);
  const billable = lines.filter((line) => line.status !== 'CANCELLED');
  for (const line of billable) {
    if (line.lineTotal.currency !== currency || line.tax.currency !== currency) {
      return err({ kind: 'currency-mismatch', lineId: line.id });
    }
  }
  const paidByLine = new Map<string, Money>(billable.map((line) => [line.id, zero]));
  for (const allocation of allocations) {
    const current = paidByLine.get(allocation.orderItemId);
    if (!current) return err({ kind: 'unknown-line', orderItemId: allocation.orderItemId });
    if (allocation.amount.currency !== currency || allocation.amount.isNegative()) {
      return err({ kind: 'invalid-allocation', orderItemId: allocation.orderItemId });
    }
    paidByLine.set(allocation.orderItemId, current.plus(allocation.amount));
  }

  const summaryLines: BillLine[] = [];
  const parts = new Map<string, { total: Money; paid: Money }>();
  let total = zero;
  let tax = zero;
  let paid = zero;
  for (const line of billable) {
    const linePaid = paidByLine.get(line.id) ?? zero;
    if (linePaid.compareTo(line.lineTotal) > 0) {
      return err({ kind: 'over-allocated', orderItemId: line.id });
    }
    summaryLines.push({
      id: line.id,
      participantId: line.participantId,
      status: line.status,
      total: line.lineTotal,
      tax: line.tax,
      paid: linePaid,
      outstanding: line.lineTotal.minus(linePaid),
    });
    total = total.plus(line.lineTotal);
    tax = tax.plus(line.tax);
    paid = paid.plus(linePaid);
    const part = parts.get(line.participantId) ?? { total: zero, paid: zero };
    parts.set(line.participantId, {
      total: part.total.plus(line.lineTotal),
      paid: part.paid.plus(linePaid),
    });
  }

  const byParticipant = new Map<string, BillPart>();
  for (const [participantId, part] of parts) {
    byParticipant.set(participantId, { ...part, outstanding: part.total.minus(part.paid) });
  }
  return ok({
    currency,
    lines: summaryLines,
    total,
    tax,
    paid,
    outstanding: total.minus(paid),
    byParticipant,
  });
}

export type PaymentAllocationError =
  | { readonly kind: 'invalid-amount' }
  | { readonly kind: 'no-lines' }
  | { readonly kind: 'exceeds-outstanding'; readonly outstanding: Money };

/**
 * Reparte un pago entre las líneas elegidas (por ejemplo, las de una persona, o toda la mesa al
 * dividir en partes iguales), en el orden de la cuenta y sin pasar de lo que falta en cada línea.
 * La suma de lo asignado es exactamente el importe del pago.
 */
export function allocatePayment(
  bill: BillSummary,
  amount: Money,
  lineIds?: ReadonlySet<string>,
): Result<readonly AllocationInput[], PaymentAllocationError> {
  if (amount.currency !== bill.currency || amount.isNegative() || amount.isZero()) {
    return err({ kind: 'invalid-amount' });
  }
  const selected = bill.lines.filter(
    (line) => (!lineIds || lineIds.has(line.id)) && !line.outstanding.isZero(),
  );
  if (selected.length === 0) return err({ kind: 'no-lines' });
  const outstanding = selected.reduce(
    (sum, line) => sum.plus(line.outstanding),
    Money.zero(bill.currency),
  );
  if (amount.compareTo(outstanding) > 0) return err({ kind: 'exceeds-outstanding', outstanding });

  const allocations: AllocationInput[] = [];
  let left = amount;
  for (const line of selected) {
    if (left.isZero()) break;
    const share = left.compareTo(line.outstanding) < 0 ? left : line.outstanding;
    allocations.push({ orderItemId: line.id, amount: share });
    left = left.minus(share);
  }
  return ok(allocations);
}

/**
 * Unidad entera de la moneda en unidades menores (1 peso = 100 en COP). Las divisiones y la
 * propina se redondean a esta unidad, porque en efectivo no circulan fracciones.
 */
export function wholeUnitMinor(currency: CurrencyCode): bigint {
  return 10n ** BigInt(currencyExponent(currency));
}

/**
 * Divide un importe en partes iguales en unidades enteras de la moneda: la suma de las partes es
 * siempre el total exacto. Las unidades que sobran van una a una a las primeras partes y, si el
 * total trae fracciones de la unidad, van a la primera. Así el reparto es determinista.
 */
export function splitEvenly(amount: Money, count: number): Money[] {
  if (!Number.isSafeInteger(count) || count < 1) {
    throw new RangeError('El número de partes debe ser un entero positivo');
  }
  if (amount.isNegative()) throw new RangeError('No se divide un importe negativo');
  const unit = wholeUnitMinor(amount.currency);
  const fraction = amount.amountMinor % unit;
  const units = Money.ofMinor((amount.amountMinor - fraction) / unit, amount.currency).split(count);
  return units.map((part, index) =>
    Money.ofMinor(part.amountMinor * unit + (index === 0 ? fraction : 0n), amount.currency),
  );
}

export type CloseBlocker =
  | { readonly kind: 'balance-due'; readonly outstanding: Money }
  | { readonly kind: 'items-pending'; readonly lineIds: readonly string[] };

/**
 * Por qué no se puede cerrar la mesa (D-30): saldo pendiente o líneas que siguen en cocina o sin
 * entregar (se entregan o se cancelan con motivo). Lista vacía: se puede cerrar.
 */
export function closeBlockers(bill: BillSummary): CloseBlocker[] {
  const blockers: CloseBlocker[] = [];
  if (!bill.outstanding.isZero()) {
    blockers.push({ kind: 'balance-due', outstanding: bill.outstanding });
  }
  const pending = bill.lines.filter((line) => line.status !== 'DELIVERED').map((line) => line.id);
  if (pending.length > 0) blockers.push({ kind: 'items-pending', lineIds: pending });
  return blockers;
}
