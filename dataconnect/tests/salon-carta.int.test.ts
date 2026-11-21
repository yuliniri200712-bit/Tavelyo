// Autorización y aislamiento de las operaciones de la Fase 2 (salón, mesas, carta y sucursales):
// cada operación con el rol permitido, con roles sin permiso, con otra sucursal y con IDs
// alterados de otra empresa (PM §12, caso 1), más las reglas de archivado, QR, precios y expulsión.
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
  type GraphqlResult,
  type TestUser,
} from './support/emulator.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
} from './support/provisioning.ts';
import { buildFixture, qrOf, type Fixture, type LayoutData } from './support/catalog-fixture.ts';

type Vars = Record<string, unknown>;
type Kind = 'query' | 'mutation';

interface Users {
  ownerA: TestUser;
  adminA: TestUser;
  waiterA: TestUser;
  waiterNorte: TestUser;
  kitchenA: TestUser;
  cashierA: TestUser;
  ownerB: TestUser;
}

let u: Users;
let customer: TestUser;
let a: Fixture;
let b: Fixture;
let norteId: string;

function run<T = Record<string, unknown>>(
  user: TestUser | null,
  kind: Kind,
  name: string,
  variables: Vars,
): Promise<GraphqlResult<T>> {
  return kind === 'query' ? query<T>(user, name, variables) : mutate<T>(user, name, variables);
}

async function ok<T = Record<string, unknown>>(
  user: TestUser,
  kind: Kind,
  name: string,
  variables: Vars,
): Promise<T> {
  return expectOk(await run<T>(user, kind, name, variables), `${name} (${user.label})`);
}

async function expectDenied(
  user: TestUser | null,
  kind: Kind,
  name: string,
  variables: Vars,
  message: RegExp,
): Promise<void> {
  const result = await run(user, kind, name, variables);
  expect(result.errors.join(' | '), `${name} (${user?.label ?? 'sin sesión'})`).toMatch(message);
}

const insertedId = (data: Record<string, unknown>, field: string): string =>
  (data[field] as { id: string }).id;

async function menuProducts(qrPublicId: string): Promise<string[] | null> {
  const data = expectOk(
    await query<{
      diningTables: Array<{
        sector: { branch: { productBranches_on_branch: Array<{ product: { name: string } }> } };
      }>;
    }>(null, 'PublicMenu', { qrPublicId }),
    'Carta pública',
  );
  const table = data.diningTables[0];
  return table ? table.sector.branch.productBranches_on_branch.map((pb) => pb.product.name) : null;
}

async function openSessionOf(user: TestUser, f: Fixture): Promise<string> {
  const floor = await ok<{
    sectors: Array<{
      diningTables_on_sector: Array<{ id: string; tableSessions_on_table: Array<{ id: string }> }>;
    }>;
  }>(user, 'query', 'FloorView', { tenantId: f.tenantId, branchId: f.branchId });
  const table = floor.sectors
    .flatMap((sector) => sector.diningTables_on_sector)
    .find((t) => t.id === f.tableId);
  const id = table?.tableSessions_on_table[0]?.id;
  if (!id) throw new Error('La mesa no tiene sesión abierta');
  return id;
}

async function auditOperations(tenantId: string): Promise<string[]> {
  const data = expectOk(
    await admin<{ auditEvents: Array<{ operation: string }> }>(
      `query ($t: UUID!) { auditEvents(where: { tenant: { id: { eq: $t } } }) { operation } }`,
      { t: tenantId },
    ),
    'Auditoría',
  );
  return data.auditEvents.map((event) => event.operation);
}

beforeAll(async () => {
  await seedAuthorizationCatalog();
  const labels = [
    'ownerA',
    'adminA',
    'waiterA',
    'waiterNorte',
    'kitchenA',
    'cashierA',
    'ownerB',
  ] as const;
  const created = await Promise.all(labels.map((label) => createUser(`f2-${label}`)));
  u = Object.fromEntries(labels.map((label, i) => [label, created[i]])) as unknown as Users;
  for (const user of created) await createProfile(user);
  customer = await createAnonymousUser('f2-cliente');

  const tenantA = await provisionTenant('Fase 2 A', u.ownerA, ['Centro', 'Norte']);
  const tenantB = await provisionTenant('Fase 2 B', u.ownerB, ['Sur']);
  const centroId = tenantA.branches['Centro'] ?? '';
  norteId = tenantA.branches['Norte'] ?? '';
  await insertMembership(tenantA.id, u.adminA, 'branch_admin', [centroId]);
  await insertMembership(tenantA.id, u.waiterA, 'waiter', [centroId]);
  await insertMembership(tenantA.id, u.waiterNorte, 'waiter', [norteId]);
  await insertMembership(tenantA.id, u.kitchenA, 'kitchen', [centroId]);
  await insertMembership(tenantA.id, u.cashierA, 'cashier', [centroId]);

  a = await buildFixture(u.ownerA, tenantA.id, centroId);
  b = await buildFixture(u.ownerB, tenantB.id, tenantB.branches['Sur'] ?? '');
});

