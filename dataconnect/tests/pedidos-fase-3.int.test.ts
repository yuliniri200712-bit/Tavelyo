// Autorización de los conectores de la Fase 3 (pedidos, cocina y solicitudes) en el emulador:
// dos empresas, IDs alterados, sucursal no asignada, permisos por rol, envío a cocina solo con el
// pago autorizado (D-04), transiciones inválidas, carreras (caso 4), sesión cerrada (caso 12) y
// «Mis pedidos» solo de quien consulta (D-06).
import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  admin,
  createAnonymousUser,
  createUser,
  expectOk,
  mutate,
  query,
  server,
  type TestUser,
} from './support/emulator.ts';
import { buildFixture, type Fixture } from './support/catalog-fixture.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
} from './support/provisioning.ts';

const DENIED = /Sin permiso|Sin membresía|Sin acceso|no pertenece|@auth|not authorized/i;
const CHANGED = /Esta línea ya cambió/;

interface Table {
  readonly tableId: string;
  readonly sessionId: string;
}

interface Participant {
  readonly user: TestUser;
  readonly participantId: string;
}

interface SentItem {
  readonly id: string;
  version: number;
}

let owner: TestUser;
let waiter: TestUser;
let kitchen: TestUser;
let northKitchen: TestUser;
let otherOwner: TestUser;
let otherKitchen: TestUser;
let fixture: Fixture;
let otherFixture: Fixture;
let northBranchId: string;
let defaultStationId: string;
let main: Table;
let alice: Participant;
let bruno: Participant;

const scopeOf = (f: Fixture) => ({ tenantId: f.tenantId, branchId: f.branchId });

async function insertId(document: string, variables: Record<string, unknown>, label: string) {
  const data = expectOk(
    await admin<Record<string, { id: string } | null>>(document, variables),
    label,
  );
  const id = Object.values(data)[0]?.id;
  if (!id) throw new Error(`${label} no devolvió id`);
  return id;
}

/** Mesa nueva con su sesión abierta por el mesero. */
async function openTable(code: string): Promise<Table> {
  const tableId = expectOk(
    await mutate<{ diningTable_insert: { id: string } }>(owner, 'CreateTable', {
      ...scopeOf(fixture),
      sectorId: fixture.sectorId,
      code,
      seats: 4,
    }),
    `Mesa ${code}`,
  ).diningTable_insert.id;
  expectOk(
    await mutate(waiter, 'OpenTableSession', { ...scopeOf(fixture), tableId }),
    `Abrir ${code}`,
  );
  const sessions = expectOk(
    await admin<{ tableSessions: Array<{ id: string }> }>(
      `query ($t: UUID!) { tableSessions(where: { tableId: { eq: $t }, status: { eq: OPEN } }) { id } }`,
      { t: tableId },
    ),
    `Sesión de ${code}`,
  );
  return { tableId, sessionId: sessions.tableSessions[0]?.id ?? '' };
}

async function join(table: Table, label: string): Promise<Participant> {
  const user = await createAnonymousUser(label);
  const participantId = await insertId(
    `mutation ($t: UUID!, $b: UUID!, $s: UUID!, $uid: String!, $exp: Timestamp!) {
      sessionParticipant_insert(data: { tenantId: $t, branchId: $b, sessionId: $s, authUid: $uid, expiresAt: $exp })
    }`,
    {
      t: fixture.tenantId,
      b: fixture.branchId,
      s: table.sessionId,
      uid: user.uid,
      exp: new Date(Date.now() + 3_600_000).toISOString(),
    },
    `Participante ${label}`,
  );
  return { user, participantId };
}

/**
 * Pedido guardado como lo hará el backend (resumen, pedido y líneas con executeGraphql), todavía
 * sin enviar a cocina. Devuelve los ids para enviarlo con ServerSendOrderToKitchen.
 */
