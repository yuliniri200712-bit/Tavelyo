import type { Result } from '@tavelyo/core';

/** Mesa tal como la ve quien gestiona el salón (incluye el identificador del QR). */
export interface DiningTableAdmin {
  readonly id: string;
  readonly code: string;
  readonly seats: number;
  readonly qrPublicId: string;
  readonly archived: boolean;
}

export interface SectorAdmin {
  readonly id: string;
  readonly name: string;
  readonly sort: number;
  readonly archived: boolean;
  readonly tables: readonly DiningTableAdmin[];
}

/** Sucursal en la que se trabaja: el servidor vuelve a comprobar empresa, sucursal y permiso. */
export interface BranchScope {
  readonly tenantId: string;
  readonly branchId: string;
}

export interface SectorInput {
  readonly name: string;
  readonly sort: number;
}

export interface TableInput {
  readonly sectorId: string;
  readonly code: string;
  readonly seats: number;
}

/**
 * Falla de una operación. `rejected` lleva el motivo que da el servidor (mensajes fijos y sin
 * datos de otras empresas); el resto son fallas de conexión o inesperadas.
 */
export type FloorError =
  | { readonly kind: 'rejected'; readonly message: string }
  | { readonly kind: 'unauthorized' | 'network' | 'unknown' };

export type FloorResult<T> = Promise<Result<T, FloorError>>;

/** Contrato que implementa la capa de datos (SQL Connect). */
export interface FloorAdminGateway {
  layout(scope: BranchScope): FloorResult<readonly SectorAdmin[]>;
  createSector(scope: BranchScope, input: SectorInput): FloorResult<void>;
  updateSector(
    scope: BranchScope,
    sectorId: string,
    input: SectorInput & { readonly archived: boolean },
  ): FloorResult<void>;
  createTable(scope: BranchScope, input: TableInput): FloorResult<void>;
  updateTable(
    scope: BranchScope,
    tableId: string,
    input: TableInput & { readonly archived: boolean },
  ): FloorResult<void>;
  rotateQr(scope: BranchScope, tableId: string): FloorResult<void>;
}
