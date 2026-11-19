/**
 * Puerto del libro de operaciones de pago (Fase 4, bloque 3). Lo implementa `data/payments.ts` con
 * SQL Connect (`dataconnect/connector/pagos.gql`). Cada llamada a la pasarela tiene antes una
 * operación guardada con su clave de idempotencia; los cierres (`settle*`, `fail*`) solo avanzan una
 * operación abierta y devuelven false si ya estaba cerrada, sin aplicar sus efectos otra vez.
 */

export type OperationKind = 'AUTHORIZE' | 'CAPTURE' | 'VOID' | 'REFUND' | 'CHARGE';
export type OperationStatus = 'CREATED' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'UNKNOWN';
export type AuthorizationStatus = 'AUTHORIZED' | 'CAPTURED' | 'VOIDED' | 'EXPIRED';

export interface Scope {
  readonly tenantId: string;
  readonly branchId: string;
}

export interface PaymentOperationRecord extends Scope {
  readonly id: string;
  readonly kind: OperationKind;
  readonly status: OperationStatus;
  readonly idempotencyKey: string;
  readonly authorizationId: string | null;
  readonly paymentId: string | null;
  readonly refundId: string | null;
  readonly quoteId: string | null;
  readonly currency: string;
  readonly amountMinor: string;
  /** Referencia sobre la que actúa: la autorización (captura y liberación) o el pago (reembolso). */
  readonly providerRef: string | null;
  readonly failureCode: string | null;
  readonly attempts: number;
  readonly updatedAt: Date;
}

/** Resumen de una operación AUTHORIZE, para resolverla si la respuesta se perdió. */
export interface QuoteOfOperation {
  readonly sessionId: string;
  readonly participantId: string;
  readonly status: string;
  readonly expiresAt: Date;
}

export interface StaleOperation extends PaymentOperationRecord {
  readonly quote: QuoteOfOperation | null;
}

export interface NewOperation extends Scope {
  readonly kind: OperationKind;
  readonly idempotencyKey: string;
  readonly currency: string;
  readonly amountMinor: string;
  readonly providerRef: string | null;
  readonly authorizationId?: string;
  readonly paymentId?: string;
  readonly refundId?: string;
  readonly quoteId?: string;
}

export interface AuthorizationRecord extends Scope {
  readonly id: string;
  readonly provider: string;
  readonly providerRef: string;
  readonly currency: string;
  readonly authorizedMinor: string;
  readonly capturedMinor: string;
  readonly status: AuthorizationStatus;
  readonly expiresAt: Date | null;
}

/** Retención confirmada por la pasarela, para registrarla. */
export interface ConfirmedHold {
  readonly provider: string;
  readonly paymentRef: string;
  readonly expiresAt: Date | null;
}

export interface OrphanHold extends ConfirmedHold {
  readonly quoteId: string;
  readonly sessionId: string;
  readonly participantId: string;
}

export interface PaymentLedger {
  /** Guarda la operación en PROCESSING; si la clave ya existe, devuelve la guardada (created: false). */
  begin(
    operation: NewOperation,
  ): Promise<{ readonly created: boolean; readonly operation: PaymentOperationRecord }>;
  byKey(idempotencyKey: string): Promise<PaymentOperationRecord | null>;
  /** Se repite la misma operación: suma un intento. */
  retry(operation: PaymentOperationRecord): Promise<void>;
  markUnknown(operation: PaymentOperationRecord): Promise<void>;
  fail(operation: PaymentOperationRecord, failureCode: string): Promise<boolean>;
  settleCapture(
    operation: PaymentOperationRecord,
    providerRef: string,
    actorId: string,
  ): Promise<boolean>;
  failCapture(
    operation: PaymentOperationRecord,
    failureCode: string,
    actorId: string,
  ): Promise<boolean>;
  settleVoid(
    operation: PaymentOperationRecord,
    status: 'VOIDED' | 'EXPIRED',
    actorId: string,
  ): Promise<boolean>;
  settleRefund(
    operation: PaymentOperationRecord,
    refundRef: string,
    actorId: string,
  ): Promise<boolean>;
  markRefundPending(operation: PaymentOperationRecord, refundRef: string): Promise<boolean>;
  rejectRefund(
    operation: PaymentOperationRecord,
    failureCode: string,
    actorId: string,
  ): Promise<boolean>;
  adoptOrphanAuthorization(operation: PaymentOperationRecord, hold: OrphanHold): Promise<boolean>;
  expireAuthorization(authorizationId: string): Promise<void>;
  expireAuthorizationByRef(provider: string, providerRef: string): Promise<number>;
}

/** Lo que necesita la conciliación, además del libro. */
export interface ReconciliationStore {
  staleOperations(before: Date, limit: number): Promise<StaleOperation[]>;
  authorizationById(authorizationId: string): Promise<AuthorizationRecord | null>;
  authorizationsToRelease(limit: number): Promise<AuthorizationRecord[]>;
  expireLapsedAuthorizations(now: Date): Promise<number>;
  expiringAuthorizations(before: Date, limit: number): Promise<Array<Scope & { id: string }>>;
  dueOutboxEvents(now: Date, limit: number): Promise<OutboxTask[]>;
  completeOutboxEvent(id: string): Promise<void>;
  retryOutboxEvent(id: string, nextAttemptAt: Date, lastError: string): Promise<void>;
  failOutboxEvent(id: string, lastError: string): Promise<void>;
}

export interface OutboxTask {
  readonly id: string;
  readonly kind: string;
  readonly payload: string;
  readonly attempts: number;
}

/** Avisos de la pasarela ya verificados. */
export interface ProviderEventStore {
  /**
   * Guarda el aviso. «new»: primera vez; «pending»: ya llegó, pero no terminó de procesarse (se
   * procesa otra vez, es idempotente); «done»: repetido; «conflict»: mismo id con otro cuerpo.
   */
  record(event: {
    readonly provider: string;
    readonly eventId: string;
    readonly type: string;
    readonly payloadHash: string;
    readonly providerRef: string;
  }): Promise<{
    readonly state: 'new' | 'pending' | 'done' | 'conflict';
    readonly id: string | null;
  }>;
  finish(id: string, outcome: string, tenantId: string | null): Promise<void>;
}

/** Una operación cerrada ya no cambia: los avisos tardíos o repetidos no la retroceden (caso 8). */
export function isClosed(status: OperationStatus): boolean {
  return status === 'SUCCEEDED' || status === 'FAILED';
}

/** Intentos de liberación con clave nueva, cada uno solo tras un rechazo definitivo del anterior. */
export const MAX_RELEASE_KEYS = 5;

/** Claves deterministas: la misma intención siempre usa la misma clave ante la pasarela. */
export const operationKeys = {
  authorizeQuote: (quoteId: string) => `quote_${quoteId}`,
  /**
   * Liberar no mueve dinero y repetirlo es inocuo, así que tras un rechazo DEFINITIVO (FAILED) se
   * puede intentar con la clave siguiente. Sin respuesta (UNKNOWN), se sigue con la misma.
   */
  release: (authorizationId: string, attempt = 1) =>
    attempt === 1 ? `void_${authorizationId}` : `void_${authorizationId}_${attempt}`,
  capture: (paymentId: string) => `capture_${paymentId}`,
  refund: (refundId: string) => `refund_${refundId}`,
} as const;
