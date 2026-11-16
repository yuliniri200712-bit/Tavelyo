import {
  PaymentTimeoutError,
  type AuthorizeRequest,
  type PaymentAmount,
  type PaymentGateway,
  type PaymentResult,
  type PaymentStatus,
} from '@tavelyo/contracts';

/**
 * ADAPTADOR DE PAGO SIMULADO (Fase 2). No mueve dinero ni habla con ningún proveedor: existe para
 * ejercitar el flujo hasta la autorización mientras se elige la pasarela real (D-02). Sus
 * referencias empiezan por «sim_» y sus resultados llevan `simulated: true`.
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

interface Operation {
  readonly key: string;
  readonly result: PaymentResult;
  readonly amount: PaymentAmount;
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

export function createSimulatedPaymentGateway(projectId: string | undefined): PaymentGateway {
  assertSimulatedPaymentsAllowed(projectId);
  // En memoria de la instancia: suficiente para una simulación; un proveedor real guarda el estado.
  const byKey = new Map<string, Operation>();
  const byRef = new Map<string, Operation>();
  let sequence = 0;

  const store = (key: string, status: PaymentStatus, amount: PaymentAmount): PaymentResult => {
    sequence += 1;
    const result = {
      status,
      paymentRef: `sim_${Date.now().toString(36)}_${sequence}`,
      simulated: true,
    };
    const operation = { key, result, amount };
    byKey.set(key, operation);
    byRef.set(result.paymentRef, operation);
    return result;
  };

  const transition = (paymentRef: string, from: PaymentStatus[], to: PaymentStatus) => {
    const operation = byRef.get(paymentRef);
    if (!operation || !from.includes(operation.result.status)) {
      throw new Error(`Operación simulada no válida: ${paymentRef} no está en ${from.join(' o ')}`);
    }
    const result = { ...operation.result, status: to };
    const updated = { ...operation, result };
    byRef.set(paymentRef, updated);
    byKey.set(operation.key, updated);
    return result;
  };

  return {
    simulated: true,
    async authorize(request: AuthorizeRequest) {
      const previous = byKey.get(request.idempotencyKey);
      if (previous) return previous.result;
      switch (request.simulatedOutcome ?? 'approved') {
        case 'approved':
          return store(request.idempotencyKey, 'authorized', request.amount);
        case 'declined':
          return store(request.idempotencyKey, 'declined', request.amount);
        case 'requires_action':
          // Simula un paso adicional (p. ej. 3-D Secure) sin completarlo: no se guarda.
          return { status: 'requires_action', paymentRef: 'sim_requires_action', simulated: true };
        case 'timeout':
          // Simula una respuesta perdida: la autorización existe, pero quien llama no la recibe.
          store(request.idempotencyKey, 'authorized', request.amount);
          throw new PaymentTimeoutError(request.idempotencyKey);
      }
    },
    async status(idempotencyKey) {
      return byKey.get(idempotencyKey)?.result ?? null;
    },
    async capture(paymentRef) {
      return transition(paymentRef, ['authorized'], 'captured');
    },
    async voidAuthorization(paymentRef) {
      return transition(paymentRef, ['authorized'], 'voided');
    },
    async refund(paymentRef) {
      return transition(paymentRef, ['captured'], 'refunded');
    },
  };
}
