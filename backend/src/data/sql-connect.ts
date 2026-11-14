import { randomUUID } from 'node:crypto';
import { err, ok } from '@tavelyo/core';
import type { DataConnect } from 'firebase-admin/data-connect';
import type {
  AuditLog,
  MembershipCommands,
  MembershipDirectory,
} from '../members/revoke-member.ts';
import type { TenantProvisioner } from '../provisioning/provision-tenant.ts';
import { failure, type Failure } from '../shared/outcome.ts';

// Adaptadores de SQL Connect con el Admin SDK (ADR-0008 §7):
// - Acciones de un usuario: operación del conector suplantándolo, con sus @auth/@check.
// - Tareas de sistema: GraphQL con credenciales de servidor, documentos fijos con variables y
//   comprobaciones propias en el caso de uso.

const DENIED = new Set([
  'data-connect/query-error',
  'data-connect/permission-denied',
  'data-connect/unauthenticated',
  'data-connect/not-found',
]);

/** Una regla del conector rechazó la operación; cualquier otro error es inesperado y se lanza. */
export function mapConnectorRejection(error: unknown, message: string): Failure {
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : '';
  if (typeof code === 'string' && DENIED.has(code)) return failure('permission-denied', message);
  throw error;
}

export function createMembershipCommands(dataConnect: DataConnect): MembershipCommands {
  return {
    async revokeAs(actor, input) {
      try {
        await dataConnect.executeMutation(
          'RevokeMember',
          { tenantId: input.tenantId, userId: input.userId, reason: input.reason ?? null },
          { impersonate: { authClaims: actor.claims } },
        );
        return ok(undefined);
      } catch (error) {
        return err(mapConnectorRejection(error, 'No puedes revocar a este miembro.'));
      }
    },
  };
}

const ACTIVE_MEMBERSHIPS = `query ActiveMemberships($userId: String!) {
  memberships(where: { userId: { eq: $userId }, status: { eq: ACTIVE } }, limit: 1) { tenantId }
}`;

export function createMembershipDirectory(dataConnect: DataConnect): MembershipDirectory {
  return {
    async hasActiveMembership(userId) {
      const { data } = await dataConnect.executeGraphqlRead<
        { memberships: Array<{ tenantId: string }> },
        { userId: string }
      >(ACTIVE_MEMBERSHIPS, { variables: { userId } });
      return data.memberships.length > 0;
    },
  };
}

const RECORD_AUDIT = `mutation RecordAudit($tenantId: UUID!, $actorId: String!, $operation: String!, $resourceType: String!, $resourceId: String!) {
  auditEvent_insert(data: { tenantId: $tenantId, actorId: $actorId, operation: $operation, resourceType: $resourceType, resourceId: $resourceId })
}`;

export function createAuditLog(dataConnect: DataConnect): AuditLog {
  return {
    async record(entry) {
      await dataConnect.executeGraphql(RECORD_AUDIT, { variables: { ...entry } });
    },
  };
}

const PROFILE_EXISTS = `query ProfileExists($id: String!) { userProfile(id: $id) { id } }`;

/** Pasos comunes del aprovisionamiento; el perfil solo se crea si no existe (no se pisa el nombre). */
function provisionDocument(createProfile: boolean): string {
  const profile = createProfile
    ? 'userProfile_insert(data: { id: $ownerId, displayName: $ownerName })'
    : '';
  return `mutation ProvisionTenant($tenantId: UUID!, $tenantRef: String!, $branchId: UUID!, $tenantName: String!, $branchName: String!, $currency: String!, $timezone: String!, $ownerId: String!, $ownerName: String!, $operatorId: String!) @transaction {
  tenant_insert(data: { id: $tenantId, name: $tenantName, status: ACTIVE, defaultCurrency: $currency, defaultTimezone: $timezone })
  branch_insert(data: { id: $branchId, tenantId: $tenantId, name: $branchName, currency: $currency, timezone: $timezone, status: ACTIVE })
  ${profile}
  membership_insert(data: { tenantId: $tenantId, userId: $ownerId, roleCode: "tenant_owner", status: ACTIVE, createdBy: $operatorId })
  auditEvent_insert(data: { tenantId: $tenantId, actorId: $operatorId, operation: "tenant.provision", resourceType: "tenant", resourceId: $tenantRef })
}`;
}

export function createTenantProvisioner(dataConnect: DataConnect): TenantProvisioner {
  return {
    async provision(request) {
      const { data } = await dataConnect.executeGraphqlRead<
        { userProfile: { id: string } | null },
        { id: string }
      >(PROFILE_EXISTS, { variables: { id: request.ownerId } });

      // Mismo formato que devuelve SQL Connect a las apps (sin guiones).
      const tenantId = randomUUID().replaceAll('-', '');
      const branchId = randomUUID().replaceAll('-', '');
      await dataConnect.executeGraphql(provisionDocument(data.userProfile === null), {
        variables: {
          tenantId,
          tenantRef: tenantId,
          branchId,
          tenantName: request.tenantName,
          branchName: request.branchName,
          currency: request.currency,
          timezone: request.timezone,
          ownerId: request.ownerId,
          ownerName: request.ownerDisplayName,
          operatorId: request.operatorId,
        },
      });
      return { tenantId, branchId };
    },
  };
}