async function storeOrder(
  table: Table,
  who: Participant,
  lines: number,
  quoteStatus: 'QUOTED' | 'CONFIRMED' | 'AUTHORIZED' = 'CONFIRMED',
) {
  const base = { t: fixture.tenantId, b: fixture.branchId };
  const quoteId = await insertId(
    `mutation ($t: UUID!, $b: UUID!, $s: UUID!, $p: UUID!, $k: String!, $st: OrderQuoteStatus!, $exp: Timestamp!) {
      orderQuote_insert(data: {
        tenantId: $t, branchId: $b, sessionId: $s, participantId: $p, idempotencyKey: $k,
        fingerprint: "huella", currency: "COP", subtotalMinor: "3200000", taxMinor: "237037",
        totalMinor: "3200000", status: $st, expiresAt: $exp
      })
    }`,
    {
      ...base,
      s: table.sessionId,
      p: who.participantId,
      k: `rev_${randomUUID()}`,
      st: quoteStatus,
      exp: new Date(Date.now() + 600_000).toISOString(),
    },
    'Resumen',
  );
  const orderId = await insertId(
    `mutation ($t: UUID!, $b: UUID!, $s: UUID!, $p: UUID!, $q: UUID!) {
      order_insert(data: { tenantId: $t, branchId: $b, sessionId: $s, participantId: $p, quoteId: $q })
    }`,
    { ...base, s: table.sessionId, p: who.participantId, q: quoteId },
    'Pedido',
  );
  const items: SentItem[] = [];
  for (let position = 1; position <= lines; position += 1) {
    const id = await insertId(
      `mutation ($t: UUID!, $b: UUID!, $o: UUID!, $pos: Int!, $prod: UUID!, $st: UUID!, $opt: UUID!) {
        item: orderItem_insert(data: {
          tenantId: $t, branchId: $b, orderId: $o, position: $pos, productId: $prod, stationId: $st,
          productNameSnapshot: "Bandeja paisa", allergensSnapshot: ["huevo"], quantity: 1,
          unitPriceMinor: "3200000", modifiersMinor: "0", lineTotalMinor: "3200000",
          taxMinor: "237037", note: "Sin cebolla", status: RECEIVED
        })
        modifier: orderItemModifier_insert(data: {
          tenantId: $t, branchId: $b, itemId_expr: "response.item.id", optionId: $opt, position: 1,
          nameSnapshot: "Bien asada", priceDeltaMinor: "0"
        })
      }`,
      {
        ...base,
        o: orderId,
        pos: position,
        prod: fixture.productId,
        st: defaultStationId,
        opt: fixture.optionId,
      },
      `Línea ${position}`,
    );
    items.push({ id, version: 1 });
  }
  return { quoteId, orderId, items };
}

const sendToKitchen = (table: Table, who: Participant, orderId: string) =>
  server('mutation', 'ServerSendOrderToKitchen', {
    ...scopeOf(fixture),
    sessionId: table.sessionId,
    orderId,
    authUid: who.user.uid,
  });

async function sentOrder(table: Table, who: Participant, lines: number) {
  const order = await storeOrder(table, who, lines);
  expectOk(await sendToKitchen(table, who, order.orderId), 'Enviar a cocina');
  return order;
}

/** Ejecuta un cambio de estado con la versión conocida y, si se aplica, la actualiza. */
async function advance(
  user: TestUser,
  operation: string,
  item: SentItem,
  extra: Record<string, unknown> = {},
) {
  const result = await mutate(user, operation, {
    ...scopeOf(fixture),
    itemId: item.id,
    version: item.version,
    ...extra,
  });
  if (result.errors.length === 0) item.version += 1;
  return result;
}

interface QueueItem {
  id: string;
  status: string;
  version: number;
  allergensSnapshot: string[];
  note: string | null;
  orderItemModifiers_on_item: Array<{ nameSnapshot: string }>;
  order: { session: { table: { code: string } } };
}

const kitchenQueue = (user: TestUser, stationId = defaultStationId) =>
  query<{ orderItems: QueueItem[] }>(user, 'KitchenQueue', {
    ...scopeOf(fixture),
    stationId,
  });