describe('carta pública y precios', () => {
  it('la carta del QR muestra el producto con su precio vigente', async () => {
    expect(await menuProducts(a.qrPublicId)).toEqual(['Bandeja paisa']);
  });

  it('cambiar el precio crea una versión nueva y la deja vigente', async () => {
    await ok(u.adminA, 'mutation', 'ChangePrice', {
      tenantId: a.tenantId,
      branchId: a.branchId,
      productId: a.productId,
      amountMinor: '3500000',
      currency: 'COP',
    });
    const catalog = await ok<{
      productBranches: Array<{ productId: string; currentPrice: { amountMinor: string } }>;
    }>(u.adminA, 'query', 'BranchCatalog', { tenantId: a.tenantId, branchId: a.branchId });
    expect(catalog.productBranches).toEqual([
      expect.objectContaining({
        productId: a.productId,
        currentPrice: expect.objectContaining({ amountMinor: '3500000' }),
      }),
    ]);
    const history = expectOk(
      await admin<{ prices: Array<{ amountMinor: string }> }>(
        `query ($p: UUID!, $b: UUID!) { prices(where: { productId: { eq: $p }, branchId: { eq: $b } }, orderBy: [{ validFrom: ASC }]) { amountMinor } }`,
        { p: a.productId, b: a.branchId },
      ),
      'Historial de precios',
    );
    expect(history.prices.map((price) => price.amountMinor)).toEqual(['3200000', '3500000']);
  });

  it('rechaza precios no válidos, en otra moneda o de un producto que no está en la sucursal', async () => {
    const base = { tenantId: a.tenantId, branchId: a.branchId, productId: a.productId };
    for (const amountMinor of ['0', '-100', '100000000001']) {
      await expectDenied(
        u.ownerA,
        'mutation',
        'ChangePrice',
        { ...base, amountMinor, currency: 'COP' },
        /Precio no válido/,
      );
    }
    await expectDenied(
      u.ownerA,
      'mutation',
      'ChangePrice',
      { ...base, amountMinor: '100', currency: 'USD' },
      /La moneda no es la de la sucursal/,
    );
    await expectDenied(
      u.ownerA,
      'mutation',
      'ChangePrice',
      { ...base, branchId: norteId, amountMinor: '100', currency: 'COP' },
      /Primero agrega el producto a la sucursal/,
    );
  });

  it('el horario se define completo o no se define', async () => {
    const base = {
      tenantId: a.tenantId,
      branchId: a.branchId,
      productId: a.productId,
      available: true,
    };
    for (const schedule of [
      { daysMask: 31, startMinute: 720, endMinute: null },
      { daysMask: 0, startMinute: 720, endMinute: 900 },
      { daysMask: 128, startMinute: 720, endMinute: 900 },
      { daysMask: 31, startMinute: 900, endMinute: 900 },
      { daysMask: 31, startMinute: 1440, endMinute: 100 },
      { daysMask: 31, startMinute: 720 },
    ]) {
      await expectDenied(
        u.adminA,
        'mutation',
        'SetProductAvailability',
        { ...base, ...schedule },
        /Horario no válido/,
      );
    }
    // Cruza la medianoche (18:00–02:00, viernes y sábado) y luego vuelve a todo el día.
    await ok(u.adminA, 'mutation', 'SetProductAvailability', {
      ...base,
      daysMask: 48,
      startMinute: 1080,
      endMinute: 120,
    });
    await ok(u.adminA, 'mutation', 'SetProductAvailability', {
      ...base,
      daysMask: null,
      startMinute: null,
      endMinute: null,
    });
  });

  it('cambiar la disponibilidad no borra el precio vigente', async () => {
    const base = { tenantId: a.tenantId, branchId: a.branchId, productId: a.productId };
    const empty = { daysMask: null, startMinute: null, endMinute: null };
    await ok(u.adminA, 'mutation', 'SetProductAvailability', {
      ...base,
      ...empty,
      available: false,
    });
    expect(await menuProducts(a.qrPublicId)).toEqual([]);
    await ok(u.adminA, 'mutation', 'SetProductAvailability', {
      ...base,
      ...empty,
      available: true,
    });
    expect(await menuProducts(a.qrPublicId)).toEqual(['Bandeja paisa']);
  });

  it('archivar la categoría o el producto los quita de la carta; restaurarlos los devuelve', async () => {
    const category = { tenantId: a.tenantId, categoryId: a.categoryId, name: 'Platos fuertes' };
    await ok(u.ownerA, 'mutation', 'UpdateCategory', { ...category, sort: 1, archived: true });
    expect(await menuProducts(a.qrPublicId)).toEqual([]);
    await ok(u.ownerA, 'mutation', 'UpdateCategory', { ...category, sort: 1, archived: false });

    const product = {
      tenantId: a.tenantId,
      productId: a.productId,
      categoryId: a.categoryId,
      taxRuleId: a.taxRuleId,
      name: 'Bandeja paisa',
      description: null,
      allergensDeclared: ['huevo'],
      sort: 1,
    };
    await ok(u.ownerA, 'mutation', 'UpdateProduct', { ...product, archived: true });
    expect(await menuProducts(a.qrPublicId)).toEqual([]);
    await ok(u.ownerA, 'mutation', 'UpdateProduct', { ...product, archived: false });
    expect(await menuProducts(a.qrPublicId)).toEqual(['Bandeja paisa']);
  });

  it('valida los datos del catálogo', async () => {
    const t = { tenantId: a.tenantId };
    await expectDenied(
      u.ownerA,
      'mutation',
      'CreateProduct',
      { ...t, categoryId: a.categoryId, name: '   ', sort: 1 },
      /Datos del producto no válidos/,
    );
    await expectDenied(
      u.ownerA,
      'mutation',
      'CreateProduct',
      { ...t, categoryId: a.categoryId, name: 'Ajiaco', allergensDeclared: [''], sort: 1 },
      /Datos del producto no válidos/,
    );
    await expectDenied(
      u.ownerA,
      'mutation',
      'CreateModifierGroup',
      { ...t, productId: a.productId, name: 'Salsas', minSelect: 2, maxSelect: 1, sort: 1 },
      /Datos del grupo de opciones no válidos/,
    );
    await expectDenied(
      u.ownerA,
      'mutation',
      'CreateModifierOption',
      { ...t, groupId: a.groupId, name: 'Descuento', priceDeltaMinor: '-100', sort: 1 },
      /Datos de la opción no válidos/,
    );
    await expectDenied(
      u.ownerA,
      'mutation',
      'CreateTaxRule',
      { ...t, name: 'IVA', rateBp: 10001 },
      /Datos del impuesto no válidos/,
    );
    // Sin impuesto también es válido (producto exento).
    await ok(u.ownerA, 'mutation', 'CreateProduct', {
      ...t,
      categoryId: a.categoryId,
      name: 'Agua',
      sort: 2,
    });
  });

  it('un impuesto en uso no se archiva', async () => {
    await expectDenied(
      u.ownerA,
      'mutation',
      'UpdateTaxRule',
      {
        tenantId: a.tenantId,
        taxRuleId: a.taxRuleId,
        name: 'Impoconsumo',
        rateBp: 800,
        archived: true,
      },
      /El impuesto está en uso por productos activos/,
    );
  });
});

