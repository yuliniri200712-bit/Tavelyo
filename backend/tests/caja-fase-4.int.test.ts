import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import type {
  BillResponse,
  BillScope,
  CashScope,
  CashSessionResponse,
  CloseCashSessionResponse,
  JoinTableSessionResponse,
  QuoteOrderResponse,
  ReadCashSessionResponse,
  RecordedPaymentResponse,
  RecordPaymentRequest,
  SubmitOrderResponse,
} from '@tavelyo/contracts';
import { buildFixture, type Fixture } from '../../dataconnect/tests/support/catalog-fixture.ts';
import {
  admin,
  createAnonymousUser,
  createUser,
  expectOk,
  mutate,
  query,
  type TestUser,
} from '../../dataconnect/tests/support/emulator.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
} from '../../dataconnect/tests/support/provisioning.ts';
import { callFunction } from './support/functions.ts';
import { callOk, createRegister, openTill } from './support/cash.ts';

// Bloque 5 de la Fase 4: turno de caja (RF-PA-07, D-40) contra los emuladores reales.

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Falta un dato de la prueba');
  return value;
}
const pesos = (n: number) => (BigInt(n) * 100n).toString();

let owner: TestUser;
let branchAdmin: TestUser;
let waiter: TestUser;
let outsider: TestUser;
let unassigned: TestUser;
let f: Fixture;
let otherBranch: string;
let otherTenant: string;
let priceId: string;
let sequence = 0;
const scope = (): CashScope => ({ tenantId: f.tenantId, branchId: f.branchId });

/** Cajero nuevo de la sucursal Centro, para que cada prueba empiece sin cajas abiertas. */
async function newCashier(): Promise<TestUser> {
  const user = await createUser(`caja-cajero-${++sequence}`);
  await createProfile(user);
  await insertMembership(f.tenantId, user, 'cashier', [f.branchId]);
  return user;
}

const open = (user: TestUser, registerId: string, openingFloatMinor = '0', where = scope()) =>
  callFunction<CashSessionResponse>(user, 'openCashSession', {
    ...where,
    registerId,
    openingFloatMinor,
  });
const read = (user: TestUser | null, cashSessionId?: string, where = scope()) =>
  callFunction<ReadCashSessionResponse>(user, 'readCashSession', {
    ...where,
    ...(cashSessionId ? { cashSessionId } : {}),
  });
const move = (
  user: TestUser,
  till: Pick<CashSessionResponse, 'cashSessionId' | 'revision'>,
  kind: 'CASH_IN' | 'CASH_OUT',
  amountMinor: string,
  extra: Record<string, unknown> = {},
) =>
  callFunction<CashSessionResponse>(user, 'recordCashMovement', {
    ...scope(),
    cashSessionId: till.cashSessionId,
    revision: till.revision,
    idempotencyKey: randomUUID(),
    kind,
    amountMinor,
    reason: kind === 'CASH_IN' ? 'Cambio traído del banco' : 'Pago al proveedor de hielo',
    ...extra,
  });
const close = (
  user: TestUser,
  till: Pick<CashSessionResponse, 'cashSessionId' | 'revision'>,
  countedMinor: string,
  reason?: string,
) =>
  callFunction<CloseCashSessionResponse>(user, 'closeCashSession', {
    ...scope(),
    cashSessionId: till.cashSessionId,
    revision: till.revision,
    countedMinor,
    ...(reason ? { reason } : {}),
  });
/** Turno tal como está ahora en la base. */
async function current(user: TestUser, cashSessionId: string): Promise<CashSessionResponse> {
  return required(callOk(await read(user, cashSessionId)).session ?? undefined);
}

async function table(): Promise<BillScope> {
  const id = expectOk(
    await mutate<{ diningTable_insert: { id: string } }>(owner, 'CreateTable', {
      ...scope(),
      sectorId: f.sectorId,
      code: `K${++sequence}`,
      seats: 4,
    }),
    'Crear mesa',
  ).diningTable_insert.id;
  expectOk(await mutate(owner, 'OpenTableSession', { ...scope(), tableId: id }), 'Abrir mesa');
  const rows = expectOk(
    await admin<{ tableSessions: { id: string }[] }>(
      'query ($id: UUID!) { tableSessions(where: { tableId: { eq: $id }, status: { eq: OPEN } }) { id } }',
      { id },
    ),
    'Sesión',
  );
  return { ...scope(), sessionId: required(rows.tableSessions[0]).id };
}

