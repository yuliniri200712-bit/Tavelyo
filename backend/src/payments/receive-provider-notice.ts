import { createHash } from 'node:crypto';
import type { PaymentGateway, WebhookRejection } from '@tavelyo/contracts';
import type { ProviderEventStore } from './ledger.ts';
import type { NoticeOutcome, PaymentProcessor } from './payment-processor.ts';

/**
 * Recibe un aviso (webhook) de la pasarela (Fase 4, bloque 3; caso 8):
 * 1. verifica la firma y la antigüedad con el cuerpo tal como llegó; sin eso, no se usa nada;
 * 2. lo guarda una sola vez por (proveedor, id del aviso): los repetidos no se procesan otra vez;
 * 3. lo contrasta con la operación propia y lo aplica sin retroceder un estado cerrado.
 * Responde rápido: el aviso nunca hace cobros nuevos, solo confirma o rechaza operaciones propias.
 */

/** Tamaño máximo del cuerpo de un aviso: uno mayor no viene de la pasarela. */
export const MAX_NOTICE_BYTES = 64 * 1024;

export type NoticeReply =
  /** 200: procesado, repetido o sin relación (no hace falta que la pasarela lo repita). */
  | { readonly status: 200; readonly outcome: NoticeOutcome | 'duplicate' }
  /** 400: firma inválida, vencido, mal formado, demasiado grande o mismo id con otro cuerpo. */
  | {
      readonly status: 400;
      readonly reason: WebhookRejection | 'too-large' | 'conflict';
    };

export interface ReceiveProviderNoticeDeps {
  readonly gateway: PaymentGateway;
  readonly events: ProviderEventStore;
  readonly processor: Pick<PaymentProcessor, 'applyNotice'>;
  readonly now: () => Date;
}

export function createReceiveProviderNotice(deps: ReceiveProviderNoticeDeps) {
  return async (
    rawBody: string,
    header: (name: string) => string | undefined,
  ): Promise<NoticeReply> => {
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_NOTICE_BYTES) {
      return { status: 400, reason: 'too-large' };
    }
    const verified = deps.gateway.verifyWebhook(rawBody, header, deps.now());
    if (!verified.ok) return { status: 400, reason: verified.reason };
    const { notice } = verified;

    // Se guarda la huella del cuerpo, no el cuerpo: puede traer datos que no hacen falta.
    const recorded = await deps.events.record({
      provider: deps.gateway.provider,
      eventId: notice.eventId,
      type: notice.type,
      payloadHash: createHash('sha256').update(rawBody).digest('hex'),
      providerRef: notice.paymentRef,
    });
    if (recorded.state === 'conflict') return { status: 400, reason: 'conflict' };
    if (recorded.state === 'done' || !recorded.id) return { status: 200, outcome: 'duplicate' };

    // «pending»: llegó antes, pero no terminó; aplicarlo es idempotente, así que se repite.
    const { outcome, tenantId } = await deps.processor.applyNotice(notice);
    await deps.events.finish(recorded.id, outcome, tenantId);
    return { status: 200, outcome };
  };
}

export type ReceiveProviderNotice = ReturnType<typeof createReceiveProviderNotice>;