describe('roles sin permiso', () => {
  it('solo el propietario gestiona el catálogo de la empresa y los impuestos', async () => {
    const t = { tenantId: a.tenantId };
    for (const user of [u.adminA, u.waiterA]) {
      await expectDenied(
        user,
        'mutation',
        'CreateCategory',
        { ...t, name: 'Postres', sort: 2 },
        user === u.adminA
          ? /Solo el propietario/
          : /Solo el propietario|Sin permiso: catalog\.manage/,
      );
    }
    await expectDenied(
      u.adminA,
      'mutation',
      'CreateTaxRule',
      { ...t, name: 'IVA', rateBp: 1900 },
      /Sin permiso: tenant\.settings/,
    );
    await expectDenied(
      u.adminA,
      'mutation',
      'UpdateModifierOption',
      { ...t, optionId: a.optionId, name: 'x', priceDeltaMinor: '0', sort: 1, archived: false },
      /Solo el propietario/,
    );
  });

  it('meseros, cocina y caja no gestionan carta, precios ni mesas', async () => {
    const t = { tenantId: a.tenantId, branchId: a.branchId };
    const schedule = { daysMask: null, startMinute: null, endMinute: null };
    for (const user of [u.waiterA, u.kitchenA, u.cashierA]) {
      await expectDenied(
        user,
        'mutation',
        'ChangePrice',
        { ...t, productId: a.productId, amountMinor: '100', currency: 'COP' },
        /Sin permiso: price\.change/,
      );
      await expectDenied(
        user,
        'mutation',
        'SetProductAvailability',
        { ...t, productId: a.productId, available: false, ...schedule },
        /Sin permiso: catalog\.manage/,
      );
      await expectDenied(
        user,
        'mutation',
        'CreateSector',
        { ...t, name: 'Terraza', sort: 2 },
        /Sin permiso: table\.manage/,
      );
      await expectDenied(user, 'query', 'BranchLayout', t, /Sin permiso: table\.manage/);
      await expectDenied(user, 'query', 'CatalogAdmin', { tenantId: a.tenantId }, /Sin permiso/);
    }
  });

  it('cocina no ve el salón ni abre mesas', async () => {
    const t = { tenantId: a.tenantId, branchId: a.branchId };
    await expectDenied(u.kitchenA, 'query', 'FloorView', t, /Sin permiso: session\.open/);
    await expectDenied(
      u.kitchenA,
      'mutation',
      'OpenTableSession',
      { ...t, tableId: a.tableId },
      /Sin permiso: session\.open/,
    );
  });

  it('solo el propietario crea y edita sucursales', async () => {
    for (const user of [u.adminA, u.waiterA]) {
      await expectDenied(
        user,
        'mutation',
        'CreateBranch',
        { tenantId: a.tenantId, name: 'Sur', currency: 'COP', timezone: 'America/Bogota' },
        /Sin permiso: tenant\.settings/,
      );
    }
  });

  it('un cliente anónimo o sin sesión no usa ninguna operación del personal', async () => {
    const t = { tenantId: a.tenantId, branchId: a.branchId };
    for (const user of [customer, null]) {
      await expectDenied(user, 'query', 'FloorView', t, /@auth|unauthenticated|not authorized/i);
      await expectDenied(
        user,
        'mutation',
        'RotateTableQr',
        { ...t, tableId: a.tableId },
        /@auth|unauthenticated|not authorized/i,
      );
      await expectDenied(
        user,
        'query',
        'CatalogAdmin',
        { tenantId: a.tenantId },
        /@auth|unauthenticated|not authorized/i,
      );
    }
  });
});

