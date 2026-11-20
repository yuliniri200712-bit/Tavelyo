import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import type {
  BillResponse,
  BillScope,
  CloseTableResponse,
  JoinTableSessionResponse,
  QuoteOrderResponse,
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
import { callFunction, type CallResult } from './support/functions.ts';
import { openTill } from './support/cash.ts';

// Parte 4c con las funciones reales: cierre de mesa (D-30) y concurrencia de cajeros y pedidos.
// Cada pedido de la carta de prueba vale $ 32.000.

function result<T>(r: CallResult<T>): T {
  if (!r.ok) throw new Error(`${r.status}: ${r.message}`);
  return r.result;
}
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Falta un dato de la prueba');
  return value;
}

let owner: TestUser;
let cashier: TestUser;
let branchAdmin: TestUser;
let waiter: TestUser;
let kitchen: TestUser;
let outsider: TestUser;
let f: Fixture;
let priceId: string;
let sequence = 0;
const scope = () => ({ tenantId: f.tenantId, branchId: f.branchId });

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

async function setApproval(mode: 'DIRECT' | 'WAITER_APPROVAL') {
  expectOk(
    await admin(
      'mutation ($id: UUID!, $mode: OrderApprovalMode!) { branch_update(id: $id, data: { orderApproval: $mode }) }',
      { id: f.branchId, mode },
    ),
    'Modo',
  );
}

/** Cliente con un resumen listo para enviar; `send` lo envía con submitOrder. */
async function prepareOrder(s: BillScope) {
  const qr = expectOk(
    await admin<{ tableSession: { table: { qrPublicId: string } } }>(
      'query ($id: UUID!) { tableSession(id: $id) { table { qrPublicId } } }',
      { id: s.sessionId },
    ),
    'QR',
  ).tableSession.table.qrPublicId;
  const user = await createAnonymousUser(`cierre-cliente-${++sequence}`);
  result(
    await callFunction<JoinTableSessionResponse>(user, 'joinTableSession', { qrPublicId: qr }),
  );
  const quote = result(
    await callFunction<QuoteOrderResponse>(user, 'quoteOrder', {
      sessionId: s.sessionId,
      idempotencyKey: randomUUID(),
      expectedTotalMinor: '3200000',
      lines: [{ productId: f.productId, priceId, quantity: 1, optionIds: [f.optionId] }],
    }),
  );
  if (quote.outcome !== 'quoted') throw new Error('Resumen cambiado');
  return {
    send: () => callFunction<SubmitOrderResponse>(user, 'submitOrder', { quoteId: quote.quoteId }),
  };
}

async function order(s: BillScope) {
  const sent = result(await (await prepareOrder(s)).send());
  return required(
    expectOk(
      await admin<{ orderItems: { id: string; version: number }[] }>(
        'query ($id: UUID!) { orderItems(where: { orderId: { eq: $id } }) { id version } }',
        { id: sent.orderId },
      ),
      'Línea',
    ).orderItems[0],
  );
}

/** Lleva la línea de recibida a entregada por los pasos de cocina y del mesero. */
async function deliver(item: { id: string; version: number }) {
  // Registrar un pago sube la versión de la línea: se lee la vigente.
  let version = expectOk(
    await admin<{ orderItem: { version: number } }>(
      'query ($id: UUID!) { orderItem(id: $id) { version } }',
      { id: item.id },
    ),
    'Versión',
  ).orderItem.version;
  for (const [user, operation] of [
    [kitchen, 'StartOrderItem'],
    [kitchen, 'FinishOrderItem'],
    [waiter, 'PickUpOrderItem'],
    [waiter, 'DeliverOrderItem'],
  ] as const) {
    expectOk(await mutate(user, operation, { ...scope(), itemId: item.id, version }), operation);
    version += 1;
  }
}

const bill = async (s: BillScope) =>
  result(await callFunction<BillResponse>(cashier, 'readBill', s));

