import { describe, expect, it, vi } from 'vitest';
import { ok } from '@tavelyo/core';
import {
  createCloseCashSession,
  createOpenCashSession,
  createReadCashSession,
  createRecordCashMovement,
} from './cash.ts';
import type { CashMovementRow, CashSessionRow, CashStore, OpenOutcome } from './store.ts';
import type { Actor } from '../shared/outcome.ts';

// Bloque 5: turno de caja (RF-PA-07, D-40). El servidor calcula el efectivo esperado y el conteo.

const id = (n: number) => n.toString(16).padStart(32, '0');
const pesos = (n: number) => (BigInt(n) * 100n).toString();
const cashier: Actor = { uid: 'cajero', claims: {}, authTimeSeconds: 0 };
const otherCashier: Actor = { uid: 'otro-cajero', claims: {}, authTimeSeconds: 0 };
const scope = { tenantId: id(1), branchId: id(2) };

const movement = (
  n: number,
  kind: CashMovementRow['kind'],
  amount: number,
  extra: Partial<CashMovementRow> = {},
): CashMovementRow => ({
  id: id(n),
  kind,
  amountMinor: pesos(amount),
  reason: kind === 'CASH_IN' || kind === 'CASH_OUT' ? 'Cambio para la caja' : null,
  idempotencyKey: `mov-${n}-clave`,
  createdBy: 'cajero',
  createdAt: '2026-11-20T12:00:00Z',
  ...extra,
});

// Fondo $ 100.000; entrada $ 20.000; ventas $ 50.000; salida $ 10.000; reembolso $ 5.000.
const session: CashSessionRow = {
  id: id(30),
  registerId: id(40),
  status: 'OPEN',
  version: 6,
  currency: 'COP',
  openingFloatMinor: pesos(100_000),
  openedBy: 'cajero',
  openedAt: '2026-11-20T11:00:00Z',
  movements: [
    movement(1, 'CASH_IN', 20_000),
    movement(2, 'SALE', 50_000),
    movement(3, 'CASH_OUT', 10_000),
    movement(4, 'REFUND', 5_000),
  ],
  count: null,
};

function store(
  data: CashSessionRow | null = session,
  roleCode = 'cashier',
  extra: Partial<CashStore> = {},
): CashStore {
  return {
    load: vi.fn(async () => ok({ roleCode, session: data })),
    open: vi.fn(async (): Promise<OpenOutcome> => 'opened'),
    move: vi.fn(async () => true),
    close: vi.fn(async () => true),
    ...extra,
  };
}

describe('lectura del turno', () => {
  it('calcula lo esperado: fondo más entradas y ventas, menos salidas y reembolsos', async () => {
    expect(await createReadCashSession(store())(cashier, scope)).toMatchObject({
      ok: true,
      value: {
        session: {
          revision: 6,
          cashInMinor: pesos(20_000),
          salesMinor: pesos(50_000),
          cashOutMinor: pesos(10_000),
          refundsMinor: pesos(5_000),
          expectedMinor: pesos(155_000),
        },
      },
    });
  });
  it('sin turno abierto responde null', async () => {
    expect(await createReadCashSession(store(null))(cashier, scope)).toEqual({
      ok: true,
      value: { session: null },
    });
  });
  it('un cajero no ve la caja de otra persona; el administrador sí', async () => {
    expect(
      await createReadCashSession(store())(otherCashier, { ...scope, cashSessionId: id(30) }),
    ).toMatchObject({ ok: false, error: { code: 'permission-denied' } });
    expect(
      (
        await createReadCashSession(store(session, 'branch_admin'))(otherCashier, {
          ...scope,
          cashSessionId: id(30),
        })
      ).ok,
    ).toBe(true);
  });
});

describe('apertura', () => {
  const input = { ...scope, registerId: id(40), openingFloatMinor: pesos(100_000) };
  it('abre con el fondo inicial y responde el turno', async () => {
    const db = store({ ...session, movements: [], version: 1 });
    expect(await createOpenCashSession(db)(cashier, input)).toMatchObject({
      ok: true,
      value: { registerId: id(40), expectedMinor: pesos(100_000) },
    });
    expect(db.open).toHaveBeenCalledWith(
      cashier,
      expect.objectContaining({ registerId: id(40), openingFloatMinor: pesos(100_000) }),
    );
  });
  it('un doble clic encuentra la caja abierta por la misma persona y responde lo mismo', async () => {
    const db = store(session, 'cashier', { open: vi.fn(async () => 'register-busy' as const) });
    expect((await createOpenCashSession(db)(cashier, input)).ok).toBe(true);
  });
  it('una caja con turno de otra persona no se abre', async () => {
    const db = store(null, 'cashier', { open: vi.fn(async () => 'register-busy' as const) });
    expect(await createOpenCashSession(db)(cashier, input)).toMatchObject({
      ok: false,
      error: { message: 'Esa caja ya tiene un turno abierto.' },
    });
  });
  it('quien ya tiene otra caja abierta no abre una segunda', async () => {
    const db = store({ ...session, registerId: id(41) }, 'cashier', {
      open: vi.fn(async () => 'operator-busy' as const),
    });
    expect(await createOpenCashSession(db)(cashier, input)).toMatchObject({
      ok: false,
      error: { message: expect.stringMatching(/Ya tienes otra caja abierta/) },
    });
  });
  it.each([
    ['sin permiso', 'denied', 'permission-denied'],
    ['caja archivada o de otra sucursal', 'register-unavailable', 'failed-precondition'],
  ] as const)('%s', async (_caso, outcome, code) => {
    const db = store(null, 'cashier', { open: vi.fn(async () => outcome) });
    expect(await createOpenCashSession(db)(cashier, input)).toMatchObject({
      ok: false,
      error: { code },
    });
  });
  it.each([{ openingFloatMinor: '-1' }, { openingFloatMinor: '10.5' }, { registerId: 'x' }])(
    'rechaza la entrada %j',
    async (change) => {
      const db = store();
      expect((await createOpenCashSession(db)(cashier, { ...input, ...change })).ok).toBe(false);
      expect(db.open).not.toHaveBeenCalled();
    },
  );
});

