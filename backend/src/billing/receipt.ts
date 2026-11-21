import { err, ok } from '@tavelyo/core';
import type { BillScope, PaymentReceiptResponse, RecordedPaymentMethod } from '@tavelyo/contracts';
import { canonicalUuid } from '../shared/clock.ts';
import { isUuid } from '../shared/input.ts';
import { failure, type Actor, type Outcome } from '../shared/outcome.ts';
import { parseBillScope } from './input.ts';

// Comprobante comercial de un pago (Fase 4, bloque 6a). No es factura electrónica (RF-PA-08):
// lo dice el propio comprobante. Todos los importes salen de la base, nunca del navegador.

export interface ReceiptRow {
  readonly tenantName: string;
  readonly taxId: string | null;
  readonly branchName: string;
  readonly tableCode: string;
  readonly payment: {
    readonly sessionId: string;
    readonly status: string;
    readonly method: RecordedPaymentMethod | 'CARD_CAPTURE' | 'CARD_CHARGE';
    readonly amountMinor: string;
    readonly tipMinor: string;
    readonly currency: string;
    readonly receivedMinor: string | null;
    readonly changeMinor: string | null;
    readonly receiptNumber: string | null;
    readonly confirmedAt: string | null;
    readonly lines: readonly { name: string; quantity: number; amountMinor: string }[];
    readonly refundsMinor: readonly string[];
  } | null;
}

export interface ReceiptStore {
  /** Datos del comprobante si quien llama tiene `payment.record` en la sucursal de la mesa. */
  load(actor: Actor, scope: BillScope, paymentId: string): Promise<Outcome<ReceiptRow>>;
}

const RECORDED = new Set<string>(['CASH', 'TERMINAL', 'TRANSFER']);
const notFound = () => err(failure('not-found', 'Ese pago no está en la cuenta de la mesa.'));

export function createReadPaymentReceipt(store: ReceiptStore) {
  return async (actor: Actor, data: unknown): Promise<Outcome<PaymentReceiptResponse>> => {
    const scope = parseBillScope(data, ['tenantId', 'branchId', 'sessionId', 'paymentId']);
    if (!scope.ok) return scope;
    const { paymentId } = data as Record<string, unknown>;
    if (!isUuid(paymentId)) return err(failure('invalid-argument', 'Revisa el pago.'));
    const id = canonicalUuid(paymentId);
    const loaded = await store.load(actor, scope.value, id);
    if (!loaded.ok) return loaded;
    const row = loaded.value;
    const payment = row.payment;
    // Un pago de otra mesa, sin confirmar o de la pasarela no tiene comprobante aquí.
    if (
      !payment ||
      canonicalUuid(payment.sessionId) !== scope.value.sessionId ||
      payment.status !== 'CONFIRMED' ||
      !payment.confirmedAt ||
      !RECORDED.has(payment.method)
    )
      return notFound();
    return ok({
      paymentId: id,
      tenantName: row.tenantName,
      taxId: row.taxId,
      branchName: row.branchName,
      tableCode: row.tableCode,
      paidAt: payment.confirmedAt,
      method: payment.method as RecordedPaymentMethod,
      receiptNumber: payment.receiptNumber,
      currency: payment.currency,
      lines: payment.lines,
      amountMinor: payment.amountMinor,
      tipMinor: payment.tipMinor,
      totalMinor: (BigInt(payment.amountMinor) + BigInt(payment.tipMinor)).toString(),
      receivedMinor: payment.receivedMinor,
      changeMinor: payment.changeMinor,
      refundedMinor: payment.refundsMinor.reduce((sum, r) => sum + BigInt(r), 0n).toString(),
    });
  };
}