/** Mesa con un plato de $ 32.000 enviado a cocina por un comensal. */
async function tableWithOrder(): Promise<BillScope> {
  const s = await table();
  const qr = expectOk(
    await admin<{ tableSession: { table: { qrPublicId: string } } }>(
      'query ($id: UUID!) { tableSession(id: $id) { table { qrPublicId } } }',
      { id: s.sessionId },
    ),
    'QR',
  ).tableSession.table.qrPublicId;
  const user = await createAnonymousUser(`caja-cliente-${++sequence}`);
  callOk(
    await callFunction<JoinTableSessionResponse>(user, 'joinTableSession', { qrPublicId: qr }),
  );
  const quote = callOk(
    await callFunction<QuoteOrderResponse>(user, 'quoteOrder', {
      sessionId: s.sessionId,
      idempotencyKey: randomUUID(),
      expectedTotalMinor: pesos(32_000),
      lines: [{ productId: f.productId, priceId, quantity: 1, optionIds: [f.optionId] }],
    }),
  );
  if (quote.outcome !== 'quoted') throw new Error('Resumen cambiado');
  callOk(await callFunction<SubmitOrderResponse>(user, 'submitOrder', { quoteId: quote.quoteId }));
  return s;
}

async function cashPayment(s: BillScope, user: TestUser): Promise<RecordPaymentRequest> {
  const account = callOk(await callFunction<BillResponse>(user, 'readBill', s));
  return {
    ...s,
    revision: account.revision,
    idempotencyKey: randomUUID(),
    method: 'CASH',
    currency: 'COP',
    amountMinor: account.outstandingMinor,
    tipMinor: '0',
    receivedMinor: account.outstandingMinor,
  };
}
const pay = (input: RecordPaymentRequest, user: TestUser) =>
  callFunction<RecordedPaymentResponse>(user, 'recordPayment', input);

beforeAll(async () => {
  await seedAuthorizationCatalog();
  [owner, branchAdmin, waiter, outsider, unassigned] = await Promise.all([
    createUser('caja-owner'),
    createUser('caja-admin'),
    createUser('caja-waiter'),
    createUser('caja-outside'),
    createUser('caja-unassigned'),
  ]);
  for (const user of [owner, branchAdmin, waiter, outsider, unassigned]) await createProfile(user);
  const tenant = await provisionTenant('Caja 4', owner, ['Centro', 'Norte']);
  otherBranch = required(tenant.branches.Norte);
  otherTenant = (await provisionTenant('Otra caja 4', outsider, ['Sur'])).id;
  const branchId = required(tenant.branches.Centro);
  await insertMembership(tenant.id, branchAdmin, 'branch_admin', [branchId]);
  await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
  await insertMembership(tenant.id, unassigned, 'cashier', [otherBranch]);
  f = await buildFixture(owner, tenant.id, branchId);
  priceId = required(
    expectOk(
      await query<{ productBranches: { currentPrice: { id: string } }[] }>(owner, 'BranchCatalog', {
        ...scope(),
      }),
      'Carta',
    ).productBranches[0],
  ).currentPrice.id;
});