beforeAll(async () => {
  await seedAuthorizationCatalog();
  owner = await createUser('f3p-owner');
  waiter = await createUser('f3p-waiter');
  kitchen = await createUser('f3p-kitchen');
  northKitchen = await createUser('f3p-kitchen-norte');
  otherOwner = await createUser('f3p-owner-b');
  otherKitchen = await createUser('f3p-kitchen-b');
  for (const user of [owner, waiter, kitchen, northKitchen, otherOwner, otherKitchen]) {
    await createProfile(user);
  }

  const tenant = await provisionTenant('Pedidos Fase 3', owner, ['Centro', 'Norte']);
  const other = await provisionTenant('Otra empresa', otherOwner, ['Única']);
  const centro = tenant.branches['Centro'] ?? '';
  northBranchId = tenant.branches['Norte'] ?? '';
  await insertMembership(tenant.id, waiter, 'waiter', [centro]);
  await insertMembership(tenant.id, kitchen, 'kitchen', [centro]);
  await insertMembership(tenant.id, northKitchen, 'kitchen', [northBranchId]);
  await insertMembership(other.id, otherKitchen, 'kitchen', [other.branches['Única'] ?? '']);
  fixture = await buildFixture(owner, tenant.id, centro);
  otherFixture = await buildFixture(otherOwner, other.id, other.branches['Única'] ?? '');

  defaultStationId = expectOk(
    await server<{ station_insert: { id: string } }>('mutation', 'ServerCreateDefaultStation', {
      ...scopeOf(fixture),
    }),
    'Estación predeterminada',
  ).station_insert.id;
  expectOk(
    await server('mutation', 'ServerCreateDefaultStation', { ...scopeOf(otherFixture) }),
    'Estación predeterminada de la otra empresa',
  );

  main = await openTable('P1');
  alice = await join(main, 'f3p-alicia');
  bruno = await join(main, 'f3p-bruno');
});

describe('estaciones', () => {
  it('la estación predeterminada es única por sucursal', async () => {
    const again = await server('mutation', 'ServerCreateDefaultStation', { ...scopeOf(fixture) });
    expect(again.errors.join(' ')).toMatch(/duplicate|unique|already exists/i);
  });

  it('una sucursal nueva nace con su estación predeterminada', async () => {
    const branchId = expectOk(
      await mutate<{ branch_insert: { id: string } }>(owner, 'CreateBranch', {
        tenantId: fixture.tenantId,
        name: 'Sur',
        currency: 'COP',
        timezone: 'America/Bogota',
      }),
      'Crear sucursal',
    ).branch_insert.id;
    const stations = expectOk(
      await query<{ stations: Array<{ name: string; defaultForBranchId: string | null }> }>(
        owner,
        'BranchStations',
        { tenantId: fixture.tenantId, branchId },
      ),
      'Estaciones de la sucursal nueva',
    ).stations;
    expect(stations).toEqual([{ ...stations[0], name: 'Cocina', defaultForBranchId: branchId }]);
  });

  it('crear, archivar y asignar estaciones exige catalog.manage y la misma sucursal', async () => {
    const create = (user: TestUser, scope: { tenantId: string; branchId: string }) =>
      mutate<{ station_insert: { id: string } }>(user, 'CreateStation', {
        ...scope,
        name: 'Bar',
        sort: 2,
      });
    for (const [user, scope] of [
      [waiter, scopeOf(fixture)],
      [kitchen, scopeOf(fixture)],
      [otherOwner, scopeOf(fixture)],
    ] as const) {
      expect((await create(user, scope)).errors.join(' '), user.label).toMatch(DENIED);
    }
    const barId = expectOk(await create(owner, scopeOf(fixture)), 'Crear bar').station_insert.id;
    const north = expectOk(
      await create(owner, { tenantId: fixture.tenantId, branchId: northBranchId }),
      'Bar del norte',
    ).station_insert.id;

    const update = (stationId: string, archived: boolean) =>
      mutate(owner, 'UpdateStation', {
        ...scopeOf(fixture),
        stationId,
        name: 'Estación',
        sort: 1,
        archived,
      });
    expect((await update(defaultStationId, true)).errors.join(' ')).toMatch(
      /predeterminada no se puede archivar/,
    );

    const assign = (stationId: string) =>
      mutate(owner, 'SetProductStation', {
        ...scopeOf(fixture),
        productId: fixture.productId,
        stationId,
      });
    expect((await assign(north)).errors.join(' ')).toMatch(/no pertenece a la sucursal/);
    expectOk(await assign(barId), 'Asignar al bar');
    const catalog = expectOk(
      await query<{ productBranches: Array<{ productId: string; stationId: string | null }> }>(
        owner,
        'BranchCatalog',
        scopeOf(fixture),
      ),
      'Carta de la sucursal',
    );
    expect(catalog.productBranches).toContainEqual(
      expect.objectContaining({ productId: fixture.productId, stationId: barId }),
    );

    expectOk(await update(barId, true), 'Archivar el bar');
    expect((await assign(barId)).errors.join(' ')).toMatch(/archivada/);
    const kitchenStations = expectOk(
      await query<{ stations: Array<{ id: string }> }>(
        kitchen,
        'KitchenStations',
        scopeOf(fixture),
      ),
      'Estaciones para cocina',
    ).stations.map((station) => station.id);
    expect(kitchenStations).toContain(defaultStationId);
    expect(kitchenStations).not.toContain(barId);
    expect((await query(waiter, 'KitchenStations', scopeOf(fixture))).errors.join(' ')).toMatch(
      DENIED,
    );
    expectOk(await assign(defaultStationId), 'Volver a la predeterminada');
  });
});