describe('sucursal no asignada', () => {
  it('el personal de una sucursal no opera en otra de la misma empresa', async () => {
    const norte = { tenantId: a.tenantId, branchId: norteId };
    await expectDenied(
      u.waiterNorte,
      'query',
      'FloorView',
      { ...norte, branchId: a.branchId },
      /Sin acceso a la sucursal/,
    );
    await expectDenied(
      u.waiterNorte,
      'mutation',
      'OpenTableSession',
      { tenantId: a.tenantId, branchId: a.branchId, tableId: a.tableId },
      /Sin acceso a la sucursal/,
    );
    await expectDenied(u.adminA, 'query', 'BranchLayout', norte, /Sin acceso a la sucursal/);
    await expectDenied(u.adminA, 'query', 'BranchCatalog', norte, /Sin acceso a la sucursal/);
    await expectDenied(
      u.adminA,
      'mutation',
      'SetProductAvailability',
      {
        ...norte,
        productId: a.productId,
        available: true,
        daysMask: null,
        startMinute: null,
        endMinute: null,
      },
      /Sin acceso a la sucursal/,
    );
    await expectDenied(
      u.adminA,
      'mutation',
      'CreateSector',
      { ...norte, name: 'Terraza', sort: 2 },
      /Sin acceso a la sucursal/,
    );
  });

  it('declarar la sucursal propia no sirve para tocar una mesa de otra', async () => {
    // El administrador de Centro abre una mesa de Norte pasando Centro como sucursal.
    const norteSector = insertedId(
      await ok(u.ownerA, 'mutation', 'CreateSector', {
        tenantId: a.tenantId,
        branchId: norteId,
        name: 'Barra',
        sort: 1,
      }),
      'sector_insert',
    );
    const norteTable = insertedId(
      await ok(u.ownerA, 'mutation', 'CreateTable', {
        tenantId: a.tenantId,
        branchId: norteId,
        sectorId: norteSector,
        code: 'B1',
        seats: 2,
      }),
      'diningTable_insert',
    );
    const centro = { tenantId: a.tenantId, branchId: a.branchId };
    await expectDenied(
      u.adminA,
      'mutation',
      'OpenTableSession',
      { ...centro, tableId: norteTable },
      /La mesa no pertenece a la sucursal/,
    );
    await expectDenied(
      u.adminA,
      'mutation',
      'RotateTableQr',
      { ...centro, tableId: norteTable },
      /La mesa no pertenece a la sucursal/,
    );
    await expectDenied(
      u.adminA,
      'mutation',
      'CreateTable',
      { ...centro, sectorId: norteSector, code: 'X1', seats: 2 },
      /El sector no pertenece a la sucursal/,
    );
    await expectDenied(
      u.adminA,
      'mutation',
      'UpdateTable',
      {
        ...centro,
        tableId: a.tableId,
        sectorId: norteSector,
        code: 'M1',
        seats: 4,
        archived: false,
      },
      /El sector no pertenece a la sucursal/,
    );
  });
});

