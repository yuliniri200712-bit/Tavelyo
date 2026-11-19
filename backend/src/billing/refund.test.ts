import { describe, expect, it, vi } from 'vitest';
import { ok } from '@tavelyo/core';
import {
  accountRevision,
  accountSummary,
  createReadBill,
  createReadBillPayments,
  createRecordPayment,
  createRefundPayment,
  paymentFingerprint,
} from './account.ts';
import { parseReadBill, parseRefund } from './input.ts';
import type { AccountLine, AccountPayment, AccountSnapshot, BillingStore } from './store.ts';
import type { Actor } from '../shared/outcome.ts';

// Parte 4b: división en partes iguales (D-06) y reembolsos por plato y generales (D-34, D-37).

const id = (n: number) => n.toString(16).padStart(32, '0');
const actor: Actor = { uid: 'cajero', claims: {}, authTimeSeconds: 0 };
const scope = { tenantId: id(1), branchId: id(2), sessionId: id(3) };
const pesos = (n: number) => (BigInt(n) * 100n).toString();

const line = (n: number, total: number, status: AccountLine['status'] = 'DELIVERED') => ({
  id: id(n),
  version: 1,
  status,
  lineTotalMinor: pesos(total),
  taxMinor: '0',
  productNameSnapshot: `Plato ${n}`,
  quantity: 1,
  order: {
    participantId: id(90),
    sentToKitchenAt: '2026-11-19T12:00:00Z',
    approval: 'NOT_REQUIRED',
  },
});

const payment = (
  n: number,
  allocations: [number, number][],
  extra: Partial<AccountPayment> = {},
): AccountPayment => ({
  paymentId: id(n),
  method: 'CASH',
  amountMinor: pesos(allocations.reduce((s, [, a]) => s + a, 0)),
  tipMinor: '0',
  currency: 'COP',
  receivedMinor: null,
  changeMinor: null,
  receiptNumber: null,
  idempotencyKey: `pago-${n}-clave`,
  requestFingerprint: null,
  allocations: allocations.map(([lineN, amount]) => ({
    orderItemId: id(lineN),
    amountMinor: pesos(amount),
  })),
  refunds: [],
  ...extra,
});

// Mesa con dos platos de $ 40.000 y $ 60.000, pagados con un pago de $ 100.000.
const base: AccountSnapshot = {
  currency: 'COP',
  open: true,
  roleCode: 'cashier',
  bill: { id: id(50), version: 3, status: 'OPEN' },
  lines: [line(10, 40_000), line(11, 60_000)],
  payments: [
    payment(20, [
      [10, 40_000],
      [11, 60_000],
    ]),
  ],
};

function store(data: AccountSnapshot = base, writes = true): BillingStore {
  return {
    load: vi.fn(async () => ok(data)),
    record: vi.fn(async () => true),
    refund: vi.fn(async () => writes),
  };
}

const request = (snapshot: AccountSnapshot, extra: Record<string, unknown>) => ({
  ...scope,
  revision: accountRevision(snapshot),
  idempotencyKey: 'reembolso-001',
  reason: 'El plato salió frío',
  ...extra,
});

describe('división en partes iguales (D-06)', () => {
  it('divide lo pendiente en pesos enteros y la suma es exacta', async () => {
    const snapshot = { ...base, payments: [] };
    const result = await createReadBill(store(snapshot))(actor, { ...scope, parts: 3 });
    expect(result).toMatchObject({ ok: true, value: { outstandingMinor: pesos(100_000) } });
    if (!result.ok) return;
    expect(result.value.split).toEqual([pesos(33_334), pesos(33_333), pesos(33_333)]);
    expect(result.value.split?.reduce((s, p) => s + BigInt(p), 0n)).toBe(BigInt(pesos(100_000)));
  });
  it('sin partes no divide', async () => {
    const result = await createReadBill(store())(actor, scope);
    expect(result).toMatchObject({ ok: true, value: { split: null } });
  });
  it.each([1, 21, 2.5, '3'])('rechaza %j partes', (parts) => {
    expect(parseReadBill({ ...scope, parts }).ok).toBe(false);
  });
});

describe('reembolso general', () => {
  it('devuelve dinero con motivo sin cambiar la cuenta', async () => {
    const db = store();
    const result = await createRefundPayment(db)(
      actor,
      request(base, { paymentId: id(20), amountMinor: pesos(10_000) }),
    );
    expect(result).toMatchObject({
      ok: true,
      value: { kind: 'GENERAL', totalMinor: pesos(10_000), orderItemId: null },
    });
    expect(db.load).toHaveBeenCalledWith(actor, expect.anything(), 'payment.refund');
    expect(db.refund).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        line: null,
        refunds: [expect.objectContaining({ paymentId: id(20), amountMinor: pesos(10_000) })],
      }),
    );
  });
  it('no devuelve más de lo que queda del pago, contando reembolsos previos (caso 10)', async () => {
    const snapshot: AccountSnapshot = {
      ...base,
      payments: [
        payment(
          20,
          [
            [10, 40_000],
            [11, 60_000],
          ],
          {
            refunds: [
              {
                id: id(30),
                amountMinor: pesos(95_000),
                status: 'CONFIRMED',
                orderItemId: null,
                idempotencyKey: 'otro-reembolso',
                requestFingerprint: 'x',
              },
            ],
          },
        ),
      ],
      roleCode: 'tenant_owner',
    };
    const db = store(snapshot);
    const result = await createRefundPayment(db)(
      actor,
      request(snapshot, { paymentId: id(20), amountMinor: pesos(5_001) }),
    );
    expect(result.ok).toBe(false);
    expect(db.refund).not.toHaveBeenCalled();
  });
  it('rechaza un pago que no es de la cuenta', async () => {
    const result = await createRefundPayment(store())(
      actor,
      request(base, { paymentId: id(99), amountMinor: pesos(1_000) }),
    );
    expect(result.ok).toBe(false);
  });
});

