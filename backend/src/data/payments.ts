import type { DataConnect } from 'firebase-admin/data-connect';
import type {
  AuthorizationRecord,
  OutboxTask,
  PaymentLedger,
  PaymentOperationRecord,
  ProviderEventStore,
  ReconciliationStore,
  Scope,
  StaleOperation,
} from '../payments/ledger.ts';
import { isUniqueViolation } from './table-sessions.ts';

// Libro de operaciones de pago, conciliación y avisos de la pasarela con el Admin SDK: operaciones
// NO_ACCESS de dataconnect/connector/pagos.gql.

/** Mensaje de los @check que impiden cerrar dos veces una operación o cambiar un resumen ya usado. */
const ALREADY_CLOSED = /OPERACION_CERRADA|El resumen ya cambió/;

export function isAlreadyClosed(error: unknown): boolean {
  return ALREADY_CLOSED.test(error instanceof Error ? error.message : String(error));
}

interface OperationRow {
  id: string;
  tenantId: string;
  branchId: string;
  kind: PaymentOperationRecord['kind'];
  status: PaymentOperationRecord['status'];
  idempotencyKey: string;
  authorizationId: string | null;
  paymentId: string | null;
  refundId: string | null;
  quoteId: string | null;
  currency: string;
  amountMinor: string;
  providerRef: string | null;
  failureCode: string | null;
  attempts: number;
  updatedAt: string;
}

interface StaleRow extends OperationRow {
  quote: { sessionId: string; participantId: string; status: string; expiresAt: string } | null;
}

interface AuthorizationRow {
  id: string;
  tenantId: string;
  branchId: string;
  provider: string;
  providerRef: string;
  currency: string;
  authorizedMinor: string;
  capturedMinor: string;
  status: AuthorizationRecord['status'];
  expiresAt: string | null;
}

export function toOperation(row: OperationRow): PaymentOperationRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    branchId: row.branchId,
    kind: row.kind,
    status: row.status,
    idempotencyKey: row.idempotencyKey,
    authorizationId: row.authorizationId,
    paymentId: row.paymentId,
    refundId: row.refundId,
    quoteId: row.quoteId,
    currency: row.currency,
    amountMinor: row.amountMinor,
    providerRef: row.providerRef,
    failureCode: row.failureCode,
    attempts: row.attempts,
    updatedAt: new Date(row.updatedAt),
  };
}

export function toAuthorization(row: AuthorizationRow): AuthorizationRecord {
  return { ...row, expiresAt: row.expiresAt === null ? null : new Date(row.expiresAt) };
}

function required(value: string | null, field: string, operation: PaymentOperationRecord): string {
  if (value === null) throw new Error(`La operación ${operation.id} no tiene ${field}`);
  return value;
}

