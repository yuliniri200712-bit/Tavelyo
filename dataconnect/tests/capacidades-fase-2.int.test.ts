// Capacidades de SQL Connect en las que se apoya ADR-0011, verificadas en el emulador antes de
// construir la Fase 2 sobre ellas: niveles PUBLIC, USER_ANON y NO_ACCESS, fechas en filtros y una
// sola sesión abierta por mesa.
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
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
  type ProvisionedTenant,
} from './support/provisioning.ts';

let owner: TestUser;
let waiter: TestUser;
let customer: TestUser;
let tenant: ProvisionedTenant;
let branchId: string;
let tableId: string;
let qrPublicId: string;

async function adminInsert(document: string, variables: Record<string, unknown>, label: string) {
  return expectOk(await admin<Record<string, { id: string }>>(document, variables), label);
}

beforeAll(async () => {
  await seedAuthorizationCatalog();
  owner = await createUser('cap-owner');
  waiter = await createUser('cap-waiter');
  for (const user of [owner, waiter]) await createProfile(user);
  tenant = await provisionTenant('Capacidades', owner, ['Centro']);
  branchId = tenant.branches['Centro'] ?? '';
  await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
  customer = await createAnonymousUser('cap-cliente');

  const sector = await adminInsert(
    `mutation ($t: UUID!, $b: UUID!) { sector_insert(data: { tenantId: $t, branchId: $b, name: "Salón", sort: 1 }) }`,
    { t: tenant.id, b: branchId },
    'Sector',
  );
  const table = await adminInsert(
    `mutation ($t: UUID!, $b: UUID!, $s: UUID!) { diningTable_insert(data: { tenantId: $t, branchId: $b, sectorId: $s, code: "M1", seats: 4 }) }`,
    { t: tenant.id, b: branchId, s: sector['sector_insert']?.id },
    'Mesa',
  );
  tableId = table['diningTable_insert']?.id ?? '';
  const read = expectOk(
    await admin<{ diningTable: { qrPublicId: string } }>(
      `query ($id: UUID!) { diningTable(id: $id) { qrPublicId } }`,
      { id: tableId },
    ),
    'QR',
  );
  qrPublicId = read.diningTable.qrPublicId;

  const category = await adminInsert(
    `mutation ($t: UUID!) { category_insert(data: { tenantId: $t, name: "Platos fuertes", sort: 1 }) }`,
    { t: tenant.id },
    'Categoría',
  );
  const product = await adminInsert(
    `mutation ($t: UUID!, $c: UUID!) { product_insert(data: { tenantId: $t, categoryId: $c, name: "Bandeja paisa", sort: 1, allergensDeclared: ["huevo"] }) }`,
    { t: tenant.id, c: category['category_insert']?.id },
    'Producto',
  );
  const productId = product['product_insert']?.id;
  const price = await adminInsert(
    `mutation ($t: UUID!, $b: UUID!, $p: UUID!) { price_insert(data: { tenantId: $t, branchId: $b, productId: $p, amountMinor: "3200000", currency: "COP", createdBy: "prueba" }) }`,
    { t: tenant.id, b: branchId, p: productId },
    'Precio',
  );
  expectOk(
    await admin(
      `mutation ($t: UUID!, $b: UUID!, $p: UUID!, $pr: UUID!) { productBranch_insert(data: { tenantId: $t, branchId: $b, productId: $p, available: true, currentPriceId: $pr }) }`,
      { t: tenant.id, b: branchId, p: productId, pr: price['price_insert']?.id },
    ),
    'Disponibilidad',
  );
});

describe('PUBLIC: carta por QR', () => {
  it('sin sesión ve la carta de la mesa con su precio vigente', async () => {
    const data = expectOk(
      await query<{
        diningTables: Array<{
          code: string;
          sector: {
            branch: {
              currency: string;
              productBranches_on_branch: Array<{
                currentPrice: { amountMinor: string };
                product: { name: string; allergensDeclared: string[] };
              }>;
            };
          };
        }>;
      }>(null, 'PublicMenu', { qrPublicId }),
      'Carta pública',
    );
    const branch = data.diningTables[0]?.sector.branch;
    expect(branch?.currency).toBe('COP');
    expect(branch?.productBranches_on_branch).toEqual([
      expect.objectContaining({
        currentPrice: expect.objectContaining({ amountMinor: '3200000' }),
        product: expect.objectContaining({ name: 'Bandeja paisa', allergensDeclared: ['huevo'] }),
      }),
    ]);
  });

  it('un QR inventado no devuelve nada', async () => {
    const data = expectOk(
      await query<{ diningTables: unknown[] }>(null, 'PublicMenu', { qrPublicId: randomUUID() }),
      'QR inventado',
    );
    expect(data.diningTables).toEqual([]);
  });
});

