import type { DataConnect } from 'firebase-admin/data-connect';
import type { ServiceRequestStore } from '../service-requests/request-service.ts';
import { isConnectorRejection } from './sql-connect.ts';
import { isUniqueViolation } from './table-sessions.ts';

// Solicitudes de servicio con operaciones NO_ACCESS del conector: la creación usa
// ServerCreateServiceRequest para que el salón la vea al instante (ADR-0007).

interface ParticipantData {
  sessionParticipants: Array<{ id: string; tenantId: string; branchId: string }>;
}

const KIND = { call_waiter: 'CALL_WAITER', request_bill: 'REQUEST_BILL' } as const;

export function createServiceRequestStore(dataConnect: DataConnect): ServiceRequestStore {
  return {
    async participant(sessionId, authUid) {
      // Misma consulta que el resumen: participación vigente en una sesión abierta.
      const { data } = await dataConnect.executeQuery<
        ParticipantData,
        { sessionId: string; authUid: string }
      >('ServerQuoteContext', { sessionId, authUid });
      const row = data.sessionParticipants[0];
      return row ? { participantId: row.id, tenantId: row.tenantId, branchId: row.branchId } : null;
    },

    async create(participant, sessionId, authUid, kind) {
      try {
        await dataConnect.executeMutation('ServerCreateServiceRequest', {
          tenantId: participant.tenantId,
          branchId: participant.branchId,
          sessionId,
          participantId: participant.participantId,
          authUid,
          kind: KIND[kind],
        });
        return 'created';
      } catch (error) {
        if (isUniqueViolation(error)) return 'already-pending';
        if (isConnectorRejection(error)) return 'not-seated';
        throw error;
      }
    },
  };
}