export function createPaymentLedger(dataConnect: DataConnect): PaymentLedger {
  /** Ejecuta un cierre; false si la operación ya estaba cerrada (no se aplica dos veces). */
  const close = async (name: string, variables: Record<string, unknown>): Promise<boolean> => {
    try {
      await dataConnect.executeMutation(name, variables);
      return true;
    } catch (error) {
      if (isAlreadyClosed(error)) return false;
      throw error;
    }
  };

  const byKey = async (idempotencyKey: string) => {
    const { data } = await dataConnect.executeQuery<
      { paymentOperations: OperationRow[] },
      { idempotencyKey: string }
    >('ServerPaymentOperationByKey', { idempotencyKey });
    const row = data.paymentOperations[0];
    return row ? toOperation(row) : null;
  };

  return {
    byKey,

    async begin(operation) {
      try {
        const { data } = await dataConnect.executeMutation<
          { paymentOperation_insert: { id: string } },
          Record<string, unknown>
        >('ServerBeginPaymentOperation', {
          tenantId: operation.tenantId,
          branchId: operation.branchId,
          kind: operation.kind,
          idempotencyKey: operation.idempotencyKey,
          currency: operation.currency,
          amountMinor: operation.amountMinor,
          providerRef: operation.providerRef,
          authorizationId: operation.authorizationId ?? null,
          paymentId: operation.paymentId ?? null,
          refundId: operation.refundId ?? null,
          quoteId: operation.quoteId ?? null,
        });
        return {
          created: true,
          operation: {
            id: data.paymentOperation_insert.id,
            tenantId: operation.tenantId,
            branchId: operation.branchId,
            kind: operation.kind,
            status: 'PROCESSING',
            idempotencyKey: operation.idempotencyKey,
            authorizationId: operation.authorizationId ?? null,
            paymentId: operation.paymentId ?? null,
            refundId: operation.refundId ?? null,
            quoteId: operation.quoteId ?? null,
            currency: operation.currency,
            amountMinor: operation.amountMinor,
            providerRef: operation.providerRef,
            failureCode: null,
            attempts: 1,
            updatedAt: new Date(),
          },
        };
      } catch (error) {
        if (!isUniqueViolation(error)) throw error;
        const existing = await byKey(operation.idempotencyKey);
        if (!existing) throw error;
        return { created: false, operation: existing };
      }
    },

    async retry(operation) {
      await dataConnect.executeMutation('ServerRetryPaymentOperation', {
        operationId: operation.id,
      });
    },

    async markUnknown(operation) {
      await dataConnect.executeMutation('ServerMarkPaymentOperationUnknown', {
        operationId: operation.id,
      });
    },

    fail(operation, failureCode) {
      return close('ServerFailPaymentOperation', { operationId: operation.id, failureCode });
    },

    settleCapture(operation, providerRef, actorId) {
      return close('ServerSettleCapture', {
        operationId: operation.id,
        tenantId: operation.tenantId,
        authorizationId: required(operation.authorizationId, 'autorización', operation),
        paymentId: required(operation.paymentId, 'pago', operation),
        capturedMinor: operation.amountMinor,
        providerRef,
        actorId,
      });
    },

    failCapture(operation, failureCode, actorId) {
      return close('ServerFailCapture', {
        operationId: operation.id,
        tenantId: operation.tenantId,
        paymentId: required(operation.paymentId, 'pago', operation),
        failureCode,
        actorId,
      });
    },

    settleVoid(operation, status, actorId) {
      return close('ServerSettleVoid', {
        operationId: operation.id,
        tenantId: operation.tenantId,
        authorizationId: required(operation.authorizationId, 'autorización', operation),
        status,
        actorId,
      });
    },

    settleRefund(operation, refundRef, actorId) {
      return close('ServerSettleRefund', {
        operationId: operation.id,
        tenantId: operation.tenantId,
        refundId: required(operation.refundId, 'reembolso', operation),
        refundRef,
        actorId,
      });
    },

    markRefundPending(operation, refundRef) {
      return close('ServerMarkRefundPending', {
        operationId: operation.id,
        refundId: required(operation.refundId, 'reembolso', operation),
        refundRef,
      });
    },

    rejectRefund(operation, failureCode, actorId) {
      return close('ServerRejectRefund', {
        operationId: operation.id,
        tenantId: operation.tenantId,
        refundId: required(operation.refundId, 'reembolso', operation),
        failureCode,
        actorId,
      });
    },

    adoptOrphanAuthorization(operation, hold) {
      return close('ServerAdoptOrphanAuthorization', {
        operationId: operation.id,
        quoteId: hold.quoteId,
        tenantId: operation.tenantId,
        branchId: operation.branchId,
        sessionId: hold.sessionId,
        participantId: hold.participantId,
        provider: hold.provider,
        paymentRef: hold.paymentRef,
        currency: operation.currency,
        amountMinor: operation.amountMinor,
        expiresAt: hold.expiresAt?.toISOString() ?? null,
      });
    },

    async expireAuthorization(authorizationId) {
      await dataConnect.executeMutation('ServerExpireAuthorization', { authorizationId });
    },

    async expireAuthorizationByRef(provider, providerRef) {
      const { data } = await dataConnect.executeMutation<
        { paymentAuthorization_updateMany: number },
        { provider: string; providerRef: string }
      >('ServerExpireAuthorizationByRef', { provider, providerRef });
      return data.paymentAuthorization_updateMany;
    },
  };
}

