import { closeCashCount, err, expectedCash, formatMoney, Money, ok } from '@tavelyo/core';
import type {
  CashSessionResponse,
  CloseCashSessionResponse,
  ReadCashSessionResponse,
} from '@tavelyo/contracts';
import { newId } from '../shared/clock.ts';
import { failure, type Actor, type Outcome } from '../shared/outcome.ts';
import { parseClose, parseMovement, parseOpen, parseRead, readReason } from './input.ts';
import type { CashMovementRow, CashSessionRow, CashStore } from './store.ts';

// Caja de la sucursal (Fase 4, bloque 5, RF-PA-07, D-40). El servidor es la autoridad del efectivo
// esperado y del conteo; la interfaz solo lo muestra.

const cop = (minor: string | bigint) => Money.ofMinor(BigInt(minor), 'COP');
const sum = (rows: readonly CashMovementRow[], kind: CashMovementRow['kind']) =>
  rows.filter((m) => m.kind === kind).reduce((total, m) => total + BigInt(m.amountMinor), 0n);

/** Efectivo esperado del turno: fondo inicial más entradas y ventas, menos salidas y reembolsos. */
export function sessionExpected(session: Pick<CashSessionRow, 'openingFloatMinor' | 'movements'>) {
  return expectedCash(
    cop(session.openingFloatMinor),
    session.movements.map((m) => ({ kind: m.kind, amount: cop(m.amountMinor) })),
  );
}

export function toResponse(session: CashSessionRow): CashSessionResponse {
  return {
    cashSessionId: session.id,
    registerId: session.registerId,
    status: session.status,
    openedBy: session.openedBy,
    openedAt: session.openedAt,
    revision: session.version,
    openingFloatMinor: session.openingFloatMinor,
    cashInMinor: sum(session.movements, 'CASH_IN').toString(),
    cashOutMinor: sum(session.movements, 'CASH_OUT').toString(),
    salesMinor: sum(session.movements, 'SALE').toString(),
    refundsMinor: sum(session.movements, 'REFUND').toString(),
    expectedMinor: sessionExpected(session).amountMinor.toString(),
    movements: session.movements.map((m) => ({
      id: m.id,
      kind: m.kind,
      amountMinor: m.amountMinor,
      reason: m.reason,
      createdBy: m.createdBy,
      createdAt: m.createdAt,
    })),
    count: session.count,
  };
}

const notYours = () =>
  err(failure('permission-denied', 'Solo quien abrió esta caja puede operarla.'));
const changed = () =>
  err(failure('failed-precondition', 'La caja cambió. Revísala antes de continuar.'));

/** El cajero opera solo su caja; propietario y administrador, cualquiera de la sucursal (D-40). */
const ownsOrManages = (roleCode: string, session: CashSessionRow, actor: Actor) =>
  roleCode !== 'cashier' || session.openedBy === actor.uid;

export function createOpenCashSession(store: CashStore) {
  return async (actor: Actor, data: unknown): Promise<Outcome<CashSessionResponse>> => {
    const input = parseOpen(data);
    if (!input.ok) return input;
    const scope = { tenantId: input.value.tenantId, branchId: input.value.branchId };
    const outcome = await store.open(actor, {
      scope,
      cashSessionId: newId(),
      registerId: input.value.registerId,
      openingFloatMinor: input.value.openingFloatMinor,
    });
    if (outcome === 'denied')
      return err(failure('permission-denied', 'No tienes acceso a esta caja.'));
    if (outcome === 'register-unavailable')
      return err(failure('failed-precondition', 'Esa caja no está disponible en la sucursal.'));
    // Un doble clic encuentra la caja abierta por la misma persona: responde lo mismo.
    const mine = await store.load(actor, scope, null, 'cash_session.open');
    if (!mine.ok) return mine;
    const session = mine.value.session;
    if (session && session.registerId === input.value.registerId && session.status === 'OPEN')
      return ok(toResponse(session));
    if (outcome === 'operator-busy' || session)
      return err(
        failure(
          'failed-precondition',
          'Ya tienes otra caja abierta. Ciérrala antes de abrir esta.',
        ),
      );
    return err(failure('failed-precondition', 'Esa caja ya tiene un turno abierto.'));
  };
}

export function createReadCashSession(store: CashStore) {
  return async (actor: Actor, data: unknown): Promise<Outcome<ReadCashSessionResponse>> => {
    const input = parseRead(data);
    if (!input.ok) return input;
    const scope = { tenantId: input.value.tenantId, branchId: input.value.branchId };
    const loaded = await store.load(
      actor,
      scope,
      input.value.cashSessionId ?? null,
      'cash_session.open',
    );
    if (!loaded.ok) return loaded;
    const { session, roleCode } = loaded.value;
    if (session && !ownsOrManages(roleCode, session, actor)) return notYours();
    return ok({ session: session ? toResponse(session) : null });
  };
}

