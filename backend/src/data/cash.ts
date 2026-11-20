import type { DataConnect } from 'firebase-admin/data-connect';
import { err, ok } from '@tavelyo/core';
import type { CashSessionRow, CashStore } from '../cash/store.ts';
import { failure } from '../shared/outcome.ts';
import { isUniqueViolation } from './table-sessions.ts';

// Caja (Fase 4, bloque 5, D-40). Documentos exclusivos del Admin SDK: las variables proceden de los
// casos de uso, nunca de GraphQL del cliente. Cada escritura vuelve a comprobar el permiso.

const ACCESS_VARIABLES =
  '$tenantId: UUID!, $branchId: UUID!, $actorId: String!, $permission: String!';

const ACCESS = `
  membership(key: { tenantId: $tenantId, userId: $actorId }) @check(expr: "this != null", message: "CAJA_SIN_ACCESO") {
    status @check(expr: "this == 'ACTIVE'", message: "CAJA_SIN_ACCESO")
    tenant { status @check(expr: "this == 'ACTIVE'", message: "CAJA_SIN_ACCESO") }
    role {
      code
      rolePermissions_on_role(where: { permission: { code: { eq: $permission } } })
        @check(expr: "this.size() > 0", message: "CAJA_SIN_ACCESO") { permission { code } }
    }
    membershipBranches_on_membership(where: { branchId: { eq: $branchId } }) { branchId }
  }
  branch(id: $branchId) @check(expr: "this != null", message: "CAJA_SIN_ACCESO") {
    tenantId @check(expr: "this == vars.tenantId", message: "CAJA_SIN_ACCESO")
    status @check(expr: "this == 'ACTIVE'", message: "CAJA_SIN_ACCESO")
  }
`;
/** Sucursal asignada o propietario: la regla de ADR-0008, dentro de la transacción. */
const BRANCH_GUARD = `
  access: query @redact {
    branch(id: $branchId)
      @check(expr: "response.query.membership.role.code == 'tenant_owner' || response.query.membership.membershipBranches_on_membership.size() > 0", message: "CAJA_SIN_ACCESO") { id }
  }
`;

const SESSION_FIELDS =
  'id registerId status version currency openingFloatMinor openedBy openedAt tenantId branchId';

const FIND_OWN = `query FindOwnCashSession(${ACCESS_VARIABLES}) {
  ${ACCESS}
  cashSessions(where: { tenantId: { eq: $tenantId }, branchId: { eq: $branchId }, openedBy: { eq: $actorId }, status: { eq: OPEN } }, limit: 1) { id }
}`;

const READ_SESSION = `query ReadCashSession(${ACCESS_VARIABLES}, $cashSessionId: UUID!) {
  ${ACCESS}
  cashSession(id: $cashSessionId) { ${SESSION_FIELDS} }
  cashMovements(where: { cashSessionId: { eq: $cashSessionId } }, orderBy: [{ createdAt: ASC }, { id: ASC }], limit: 1000) {
    id kind amountMinor reason idempotencyKey createdBy createdAt
  }
  cashCounts(where: { cashSessionId: { eq: $cashSessionId } }, limit: 1) {
    expectedMinor countedMinor differenceMinor reason
  }
}`;

const OPEN = `mutation OpenCashSession(${ACCESS_VARIABLES}, $cashSessionId: UUID!, $registerId: UUID!,
  $operatorKey: String!, $openingFloatMinor: Int64!, $sessionRef: String!) @transaction {
  query @redact {
    ${ACCESS}
    register(id: $registerId) @check(expr: "this != null", message: "CAJA_NO_DISPONIBLE") {
      tenantId @check(expr: "this == vars.tenantId", message: "CAJA_NO_DISPONIBLE")
      branchId @check(expr: "this == vars.branchId", message: "CAJA_NO_DISPONIBLE")
      archivedAt @check(expr: "this == null", message: "CAJA_NO_DISPONIBLE")
    }
  }
  ${BRANCH_GUARD}
  cashSession_insert(data: { id: $cashSessionId, tenantId: $tenantId, branchId: $branchId, registerId: $registerId,
    openRegisterId: $registerId, openOperatorKey: $operatorKey, status: OPEN, currency: "COP",
    openingFloatMinor: $openingFloatMinor, openedBy: $actorId })
  auditEvent_insert(data: { tenantId: $tenantId, actorId: $actorId, operation: "cash_session.open", resourceType: "cash_session", resourceId: $sessionRef })
}`;

