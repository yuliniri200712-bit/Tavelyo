import { err, ok } from '@tavelyo/core';
import { isUid, isUuid, readFields, readOptionalText } from '../shared/input.ts';
import { failure, type Actor, type Outcome } from '../shared/outcome.ts';

export interface RevokeMemberInput {
  readonly tenantId: string;
  readonly userId: string;
  readonly reason?: string;
}

/** Revoca la membresía como el usuario que llama: aplican sus reglas del conector (ADR-0008 §7). */
export interface MembershipCommands {
  revokeAs(actor: Actor, input: RevokeMemberInput): Promise<Outcome<void>>;
}

/** Consulta de sistema: ¿le queda alguna membresía activa en cualquier empresa? */
export interface MembershipDirectory {
  hasActiveMembership(userId: string): Promise<boolean>;
}

/** Cierra todas las sesiones del usuario (revoca sus refresh tokens). */
export interface SessionRevoker {
  revokeSessions(userId: string): Promise<void>;
}

export interface AuditEntry {
  readonly tenantId: string;
  readonly actorId: string;
  readonly operation: string;
  readonly resourceType: string;
  readonly resourceId: string;
}

export interface AuditLog {
  record(entry: AuditEntry): Promise<void>;
}

export interface RevokeMemberDeps {
  readonly memberships: MembershipCommands;
  readonly directory: MembershipDirectory;
  readonly sessions: SessionRevoker;
  readonly audit: AuditLog;
}

export interface RevokeMemberResult {
  /** true si se cerraron sus sesiones; false si conserva otra membresía activa. */
  readonly sessionsRevoked: boolean;
}

export function parseRevokeMemberInput(data: unknown): Outcome<RevokeMemberInput> {
  const fields = readFields(data, ['tenantId', 'userId', 'reason']);
  if (!fields.ok) return err(failure('invalid-argument', fields.error));
  const { tenantId, userId } = fields.value;
  if (!isUuid(tenantId)) return err(failure('invalid-argument', 'La empresa no es válida.'));
  if (!isUid(userId)) return err(failure('invalid-argument', 'El usuario no es válido.'));
  const reason = readOptionalText(fields.value, 'reason', { label: 'el motivo', min: 1, max: 500 });
  if (!reason.ok) return err(failure('invalid-argument', reason.error));
  return ok(
    reason.value === undefined ? { tenantId, userId } : { tenantId, userId, reason: reason.value },
  );
}

/**
 * Revoca a un miembro. La membresía deja de servir en su siguiente operación (la base es la
 * autoridad); si no le quedan membresías activas, además se cierran todas sus sesiones.
 */
export function createRevokeMember(deps: RevokeMemberDeps) {
  return async (actor: Actor, data: unknown): Promise<Outcome<RevokeMemberResult>> => {
    const input = parseRevokeMemberInput(data);
    if (!input.ok) return input;

    const revoked = await deps.memberships.revokeAs(actor, input.value);
    if (!revoked.ok) return revoked;

    if (await deps.directory.hasActiveMembership(input.value.userId)) {
      return ok({ sessionsRevoked: false });
    }
    await deps.sessions.revokeSessions(input.value.userId);
    await deps.audit.record({
      tenantId: input.value.tenantId,
      actorId: actor.uid,
      operation: 'auth.sessions_revoked',
      resourceType: 'user',
      resourceId: input.value.userId,
    });
    return ok({ sessionsRevoked: true });
  };
}
