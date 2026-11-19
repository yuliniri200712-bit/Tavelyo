import { createHash } from 'node:crypto';
import {
  allocatePayment,
  buildBill,
  cashChange,
  err,
  Money,
  ok,
  suggestTip,
  validateTip,
  type BillSummary,
} from '@tavelyo/core';
import type {
  BillResponse,
  RecordedPaymentResponse,
  RecordPaymentRequest,
} from '@tavelyo/contracts';
import { newId } from '../shared/clock.ts';
import { failure, type Actor, type Outcome } from '../shared/outcome.ts';
import { parseBillScope, parseRecordPayment } from './input.ts';
import type { AccountSnapshot, BillingStore } from './store.ts';

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

export function accountSummary(snapshot: AccountSnapshot): Outcome<BillSummary> {
  if (snapshot.currency !== 'COP')
    return err(failure('failed-precondition', 'La moneda de la cuenta no está habilitada.'));
  const result = buildBill(
    'COP',
    billableLines(snapshot).map((line) => ({
      id: line.id,
      participantId: line.order.participantId,
      status: line.status,
      lineTotal: Money.ofMinor(BigInt(line.lineTotalMinor), 'COP'),
      tax: Money.ofMinor(BigInt(line.taxMinor), 'COP'),
    })),
    snapshot.payments.flatMap((payment) =>
      payment.allocations.map((a) => ({
        orderItemId: a.orderItemId,
        amount: Money.ofMinor(BigInt(a.amountMinor), 'COP'),
      })),
    ),
  );
  return result.ok
    ? result
    : err(failure('failed-precondition', 'La cuenta requiere revisión de sus asignaciones.'));
}

export function accountRevision(snapshot: AccountSnapshot): string {
  return hash({
    bill: snapshot.bill,
    open: snapshot.open,
    lines: billableLines(snapshot).map((l) => [l.id, l.version, l.lineTotalMinor, l.taxMinor]),
    payments: snapshot.payments.map((p) => [p.paymentId, p.allocations]),
  });
}

export function createReadBill(store: BillingStore) {
  return async (actor: Actor, data: unknown): Promise<Outcome<BillResponse>> => {
    const input = parseBillScope(data);
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
    });
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
  const {
    idempotencyKey: _key,
    requestFingerprint: _fingerprint,
    allocations: _allocations,
    ...response
  } = existing;
  void _key;
  void _fingerprint;
  void _allocations;
  return ok(response);
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
