import { err, ok } from '@tavelyo/core';
import type { BillScope, RecordPaymentRequest } from '@tavelyo/contracts';
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
const isAmount = (v: unknown): v is string =>
  typeof v === 'string' && /^(0|[1-9][0-9]{0,14})$/.test(v);

export function parseBillScope(data: unknown, payment = false): Outcome<BillScope> {
  const fields = readFields(data, payment ? PAYMENT_FIELDS : SCOPE_FIELDS);
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
  const scope = parseBillScope(data, true);
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
      !/^[A-Za-z0-9][A-Za-z0-9_-]{0,39}$/.test(f.receiptNumber)
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
