import type { Result } from '@tavelyo/core';

/** Empresa a la que pertenece la persona, con su rol. Los permisos solo orientan la interfaz. */
export interface TenantMembership {
  readonly tenantId: string;
  readonly tenantName: string;
  readonly roleCode: string;
  readonly roleName: string;
  readonly permissions: readonly string[];
}

export interface BranchOption {
  readonly id: string;
  readonly name: string;
  readonly currency: string;
  readonly timezone: string;
}

export type TenancyErrorCode = 'unauthorized' | 'network' | 'unknown';

/** Sucursal para gestionarla (propietario, tenant.settings): incluye las archivadas. */
export interface BranchAdmin {
  readonly id: string;
  readonly name: string;
  readonly currency: string;
  readonly timezone: string;
  readonly archived: boolean;
}

export interface BranchInput {
  readonly name: string;
  readonly timezone: string;
}

/** Falla de una operación de administración (mismo contrato que los demás módulos). */
export type BranchAdminError =
  | { readonly kind: 'rejected'; readonly message: string }
  | { readonly kind: 'unauthorized' | 'network' | 'unknown' };

export type BranchAdminResult<T> = Promise<Result<T, BranchAdminError>>;

/** Contrato que implementa la capa de datos (conector sucursales.gql). */
export interface BranchAdminGateway {
  branches(tenantId: string): BranchAdminResult<readonly BranchAdmin[]>;
  /** La moneda es la de la empresa y no cambia después. */
  createBranch(tenantId: string, currency: string, input: BranchInput): BranchAdminResult<void>;
  updateBranch(
    tenantId: string,
    branchId: string,
    input: BranchInput & { readonly archived: boolean },
  ): BranchAdminResult<void>;
}

/** Contrato que implementa la capa de datos (SQL Connect). */
export interface TenancyGateway {
  myMemberships(): Promise<Result<readonly TenantMembership[], TenancyErrorCode>>;
  myBranches(tenantId: string): Promise<Result<readonly BranchOption[], TenancyErrorCode>>;
}
