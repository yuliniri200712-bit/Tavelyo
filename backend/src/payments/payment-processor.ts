import { Money, planSettlement } from '@tavelyo/core';
import {
  PaymentKeyConflictError,
  PaymentTimeoutError,
  type PaymentGateway,
  type PaymentResult,
  type ProviderNotice,
} from '@tavelyo/contracts';
import {
  isClosed,
  MAX_RELEASE_KEYS,
  operationKeys,
  type AuthorizationRecord,
  type NewOperation,
  type PaymentLedger,
  type PaymentOperationRecord,
  type Scope,
} from './ledger.ts';

/**
 * Operaciones de dinero ante la pasarela (Fase 4, bloque 3): captura, liberación y reembolso, con
 * idempotencia de punta a punta (PM §8, casos 3, 7 y 8):
 * 1. se guarda la operación con su clave ANTES de llamar a la pasarela;
 * 2. se llama con esa misma clave;
 * 3. si la respuesta se pierde, se consulta con la clave; si la pasarela no la conoce, queda UNKNOWN
 *    y la conciliación repite la MISMA operación (misma clave), nunca una nueva;
 * 4. el resultado se aplica en una transacción que solo avanza una operación abierta.
 * Los importes y las decisiones (cuánto capturar, qué reembolsar) llegan ya validados por el caso de
 * uso que llama (bloque 4); aquí se comprueba de nuevo lo que protege el dinero.
 */

export type OperationOutcome =
  | { readonly kind: 'succeeded' }
  /** Reembolso aceptado y en curso: se confirma con un aviso o con la conciliación. */
  | { readonly kind: 'pending' }
  /** La autorización venció: no se capturó nada y hace falta otro pago. */
  | { readonly kind: 'expired' }
  | { readonly kind: 'failed'; readonly code: string }
  /** Sin respuesta de la pasarela: la conciliación lo resuelve (caso 7). */
  | { readonly kind: 'unknown' };

const SUCCEEDED: OperationOutcome = { kind: 'succeeded' };
const PENDING: OperationOutcome = { kind: 'pending' };
const EXPIRED: OperationOutcome = { kind: 'expired' };
const UNKNOWN: OperationOutcome = { kind: 'unknown' };
const failed = (code: string): OperationOutcome => ({ kind: 'failed', code });

/** Quien actúa cuando lo hace la conciliación o un aviso de la pasarela. */
export const SYSTEM_ACTOR = 'system:payments';

export interface CaptureCommand {
  readonly authorization: AuthorizationRecord;
  /** Pago CARD_CAPTURE ya creado en PENDING por el cobro (bloque 4). */
  readonly paymentId: string;
  readonly amountMinor: string;
  readonly actorId: string;
}

export interface RefundCommand extends Scope {
  /** Reembolso ya creado en REQUESTED, con permiso, motivo y tope (bloque 4). */
  readonly refundId: string;
  readonly paymentId: string;
  /** Referencia del pago en la pasarela (la de su autorización). */
  readonly paymentRef: string;
  readonly currency: string;
  readonly amountMinor: string;
  readonly actorId: string;
}

export type NoticeOutcome =
  | 'applied'
  /** Repetido o tardío sobre una operación cerrada: no la retrocede (caso 8). */
  | 'ignored'
  /** No corresponde a ninguna operación propia. */
  | 'unmatched'
  /** Importe, moneda o referencia distintos de los propios: no se aplica y se revisa. */
  | 'mismatch';

export interface PaymentProcessorDeps {
  readonly gateway: PaymentGateway;
  readonly ledger: PaymentLedger;
  readonly now: () => Date;
}

/** Estados que puede traer un aviso de cada operación; cualquier otro se ignora sin tocarla. */
const NOTICE_STATUSES: Readonly<Record<PaymentOperationRecord['kind'], readonly string[]>> = {
  CAPTURE: ['captured', 'expired', 'failed'],
  VOID: ['voided', 'expired', 'failed'],
  REFUND: ['refunded', 'refund_pending', 'failed'],
  AUTHORIZE: [],
  CHARGE: [],
};

function sameRequest(stored: PaymentOperationRecord, wanted: NewOperation): boolean {
  return (
    stored.kind === wanted.kind &&
    stored.currency === wanted.currency &&
    stored.amountMinor === wanted.amountMinor &&
    (stored.kind === 'AUTHORIZE' || stored.providerRef === wanted.providerRef)
  );
}

function closedOutcome(operation: PaymentOperationRecord): OperationOutcome {
  if (operation.status === 'SUCCEEDED') return SUCCEEDED;
  if (operation.failureCode === 'expired') return EXPIRED;
  return failed(operation.failureCode ?? 'failed');
}