describe('caja (bloque 5, D-40) en emuladores', () => {
  it('abre con fondo; el doble clic responde el mismo turno; caja ocupada y segunda caja se rechazan', async () => {
    const cashier = await newCashier();
    const other = await newCashier();
    const registerId = await createRegister(owner, scope());
    const opened = callOk(await open(cashier, registerId, pesos(100_000)));
    expect(opened).toMatchObject({
      registerId,
      status: 'OPEN',
      openedBy: cashier.uid,
      openingFloatMinor: pesos(100_000),
      expectedMinor: pesos(100_000),
      movements: [],
      count: null,
    });
    expect(callOk(await open(cashier, registerId, pesos(100_000))).cashSessionId).toBe(
      opened.cashSessionId,
    );
    expect(callOk(await read(cashier)).session?.cashSessionId).toBe(opened.cashSessionId);
    expect(await open(other, registerId)).toMatchObject({
      ok: false,
      status: 'FAILED_PRECONDITION',
      message: 'Esa caja ya tiene un turno abierto.',
    });
    const second = await createRegister(owner, scope());
    expect(await open(cashier, second)).toMatchObject({
      ok: false,
      status: 'FAILED_PRECONDITION',
      message: expect.stringMatching(/Ya tienes otra caja abierta/),
    });
    // La caja con turno no se archiva; la lista de cajas muestra quién la tiene abierta.
    const archive = await mutate(owner, 'UpdateRegister', {
      ...scope(),
      registerId,
      name: 'Caja principal',
      archived: true,
    });
    expect(archive.errors.join(' ')).toMatch(/Cierra el turno antes de archivar la caja/);
    const listed = expectOk(
      await query<{
        registers: { id: string; cashSessions_on_register: { id: string; openedBy: string }[] }[];
      }>(cashier, 'BranchRegisters', { ...scope() }),
      'Cajas',
    ).registers.find((r) => r.id === registerId);
    expect(listed?.cashSessions_on_register).toEqual([
      { id: opened.cashSessionId, openedBy: cashier.uid, openedAt: expect.any(String) },
    ]);
    const audit = expectOk(
      await admin<{ auditEvents: unknown[] }>(
        'query ($a: String!) { auditEvents(where: { operation: { eq: "cash_session.open" }, actorId: { eq: $a } }) { id } }',
        { a: cashier.uid },
      ),
      'Auditoría',
    );
    expect(audit.auditEvents).toHaveLength(1);
    callOk(await close(cashier, opened, pesos(100_000)));
  }, 60_000);

  it('solo quien configura la sucursal crea cajas; una caja archivada no se abre', async () => {
    const cashier = await newCashier();
    expect(
      (await mutate(cashier, 'CreateRegister', { ...scope(), name: 'Caja del cajero' })).errors
        .length,
    ).toBeGreaterThan(0);
    const registerId = await createRegister(branchAdmin, scope());
    expectOk(
      await mutate(branchAdmin, 'UpdateRegister', {
        ...scope(),
        registerId,
        name: 'Caja vieja',
        archived: true,
      }),
      'Archivar',
    );
    expect(await open(cashier, registerId)).toMatchObject({
      ok: false,
      status: 'FAILED_PRECONDITION',
      message: 'Esa caja no está disponible en la sucursal.',
    });
  }, 60_000);

  it('entradas y salidas con motivo: calculan lo esperado, no se duplican y no sacan más de lo que hay', async () => {
    const cashier = await newCashier();
    const till = await openTill(owner, scope(), cashier, pesos(50_000));
    const key = randomUUID();
    const afterIn = callOk(
      await move(cashier, till, 'CASH_IN', pesos(20_000), { idempotencyKey: key }),
    );
    expect(afterIn).toMatchObject({ cashInMinor: pesos(20_000), expectedMinor: pesos(70_000) });
    expect(afterIn.revision).toBeGreaterThan(till.revision);
    // El reintento del mismo movimiento no lo duplica.
    expect(
      callOk(await move(cashier, till, 'CASH_IN', pesos(20_000), { idempotencyKey: key })),
    ).toMatchObject({ expectedMinor: pesos(70_000) });
    expect(await move(cashier, till, 'CASH_OUT', pesos(1_000))).toMatchObject({
      ok: false,
      status: 'FAILED_PRECONDITION',
      message: 'La caja cambió. Revísala antes de continuar.',
    });
    expect(await move(cashier, afterIn, 'CASH_OUT', pesos(70_001))).toMatchObject({
      ok: false,
      status: 'FAILED_PRECONDITION',
      message: expect.stringMatching(/No puedes sacar más de lo que hay en la caja/),
    });
    expect(
      await move(cashier, afterIn, 'CASH_OUT', pesos(1_000), { reason: ' no ' }),
    ).toMatchObject({ ok: false, status: 'INVALID_ARGUMENT' });
    const afterOut = callOk(await move(cashier, afterIn, 'CASH_OUT', pesos(15_000)));
    expect(afterOut).toMatchObject({
      cashOutMinor: pesos(15_000),
      expectedMinor: pesos(55_000),
    });
    const rows = expectOk(
      await admin<{ cashMovements: { kind: string; amountMinor: string; createdBy: string }[] }>(
        'query ($s: UUID!) { cashMovements(where: { cashSessionId: { eq: $s } }, orderBy: [{ createdAt: ASC }]) { kind amountMinor createdBy } }',
        { s: till.cashSessionId },
      ),
      'Movimientos',
    ).cashMovements;
    expect(rows).toEqual([
      { kind: 'CASH_IN', amountMinor: pesos(20_000), createdBy: cashier.uid },
      { kind: 'CASH_OUT', amountMinor: pesos(15_000), createdBy: cashier.uid },
    ]);
    callOk(await close(cashier, afterOut, pesos(55_000)));
  }, 60_000);

  it('cierre: si cuadra no pide motivo; con diferencia exige motivo y guarda el signo; la caja queda libre', async () => {
    const cashier = await newCashier();
    const till = await openTill(owner, scope(), cashier, pesos(100_000));
    expect(await close(cashier, till, pesos(95_000))).toMatchObject({
      ok: false,
      status: 'INVALID_ARGUMENT',
      message: expect.stringMatching(/no cuadra por .*5\.000/),
    });
    const closed = callOk(await close(cashier, till, pesos(95_000), 'Faltó cambio de un billete'));
    expect(closed).toEqual({
      cashSessionId: till.cashSessionId,
      expectedMinor: pesos(100_000),
      countedMinor: pesos(95_000),
      differenceMinor: `-${pesos(5_000)}`,
    });
    // El reintento del mismo cierre devuelve el conteo guardado.
    expect(callOk(await close(cashier, till, pesos(95_000), 'Faltó cambio de un billete'))).toEqual(
      closed,
    );
    const saved = expectOk(
      await admin<{
        cashSession: {
          status: string;
          openRegisterId: string | null;
          openOperatorKey: string | null;
        };
        cashCounts: { differenceMinor: string; reason: string | null; countedBy: string }[];
      }>(
        'query ($s: UUID!) { cashSession(id: $s) { status openRegisterId openOperatorKey } cashCounts(where: { cashSessionId: { eq: $s } }) { differenceMinor reason countedBy } }',
        { s: till.cashSessionId },
      ),
      'Cierre guardado',
    );
    expect(saved).toEqual({
      cashSession: { status: 'CLOSED', openRegisterId: null, openOperatorKey: null },
      cashCounts: [
        {
          differenceMinor: `-${pesos(5_000)}`,
          reason: 'Faltó cambio de un billete',
          countedBy: cashier.uid,
        },
      ],
    });
    expect(callOk(await read(cashier)).session).toBeNull();
    expect(await move(cashier, till, 'CASH_IN', pesos(1_000))).toMatchObject({
      ok: false,
      message: 'La caja ya está cerrada.',
    });
    // La misma caja y la misma persona pueden abrir un turno nuevo.
    const again = callOk(await open(cashier, till.registerId, pesos(10_000)));
    expect(again.cashSessionId).not.toBe(till.cashSessionId);
    callOk(await close(cashier, again, pesos(10_000)));
  }, 60_000);

  it('venta y cierre a la vez: solo uno gana y nunca queda una venta en un turno cerrado', async () => {
    for (let round = 0; round < 2; round++) {
      const cashier = await newCashier();
      const till = await openTill(owner, scope(), cashier);
      const s = await tableWithOrder();
      const input = await cashPayment(s, cashier);
      const [paid, closed] = await Promise.all([pay(input, cashier), close(cashier, till, '0')]);
      expect([paid.ok, closed.ok].filter(Boolean)).toHaveLength(1);
      const state = expectOk(
        await admin<{
          cashSession: { status: string };
          cashMovements: { kind: string }[];
          billPayments: unknown[];
        }>(
          'query ($c: UUID!, $s: UUID!) { cashSession(id: $c) { status } cashMovements(where: { cashSessionId: { eq: $c } }) { kind } billPayments(where: { bill: { sessionId: { eq: $s } } }) { id } }',
          { c: till.cashSessionId, s: s.sessionId },
        ),
        'Estado',
      );
      if (paid.ok) {
        expect(state).toEqual({
          cashSession: { status: 'OPEN' },
          cashMovements: [{ kind: 'SALE' }],
          billPayments: [expect.anything()],
        });
        const now = await current(cashier, till.cashSessionId);
        callOk(await close(cashier, now, pesos(32_000)));
      } else {
        expect(state).toEqual({
          cashSession: { status: 'CLOSED' },
          cashMovements: [],
          billPayments: [],
        });
      }
    }
  }, 120_000);

  it('reembolso en efectivo: sale de la caja de quien devuelve y no supera lo que hay en ella', async () => {
    const cashier = await newCashier();
    await openTill(owner, scope(), cashier);
    const s = await tableWithOrder();
    const paid = callOk(await pay(await cashPayment(s, cashier), cashier));
    const adminTill = await openTill(owner, scope(), branchAdmin);
    const refundInput = async () => ({
      ...s,
      revision: callOk(await callFunction<BillResponse>(branchAdmin, 'readBill', s)).revision,
      idempotencyKey: randomUUID(),
      reason: 'El plato salió frío',
      paymentId: paid.paymentId,
      amountMinor: pesos(10_000),
    });
    expect(await callFunction(branchAdmin, 'refundPayment', await refundInput())).toMatchObject({
      ok: false,
      status: 'FAILED_PRECONDITION',
      message: expect.stringMatching(/En tu caja no hay efectivo suficiente/),
    });
    callOk(await move(branchAdmin, adminTill, 'CASH_IN', pesos(10_000)));
    callOk(await callFunction(branchAdmin, 'refundPayment', await refundInput()));
    const after = await current(branchAdmin, adminTill.cashSessionId);
    expect(after).toMatchObject({ refundsMinor: pesos(10_000), expectedMinor: '0' });
    callOk(await close(branchAdmin, after, '0'));
  }, 90_000);

  it('aislamiento: otro cajero, mesero, otra sucursal y otra empresa no operan la caja; el administrador sí', async () => {
    const cashier = await newCashier();
    const other = await newCashier();
    const till = await openTill(owner, scope(), cashier, pesos(30_000));
    for (const attempt of [
      read(other, till.cashSessionId),
      move(other, till, 'CASH_OUT', pesos(1_000)),
      close(other, till, pesos(30_000)),
      read(waiter),
      open(waiter, till.registerId),
      read(outsider, till.cashSessionId),
      read(unassigned, till.cashSessionId),
      open(unassigned, till.registerId),
    ])
      expect(await attempt).toMatchObject({ ok: false, status: 'PERMISSION_DENIED' });
    // Con su propio alcance, el turno de otra sucursal o empresa no existe para quien pregunta.
    const elsewhere = [
      read(unassigned, till.cashSessionId, { tenantId: f.tenantId, branchId: otherBranch }),
      read(outsider, till.cashSessionId, {
        tenantId: otherTenant,
        branchId: required(
          expectOk(
            await admin<{ branches: { id: string }[] }>(
              'query ($t: UUID!) { branches(where: { tenantId: { eq: $t } }) { id } }',
              { t: otherTenant },
            ),
            'Sucursal ajena',
          ).branches[0],
        ).id,
      }),
    ];
    for (const attempt of elsewhere)
      expect(await attempt).toMatchObject({ ok: false, status: 'NOT_FOUND' });
    // Una caja de otra sucursal no se abre desde esta.
    const northRegister = await createRegister(owner, {
      tenantId: f.tenantId,
      branchId: otherBranch,
    });
    expect(await open(cashier, northRegister)).toMatchObject({
      ok: false,
      status: 'FAILED_PRECONDITION',
    });
    expect(await read(null)).toMatchObject({ ok: false, status: 'UNAUTHENTICATED' });
    expect(await current(cashier, till.cashSessionId)).toMatchObject({ movements: [] });
    // El administrador de la sucursal ve y cierra la caja de su equipo.
    expect(callOk(await read(branchAdmin, till.cashSessionId)).session?.openedBy).toBe(cashier.uid);
    callOk(await close(branchAdmin, till, pesos(30_000)));
  }, 90_000);
});
