import { describe, expect, it, vi } from 'vitest';
import type { Actor } from '../shared/outcome.ts';
import { RATE_LIMITS } from '../shared/rate-limit.ts';
import {
  createJoinTableSession,
  MAX_ACTIVE_PARTICIPANTS,
  parseJoinTableSessionInput,
  type OpenTable,
  type ParticipantRecord,
  type TableSessionStore,
} from './join-table-session.ts';

const actor: Actor = {
  uid: 'cliente-anonimo',
  claims: { sub: 'cliente-anonimo' },
  authTimeSeconds: 1,
};
const QR = '1'.repeat(32);
const NOW = new Date('2026-11-13T18:00:00Z');
const IN_FOUR_HOURS = '2026-11-13T22:00:00.000Z';

function table(session: OpenTable['session']): OpenTable {
  return {
    tableId: '2'.repeat(32),
    tenantId: '3'.repeat(32),
    branchId: '4'.repeat(32),
    code: 'M1',
    session,
  };
}
const openSession = (mine: ParticipantRecord | null = null, activeCount = 0) =>
  table({ id: '5'.repeat(32), mine, activeCount });

function setup(found: OpenTable | null, options: { insert?: string | null; admit?: boolean } = {}) {
  const sessions = {
    openTableByQr: vi.fn(async () => found),
    insertParticipant: vi.fn(async () =>
      options.insert === undefined ? 'p-nuevo' : options.insert,
    ),
    renewParticipant: vi.fn(async () => undefined),
  } satisfies TableSessionStore;
  const limiter = { admit: vi.fn(async () => options.admit ?? true) };
  const join = createJoinTableSession({ sessions, limiter, clock: { now: () => NOW } });
  return { sessions, limiter, join };
}

describe('parseJoinTableSessionInput', () => {
  it('acepta solo el qrPublicId y lo normaliza', () => {
    expect(
      parseJoinTableSessionInput({ qrPublicId: '11111111-1111-1111-1111-111111111111' }),
    ).toEqual({
      ok: true,
      value: { qrPublicId: QR },
    });
    for (const data of [null, {}, { qrPublicId: 'mesa-1' }, { qrPublicId: QR, tableId: QR }]) {
      expect(parseJoinTableSessionInput(data).ok).toBe(false);
    }
  });
});

describe('joinTableSession', () => {
  it('crea la participación con vencimiento a 4 horas', async () => {
    const { join, sessions } = setup(openSession());
    expect(await join(actor, { qrPublicId: QR })).toEqual({
      ok: true,
      value: {
        sessionId: '5'.repeat(32),
        participantId: 'p-nuevo',
        tableCode: 'M1',
        expiresAt: IN_FOUR_HOURS,
      },
    });
    expect(sessions.insertParticipant).toHaveBeenCalledWith(
      expect.objectContaining({
        authUid: actor.uid,
        sessionId: '5'.repeat(32),
        tenantId: '3'.repeat(32),
      }),
    );
  });

  it('QR desconocido y mesa sin abrir (D-21)', async () => {
    expect(await setup(null).join(actor, { qrPublicId: QR })).toMatchObject({
      ok: false,
      error: { code: 'not-found' },
    });
    expect(await setup(table(null)).join(actor, { qrPublicId: QR })).toMatchObject({
      ok: false,
      error: { code: 'failed-precondition', message: expect.stringContaining('mesero') },
    });
  });

  it('volver a escanear devuelve la misma participación; si venció, la renueva', async () => {
    const valid = { id: 'p-1', expiresAt: new Date('2026-11-13T19:00:00Z'), removed: false };
    const again = setup(openSession(valid, 1));
    expect(await again.join(actor, { qrPublicId: QR })).toMatchObject({
      ok: true,
      value: { participantId: 'p-1' },
    });
    expect(again.sessions.insertParticipant).not.toHaveBeenCalled();

    const expired = setup(openSession({ ...valid, expiresAt: new Date('2026-11-13T17:00:00Z') }));
    expect(await expired.join(actor, { qrPublicId: QR })).toMatchObject({
      ok: true,
      value: { participantId: 'p-1', expiresAt: IN_FOUR_HOURS },
    });
    expect(expired.sessions.renewParticipant).toHaveBeenCalledWith('p-1', new Date(IN_FOUR_HOURS));
  });

  it('quien fue expulsado no vuelve a entrar con la misma cuenta', async () => {
    const removed = { id: 'p-1', expiresAt: new Date('2026-11-13T19:00:00Z'), removed: true };
    const { join, sessions } = setup(openSession(removed));
    expect(await join(actor, { qrPublicId: QR })).toMatchObject({
      ok: false,
      error: { code: 'permission-denied' },
    });
    expect(sessions.renewParticipant).not.toHaveBeenCalled();
  });

  it('mesa llena', async () => {
    const { join } = setup(openSession(null, MAX_ACTIVE_PARTICIPANTS));
    expect(await join(actor, { qrPublicId: QR })).toMatchObject({
      ok: false,
      error: { code: 'resource-exhausted' },
    });
  });

  it('límites por persona y por mesa antes de leer la mesa', async () => {
    const { join, sessions, limiter } = setup(openSession(), { admit: false });
    expect(await join(actor, { qrPublicId: QR })).toMatchObject({
      ok: false,
      error: { code: 'resource-exhausted' },
    });
    expect(limiter.admit).toHaveBeenCalledWith(RATE_LIMITS.joinPerUser, actor.uid);
    expect(sessions.openTableByQr).not.toHaveBeenCalled();
  });

  it('doble pulsación simultánea: devuelve la que creó la otra solicitud', async () => {
    const { join, sessions } = setup(openSession(), { insert: null });
    sessions.openTableByQr
      .mockResolvedValueOnce(openSession())
      .mockResolvedValueOnce(
        openSession({ id: 'p-otra', expiresAt: new Date(IN_FOUR_HOURS), removed: false }, 1),
      );
    expect(await join(actor, { qrPublicId: QR })).toMatchObject({
      ok: true,
      value: { participantId: 'p-otra' },
    });
  });
});