describe('IDs alterados de otra empresa', () => {
  it('sin membresía en la empresa ajena', async () => {
    const t = { tenantId: a.tenantId, branchId: a.branchId };
    await expectDenied(u.ownerB, 'query', 'FloorView', t, /Sin membresía activa/);
    await expectDenied(
      u.ownerB,
      'query',
      'CatalogAdmin',
      { tenantId: a.tenantId },
      /Sin membresía activa/,
    );
    await expectDenied(
      u.ownerB,
      'mutation',
      'ChangePrice',
      { ...t, productId: a.productId, amountMinor: '100', currency: 'COP' },
      /Sin membresía activa/,
    );
    await expectDenied(
      u.ownerB,
      'mutation',
      'CreateBranch',
      { tenantId: a.tenantId, name: 'Intrusa', currency: 'COP', timezone: 'America/Bogota' },
      /Sin membresía activa/,
    );
  });

  it('con su propia empresa y recursos de la otra', async () => {
    const own = { tenantId: b.tenantId, branchId: b.branchId };
    const cases: Array<[Kind, string, Vars, RegExp]> = [
      [
        'mutation',
        'OpenTableSession',
        { ...own, tableId: a.tableId },
        /La mesa no pertenece a la empresa/,
      ],
      [
        'mutation',
        'RotateTableQr',
        { ...own, tableId: a.tableId },
        /La mesa no pertenece a la empresa/,
      ],
      [
        'mutation',
        'UpdateTable',
        { ...own, tableId: a.tableId, sectorId: b.sectorId, code: 'M1', seats: 4, archived: true },
        /La mesa no pertenece a la empresa/,
      ],
      [
        'mutation',
        'UpdateSector',
        { ...own, sectorId: a.sectorId, name: 'x', sort: 1, archived: false },
        /El sector no pertenece a la empresa/,
      ],
      [
        'mutation',
        'CreateTable',
        { ...own, sectorId: a.sectorId, code: 'Z9', seats: 2 },
        /El sector no pertenece a la empresa/,
      ],
      [
        'mutation',
        'CreateSector',
        { tenantId: b.tenantId, branchId: a.branchId, name: 'x', sort: 1 },
        /La sucursal no pertenece a la empresa/,
      ],
      [
        'mutation',
        'ChangePrice',
        { ...own, productId: a.productId, amountMinor: '100', currency: 'COP' },
        /Primero agrega el producto a la sucursal/,
      ],
      [
        'mutation',
        'SetProductAvailability',
        {
          ...own,
          productId: a.productId,
          available: true,
          daysMask: null,
          startMinute: null,
          endMinute: null,
        },
        /El producto no pertenece a la empresa/,
      ],
      [
        'mutation',
        'CreateProduct',
        { tenantId: b.tenantId, categoryId: a.categoryId, name: 'x', sort: 1 },
        /La categoría no pertenece a la empresa/,
      ],
      [
        'mutation',
        'CreateProduct',
        {
          tenantId: b.tenantId,
          categoryId: b.categoryId,
          taxRuleId: a.taxRuleId,
          name: 'x',
          sort: 1,
        },
        /Impuesto inexistente o archivado/,
      ],
      [
        'mutation',
        'UpdateProduct',
        {
          tenantId: b.tenantId,
          productId: a.productId,
          categoryId: b.categoryId,
          taxRuleId: null,
          name: 'x',
          description: null,
          allergensDeclared: null,
          sort: 1,
          archived: true,
        },
        /El producto no pertenece a la empresa/,
      ],
      [
        'mutation',
        'UpdateCategory',
        { tenantId: b.tenantId, categoryId: a.categoryId, name: 'x', sort: 1, archived: true },
        /La categoría no pertenece a la empresa/,
      ],
      [
        'mutation',
        'CreateModifierGroup',
        {
          tenantId: b.tenantId,
          productId: a.productId,
          name: 'x',
          minSelect: 0,
          maxSelect: 1,
          sort: 1,
        },
        /El producto no pertenece a la empresa/,
      ],
      [
        'mutation',
        'UpdateModifierGroup',
        {
          tenantId: b.tenantId,
          groupId: a.groupId,
          name: 'x',
          minSelect: 0,
          maxSelect: 1,
          sort: 1,
          archived: true,
        },
        /El grupo no pertenece a la empresa/,
      ],
      [
        'mutation',
        'CreateModifierOption',
        { tenantId: b.tenantId, groupId: a.groupId, name: 'x', priceDeltaMinor: '0', sort: 1 },
        /El grupo no pertenece a la empresa/,
      ],
      [
        'mutation',
        'UpdateModifierOption',
        {
          tenantId: b.tenantId,
          optionId: a.optionId,
          name: 'x',
          priceDeltaMinor: '0',
          sort: 1,
          archived: true,
        },
        /La opción no pertenece a la empresa/,
      ],
      [
        'mutation',
        'UpdateTaxRule',
        { tenantId: b.tenantId, taxRuleId: a.taxRuleId, name: 'x', rateBp: 0, archived: false },
        /El impuesto no pertenece a la empresa/,
      ],
      [
        'mutation',
        'UpdateBranch',
        {
          tenantId: b.tenantId,
          branchId: a.branchId,
          name: 'x',
          timezone: 'America/Bogota',
          archived: true,
        },
        /La sucursal no pertenece a la empresa/,
      ],
    ];
    for (const [kind, name, variables, message] of cases) {
      await expectDenied(u.ownerB, kind, name, variables, message);
    }
  });

  it('las consultas con su empresa y una sucursal ajena no devuelven nada de la otra', async () => {
    const mixed = { tenantId: b.tenantId, branchId: a.branchId };
    expect((await ok<LayoutData>(u.ownerB, 'query', 'BranchLayout', mixed)).sectors).toEqual([]);
    expect(
      (await ok<{ sectors: unknown[] }>(u.ownerB, 'query', 'FloorView', mixed)).sectors,
    ).toEqual([]);
    expect(
      (await ok<{ productBranches: unknown[] }>(u.ownerB, 'query', 'BranchCatalog', mixed))
        .productBranches,
    ).toEqual([]);
  });
});

