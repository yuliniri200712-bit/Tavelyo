import type { PaymentGateway, PaymentResult } from '@tavelyo/contracts';
import type { PaymentLedger, ReconciliationStore, StaleOperation } from './ledger.ts';
import { SYSTEM_ACTOR, type PaymentProcessor } from './payment-processor.ts';

/**
 * Conciliación de pagos (Fase 4, bloque 3; PM §8). Se ejecuta cada pocos minutos y es idempotente:
 * repetirla no cobra ni libera dos veces, porque cada paso usa la misma clave de idempotencia.
 * 1. Operaciones abiertas sin cambios desde hace un rato: consulta su resultado o repite la MISMA
 *    operación (caso 7). Las que superan el máximo de intentos se informan para revisarlas a mano.
 * 2. Autorizaciones vencidas sin capturar: quedan EXPIRED (no se pueden capturar).
 * 3. Retenciones de pedidos que no llegaron a cocina (RELEASE_PENDING): se liberan.
 * 4. Tareas pendientes (outbox), como liberar retenciones al cerrar la mesa: se reintentan.
 * 5. Autorizaciones que vencen pronto: se avisa en el registro (sin datos personales).
 */

export const RECONCILE_LIMITS = {
  /** Una operación abierta se revisa si no cambió en este tiempo. */
  staleAfterMs: 2 * 60_000,
  batch: 50,
  maxAttempts: 10,
  expiryWarningMs: 24 * 3_600_000,
  outboxMaxAttempts: 10,
  outboxMaxBackoffMs: 60 * 60_000,
} as const;

/** Tarea del outbox: liberar la retención de una autorización (al cerrar la mesa, bloque 4). */
export const RELEASE_AUTHORIZATION_TASK = 'payment.release-authorization';

export interface ReconcileReport {
  resolved: number;
  unresolved: number;
  stuck: number;
  adopted: number;
  expired: number;
  released: number;
  outboxDone: number;
  outboxRetried: number;
  outboxFailed: number;
  expiringSoon: number;
  errors: number;
}

export interface ReconcileLog {
  warn(message: string, data: Readonly<Record<string, unknown>>): void;
  error(message: string, data: Readonly<Record<string, unknown>>): void;
}

export interface ReconcilePaymentsDeps {
  readonly store: ReconciliationStore;
  readonly ledger: Pick<PaymentLedger, 'fail' | 'adoptOrphanAuthorization'>;
  readonly processor: Pick<PaymentProcessor, 'resolve' | 'release'>;
  readonly gateway: PaymentGateway;
  readonly now: () => Date;
  readonly log: ReconcileLog;
}

/** Espera antes del siguiente intento de una tarea: 1, 2, 4… minutos, como mucho una hora. */
export function outboxBackoffMs(attempts: number): number {
  return Math.min(2 ** attempts * 60_000, RECONCILE_LIMITS.outboxMaxBackoffMs);
}

function parseReleasePayload(payload: string): string | null {
  try {
    const value = JSON.parse(payload) as { authorizationId?: unknown };
    return typeof value.authorizationId === 'string' && /^[0-9a-f]{32}$/.test(value.authorizationId)
      ? value.authorizationId
      : null;
  } catch {
    return null;
  }
}

