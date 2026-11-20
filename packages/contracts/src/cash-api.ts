/**
 * Caja de la sucursal (Fase 4, bloque 5, RF-PA-07, D-40): turno con fondo inicial, entradas y
 * salidas con motivo, efectivo esperado y conteo de cierre. Importes en unidades menores (COP).
 */

export interface CashScope {
  readonly tenantId: string;
  readonly branchId: string;
}

/** Motivo de una entrada o salida manual, o de una diferencia al cerrar: entre 5 y 200 caracteres. */
export const CASH_REASON = { min: 5, max: 200 } as const;

export interface OpenCashSessionRequest extends CashScope {
  readonly registerId: string;
  readonly openingFloatMinor: string;
}

export type CashMovementKindCode = 'CASH_IN' | 'CASH_OUT' | 'SALE' | 'REFUND';

export interface CashMovementResponse {
  readonly id: string;
  readonly kind: CashMovementKindCode;
  readonly amountMinor: string;
  readonly reason: string | null;
  readonly createdBy: string;
  readonly createdAt: string;
}

export interface CashSessionResponse {
  readonly cashSessionId: string;
  readonly registerId: string;
  readonly status: 'OPEN' | 'CLOSED';
  readonly openedBy: string;
  readonly openedAt: string;
  /** Cambia con cada movimiento: se envía al registrar una salida o al cerrar. */
  readonly revision: number;
  readonly openingFloatMinor: string;
  readonly cashInMinor: string;
  readonly cashOutMinor: string;
  readonly salesMinor: string;
  readonly refundsMinor: string;
  /** Fondo inicial más entradas y ventas, menos salidas y reembolsos en efectivo. */
  readonly expectedMinor: string;
  readonly movements: readonly CashMovementResponse[];
  /** Conteo de cierre, si el turno ya se cerró. */
  readonly count: {
    readonly expectedMinor: string;
    readonly countedMinor: string;
    readonly differenceMinor: string;
    readonly reason: string | null;
  } | null;
}

/** Sin `cashSessionId`: el turno abierto de quien llama en la sucursal, o null si no tiene. */
export interface ReadCashSessionRequest extends CashScope {
  readonly cashSessionId?: string;
}

export interface ReadCashSessionResponse {
  readonly session: CashSessionResponse | null;
}

/** Entrada o salida manual de efectivo, siempre con motivo. */
export interface RecordCashMovementRequest extends CashScope {
  readonly cashSessionId: string;
  readonly revision: number;
  readonly idempotencyKey: string;
  readonly kind: 'CASH_IN' | 'CASH_OUT';
  readonly amountMinor: string;
  readonly reason: string;
}

export interface CloseCashSessionRequest extends CashScope {
  readonly cashSessionId: string;
  readonly revision: number;
  readonly countedMinor: string;
  /** Obligatorio si lo contado no coincide con lo esperado. */
  readonly reason?: string;
}

export interface CloseCashSessionResponse {
  readonly cashSessionId: string;
  readonly expectedMinor: string;
  readonly countedMinor: string;
  /** Contado menos esperado: positivo si sobra, negativo si falta. */
  readonly differenceMinor: string;
}
