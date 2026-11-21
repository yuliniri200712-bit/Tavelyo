import { err, formatMoney, Money, ok, parseMajorAmount, type Result } from '@tavelyo/core';
import { RECEIPT_NUMBER_MAX_LENGTH, REFUND_REASON } from '@tavelyo/contracts';
import type { PaymentInput, PaymentMethod } from '../domain/index.ts';

// Lógica de la caja (bloque 6a): lee los formularios y arma los textos. Los importes, el saldo, la
// división y el cambio los calcula el servidor; aquí solo se muestran o se adelantan para ayudar.

export const METHOD_TEXT: Readonly<Record<PaymentMethod, string>> = {
  CASH: 'Efectivo',
  TERMINAL: 'Datáfono',
  TRANSFER: 'Transferencia',
};

export const money = (minor: string) => formatMoney(Money.ofMinor(BigInt(minor), 'COP'));

/** Pesos enteros escritos por la persona a unidades menores. */
export function readPesos(text: string, allowZero = false): Result<string, string> {
  const parsed = parseMajorAmount(text, 'COP');
  if (!parsed.ok)
    return err(
      parsed.error.kind === 'empty'
        ? 'Escribe el importe en pesos.'
        : 'Escribe el importe en pesos enteros, por ejemplo 32.000.',
    );
  if (!allowZero && parsed.value.amountMinor === 0n)
    return err('El importe debe ser mayor que cero.');
  return ok(parsed.value.amountMinor.toString());
}

/** Pesos de un importe en unidades menores, para precargar un campo («32000»). */
export const pesosText = (minor: string) => (BigInt(minor) / 100n).toString();

const RECEIPT_NUMBER = new RegExp(`^[A-Za-z0-9][A-Za-z0-9_-]{0,${RECEIPT_NUMBER_MAX_LENGTH - 1}}$`);

/** Número de comprobante del datáfono o la transferencia (D-36): nunca datos de tarjeta. */
export function readReceiptNumber(text: string): Result<string, string> {
  const value = text.trim();
  return RECEIPT_NUMBER.test(value)
    ? ok(value)
    : err(
        `Escribe el número de comprobante: letras, números o guion, hasta ${RECEIPT_NUMBER_MAX_LENGTH} caracteres. Nunca el número de la tarjeta.`,
      );
}

export function readRefundReason(text: string): string | null {
  const reason = text.trim();
  return reason.length >= REFUND_REASON.min && reason.length <= REFUND_REASON.max ? reason : null;
}

export interface PaymentDraft {
  readonly method: PaymentMethod;
  readonly amount: string;
  readonly tip: string;
  readonly received: string;
  readonly receiptNumber: string;
}

export type DraftErrors = Partial<Record<'amount' | 'tip' | 'received' | 'receiptNumber', string>>;

/** Lo que cobra la persona, listo para el servidor, o los errores de cada campo. */
export function readPaymentDraft(
  draft: PaymentDraft,
  base: {
    readonly revision: string;
    readonly idempotencyKey: string;
    readonly participantId?: string;
  },
): Result<PaymentInput, DraftErrors> {
  const errors: DraftErrors = {};
  const amount = readPesos(draft.amount);
  if (!amount.ok) errors.amount = amount.error;
  const tip = draft.tip.trim() === '' ? ok('0') : readPesos(draft.tip, true);
  if (!tip.ok) errors.tip = tip.error;
  if (amount.ok && tip.ok && BigInt(tip.value) > BigInt(amount.value))
    errors.tip = 'La propina no puede superar el consumo que se cobra.';
  let extra: { receivedMinor: string } | { receiptNumber: string } | null = null;
  if (draft.method === 'CASH') {
    const received = readPesos(draft.received);
    if (!received.ok) errors.received = received.error;
    else if (
      amount.ok &&
      tip.ok &&
      BigInt(received.value) < BigInt(amount.value) + BigInt(tip.value)
    )
      errors.received = 'Lo recibido no cubre el consumo y la propina.';
    else extra = { receivedMinor: received.value };
  } else {
    const number = readReceiptNumber(draft.receiptNumber);
    if (!number.ok) errors.receiptNumber = number.error;
    else extra = { receiptNumber: number.value };
  }
  if (!amount.ok || !tip.ok || !extra || Object.keys(errors).length > 0) return err(errors);
  return ok({
    revision: base.revision,
    idempotencyKey: base.idempotencyKey,
    method: draft.method,
    amountMinor: amount.value,
    tipMinor: tip.value,
    ...extra,
    ...(base.participantId ? { participantId: base.participantId } : {}),
  });
}

/** Cambio a devolver, solo para mostrarlo mientras se escribe (el servidor lo calcula al cobrar). */
export function changePreview(draft: PaymentDraft): string | null {
  if (draft.method !== 'CASH') return null;
  const amount = readPesos(draft.amount);
  const tip = draft.tip.trim() === '' ? ok('0') : readPesos(draft.tip, true);
  const received = readPesos(draft.received);
  if (!amount.ok || !tip.ok || !received.ok) return null;
  const change = BigInt(received.value) - BigInt(amount.value) - BigInt(tip.value);
  return change < 0n ? null : change.toString();
}

/** «Persona 1», «Persona 2»…: los comensales no dan su nombre (D-10). */
export function participantLabels(ids: readonly string[]): ReadonlyMap<string, string> {
  return new Map(ids.map((id, i) => [id, `Persona ${i + 1}`]));
}

export function describeTable(table: { tableCode: string; billRequestedAt: Date | null }): string {
  return table.billRequestedAt
    ? `Mesa ${table.tableCode}: pidió la cuenta`
    : `Mesa ${table.tableCode}`;
}
