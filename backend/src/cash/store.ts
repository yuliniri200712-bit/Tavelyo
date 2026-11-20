import type { CashMovementKindCode, CashScope } from '@tavelyo/contracts';
import type { Actor, Outcome } from '../shared/outcome.ts';

export interface CashMovementRow {
  readonly id: string;
  readonly kind: CashMovementKindCode;
  readonly amountMinor: string;
  readonly reason: string | null;
  readonly idempotencyKey: string | null;
  readonly createdBy: string;
  readonly createdAt: string;
}

export interface CashSessionRow {
  readonly id: string;
  readonly registerId: string;
  readonly status: 'OPEN' | 'CLOSED';
  readonly version: number;
  readonly currency: string;
  readonly openingFloatMinor: string;
  readonly openedBy: string;
  readonly openedAt: string;
  readonly movements: readonly CashMovementRow[];
  readonly count: {
    readonly expectedMinor: string;
    readonly countedMinor: string;
    readonly differenceMinor: string;
    readonly reason: string | null;
  } | null;
}

/** Lo que el backend lee para operar una caja, con el rol de quien llama (D-40). */
export interface CashSnapshot {
  readonly roleCode: string;
  /** El turno pedido, o el turno abierto de quien llama si no se pidió ninguno. */
  readonly session: CashSessionRow | null;
}

export type CashPermission = 'cash_session.open' | 'cash_session.close';

export interface OpenWrite {
  readonly scope: CashScope;
  readonly cashSessionId: string;
  readonly registerId: string;
  readonly openingFloatMinor: string;
}

export interface MovementWrite {
  readonly scope: CashScope;
  readonly session: CashSessionRow;
  readonly movementId: string;
  readonly idempotencyKey: string;
  readonly kind: 'CASH_IN' | 'CASH_OUT';
  readonly amountMinor: string;
  readonly reason: string;
}

export interface CloseWrite {
  readonly scope: CashScope;
  readonly session: CashSessionRow;
  readonly expectedMinor: string;
  readonly countedMinor: string;
  readonly differenceMinor: string;
  readonly reason: string | null;
}

/** Resultado de abrir: hecho, la caja ya tiene turno, la persona ya tiene otra caja abierta. */
export type OpenOutcome =
  'opened' | 'register-busy' | 'operator-busy' | 'register-unavailable' | 'denied';

export interface CashStore {
  /** Lee el turno con sus movimientos; sin `cashSessionId`, el abierto de quien llama. */
  load(
    actor: Actor,
    scope: CashScope,
    cashSessionId: string | null,
    permission: CashPermission,
  ): Promise<Outcome<CashSnapshot>>;
  open(actor: Actor, write: OpenWrite): Promise<OpenOutcome>;
  /** false si el turno cambió o se cerró, o si la clave ya existía. */
  move(actor: Actor, write: MovementWrite): Promise<boolean>;
  /** false si el turno cambió o ya se cerró. */
  close(actor: Actor, write: CloseWrite): Promise<boolean>;
}
