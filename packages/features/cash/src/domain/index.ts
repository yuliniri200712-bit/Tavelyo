import type { Result } from '@tavelyo/core';

/** Sucursal en la que se trabaja: el servidor vuelve a comprobar empresa, sucursal y permiso. */
export interface BranchScope {
  readonly tenantId: string;
  readonly branchId: string;
}

/** Falla de una operación. `rejected` lleva el motivo que escribe el servidor para la persona. */
export type CashError =
  | { readonly kind: 'rejected'; readonly message: string }
  | { readonly kind: 'unauthorized' | 'network' | 'unknown' };

export type CashResult<T> = Promise<Result<T, CashError>>;

/** Caja de la sucursal, con quién la tiene abierta (sin importes). */
export interface Register {
  readonly id: string;
  readonly name: string;
  readonly archived: boolean;
  readonly openSession: { readonly id: string; readonly openedAt: Date } | null;
}

export type CashMovementKind = 'CASH_IN' | 'CASH_OUT' | 'SALE' | 'REFUND';

export interface CashMovement {
  readonly id: string;
  readonly kind: CashMovementKind;
  readonly amountMinor: string;
  readonly reason: string | null;
  readonly createdAt: Date;
}

/** Turno abierto. Los totales los calcula el servidor (D-40). */
export interface Till {
  readonly id: string;
  readonly registerId: string;
  readonly openedAt: Date;
  /** Se envía al registrar una entrada o salida y al cerrar: si cambió, el servidor lo rechaza. */
  readonly revision: number;
  readonly openingFloatMinor: string;
  readonly cashInMinor: string;
  readonly cashOutMinor: string;
  readonly salesMinor: string;
  readonly refundsMinor: string;
  readonly expectedMinor: string;
  readonly movements: readonly CashMovement[];
}

export interface TillCount {
  readonly expectedMinor: string;
  readonly countedMinor: string;
  /** Contado menos esperado: negativo si falta efectivo. */
  readonly differenceMinor: string;
}

export interface ManualMovement {
  readonly kind: 'CASH_IN' | 'CASH_OUT';
  readonly amountMinor: string;
  readonly reason: string;
  /** La misma clave en un reintento: el servidor no duplica el movimiento. */
  readonly idempotencyKey: string;
}

/** Contrato que implementa la capa de datos (conector cajas.gql y funciones de caja del backend). */
export interface CashGateway {
  registers(scope: BranchScope): CashResult<readonly Register[]>;
  createRegister(scope: BranchScope, name: string): CashResult<void>;
  updateRegister(
    scope: BranchScope,
    register: { readonly id: string; readonly name: string; readonly archived: boolean },
  ): CashResult<void>;
  /** Turno abierto de quien llama en la sucursal, o null. */
  myTill(scope: BranchScope): CashResult<Till | null>;
  openTill(scope: BranchScope, registerId: string, openingFloatMinor: string): CashResult<Till>;
  move(
    scope: BranchScope,
    till: Pick<Till, 'id' | 'revision'>,
    movement: ManualMovement,
  ): CashResult<Till>;
  closeTill(
    scope: BranchScope,
    till: Pick<Till, 'id' | 'revision'>,
    countedMinor: string,
    reason: string | null,
  ): CashResult<TillCount>;
}
