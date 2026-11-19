import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import {
  PaymentKeyConflictError,
  PaymentTimeoutError,
  type GatewayCapabilities,
  type PaymentAmount,
  type PaymentGateway,
  type PaymentResult,
  type PaymentStatus,
  type ProviderNotice,
  type WebhookVerification,
} from '@tavelyo/contracts';

/**
 * ADAPTADOR DE PAGO SIMULADO (Fases 2 a 4). No mueve dinero ni habla con ningún proveedor: existe
 * para ejercitar el flujo completo mientras se elige la pasarela real (D-02). Sus referencias
 * empiezan por «sim_» y sus resultados llevan `simulated: true`.
 *
 * Reproduce lo que hace una pasarela real (Fase 4, bloque 3): idempotencia por clave, vencimiento
 * de la autorización, captura menor con liberación del resto, reembolsos parciales o en curso,
 * capacidades declaradas y avisos firmados. Con `controls` las pruebas inyectan rechazos, tiempos
 * agotados, vencimientos y avisos repetidos o desordenados.
 *
 * Solo se puede crear con un proyecto `demo-*` de Firebase (emuladores, sin acceso a servicios
 * reales). Con cualquier otro proyecto lanza al arrancar, así que el backend no llega a servir.
 */
export class SimulatedPaymentsNotAllowedError extends Error {
  constructor(projectId: string) {
    super(
      `El adaptador de pago simulado solo funciona con un proyecto demo-* (proyecto: «${projectId}»). ` +
        'Configura una pasarela real (D-02) antes de usar un proyecto de Firebase real.',
    );
    this.name = 'SimulatedPaymentsNotAllowedError';
  }
}

const DEMO_PROJECT = /^demo-[a-z0-9-]+$/;

export function assertSimulatedPaymentsAllowed(projectId: string | undefined): void {
  if (!projectId || !DEMO_PROJECT.test(projectId)) {
    throw new SimulatedPaymentsNotAllowedError(projectId ?? '(sin proyecto)');
  }
}

/** Proyecto de Firebase configurado en Cloud Functions (o en los emuladores). */
export function configuredProjectId(env: NodeJS.ProcessEnv = process.env): string | undefined {
  if (env['GCLOUD_PROJECT']) return env['GCLOUD_PROJECT'];
  try {
    const config = JSON.parse(env['FIREBASE_CONFIG'] ?? '{}') as { projectId?: unknown };
    return typeof config.projectId === 'string' ? config.projectId : undefined;
  } catch {
    return undefined;
  }
}

/** Cabecera con la firma de los avisos simulados: `t=<segundos>,v1=<HMAC-SHA256 en hex>`. */
export const SIMULATED_SIGNATURE_HEADER = 'x-simulated-signature';
/** Antigüedad máxima de un aviso: uno más viejo se rechaza aunque la firma sea válida. */
export const WEBHOOK_TOLERANCE_MS = 5 * 60_000;
/** Vigencia de una autorización simulada (como la más corta de las pasarelas estudiadas, D-02). */
export const SIMULATED_AUTHORIZATION_TTL_MS = 7 * 24 * 3_600_000;

/**
 * Fallo inyectado en la próxima operación de un tipo:
 * - `fail`: la pasarela la rechaza;
 * - `timeout-applied`: la pasarela la hace, pero la respuesta se pierde;
 * - `timeout-lost`: la petición no llega; la consulta no la conoce y hay que repetirla;
 * - `pending` (solo reembolsos): queda en curso y se confirma después con `settleRefund`.
 */
export type SimulatedFailure = 'fail' | 'timeout-applied' | 'timeout-lost' | 'pending';
export type SimulatedOperationKind = 'capture' | 'void' | 'refund';

export interface SimulatedWebhook {
  readonly body: string;
  readonly signature: string;
}

