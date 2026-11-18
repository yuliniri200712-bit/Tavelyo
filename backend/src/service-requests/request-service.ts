import { err, ok } from '@tavelyo/core';
import type {
  RequestServiceRequest,
  RequestServiceResponse,
  ServiceRequestKind,
} from '@tavelyo/contracts';
import { canonicalUuid } from '../shared/clock.ts';
import { isUuid, readFields } from '../shared/input.ts';
import { failure, type Actor, type Outcome } from '../shared/outcome.ts';
import { RATE_LIMITED_MESSAGE, RATE_LIMITS, type RateLimiter } from '../shared/rate-limit.ts';

/** Participación vigente de quien llama en una sesión abierta. */
export interface ServiceParticipant {
  readonly participantId: string;
  readonly tenantId: string;
  readonly branchId: string;
}

export interface ServiceRequestStore {
  participant(sessionId: string, authUid: string): Promise<ServiceParticipant | null>;
  /**
   * Crea la solicitud pendiente. already-pending: la mesa ya tenía una del mismo tipo sin
   * atender; not-seated: la mesa o la participación dejaron de estar vigentes entretanto.
   */
  create(
    participant: ServiceParticipant,
    sessionId: string,
    authUid: string,
    kind: ServiceRequestKind,
  ): Promise<'created' | 'already-pending' | 'not-seated'>;
}

export interface RequestServiceDeps {
  readonly requests: ServiceRequestStore;
  readonly limiter: RateLimiter;
}

const KINDS: readonly ServiceRequestKind[] = ['call_waiter', 'request_bill'];
const NOT_SEATED = 'No encontramos tu mesa abierta. Vuelve a escanear el código QR.';

export function parseRequestServiceInput(data: unknown): Outcome<RequestServiceRequest> {
  const fields = readFields(data, ['sessionId', 'kind']);
  if (!fields.ok) return err(failure('invalid-argument', fields.error));
  const { sessionId, kind } = fields.value;
  if (!isUuid(sessionId)) return err(failure('invalid-argument', 'La mesa no es válida.'));
  if (!KINDS.includes(kind as ServiceRequestKind)) {
    return err(failure('invalid-argument', 'La solicitud no es válida.'));
  }
  return ok({ sessionId: canonicalUuid(sessionId), kind: kind as ServiceRequestKind });
}

/**
 * «Llamar al mesero» y «Pedir la cuenta» (Fase 3). Solo para quien sigue en una mesa abierta, con
 * límites por persona y por mesa (riesgo T11). Repetir un aviso que el personal todavía no atendió
 * no crea otro: responde que ya está pendiente. Pedir la cuenta solo avisa al mesero (Fase 4).
 */
export function createRequestService(deps: RequestServiceDeps) {
  return async (actor: Actor, data: unknown): Promise<Outcome<RequestServiceResponse>> => {
    const input = parseRequestServiceInput(data);
    if (!input.ok) return input;
    const { sessionId, kind } = input.value;

    const participant = await deps.requests.participant(sessionId, actor.uid);
    if (!participant) return err(failure('not-found', NOT_SEATED));

    const admitted =
      (await deps.limiter.admit(RATE_LIMITS.servicePerUser, actor.uid)) &&
      (await deps.limiter.admit(RATE_LIMITS.servicePerSession, sessionId));
    if (!admitted) return err(failure('resource-exhausted', RATE_LIMITED_MESSAGE));

    const created = await deps.requests.create(participant, sessionId, actor.uid, kind);
    if (created === 'not-seated') return err(failure('not-found', NOT_SEATED));
    return ok({ status: created === 'created' ? 'sent' : 'already-pending' });
  };
}