describe('topes de reembolso por rol (D-34)', () => {
  it.each([
    ['cashier', 50_000, true],
    ['cashier', 50_001, false],
    ['branch_admin', 100_000, true],
    ['tenant_owner', 100_000, true],
  ])('%s reembolsa $ %i: %s', async (roleCode, amount, allowed) => {
    const snapshot: AccountSnapshot = {
      ...base,
      roleCode,
      lines: [line(10, 400_000), line(11, 60_000)],
      payments: [
        payment(20, [
          [10, 400_000],
          [11, 60_000],
        ]),
      ],
    };
    const db = store(snapshot);
    const result = await createRefundPayment(db)(
      actor,
      request(snapshot, { paymentId: id(20), amountMinor: pesos(amount) }),
    );
    expect(result.ok).toBe(allowed);
    expect(db.refund).toHaveBeenCalledTimes(allowed ? 1 : 0);
  });
  it('el administrador de sucursal no pasa de $ 300.000', async () => {
    const snapshot: AccountSnapshot = {
      ...base,
      roleCode: 'branch_admin',
      lines: [line(10, 400_000)],
      payments: [payment(20, [[10, 400_000]])],
    };
    const result = await createRefundPayment(store(snapshot))(
      actor,
      request(snapshot, { paymentId: id(20), amountMinor: pesos(300_001) }),
    );
    expect(result).toMatchObject({ ok: false, error: { code: 'permission-denied' } });
  });
  it('un rol sin tope definido no reembolsa', async () => {
    const snapshot = { ...base, roleCode: 'waiter' };
    const result = await createRefundPayment(store(snapshot))(
      actor,
      request(snapshot, { paymentId: id(20), amountMinor: pesos(1_000) }),
    );
    expect(result).toMatchObject({ ok: false, error: { code: 'permission-denied' } });
  });
});

describe('reembolso por plato (D-37)', () => {
  it('devuelve lo pagado del plato de cada pago y lo cancela como merma', async () => {
    const snapshot: AccountSnapshot = {
      ...base,
      payments: [
        payment(20, [[10, 15_000]]),
        payment(21, [
          [10, 25_000],
          [11, 60_000],
        ]),
      ],
    };
    const db = store(snapshot);
    const result = await createRefundPayment(db)(actor, request(snapshot, { orderItemId: id(10) }));
    expect(result).toMatchObject({
      ok: true,
      value: { kind: 'LINE', totalMinor: pesos(40_000), orderItemId: id(10) },
    });
    expect(db.refund).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        line: { id: id(10), version: 1, wasted: true },
        refunds: [
          expect.objectContaining({ paymentId: id(20), amountMinor: pesos(15_000) }),
          expect.objectContaining({ paymentId: id(21), amountMinor: pesos(25_000) }),
        ],
      }),
    );
  });
  it('un plato sin pagos no se reembolsa', async () => {
    const snapshot = { ...base, payments: [payment(20, [[11, 60_000]])] };
    const result = await createRefundPayment(store(snapshot))(
      actor,
      request(snapshot, { orderItemId: id(10) }),
    );
    expect(result.ok).toBe(false);
  });
  it('con la mesa cerrada solo se admite el reembolso general', async () => {
    const snapshot = { ...base, open: false };
    const result = await createRefundPayment(store(snapshot))(
      actor,
      request(snapshot, { orderItemId: id(10) }),
    );
    expect(result.ok).toBe(false);
  });
  it('tras devolverlo, el plato sale de la cuenta y su pago ya no cuenta como abonado', () => {
    const snapshot: AccountSnapshot = {
      ...base,
      lines: [line(10, 40_000, 'CANCELLED'), line(11, 60_000)],
      payments: [
        payment(
          20,
          [
            [10, 40_000],
            [11, 60_000],
          ],
          {
            refunds: [
              {
                id: id(30),
                amountMinor: pesos(40_000),
                status: 'CONFIRMED',
                orderItemId: id(10),
                idempotencyKey: 'reembolso-001',
                requestFingerprint: 'x',
              },
            ],
          },
        ),
      ],
    };
    const summary = accountSummary(snapshot);
    expect(summary.ok && summary.value.total.amountMinor).toBe(BigInt(pesos(60_000)));
    expect(summary.ok && summary.value.outstanding.amountMinor).toBe(0n);
  });
  it('una línea cancelada con pagos sin devolver exige revisión', () => {
    const snapshot: AccountSnapshot = {
      ...base,
      lines: [line(10, 40_000, 'CANCELLED'), line(11, 60_000)],
    };
    expect(accountSummary(snapshot).ok).toBe(false);
  });
});