describe('envío a cocina (D-04, desde ADR-0012)', () => {
  it('sin la confirmación de su comensal el pedido no llega a cocina', async () => {
    const order = await storeOrder(main, alice, 1, 'QUOTED');
    expect((await sendToKitchen(main, alice, order.orderId)).errors.join(' ')).toMatch(
      /El pedido no está confirmado/,
    );
    const queue = expectOk(await kitchenQueue(kitchen), 'Cola').orderItems.map((item) => item.id);
    expect(queue).not.toContain(order.items[0]?.id);
  });

  it('un pedido que espera al mesero no entra a cocina por el envío directo (D-32)', async () => {
    const order = await storeOrder(main, alice, 1);
    expectOk(
      await server('mutation', 'ServerRequestOrderApproval', {
        tenantId: fixture.tenantId,
        branchId: fixture.branchId,
        sessionId: main.sessionId,
        orderId: order.orderId,
        authUid: alice.user.uid,
      }),
      'Pedir aprobación',
    );
    expect((await sendToKitchen(main, alice, order.orderId)).errors.join(' ')).toMatch(
      /lo aprueba el mesero/,
    );
    const queue = expectOk(await kitchenQueue(kitchen), 'Cola').orderItems.map((item) => item.id);
    expect(queue).not.toContain(order.items[0]?.id);
  });

  it('los resúmenes autorizados antes de ADR-0012 siguen llegando a cocina', async () => {
    const order = await storeOrder(main, alice, 1, 'AUTHORIZED');
    expectOk(await sendToKitchen(main, alice, order.orderId), 'Envío');
  });

  it('autorizado llega una sola vez; un reintento encuentra el pedido ya enviado', async () => {
    const order = await storeOrder(main, alice, 1);
    expectOk(await sendToKitchen(main, alice, order.orderId), 'Primer envío');
    expect((await sendToKitchen(main, alice, order.orderId)).errors.join(' ')).toMatch(
      /ya está en cocina/,
    );
    const found = expectOk(
      await server<{ orders: Array<{ id: string; sentToKitchenAt: string | null }> }>(
        'query',
        'ServerOrderByQuote',
        { quoteId: order.quoteId },
      ),
      'Pedido del resumen',
    ).orders;
    expect(found).toEqual([expect.objectContaining({ id: order.orderId })]);
    expect(found[0]?.sentToKitchenAt).toBeTruthy();
  });

  it('otra persona, otra mesa o una persona retirada no envían el pedido', async () => {
    const order = await storeOrder(main, alice, 1);
    expect((await sendToKitchen(main, bruno, order.orderId)).errors.join(' ')).toMatch(
      /ya no están vigentes/,
    );
    const other = await openTable('P2');
    expect((await sendToKitchen(other, alice, order.orderId)).errors.join(' ')).toMatch(
      /no es de la mesa/,
    );
    const carla = await join(main, 'f3p-carla');
    const hers = await storeOrder(main, carla, 1);
    expectOk(
      await mutate(waiter, 'RemoveParticipant', {
        ...scopeOf(fixture),
        participantId: carla.participantId,
      }),
      'Retirar a Carla',
    );
    expect((await sendToKitchen(main, carla, hers.orderId)).errors.join(' ')).toMatch(
      /ya no están vigentes/,
    );
  });

  it('solo el servidor envía a cocina', async () => {
    const order = await storeOrder(main, alice, 1);
    const variables = {
      ...scopeOf(fixture),
      sessionId: main.sessionId,
      orderId: order.orderId,
      authUid: alice.user.uid,
    };
    for (const user of [alice.user, owner, kitchen, null]) {
      const result = await mutate(user, 'ServerSendOrderToKitchen', variables);
      expect(result.errors.join(' '), user?.label ?? 'sin sesión').toMatch(
        /NO_ACCESS|@auth|not authorized/i,
      );
    }
  });
});

