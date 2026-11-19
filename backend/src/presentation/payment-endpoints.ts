import { onRequest } from 'firebase-functions/https';
import { onSchedule } from 'firebase-functions/scheduler';
import type { ReceiveProviderNotice } from '../payments/receive-provider-notice.ts';
import type { ReconcileLog, ReconcileReport } from '../payments/reconcile-payments.ts';

/** Petición mínima que usa el aviso (la de Express en Cloud Functions). */
export interface WebhookRequest {
  readonly method: string;
  readonly rawBody?: Buffer;
  get(name: string): string | undefined;
}

/** Respuesta mínima que usa el aviso (la de Express en Cloud Functions). */
export interface WebhookResponse {
  status(code: number): WebhookResponse;
  set(field: string, value: string): WebhookResponse;
  json(body: unknown): void;
  end(): void;
}

export interface EndpointLog extends ReconcileLog {
  info(message: string, data: Readonly<Record<string, unknown>>): void;
}

/**
 * Aviso de la pasarela (webhook). Solo POST; el cuerpo se verifica tal como llegó (rawBody). La
 * respuesta no explica por qué se rechazó: el motivo queda en el registro, sin el cuerpo.
 */
export function handlePaymentWebhook(receive: ReceiveProviderNotice, log: EndpointLog) {
  return async (request: WebhookRequest, response: WebhookResponse): Promise<void> => {
    if (request.method !== 'POST') {
      response.status(405).set('Allow', 'POST').end();
      return;
    }
    try {
      const rawBody = request.rawBody?.toString('utf8') ?? '';
      const reply = await receive(rawBody, (name) => request.get(name) ?? undefined);
      if (reply.status === 400) {
        log.warn('Aviso de la pasarela rechazado', { reason: reply.reason });
        response.status(400).json({ error: 'rejected' });
        return;
      }
      response.status(200).json({ received: true });
    } catch (error) {
      // 500: la pasarela lo repetirá; procesarlo otra vez es idempotente.
      log.error('Error al procesar un aviso de la pasarela', {
        error: error instanceof Error ? error.message : String(error),
      });
      response.status(500).json({ error: 'internal' });
    }
  };
}

export function createPaymentEndpoints(deps: {
  readonly receiveNotice: ReceiveProviderNotice;
  readonly reconcile: () => Promise<ReconcileReport>;
  readonly log: EndpointLog;
}) {
  return {
    // Sin App Check ni sesión: lo llama la pasarela; la firma es la autenticación.
    paymentWebhook: onRequest({}, handlePaymentWebhook(deps.receiveNotice, deps.log)),
    // Cloud Scheduler en producción (tarea de despliegue aprobada); en los emuladores no se dispara
    // solo y las pruebas llaman al caso de uso directamente.
    reconcilePayments: onSchedule(
      { schedule: 'every 5 minutes', timeZone: 'America/Bogota', retryCount: 0 },
      async () => {
        deps.log.info('Conciliación de pagos', { ...(await deps.reconcile()) });
      },
    ),
  };
}