describe('idempotencia, revisión y entrada', () => {
  it('el mismo reembolso repetido devuelve lo registrado sin escribir otra vez', async () => {
    const input = request(base, { paymentId: id(20), amountMinor: pesos(10_000) });
    const first = store();
    await createRefundPayment(first)(actor, input);
    const written = vi.mocked(first.refund).mock.calls[0]?.[1];
    const original = base.payments[0];
    const refundId = written?.refunds[0]?.refundId;
    if (!written || !original || !refundId) throw new Error('No se registró el reembolso');
    const snapshot: AccountSnapshot = {
      ...base,
      payments: [
        {
          ...original,
          refunds: [
            {
              id: refundId,
              amountMinor: pesos(10_000),
              status: 'CONFIRMED',
              orderItemId: null,
              idempotencyKey: input.idempotencyKey,
              requestFingerprint: written.fingerprint,
            },
          ],
        },
      ],
    };
    const second = store(snapshot);
    expect(await createRefundPayment(second)(actor, input)).toMatchObject({
      ok: true,
      value: { totalMinor: pesos(10_000) },
    });
    expect(second.refund).not.toHaveBeenCalled();
    const other = await createRefundPayment(store(snapshot))(actor, {
      ...input,
      amountMinor: pesos(9_000),
    });
    expect(other.ok).toBe(false);
  });
  it('el reintento de un pago con reembolsos responde solo los campos del pago', async () => {
    const paid = payment(
      20,
      [
        [10, 40_000],
        [11, 60_000],
      ],
      {
        refunds: [
          {
            id: id(30),
            amountMinor: pesos(1_000),
            status: 'CONFIRMED',
            orderItemId: null,
            idempotencyKey: 'otro',
            requestFingerprint: 'x',
          },
        ],
      },
    );
    const input = {
      ...scope,
      revision: accountRevision(base),
      idempotencyKey: paid.idempotencyKey,
      method: 'CASH',
      currency: 'COP',
      amountMinor: paid.amountMinor,
      tipMinor: '0',
      receivedMinor: paid.amountMinor,
    };
    const snapshot = {
      ...base,
      payments: [{ ...paid, requestFingerprint: paymentFingerprint(input as never) }],
    };
    expect(await createRecordPayment(store(snapshot))(actor, input)).toEqual({
      ok: true,
      value: {
        paymentId: paid.paymentId,
        method: 'CASH',
        amountMinor: paid.amountMinor,
        tipMinor: '0',
        currency: 'COP',
        receivedMinor: null,
        changeMinor: null,
        receiptNumber: null,
      },
    });
  });
  it('rechaza una revisión antigua', async () => {
    const db = store();
    const result = await createRefundPayment(db)(actor, {
      ...request(base, { paymentId: id(20), amountMinor: pesos(1_000) }),
      revision: 'a'.repeat(64),
    });
    expect(result.ok).toBe(false);
    expect(db.refund).not.toHaveBeenCalled();
  });
  it('si otra persona se adelantó, informa el conflicto', async () => {
    const result = await createRefundPayment(store(base, false))(
      actor,
      request(base, { paymentId: id(20), amountMinor: pesos(1_000) }),
    );
    expect(result).toMatchObject({ ok: false, error: { code: 'failed-precondition' } });
  });
  it.each([
    ['sin motivo', { reason: '  ' }],
    ['plato y pago a la vez', { orderItemId: id(10), paymentId: id(20) }],
    ['general sin importe', { paymentId: id(20) }],
    ['importe cero', { paymentId: id(20), amountMinor: '0' }],
    ['campo de tarjeta', { paymentId: id(20), amountMinor: '100', cardNumber: '4111111111111111' }],
  ])('rechaza la entrada: %s', (_caso, extra) => {
    expect(parseRefund(request(base, extra)).ok).toBe(false);
  });
  it('la lista de pagos dice lo reembolsado y lo que queda por devolver', async () => {
    const snapshot: AccountSnapshot = {
      ...base,
      payments: [
        payment(
          20,
          [
            [10, 40_000],
            [11, 60_000],
          ],
          {
            tipMinor: pesos(5_000),
            refunds: [
              {
                id: id(30),
                amountMinor: pesos(20_000),
                status: 'CONFIRMED',
                orderItemId: null,
                idempotencyKey: 'otro',
                requestFingerprint: 'x',
              },
            ],
          },
        ),
      ],
    };
    const db = store(snapshot);
    expect(await createReadBillPayments(db)(actor, scope)).toMatchObject({
      ok: true,
      value: {
        payments: [{ refundedMinor: pesos(20_000), refundableMinor: pesos(85_000) }],
      },
    });
    expect(db.load).toHaveBeenCalledWith(actor, expect.anything(), 'payment.refund');
  });
});