describe('cocina', () => {
  it('ve la cola de su estación con mesa, alérgenos, opciones y nota, sin importes', async () => {
    const order = await sentOrder(main, alice, 1);
    const result = await kitchenQueue(kitchen);
    const item = expectOk(result, 'Cola').orderItems.find((i) => i.id === order.items[0]?.id);
    expect(item).toMatchObject({
      status: 'RECEIVED',
      version: 1,
      allergensSnapshot: ['huevo'],
      note: 'Sin cebolla',
      orderItemModifiers_on_item: [{ nameSnapshot: 'Bien asada' }],
      order: { session: { table: { code: 'P1' } } },
    });
    expect(JSON.stringify(result.data)).not.toMatch(/Minor|authUid|participant/);
  });

  it('nadie fuera de la cocina de la sucursal lee la cola', async () => {
    for (const user of [waiter, northKitchen, otherOwner, alice.user]) {
      expect((await kitchenQueue(user)).errors.join(' '), user.label).toMatch(DENIED);
    }
  });

  it('empieza y termina en orden; el mesero no puede, y un paso inválido se rechaza', async () => {
    const { items } = await sentOrder(main, alice, 2);
    const [first, second] = items as [SentItem, SentItem];
    expect((await advance(waiter, 'StartOrderItem', first)).errors.join(' ')).toMatch(DENIED);
    expect((await advance(kitchen, 'FinishOrderItem', first)).errors.join(' ')).toMatch(CHANGED);
    expectOk(await advance(kitchen, 'StartOrderItem', first), 'Empezar');
    expect((await advance(kitchen, 'StartOrderItem', first)).errors.join(' ')).toMatch(CHANGED);
    expectOk(await advance(kitchen, 'FinishOrderItem', first), 'Listo');

    // Versión vieja: la pantalla de otra persona todavía mostraba la línea sin empezar.
    const stale = { ...second };
    expectOk(await advance(kitchen, 'StartOrderItem', second), 'Empezar la segunda');
    expect((await advance(kitchen, 'StartOrderItem', stale)).errors.join(' ')).toMatch(CHANGED);
  });

  it('si dos personas pulsan «Empezar» a la vez, solo una gana (caso 4)', async () => {
    const { items } = await sentOrder(main, alice, 1);
    const item = items[0] as SentItem;
    const variables = { ...scopeOf(fixture), itemId: item.id, version: 1 };
    const results = await Promise.all([
      mutate(kitchen, 'StartOrderItem', variables),
      mutate(kitchen, 'StartOrderItem', variables),
      mutate(kitchen, 'StartOrderItem', variables),
    ]);
    const won = results.filter((result) => result.errors.length === 0);
    expect(won).toHaveLength(1);
    for (const lost of results.filter((result) => result.errors.length > 0)) {
      expect(lost.errors.join(' ')).toMatch(CHANGED);
    }
    const audit = expectOk(
      await admin<{ auditEvents: unknown[] }>(
        `query ($id: String!) { auditEvents(where: { resourceId: { eq: $id }, operation: { eq: "order_item.start" } }) { id } }`,
        { id: item.id },
      ),
      'Auditoría',
    );
    expect(audit.auditEvents).toHaveLength(1);
  });

  it('una línea de otra empresa no se toca declarando la empresa propia', async () => {
    const { items } = await sentOrder(main, alice, 1);
    const item = items[0] as SentItem;
    for (const operation of ['StartOrderItem', 'CancelOrderItem']) {
      const result = await mutate(otherKitchen, operation, {
        ...scopeOf(otherFixture),
        itemId: item.id,
        version: item.version,
        ...(operation === 'CancelOrderItem' ? { reason: 'Intento ajeno' } : {}),
      });
      expect(result.errors.join(' '), operation).toMatch(/no pertenece a la empresa/);
    }
  });
});

