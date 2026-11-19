import type {
  AuthorizationRecord,
  OutboxTask,
  PaymentLedger,
  PaymentOperationRecord,
  ProviderEventStore,
  ReconciliationStore,
  StaleOperation,
} from './ledger.ts';
import { isClosed } from './ledger.ts';

/**
 * Libro de pagos en memoria para las pruebas unitarias. Reproduce las garantías de
 * dataconnect/connector/pagos.gql: clave de idempotencia única, cierres que solo avanzan una
 * operación abierta (devuelven false si ya estaba cerrada) y efectos aplicados una sola vez. Las
 * pruebas de integración comprueban lo mismo contra el emulador.
 */

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

export interface MemoryQuote {
  status: string;
  sessionId: string;
  participantId: string;
  expiresAt: Date;
}

export function createMemoryLedger(now: () => Date) {
  let sequence = 0;
  const nextId = () => {
    sequence += 1;
    return sequence.toString(16).padStart(32, '0');
  };
  const operations = new Map<string, Mutable<PaymentOperationRecord>>();
  const authorizations = new Map<string, Mutable<AuthorizationRecord>>();
  const payments = new Map<string, { status: string; providerRef: string | null }>();
  const refunds = new Map<string, { status: string; providerRef: string | null }>();
  const quotes = new Map<string, MemoryQuote>();
  const outbox = new Map<string, Mutable<OutboxTask> & { status: string; nextAttemptAt: Date }>();
  const events = new Map<
    string,
    { id: string; payloadHash: string; processed: boolean; outcome?: string }
  >();
  const effects: string[] = [];
  const quoteOfAuthorization = new Map<string, string>();

  const find = (operation: PaymentOperationRecord) => {
    const stored = operations.get(operation.id);
    if (!stored) throw new Error(`Operación inexistente: ${operation.id}`);
    return stored;
  };

  /** Avanza una operación abierta; si ya estaba cerrada no hace nada (como el @check). */
  const close = (
    operation: PaymentOperationRecord,
    status: 'SUCCEEDED' | 'FAILED' | 'PROCESSING',
    effect: () => void,
    failureCode: string | null = null,
  ) => {
    const stored = find(operation);
    if (isClosed(stored.status)) return false;
    stored.status = status;
    stored.failureCode = failureCode;
    stored.updatedAt = now();
    effect();
    return true;
  };

  const authorizationOf = (operation: PaymentOperationRecord) => {
    const authorization = operation.authorizationId
      ? authorizations.get(operation.authorizationId)
      : undefined;
    if (!authorization) throw new Error('Operación sin autorización');
    return authorization;
  };

  const ledger: PaymentLedger = {
    async begin(wanted) {
      const existing = [...operations.values()].find(
        (operation) => operation.idempotencyKey === wanted.idempotencyKey,
      );
      if (existing) return { created: false, operation: { ...existing } };
      const operation: Mutable<PaymentOperationRecord> = {
        id: nextId(),
        tenantId: wanted.tenantId,
        branchId: wanted.branchId,
        kind: wanted.kind,
        status: 'PROCESSING',
        idempotencyKey: wanted.idempotencyKey,
        authorizationId: wanted.authorizationId ?? null,
        paymentId: wanted.paymentId ?? null,
        refundId: wanted.refundId ?? null,
        quoteId: wanted.quoteId ?? null,
        currency: wanted.currency,
        amountMinor: wanted.amountMinor,
        providerRef: wanted.providerRef,
        failureCode: null,
        attempts: 1,
        updatedAt: now(),
      };
      operations.set(operation.id, operation);
      return { created: true, operation: { ...operation } };
    },
    async byKey(key) {
      const found = [...operations.values()].find((operation) => operation.idempotencyKey === key);
      return found ? { ...found } : null;
    },
    async retry(operation) {
      const stored = find(operation);
      if (isClosed(stored.status)) return;
      stored.status = 'PROCESSING';
      stored.attempts += 1;
      stored.updatedAt = now();
    },
    async markUnknown(operation) {
      const stored = find(operation);
      if (isClosed(stored.status)) return;
      stored.status = 'UNKNOWN';
      stored.updatedAt = now();
    },
    async fail(operation, code) {
      return close(operation, 'FAILED', () => effects.push(`fail:${operation.kind}`), code);
    },
    async settleCapture(operation, providerRef) {
      return close(operation, 'SUCCEEDED', () => {
        const authorization = authorizationOf(operation);
        authorization.status = 'CAPTURED';
        authorization.capturedMinor = operation.amountMinor;
        payments.set(operation.paymentId ?? '', { status: 'CONFIRMED', providerRef });
        effects.push(`capture:${operation.amountMinor}`);
      });
    },
    async failCapture(operation, code) {
      return close(
        operation,
        'FAILED',
        () => payments.set(operation.paymentId ?? '', { status: 'FAILED', providerRef: null }),
        code,
      );
    },
    async settleVoid(operation, status) {
      return close(operation, 'SUCCEEDED', () => {
        const authorization = authorizationOf(operation);
        if (authorization.status === 'AUTHORIZED') authorization.status = status;
        effects.push(`void:${authorization.id}`);
      });
    },
    async settleRefund(operation, refundRef) {
      return close(operation, 'SUCCEEDED', () => {
        refunds.set(operation.refundId ?? '', { status: 'CONFIRMED', providerRef: refundRef });
        effects.push(`refund:${operation.amountMinor}`);
      });
    },
    async markRefundPending(operation, refundRef) {
      return close(operation, 'PROCESSING', () =>
        refunds.set(operation.refundId ?? '', { status: 'PROCESSING', providerRef: refundRef }),
      );
    },
    async rejectRefund(operation, code) {
      return close(
        operation,
        'FAILED',
        () => refunds.set(operation.refundId ?? '', { status: 'REJECTED', providerRef: null }),
        code,
      );
    },
    async adoptOrphanAuthorization(operation, hold) {
      return close(operation, 'SUCCEEDED', () => {
        const quote = quotes.get(hold.quoteId);
        if (quote) quote.status = 'RELEASE_PENDING';
        const id = nextId();
        authorizations.set(id, {
          id,
          tenantId: operation.tenantId,
          branchId: operation.branchId,
          provider: hold.provider,
          providerRef: hold.paymentRef,
          currency: operation.currency,
          authorizedMinor: operation.amountMinor,
          capturedMinor: '0',
          status: 'AUTHORIZED',
          expiresAt: hold.expiresAt,
        });
        quoteOfAuthorization.set(id, hold.quoteId);
        find(operation).providerRef = hold.paymentRef;
      });
    },
    async expireAuthorization(id) {
      const authorization = authorizations.get(id);
      if (authorization?.status === 'AUTHORIZED') authorization.status = 'EXPIRED';
    },
    async expireAuthorizationByRef(provider, ref) {
      let changed = 0;
      for (const authorization of authorizations.values()) {
        if (
          authorization.provider === provider &&
          authorization.providerRef === ref &&
          authorization.status === 'AUTHORIZED'
        ) {
          authorization.status = 'EXPIRED';
          changed += 1;
        }
      }
      return changed;
    },
  };

  const store: ReconciliationStore = {
    async staleOperations(before, limit): Promise<StaleOperation[]> {
      return [...operations.values()]
        .filter((operation) => !isClosed(operation.status) && operation.updatedAt < before)
        .slice(0, limit)
        .map((operation) => ({
          ...operation,
          quote: operation.quoteId ? { ...(quotes.get(operation.quoteId) as MemoryQuote) } : null,
        }));
    },
    async authorizationById(id) {
      const authorization = authorizations.get(id);
      return authorization ? { ...authorization } : null;
    },
    async authorizationsToRelease(limit) {
      return [...authorizations.values()]
        .filter((authorization) => authorization.status === 'AUTHORIZED')
        .filter((authorization) =>
          [...quotes.entries()].some(
            ([quoteId, quote]) =>
              quote.status === 'RELEASE_PENDING' &&
              quoteOfAuthorization.get(authorization.id) === quoteId,
          ),
        )
        .slice(0, limit)
        .map((authorization) => ({ ...authorization }));
    },
    async expireLapsedAuthorizations(at) {
      let changed = 0;
      for (const authorization of authorizations.values()) {
        if (
          authorization.status === 'AUTHORIZED' &&
          authorization.expiresAt !== null &&
          authorization.expiresAt <= at
        ) {
          authorization.status = 'EXPIRED';
          changed += 1;
        }
      }
      return changed;
    },
    async expiringAuthorizations(before, limit) {
      return [...authorizations.values()]
        .filter(
          (authorization) =>
            authorization.status === 'AUTHORIZED' &&
            authorization.expiresAt !== null &&
            authorization.expiresAt < before,
        )
        .slice(0, limit)
        .map(({ id, tenantId, branchId }) => ({ id, tenantId, branchId }));
    },
    async dueOutboxEvents(at, limit) {
      return [...outbox.values()]
        .filter((task) => task.status === 'PENDING' && task.nextAttemptAt <= at)
        .slice(0, limit)
        .map(({ id, kind, payload, attempts }) => ({ id, kind, payload, attempts }));
    },
    async completeOutboxEvent(id) {
      const task = outbox.get(id);
      if (task) Object.assign(task, { status: 'DONE', attempts: task.attempts + 1 });
    },
    async retryOutboxEvent(id, nextAttemptAt) {
      const task = outbox.get(id);
      if (task) Object.assign(task, { nextAttemptAt, attempts: task.attempts + 1 });
    },
    async failOutboxEvent(id) {
      const task = outbox.get(id);
      if (task) Object.assign(task, { status: 'FAILED', attempts: task.attempts + 1 });
    },
  };

  const providerEvents: ProviderEventStore = {
    async record(event) {
      const key = `${event.provider}|${event.eventId}`;
      const stored = events.get(key);
      if (!stored) {
        const id = nextId();
        events.set(key, { id, payloadHash: event.payloadHash, processed: false });
        return { state: 'new', id };
      }
      if (stored.payloadHash !== event.payloadHash) return { state: 'conflict', id: stored.id };
      return { state: stored.processed ? 'done' : 'pending', id: stored.id };
    },
    async finish(id, outcome) {
      for (const event of events.values()) {
        if (event.id === id) Object.assign(event, { processed: true, outcome });
      }
    },
  };

  return {
    ledger,
    store,
    providerEvents,
    operations,
    authorizations,
    payments,
    refunds,
    quotes,
    outbox,
    events,
    effects,
    /** Autorización vigente, enlazada a un resumen. */
    addAuthorization(record: AuthorizationRecord, quoteId?: string) {
      authorizations.set(record.id, { ...record });
      if (quoteId) quoteOfAuthorization.set(record.id, quoteId);
    },
    addOutboxTask(task: OutboxTask, nextAttemptAt: Date) {
      outbox.set(task.id, { ...task, status: 'PENDING', nextAttemptAt });
    },
    /** Hace que una operación parezca antigua (para la conciliación). */
    age(operationId: string, updatedAt: Date) {
      const operation = operations.get(operationId);
      if (operation) operation.updatedAt = updatedAt;
    },
  };
}
