import { err, ok } from '@tavelyo/core';
import type { BillScope } from '@tavelyo/contracts';
import type { Actor } from '../shared/outcome.ts';
import { failure } from '../shared/outcome.ts';
import { canonicalUuid, type Clock } from '../shared/clock.ts';
import { isUuid, readFields } from '../shared/input.ts';
import type { RateLimiter } from '../shared/rate-limit.ts';
import { createQuoteOrder, type QuoteContext, type QuoteStore } from './quote-order.ts';
import type { KitchenDispatcher } from './send-to-kitchen.ts';

interface Dependencies {
  context(scope: BillScope, person: string, uid: string): Promise<QuoteContext | null>;
  quotes(uid: string): QuoteStore;
  dispatch: KitchenDispatcher;
  limiter: RateLimiter;
  clock: Clock;
}
export function createStaffOrder(deps: Dependencies) {
  return async (actor: Actor, data: unknown) => {
    const input = readFields(data, [
      'tenantId',
      'branchId',
      'participantId',
      'sessionId',
      'lines',
      'expectedTotalMinor',
      'idempotencyKey',
    ]);
    if (!input.ok) return err(failure('invalid-argument', input.error));
    const { tenantId, branchId, participantId, ...request } = input.value;
    if (!isUuid(tenantId) || !isUuid(branchId) || !isUuid(participantId))
      return err(failure('invalid-argument', 'Revisa la mesa y la persona.'));
    const person = canonicalUuid(participantId);
    const quotes = deps.quotes(actor.uid);
    const quote = createQuoteOrder({
      clock: deps.clock,
      limiter: deps.limiter,
      quotes: {
        ...quotes,
        context: (sessionId) => deps.context({ tenantId, branchId, sessionId }, person, actor.uid),
      },
    });
    const result = await quote(actor, request);
    if (!result.ok) return result;
    const summary = result.value;
    if (summary.outcome !== 'quoted') return ok(summary);
    if (summary.status === 'EXPIRED')
      return err(failure('failed-precondition', 'Revisa el pedido otra vez.'));
    if (!isUuid(request.sessionId)) return err(failure('invalid-argument', 'Revisa la mesa.'));
    const sent = await deps.dispatch(
      {
        id: summary.quoteId,
        tenantId,
        branchId,
        sessionId: canonicalUuid(request.sessionId),
        participantId: person,
        lines: summary.summary.lines,
      },
      actor.uid,
      'DIRECT',
    );
    if (sent.kind !== 'sent')
      return err(
        failure('failed-precondition', 'La comanda no se pudo enviar. Actualiza la mesa.'),
      );
    return ok({ outcome: 'sent' as const, orderId: sent.orderId });
  };
}
