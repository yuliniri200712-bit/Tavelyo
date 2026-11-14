import type { BranchOption, TenancyErrorCode, TenantMembership } from '../domain/index.ts';

/** Estado de la selección de empresa y sucursal. Solo `ready` permite operar. */
export type SelectionState =
  | { readonly status: 'loading-tenants' }
  | { readonly status: 'error'; readonly error: TenancyErrorCode }
  | { readonly status: 'no-memberships' }
  | { readonly status: 'choose-tenant'; readonly memberships: readonly TenantMembership[] }
  | {
      readonly status: 'loading-branches';
      readonly memberships: readonly TenantMembership[];
      readonly tenant: TenantMembership;
    }
  | {
      readonly status: 'no-branches';
      readonly memberships: readonly TenantMembership[];
      readonly tenant: TenantMembership;
    }
  | {
      readonly status: 'choose-branch';
      readonly memberships: readonly TenantMembership[];
      readonly tenant: TenantMembership;
      readonly branches: readonly BranchOption[];
    }
  | {
      readonly status: 'ready';
      readonly memberships: readonly TenantMembership[];
      readonly tenant: TenantMembership;
      readonly branches: readonly BranchOption[];
      readonly branch: BranchOption;
    };

export type SelectionEvent =
  | { readonly type: 'memberships-loaded'; readonly memberships: readonly TenantMembership[] }
  | { readonly type: 'tenant-chosen'; readonly tenantId: string }
  | { readonly type: 'branches-loaded'; readonly branches: readonly BranchOption[] }
  | { readonly type: 'branch-chosen'; readonly branchId: string }
  | { readonly type: 'change-context' }
  | { readonly type: 'failed'; readonly error: TenancyErrorCode }
  | { readonly type: 'reload' };

export const initialSelection: SelectionState = { status: 'loading-tenants' };

/**
 * Transiciones puras. Cambiar de contexto descarta empresa, sucursal y listas anteriores;
 * los eventos que no corresponden al estado actual se ignoran (p. ej. una respuesta tardía).
 */
export function selectionReducer(state: SelectionState, event: SelectionEvent): SelectionState {
  switch (event.type) {
    case 'reload':
      return initialSelection;
    case 'failed':
      return { status: 'error', error: event.error };
    case 'memberships-loaded': {
      if (state.status !== 'loading-tenants') return state;
      const { memberships } = event;
      const [only] = memberships;
      if (memberships.length === 0) return { status: 'no-memberships' };
      if (memberships.length === 1 && only) {
        return { status: 'loading-branches', memberships, tenant: only };
      }
      return { status: 'choose-tenant', memberships };
    }
    case 'tenant-chosen': {
      if (state.status !== 'choose-tenant') return state;
      const tenant = state.memberships.find((m) => m.tenantId === event.tenantId);
      return tenant
        ? { status: 'loading-branches', memberships: state.memberships, tenant }
        : state;
    }
    case 'branches-loaded': {
      if (state.status !== 'loading-branches') return state;
      const { branches } = event;
      const [only] = branches;
      const base = { memberships: state.memberships, tenant: state.tenant };
      if (branches.length === 0) return { status: 'no-branches', ...base };
      if (branches.length === 1 && only)
        return { status: 'ready', ...base, branches, branch: only };
      return { status: 'choose-branch', ...base, branches };
    }
    case 'branch-chosen': {
      if (state.status !== 'choose-branch') return state;
      const branch = state.branches.find((b) => b.id === event.branchId);
      if (!branch) return state;
      const { memberships, tenant, branches } = state;
      return { status: 'ready', memberships, tenant, branches, branch };
    }
    case 'change-context': {
      if (
        state.status !== 'ready' &&
        state.status !== 'choose-branch' &&
        state.status !== 'no-branches'
      ) {
        return state;
      }
      if (state.memberships.length > 1)
        return { status: 'choose-tenant', memberships: state.memberships };
      if (state.status === 'ready' && state.branches.length > 1) {
        return {
          status: 'choose-branch',
          memberships: state.memberships,
          tenant: state.tenant,
          branches: state.branches,
        };
      }
      return state;
    }
  }
}

/** Clave del contexto activo: al cambiar, la app desmonta todo lo que dependía del anterior. */
export function contextKey(state: SelectionState): string | null {
  return state.status === 'ready' ? `${state.tenant.tenantId}:${state.branch.id}` : null;
}

/** ¿Puede cambiar de contexto? Solo si hay otra empresa u otra sucursal a la que ir. */
export function canChangeContext(state: SelectionState): boolean {
  return state.status === 'ready' && (state.memberships.length > 1 || state.branches.length > 1);
}
