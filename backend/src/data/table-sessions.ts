import type { DataConnect } from 'firebase-admin/data-connect';
import type { RateLimiter } from '../shared/rate-limit.ts';
import type {
  MovedParticipation,
  OpenTable,
  TableSessionStore,
} from '../table-session/join-table-session.ts';

// Operaciones NO_ACCESS del conector (dataconnect/connector/servidor.gql) con el Admin SDK sin
// suplantar: el backend ya hizo sus comprobaciones y SQL Connect no admite a ningún cliente.

interface OpenSessionData {
  diningTables: Array<{
    id: string;
    tenantId: string;
    branchId: string;
    code: string;
    tableSessions_on_table: Array<{
      id: string;
      mine: Array<{ id: string; expiresAt: string; removedAt: string | null }>;
      active: Array<{ _count: number }>;
    }>;
  }>;
}

/** Choque con una restricción de unicidad (dos solicitudes simultáneas iguales). */
export function isUniqueViolation(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /duplicate|unique|already exists/i.test(message);
}

export function createTableSessionStore(dataConnect: DataConnect): TableSessionStore {
  return {
    async openTableByQr(qrPublicId, authUid): Promise<OpenTable | null> {
      const { data } = await dataConnect.executeQuery<
        OpenSessionData,
        { qrPublicId: string; authUid: string }
      >('ServerOpenSessionByQr', { qrPublicId, authUid });
      const table = data.diningTables[0];
      if (!table) return null;
      const session = table.tableSessions_on_table[0];
      const mine = session?.mine[0];
      return {
        tableId: table.id,
        tenantId: table.tenantId,
        branchId: table.branchId,
        code: table.code,
        session: session
          ? {
              id: session.id,
              mine: mine
                ? {
                    id: mine.id,
                    expiresAt: new Date(mine.expiresAt),
                    removed: mine.removedAt !== null,
                  }
                : null,
              activeCount: session.active[0]?._count ?? 0,
            }
          : null,
      };
    },

    async insertParticipant(participant) {
      try {
        const { data } = await dataConnect.executeMutation<
          { sessionParticipant_insert: { id: string } },
          Record<string, string>
        >('ServerInsertParticipant', {
          tenantId: participant.tenantId,
          branchId: participant.branchId,
          sessionId: participant.sessionId,
          authUid: participant.authUid,
          expiresAt: participant.expiresAt.toISOString(),
        });
        return data.sessionParticipant_insert.id;
      } catch (error) {
        if (isUniqueViolation(error)) return null;
        throw error;
      }
    },

    async renewParticipant(participantId, expiresAt) {
      await dataConnect.executeMutation('ServerRenewParticipant', {
        participantId,
        expiresAt: expiresAt.toISOString(),
      });
    },

    async myOpenParticipation(tenantId, branchId, authUid): Promise<MovedParticipation | null> {
      const { data } = await dataConnect.executeQuery<
        {
          sessionParticipants: Array<{
            id: string;
            expiresAt: string;
            session: { id: string; table: { code: string } };
          }>;
        },
        { tenantId: string; branchId: string; authUid: string }
      >('ServerMyOpenParticipation', { tenantId, branchId, authUid });
      const found = data.sessionParticipants[0];
      return found
        ? {
            sessionId: found.session.id,
            participantId: found.id,
            expiresAt: new Date(found.expiresAt),
            tableCode: found.session.table.code,
          }
        : null;
    },
  };
}

const RATE_LIMITED = 'Límite de solicitudes superado';

export function createRateLimiter(dataConnect: DataConnect, now: () => Date): RateLimiter {
  return {
    async admit(rule, subject) {
      const since = new Date(now().getTime() - rule.windowSeconds * 1000);
      try {
        await dataConnect.executeMutation('ServerHitRateLimit', {
          scope: rule.scope,
          subject,
          since: since.toISOString(),
          limit: rule.limit,
        });
        return true;
      } catch (error) {
        if (error instanceof Error && error.message.includes(RATE_LIMITED)) return false;
        throw error;
      }
    },
  };
}