describe('sesión de mesa, participantes y QR', () => {
  it('el mesero abre la mesa, ve a los participantes, expulsa a uno y cierra', async () => {
    const t = { tenantId: a.tenantId, branchId: a.branchId };
    await ok(u.waiterA, 'mutation', 'OpenTableSession', { ...t, tableId: a.tableId });
    const sessionId = await openSessionOf(u.waiterA, a);

    const intruder = await createAnonymousUser('f2-intruso');
    for (const user of [customer, intruder]) {
      expectOk(
        await server('mutation', 'ServerInsertParticipant', {
          ...t,
          sessionId,
          authUid: user.uid,
          expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
        }),
        `Participante ${user.label}`,
      );
    }
    const list = await ok<{ sessionParticipants: Array<Record<string, unknown>> }>(
      u.waiterA,
      'query',
      'SessionParticipants',
      { ...t, sessionId },
    );
    expect(list.sessionParticipants).toHaveLength(2);
    // Minimización: el mesero no ve el uid de Firebase Auth del cliente.
    expect(Object.keys(list.sessionParticipants[0] ?? {}).sort()).toEqual(
      ['expiresAt', 'id', 'joinedAt', 'removedAt'].sort(),
    );

    const mine = async (user: TestUser) =>
      (
        await query<{ sessionParticipants: Array<{ id: string }> }>(user, 'MyParticipation', {
          sessionId,
        })
      ).data?.sessionParticipants ?? [];
    const intruderParticipation = (await mine(intruder))[0]?.id ?? '';
    expect(intruderParticipation).not.toBe('');

    // Otra empresa no puede expulsar a un participante de esta, ni el cliente a otro.
    await expectDenied(
      u.ownerB,
      'mutation',
      'RemoveParticipant',
      { tenantId: b.tenantId, branchId: b.branchId, participantId: intruderParticipation },
      /El participante no pertenece a la empresa/,
    );
    await expectDenied(
      customer,
      'mutation',
      'RemoveParticipant',
      { ...t, participantId: intruderParticipation },
      /@auth|unauthenticated|not authorized/i,
    );
    expect(
      (
        await ok<{ sessionParticipants: unknown[] }>(u.ownerB, 'query', 'SessionParticipants', {
          tenantId: b.tenantId,
          branchId: b.branchId,
          sessionId,
        })
      ).sessionParticipants,
    ).toEqual([]);

    await ok(u.waiterA, 'mutation', 'RemoveParticipant', {
      ...t,
      participantId: intruderParticipation,
    });
    expect(await mine(intruder)).toEqual([]);
    expect(await mine(customer)).toHaveLength(1);
    await expectDenied(
      u.waiterA,
      'mutation',
      'RemoveParticipant',
      { ...t, participantId: intruderParticipation },
      /El participante ya fue expulsado/,
    );

    // Con la mesa abierta no se archiva la mesa ni la sucursal.
    await expectDenied(
      u.adminA,
      'mutation',
      'UpdateTable',
      { ...t, tableId: a.tableId, sectorId: a.sectorId, code: 'M1', seats: 4, archived: true },
      /Cierra la mesa antes de archivarla/,
    );
    await expectDenied(
      u.ownerA,
      'mutation',
      'UpdateBranch',
      { ...t, name: 'Centro', timezone: 'America/Bogota', archived: true },
      /Cierra las mesas abiertas/,
    );

    await ok(u.waiterA, 'mutation', 'CloseTableSession', { ...t, sessionId });
    expect(await mine(customer)).toEqual([]);
    await expectDenied(
      u.waiterA,
      'mutation',
      'CloseTableSession',
      { ...t, sessionId },
      /La sesión ya está cerrada/,
    );
  });

  it('rotar el QR invalida el impreso y el nuevo abre la carta', async () => {
    const t = { tenantId: a.tenantId, branchId: a.branchId };
    const before = await qrOf(u.adminA, a.tenantId, a.branchId, a.tableId);
    await ok(u.adminA, 'mutation', 'RotateTableQr', { ...t, tableId: a.tableId });
    const after = await qrOf(u.adminA, a.tenantId, a.branchId, a.tableId);
    expect(after).not.toBe(before);
    expect(await menuProducts(before)).toBeNull();
    expect(await menuProducts(after)).toEqual(['Bandeja paisa']);
  });

  it('una mesa o un sector archivados no muestran la carta; un sector con mesas activas no se archiva', async () => {
    const t = { tenantId: a.tenantId, branchId: a.branchId };
    const qr = await qrOf(u.adminA, a.tenantId, a.branchId, a.tableId);
    await expectDenied(
      u.adminA,
      'mutation',
      'UpdateSector',
      { ...t, sectorId: a.sectorId, name: 'Salón', sort: 1, archived: true },
      /Archiva primero las mesas del sector/,
    );
    const table = { ...t, tableId: a.tableId, sectorId: a.sectorId, code: 'M1', seats: 4 };
    await ok(u.adminA, 'mutation', 'UpdateTable', { ...table, archived: true });
    expect(await menuProducts(qr)).toBeNull();
    await expectDenied(
      u.adminA,
      'mutation',
      'OpenTableSession',
      { ...t, tableId: a.tableId },
      /La mesa está archivada/,
    );
    await ok(u.adminA, 'mutation', 'UpdateTable', { ...table, archived: false });
    expect(await menuProducts(qr)).toEqual(['Bandeja paisa']);
  });
});