describe('entradas y salidas', () => {
  const input = {
    ...scope,
    cashSessionId: id(30),
    revision: 6,
    idempotencyKey: 'salida-proveedor-1',
    kind: 'CASH_OUT',
    amountMinor: pesos(30_000),
    reason: 'Pago al proveedor de hielo',
  };
  it('registra una salida con motivo sobre la versión leída', async () => {
    const db = store();
    expect((await createRecordCashMovement(db)(cashier, input)).ok).toBe(true);
    expect(db.move).toHaveBeenCalledWith(
      cashier,
      expect.objectContaining({ kind: 'CASH_OUT', amountMinor: pesos(30_000) }),
    );
  });
  it('no deja sacar más de lo que hay en la caja', async () => {
    const db = store();
    const result = await createRecordCashMovement(db)(cashier, {
      ...input,
      amountMinor: pesos(155_001),
    });
    expect(result).toMatchObject({ ok: false, error: { code: 'failed-precondition' } });
    expect(db.move).not.toHaveBeenCalled();
  });
  it('exige motivo', async () => {
    expect((await createRecordCashMovement(store())(cashier, { ...input, reason: ' x ' })).ok).toBe(
      false,
    );
  });
  it('con una revisión antigua no escribe', async () => {
    const db = store();
    expect((await createRecordCashMovement(db)(cashier, { ...input, revision: 5 })).ok).toBe(false);
    expect(db.move).not.toHaveBeenCalled();
  });
  it('el mismo movimiento repetido no se duplica; con otro contenido se rechaza', async () => {
    const done = {
      ...session,
      movements: [
        ...session.movements,
        movement(5, 'CASH_OUT', 30_000, {
          idempotencyKey: input.idempotencyKey,
          reason: input.reason,
        }),
      ],
    };
    const db = store(done);
    expect((await createRecordCashMovement(db)(cashier, input)).ok).toBe(true);
    expect(db.move).not.toHaveBeenCalled();
    expect(
      (await createRecordCashMovement(store(done))(cashier, { ...input, amountMinor: pesos(1) }))
        .ok,
    ).toBe(false);
  });
  it('un cajero no mueve la caja de otra persona; la caja cerrada no admite movimientos', async () => {
    expect((await createRecordCashMovement(store())(otherCashier, input)).ok).toBe(false);
    expect(
      (await createRecordCashMovement(store({ ...session, status: 'CLOSED' }))(cashier, input)).ok,
    ).toBe(false);
  });
});

describe('cierre con conteo', () => {
  const input = { ...scope, cashSessionId: id(30), revision: 6, countedMinor: pesos(155_000) };
  it('si cuadra, cierra sin motivo y guarda esperado, contado y diferencia', async () => {
    const db = store();
    expect(await createCloseCashSession(db)(cashier, input)).toEqual({
      ok: true,
      value: {
        cashSessionId: id(30),
        expectedMinor: pesos(155_000),
        countedMinor: pesos(155_000),
        differenceMinor: '0',
      },
    });
    expect(db.close).toHaveBeenCalledWith(cashier, expect.objectContaining({ reason: null }));
  });
  it('con diferencia exige motivo y la guarda con su signo', async () => {
    const short = { ...input, countedMinor: pesos(150_000) };
    expect(await createCloseCashSession(store())(cashier, short)).toMatchObject({
      ok: false,
      error: { message: expect.stringMatching(/no cuadra por .*5\.000/) },
    });
    expect(
      await createCloseCashSession(store())(cashier, {
        ...short,
        reason: 'Faltó cambio de un billete',
      }),
    ).toMatchObject({ ok: true, value: { differenceMinor: `-${pesos(5_000)}` } });
  });
  it('el reintento del mismo cierre devuelve el conteo guardado', async () => {
    const closed: CashSessionRow = {
      ...session,
      status: 'CLOSED',
      count: {
        expectedMinor: pesos(155_000),
        countedMinor: pesos(155_000),
        differenceMinor: '0',
        reason: null,
      },
    };
    const db = store(closed);
    expect((await createCloseCashSession(db)(cashier, input)).ok).toBe(true);
    expect(db.close).not.toHaveBeenCalled();
  });
  it('con una venta en medio (revisión antigua) pide revisar', async () => {
    const db = store();
    expect((await createCloseCashSession(db)(cashier, { ...input, revision: 5 })).ok).toBe(false);
    expect(db.close).not.toHaveBeenCalled();
  });
  it('un cajero no cierra la caja de otra persona; el administrador sí', async () => {
    expect((await createCloseCashSession(store())(otherCashier, input)).ok).toBe(false);
    expect(
      (await createCloseCashSession(store(session, 'tenant_owner'))(otherCashier, input)).ok,
    ).toBe(true);
  });
});
