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

/** Contrato que implementa la capa de datos (SQL Connect). */
export interface TenancyGateway {
  myMemberships(): Promise<Result<readonly TenantMembership[], TenancyErrorCode>>;
  myBranches(tenantId: string): Promise<Result<readonly BranchOption[], TenancyErrorCode>>;
}
