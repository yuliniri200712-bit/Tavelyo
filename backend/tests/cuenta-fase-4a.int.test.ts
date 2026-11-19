import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getDataConnect } from 'firebase-admin/data-connect';
import { createBillingStore } from '../src/data/billing.ts';
import { accountRevision, paymentFingerprint } from '../src/billing/account.ts';
import { beforeAll, describe, expect, it } from 'vitest';
import type {
  BillResponse,
  BillScope,
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
let unassigned: TestUser;
let f: Fixture;
let otherBranch: string;
let otherTenant: string;
let priceId: string;
let sequence = 0;
const scope = () => ({ tenantId: f.tenantId, branchId: f.branchId });
const realStore = createBillingStore(
  getDataConnect(
    { serviceId: 'tavelyo', location: 'us-central1', connector: 'tavelyo' },
    initializeApp({ projectId: 'demo-tavelyo' }, 'cuenta-4a-transacciones'),
  ),
);

async function table(): Promise<BillScope> {
  const id = expectOk(
    await mutate<{ diningTable_insert: { id: string } }>(owner, 'CreateTable', {
      ...scope(),
      sectorId: f.sectorId,
      code: `C${++sequence}`,
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

async function order(s: BillScope, approval: 'DIRECT' | 'WAITER_APPROVAL' = 'DIRECT') {
  // Ajuste del dato de prueba; el flujo de envío sí recorre las funciones reales.
  expectOk(
    await admin(
      'mutation ($id: UUID!, $mode: OrderApprovalMode!) { branch_update(id: $id, data: { orderApproval: $mode }) }',
      { id: f.branchId, mode: approval },
    ),
    'Modo',
  );
  const qr = expectOk(
    await admin<{ tableSession: { table: { qrPublicId: string } } }>(
      'query ($id: UUID!) { tableSession(id: $id) { table { qrPublicId } } }',
      { id: s.sessionId },
    ),
    'QR',
  ).tableSession.table.qrPublicId;
  const user = await createAnonymousUser(`cuenta-cliente-${++sequence}`);
  const joined = result(
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
  const sent = result(
    await callFunction<SubmitOrderResponse>(user, 'submitOrder', { quoteId: quote.quoteId }),
  );
  const row = expectOk(
    await admin<{ orderItems: { id: string; version: number }[] }>(
      'query ($id: UUID!) { orderItems(where: { orderId: { eq: $id } }) { id version } }',
      { id: sent.orderId },
    ),
    'Línea',
  ).orderItems[0];
  if (!row) throw new Error('No se creó la línea');
  return { ...row, orderId: sent.orderId, participantId: joined.participantId, user };
}

async function bill(s: BillScope, user = cashier) {
  return result(await callFunction<BillResponse>(user, 'readBill', s));
}
async function paymentInput(
  s: BillScope,
  changes: Partial<RecordPaymentRequest> = {},
): Promise<RecordPaymentRequest> {
  const account = await bill(s);
  return {
    ...s,
    revision: account.revision,
    idempotencyKey: randomUUID(),
    method: 'CASH',
    currency: 'COP',
    amountMinor: account.outstandingMinor,
    tipMinor: '0',
    receivedMinor: '5000000',
    ...changes,
  };
}
const pay = (input: RecordPaymentRequest, user = cashier) =>
  callFunction<RecordedPaymentResponse>(user, 'recordPayment', input);

beforeAll(async () => {
  await seedAuthorizationCatalog();
  [owner, cashier, branchAdmin, waiter, kitchen, outsider, unassigned] = await Promise.all([
    createUser('c4a-owner'),
    createUser('c4a-cashier'),
    createUser('c4a-admin'),
    createUser('c4a-waiter'),
    createUser('c4a-kitchen'),
    createUser('c4a-outside'),
    createUser('c4a-unassigned'),
  ]);
  for (const user of [owner, cashier, branchAdmin, waiter, kitchen, outsider, unassigned])
    await createProfile(user);
  const tenant = await provisionTenant('Cuenta 4a', owner, ['Centro', 'Norte']);
  otherBranch = required(tenant.branches.Norte);
  otherTenant = (await provisionTenant('Otra cuenta', outsider, ['Sur'])).id;
  const branchId = required(tenant.branches.Centro);
  await insertMembership(tenant.id, cashier, 'cashier', [branchId]);
  await insertMembership(tenant.id, branchAdmin, 'branch_admin', [branchId]);
  await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
  await insertMembership(tenant.id, kitchen, 'kitchen', [branchId]);
  await insertMembership(tenant.id, unassigned, 'cashier', [otherBranch]);
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
});

describe('4a: cuenta y registro real en emuladores', () => {
  it('cuenta vacía no crea filas y solo incluye enviados, excluyendo cancelados y pendientes', async () => {
    const s = await table();
    expect(await bill(s)).toMatchObject({ totalMinor: '0', lines: [] });
    const accepted = await order(s);
    const cancelled = await order(s);
    expectOk(
      await mutate(waiter, 'CancelOrderItem', {
        ...scope(),
        itemId: cancelled.id,
        version: cancelled.version,
        reason: 'No disponible',
      }),
      'Cancelar',
    );
    await order(s, 'WAITER_APPROVAL');
    const rejected = await order(s, 'WAITER_APPROVAL');
    expectOk(
      await mutate(waiter, 'RejectOrder', {
        ...s,
        orderId: rejected.orderId,
        reason: 'Pedido duplicado',
      }),
      'Rechazar',
    );
    const withdrawn = await order(s, 'WAITER_APPROVAL');
    expectOk(
      await mutate(withdrawn.user, 'WithdrawMyOrder', {
        sessionId: s.sessionId,
        branchId: s.branchId,
        orderId: withdrawn.orderId,
      }),
      'Retirar',
    );
    expect(await bill(s)).toMatchObject({
      totalMinor: '3200000',
      paidMinor: '0',
      outstandingMinor: '3200000',
      lines: [{ id: accepted.id }],
    });
    const approved = await order(s, 'WAITER_APPROVAL');
    expectOk(await mutate(waiter, 'ApproveOrder', { ...s, orderId: approved.orderId }), 'Aprobar');
    expect((await bill(s)).totalMinor).toBe('6400000');
  }, 60_000);
  it('efectivo sin turno, cambio, propina elegida, asignación y auditoría atómicos; reintento único', async () => {
    const s = await table();
    const item = await order(s);
    const input = await paymentInput(s, { tipMinor: '320000' });
    const first = result(await pay(input));
    expect(first).toMatchObject({
      method: 'CASH',
      amountMinor: '3200000',
      tipMinor: '320000',
      changeMinor: '1480000',
      receiptNumber: null,
    });
    expect(result(await pay(input))).toEqual(first);
    expect(await pay({ ...input, tipMinor: '0' })).toMatchObject({
      ok: false,
      status: 'FAILED_PRECONDITION',
    });
    expect(await bill(s)).toMatchObject({ paidMinor: '3200000', outstandingMinor: '0' });
    const row = expectOk(
      await admin<{
        billPayment: {
          cashSessionId: string | null;
          createdBy: string;
          confirmedAt: string;
          paymentAllocations_on_payment: { orderItemId: string; amountMinor: string }[];
        };
        auditEvents: unknown[];
      }>(
        'query ($id: UUID!, $ref: String!) { billPayment(id: $id) { cashSessionId createdBy confirmedAt paymentAllocations_on_payment { orderItemId amountMinor } } auditEvents(where: { operation: { eq: "payment.record" }, resourceId: { eq: $ref } }) { id } }',
        { id: first.paymentId, ref: first.paymentId },
      ),
      'Pago guardado',
    );
    expect(row.billPayment).toMatchObject({
      cashSessionId: null,
      createdBy: cashier.uid,
      confirmedAt: expect.any(String),
      paymentAllocations_on_payment: [{ orderItemId: item.id, amountMinor: '3200000' }],
    });
    expect(row.auditEvents).toHaveLength(1);
    const current = expectOk(
      await admin<{ orderItem: { version: number } }>(
        'query ($id: UUID!) { orderItem(id: $id) { version } }',
        { id: item.id },
      ),
      'Versión',
    );
    expect(
      (
        await mutate(waiter, 'CancelOrderItem', {
          ...scope(),
          itemId: item.id,
          version: current.orderItem.version,
          reason: 'Intento con pago',
        })
      ).errors.length,
    ).toBeGreaterThan(0);
    expect((await bill(s)).totalMinor).toBe('3200000');
  });
  it.each(['TERMINAL', 'TRANSFER'] as const)(
    '%s guarda comprobante y permite propietario y administrador',
    async (method) => {
      const s = await table();
      await order(s);
      const { receivedMinor: _received, ...base } = await paymentInput(s);
      void _received;
      const input = { ...base, method, receiptNumber: `REF-${method.slice(0, 3)}-001` };
      const first = result(await pay(input, method === 'TERMINAL' ? owner : branchAdmin));
      expect(first).toMatchObject({
        method,
        receiptNumber: input.receiptNumber,
        receivedMinor: null,
        changeMinor: null,
      });
      expect(result(await pay(input))).toEqual(first);
    },
  );
  it('pago parcial por persona no salda lo de otra persona y rechaza exceso', async () => {
    const s = await table();
    const a = await order(s);
    const b = await order(s);
    const input = await paymentInput(s, { participantId: a.participantId, amountMinor: '1600000' });
    result(await pay(input));
    const account = await bill(s);
    expect(account.participants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          participantId: a.participantId,
          paidMinor: '1600000',
          outstandingMinor: '1600000',
        }),
        expect.objectContaining({
          participantId: b.participantId,
          paidMinor: '0',
          outstandingMinor: '3200000',
        }),
      ]),
    );
    expect(
      await pay(await paymentInput(s, { participantId: a.participantId, amountMinor: '1600001' })),
    ).toMatchObject({ ok: false, status: 'FAILED_PRECONDITION' });
    result(
      await pay(await paymentInput(s, { participantId: a.participantId, amountMinor: '1600000' })),
    );
    expect((await bill(s)).outstandingMinor).toBe('3200000');
  });
  it('niega pagos a mesero, cocina, comensal, otra empresa y sucursal no asignada', async () => {
    const s = await table();
    const item = await order(s);
    const input = await paymentInput(s);
    for (const user of [waiter, kitchen, item.user, outsider, unassigned]) {
      expect(await pay(input, user), user.label).toMatchObject({
        ok: false,
        status: 'PERMISSION_DENIED',
      });
    }
    expect(await callFunction(null, 'recordPayment', input)).toMatchObject({
      ok: false,
      status: 'UNAUTHENTICATED',
    });
    for (const changes of [{ tenantId: otherTenant }, { branchId: otherBranch }]) {
      expect(await pay({ ...input, ...changes })).toMatchObject({
        ok: false,
        status: 'PERMISSION_DENIED',
      });
    }
    expect((await bill(s, waiter)).totalMinor).toBe('3200000');
    expect(await callFunction(kitchen, 'readBill', s)).toMatchObject({
      ok: false,
      status: 'PERMISSION_DENIED',
    });
  });
  it('revocación posterior a leer impide registrar; cuenta cerrada rechaza pagos nuevos', async () => {
    const s = await table();
    await order(s);
    const input = await paymentInput(s);
    const revoked = await createUser('c4a-revoked');
    await createProfile(revoked);
    await insertMembership(f.tenantId, revoked, 'cashier', [f.branchId]);
    await bill(s, revoked);
    expectOk(
      await mutate(owner, 'RevokeMember', {
        tenantId: f.tenantId,
        userId: revoked.uid,
        reason: 'Fin de acceso',
      }),
      'Revocar',
    );
    expect(await pay(input, revoked)).toMatchObject({ ok: false, status: 'PERMISSION_DENIED' });
    expectOk(
      await admin(
        'mutation ($id: UUID!) { tableSession_update(id: $id, data: { status: CLOSED, openTableId: null }) }',
        { id: s.sessionId },
      ),
      'Cerrar dato de prueba',
    );
    expect(await pay(input)).toMatchObject({ ok: false, status: 'FAILED_PRECONDITION' });
  });
  it('revisión antigua, exceso y campos de tarjeta no escriben pagos', async () => {
    const s = await table();
    const item = await order(s);
    const input = await paymentInput(s);
    for (const changes of [
      { amountMinor: '3200001' },
      { receivedMinor: '1' },
      { last4: '1234' },
      { cardNumber: 'no-admitido' },
    ]) {
      expect((await callFunction(cashier, 'recordPayment', { ...input, ...changes })).ok).toBe(
        false,
      );
    }
    expectOk(
      await mutate(waiter, 'CancelOrderItem', {
        ...scope(),
        itemId: item.id,
        version: item.version,
        reason: 'No disponible',
      }),
      'Cancelar',
    );
    expect(await pay(input)).toMatchObject({ ok: false, status: 'FAILED_PRECONDITION' });
    expect((await bill(s)).paidMinor).toBe('0');
  });
  it('dos envíos de la misma intención registran un solo pago', async () => {
    const s = await table();
    await order(s);
    const input = await paymentInput(s);
    const responses = await Promise.all([pay(input), pay(input)]);
    expect(result(required(responses[0]))).toEqual(result(required(responses[1])));
    expect((await bill(s)).paidMinor).toBe('3200000');
  });
  it('si cambia una línea durante el registro se revierte cuenta, pago, asignaciones, versiones y auditoría', async () => {
    const s = await table();
    await order(s);
    await order(s);
    const actor = { uid: cashier.uid, claims: {}, authTimeSeconds: 0 };
    const loaded = await realStore.load(actor, s, 'payment.record');
    if (!loaded.ok) throw new Error(loaded.error.message);
    const snapshot = loaded.value;
    const second = required(snapshot.lines[1]);
    expectOk(
      await mutate(waiter, 'CancelOrderItem', {
        ...scope(),
        itemId: second.id,
        version: second.version,
        reason: 'Agotado antes del pago',
      }),
      'Cancelar segunda',
    );
    const input: RecordPaymentRequest = {
      ...s,
      revision: accountRevision(snapshot),
      idempotencyKey: randomUUID(),
      method: 'CASH',
      currency: 'COP',
      amountMinor: '6400000',
      tipMinor: '0',
      receivedMinor: '6400000',
    };
    const paymentId = randomUUID().replaceAll('-', '');
    expect(
      await realStore.record(actor, {
        input,
        snapshot,
        fingerprint: paymentFingerprint(input),
        payment: {
          paymentId,
          method: 'CASH',
          amountMinor: '6400000',
          tipMinor: '0',
          currency: 'COP',
          receivedMinor: '6400000',
          changeMinor: '0',
          receiptNumber: null,
        },
        allocations: snapshot.lines.map((l) => ({
          orderItemId: l.id,
          amountMinor: l.lineTotalMinor,
        })),
      }),
    ).toBe(false);
    const persisted = expectOk(
      await admin<{
        bills: unknown[];
        billPayment: unknown;
        paymentAllocations: unknown[];
        auditEvents: unknown[];
        orderItem: { version: number };
      }>(
        'query ($s: UUID!, $p: UUID!, $ref: String!, $line: UUID!) { bills(where: { sessionId: { eq: $s } }) { id } billPayment(id: $p) { id } paymentAllocations(where: { paymentId: { eq: $p } }) { id } auditEvents(where: { resourceId: { eq: $ref } }) { id } orderItem(id: $line) { version } }',
        { s: s.sessionId, p: paymentId, ref: paymentId, line: required(snapshot.lines[0]).id },
      ),
      'Reversión',
    );
    expect(persisted).toEqual({
      bills: [],
      billPayment: null,
      paymentAllocations: [],
      auditEvents: [],
      orderItem: { version: required(snapshot.lines[0]).version },
    });
  });
});
