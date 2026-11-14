import { QueryFetchPolicy, type DataConnect } from 'firebase/data-connect';
import { myBranches, myMemberships, upsertMyProfile } from '@tavelyo/dataconnect-sdk';
import { err, ok } from '@tavelyo/core';
import type { ProfileGateway } from '@tavelyo/identity/domain';
import type { TenancyErrorCode, TenancyGateway } from '@tavelyo/tenancy/domain';

// Siempre al servidor: la PWA no conserva respuestas de datos (ADR-0008 §8, ADR-0009).
const SERVER_ONLY = { fetchPolicy: QueryFetchPolicy.SERVER_ONLY } as const;

export function mapDataError(error: unknown): TenancyErrorCode {
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  if (/unauthorized|unauthenticated|permission/i.test(`${code} ${text}`)) return 'unauthorized';
  if (/fetch|network|failed to fetch|ECONNREFUSED/i.test(text)) return 'network';
  return 'unknown';
}

export function createTenancyGateway(dataConnect: DataConnect): TenancyGateway {
  return {
    async myMemberships() {
      try {
        const { data } = await myMemberships(dataConnect, SERVER_ONLY);
        return ok(
          data.memberships.map((membership) => ({
            tenantId: membership.tenant.id,
            tenantName: membership.tenant.name,
            roleCode: membership.role.code,
            roleName: membership.role.name,
            permissions: membership.role.rolePermissions_on_role.map((rp) => rp.permission.code),
          })),
        );
      } catch (error) {
        return err(mapDataError(error));
      }
    },
    async myBranches(tenantId) {
      try {
        const { data } = await myBranches(dataConnect, { tenantId }, SERVER_ONLY);
        return ok(
          data.branches.map((branch) => ({
            id: branch.id,
            name: branch.name,
            currency: branch.currency,
            timezone: branch.timezone,
          })),
        );
      } catch (error) {
        return err(mapDataError(error));
      }
    },
  };
}

export function createProfileGateway(dataConnect: DataConnect): ProfileGateway {
  return {
    async ensureProfile(displayName) {
      try {
        await upsertMyProfile(dataConnect, { displayName });
        return ok(undefined);
      } catch (error) {
        const code = mapDataError(error);
        return err(code === 'network' ? 'network' : 'unknown');
      }
    },
  };
}