export function createReconcilePayments(deps: ReconcilePaymentsDeps) {
  const { store, ledger, processor, gateway, log } = deps;

  async function lookup(idempotencyKey: string): Promise<PaymentResult | null> {
    try {
      return await gateway.status(idempotencyKey);
    } catch {
      return null;
    }
  }

  /**
   * Autorización cuya respuesta se perdió. Mientras el resumen siga vigente, el cliente puede
   * reintentar (misma clave) y se espera. Vencido el resumen, nadie la confirmó al cliente: si la
   * pasarela la autorizó, se registra la retención para liberarla; si no, la operación falla.
   */
  async function reconcileAuthorize(
    operation: StaleOperation,
    now: Date,
  ): Promise<'adopted' | 'failed' | 'waiting'> {
    const quote = operation.quote;
    if (!quote || !operation.quoteId) {
      await ledger.fail(operation, 'no_quote');
      return 'failed';
    }
    if (quote.expiresAt > now) return 'waiting';
    const result = await lookup(operation.idempotencyKey);
    if (result?.status !== 'authorized') {
      await ledger.fail(operation, result?.status ?? 'not_found');
      return 'failed';
    }
    await ledger.adoptOrphanAuthorization(operation, {
      quoteId: operation.quoteId,
      sessionId: quote.sessionId,
      participantId: quote.participantId,
      provider: gateway.provider,
      paymentRef: result.paymentRef,
      expiresAt: result.expiresAt ? new Date(result.expiresAt) : null,
    });
    return 'adopted';
  }

  async function staleOperations(report: ReconcileReport, now: Date) {
    const before = new Date(now.getTime() - RECONCILE_LIMITS.staleAfterMs);
    for (const operation of await store.staleOperations(before, RECONCILE_LIMITS.batch)) {
      try {
        if (operation.attempts >= RECONCILE_LIMITS.maxAttempts) {
          report.stuck += 1;
          log.error('Operación de pago sin resolver tras el máximo de intentos', {
            operationId: operation.id,
            kind: operation.kind,
            tenantId: operation.tenantId,
          });
          continue;
        }
        if (operation.kind === 'AUTHORIZE') {
          const result = await reconcileAuthorize(operation, now);
          if (result === 'adopted') report.adopted += 1;
          if (result === 'waiting') report.unresolved += 1;
          else report.resolved += 1;
          continue;
        }
        const outcome = await processor.resolve(operation);
        if (outcome.kind === 'unknown' || outcome.kind === 'pending') report.unresolved += 1;
        else report.resolved += 1;
      } catch (error) {
        report.errors += 1;
        log.error('Error al conciliar una operación de pago', {
          operationId: operation.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  async function releaseHolds(report: ReconcileReport) {
    for (const authorization of await store.authorizationsToRelease(RECONCILE_LIMITS.batch)) {
      try {
        const outcome = await processor.release(authorization, SYSTEM_ACTOR);
        if (outcome.kind === 'succeeded' || outcome.kind === 'expired') report.released += 1;
      } catch (error) {
        report.errors += 1;
        log.error('Error al liberar una retención', {
          authorizationId: authorization.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  async function runOutbox(report: ReconcileReport, now: Date) {
    for (const task of await store.dueOutboxEvents(now, RECONCILE_LIMITS.batch)) {
      const giveUp = async (reason: string) => {
        report.outboxFailed += 1;
        await store.failOutboxEvent(task.id, reason);
        log.error('Tarea de pago abandonada', { outboxId: task.id, kind: task.kind, reason });
      };
      const later = async (reason: string) => {
        if (task.attempts + 1 >= RECONCILE_LIMITS.outboxMaxAttempts) return giveUp(reason);
        report.outboxRetried += 1;
        await store.retryOutboxEvent(
          task.id,
          new Date(now.getTime() + outboxBackoffMs(task.attempts)),
          reason,
        );
      };
      try {
        if (task.kind !== RELEASE_AUTHORIZATION_TASK) {
          await giveUp('Tipo de tarea desconocido');
          continue;
        }
        const authorizationId = parseReleasePayload(task.payload);
        const authorization = authorizationId
          ? await store.authorizationById(authorizationId)
          : null;
        if (!authorization) {
          await giveUp('Autorización inexistente');
          continue;
        }
        const outcome =
          authorization.status === 'AUTHORIZED'
            ? await processor.release(authorization, SYSTEM_ACTOR)
            : ({ kind: 'succeeded' } as const);
        if (outcome.kind === 'succeeded' || outcome.kind === 'expired') {
          report.outboxDone += 1;
          await store.completeOutboxEvent(task.id);
        } else {
          await later(outcome.kind === 'failed' ? outcome.code : 'Sin respuesta de la pasarela');
        }
      } catch (error) {
        report.errors += 1;
        await later(error instanceof Error ? error.message.slice(0, 200) : 'Error');
      }
    }
  }

  return async (): Promise<ReconcileReport> => {
    const now = deps.now();
    const report: ReconcileReport = {
      resolved: 0,
      unresolved: 0,
      stuck: 0,
      adopted: 0,
      expired: 0,
      released: 0,
      outboxDone: 0,
      outboxRetried: 0,
      outboxFailed: 0,
      expiringSoon: 0,
      errors: 0,
    };
    await staleOperations(report, now);
    report.expired = await store.expireLapsedAuthorizations(now);
    await releaseHolds(report);
    await runOutbox(report, now);
    const soon = await store.expiringAuthorizations(
      new Date(now.getTime() + RECONCILE_LIMITS.expiryWarningMs),
      RECONCILE_LIMITS.batch,
    );
    report.expiringSoon = soon.length;
    if (soon.length > 0) {
      log.warn('Autorizaciones sin capturar que vencen en menos de 24 horas', {
        authorizationIds: soon.map((authorization) => authorization.id),
      });
    }
    return report;
  };
}