describe('meseros', () => {
  it('recoge y entrega lo listo; cocina no recoge; saltar «recogido» exige permiso y motivo', async () => {
    const { items } = await sentOrder(main, alice, 2);
    const [first, second] = items as [SentItem, SentItem];
    for (const item of [first, second]) {
      expectOk(await advance(kitchen, 'StartOrderItem', item), 'Empezar');
      expectOk(await advance(kitchen, 'FinishOrderItem', item), 'Listo');
    }
    const pickup = expectOk(
      await query<{ orderItems: Array<{ id: string; station: { name: string } }> }>(
        waiter,
        'PickupQueue',
        scopeOf(fixture),
      ),
      'Listos para recoger',
    ).orderItems.map((item) => item.id);
    expect(pickup).toEqual(expect.arrayContaining([first.id, second.id]));
    expect((await query(kitchen, 'PickupQueue', scopeOf(fixture))).errors.join(' ')).toMatch(
      DENIED,
    );

    expect((await advance(kitchen, 'PickUpOrderItem', first)).errors.join(' ')).toMatch(DENIED);
    expect((await advance(waiter, 'DeliverOrderItem', first)).errors.join(' ')).toMatch(CHANGED);
    expectOk(await advance(waiter, 'PickUpOrderItem', first), 'Recoger');
    expectOk(await advance(waiter, 'DeliverOrderItem', first), 'Entregar');

    const direct = { reason: 'El cliente la tomó del pase' };
    expect(
      (await advance(waiter, 'DeliverOrderItemDirectly', second, direct)).errors.join(' '),
    ).toMatch(DENIED);
    expect(
      (await advance(owner, 'DeliverOrderItemDirectly', second, { reason: 'x' })).errors.join(' '),
    ).toMatch(/motivo/);
    expectOk(await advance(owner, 'DeliverOrderItemDirectly', second, direct), 'Entrega directa');
    const audit = expectOk(
      await admin<{ auditEvents: Array<{ reason: string | null }> }>(
        `query ($id: String!) { auditEvents(where: { resourceId: { eq: $id }, operation: { eq: "order_item.deliver_skipping_pick_up" } }) { reason } }`,
        { id: second.id },
      ),
      'Auditoría de la entrega directa',
    );
    expect(audit.auditEvents).toEqual([{ reason: direct.reason }]);
  });

  it('cancela con motivo antes de salir de cocina; si ya empezó, queda como merma', async () => {
    const { items } = await sentOrder(main, alice, 3);
    const [received, started, delivered] = items as [SentItem, SentItem, SentItem];
    const reason = { reason: 'El cliente cambió de opinión' };
    expect(
      (await advance(waiter, 'CancelOrderItem', received, { reason: '' })).errors.join(' '),
    ).toMatch(/motivo/);
    expectOk(await advance(waiter, 'CancelOrderItem', received, reason), 'Cancelar recibida');

    expectOk(await advance(kitchen, 'StartOrderItem', started), 'Empezar');
    expectOk(await advance(kitchen, 'CancelOrderItem', started, reason), 'Cancelar en preparación');

    for (const operation of ['StartOrderItem', 'FinishOrderItem', 'PickUpOrderItem'])
      expectOk(
        await advance(operation === 'PickUpOrderItem' ? waiter : kitchen, operation, delivered),
        operation,
      );
    expectOk(await advance(waiter, 'DeliverOrderItem', delivered), 'Entregar');
    expect((await advance(waiter, 'CancelOrderItem', delivered, reason)).errors.join(' ')).toMatch(
      /no se puede cancelar/,
    );

    const rows = expectOk(
      await admin<{
        orderItems: Array<{
          id: string;
          status: string;
          wasted: boolean | null;
          cancelReason: string | null;
        }>;
      }>(
        `query ($ids: [UUID!]!) { orderItems(where: { id: { in: $ids } }) { id status wasted cancelReason } }`,
        { ids: [received.id, started.id] },
      ),
      'Líneas canceladas',
    ).orderItems;
    expect(rows).toEqual(
      expect.arrayContaining([
        { id: received.id, status: 'CANCELLED', wasted: false, cancelReason: reason.reason },
        { id: started.id, status: 'CANCELLED', wasted: true, cancelReason: reason.reason },
      ]),
    );
  });

  it('el salón muestra en texto las líneas en curso de cada mesa', async () => {
    await sentOrder(main, alice, 1);
    const floor = expectOk(
      await query<{
        sectors: Array<{
          diningTables_on_sector: Array<{
            code: string;
            tableSessions_on_table: Array<{
              orders_on_session: Array<{ orderItems_on_order: Array<{ status: string }> }>;
            }>;
          }>;
        }>;
      }>(waiter, 'FloorView', scopeOf(fixture)),
      'Salón',
    );
    const table = floor.sectors
      .flatMap((sector) => sector.diningTables_on_sector)
      .find((t) => t.code === 'P1');
    const statuses = table?.tableSessions_on_table[0]?.orders_on_session.flatMap((o) =>
      o.orderItems_on_order.map((i) => i.status),
    );
    expect(statuses).toContain('RECEIVED');
    expect(statuses).not.toContain('DELIVERED');
    expect(statuses).not.toContain('CANCELLED');

    const sessionOrders = expectOk(
      await query<{ orders: Array<{ orderItems_on_order: Array<{ status: string }> }> }>(
        waiter,
        'SessionOrders',
        { ...scopeOf(fixture), sessionId: main.sessionId },
      ),
      'Pedidos de la mesa',
    );
    expect(sessionOrders.orders.length).toBeGreaterThan(0);
    expect(
      (
        await query(kitchen, 'SessionOrders', { ...scopeOf(fixture), sessionId: main.sessionId })
      ).errors.join(' '),
    ).toMatch(DENIED);
  });
});