describe('sucursales', () => {
  it('el propietario crea y archiva una sucursal; archivada desaparece de sus sucursales', async () => {
    const created = await ok(u.ownerA, 'mutation', 'CreateBranch', {
      tenantId: a.tenantId,
      name: 'Chapinero',
      currency: 'COP',
      timezone: 'America/Bogota',
    });
    const branchId = insertedId(created, 'branch_insert');
    const names = async () =>
      (
        await ok<{ branches: Array<{ name: string }> }>(u.ownerA, 'query', 'MyBranches', {
          tenantId: a.tenantId,
        })
      ).branches.map((branch) => branch.name);
    expect(await names()).toContain('Chapinero');
    await ok(u.ownerA, 'mutation', 'UpdateBranch', {
      tenantId: a.tenantId,
      branchId,
      name: 'Chapinero',
      timezone: 'America/Bogota',
      archived: true,
    });
    expect(await names()).not.toContain('Chapinero');
  });

  it('el propietario ve todas sus sucursales, archivadas incluidas; nadie más', async () => {
    const all = await ok<{ branches: Array<{ name: string; status: string }> }>(
      u.ownerA,
      'query',
      'TenantBranches',
      { tenantId: a.tenantId },
    );
    expect(all.branches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Centro', status: 'ACTIVE' }),
        expect.objectContaining({ name: 'Chapinero', status: 'ARCHIVED' }),
      ]),
    );
    expect(all.branches.map((branch) => branch.name)).not.toContain('Sur');
    for (const user of [u.adminA, u.waiterA]) {
      await expectDenied(
        user,
        'query',
        'TenantBranches',
        { tenantId: a.tenantId },
        /Sin permiso: tenant\.settings/,
      );
    }
    await expectDenied(
      u.ownerB,
      'query',
      'TenantBranches',
      { tenantId: a.tenantId },
      /Sin membresía activa/,
    );
  });

  it('valida la moneda de la empresa y la zona horaria', async () => {
    const base = { tenantId: a.tenantId, name: 'Usaquén' };
    await expectDenied(
      u.ownerA,
      'mutation',
      'CreateBranch',
      { ...base, currency: 'USD', timezone: 'America/Bogota' },
      /La moneda no es la de la empresa/,
    );
    for (const timezone of ['Bogota', 'America/Bogota; DROP', '', '../etc/passwd']) {
      await expectDenied(
        u.ownerA,
        'mutation',
        'CreateBranch',
        { ...base, currency: 'COP', timezone },
        /Datos de la sucursal no válidos/,
      );
    }
  });
});

