// Capacidades del esquema de la Fase 3 (pedidos), verificadas en el emulador antes de escribir los
// conectores: estación predeterminada única, estaciones de la misma sucursal, un pedido por
// resumen, FK compuestas entre empresas, versión con cambio condicionado (caso 4) y una sola
// solicitud pendiente de cada tipo por mesa.
import { beforeAll, describe, expect, it } from 'vitest';
import { admin, createAnonymousUser, createUser, expectOk } from './support/emulator.ts';
import { buildFixture, FIXTURE_PRICE_MINOR, type Fixture } from './support/catalog-fixture.ts';
import {
  createProfile,
  provisionTenant,
  seedAuthorizationCatalog,
} from './support/provisioning.ts';

const REJECTED_REFERENCE = /foreign key|violates|constraint/i;
const DUPLICATE = /duplicate|unique|already exists/i;

let fixture: Fixture;
let otherFixture: Fixture;
let northBranchId: string;
let sessionId: string;
let participantId: string;
let quoteId: string;
let stations: { kitchen: string; bar: string; north: string; otherTenant: string };

async function insertId(document: string, variables: Record<string, unknown>, label: string) {
  const data = expectOk(
    await admin<Record<string, { id: string } | null>>(document, variables),
    label,
  );
  const id = Object.values(data)[0]?.id;
  if (!id) throw new Error(`${label} no devolvió id`);
  return id;
}

const errorsOf = async (document: string, variables: Record<string, unknown>) =>
  (await admin(document, variables)).errors.join(' ');

function insertStation(tenantId: string, branchId: string, name: string, isDefault: boolean) {
  return insertId(
    `mutation ($t: UUID!, $b: UUID!, $n: String!, $d: UUID) {
      station_insert(data: { tenantId: $t, branchId: $b, name: $n, sort: 1, defaultForBranchId: $d })
    }`,
    { t: tenantId, b: branchId, n: name, d: isDefault ? branchId : null },
    `Estación ${name}`,
  );
}

const INSERT_ORDER = `mutation ($t: UUID!, $b: UUID!, $s: UUID!, $p: UUID!, $q: UUID!) {
  order_insert(data: { tenantId: $t, branchId: $b, sessionId: $s, participantId: $p, quoteId: $q })
}`;

const INSERT_ITEM = `mutation ($t: UUID!, $b: UUID!, $o: UUID!, $pos: Int!, $prod: UUID!, $st: UUID!) {
  orderItem_insert(data: {
    tenantId: $t, branchId: $b, orderId: $o, position: $pos, productId: $prod, stationId: $st,
    productNameSnapshot: "Bandeja paisa", allergensSnapshot: ["huevo"], quantity: 1,
    unitPriceMinor: "3200000", modifiersMinor: "0", lineTotalMinor: "3200000", taxMinor: "237037",
    status: RECEIVED
  })
}`;