describe('«Mis pedidos» del cliente (D-06)', () => {
  it('cada persona ve solo los suyos, y solo con la sucursal de la mesa', async () => {
    const order = await sentOrder(main, alice, 1);
    const mine = (who: TestUser, branchId = fixture.branchId) =>
      query<{ orders: Array<{ id: string; quote: { totalMinor: string } }> }>(who, 'MyOrders', {
        sessionId: main.sessionId,
        branchId,
      });
    const aliceOrders = expectOk(await mine(alice.user), 'Pedidos de Alicia').orders;
    expect(aliceOrders.map((o) => o.id)).toContain(order.orderId);
    expect(aliceOrders[0]?.quote.totalMinor).toBe('3200000');

    const brunoOrders = expectOk(await mine(bruno.user), 'Pedidos de Bruno').orders;
    expect(brunoOrders.map((o) => o.id)).not.toContain(order.orderId);
    const outsider = await createAnonymousUser('f3p-ajeno');
    expect(expectOk(await mine(outsider), 'Ajeno').orders).toEqual([]);
    expect(expectOk(await mine(alice.user, northBranchId), 'Otra sucursal').orders).toEqual([]);
  });
});

describe('solicitudes de servicio', () => {
  const request = (who: Participant, kind: 'CALL_WAITER' | 'REQUEST_BILL', table = main) =>
    server<{ serviceRequest_insert: { id: string } }>('mutation', 'ServerCreateServiceRequest', {
      ...scopeOf(fixture),
      sessionId: table.sessionId,
      participantId: who.participantId,
      authUid: who.user.uid,
      kind,
    });
  const pending = (user: TestUser) =>
    query<{ serviceRequests: Array<{ id: string; kind: string; session: { id: string } }> }>(
      user,
      'PendingServiceRequests',
      scopeOf(fixture),
    );

  it('una pendiente de cada tipo por mesa; el personal la atiende y se puede volver a pedir', async () => {
    const call = expectOk(await request(alice, 'CALL_WAITER'), 'Llamar').serviceRequest_insert.id;
    expect((await request(bruno, 'CALL_WAITER')).errors.join(' ')).toMatch(
      /duplicate|unique|already exists/i,
    );
    expectOk(await request(bruno, 'REQUEST_BILL'), 'Pedir la cuenta');

    const mineAtTable = (user: TestUser) =>
      pending(user).then((result) =>
        expectOk(result, `Solicitudes de ${user.label}`)
          .serviceRequests.filter((r) => r.session.id === main.sessionId)
          .map((r) => r.kind)
          .sort(),
      );
    expect(await mineAtTable(waiter)).toEqual(['CALL_WAITER', 'REQUEST_BILL']);
    for (const user of [kitchen, otherOwner]) {
      expect((await pending(user)).errors.join(' '), user.label).toMatch(DENIED);
    }

    const attend = (user: TestUser) =>
      mutate(user, 'AttendServiceRequest', { ...scopeOf(fixture), requestId: call });
    expect((await attend(kitchen)).errors.join(' ')).toMatch(DENIED);
    expectOk(await attend(waiter), 'Atender');
    expect((await attend(waiter)).errors.join(' ')).toMatch(/ya fue atendida/);
    expect(await mineAtTable(waiter)).toEqual(['REQUEST_BILL']);
    expectOk(await request(alice, 'CALL_WAITER'), 'Volver a llamar');
  });

  it('una persona retirada o de otra mesa no crea solicitudes', async () => {
    const other = await openTable('P3');
    expect((await request(alice, 'CALL_WAITER', other)).errors.join(' ')).toMatch(
      /ya no están vigentes/,
    );
  });
});

