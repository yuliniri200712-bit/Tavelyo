import { describe, expect, it, vi } from 'vitest';
import type { Actor } from '../shared/outcome.ts';
import { RATE_LIMITS, type RateLimitRule } from '../shared/rate-limit.ts';
import {
  createRequestService,
  parseRequestServiceInput,
  type ServiceParticipant,
  type ServiceRequestStore,
} from './request-service.ts';

const actor: Actor = { uid: 'cliente', claims: { sub: 'cliente' }, authTimeSeconds: 1 };
const SESSION = 'a'.repeat(32);
const seated: ServiceParticipant = { participantId: 'p', tenantId: 't', branchId: 'b' };

function setup(
  participant: ServiceParticipant | null = seated,
  created: Awaited<ReturnType<ServiceRequestStore['create']>> = 'created',
  admit: (rule: RateLimitRule) => boolean = () => true,
) {
  const requests = {
    participant: vi.fn(async () => participant),
    create: vi.fn(async () => created),
  } satisfies ServiceRequestStore;
  const request = createRequestService({
    requests,
    limiter: { admit: async (rule) => admit(rule) },
  });
  return { requests, request };
}

describe('requestService', () => {
  it('valida la mesa y el tipo de solicitud', () => {
    expect(parseRequestServiceInput({ sessionId: SESSION, kind: 'call_waiter' }).ok).toBe(true);
    expect(parseRequestServiceInput({ sessionId: SESSION, kind: 'request_bill' }).ok).toBe(true);
    expect(parseRequestServiceInput({ sessionId: SESSION, kind: 'propina' }).ok).toBe(false);
    expect(parseRequestServiceInput({ sessionId: 'x', kind: 'call_waiter' }).ok).toBe(false);
    expect(
      parseRequestServiceInput({ sessionId: SESSION, kind: 'call_waiter', tableId: 'x' }).ok,
    ).toBe(false);
  });

  it('avisa al personal; si ya había un aviso igual sin atender, no crea otro', async () => {
    const sent = setup();
    expect(await sent.request(actor, { sessionId: SESSION, kind: 'request_bill' })).toEqual({
      ok: true,
      value: { status: 'sent' },
    });
    expect(sent.requests.create).toHaveBeenCalledWith(seated, SESSION, 'cliente', 'request_bill');

    const repeated = setup(seated, 'already-pending');
    expect(await repeated.request(actor, { sessionId: SESSION, kind: 'call_waiter' })).toEqual({
      ok: true,
      value: { status: 'already-pending' },
    });
  });

  it('quien no está en una mesa abierta no avisa', async () => {
    for (const { request } of [setup(null), setup(seated, 'not-seated')]) {
      expect(await request(actor, { sessionId: SESSION, kind: 'call_waiter' })).toMatchObject({
        ok: false,
        error: { code: 'not-found' },
      });
    }
  });

  it('aplica los límites por persona y por mesa (T11)', async () => {
    for (const blocked of [RATE_LIMITS.servicePerUser, RATE_LIMITS.servicePerSession]) {
      const { request, requests } = setup(seated, 'created', (rule) => rule !== blocked);
      expect(await request(actor, { sessionId: SESSION, kind: 'call_waiter' })).toMatchObject({
        ok: false,
        error: { code: 'resource-exhausted' },
      });
      expect(requests.create).not.toHaveBeenCalled();
    }
  });
});