beforeAll(async () => {
  await seedAuthorizationCatalog();
  const owner = await createUser('f3-owner');
  const otherOwner = await createUser('f3-owner-b');
  for (const user of [owner, otherOwner]) await createProfile(user);
  const tenant = await provisionTenant('Pedidos A', owner, ['Centro', 'Norte']);
  const other = await provisionTenant('Pedidos B', otherOwner, ['Única']);
  northBranchId = tenant.branches['Norte'] ?? '';
  fixture = await buildFixture(owner, tenant.id, tenant.branches['Centro'] ?? '');
  otherFixture = await buildFixture(otherOwner, other.id, other.branches['Única'] ?? '');

  stations = {
    kitchen: await insertStation(fixture.tenantId, fixture.branchId, 'Cocina', true),
    bar: await insertStation(fixture.tenantId, fixture.branchId, 'Bar', false),
    north: await insertStation(fixture.tenantId, northBranchId, 'Cocina Norte', true),
    otherTenant: await insertStation(otherFixture.tenantId, otherFixture.branchId, 'Cocina', true),
  };

  const scope = { t: fixture.tenantId, b: fixture.branchId };
  sessionId = await insertId(
    `mutation ($t: UUID!, $b: UUID!, $table: UUID!) {
      tableSession_insert(data: { tenantId: $t, branchId: $b, tableId: $table, openTableId: $table, status: OPEN, openedBy: "prueba" })
    }`,
    { ...scope, table: fixture.tableId },
    'Sesión',
  );
  const customer = await createAnonymousUser('f3-cliente');
  participantId = await insertId(
    `mutation ($t: UUID!, $b: UUID!, $s: UUID!, $uid: String!, $exp: Timestamp!) {
      sessionParticipant_insert(data: { tenantId: $t, branchId: $b, sessionId: $s, authUid: $uid, expiresAt: $exp })
    }`,
    {
      ...scope,
      s: sessionId,
      uid: customer.uid,
      exp: new Date(Date.now() + 3_600_000).toISOString(),
    },
    'Participante',
  );
  quoteId = await insertId(
    `mutation ($t: UUID!, $b: UUID!, $s: UUID!, $p: UUID!, $total: Int64!, $exp: Timestamp!) {
      orderQuote_insert(data: {
        tenantId: $t, branchId: $b, sessionId: $s, participantId: $p, idempotencyKey: "rev_f3",
        fingerprint: "huella", currency: "COP", subtotalMinor: $total, taxMinor: "0", totalMinor: $total,
        status: AUTHORIZED, consentTextVersion: "2026-11-16", consentedAt_expr: "request.time",
        authorizedAt_expr: "request.time", expiresAt: $exp
      })
    }`,
    {
      ...scope,
      s: sessionId,
      p: participantId,
      total: FIXTURE_PRICE_MINOR,
      exp: new Date(Date.now() + 600_000).toISOString(),
    },
    'Resumen autorizado',
  );
});

describe('estaciones', () => {
  it('una sola estación predeterminada por sucursal', async () => {
    const second = await errorsOf(
      `mutation ($t: UUID!, $b: UUID!) {
        station_insert(data: { tenantId: $t, branchId: $b, name: "Otra", sort: 2, defaultForBranchId: $b })
      }`,
      { t: fixture.tenantId, b: fixture.branchId },
    );
    expect(second).toMatch(DUPLICATE);
  });

  it('un producto solo se asigna a una estación de su misma sucursal', async () => {
    const assign = (stationId: string) =>
      admin(
        `mutation ($p: UUID!, $b: UUID!, $s: UUID!) {
          productBranch_update(key: { productId: $p, branchId: $b }, data: { stationId: $s })
        }`,
        { p: fixture.productId, b: fixture.branchId, s: stationId },
      );
    expectOk(await assign(stations.bar), 'Asignar al bar');
    for (const foreign of [stations.north, stations.otherTenant]) {
      expect((await assign(foreign)).errors.join(' ')).toMatch(REJECTED_REFERENCE);
    }
  });
});

