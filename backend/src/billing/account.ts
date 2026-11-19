import { createHash } from 'node:crypto';
import {
  allocatePayment,
  buildBill,
  cashChange,
  closeBlockers,
  err,
  formatMoney,
  Money,
  ok,
  refundableAmount,
  splitEvenly,
  suggestTip,
  validateTip,
  wholeUnitMinor,
  type BillSummary,
} from '@tavelyo/core';
import {
  REFUND_LIMIT_PESOS,
  type BillPaymentsResponse,
  type BillResponse,
  type CloseTableResponse,
  type RecordedPaymentResponse,
  type RecordPaymentRequest,
  type RecordRefundRequest,
  type RecordRefundResponse,
} from '@tavelyo/contracts';
import { newId } from '../shared/clock.ts';
import { failure, type Actor, type Outcome } from '../shared/outcome.ts';
import { parseBillScope, parseReadBill, parseRecordPayment, parseRefund } from './input.ts';
import type { AccountPayment, AccountSnapshot, BillingStore } from './store.ts';

const formatCop = (money: Money) => formatMoney(money);

const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const conflict = () =>
  err(failure('failed-precondition', 'La cuenta cambió. Revísala antes de registrar el pago.'));

export function billableLines(snapshot: AccountSnapshot) {
  return snapshot.lines.filter(
    (line) =>
      line.order.sentToKitchenAt !== null &&
      ['NOT_REQUIRED', 'APPROVED'].includes(line.order.approval) &&
      line.status !== 'CANCELLED',
  );
}

const review = () =>
  err(failure('failed-precondition', 'La cuenta requiere revisión de sus asignaciones.'));

/** Reembolsos que cuentan (los rechazados no), en pesos de la cuenta. */
const activeRefunds = (payment: AccountPayment) =>
  payment.refunds.filter((r) => r.status !== 'REJECTED');

/**
 * Lo devuelto por plato de un pago a una línea (D-37). Una línea cancelada con pagos solo es válida
 * si todo lo asignado se devolvió así; entonces sus asignaciones salen de la cuenta.
 */
function lineRefunded(payment: AccountPayment, orderItemId: string): bigint {
  return payment.refunds
    .filter((r) => r.status === 'CONFIRMED' && r.orderItemId === orderItemId)
    .reduce((sum, r) => sum + BigInt(r.amountMinor), 0n);
}

export function accountSummary(snapshot: AccountSnapshot): Outcome<BillSummary> {
  if (snapshot.currency !== 'COP')
    return err(failure('failed-precondition', 'La moneda de la cuenta no está habilitada.'));
  const billable = new Set(billableLines(snapshot).map((l) => l.id));
  const allocations = [];
  for (const payment of snapshot.payments) {
    for (const a of payment.allocations) {
      if (billable.has(a.orderItemId)) {
        allocations.push({
          orderItemId: a.orderItemId,
          amount: Money.ofMinor(BigInt(a.amountMinor), 'COP'),
        });
      } else if (lineRefunded(payment, a.orderItemId) !== BigInt(a.amountMinor)) {
        return review();
      }
    }
  }
  const result = buildBill(
    'COP',
    billableLines(snapshot).map((line) => ({
      id: line.id,
      participantId: line.order.participantId,
      status: line.status,
      lineTotal: Money.ofMinor(BigInt(line.lineTotalMinor), 'COP'),
      tax: Money.ofMinor(BigInt(line.taxMinor), 'COP'),
    })),
    allocations,
  );
  return result.ok ? result : review();
}

export function accountRevision(snapshot: AccountSnapshot): string {
  return hash({
    bill: snapshot.bill,
    open: snapshot.open,
    lines: billableLines(snapshot).map((l) => [l.id, l.version, l.lineTotalMinor, l.taxMinor]),
    payments: snapshot.payments.map((p) => [
      p.paymentId,
      p.allocations,
      activeRefunds(p).map((r) => [r.id, r.amountMinor, r.status]),
    ]),
  });
}

