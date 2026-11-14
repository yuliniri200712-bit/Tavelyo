import { err, ok } from '@tavelyo/core';
import { describe, expect, it, vi } from 'vitest';
import { failure, type Actor } from '../shared/outcome.ts';
import {
  createRevokeMember,
  parseRevokeMemberInput,
  type RevokeMemberDeps,
} from './revoke-member.ts';

const actor: Actor = { uid: 'owner-a', claims: { sub: 'owner-a' }, authTimeSeconds: 1 };
const TENANT = '7f3c2a1e-9b4d-4c8e-a1f2-3b4c5d6e7f80';
const input = { tenantId: TENANT, userId: 'waiter-a' };

function deps(overrides: Partial<{ revoke: boolean; otherActive: boolean }> = {}) {
  const { revoke = true, otherActive = false } = overrides;
  return {
    memberships: {
      revokeAs: vi.fn(async () =>
        revoke
          ? ok(undefined)
          : err(failure('permission-denied', 'No puedes revocar a este miembro.')),
      ),
    },
    directory: { hasActiveMembership: vi.fn(async () => otherActive) },
    sessions: { revokeSessions: vi.fn(async () => undefined) },
    audit: { record: vi.fn(async () => undefined) },
  } satisfies RevokeMemberDeps;
}

describe('parseRevokeMemberInput', () => {
  it('acepta empresa, usuario y motivo opcional', () => {
    expect(parseRevokeMemberInput(input)).toEqual(ok(input));
    expect(parseRevokeMemberInput({ ...input, reason: '  Dejó el restaurante ' })).toEqual(
      ok({ ...input, reason: 'Dejó el restaurante' }),
    );
    expect(parseRevokeMemberInput({ ...input, reason: null })).toEqual(ok(input));
    // Formato con el que SQL Connect devuelve los UUID a las apps.
    const compact = { ...input, tenantId: TENANT.replaceAll('-', '') };
    expect(parseRevokeMemberInput(compact)).toEqual(ok(compact));
  });

  it.each([
    ['sin datos', null],
    ['una lista', [TENANT, 'waiter-a']],
    ['empresa que no es UUID', { ...input, tenantId: 'empresa-a' }],
    ['empresa con inyección', { ...input, tenantId: `${TENANT}" } }` }],
    ['usuario vacío', { ...input, userId: '' }],
    ['usuario con caracteres no válidos', { ...input, userId: 'a/b' }],
    ['usuario de más de 128 caracteres', { ...input, userId: 'a'.repeat(129) }],
    ['motivo demasiado largo', { ...input, reason: 'x'.repeat(501) }],
    ['campos no admitidos', { ...input, roleCode: 'tenant_owner' }],
  ])('rechaza %s', (_case, data) => {
    const result = parseRevokeMemberInput(data);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('invalid-argument');
  });
});

describe('createRevokeMember', () => {
  it('revoca como quien llama y cierra las sesiones si no le quedan membresías', async () => {
    const d = deps();
    const result = await createRevokeMember(d)(actor, { ...input, reason: 'Fin de contrato' });

    expect(result).toEqual(ok({ sessionsRevoked: true }));
    expect(d.memberships.revokeAs).toHaveBeenCalledWith(actor, {
      ...input,
      reason: 'Fin de contrato',
    });
    expect(d.sessions.revokeSessions).toHaveBeenCalledWith('waiter-a');
    expect(d.audit.record).toHaveBeenCalledWith({
      tenantId: TENANT,
      actorId: 'owner-a',
      operation: 'auth.sessions_revoked',
      resourceType: 'user',
      resourceId: 'waiter-a',
    });
  });

  it('no cierra las sesiones si conserva otra membresía activa', async () => {
    const d = deps({ otherActive: true });
    expect(await createRevokeMember(d)(actor, input)).toEqual(ok({ sessionsRevoked: false }));
    expect(d.sessions.revokeSessions).not.toHaveBeenCalled();
    expect(d.audit.record).not.toHaveBeenCalled();
  });

  it('si el conector la rechaza, no toca sesiones ni consulta otras empresas', async () => {
    const d = deps({ revoke: false });
    const result = await createRevokeMember(d)(actor, input);

    expect(result).toEqual(err(failure('permission-denied', 'No puedes revocar a este miembro.')));
    expect(d.directory.hasActiveMembership).not.toHaveBeenCalled();
    expect(d.sessions.revokeSessions).not.toHaveBeenCalled();
  });

  it('una entrada no válida no llega al conector', async () => {
    const d = deps();
    const result = await createRevokeMember(d)(actor, { tenantId: 'x', userId: 'y' });
    expect(result.ok).toBe(false);
    expect(d.memberships.revokeAs).not.toHaveBeenCalled();
  });
});
