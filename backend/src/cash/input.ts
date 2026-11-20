import { err, ok } from '@tavelyo/core';
import {
  CASH_REASON,
  type CashScope,
  type CloseCashSessionRequest,
  type OpenCashSessionRequest,
  type ReadCashSessionRequest,
  type RecordCashMovementRequest,
} from '@tavelyo/contracts';
import { canonicalUuid } from '../shared/clock.ts';
import { isUuid, readFields } from '../shared/input.ts';
import { failure, type Outcome } from '../shared/outcome.ts';

// Entrada de las funciones de caja: el backend nunca confía en el cliente (CLAUDE.md §7).

const SCOPE = ['tenantId', 'branchId'];
const invalid = (message = 'Revisa los datos de la caja.') =>
  err(failure('invalid-argument', message));
/** Pesos en unidades menores: entero no negativo como texto, sin decimales ni signos. */
const isAmount = (v: unknown): v is string =>
  typeof v === 'string' && /^(0|[1-9][0-9]{0,14})$/.test(v);
const isRevision = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 1;

function scope(data: unknown, allowed: readonly string[]): Outcome<CashScope> {
  const fields = readFields(data, [...SCOPE, ...allowed]);
  if (!fields.ok) return invalid();
  const { tenantId, branchId } = fields.value;
  if (!isUuid(tenantId) || !isUuid(branchId)) return invalid();
  return ok({ tenantId: canonicalUuid(tenantId), branchId: canonicalUuid(branchId) });
}

/** Motivo recortado entre los límites, o null si no se pudo leer. */
export function readReason(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const reason = value.trim();
  return reason.length >= CASH_REASON.min && reason.length <= CASH_REASON.max ? reason : null;
}

export function parseOpen(data: unknown): Outcome<OpenCashSessionRequest> {
  const base = scope(data, ['registerId', 'openingFloatMinor']);
  if (!base.ok) return base;
  const f = data as Record<string, unknown>;
  if (!isUuid(f.registerId) || !isAmount(f.openingFloatMinor)) return invalid();
  return ok({
    ...base.value,
    registerId: canonicalUuid(f.registerId),
    openingFloatMinor: f.openingFloatMinor,
  });
}

export function parseRead(data: unknown): Outcome<ReadCashSessionRequest> {
  const base = scope(data, ['cashSessionId']);
  if (!base.ok) return base;
  const { cashSessionId } = data as Record<string, unknown>;
  if (cashSessionId === undefined) return base;
  if (!isUuid(cashSessionId)) return invalid();
  return ok({ ...base.value, cashSessionId: canonicalUuid(cashSessionId) });
}

export function parseMovement(data: unknown): Outcome<RecordCashMovementRequest> {
  const base = scope(data, [
    'cashSessionId',
    'revision',
    'idempotencyKey',
    'kind',
    'amountMinor',
    'reason',
  ]);
  if (!base.ok) return base;
  const f = data as Record<string, unknown>;
  const reason = readReason(f.reason);
  if (!reason)
    return invalid(
      `Escribe el motivo del movimiento (entre ${CASH_REASON.min} y ${CASH_REASON.max} caracteres).`,
    );
  if (
    !isUuid(f.cashSessionId) ||
    !isRevision(f.revision) ||
    typeof f.idempotencyKey !== 'string' ||
    !/^[A-Za-z0-9_-]{8,100}$/.test(f.idempotencyKey) ||
    (f.kind !== 'CASH_IN' && f.kind !== 'CASH_OUT') ||
    !isAmount(f.amountMinor) ||
    BigInt(f.amountMinor) <= 0n
  )
    return invalid();
  return ok({
    ...base.value,
    cashSessionId: canonicalUuid(f.cashSessionId),
    revision: f.revision,
    idempotencyKey: f.idempotencyKey,
    kind: f.kind,
    amountMinor: f.amountMinor,
    reason,
  });
}

export function parseClose(data: unknown): Outcome<CloseCashSessionRequest> {
  const base = scope(data, ['cashSessionId', 'revision', 'countedMinor', 'reason']);
  if (!base.ok) return base;
  const f = data as Record<string, unknown>;
  if (!isUuid(f.cashSessionId) || !isRevision(f.revision) || !isAmount(f.countedMinor))
    return invalid();
  if (f.reason !== undefined && typeof f.reason !== 'string') return invalid();
  return ok({
    ...base.value,
    cashSessionId: canonicalUuid(f.cashSessionId),
    revision: f.revision,
    countedMinor: f.countedMinor,
    ...(typeof f.reason === 'string' ? { reason: f.reason } : {}),
  });
}