const sumRefunds = (snapshot: AccountSnapshot) =>
  snapshot.payments
    .flatMap((p) => p.refunds)
    .filter((r) => r.status === 'CONFIRMED')
    .reduce((sum, r) => sum + BigInt(r.amountMinor), 0n);

export function createReadBill(store: BillingStore) {
  return async (actor: Actor, data: unknown): Promise<Outcome<BillResponse>> => {
    const input = parseReadBill(data);
    if (!input.ok) return input;
    const loaded = await store.load(actor, input.value, 'bill.read');
    if (!loaded.ok) return loaded;
    const summary = accountSummary(loaded.value);
    if (!summary.ok) return summary;
    const bill = summary.value;
    const details = new Map(loaded.value.lines.map((l) => [l.id, l]));
    return ok({
      sessionId: input.value.sessionId,
      currency: bill.currency,
      revision: accountRevision(loaded.value),
      totalMinor: bill.total.amountMinor.toString(),
      taxMinor: bill.tax.amountMinor.toString(),
      paidMinor: bill.paid.amountMinor.toString(),
      outstandingMinor: bill.outstanding.amountMinor.toString(),
      suggestedTipMinor: suggestTip(bill.total).amountMinor.toString(),
      lines: bill.lines.map((l) => {
        const detail = details.get(l.id);
        if (!detail) throw new Error('Falta la instantánea de una línea de la cuenta');
        return {
          id: l.id,
          participantId: l.participantId,
          name: detail.productNameSnapshot,
          quantity: detail.quantity,
          totalMinor: l.total.amountMinor.toString(),
          taxMinor: l.tax.amountMinor.toString(),
          paidMinor: l.paid.amountMinor.toString(),
          outstandingMinor: l.outstanding.amountMinor.toString(),
        };
      }),
      participants: [...bill.byParticipant].map(([participantId, p]) => ({
        participantId,
        totalMinor: p.total.amountMinor.toString(),
        paidMinor: p.paid.amountMinor.toString(),
        outstandingMinor: p.outstanding.amountMinor.toString(),
      })),
      refundedMinor: sumRefunds(loaded.value).toString(),
      split:
        input.value.parts === undefined
          ? null
          : splitEvenly(bill.outstanding, input.value.parts).map((p) => p.amountMinor.toString()),
    });
  };
}

/** Lo que aún se puede devolver de un pago: consumo más propina, menos reembolsos que cuentan. */
function paymentRefundable(payment: AccountPayment): Money {
  return refundableAmount(
    Money.ofMinor(BigInt(payment.amountMinor) + BigInt(payment.tipMinor), 'COP'),
    activeRefunds(payment).map((r) => ({
      status: r.status,
      amount: Money.ofMinor(BigInt(r.amountMinor), 'COP'),
    })),
  );
}

export function createReadBillPayments(store: BillingStore) {
  return async (actor: Actor, data: unknown): Promise<Outcome<BillPaymentsResponse>> => {
    const input = parseBillScope(data);
    if (!input.ok) return input;
    const loaded = await store.load(actor, input.value, 'payment.refund');
    if (!loaded.ok) return loaded;
    const summary = accountSummary(loaded.value);
    if (!summary.ok) return summary;
    return ok({
      sessionId: input.value.sessionId,
      revision: accountRevision(loaded.value),
      payments: loaded.value.payments.map((p) => ({
        paymentId: p.paymentId,
        method: p.method,
        amountMinor: p.amountMinor,
        tipMinor: p.tipMinor,
        receiptNumber: p.receiptNumber,
        refundedMinor: activeRefunds(p)
          .reduce((sum, r) => sum + BigInt(r.amountMinor), 0n)
          .toString(),
        refundableMinor: paymentRefundable(p).amountMinor.toString(),
      })),
    });
  };
}

export function refundFingerprint(input: RecordRefundRequest): string {
  const { revision: _revision, ...intention } = input;
  void _revision;
  return hash(intention);
}