describe('USER frente a USER_ANON', () => {
  it('un cliente anónimo no puede usar operaciones del personal', async () => {
    for (const [name, variables] of [
      ['MyMemberships', {}],
      ['OpenTableSession', { tenantId: tenant.id, branchId, tableId }],
    ] as const) {
      const run = name === 'MyMemberships' ? query : mutate;
      const result = await run(customer, name, variables);
      expect(result.errors.join(' '), name).toMatch(
        /@auth|unauthenticated|permission|not authorized/i,
      );
    }
  });

  it('el personal sí puede usar USER_ANON (es un usuario identificado)', async () => {
    const result = await query(waiter, 'MyParticipation', { sessionId: randomUUID() });
    expect(result.errors).toEqual([]);
  });
});

describe('NO_ACCESS: solo el servidor', () => {
  it('ni el cliente, ni el personal, ni alguien sin sesión pueden ejecutarlas', async () => {
    const variables = {
      tenantId: tenant.id,
      branchId,
      sessionId: randomUUID(),
      authUid: customer.uid,
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    };
    for (const user of [customer, owner, null]) {
      const result = await mutate(user, 'ServerInsertParticipant', variables);
      expect(result.errors.join(' '), user?.label ?? 'sin sesión').toMatch(
        /NO_ACCESS|@auth|not authorized/i,
      );
    }
    expect(
      (await query(owner, 'ServerOpenSessionByQr', { qrPublicId, authUid: owner.uid })).errors
        .length,
    ).toBeGreaterThan(0);
  });
});

describe('sesión de mesa y participantes', () => {
  it('una sola sesión abierta por mesa; el participante vigente ve la suya; al cerrar la pierde', async () => {
    expectOk(
      await mutate(waiter, 'OpenTableSession', { tenantId: tenant.id, branchId, tableId }),
      'Abrir mesa',
    );
    const second = await mutate(waiter, 'OpenTableSession', {
      tenantId: tenant.id,
      branchId,
      tableId,
    });
    // Rechazada por la unicidad de openTableId, no por permisos.
    expect(second.errors.join(' ')).toMatch(/duplicate|unique|already exists/i);

    const lookup = expectOk(
      await server<{ diningTables: Array<{ tableSessions_on_table: Array<{ id: string }> }> }>(
        'query',
        'ServerOpenSessionByQr',
        { qrPublicId, authUid: customer.uid },
      ),
      'Sesión abierta por QR',
    );
    const sessionId = lookup.diningTables[0]?.tableSessions_on_table[0]?.id ?? '';
    expect(sessionId).not.toBe('');

    const expired = await createAnonymousUser('cap-vencido');
    for (const [user, ms] of [
      [customer, 3_600_000],
      [expired, -60_000],
    ] as const) {
      expectOk(
        await server('mutation', 'ServerInsertParticipant', {
          tenantId: tenant.id,
          branchId,
          sessionId,
          authUid: user.uid,
          expiresAt: new Date(Date.now() + ms).toISOString(),
        }),
        `Participante ${user.label}`,
      );
    }

    const mine = (user: TestUser) =>
      query<{ sessionParticipants: unknown[] }>(user, 'MyParticipation', { sessionId });
    expect(expectOk(await mine(customer), 'Vigente').sessionParticipants).toHaveLength(1);
    expect(expectOk(await mine(expired), 'Vencido').sessionParticipants).toEqual([]);

    expectOk(
      await mutate(waiter, 'CloseTableSession', { tenantId: tenant.id, branchId, sessionId }),
      'Cerrar mesa',
    );
    expect(expectOk(await mine(customer), 'Tras cerrar').sessionParticipants).toEqual([]);

    // Se puede volver a abrir (varias sesiones cerradas con openTableId nulo) y es otra sesión.
    expectOk(
      await mutate(waiter, 'OpenTableSession', { tenantId: tenant.id, branchId, tableId }),
      'Reabrir mesa',
    );
    const next = expectOk(
      await server<{ diningTables: Array<{ tableSessions_on_table: Array<{ id: string }> }> }>(
        'query',
        'ServerOpenSessionByQr',
        { qrPublicId, authUid: customer.uid },
      ),
      'Sesión siguiente',
    ).diningTables[0]?.tableSessions_on_table[0]?.id;
    expect(next).not.toBe(sessionId);
    expect(
      expectOk(
        await query<{ sessionParticipants: unknown[] }>(customer, 'MyParticipation', {
          sessionId: next,
        }),
        'Sesión siguiente',
      ).sessionParticipants,
    ).toEqual([]);
  });
});