describe('auditoría', () => {
  it('cada operación deja su evento en la empresa correcta', async () => {
    const operations = await auditOperations(a.tenantId);
    for (const operation of [
      'tax_rule.create',
      'category.create',
      'category.archive',
      'category.update',
      'product.create',
      'product.archive',
      'modifier_group.create',
      'modifier_option.create',
      'product_branch.availability',
      'price.change',
      'sector.create',
      'dining_table.create',
      'dining_table.archive',
      'dining_table.update',
      'dining_table.rotate_qr',
      'table_session.open',
      'table_session.close',
      'session_participant.remove',
      'branch.create',
      'branch.archive',
    ]) {
      expect(operations, operation).toContain(operation);
    }
    // Nada de lo que hizo la empresa A aparece en la B.
    expect(await auditOperations(b.tenantId)).not.toContain('session_participant.remove');
  });
});

describe('empresa suspendida', () => {
  it('no muestra la carta ni deja operar al personal', async () => {
    expectOk(
      await admin(`mutation ($t: UUID!) { tenant_update(id: $t, data: { status: SUSPENDED }) }`, {
        t: b.tenantId,
      }),
      'Suspender B',
    );
    expect(await menuProducts(b.qrPublicId)).toBeNull();
    await expectDenied(
      u.ownerB,
      'mutation',
      'OpenTableSession',
      { tenantId: b.tenantId, branchId: b.branchId, tableId: b.tableId },
      /Empresa suspendida/,
    );
    await expectDenied(
      u.ownerB,
      'mutation',
      'ChangePrice',
      {
        tenantId: b.tenantId,
        branchId: b.branchId,
        productId: b.productId,
        amountMinor: '100',
        currency: 'COP',
      },
      /Empresa suspendida/,
    );
    // Un QR inventado tampoco revela nada.
    expect(await menuProducts(randomUUID())).toBeNull();
  });
});

describe('traslado de sesión con su cuenta (bloque 6)', () => {
  it('dos sesiones compiten por una mesa libre y solo se audita el traslado que gana', async () => {
    const scope = { tenantId: a.tenantId, branchId: a.branchId };
    const sector = expectOk(
      await mutate<{ sector_insert: { id: string } }>(u.ownerA, 'CreateSector', {
        ...scope,
        name: 'Traslados',
        sort: 10,
      }),
      'Nuevo sector',
    ).sector_insert.id;
    async function table(code: string) {
      return expectOk(
        await mutate<{ diningTable_insert: { id: string } }>(u.ownerA, 'CreateTable', {
          ...scope,
          sectorId: sector,
          code,
          seats: 4,
        }),
        'Mesa de traslado',
      ).diningTable_insert.id;
    }
    const one = await table('TR1'),
      two = await table('TR2'),
      target = await table('TR3');
    const open = async (tableId: string) =>
      expectOk(
        await mutate<{ tableSession_insert: { id: string } }>(u.waiterA, 'OpenTableSession', {
          ...scope,
          tableId,
        }),
        'Abrir',
      ).tableSession_insert.id;
    const first = await open(one),
      second = await open(two);
    const aMove = { ...scope, sessionId: first, sourceId: one, tableId: target };
    for (const user of [u.cashierA, u.waiterNorte, u.ownerB, customer, null]) {
      expect((await mutate(user, 'TransferTableSession', aMove)).errors.length).toBeGreaterThan(0);
    }
    expect(
      (await mutate(u.waiterA, 'TransferTableSession', { ...aMove, tableId: b.tableId })).errors
        .length,
    ).toBeGreaterThan(0);
    const moves = await Promise.all([
      mutate(u.waiterA, 'TransferTableSession', aMove),
      mutate(u.waiterA, 'TransferTableSession', { ...aMove, sourceId: two, sessionId: second }),
    ]);
    expect(moves.filter((m) => !m.errors.length)).toHaveLength(1);
    const winner = moves[0]?.errors.length ? second : first;
    const result = expectOk(
      await admin<{
        tableSession: { tableId: string; openTableId: string; status: string };
        auditEvents: { actorId: string; reason: string }[];
      }>(
        'query($id:UUID!,$ref:String!){tableSession(id:$id){tableId openTableId status} auditEvents(where:{operation:{eq:"session.transfer"},resourceId:{eq:$ref}}){actorId reason}}',
        { id: winner, ref: winner },
      ),
      'Traslado registrado',
    );
    expect(result.tableSession).toEqual({ tableId: target, openTableId: target, status: 'OPEN' });
    expect(result.auditEvents).toEqual([
      { actorId: u.waiterA.uid, reason: (winner === first ? one : two) + ' → ' + target },
    ]);
  });
});
