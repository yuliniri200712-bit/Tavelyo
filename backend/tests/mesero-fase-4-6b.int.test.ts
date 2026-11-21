import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import type {
  BillResponse,
  BillScope,
  JoinTableSessionResponse,
  StaffOrderResponse,
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

// Parte 6b de la Fase 4 con los emuladores reales: el mesero toma pedidos que van siempre directo a
// cocina (D-42), para personas sin teléfono con su propio saldo o para un comensal con teléfono
// (D-43). Cada pedido de la carta de prueba vale $ 32.000.

function result<T>(r: CallResult<T>): T {
  if (!r.ok) throw new Error(`${r.status}: ${r.message}`);
  return r.result;
}
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Falta un dato de la prueba');
  return value;
}

let owner: TestUser;
let waiter: TestUser;
let colleague: TestUser;
let northWaiter: TestUser;
let cashier: TestUser;
let kitchen: TestUser;
let outsider: TestUser;
let f: Fixture;
let northBranch: string;
let northSector: string;
let otherTenant: string;
let priceId: string;
let sequence = 0;
const scope = () => ({ tenantId: f.tenantId, branchId: f.branchId });

async function table(where = scope(), sectorId = f.sectorId): Promise<BillScope> {
  const id = expectOk(
    await mutate<{ diningTable_insert: { id: string } }>(owner, 'CreateTable', {
      ...where,
      sectorId,
      code: `C${++sequence}`,
      seats: 4,
    }),
    'Crear mesa',
  ).diningTable_insert.id;
  expectOk(await mutate(owner, 'OpenTableSession', { ...where, tableId: id }), 'Abrir mesa');
  const rows = expectOk(
    await admin<{ tableSessions: { id: string }[] }>(
      'query ($id: UUID!) { tableSessions(where: { tableId: { eq: $id }, status: { eq: OPEN } }) { id } }',
      { id },
    ),
    'Sesión',
  );
  return { ...where, sessionId: required(rows.tableSessions[0]).id };
}

const desk = (user: TestUser, s: BillScope) => query(user, 'StaffOrderDesk', { ...s });
const addGuest = (user: TestUser, s: BillScope, number: number) =>
  mutate<{ sessionParticipant_insert: { id: string } }>(user, 'AddTableGuest', { ...s, number });
async function guest(s: BillScope, number = 1, user = waiter): Promise<string> {
  return expectOk(await addGuest(user, s, number), 'Persona sin teléfono').sessionParticipant_insert
    .id;
}
const request = (s: BillScope, participantId: string, idempotencyKey = randomUUID()) => ({
  ...s,
  participantId,
  idempotencyKey,
  expectedTotalMinor: '3200000',
  lines: [{ productId: f.productId, priceId, quantity: 1, optionIds: [f.optionId] }],
});
const staffOrder = (user: TestUser, data: Record<string, unknown>) =>
  callFunction<StaffOrderResponse>(user, 'submitStaffOrder', data);

