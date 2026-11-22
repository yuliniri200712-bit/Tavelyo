import { err, ok } from '@tavelyo/core';
import type { JoinTableSessionRequest, JoinTableSessionResponse } from '@tavelyo/contracts';
import { canonicalUuid, type Clock } from '../shared/clock.ts';
import { isUuid, readFields } from '../shared/input.ts';
import { failure, type Actor, type Outcome } from '../shared/outcome.ts';
import { RATE_LIMITED_MESSAGE, RATE_LIMITS, type RateLimiter } from '../shared/rate-limit.ts';

/** Una participación dura como máximo esto; cerrar la mesa la termina antes (ADR-0011). */
export const PARTICIPATION_TTL_MS = 4 * 60 * 60 * 1000;
/** Personas conectadas a la vez en una mesa: acota el abuso de un QR fotografiado (T11). */
export const MAX_ACTIVE_PARTICIPANTS = 20;

export interface ParticipantRecord {
  readonly id: string;
  readonly expiresAt: Date;
  readonly removed: boolean;
}

export interface OpenTable {
  readonly tableId: string;
  readonly tenantId: string;
  readonly branchId: string;
  readonly code: string;
  /** null si el mesero todavía no la abrió (D-21). */
  readonly session: {
    readonly id: string;
    /** Participación de quien se une, si ya la tenía (vigente, vencida o expulsada). */
    readonly mine: ParticipantRecord | null;
    /** Participaciones vigentes de la sesión. */
    readonly activeCount: number;
  } | null;
}

/** Participación vigente de quien escanea en una sesión abierta de la sucursal (traslado, D-42). */
export interface MovedParticipation {
  readonly sessionId: string;
  readonly participantId: string;
  readonly expiresAt: Date;
  /** Código de la mesa a la que se trasladó la sesión. */
  readonly tableCode: string;
}

export interface NewParticipant {
  readonly tenantId: string;
  readonly branchId: string;
  readonly sessionId: string;
  readonly authUid: string;
  readonly expiresAt: Date;
}

export interface TableSessionStore {
  /** Mesa activa del QR (null si no existe, está archivada o su sucursal o empresa no operan). */
  openTableByQr(qrPublicId: string, authUid: string): Promise<OpenTable | null>;
  /** Devuelve el id del participante, o null si ya existía (doble pulsación simultánea). */
  insertParticipant(participant: NewParticipant): Promise<string | null>;
  renewParticipant(participantId: string, expiresAt: Date): Promise<void>;
  /** Participación vigente y propia en una sesión abierta de la empresa y sucursal; null si no hay. */
  myOpenParticipation(
    tenantId: string,
    branchId: string,
    authUid: string,
  ): Promise<MovedParticipation | null>;
}

export interface JoinTableSessionDeps {
  readonly sessions: TableSessionStore;
  readonly limiter: RateLimiter;
  readonly clock: Clock;
}

export function parseJoinTableSessionInput(data: unknown): Outcome<JoinTableSessionRequest> {
  const fields = readFields(data, ['qrPublicId']);
  if (!fields.ok) return err(failure('invalid-argument', fields.error));
  const { qrPublicId } = fields.value;
  if (!isUuid(qrPublicId)) {
    return err(failure('invalid-argument', 'El código QR no es válido.'));
  }
  return ok({ qrPublicId: canonicalUuid(qrPublicId) });
}

const NOT_A_TABLE = 'Este código QR no corresponde a ninguna mesa activa.';
const NOT_OPEN = 'La mesa todavía no está abierta. Pide al mesero que la abra.';
const REMOVED = 'El personal te retiró de esta mesa. Si es un error, habla con el mesero.';
const FULL = 'La mesa alcanzó el máximo de personas conectadas. Pide ayuda al mesero.';

/**
 * Une a quien escaneó el QR a la sesión abierta de esa mesa (ADR-0011). Es idempotente: volver a
 * escanear devuelve la misma participación y, si venció con la mesa abierta, la renueva. Nadie
 * expulsado vuelve a entrar con la misma cuenta. Si la mesa quedó libre porque su sesión se
 * trasladó (D-42), quien seguía en ella vuelve a su sesión con el código de la mesa nueva.
 */
export function createJoinTableSession(deps: JoinTableSessionDeps) {
  return async (actor: Actor, data: unknown): Promise<Outcome<JoinTableSessionResponse>> => {
    const input = parseJoinTableSessionInput(data);
    if (!input.ok) return input;
    const { qrPublicId } = input.value;

    if (
      !(await deps.limiter.admit(RATE_LIMITS.joinPerUser, actor.uid)) ||
      !(await deps.limiter.admit(RATE_LIMITS.joinPerTable, qrPublicId))
    ) {
      return err(failure('resource-exhausted', RATE_LIMITED_MESSAGE));
    }

    const table = await deps.sessions.openTableByQr(qrPublicId, actor.uid);
    if (!table) return err(failure('not-found', NOT_A_TABLE));
    const now = deps.clock.now();
    if (!table.session) {
      const moved = await deps.sessions.myOpenParticipation(
        table.tenantId,
        table.branchId,
        actor.uid,
      );
      if (!moved || moved.expiresAt <= now) return err(failure('failed-precondition', NOT_OPEN));
      return ok({
        sessionId: moved.sessionId,
        branchId: table.branchId,
        participantId: moved.participantId,
        tableCode: moved.tableCode,
        expiresAt: moved.expiresAt.toISOString(),
        transferred: true,
      });
    }
    const session = table.session;

    const expiresAt = new Date(now.getTime() + PARTICIPATION_TTL_MS);
    const respond = (participantId: string, until: Date) =>
      ok({
        sessionId: session.id,
        branchId: table.branchId,
        participantId,
        tableCode: table.code,
        expiresAt: until.toISOString(),
      });

    const mine = session.mine;
    if (mine?.removed) return err(failure('permission-denied', REMOVED));
    if (mine && mine.expiresAt > now) return respond(mine.id, mine.expiresAt);
    if (mine) {
      await deps.sessions.renewParticipant(mine.id, expiresAt);
      return respond(mine.id, expiresAt);
    }

    if (session.activeCount >= MAX_ACTIVE_PARTICIPANTS) {
      return err(failure('resource-exhausted', FULL));
    }

    const inserted = await deps.sessions.insertParticipant({
      tenantId: table.tenantId,
      branchId: table.branchId,
      sessionId: session.id,
      authUid: actor.uid,
      expiresAt,
    });
    if (inserted) return respond(inserted, expiresAt);

    // Otra solicitud de la misma persona la creó a la vez: se devuelve esa.
    const again = await deps.sessions.openTableByQr(qrPublicId, actor.uid);
    const raced = again?.session?.mine;
    if (!raced || raced.removed) return err(failure('failed-precondition', NOT_OPEN));
    return respond(raced.id, raced.expiresAt);
  };
}