describe('pedido y líneas', () => {
  let orderId: string;

  beforeAll(async () => {
    orderId = await insertId(
      INSERT_ORDER,
      {
        t: fixture.tenantId,
        b: fixture.branchId,
        s: sessionId,
        p: participantId,
        q: quoteId,
      },
      'Pedido',
    );
  });

  it('un resumen da un solo pedido, aunque se repita la creación (caso 3)', async () => {
    const again = await errorsOf(INSERT_ORDER, {
      t: fixture.tenantId,
      b: fixture.branchId,
      s: sessionId,
      p: participantId,
      q: quoteId,
    });
    expect(again).toMatch(DUPLICATE);
  });

  it('un pedido no se vincula a un resumen de otra sucursal o empresa', async () => {
    const crossed = await errorsOf(INSERT_ORDER, {
      t: otherFixture.tenantId,
      b: otherFixture.branchId,
      s: sessionId,
      p: participantId,
      q: quoteId,
    });
    expect(crossed).toMatch(REJECTED_REFERENCE);
  });

  it('una línea no apunta a una estación de otra sucursal ni de otra empresa', async () => {
    for (const [position, station] of [
      [10, stations.north],
      [11, stations.otherTenant],
    ] as const) {
      const crossed = await errorsOf(INSERT_ITEM, {
        t: fixture.tenantId,
        b: fixture.branchId,
        o: orderId,
        pos: position,
        prod: fixture.productId,
        st: station,
      });
      expect(crossed).toMatch(REJECTED_REFERENCE);
    }
  });

  it('una opción de otra empresa no se guarda en la línea', async () => {
    const itemId = await insertId(
      INSERT_ITEM,
      {
        t: fixture.tenantId,
        b: fixture.branchId,
        o: orderId,
        pos: 2,
        prod: fixture.productId,
        st: stations.kitchen,
      },
      'Línea 2',
    );
    const insertModifier = (optionId: string, position: number) =>
      admin(
        `mutation ($t: UUID!, $b: UUID!, $i: UUID!, $o: UUID!, $pos: Int!) {
          orderItemModifier_insert(data: {
            tenantId: $t, branchId: $b, itemId: $i, optionId: $o, position: $pos,
            nameSnapshot: "Bien asada", priceDeltaMinor: "0"
          })
        }`,
        { t: fixture.tenantId, b: fixture.branchId, i: itemId, o: optionId, pos: position },
      );
    expectOk(await insertModifier(fixture.optionId, 1), 'Opción propia');
    expect((await insertModifier(otherFixture.optionId, 2)).errors.join(' ')).toMatch(
      REJECTED_REFERENCE,
    );
  });

  it('la versión empieza en 1 y un cambio condicionado gana una sola vez (caso 4)', async () => {
    const itemId = await insertId(
      INSERT_ITEM,
      {
        t: fixture.tenantId,
        b: fixture.branchId,
        o: orderId,
        pos: 1,
        prod: fixture.productId,
        st: stations.kitchen,
      },
      'Línea 1',
    );
    const start = () =>
      admin<{ orderItem_updateMany: number }>(
        `mutation ($id: UUID!) {
          orderItem_updateMany(
            where: { id: { eq: $id }, status: { eq: RECEIVED }, version: { eq: 1 } }
            data: { status: IN_PREPARATION, version_update: { inc: 1 }, startedAt_expr: "request.time" }
          )
        }`,
        { id: itemId },
      );
    expect(expectOk(await start(), 'Primera persona').orderItem_updateMany).toBe(1);
    expect(expectOk(await start(), 'Segunda persona').orderItem_updateMany).toBe(0);

    const item = expectOk(
      await admin<{
        orderItem: { status: string; version: number; startedAt: string | null } | null;
      }>(`query ($id: UUID!) { orderItem(id: $id) { status version startedAt } }`, {
        id: itemId,
      }),
      'Línea tras el cambio',
    ).orderItem;
    expect(item).toMatchObject({ status: 'IN_PREPARATION', version: 2 });
    expect(item?.startedAt).toBeTruthy();
  });
});

describe('solicitudes de servicio', () => {
  it('una sola pendiente de cada tipo por mesa; atendida, se puede volver a pedir', async () => {
    const pendingKey = `${sessionId}:CALL_WAITER`;
    const request = () =>
      admin<{ serviceRequest_insert: { id: string } }>(
        `mutation ($t: UUID!, $b: UUID!, $s: UUID!, $p: UUID!, $k: String!) {
          serviceRequest_insert(data: {
            tenantId: $t, branchId: $b, sessionId: $s, participantId: $p,
            kind: CALL_WAITER, status: PENDING, pendingKey: $k
          })
        }`,
        { t: fixture.tenantId, b: fixture.branchId, s: sessionId, p: participantId, k: pendingKey },
      );
    const first = expectOk(await request(), 'Primera solicitud').serviceRequest_insert.id;
    expect((await request()).errors.join(' ')).toMatch(DUPLICATE);

    expectOk(
      await admin(
        `mutation ($id: UUID!) {
          serviceRequest_update(id: $id, data: { status: ATTENDED, pendingKey: null, attendedAt_expr: "request.time", attendedBy: "mesero" })
        }`,
        { id: first },
      ),
      'Atender',
    );
    expectOk(await request(), 'Nueva solicitud tras atender');
  });
});