export function createRecordCashMovement(store: CashStore) {
  return async (actor: Actor, data: unknown): Promise<Outcome<CashSessionResponse>> => {
    const input = parseMovement(data);
    if (!input.ok) return input;
    const scope = { tenantId: input.value.tenantId, branchId: input.value.branchId };
    const load = () => store.load(actor, scope, input.value.cashSessionId, 'cash_session.open');
    const loaded = await load();
    if (!loaded.ok) return loaded;
    const session = loaded.value.session;
    if (!session) return err(failure('not-found', 'La caja no existe en la sucursal.'));
    if (!ownsOrManages(loaded.value.roleCode, session, actor)) return notYours();
    // Reintento con la misma clave: devuelve el turno si el movimiento es el mismo.
    const previous = session.movements.find((m) => m.idempotencyKey === input.value.idempotencyKey);
    if (previous) {
      const same =
        previous.kind === input.value.kind &&
        previous.amountMinor === input.value.amountMinor &&
        previous.reason === input.value.reason;
      return same
        ? ok(toResponse(session))
        : err(failure('failed-precondition', 'Esa clave ya identifica otro movimiento.'));
    }
    if (session.status !== 'OPEN')
      return err(failure('failed-precondition', 'La caja ya está cerrada.'));
    if (session.version !== input.value.revision) return changed();
    if (
      input.value.kind === 'CASH_OUT' &&
      cop(input.value.amountMinor).compareTo(sessionExpected(session)) > 0
    )
      return err(
        failure(
          'failed-precondition',
          `No puedes sacar más de lo que hay en la caja (${formatMoney(sessionExpected(session))}).`,
        ),
      );
    const written = await store.move(actor, {
      scope,
      session,
      movementId: newId(),
      idempotencyKey: input.value.idempotencyKey,
      kind: input.value.kind,
      amountMinor: input.value.amountMinor,
      reason: input.value.reason,
    });
    const latest = await load();
    if (!latest.ok) return latest;
    const now = latest.value.session;
    if (!now) return changed();
    if (written) return ok(toResponse(now));
    const done = now.movements.find((m) => m.idempotencyKey === input.value.idempotencyKey);
    return done ? ok(toResponse(now)) : changed();
  };
}

export function createCloseCashSession(store: CashStore) {
  return async (actor: Actor, data: unknown): Promise<Outcome<CloseCashSessionResponse>> => {
    const input = parseClose(data);
    if (!input.ok) return input;
    const scope = { tenantId: input.value.tenantId, branchId: input.value.branchId };
    const load = () => store.load(actor, scope, input.value.cashSessionId, 'cash_session.close');
    const loaded = await load();
    if (!loaded.ok) return loaded;
    const session = loaded.value.session;
    if (!session) return err(failure('not-found', 'La caja no existe en la sucursal.'));
    if (!ownsOrManages(loaded.value.roleCode, session, actor)) return notYours();
    const answer = (count: NonNullable<CashSessionRow['count']>) =>
      ok({
        cashSessionId: session.id,
        expectedMinor: count.expectedMinor,
        countedMinor: count.countedMinor,
        differenceMinor: count.differenceMinor,
      });
    // Reintento del mismo cierre: devuelve el conteo guardado.
    if (session.status === 'CLOSED' && session.count) {
      return session.count.countedMinor === input.value.countedMinor
        ? answer(session.count)
        : err(failure('failed-precondition', 'La caja ya está cerrada.'));
    }
    if (session.version !== input.value.revision) return changed();
    const reason = input.value.reason === undefined ? null : readReason(input.value.reason);
    const count = closeCashCount(sessionExpected(session), cop(input.value.countedMinor), reason);
    if (!count.ok)
      return count.error.kind === 'reason-required'
        ? err(
            failure(
              'invalid-argument',
              `La caja no cuadra por ${formatMoney(count.error.difference)}: escribe el motivo de la diferencia.`,
            ),
          )
        : err(failure('invalid-argument', 'Revisa el efectivo contado.'));
    const result = {
      expectedMinor: count.value.expected.amountMinor.toString(),
      countedMinor: count.value.counted.amountMinor.toString(),
      differenceMinor: count.value.difference.amountMinor.toString(),
      reason: count.value.difference.isZero() ? null : reason,
    };
    if (await store.close(actor, { scope, session, ...result })) return answer(result);
    const latest = await load();
    if (!latest.ok) return latest;
    const now = latest.value.session;
    return now?.status === 'CLOSED' && now.count?.countedMinor === input.value.countedMinor
      ? ok({
          cashSessionId: now.id,
          expectedMinor: now.count.expectedMinor,
          countedMinor: now.count.countedMinor,
          differenceMinor: now.count.differenceMinor,
        })
      : changed();
  };
}
