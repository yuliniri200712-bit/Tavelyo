import { describe, expect, it, vi } from 'vitest';
import { ok } from '@tavelyo/core';
import { createCloseTable } from './account.ts';
import type {
  AccountLine,
  AccountPayment,
  AccountSnapshot,
  BillingStore,
  CloseOutcome,
} from './store.ts';
import type { Actor } from '../shared/outcome.ts';

// Parte 4c: cierre de mesa (D-30). Solo con saldo cero, todo entregado y sin pedidos por aprobar.

const id = (n: number) => n.toString(16).padStart(32, '0');
const actor: Actor = { uid: 'mesero', claims: {}, authTimeSeconds: 0 };
const scope = { tenantId: id(1), branchId: id(2), sessionId: id(3) };
const pesos = (n: number) => (BigInt(n) * 100n).toString();

const line = (
  n: number,
  status: AccountLine['status'] = 'DELIVERED',
  approval = 'NOT_REQUIRED',
): AccountLine => ({
  id: id(n),
  version: 2,
  status,
  lineTotalMinor: pesos(30_000),
  taxMinor: '0',
  productNameSnapshot: `Plato ${n}`,
  quantity: 1,
  order: {
    participantId: id(90),
    sentToKitchenAt:
      approval === 'NOT_REQUIRED' || approval === 'APPROVED' ? '2026-11-19T12:00:00Z' : null,
    approval,
  },
});

const paid = (lines: number[]): AccountPayment => ({
  paymentId: id(20),
  method: 'CASH',
  amountMinor: pesos(30_000 * lines.length),
  tipMinor: '0',
  currency: 'COP',
  receivedMinor: null,
  changeMinor: null,
  receiptNumber: null,
  idempotencyKey: 'pago-cierre',
  requestFingerprint: null,
  allocations: lines.map((n) => ({ orderItemId: id(n), amountMinor: pesos(30_000) })),
  refunds: [],
});

const settled: AccountSnapshot = {
  currency: 'COP',
  open: true,
  roleCode: 'waiter',
  bill: { id: id(50), version: 4, status: 'OPEN' },
  lines: [line(10), line(11)],
  payments: [paid([10, 11])],
};

function store(data: AccountSnapshot, outcome: CloseOutcome = 'closed'): BillingStore {
  return {
    load: vi.fn(async () => ok(data)),
    record: vi.fn(async () => true),
    refund: vi.fn(async () => true),
    close: vi.fn(async () => outcome),
  };
}

describe('cierre de mesa (D-30)', () => {
  it('con saldo cero y todo entregado, cierra y salda la cuenta con su total', async () => {
    const db = store(settled);
    expect(await createCloseTable(db)(actor, scope)).toEqual({
      ok: true,
      value: { sessionId: scope.sessionId, settledTotalMinor: pesos(60_000) },
    });
    expect(db.load).toHaveBeenCalledWith(actor, scope, 'session.close');
    expect(db.close).toHaveBeenCalledWith(actor, {
      scope,
      settle: { billId: id(50), version: 4, totalMinor: pesos(60_000) },
    });
  });
  it('una mesa sin consumo se cierra sin cuenta', async () => {
    const db = store({ ...settled, bill: null, lines: [], payments: [] });
    expect(await createCloseTable(db)(actor, scope)).toMatchObject({
      ok: true,
      value: { settledTotalMinor: null },
    });
    expect(db.close).toHaveBeenCalledWith(actor, { scope, settle: null });
  });
  it('con saldo pendiente no cierra y dice cuánto falta', async () => {
    const db = store({ ...settled, payments: [paid([10])] });
    const result = await createCloseTable(db)(actor, scope);
    expect(result).toMatchObject({ ok: false, error: { code: 'failed-precondition' } });
    expect(!result.ok && result.error.message).toMatch(/Falta cobrar \$\s?30\.000/);
    expect(db.close).not.toHaveBeenCalled();
  });
  it.each(['RECEIVED', 'IN_PREPARATION', 'READY', 'PICKED_UP'] as const)(
    'con un plato en %s no cierra aunque esté pagado',
    async (status) => {
      const db = store({ ...settled, lines: [line(10), line(11, status)] });
      const result = await createCloseTable(db)(actor, scope);
      expect(!result.ok && result.error.message).toMatch(/1 plato en cocina o sin entregar/);
      expect(db.close).not.toHaveBeenCalled();
    },
  );
  it('con un pedido esperando al mesero no cierra', async () => {
    const db = store({ ...settled, lines: [...settled.lines, line(12, 'RECEIVED', 'PENDING')] });
    const result = await createCloseTable(db)(actor, scope);
    expect(!result.ok && result.error.message).toMatch(/esperando la aprobación del mesero/);
    expect(db.close).not.toHaveBeenCalled();
  });
  it('los platos cancelados y los pedidos rechazados no impiden cerrar', async () => {
    const db = store({
      ...settled,
      lines: [...settled.lines, line(12, 'CANCELLED'), line(13, 'RECEIVED', 'REJECTED')],
    });
    expect((await createCloseTable(db)(actor, scope)).ok).toBe(true);
  });
  it('una mesa ya cerrada no se vuelve a cerrar', async () => {
    const db = store({ ...settled, open: false });
    expect(await createCloseTable(db)(actor, scope)).toMatchObject({ ok: false });
    expect(db.close).not.toHaveBeenCalled();
  });
  it('si la mesa cambió entre la lectura y el cierre, lo informa', async () => {
    expect(await createCloseTable(store(settled, 'changed'))(actor, scope)).toMatchObject({
      ok: false,
      error: { code: 'failed-precondition' },
    });
  });
  it('si quien cierra perdió el permiso, lo rechaza', async () => {
    expect(await createCloseTable(store(settled, 'denied'))(actor, scope)).toMatchObject({
      ok: false,
      error: { code: 'permission-denied' },
    });
  });
  it('rechaza campos que no son del cierre', async () => {
    const db = store(settled);
    expect((await createCloseTable(db)(actor, { ...scope, force: true })).ok).toBe(false);
    expect(db.load).not.toHaveBeenCalled();
  });
});