/** Respuesta de un reembolso ya registrado con la misma clave, o null si no lo hay. */
function existingRefund(
  snapshot: AccountSnapshot,
  input: RecordRefundRequest,
): Outcome<RecordRefundResponse> | null {
  const rows = snapshot.payments.flatMap((p) =>
    p.refunds
      .filter((r) => r.idempotencyKey === input.idempotencyKey)
      .map((r) => ({ ...r, paymentId: p.paymentId })),
  );
  if (rows.length === 0) return null;
  if (rows.some((r) => r.requestFingerprint !== refundFingerprint(input)))
    return err(failure('failed-precondition', 'Esa clave ya identifica un reembolso diferente.'));
  return ok({
    kind: input.orderItemId ? 'LINE' : 'GENERAL',
    orderItemId: input.orderItemId ?? null,
    totalMinor: rows.reduce((sum, r) => sum + BigInt(r.amountMinor), 0n).toString(),
    refunds: rows.map((r) => ({
      refundId: r.id,
      paymentId: r.paymentId,
      amountMinor: r.amountMinor,
    })),
  });
}

const refundFailure = (message: string) => err(failure('failed-precondition', message));

/** Tope del rol en unidades menores (D-34); null sin tope; undefined si el rol no reembolsa. */
function refundLimit(roleCode: string): Money | null | undefined {
  if (!(roleCode in REFUND_LIMIT_PESOS)) return undefined;
  const pesos = REFUND_LIMIT_PESOS[roleCode];
  return pesos === null || pesos === undefined
    ? null
    : Money.ofMinor(BigInt(pesos) * wholeUnitMinor('COP'), 'COP');
}

/** Qué devolver de cada pago: por plato (lo pagado de esa línea) o general (un pago, un importe). */
function planRefunds(
  snapshot: AccountSnapshot,
  input: RecordRefundRequest,
): Outcome<{
  refunds: { refundId: string; paymentId: string; amountMinor: string }[];
  line: { id: string; version: number; wasted: boolean } | null;
}> {
  if (input.orderItemId) {
    if (!snapshot.open)
      return refundFailure('La mesa está cerrada: usa un reembolso general del pago.');
    const line = billableLines(snapshot).find((l) => l.id === input.orderItemId);
    if (!line) return refundFailure('Ese plato no está en la cuenta o ya se canceló.');
    const refunds = [];
    for (const payment of snapshot.payments) {
      const allocated = payment.allocations
        .filter((a) => a.orderItemId === line.id)
        .reduce((sum, a) => sum + BigInt(a.amountMinor), 0n);
      if (allocated === 0n) continue;
      const amount = Money.ofMinor(allocated, 'COP');
      if (paymentRefundable(payment).compareTo(amount) < 0)
        return refundFailure(
          'Un pago de este plato ya tiene reembolsos generales; revisa los pagos antes de devolverlo.',
        );
      refunds.push({
        refundId: newId(),
        paymentId: payment.paymentId,
        amountMinor: allocated.toString(),
      });
    }
    if (refunds.length === 0)
      return refundFailure('Ese plato no tiene pagos registrados: cancélalo desde el salón.');
    return ok({
      refunds,
      line: { id: line.id, version: line.version, wasted: line.status !== 'RECEIVED' },
    });
  }
  const payment = snapshot.payments.find((p) => p.paymentId === input.paymentId);
  if (!payment) return refundFailure('Ese pago no pertenece a la cuenta.');
  const requested = Money.ofMinor(BigInt(input.amountMinor ?? '0'), 'COP');
  if (requested.compareTo(paymentRefundable(payment)) > 0)
    return refundFailure('El reembolso supera lo que queda por devolver de ese pago.');
  return ok({
    refunds: [
      {
        refundId: newId(),
        paymentId: payment.paymentId,
        amountMinor: requested.amountMinor.toString(),
      },
    ],
    line: null,
  });
}

