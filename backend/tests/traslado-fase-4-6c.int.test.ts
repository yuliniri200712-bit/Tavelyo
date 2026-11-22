import { beforeAll, describe, expect, it } from 'vitest';
import type { JoinTableSessionResponse } from '@tavelyo/contracts';
import { buildFixture, type Fixture } from '../../dataconnect/tests/support/catalog-fixture.ts';
import {
  admin,
  createAnonymousUser,
  createUser,
  expectOk,
  mutate,
  type TestUser,
} from '../../dataconnect/tests/support/emulator.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
} from '../../dataconnect/tests/support/provisioning.ts';
import { callFunction, type CallResult } from './support/functions.ts';

// Parte 6c de la Fase 4 con los emuladores reales: tras trasladar la mesa (D-42), quien seguía en la
// sesión y vuelve a escanear o recarga el QR de la mesa vieja llega a su sesión en la mesa nueva.

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
let f: Fixture;
let otherBranch: { tenantId: string; branchId: string; sectorId: string };
let sequence = 0;
const scope = () => ({ tenantId: f.tenantId, branchId: f.branchId });

async function table(where = scope(), sectorId = f.sectorId) {
  const code = `T${++sequence}`;
  const id = expectOk(
    await mutate<{ diningTable_insert: { id: string } }>(owner, 'CreateTable', {
      ...where,
      sectorId,
      code,
      seats: 4,
    }),
    'Crear mesa',
  ).diningTable_insert.id;
  const qr = expectOk(
    await admin<{ diningTable: { qrPublicId: string } }>(
      'query ($id: UUID!) { diningTable(id: $id) { qrPublicId } }',
      { id },
    ),
    'QR',
  ).diningTable.qrPublicId;
  return { id, code, qr };
}
const openTable = async (tableId: string, where = scope(), user = waiter) =>
  expectOk(
    await mutate<{ tableSession_insert: { id: string } }>(user, 'OpenTableSession', {
      ...where,
      tableId,
    }),
    'Abrir mesa',
  ).tableSession_insert.id;
const join = (user: TestUser, qrPublicId: string) =>
  callFunction<JoinTableSessionResponse>(user, 'joinTableSession', { qrPublicId });
const transfer = (sessionId: string, sourceId: string, tableId: string) =>
  mutate(waiter, 'TransferTableSession', { ...scope(), sessionId, sourceId, tableId });

beforeAll(async () => {
  await seedAuthorizationCatalog();
  [owner, waiter] = await Promise.all([createUser('6c-owner'), createUser('6c-waiter')]);
  for (const user of [owner, waiter]) await createProfile(user);
  const tenant = await provisionTenant('Traslado 6c', owner, ['Centro', 'Norte']);
  const branchId = required(tenant.branches.Centro);
  const north = required(tenant.branches.Norte);
  await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
  f = await buildFixture(owner, tenant.id, branchId);
  otherBranch = {
    tenantId: tenant.id,
    branchId: north,
    sectorId: expectOk(
      await mutate<{ sector_insert: { id: string } }>(owner, 'CreateSector', {
        tenantId: tenant.id,
        branchId: north,
        name: 'Norte',
        sort: 1,
      }),
      'Sector norte',
    ).sector_insert.id,
  };
}, 120_000);

describe('6c: el comensal sigue a su sesión trasladada (D-42)', () => {
  it('con el QR de la mesa vieja vuelve a su sesión con el código de la mesa nueva', async () => {
    const from = await table();
    const to = await table();
    const session = await openTable(from.id);
    const diner = await createAnonymousUser(`6c-cliente-${++sequence}`);
    const before = result(await join(diner, from.qr));
    expect(before).toMatchObject({ sessionId: session, tableCode: from.code });
    expect(before).not.toHaveProperty('transferred');
    expectOk(await transfer(session, from.id, to.id), 'Trasladar');

    const after = result(await join(diner, from.qr));
    expect(after).toEqual({
      ...before,
      tableCode: to.code,
      transferred: true,
    });
    // Con el QR de la mesa nueva es la misma participación, sin aviso de traslado.
    const direct = result(await join(diner, to.qr));
    expect(direct).toMatchObject({ participantId: before.participantId, tableCode: to.code });
    expect(direct).not.toHaveProperty('transferred');
    const rows = expectOk(
      await admin<{ sessionParticipants: { id: string }[] }>(
        'query ($id: UUID!) { sessionParticipants(where: { sessionId: { eq: $id } }) { id } }',
        { id: session },
      ),
      'Personas',
    ).sessionParticipants;
    expect(rows).toHaveLength(1);
  }, 90_000);

  it('quien no estaba, la persona retirada y otra sucursal no llegan a la sesión trasladada', async () => {
    const from = await table();
    const to = await table();
    const session = await openTable(from.id);
    const removed = await createAnonymousUser(`6c-retirada-${++sequence}`);
    const participant = result(await join(removed, from.qr)).participantId;
    expectOk(
      await mutate(waiter, 'RemoveParticipant', { ...scope(), participantId: participant }),
      'Retirar',
    );
    expectOk(await transfer(session, from.id, to.id), 'Trasladar');

    const stranger = await createAnonymousUser(`6c-ajena-${++sequence}`);
    for (const user of [stranger, removed]) {
      expect(await join(user, from.qr)).toMatchObject({
        ok: false,
        status: 'FAILED_PRECONDITION',
      });
    }
    // Una persona de esta sesión que escanea una mesa libre de otra sucursal no llega a ella.
    const diner = await createAnonymousUser(`6c-cliente-${++sequence}`);
    result(await join(diner, to.qr));
    const north = await table(
      { tenantId: otherBranch.tenantId, branchId: otherBranch.branchId },
      otherBranch.sectorId,
    );
    expect(await join(diner, north.qr)).toMatchObject({ ok: false, status: 'FAILED_PRECONDITION' });
  }, 90_000);

  it('con la sesión trasladada ya cerrada, el QR viejo vuelve a decir que la mesa no está abierta', async () => {
    const from = await table();
    const to = await table();
    const session = await openTable(from.id);
    const diner = await createAnonymousUser(`6c-cliente-${++sequence}`);
    result(await join(diner, from.qr));
    expectOk(await transfer(session, from.id, to.id), 'Trasladar');
    expectOk(
      await mutate(waiter, 'CloseTableSession', { ...scope(), sessionId: session }),
      'Cerrar mesa',
    );
    expect(await join(diner, from.qr)).toMatchObject({
      ok: false,
      status: 'FAILED_PRECONDITION',
      message: expect.stringContaining('no está abierta'),
    });
  }, 90_000);
});