export function createPaymentProcessor(deps: PaymentProcessorDeps) {
  const { gateway, ledger } = deps;

  /** Aplica a la operación lo que dice la pasarela (respuesta, consulta o aviso). */
  async function apply(
    operation: PaymentOperationRecord,
    result: Pick<PaymentResult, 'status' | 'paymentRef' | 'failureCode'>,
    actorId: string,
  ): Promise<OperationOutcome> {
    const code = result.failureCode ?? result.status;
    switch (operation.kind) {
      case 'CAPTURE':
        if (result.status === 'captured') {
          await ledger.settleCapture(operation, result.paymentRef, actorId);
          return SUCCEEDED;
        }
        if (result.status === 'expired') {
          await ledger.failCapture(operation, 'expired', actorId);
          if (operation.authorizationId)
            await ledger.expireAuthorization(operation.authorizationId);
          return EXPIRED;
        }
        if (result.status === 'failed') {
          await ledger.failCapture(operation, code, actorId);
          return failed(code);
        }
        break;
      case 'VOID':
        if (result.status === 'voided' || result.status === 'expired') {
          await ledger.settleVoid(
            operation,
            result.status === 'voided' ? 'VOIDED' : 'EXPIRED',
            actorId,
          );
          return result.status === 'voided' ? SUCCEEDED : EXPIRED;
        }
        if (result.status === 'failed') {
          await ledger.fail(operation, code);
          return failed(code);
        }
        break;
      case 'REFUND':
        if (result.status === 'refunded') {
          await ledger.settleRefund(operation, result.paymentRef, actorId);
          return SUCCEEDED;
        }
        if (result.status === 'refund_pending') {
          await ledger.markRefundPending(operation, result.paymentRef);
          return PENDING;
        }
        if (result.status === 'failed') {
          await ledger.rejectRefund(operation, code, actorId);
          return failed(code);
        }
        break;
      case 'AUTHORIZE':
      case 'CHARGE':
        break;
    }
    // Un estado que no corresponde a la operación no se aplica: queda para revisar.
    await ledger.markUnknown(operation);
    return UNKNOWN;
  }

  function call(operation: PaymentOperationRecord): Promise<PaymentResult> {
    const paymentRef = operation.providerRef;
    if (!paymentRef)
      throw new Error(`La operación ${operation.id} no tiene referencia de la pasarela`);
    const amount = { amountMinor: operation.amountMinor, currency: operation.currency };
    const idempotencyKey = operation.idempotencyKey;
    switch (operation.kind) {
      case 'CAPTURE':
        return gateway.capture({ paymentRef, amount, idempotencyKey });
      case 'VOID':
        return gateway.voidAuthorization({ paymentRef, idempotencyKey });
      case 'REFUND':
        return gateway.refund({ paymentRef, amount, idempotencyKey });
      case 'AUTHORIZE':
      case 'CHARGE':
        throw new Error(`La operación ${operation.kind} no se repite desde aquí`);
    }
  }

  async function lookup(idempotencyKey: string): Promise<PaymentResult | null> {
    try {
      return await gateway.status(idempotencyKey);
    } catch {
      return null;
    }
  }

  /** Llama a la pasarela con la clave guardada y aplica el resultado. */
  async function attempt(operation: PaymentOperationRecord, actorId: string) {
    let result: PaymentResult | null;
    try {
      result = await call(operation);
    } catch (error) {
      if (!(error instanceof PaymentTimeoutError)) {
        await ledger.markUnknown(operation);
        throw error;
      }
      result = await lookup(operation.idempotencyKey);
    }
    if (!result) {
      await ledger.markUnknown(operation);
      return UNKNOWN;
    }
    return apply(operation, result, actorId);
  }

  /** Guarda la operación antes de llamar; una clave repetida reutiliza la operación guardada. */
  async function execute(wanted: NewOperation, actorId: string): Promise<OperationOutcome> {
    const { created, operation } = await ledger.begin(wanted);
    if (!created && !sameRequest(operation, wanted)) {
      throw new PaymentKeyConflictError(wanted.idempotencyKey);
    }
    if (isClosed(operation.status)) return closedOutcome(operation);
    if (!created) await ledger.retry(operation);
    return attempt(operation, actorId);
  }

  return {
    /** Captura `amountMinor` de la autorización; lo no capturado lo libera la pasarela. */
    async capture(command: CaptureCommand): Promise<OperationOutcome> {
      const { authorization } = command;
      const authorized = Money.fromMinorString(
        authorization.authorizedMinor,
        authorization.currency,
      );
      const captured = Money.fromMinorString(authorization.capturedMinor, authorization.currency);
      const due = Money.fromMinorString(command.amountMinor, authorization.currency);
      if (!authorized.ok || !captured.ok || !due.ok || due.value.isZero()) {
        return failed('invalid-amount');
      }
      const plan = planSettlement(
        {
          status: authorization.status,
          authorized: authorized.value,
          captured: captured.value,
          expiresAtMs: authorization.expiresAt?.getTime() ?? null,
        },
        due.value,
        deps.now().getTime(),
        gateway.capabilities,
      );
      if (!plan.ok) {
        if (plan.error.kind === 'expired') {
          await ledger.expireAuthorization(authorization.id);
          return EXPIRED;
        }
        return failed(plan.error.kind);
      }
      // Nunca se captura de más: lo que no cubre la autorización se paga con otro medio.
      if (!plan.value.shortfall.isZero()) return failed('exceeds-authorization');
      return execute(
        {
          tenantId: authorization.tenantId,
          branchId: authorization.branchId,
          kind: 'CAPTURE',
          idempotencyKey: operationKeys.capture(command.paymentId),
          currency: authorization.currency,
          amountMinor: command.amountMinor,
          providerRef: authorization.providerRef,
          authorizationId: authorization.id,
          paymentId: command.paymentId,
        },
        command.actorId,
      );
    },

    /**
     * Libera una autorización sin capturar. Nunca hay dos liberaciones en curso: se pasa a la clave
     * siguiente solo cuando la anterior quedó rechazada (FAILED); sin respuesta, se repite la misma.
     */
    async release(authorization: AuthorizationRecord, actorId: string): Promise<OperationOutcome> {
      if (authorization.status === 'VOIDED') return SUCCEEDED;
      if (authorization.status !== 'AUTHORIZED') return failed('not-authorized');
      for (let attempt = 1; attempt <= MAX_RELEASE_KEYS; attempt += 1) {
        const idempotencyKey = operationKeys.release(authorization.id, attempt);
        const previous = await ledger.byKey(idempotencyKey);
        if (previous?.status === 'FAILED') continue;
        return execute(
          {
            tenantId: authorization.tenantId,
            branchId: authorization.branchId,
            kind: 'VOID',
            idempotencyKey,
            currency: authorization.currency,
            amountMinor: authorization.authorizedMinor,
            providerRef: authorization.providerRef,
            authorizationId: authorization.id,
          },
          actorId,
        );
      }
      return failed('release-attempts-exhausted');
    },

    async refund(command: RefundCommand): Promise<OperationOutcome> {
      return execute(
        {
          tenantId: command.tenantId,
          branchId: command.branchId,
          kind: 'REFUND',
          idempotencyKey: operationKeys.refund(command.refundId),
          currency: command.currency,
          amountMinor: command.amountMinor,
          providerRef: command.paymentRef,
          paymentId: command.paymentId,
          refundId: command.refundId,
        },
        command.actorId,
      );
    },

    /**
     * Resuelve una operación abierta (conciliación): consulta su resultado con la misma clave y, si
     * la pasarela no la conoce, repite la misma operación con la misma clave.
     */
    async resolve(operation: PaymentOperationRecord): Promise<OperationOutcome> {
      if (isClosed(operation.status)) return closedOutcome(operation);
      const known = await lookup(operation.idempotencyKey);
      if (known) return apply(operation, known, SYSTEM_ACTOR);
      await ledger.retry(operation);
      return attempt(operation, SYSTEM_ACTOR);
    },

    /**
     * Aplica un aviso verificado. Se contrasta con la operación propia (importe, moneda y
     * referencia); uno repetido, tardío o fuera de orden no retrocede una operación cerrada.
     */
    async applyNotice(
      notice: ProviderNotice,
    ): Promise<{ readonly outcome: NoticeOutcome; readonly tenantId: string | null }> {
      const operation = notice.operationKey ? await ledger.byKey(notice.operationKey) : null;
      if (!operation) {
        // Un vencimiento puede llegar sin clave: se busca la autorización por su referencia.
        if (notice.status === 'expired') {
          const changed = await ledger.expireAuthorizationByRef(
            gateway.provider,
            notice.paymentRef,
          );
          return { outcome: changed > 0 ? 'applied' : 'unmatched', tenantId: null };
        }
        return { outcome: 'unmatched', tenantId: null };
      }
      const tenantId = operation.tenantId;
      const sameMoney =
        operation.currency === notice.amount.currency &&
        operation.amountMinor === notice.amount.amountMinor;
      // El reembolso tiene su propia referencia; las demás operaciones, la de la autorización.
      const sameRef = operation.kind === 'REFUND' || operation.providerRef === notice.paymentRef;
      if (!sameMoney || !sameRef) return { outcome: 'mismatch', tenantId };
      if (operation.kind === 'AUTHORIZE') {
        if (notice.status !== 'expired') return { outcome: 'ignored', tenantId };
        await ledger.expireAuthorizationByRef(gateway.provider, notice.paymentRef);
        return { outcome: 'applied', tenantId };
      }
      if (isClosed(operation.status) || !NOTICE_STATUSES[operation.kind].includes(notice.status)) {
        return { outcome: 'ignored', tenantId };
      }
      await apply(operation, notice, SYSTEM_ACTOR);
      return { outcome: 'applied', tenantId };
    },
  };
}

export type PaymentProcessor = ReturnType<typeof createPaymentProcessor>;