async function ordersOf(s: BillScope) {
  return expectOk(
    await admin<{
      orders: {
        id: string;
        approval: string;
        sentToKitchenAt: string | null;
        participantId: string;
        quote: { id: string; staffUid: string | null };
      }[];
    }>(
      'query ($id: UUID!) { orders(where: { sessionId: { eq: $id } }) { id approval sentToKitchenAt participantId quote { id staffUid } } }',
      { id: s.sessionId },
    ),
    'Pedidos',
  ).orders;
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

/** Comensal con teléfono que se une a la mesa por el QR. */
async function customer(s: BillScope) {
  const qr = expectOk(
    await admin<{ tableSession: { table: { qrPublicId: string } } }>(
      'query ($id: UUID!) { tableSession(id: $id) { table { qrPublicId } } }',
      { id: s.sessionId },
    ),
    'QR',
  ).tableSession.table.qrPublicId;
  const user = await createAnonymousUser(`6b-cliente-${++sequence}`);
  const joined = result(
    await callFunction<JoinTableSessionResponse>(user, 'joinTableSession', { qrPublicId: qr }),
  );
  return { user, participantId: joined.participantId };
}

beforeAll(async () => {
  await seedAuthorizationCatalog();
  [owner, waiter, colleague, northWaiter, cashier, kitchen, outsider] = await Promise.all([
    createUser('6b-owner'),
    createUser('6b-waiter'),
    createUser('6b-colleague'),
    createUser('6b-north'),
    createUser('6b-cashier'),
    createUser('6b-kitchen'),
    createUser('6b-outside'),
  ]);
  for (const user of [owner, waiter, colleague, northWaiter, cashier, kitchen, outsider])
    await createProfile(user);
  const tenant = await provisionTenant('Mesero 6b', owner, ['Centro', 'Norte']);
  otherTenant = (await provisionTenant('Otra empresa 6b', outsider, ['Sur'])).id;
  const branchId = required(tenant.branches.Centro);
  northBranch = required(tenant.branches.Norte);
  await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
  await insertMembership(tenant.id, colleague, 'waiter', [branchId]);
  await insertMembership(tenant.id, northWaiter, 'waiter', [northBranch]);
  await insertMembership(tenant.id, cashier, 'cashier', [branchId]);
  await insertMembership(tenant.id, kitchen, 'kitchen', [branchId]);
  f = await buildFixture(owner, tenant.id, branchId);
  northSector = expectOk(
    await mutate<{ sector_insert: { id: string } }>(owner, 'CreateSector', {
      tenantId: tenant.id,
      branchId: northBranch,
      name: 'Salón norte',
      sort: 1,
    }),
    'Sector norte',
  ).sector_insert.id;
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
}, 120_000);

describe('6b: pedidos del mesero en emuladores (D-42, D-43)', () => {
  it('va directo a cocina aunque la sucursal pida aprobación, y el comensal no puede reenviarlo', async () => {
    await setApproval('WAITER_APPROVAL');
    try {
      const s = await table();
      const person = await guest(s);
      const sent = result(await staffOrder(waiter, request(s, person)));
      expect(sent).toMatchObject({ outcome: 'sent' });
      const [order] = await ordersOf(s);
      expect(order).toMatchObject({ approval: 'NOT_REQUIRED', participantId: person });
      expect(order?.sentToKitchenAt).not.toBeNull();
      expect(order?.quote.staffUid).toBe(waiter.uid);
      // Un comensal de la misma mesa no puede enviar como suyo el resumen del mesero.
      const diner = await customer(s);
      const stolen = await callFunction<SubmitOrderResponse>(diner.user, 'submitOrder', {
        quoteId: required(order).quote.id,
      });
      expect(stolen.ok).toBe(false);
      expect(await ordersOf(s)).toHaveLength(1);
      const audit = expectOk(
        await admin<{ auditEvents: { operation: string }[] }>(
          'query ($t: UUID!, $a: String!) { auditEvents(where: { tenantId: { eq: $t }, actorId: { eq: $a }, operation: { in: ["session_participant.add_guest", "order.send_to_kitchen"] } }) { operation } }',
          { t: f.tenantId, a: waiter.uid },
        ),
        'Auditoría',
      ).auditEvents.map((e) => e.operation);
      expect(audit).toEqual(
        expect.arrayContaining(['session_participant.add_guest', 'order.send_to_kitchen']),
      );
    } finally {
      await setApproval('DIRECT');
    }
  }, 90_000);

  it('cada persona tiene su saldo y su número: con teléfono «Persona 1», sin teléfono el suyo', async () => {
    const s = await table();
    const diner = await customer(s);
    const person = await guest(s, 1);
    result(await staffOrder(waiter, request(s, diner.participantId)));
    result(await staffOrder(waiter, request(s, person)));
    const bill = result(await callFunction<BillResponse>(cashier, 'readBill', s));
    expect(bill.totalMinor).toBe('6400000');
    expect(bill.participants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          participantId: diner.participantId,
          personNumber: 1,
          outstandingMinor: '3200000',
        }),
        expect.objectContaining({
          participantId: person,
          guestNumber: 1,
          outstandingMinor: '3200000',
        }),
      ]),
    );
  }, 90_000);

  it('la misma clave no crea otro pedido; con otro contenido se rechaza', async () => {
    const s = await table();
    const person = await guest(s);
    const key = randomUUID();
    const first = result(await staffOrder(waiter, request(s, person, key)));
    expect(result(await staffOrder(waiter, request(s, person, key)))).toEqual(first);
    const other = { ...request(s, person, key), expectedTotalMinor: '6400000' };
    other.lines = [{ ...required(other.lines[0]), quantity: 2 }];
    expect((await staffOrder(waiter, other)).ok).toBe(false);
    expect(await ordersOf(s)).toHaveLength(1);
  }, 90_000);

  it('aísla empresa, sucursal y mesa en la carta, en agregar personas y en el envío', async () => {
    const s = await table();
    const person = await guest(s);
    const north = await table({ tenantId: f.tenantId, branchId: northBranch }, northSector);
    const northPerson = await guest(north, 1, northWaiter);
    const attempts: [TestUser, BillScope, string][] = [
      // Otra empresa con los identificadores de esta.
      [outsider, s, person],
      [outsider, { ...s, tenantId: otherTenant }, person],
      // Mesero de otra sucursal.
      [northWaiter, s, person],
      // Sesión de otra sucursal presentada como de esta.
      [waiter, { ...north, branchId: f.branchId }, northPerson],
      // Persona de otra mesa en esta sesión.
      [waiter, s, northPerson],
    ];
    for (const [user, where, participant] of attempts) {
      expect((await staffOrder(user, request(where, participant))).ok).toBe(false);
    }
    for (const [user, where] of attempts.slice(0, 4)) {
      expect((await desk(user, where)).errors?.length).toBeTruthy();
      expect((await addGuest(user, where, 5)).errors?.length).toBeTruthy();
    }
    expect(await ordersOf(s)).toHaveLength(0);
    expect(await ordersOf(north)).toHaveLength(0);
  }, 120_000);

  it('el cajero, la cocina y una membresía revocada no toman pedidos', async () => {
    const s = await table();
    const person = await guest(s);
    const revoked = await createUser(`6b-revocado-${++sequence}`);
    await createProfile(revoked);
    await insertMembership(f.tenantId, revoked, 'waiter', [f.branchId]);
    expectOk(await desk(revoked, s), 'Carta antes de revocar');
    expectOk(
      await admin(
        'mutation ($t: UUID!, $u: String!) { membership_update(key: { tenantId: $t, userId: $u }, data: { status: REVOKED }) }',
        { t: f.tenantId, u: revoked.uid },
      ),
      'Revocar',
    );
    for (const user of [cashier, kitchen, revoked]) {
      expect((await desk(user, s)).errors?.length).toBeTruthy();
      expect((await addGuest(user, s, 7)).errors?.length).toBeTruthy();
      expect(await staffOrder(user, request(s, person))).toMatchObject({
        ok: false,
        status: 'PERMISSION_DENIED',
      });
    }
    expect(await ordersOf(s)).toHaveLength(0);
  }, 120_000);

  it('con la mesa cerrada no agrega personas ni envía pedidos', async () => {
    const s = await table();
    const person = await guest(s);
    expectOk(await mutate(waiter, 'CloseTableSession', { ...s }), 'Cerrar mesa sin consumo');
    expect((await addGuest(waiter, s, 2)).errors?.length).toBeTruthy();
    expect((await desk(waiter, s)).errors?.length).toBeTruthy();
    expect((await staffOrder(waiter, request(s, person))).ok).toBe(false);
    expect(await ordersOf(s)).toHaveLength(0);
  }, 90_000);

  it('a la persona retirada no se le toman pedidos; la carta la sigue numerando', async () => {
    const s = await table();
    const person = await guest(s);
    expectOk(
      await mutate(waiter, 'RemoveParticipant', { ...scope(), participantId: person }),
      'Retirar',
    );
    expect((await staffOrder(waiter, request(s, person))).ok).toBe(false);
    const people = expectOk(await desk(waiter, s), 'Carta').sessionParticipants as {
      id: string;
      guestNumber: number;
      removedAt: string | null;
    }[];
    expect(people).toEqual([expect.objectContaining({ id: person, guestNumber: 1 })]);
    expect(people[0]?.removedAt).not.toBeNull();
  }, 90_000);

  it('dos meseros agregan el mismo número a la vez: solo uno lo crea', async () => {
    const s = await table();
    const outcomes = await Promise.all([addGuest(waiter, s, 1), addGuest(colleague, s, 1)]);
    expect(outcomes.filter((r) => !r.errors?.length)).toHaveLength(1);
    const rows = expectOk(
      await admin<{ sessionParticipants: { id: string }[] }>(
        'query ($id: UUID!) { sessionParticipants(where: { sessionId: { eq: $id }, guestNumber: { eq: 1 } }) { id } }',
        { id: s.sessionId },
      ),
      'Personas',
    ).sessionParticipants;
    expect(rows).toHaveLength(1);
    // Fuera del rango admitido (1 a 99).
    expect((await addGuest(waiter, s, 0)).errors?.length).toBeTruthy();
    expect((await addGuest(waiter, s, 100)).errors?.length).toBeTruthy();
  }, 90_000);
});