export interface SimulatedControls {
  failNext(kind: SimulatedOperationKind, failure: SimulatedFailure): void;
  /** Hace vencer una autorización ahora (sin esperar su plazo). */
  expire(paymentRef: string): void;
  /** Termina un reembolso en curso y emite su aviso. */
  settleRefund(refundRef: string, outcome: 'refunded' | 'failed'): void;
  /** Avisos firmados emitidos desde la última llamada, en orden. */
  takeWebhooks(): SimulatedWebhook[];
  /** Firma un cuerpo cualquiera (para probar avisos alterados o vencidos). */
  sign(body: string, at: Date): string;
}

export interface SimulatedPaymentGateway extends PaymentGateway {
  readonly controls: SimulatedControls;
}

export interface SimulatedGatewayOptions {
  readonly now?: () => Date;
  readonly capabilities?: Partial<GatewayCapabilities>;
  readonly authorizationTtlMs?: number;
  /** Sin valor, se genera uno al azar por instancia: nadie de fuera puede firmar avisos. */
  readonly webhookSecret?: string;
}

const DEFAULT_CAPABILITIES: GatewayCapabilities = {
  partialCapture: true,
  incrementalAuthorization: false,
  partialRefund: true,
};

type HoldStatus = 'authorized' | 'captured' | 'voided' | 'expired';

interface Hold {
  readonly ref: string;
  readonly authorizeKey: string;
  readonly amount: bigint;
  readonly currency: string;
  status: HoldStatus;
  captured: bigint;
  /** Reembolsado o en curso: no se puede volver a reembolsar. */
  refunded: bigint;
  expiresAt: Date;
}

interface RefundState {
  readonly ref: string;
  readonly key: string;
  readonly holdRef: string;
  readonly amount: bigint;
  readonly currency: string;
  status: 'refund_pending' | 'refunded' | 'failed';
}

interface Operation {
  readonly fingerprint: string;
  /** Resultado al hacerla; las autorizaciones y los reembolsos se leen en su estado actual. */
  readonly result: PaymentResult;
  readonly holdRef?: string;
  readonly refundRef?: string;
}

const NOTICE_STATUSES: readonly PaymentStatus[] = [
  'authorized',
  'captured',
  'voided',
  'refunded',
  'refund_pending',
  'failed',
  'expired',
];

function hmac(secret: string, timestamp: string, body: string): string {
  return createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
}

function parseNotice(rawBody: string): ProviderNotice | null {
  let value: unknown;
  try {
    value = JSON.parse(rawBody);
  } catch {
    return null;
  }
  if (typeof value !== 'object' || value === null) return null;
  const body = value as Record<string, unknown>;
  const amount = body['amount'] as Record<string, unknown> | undefined;
  const text = (field: unknown, max: number) =>
    typeof field === 'string' && field.length > 0 && field.length <= max;
  if (
    !text(body['id'], 100) ||
    !text(body['type'], 60) ||
    !(body['operationKey'] === null || text(body['operationKey'], 200)) ||
    !text(body['paymentRef'], 200) ||
    !NOTICE_STATUSES.includes(body['status'] as PaymentStatus) ||
    !text(body['occurredAt'], 40) ||
    typeof amount !== 'object' ||
    amount === null ||
    typeof amount['amountMinor'] !== 'string' ||
    !/^\d{1,18}$/.test(amount['amountMinor']) ||
    typeof amount['currency'] !== 'string' ||
    !/^[A-Z]{3}$/.test(amount['currency'])
  ) {
    return null;
  }
  return {
    eventId: body['id'] as string,
    type: body['type'] as string,
    operationKey: body['operationKey'] as string | null,
    paymentRef: body['paymentRef'] as string,
    status: body['status'] as PaymentStatus,
    amount: { amountMinor: amount['amountMinor'], currency: amount['currency'] },
    occurredAt: body['occurredAt'] as string,
  };
}