export function createRefundPayment(store: BillingStore) {
  return async (actor: Actor, data: unknown): Promise<Outcome<RecordRefundResponse>> => {
    const parsed = parseRefund(data);
    if (!parsed.ok) return parsed;
    const input = parsed.value;
    const loaded = await store.load(actor, input, 'payment.refund');
    if (!loaded.ok) return loaded;
    const snapshot = loaded.value;
    const existing = existingRefund(snapshot, input);
    if (existing) return existing;
    if (!snapshot.bill || accountRevision(snapshot) !== input.revision) return conflict();
    const summary = accountSummary(snapshot);
    if (!summary.ok) return summary;
    const limit = refundLimit(snapshot.roleCode);
    if (limit === undefined)
      return err(failure('permission-denied', 'Tu rol no puede registrar reembolsos.'));
    const plan = planRefunds(snapshot, input);
    if (!plan.ok) return plan;
    const total = plan.value.refunds.reduce((sum, r) => sum + BigInt(r.amountMinor), 0n);
    if (limit && total > limit.amountMinor)
      return err(
        failure(
          'permission-denied',
          `El reembolso supera tu tope de ${formatCop(limit)}. Pídelo a un rol con un tope mayor.`,
        ),
      );
    if (
      await store.refund(actor, {
        scope: input,
        snapshot: { ...snapshot, bill: snapshot.bill },
        idempotencyKey: input.idempotencyKey,
        fingerprint: refundFingerprint(input),
        reason: input.reason,
        refunds: plan.value.refunds,
        line: plan.value.line,
      })
    )
      return ok({
        kind: input.orderItemId ? 'LINE' : 'GENERAL',
        orderItemId: input.orderItemId ?? null,
        totalMinor: total.toString(),
        refunds: plan.value.refunds,
      });
    const latest = await store.load(actor, input, 'payment.refund');
    if (!latest.ok) return latest;
    return existingRefund(latest.value, input) ?? conflict();
  };
}

export function paymentFingerprint(input: RecordPaymentRequest): string {
  // La revisión protege la primera escritura; no cambia la identidad de un reintento ya registrado.
  const { revision: _revision, ...intention } = input;
  void _revision;
  return hash(intention);
}

function existingPayment(
  snapshot: AccountSnapshot,
  input: RecordPaymentRequest,
): Outcome<RecordedPaymentResponse> | null {
  const existing = snapshot.payments.find((p) => p.idempotencyKey === input.idempotencyKey);
  if (!existing) return null;
  if (existing.requestFingerprint !== paymentFingerprint(input))
    return err(failure('failed-precondition', 'Esa clave ya identifica un pago diferente.'));
  // Campo por campo: la respuesta del reintento es idéntica a la primera, aunque la fila tenga más datos.
  return ok({
    paymentId: existing.paymentId,
    method: existing.method,
    amountMinor: existing.amountMinor,
    tipMinor: existing.tipMinor,
    currency: existing.currency,
    receivedMinor: existing.receivedMinor,
    changeMinor: existing.changeMinor,
    receiptNumber: existing.receiptNumber,
  });
}

