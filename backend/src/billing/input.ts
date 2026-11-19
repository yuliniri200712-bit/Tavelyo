import { err, ok } from '@tavelyo/core';
import {
  BILL_SPLIT_PARTS,
  RECEIPT_NUMBER_MAX_LENGTH,
  REFUND_REASON,
  type BillScope,
  type ReadBillRequest,
  type RecordPaymentRequest,
  type RecordRefundRequest,
} from '@tavelyo/contracts';
import { canonicalUuid } from '../shared/clock.ts';
import { isUuid, readFields } from '../shared/input.ts';
import { failure, type Outcome } from '../shared/outcome.ts';

const SCOPE_FIELDS = ['tenantId', 'branchId', 'sessionId'];
const PAYMENT_FIELDS = [
  ...SCOPE_FIELDS,
  'revision',
  'idempotencyKey',
  'method',
  'currency',
  'amountMinor',
  'tipMinor',
  'participantId',
  'receivedMinor',
  'receiptNumber',
];
const invalid = () =>
  err(
    failure(
      'invalid-argument',
      'Revisa los datos del pago. Solo se admite el número de comprobante; nunca datos de tarjeta.',
    ),
  );
// Letras, números, guion o guion bajo; empieza por letra o número (D-36).
const RECEIPT_NUMBER = new RegExp(`^[A-Za-z0-9][A-Za-z0-9_-]{0,${RECEIPT_NUMBER_MAX_LENGTH - 1}}$`);
const isAmount = (v: unknown): v is string =>
  typeof v === 'string' && /^(0|[1-9][0-9]{0,14})$/.test(v);

export function parseBillScope(
  data: unknown,
  allowed: readonly string[] = SCOPE_FIELDS,
): Outcome<BillScope> {
  const fields = readFields(data, allowed);
  if (!fields.ok) return invalid();
  const { tenantId, branchId, sessionId } = fields.value;
  if (!isUuid(tenantId) || !isUuid(branchId) || !isUuid(sessionId)) return invalid();
  return ok({
    tenantId: canonicalUuid(tenantId),
    branchId: canonicalUuid(branchId),
    sessionId: canonicalUuid(sessionId),
  });
}

export function parseRecordPayment(data: unknown): Outcome<RecordPaymentRequest> {
  const scope = parseBillScope(data, PAYMENT_FIELDS);
  if (!scope.ok) return scope;
  const f = data as Record<string, unknown>;
  if (
    typeof f.revision !== 'string' ||
    !/^[a-f0-9]{64}$/.test(f.revision) ||
    typeof f.idempotencyKey !== 'string' ||
    !/^[A-Za-z0-9_-]{8,100}$/.test(f.idempotencyKey) ||
    !['CASH', 'TERMINAL', 'TRANSFER'].includes(String(f.method)) ||
    f.currency !== 'COP' ||
    !isAmount(f.amountMinor) ||
    BigInt(f.amountMinor) <= 0n ||
    !isAmount(f.tipMinor) ||
    (f.participantId !== undefined && !isUuid(f.participantId))
  )
    return invalid();
  if (f.method === 'CASH') {
    if (!isAmount(f.receivedMinor) || f.receiptNumber !== undefined) return invalid();
  } else {
    // Campo acotado para identificadores, sin notas libres, imágenes ni campos de tarjeta.
    if (
      f.receivedMinor !== undefined ||
      typeof f.receiptNumber !== 'string' ||
      !RECEIPT_NUMBER.test(f.receiptNumber)
    )
      return invalid();
  }
  return ok({
    ...scope.value,
    revision: f.revision,
    idempotencyKey: f.idempotencyKey,
    method: f.method as RecordPaymentRequest['method'],
    currency: f.currency,
    amountMinor: f.amountMinor,
    tipMinor: f.tipMinor,
    ...(f.participantId === undefined
      ? {}
      : { participantId: canonicalUuid(f.participantId as string) }),
    ...(f.method === 'CASH'
      ? { receivedMinor: f.receivedMinor as string }
      : { receiptNumber: f.receiptNumber as string }),
  });
}

/** Lectura de la cuenta con división opcional en partes iguales (D-06). */
export function parseReadBill(data: unknown): Outcome<ReadBillRequest> {
  const scope = parseBillScope(data, [...SCOPE_FIELDS, 'parts']);
  if (!scope.ok) return scope;
  const { parts } = data as Record<string, unknown>;
  if (parts === undefined) return scope;
  if (
    typeof parts !== 'number' ||
    !Number.isInteger(parts) ||
    parts < BILL_SPLIT_PARTS.min ||
    parts > BILL_SPLIT_PARTS.max
  )
    return err(
      failure(
        'invalid-argument',
        `Divide la cuenta entre ${BILL_SPLIT_PARTS.min} y ${BILL_SPLIT_PARTS.max} partes.`,
      ),
    );
  return ok({ ...scope.value, parts });
}

const REFUND_FIELDS = [
  ...SCOPE_FIELDS,
  'revision',
  'idempotencyKey',
  'reason',
  'orderItemId',
  'paymentId',
  'amountMinor',
];

/**
 * Reembolso (D-34, D-37): por plato solo con `orderItemId`; general con `paymentId` y `amountMinor`.
 * Siempre con motivo. Nunca campos de tarjeta.
 */
export function parseRefund(data: unknown): Outcome<RecordRefundRequest> {
  const scope = parseBillScope(data, REFUND_FIELDS);
  if (!scope.ok) return scope;
  const f = data as Record<string, unknown>;
  const reason = typeof f.reason === 'string' ? f.reason.trim() : '';
  if (reason.length < REFUND_REASON.min || reason.length > REFUND_REASON.max)
    return err(
      failure(
        'invalid-argument',
        `Escribe el motivo del reembolso (entre ${REFUND_REASON.min} y ${REFUND_REASON.max} caracteres).`,
      ),
    );
  if (
    typeof f.revision !== 'string' ||
    !/^[a-f0-9]{64}$/.test(f.revision) ||
    typeof f.idempotencyKey !== 'string' ||
    !/^[A-Za-z0-9_-]{8,100}$/.test(f.idempotencyKey)
  )
    return invalid();
  const base = {
    ...scope.value,
    revision: f.revision,
    idempotencyKey: f.idempotencyKey,
    reason,
  };
  if (f.orderItemId !== undefined) {
    if (!isUuid(f.orderItemId) || f.paymentId !== undefined || f.amountMinor !== undefined)
      return invalid();
    return ok({ ...base, orderItemId: canonicalUuid(f.orderItemId) });
  }
  if (!isUuid(f.paymentId) || !isAmount(f.amountMinor) || BigInt(f.amountMinor) <= 0n)
    return invalid();
  return ok({ ...base, paymentId: canonicalUuid(f.paymentId), amountMinor: f.amountMinor });
}