const MOVE = `mutation RecordCashMovement(${ACCESS_VARIABLES}, $cashSessionId: UUID!, $version: Int!,
  $movementId: UUID!, $key: String!, $kind: CashMovementKind!, $amountMinor: Int64!, $reason: String!, $movementRef: String!) @transaction {
  query @redact { ${ACCESS} }
  ${BRANCH_GUARD}
  cashSession_updateMany(where: { id: { eq: $cashSessionId }, tenantId: { eq: $tenantId }, branchId: { eq: $branchId }, version: { eq: $version }, status: { eq: OPEN } },
    data: { version_update: { inc: 1 } })
  locked: query @redact { cashSession(id: $cashSessionId) @check(expr: "response.cashSession_updateMany == 1", message: "CAJA_CAMBIO") { id } }
  cashMovement_insert(data: { id: $movementId, tenantId: $tenantId, branchId: $branchId, cashSessionId: $cashSessionId,
    kind: $kind, amountMinor: $amountMinor, reason: $reason, idempotencyKey: $key, createdBy: $actorId })
  auditEvent_insert(data: { tenantId: $tenantId, actorId: $actorId, operation: "cash_session.move", resourceType: "cash_movement", resourceId: $movementRef, reason: $reason })
}`;

const CLOSE = `mutation CloseCashSession(${ACCESS_VARIABLES}, $cashSessionId: UUID!, $version: Int!,
  $expectedMinor: Int64!, $countedMinor: Int64!, $differenceMinor: Int64!, $reason: String, $sessionRef: String!) @transaction {
  query @redact { ${ACCESS} }
  ${BRANCH_GUARD}
  cashSession_updateMany(where: { id: { eq: $cashSessionId }, tenantId: { eq: $tenantId }, branchId: { eq: $branchId }, version: { eq: $version }, status: { eq: OPEN } },
    data: { status: CLOSED, version_update: { inc: 1 }, openRegisterId: null, openOperatorKey: null, closedBy: $actorId, closedAt_expr: "request.time" })
  locked: query @redact { cashSession(id: $cashSessionId) @check(expr: "response.cashSession_updateMany == 1", message: "CAJA_CAMBIO") { id } }
  cashCount_insert(data: { tenantId: $tenantId, branchId: $branchId, cashSessionId: $cashSessionId, expectedMinor: $expectedMinor,
    countedMinor: $countedMinor, differenceMinor: $differenceMinor, reason: $reason, countedBy: $actorId })
  auditEvent_insert(data: { tenantId: $tenantId, actorId: $actorId, operation: "cash_session.close", resourceType: "cash_session", resourceId: $sessionRef, reason: $reason })
}`;

interface AccessData {
  membership: { role: { code: string }; membershipBranches_on_membership: { branchId: string }[] };
}
interface SessionData extends AccessData {
  cashSession:
    (Omit<CashSessionRow, 'movements' | 'count'> & { tenantId: string; branchId: string }) | null;
  cashMovements: CashSessionRow['movements'][number][];
  cashCounts: NonNullable<CashSessionRow['count']>[];
}

const denied = () => err(failure('permission-denied', 'No tienes acceso a esta caja.'));
const isMessage = (error: unknown, pattern: RegExp) =>
  error instanceof Error && pattern.test(error.message);
const isLostRace = (error: unknown) =>
  isMessage(error, /CAJA_CAMBIO|could not serialize|deadlock detected/i);