export function createRecordPayment(store: BillingStore) {
  return async (actor: Actor, data: unknown): Promise<Outcome<RecordedPaymentResponse>> => {
    const parsed = parseRecordPayment(data);
    if (!parsed.ok) return parsed;
    const input = parsed.value;
    const loaded = await store.load(actor, input, 'payment.record');
    if (!loaded.ok) return loaded;
    const snapshot = loaded.value;
    const existing = existingPayment(snapshot, input);
    if (existing) return existing;
    if (
      !snapshot.open ||
      snapshot.bill?.status === 'SETTLED' ||
      accountRevision(snapshot) !== input.revision
    )
      return conflict();
    const summary = accountSummary(snapshot);
    if (!summary.ok) return summary;
    const amount = Money.ofMinor(BigInt(input.amountMinor), 'COP');
    const tip = Money.ofMinor(BigInt(input.tipMinor), 'COP');
    if (!validateTip(tip, amount).ok)
      return err(
        failure(
          'invalid-argument',
          'La propina debe ser en pesos enteros y no superar el consumo pagado.',
        ),
      );
    const selected = input.participantId
      ? new Set(
          summary.value.lines
            .filter((l) => l.participantId === input.participantId)
            .map((l) => l.id),
        )
      : undefined;
    const allocations = allocatePayment(summary.value, amount, selected);
    if (!allocations.ok)
      return err(
        failure(
          'failed-precondition',
          'El importe supera el saldo de las líneas elegidas o no hay consumo pendiente.',
        ),
      );
    const change =
      input.method === 'CASH'
        ? cashChange(amount.plus(tip), Money.ofMinor(BigInt(input.receivedMinor ?? '0'), 'COP'))
        : null;
    if (change && !change.ok)
      return err(
        failure('invalid-argument', 'El efectivo recibido no cubre el consumo y la propina.'),
      );
    const payment: RecordedPaymentResponse = {
      paymentId: newId(),
      method: input.method,
      amountMinor: input.amountMinor,
      tipMinor: input.tipMinor,
      currency: input.currency,
      receivedMinor: input.receivedMinor ?? null,
      changeMinor: change?.ok ? change.value.amountMinor.toString() : null,
      receiptNumber: input.receiptNumber ?? null,
    };
    if (
      await store.record(actor, {
        input,
        snapshot,
        payment,
        fingerprint: paymentFingerprint(input),
        allocations: allocations.value.map((a) => ({
          orderItemId: a.orderItemId,
          amountMinor: a.amount.amountMinor.toString(),
        })),
      })
    )
      return ok(payment);
    const latest = await store.load(actor, input, 'payment.record');
    if (!latest.ok) return latest;
    return existingPayment(latest.value, input) ?? conflict();
  };
}

/** Hay pedidos que esperan la decisión del mesero (D-32): impiden cerrar la mesa. */
const hasPendingApprovals = (snapshot: AccountSnapshot) =>
  snapshot.lines.some((l) => l.order.approval === 'PENDING' && l.status !== 'CANCELLED');

/** Por qué no se puede cerrar la mesa, en palabras para el personal (D-30). */
export function closeProblems(snapshot: AccountSnapshot, bill: BillSummary): string[] {
  const problems: string[] = [];
  for (const blocker of closeBlockers(bill)) {
    if (blocker.kind === 'balance-due')
      problems.push(`Falta cobrar ${formatCop(blocker.outstanding)}.`);
    else
      problems.push(
        blocker.lineIds.length === 1
          ? 'Hay 1 plato en cocina o sin entregar.'
          : `Hay ${blocker.lineIds.length} platos en cocina o sin entregar.`,
      );
  }
  if (hasPendingApprovals(snapshot))
    problems.push('Hay pedidos esperando la aprobación del mesero.');
  return problems;
}

export function createCloseTable(store: BillingStore) {
  return async (actor: Actor, data: unknown): Promise<Outcome<CloseTableResponse>> => {
    const input = parseBillScope(data);
    if (!input.ok) return input;
    const loaded = await store.load(actor, input.value, 'session.close');
    if (!loaded.ok) return loaded;
    const snapshot = loaded.value;
    if (!snapshot.open) return err(failure('failed-precondition', 'La mesa ya está cerrada.'));
    const summary = accountSummary(snapshot);
    if (!summary.ok) return summary;
    const problems = closeProblems(snapshot, summary.value);
    if (problems.length > 0)
      return err(
        failure('failed-precondition', `No se puede cerrar la mesa. ${problems.join(' ')}`),
      );
    const settle = snapshot.bill
      ? {
          billId: snapshot.bill.id,
          version: snapshot.bill.version,
          totalMinor: summary.value.total.amountMinor.toString(),
        }
      : null;
    const outcome = await store.close(actor, { scope: input.value, settle });
    if (outcome === 'denied')
      return err(failure('permission-denied', 'No tienes acceso a esta cuenta.'));
    if (outcome === 'changed')
      return err(
        failure('failed-precondition', 'La mesa cambió mientras la cerrabas. Revísala de nuevo.'),
      );
    return ok({ sessionId: input.value.sessionId, settledTotalMinor: settle?.totalMinor ?? null });
  };
}