export function createReconciliationStore(dataConnect: DataConnect): ReconciliationStore {
  return {
    async staleOperations(before, limit): Promise<StaleOperation[]> {
      const { data } = await dataConnect.executeQuery<
        { paymentOperations: StaleRow[] },
        { before: string; limit: number }
      >('ServerStalePaymentOperations', { before: before.toISOString(), limit });
      return data.paymentOperations.map((row) => ({
        ...toOperation(row),
        quote: row.quote ? { ...row.quote, expiresAt: new Date(row.quote.expiresAt) } : null,
      }));
    },

    async authorizationById(authorizationId) {
      const { data } = await dataConnect.executeQuery<
        { paymentAuthorization: AuthorizationRow | null },
        { authorizationId: string }
      >('ServerAuthorizationById', { authorizationId });
      return data.paymentAuthorization ? toAuthorization(data.paymentAuthorization) : null;
    },

    async authorizationsToRelease(limit) {
      const { data } = await dataConnect.executeQuery<
        { paymentAuthorizations: AuthorizationRow[] },
        { limit: number }
      >('ServerAuthorizationsToRelease', { limit });
      return data.paymentAuthorizations.map(toAuthorization);
    },

    async expireLapsedAuthorizations(now) {
      const { data } = await dataConnect.executeMutation<
        { paymentAuthorization_updateMany: number },
        { now: string }
      >('ServerExpireLapsedAuthorizations', { now: now.toISOString() });
      return data.paymentAuthorization_updateMany;
    },

    async expiringAuthorizations(before, limit) {
      const { data } = await dataConnect.executeQuery<
        { paymentAuthorizations: Array<Scope & { id: string }> },
        { before: string; limit: number }
      >('ServerExpiringAuthorizations', { before: before.toISOString(), limit });
      return data.paymentAuthorizations.map(({ id, tenantId, branchId }) => ({
        id,
        tenantId,
        branchId,
      }));
    },

    async dueOutboxEvents(now, limit): Promise<OutboxTask[]> {
      const { data } = await dataConnect.executeQuery<
        { outboxEvents: OutboxTask[] },
        { now: string; limit: number }
      >('ServerDueOutboxEvents', { now: now.toISOString(), limit });
      return data.outboxEvents;
    },

    async completeOutboxEvent(outboxId) {
      await dataConnect.executeMutation('ServerCompleteOutboxEvent', { outboxId });
    },

    async retryOutboxEvent(outboxId, nextAttemptAt, lastError) {
      await dataConnect.executeMutation('ServerRetryOutboxEvent', {
        outboxId,
        nextAttemptAt: nextAttemptAt.toISOString(),
        lastError,
      });
    },

    async failOutboxEvent(outboxId, lastError) {
      await dataConnect.executeMutation('ServerFailOutboxEvent', { outboxId, lastError });
    },
  };
}

export function createProviderEventStore(dataConnect: DataConnect): ProviderEventStore {
  return {
    async record(event) {
      try {
        const { data } = await dataConnect.executeMutation<
          { providerEvent_insert: { id: string } },
          Record<string, unknown>
        >('ServerRecordProviderEvent', {
          provider: event.provider,
          externalEventId: event.eventId,
          type: event.type,
          payloadHash: event.payloadHash,
          providerRef: event.providerRef,
        });
        return { state: 'new', id: data.providerEvent_insert.id };
      } catch (error) {
        if (!isUniqueViolation(error)) throw error;
        const { data } = await dataConnect.executeQuery<
          {
            providerEvents: Array<{ id: string; payloadHash: string; processedAt: string | null }>;
          },
          { provider: string; externalEventId: string }
        >('ServerProviderEvent', { provider: event.provider, externalEventId: event.eventId });
        const stored = data.providerEvents[0];
        if (!stored) throw error;
        if (stored.payloadHash !== event.payloadHash) return { state: 'conflict', id: stored.id };
        return { state: stored.processedAt === null ? 'pending' : 'done', id: stored.id };
      }
    },

    async finish(eventId, outcome, tenantId) {
      await dataConnect.executeMutation('ServerFinishProviderEvent', {
        eventId,
        outcome,
        tenantId,
      });
    },
  };
}