describe('mesa cerrada (caso 12)', () => {
  it('al cerrar la mesa, el cliente deja de ver sus pedidos y no envía ni pide nada', async () => {
    const table = await openTable('P9');
    const dana = await join(table, 'f3p-dana');
    const sent = await sentOrder(table, dana, 1);
    const pendingOrder = await storeOrder(table, dana, 1);
    // D-30 (Fase 4, parte 4c): el cierre directo exige una mesa sin consumo; se cancela el plato.
    const [line] = sent.items;
    if (!line) throw new Error('Falta la línea enviada');
    expectOk(
      await advance(waiter, 'CancelOrderItem', line, { reason: 'Cliente se fue' }),
      'Cancelar',
    );
    expectOk(
      await mutate(waiter, 'CloseTableSession', {
        ...scopeOf(fixture),
        sessionId: table.sessionId,
      }),
      'Cerrar la mesa',
    );
    const mine = expectOk(
      await query<{ orders: unknown[] }>(dana.user, 'MyOrders', {
        sessionId: table.sessionId,
        branchId: fixture.branchId,
      }),
      'Pedidos tras cerrar',
    );
    expect(mine.orders).toEqual([]);
    expect(sent.orderId).toBeTruthy();
    expect((await sendToKitchen(table, dana, pendingOrder.orderId)).errors.join(' ')).toMatch(
      /ya no están vigentes/,
    );
    const call = await server('mutation', 'ServerCreateServiceRequest', {
      ...scopeOf(fixture),
      sessionId: table.sessionId,
      participantId: dana.participantId,
      authUid: dana.user.uid,
      kind: 'CALL_WAITER',
    });
    expect(call.errors.join(' ')).toMatch(/ya no están vigentes/);
  });
});
