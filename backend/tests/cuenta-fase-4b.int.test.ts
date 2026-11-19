import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import type {
  BillPaymentsResponse,
  BillResponse,
  BillScope,
  JoinTableSessionResponse,
  QuoteOrderResponse,
  RecordedPaymentResponse,
  RecordPaymentRequest,
  RecordRefundResponse,
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

// Parte 4b con las funciones reales: división en partes iguales (D-06) y reembolsos por plato y
// generales con topes por rol (D-34, D-37). Cada pedido de la carta de prueba vale $ 32.000.

function result<T>(r: CallResult<T>): T {
  if (!r.ok) throw new Error(`${r.status}: ${r.message}`);
  return r.result;
}
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Falta un dato de la prueba');
  return value;
}
const pesos = (n: number) => (BigInt(n) * 100n).toString();

let owner: TestUser;
let cashier: TestUser;
let branchAdmin: TestUser;
let waiter: TestUser;
let outsider: TestUser;
let unassigned: TestUser;
let f: Fixture;
let priceId: string;
let sequence = 0;
const scope = () => ({ tenantId: f.tenantId, branchId: f.branchId });

async function table(): Promise<BillScope> {
  const id = expectOk(
    await mutate<{ diningTable_insert: { id: string } }>(owner, 'CreateTable', {
      ...scope(),
      sectorId: f.sectorId,
      code: `R${++sequence}`,
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

async function order(s: BillScope) {
  const qr = expectOk(
    await admin<{ tableSession: { table: { qrPublicId: string } } }>(
      'query ($id: UUID!) { tableSession(id: $id) { table { qrPublicId } } }',
      { id: s.sessionId },
    ),
    'QR',
  ).tableSession.table.qrPublicId;
  const user = await createAnonymousUser(`reembolso-cliente-${++sequence}`);
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
  const sent = result(
    await callFunction<SubmitOrderResponse>(user, 'submitOrder', { quoteId: quote.quoteId }),
  );
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

const bill = async (s: BillScope, extra: Record<string, unknown> = {}, user = cashier) =>
  result(await callFunction<BillResponse>(user, 'readBill', { ...s, ...extra }));

async function payAll(s: BillScope, amountMinor?: string): Promise<RecordedPaymentResponse> {
  const account = await bill(s);
  const input: RecordPaymentRequest = {
    ...s,
    revision: account.revision,
    idempotencyKey: randomUUID(),
    method: 'CASH',
    currency: 'COP',
    amountMinor: amountMinor ?? account.outstandingMinor,
    tipMinor: '0',
    receivedMinor: amountMinor ?? account.outstandingMinor,
  };
  return result(await callFunction<RecordedPaymentResponse>(cashier, 'recordPayment', input));
}

async function refundInput(s: BillScope, extra: Record<string, unknown>) {
  return {
    ...s,
    revision: (await bill(s)).revision,
    idempotencyKey: randomUUID(),
    reason: 'El plato salió frío',
    ...extra,
  };
}
const refund = (input: Record<string, unknown>, user = cashier) =>
  callFunction<RecordRefundResponse>(user, 'refundPayment', input);

beforeAll(async () => {
  await seedAuthorizationCatalog();
  [owner, cashier, branchAdmin, waiter, outsider, unassigned] = await Promise.all([
    createUser('c4b-owner'),
    createUser('c4b-cashier'),
    createUser('c4b-admin'),
    createUser('c4b-waiter'),
    createUser('c4b-outside'),
    createUser('c4b-unassigned'),
  ]);
  for (const user of [owner, cashier, branchAdmin, waiter, outsider, unassigned])
    await createProfile(user);
  const tenant = await provisionTenant('Cuenta 4b', owner, ['Centro', 'Norte']);
  const otherBranch = required(tenant.branches.Norte);
  await provisionTenant('Otra cuenta 4b', outsider, ['Sur']);
  const branchId = required(tenant.branches.Centro);
  await insertMembership(tenant.id, cashier, 'cashier', [branchId]);
  await insertMembership(tenant.id, branchAdmin, 'branch_admin', [branchId]);
  await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
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

describe('4b: división y reembolsos en emuladores', () => {
  it('divide en partes iguales exactas y cada parte se cobra hasta saldar', async () => {
    const s = await table();
    await order(s);
    const split = (await bill(s, { parts: 3 })).split;
    // $ 32.000 / 3: sobran 2 pesos, que van a las dos primeras partes.
    expect(split).toEqual([pesos(10_667), pesos(10_667), pesos(10_666)]);
    for (const part of required(split ?? undefined)) await payAll(s, part);
    expect(await bill(s)).toMatchObject({ paidMinor: pesos(32_000), outstandingMinor: '0' });
  }, 60_000);

  it('reembolso general: devuelve con motivo, la cuenta no cambia y el reintento no duplica', async () => {
    const s = await table();
    await order(s);
    const paid = await payAll(s);
    const input = await refundInput(s, { paymentId: paid.paymentId, amountMinor: pesos(10_000) });
    const first = result(await refund(input));
    expect(first).toMatchObject({ kind: 'GENERAL', totalMinor: pesos(10_000) });
    expect(result(await refund(input))).toEqual(first);
    expect(await bill(s)).toMatchObject({
      paidMinor: pesos(32_000),
      outstandingMinor: '0',
      refundedMinor: pesos(10_000),
    });
    const payments = result(
      await callFunction<BillPaymentsResponse>(cashier, 'readBillPayments', s),
    );
    expect(payments.payments).toMatchObject([
      { paymentId: paid.paymentId, refundedMinor: pesos(10_000), refundableMinor: pesos(22_000) },
    ]);
    const rows = expectOk(
      await admin<{ refunds: { requestedBy: string; reason: string }[]; auditEvents: unknown[] }>(
        'query ($p: UUID!, $b: String!) { refunds(where: { paymentId: { eq: $p } }) { requestedBy reason } auditEvents(where: { operation: { eq: "payment.refund" }, resourceId: { eq: $b } }) { id } }',
        {
          p: paid.paymentId,
          b: required(
            expectOk(
              await admin<{ bills: { id: string }[] }>(
                'query ($s: UUID!) { bills(where: { sessionId: { eq: $s } }) { id } }',
                { s: s.sessionId },
              ),
              'Cuenta',
            ).bills[0],
          ).id,
        },
      ),
      'Reembolso guardado',
    );
    expect(rows.refunds).toEqual([{ requestedBy: cashier.uid, reason: 'El plato salió frío' }]);
    expect(rows.auditEvents).toHaveLength(1);
  }, 60_000);

  it('topes D-34: el cajero no pasa de $ 50.000; el administrador sí; nunca más de lo pagado', async () => {
    const s = await table();
    await order(s);
    await order(s);
    const paid = await payAll(s);
    expect(
      await refund(await refundInput(s, { paymentId: paid.paymentId, amountMinor: pesos(50_001) })),
    ).toMatchObject({ ok: false, status: 'PERMISSION_DENIED' });
    expect(
      result(
        await refund(
          await refundInput(s, { paymentId: paid.paymentId, amountMinor: pesos(60_000) }),
          branchAdmin,
        ),
      ),
    ).toMatchObject({ totalMinor: pesos(60_000) });
    expect(
      await refund(
        await refundInput(s, { paymentId: paid.paymentId, amountMinor: pesos(4_001) }),
        owner,
      ),
    ).toMatchObject({ ok: false, status: 'FAILED_PRECONDITION' });
  }, 60_000);

  it('reembolso por plato: devuelve lo pagado, cancela el plato y el total baja', async () => {
    const s = await table();
    const returned = await order(s);
    const kept = await order(s);
    await payAll(s);
    const input = await refundInput(s, { orderItemId: returned.id });
    const done = result(await refund(input));
    expect(done).toMatchObject({
      kind: 'LINE',
      totalMinor: pesos(32_000),
      orderItemId: returned.id,
    });
    expect(result(await refund(input))).toEqual(done);
    expect(await bill(s)).toMatchObject({
      totalMinor: pesos(32_000),
      paidMinor: pesos(32_000),
      outstandingMinor: '0',
      refundedMinor: pesos(32_000),
      lines: [{ id: kept.id }],
    });
    const line = expectOk(
      await admin<{ orderItem: { status: string; cancelReason: string; wasted: boolean } }>(
        'query ($id: UUID!) { orderItem(id: $id) { status cancelReason wasted } }',
        { id: returned.id },
      ),
      'Plato devuelto',
    );
    expect(line.orderItem).toEqual({
      status: 'CANCELLED',
      cancelReason: 'El plato salió frío',
      wasted: false,
    });
    expect(await refund(await refundInput(s, { orderItemId: returned.id }))).toMatchObject({
      ok: false,
    });
  }, 60_000);

  it('aislamiento: mesero, otra empresa y otra sucursal no reembolsan ni ven los pagos', async () => {
    const s = await table();
    await order(s);
    const paid = await payAll(s);
    const input = await refundInput(s, { paymentId: paid.paymentId, amountMinor: pesos(1_000) });
    for (const user of [waiter, outsider, unassigned]) {
      expect(await refund({ ...input, idempotencyKey: randomUUID() }, user)).toMatchObject({
        ok: false,
        status: 'PERMISSION_DENIED',
      });
      expect(await callFunction(user, 'readBillPayments', s)).toMatchObject({ ok: false });
    }
    expect((await bill(s)).refundedMinor).toBe('0');
  }, 60_000);

  it('concurrencia: dos reembolsos a la vez con la misma revisión, solo uno pasa', async () => {
    const s = await table();
    await order(s);
    const paid = await payAll(s);
    const base = await refundInput(s, { paymentId: paid.paymentId, amountMinor: pesos(20_000) });
    const [a, b] = await Promise.all([
      refund({ ...base, idempotencyKey: randomUUID() }, cashier),
      refund({ ...base, idempotencyKey: randomUUID() }, branchAdmin),
    ]);
    expect([a.ok, b.ok].filter(Boolean)).toHaveLength(1);
    expect((await bill(s)).refundedMinor).toBe(pesos(20_000));
  }, 60_000);
});