async function paymentInput(s: BillScope): Promise<RecordPaymentRequest> {
  const account = await bill(s);
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
const pay = (input: RecordPaymentRequest, user = cashier) =>
  callFunction<RecordedPaymentResponse>(user, 'recordPayment', input);
const close = (s: BillScope, user = waiter) =>
  callFunction<CloseTableResponse>(user, 'closeTable', s);

async function sessionStatus(s: BillScope) {
  return expectOk(
    await admin<{
      tableSession: { status: string };
      bills: { status: string; settledTotalMinor: string | null; settledBy: string | null }[];
    }>(
      'query ($id: UUID!) { tableSession(id: $id) { status } bills(where: { sessionId: { eq: $id } }) { status settledTotalMinor settledBy } }',
      { id: s.sessionId },
    ),
    'Estado',
  );
}

beforeAll(async () => {
  await seedAuthorizationCatalog();
  [owner, cashier, branchAdmin, waiter, kitchen, outsider] = await Promise.all([
    createUser('c4c-owner'),
    createUser('c4c-cashier'),
    createUser('c4c-admin'),
    createUser('c4c-waiter'),
    createUser('c4c-kitchen'),
    createUser('c4c-outside'),
  ]);
  for (const user of [owner, cashier, branchAdmin, waiter, kitchen, outsider])
    await createProfile(user);
  const tenant = await provisionTenant('Cuenta 4c', owner, ['Centro']);
  await provisionTenant('Otra cuenta 4c', outsider, ['Sur']);
  const branchId = required(tenant.branches.Centro);
  await insertMembership(tenant.id, cashier, 'cashier', [branchId]);
  await insertMembership(tenant.id, branchAdmin, 'branch_admin', [branchId]);
  await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
  await insertMembership(tenant.id, kitchen, 'kitchen', [branchId]);
  f = await buildFixture(owner, tenant.id, branchId);
  priceId = required(
    expectOk(
      await query<{ productBranches: { currentPrice: { id: string } }[] }>(
        owner,
        'BranchCatalog',
        scope(),
      ),
      'Carta',
    ).productBranches[0],
  ).currentPrice.id;
  await setApproval('DIRECT');
  // D-40: el cajero y el administrador cobran en efectivo, cada uno en su caja.
  await openTill(owner, scope(), cashier);
  await openTill(owner, scope(), branchAdmin);
});

describe('4c: cierre de mesa (D-30) en emuladores', () => {
  it('una mesa sin consumo se cierra sin cuenta, también por el cierre directo del salón', async () => {
    const s = await table();
    expect(result(await close(s))).toEqual({ sessionId: s.sessionId, settledTotalMinor: null });
    expect(await sessionStatus(s)).toMatchObject({ tableSession: { status: 'CLOSED' }, bills: [] });
    const direct = await table();
    expectOk(
      await mutate(waiter, 'CloseTableSession', { ...scope(), sessionId: direct.sessionId }),
      'Cierre directo sin consumo',
    );
  }, 60_000);

  it('no cierra con saldo, ni con platos sin entregar; el cierre directo tampoco', async () => {
    const s = await table();
    const item = await order(s);
    expect(await close(s)).toMatchObject({
      ok: false,
      status: 'FAILED_PRECONDITION',
      message: expect.stringMatching(/Falta cobrar .*32\.000.*1 plato en cocina o sin entregar/),
    });
    const direct = await mutate(waiter, 'CloseTableSession', {
      ...scope(),
      sessionId: s.sessionId,
    });
    expect(direct.errors.join(' ')).toMatch(/La mesa tiene consumo/);
    result(await pay(await paymentInput(s)));
    expect(await close(s)).toMatchObject({
      ok: false,
      message: expect.stringMatching(/1 plato en cocina o sin entregar/),
    });
    await deliver(item);
    expect(result(await close(s))).toEqual({
      sessionId: s.sessionId,
      settledTotalMinor: '3200000',
    });
    expect(await sessionStatus(s)).toMatchObject({
      tableSession: { status: 'CLOSED' },
      bills: [{ status: 'SETTLED', settledTotalMinor: '3200000', settledBy: waiter.uid }],
    });
    const audit = expectOk(
      await admin<{ auditEvents: { operation: string }[] }>(
        'query ($s: String!) { auditEvents(where: { resourceType: { in: ["table_session", "bill"] }, actorId: { eq: $s } }) { operation } }',
        { s: waiter.uid },
      ),
      'Auditoría',
    ).auditEvents.map((e) => e.operation);
    expect(audit).toEqual(expect.arrayContaining(['table_session.close', 'bill.settle']));
    // Después del cierre: ni otro cierre ni otro pago.
    expect(await close(s)).toMatchObject({ ok: false, message: 'La mesa ya está cerrada.' });
    expect((await bill(s)).outstandingMinor).toBe('0');
  }, 90_000);

  it('no cierra con un pedido esperando la aprobación del mesero', async () => {
    await setApproval('WAITER_APPROVAL');
    try {
      const s = await table();
      result(await (await prepareOrder(s)).send());
      expect(await close(s)).toMatchObject({
        ok: false,
        message: expect.stringMatching(/esperando la aprobación del mesero/),
      });
      const direct = await mutate(waiter, 'CloseTableSession', {
        ...scope(),
        sessionId: s.sessionId,
      });
      expect(direct.errors.join(' ')).toMatch(/La mesa tiene consumo/);
    } finally {
      await setApproval('DIRECT');
    }
  }, 60_000);

  it('aislamiento: cocina sin permiso y otra empresa no cierran', async () => {
    const s = await table();
    expect(await close(s, kitchen)).toMatchObject({ ok: false, status: 'PERMISSION_DENIED' });
    expect(await close(s, outsider)).toMatchObject({ ok: false, status: 'PERMISSION_DENIED' });
    expect((await sessionStatus(s)).tableSession.status).toBe('OPEN');
  }, 60_000);
});

describe('4c: concurrencia (casos 4 y 9)', () => {
  it('dos cajeros cobran el mismo saldo a la vez: solo uno, sin cobrar de más', async () => {
    const s = await table();
    await order(s);
    const base = await paymentInput(s);
    const [a, b] = await Promise.all([
      pay({ ...base, idempotencyKey: randomUUID() }, cashier),
      pay({ ...base, idempotencyKey: randomUUID() }, branchAdmin),
    ]);
    expect([a.ok, b.ok].filter(Boolean)).toHaveLength(1);
    expect(await bill(s)).toMatchObject({ paidMinor: '3200000', outstandingMinor: '0' });
    // Solo una venta entra a una de las dos cajas.
    const sales = expectOk(
      await admin<{ cashMovements: { amountMinor: string }[] }>(
        'query ($s: UUID!) { cashMovements(where: { kind: { eq: SALE }, payment: { bill: { sessionId: { eq: $s } } } }) { amountMinor } }',
        { s: s.sessionId },
      ),
      'Ventas',
    ).cashMovements;
    expect(sales).toEqual([{ amountMinor: '3200000' }]);
  }, 60_000);

  it('dos cierres a la vez: uno cierra y salda, el otro se rechaza', async () => {
    const s = await table();
    const item = await order(s);
    result(await pay(await paymentInput(s)));
    await deliver(item);
    const [a, b] = await Promise.all([close(s, waiter), close(s, cashier)]);
    expect([a.ok, b.ok].filter(Boolean)).toHaveLength(1);
    expect((await sessionStatus(s)).bills).toEqual([
      expect.objectContaining({ status: 'SETTLED', settledTotalMinor: '3200000' }),
    ]);
  }, 90_000);

  it('cobro y cierre a la vez: nunca queda una mesa cerrada con saldo', async () => {
    const s = await table();
    const item = await order(s);
    await deliver(item);
    const input = await paymentInput(s);
    const [paid, closed] = await Promise.all([pay(input), close(s)]);
    const state = await sessionStatus(s);
    if (closed.ok) {
      expect(paid.ok).toBe(true);
      expect(state.bills[0]?.status).toBe('SETTLED');
    } else {
      expect(state.tableSession.status).toBe('OPEN');
    }
  }, 90_000);

  it('un pedido enviado a la vez que el cierre: nunca queda un pedido en una mesa cerrada', async () => {
    for (let round = 0; round < 3; round++) {
      const s = await table();
      const pending = await prepareOrder(s);
      const [sent, closed] = await Promise.all([pending.send(), close(s)]);
      const lines = expectOk(
        await admin<{ orderItems: unknown[] }>(
          'query ($s: UUID!) { orderItems(where: { order: { sessionId: { eq: $s }, sentToKitchenAt: { isNull: false } } }) { id } }',
          { s: s.sessionId },
        ),
        'Líneas enviadas',
      ).orderItems;
      expect([sent.ok, closed.ok].filter(Boolean)).toHaveLength(1);
      if (closed.ok) expect(lines).toEqual([]);
      else expect(lines).toHaveLength(1);
    }
  }, 120_000);
});