export function createCashStore(dc: DataConnect): CashStore {
  return {
    async load(actor, scope, cashSessionId, permission) {
      const variables = { ...scope, actorId: actor.uid, permission };
      try {
        let id = cashSessionId;
        if (!id) {
          const { data } = await dc.executeGraphqlRead<
            AccessData & { cashSessions: { id: string }[] },
            Record<string, unknown>
          >(FIND_OWN, { variables });
          if (
            data.membership.role.code !== 'tenant_owner' &&
            data.membership.membershipBranches_on_membership.length === 0
          )
            return denied();
          id = data.cashSessions[0]?.id ?? null;
          if (!id) return ok({ roleCode: data.membership.role.code, session: null });
        }
        const { data } = await dc.executeGraphqlRead<SessionData, Record<string, unknown>>(
          READ_SESSION,
          { variables: { ...variables, cashSessionId: id } },
        );
        if (
          data.membership.role.code !== 'tenant_owner' &&
          data.membership.membershipBranches_on_membership.length === 0
        )
          return denied();
        const row = data.cashSession;
        // Un turno de otra empresa o sucursal no existe para quien llama.
        if (!row || row.tenantId !== scope.tenantId || row.branchId !== scope.branchId)
          return err(failure('not-found', 'La caja no existe en la sucursal.'));
        if (data.cashMovements.length >= 1000)
          return err(failure('resource-exhausted', 'El turno excede el tamaño admitido.'));
        const { tenantId: _t, branchId: _b, ...session } = row;
        void _t;
        void _b;
        return ok({
          roleCode: data.membership.role.code,
          session: { ...session, movements: data.cashMovements, count: data.cashCounts[0] ?? null },
        });
      } catch (error) {
        if (isMessage(error, /CAJA_SIN_ACCESO/)) return denied();
        throw error;
      }
    },
    async open(actor, write) {
      try {
        await dc.executeGraphql(OPEN, {
          variables: {
            ...write.scope,
            actorId: actor.uid,
            permission: 'cash_session.open',
            cashSessionId: write.cashSessionId,
            registerId: write.registerId,
            operatorKey: `${write.scope.tenantId}:${actor.uid}`,
            openingFloatMinor: write.openingFloatMinor,
            sessionRef: write.cashSessionId,
          },
        });
        return 'opened';
      } catch (error) {
        if (isMessage(error, /CAJA_NO_DISPONIBLE/)) return 'register-unavailable';
        if (isMessage(error, /CAJA_SIN_ACCESO/)) return 'denied';
        if (isUniqueViolation(error))
          return isMessage(error, /open_operator_key|openOperatorKey/i)
            ? 'operator-busy'
            : 'register-busy';
        throw error;
      }
    },
    async move(actor, write) {
      try {
        await dc.executeGraphql(MOVE, {
          variables: {
            ...write.scope,
            actorId: actor.uid,
            permission: 'cash_session.open',
            cashSessionId: write.session.id,
            version: write.session.version,
            movementId: write.movementId,
            key: write.idempotencyKey,
            kind: write.kind,
            amountMinor: write.amountMinor,
            reason: write.reason,
            movementRef: write.movementId,
          },
        });
        return true;
      } catch (error) {
        if (isUniqueViolation(error) || isLostRace(error)) return false;
        throw error;
      }
    },
    async close(actor, write) {
      try {
        await dc.executeGraphql(CLOSE, {
          variables: {
            ...write.scope,
            actorId: actor.uid,
            permission: 'cash_session.close',
            cashSessionId: write.session.id,
            version: write.session.version,
            expectedMinor: write.expectedMinor,
            countedMinor: write.countedMinor,
            differenceMinor: write.differenceMinor,
            reason: write.reason,
            sessionRef: write.session.id,
          },
        });
        return true;
      } catch (error) {
        if (isUniqueViolation(error) || isLostRace(error)) return false;
        throw error;
      }
    },
  };
}