export function createSimulatedPaymentGateway(
  projectId: string | undefined,
  options: SimulatedGatewayOptions = {},
): SimulatedPaymentGateway {
  assertSimulatedPaymentsAllowed(projectId);
  const now = options.now ?? (() => new Date());
  const ttlMs = options.authorizationTtlMs ?? SIMULATED_AUTHORIZATION_TTL_MS;
  const secret = options.webhookSecret ?? randomBytes(32).toString('hex');
  const capabilities = { ...DEFAULT_CAPABILITIES, ...options.capabilities };

  // En memoria de la instancia: suficiente para una simulación; un proveedor real guarda el estado.
  const operations = new Map<string, Operation>();
  const holds = new Map<string, Hold>();
  const refunds = new Map<string, RefundState>();
  const failures = new Map<SimulatedOperationKind, SimulatedFailure[]>();
  let outbox: SimulatedWebhook[] = [];
  let sequence = 0;
  // Como en una pasarela real, las referencias y los avisos son únicos entre instancias y reinicios.
  const instance = randomBytes(4).toString('hex');

  const nextRef = (prefix: string) => {
    sequence += 1;
    return `${prefix}_${now().getTime().toString(36)}_${instance}_${sequence}`;
  };
  const result = (status: PaymentStatus, paymentRef: string, extra: Partial<PaymentResult> = {}) =>
    ({ status, paymentRef, simulated: true, ...extra }) satisfies PaymentResult;
  const failed = (paymentRef: string, failureCode: string) =>
    result('failed', paymentRef, { failureCode });

  const sign = (body: string, at: Date) => {
    const timestamp = Math.floor(at.getTime() / 1000).toString();
    return `t=${timestamp},v1=${hmac(secret, timestamp, body)}`;
  };

  const emit = (
    type: string,
    operationKey: string | null,
    paymentRef: string,
    status: PaymentStatus,
    amount: bigint,
    currency: string,
  ) => {
    sequence += 1;
    const at = now();
    const body = JSON.stringify({
      id: `evt_sim_${instance}_${sequence}`,
      type,
      operationKey,
      paymentRef,
      status,
      amount: { amountMinor: amount.toString(), currency },
      occurredAt: at.toISOString(),
    });
    outbox.push({ body, signature: sign(body, at) });
  };

  /** Una autorización cuyo plazo pasó queda vencida, como en la pasarela. */
  const refresh = (hold: Hold) => {
    if (hold.status === 'authorized' && hold.expiresAt <= now()) hold.status = 'expired';
    return hold;
  };

  const current = (operation: Operation): PaymentResult => {
    if (operation.refundRef) {
      const refund = refunds.get(operation.refundRef);
      if (refund) return { ...operation.result, status: refund.status };
    }
    if (operation.holdRef && operation.result.status === 'authorized') {
      const hold = holds.get(operation.holdRef);
      if (hold) return { ...operation.result, status: refresh(hold).status };
    }
    return operation.result;
  };

  /** Misma clave y mismos datos: la misma respuesta. Misma clave y otros datos: error. */
  const replay = (key: string, fingerprint: string): PaymentResult | null => {
    const previous = operations.get(key);
    if (!previous) return null;
    if (previous.fingerprint !== fingerprint) throw new PaymentKeyConflictError(key);
    return current(previous);
  };

  const takeFailure = (kind: SimulatedOperationKind) => failures.get(kind)?.shift();

  /** Aplica el fallo inyectado alrededor de la operación y la guarda con su clave. */
  const run = (
    kind: SimulatedOperationKind,
    key: string,
    fingerprint: string,
    paymentRef: string,
    apply: (pending: boolean) => Operation,
  ): PaymentResult => {
    const previous = replay(key, fingerprint);
    if (previous) return previous;
    const failure = takeFailure(kind);
    if (failure === 'timeout-lost') throw new PaymentTimeoutError(key);
    const operation =
      failure === 'fail'
        ? { fingerprint, result: failed(paymentRef, `sim_${kind}_failed`) }
        : apply(failure === 'pending');
    operations.set(key, operation);
    if (failure === 'timeout-applied') throw new PaymentTimeoutError(key);
    return current(operation);
  };

  const amountOf = (amount: PaymentAmount) => BigInt(amount.amountMinor);

  const controls: SimulatedControls = {
    failNext(kind, failure) {
      if (failure === 'pending' && kind !== 'refund') {
        throw new Error('Solo un reembolso puede quedar en curso');
      }
      failures.set(kind, [...(failures.get(kind) ?? []), failure]);
    },
    expire(paymentRef) {
      const hold = holds.get(paymentRef);
      if (!hold || hold.status !== 'authorized') return;
      hold.expiresAt = now();
      hold.status = 'expired';
      emit(
        'authorization.expired',
        hold.authorizeKey,
        hold.ref,
        'expired',
        hold.amount,
        hold.currency,
      );
    },
    settleRefund(refundRef, outcome) {
      const refund = refunds.get(refundRef);
      if (!refund || refund.status !== 'refund_pending') return;
      refund.status = outcome;
      const hold = holds.get(refund.holdRef);
      if (outcome === 'failed' && hold) hold.refunded -= refund.amount;
      emit(
        outcome === 'refunded' ? 'refund.succeeded' : 'refund.failed',
        refund.key,
        refund.ref,
        outcome,
        refund.amount,
        refund.currency,
      );
    },
    takeWebhooks() {
      const taken = outbox;
      outbox = [];
      return taken;
    },
    sign,
  };

  return {
    simulated: true,
    provider: 'simulated',
    capabilities,
    controls,

    async authorize(request) {
      const amount = amountOf(request.amount);
      const fingerprint = `authorize|${amount}|${request.amount.currency}`;
      const previous = replay(request.idempotencyKey, fingerprint);
      if (previous) return previous;
      const store = (status: 'authorized' | 'declined') => {
        const paymentRef = nextRef('sim');
        const expiresAt = new Date(now().getTime() + ttlMs);
        if (status === 'authorized') {
          holds.set(paymentRef, {
            ref: paymentRef,
            authorizeKey: request.idempotencyKey,
            amount,
            currency: request.amount.currency,
            status: 'authorized',
            captured: 0n,
            refunded: 0n,
            expiresAt,
          });
        }
        const stored = result(
          status,
          paymentRef,
          status === 'authorized' ? { expiresAt: expiresAt.toISOString() } : {},
        );
        operations.set(request.idempotencyKey, {
          fingerprint,
          result: stored,
          holdRef: paymentRef,
        });
        return stored;
      };
      switch (request.simulatedOutcome ?? 'approved') {
        case 'approved':
          return store('authorized');
        case 'declined':
          return store('declined');
        case 'requires_action':
          // Simula un paso adicional (p. ej. 3-D Secure) sin completarlo: no se guarda.
          return result('requires_action', 'sim_requires_action');
        case 'timeout':
          // Simula una respuesta perdida: la autorización existe, pero quien llama no la recibe.
          store('authorized');
          throw new PaymentTimeoutError(request.idempotencyKey);
      }
    },

    async status(idempotencyKey) {
      const operation = operations.get(idempotencyKey);
      return operation ? current(operation) : null;
    },

    async capture({ paymentRef, amount, idempotencyKey }) {
      const value = amountOf(amount);
      const fingerprint = `capture|${paymentRef}|${value}|${amount.currency}`;
      return run('capture', idempotencyKey, fingerprint, paymentRef, () => {
        const done = (outcome: PaymentResult): Operation => ({ fingerprint, result: outcome });
        const hold = holds.get(paymentRef);
        if (!hold) return done(failed(paymentRef, 'unknown_payment'));
        if (refresh(hold).status === 'expired') return done(result('expired', paymentRef));
        if (hold.currency !== amount.currency) return done(failed(paymentRef, 'currency_mismatch'));
        if (hold.status !== 'authorized') return done(failed(paymentRef, 'invalid_state'));
        if (value <= 0n) return done(failed(paymentRef, 'invalid_amount'));
        if (value > hold.amount) return done(failed(paymentRef, 'amount_exceeds_authorization'));
        if (value < hold.amount && !capabilities.partialCapture) {
          return done(failed(paymentRef, 'partial_capture_unsupported'));
        }
        hold.status = 'captured';
        hold.captured = value;
        emit('capture.succeeded', idempotencyKey, paymentRef, 'captured', value, hold.currency);
        return done(result('captured', paymentRef));
      });
    },

    async voidAuthorization({ paymentRef, idempotencyKey }) {
      const fingerprint = `void|${paymentRef}`;
      return run('void', idempotencyKey, fingerprint, paymentRef, () => {
        const done = (outcome: PaymentResult): Operation => ({ fingerprint, result: outcome });
        const hold = holds.get(paymentRef);
        if (!hold) return done(failed(paymentRef, 'unknown_payment'));
        switch (refresh(hold).status) {
          case 'expired':
            return done(result('expired', paymentRef));
          case 'voided':
            return done(result('voided', paymentRef));
          case 'captured':
            return done(failed(paymentRef, 'invalid_state'));
          case 'authorized':
            hold.status = 'voided';
            emit(
              'authorization.voided',
              idempotencyKey,
              paymentRef,
              'voided',
              hold.amount,
              hold.currency,
            );
            return done(result('voided', paymentRef));
        }
      });
    },

    async refund({ paymentRef, amount, idempotencyKey }) {
      const value = amountOf(amount);
      const fingerprint = `refund|${paymentRef}|${value}|${amount.currency}`;
      return run('refund', idempotencyKey, fingerprint, paymentRef, (pending) => {
        const done = (outcome: PaymentResult): Operation => ({ fingerprint, result: outcome });
        const hold = holds.get(paymentRef);
        if (!hold) return done(failed(paymentRef, 'unknown_payment'));
        if (hold.status !== 'captured') return done(failed(paymentRef, 'invalid_state'));
        if (hold.currency !== amount.currency) return done(failed(paymentRef, 'currency_mismatch'));
        if (value <= 0n) return done(failed(paymentRef, 'invalid_amount'));
        if (value > hold.captured - hold.refunded) {
          return done(failed(paymentRef, 'amount_exceeds_refundable'));
        }
        if (value !== hold.captured && !capabilities.partialRefund) {
          return done(failed(paymentRef, 'partial_refund_unsupported'));
        }
        const refund: RefundState = {
          ref: nextRef('sim_rf'),
          key: idempotencyKey,
          holdRef: paymentRef,
          amount: value,
          currency: hold.currency,
          status: pending ? 'refund_pending' : 'refunded',
        };
        refunds.set(refund.ref, refund);
        hold.refunded += value;
        emit(
          pending ? 'refund.pending' : 'refund.succeeded',
          idempotencyKey,
          refund.ref,
          refund.status,
          value,
          refund.currency,
        );
        return { fingerprint, result: result(refund.status, refund.ref), refundRef: refund.ref };
      });
    },

    verifyWebhook(rawBody, header, at): WebhookVerification {
      const match = /^t=(\d{1,12}),v1=([0-9a-f]{64})$/.exec(
        header(SIMULATED_SIGNATURE_HEADER) ?? '',
      );
      if (!match) return { ok: false, reason: 'invalid-signature' };
      const [, timestamp = '', signature = ''] = match;
      const expected = Buffer.from(hmac(secret, timestamp, rawBody), 'hex');
      if (!timingSafeEqual(expected, Buffer.from(signature, 'hex'))) {
        return { ok: false, reason: 'invalid-signature' };
      }
      if (Math.abs(at.getTime() - Number(timestamp) * 1000) > WEBHOOK_TOLERANCE_MS) {
        return { ok: false, reason: 'stale' };
      }
      const notice = parseNotice(rawBody);
      return notice ? { ok: true, notice } : { ok: false, reason: 'malformed' };
    },
  };
}
