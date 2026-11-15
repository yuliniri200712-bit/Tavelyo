// Carta y salón de prueba creados con las propias operaciones del conector, como lo haría el
// propietario desde la app: impuesto, categoría, producto con un grupo de opciones obligatorio,
// disponibilidad, precio, sector y mesa.
import { expectOk, mutate, query, type TestUser } from './emulator.ts';

export interface Fixture {
  readonly tenantId: string;
  readonly branchId: string;
  readonly taxRuleId: string;
  readonly categoryId: string;
  readonly productId: string;
  readonly groupId: string;
  readonly optionId: string;
  readonly sectorId: string;
  readonly tableId: string;
  readonly qrPublicId: string;
}

export interface LayoutData {
  sectors: Array<{
    id: string;
    archivedAt: string | null;
    diningTables_on_sector: Array<{ id: string; qrPublicId: string; archivedAt: string | null }>;
  }>;
}

/** Precio inicial del producto de prueba: $ 32.000 (COP, unidades menores). */
export const FIXTURE_PRICE_MINOR = '3200000';
/** Impoconsumo del 8 %, en puntos básicos. */
export const FIXTURE_TAX_BP = 800;

async function create(
  owner: TestUser,
  name: string,
  variables: Record<string, unknown>,
  field: string,
): Promise<string> {
  const data = expectOk(await mutate<Record<string, { id: string }>>(owner, name, variables), name);
  const id = data[field]?.id;
  if (!id) throw new Error(`${name} no devolvió ${field}`);
  return id;
}

export async function qrOf(
  user: TestUser,
  tenantId: string,
  branchId: string,
  tableId: string,
): Promise<string> {
  const layout = expectOk(
    await query<LayoutData>(user, 'BranchLayout', { tenantId, branchId }),
    'BranchLayout',
  );
  const table = layout.sectors
    .flatMap((sector) => sector.diningTables_on_sector)
    .find((t) => t.id === tableId);
  if (!table) throw new Error('Mesa no encontrada en BranchLayout');
  return table.qrPublicId;
}

export async function buildFixture(
  owner: TestUser,
  tenantId: string,
  branchId: string,
): Promise<Fixture> {
  const taxRuleId = await create(
    owner,
    'CreateTaxRule',
    { tenantId, name: 'Impoconsumo', rateBp: FIXTURE_TAX_BP },
    'taxRule_insert',
  );
  const categoryId = await create(
    owner,
    'CreateCategory',
    { tenantId, name: 'Platos fuertes', sort: 1 },
    'category_insert',
  );
  const productId = await create(
    owner,
    'CreateProduct',
    {
      tenantId,
      categoryId,
      taxRuleId,
      name: 'Bandeja paisa',
      description: 'Frijoles, arroz, carne molida, chicharrón y huevo',
      allergensDeclared: ['huevo'],
      sort: 1,
    },
    'product_insert',
  );
  const groupId = await create(
    owner,
    'CreateModifierGroup',
    { tenantId, productId, name: 'Término de la carne', minSelect: 1, maxSelect: 1, sort: 1 },
    'modifierGroup_insert',
  );
  const optionId = await create(
    owner,
    'CreateModifierOption',
    { tenantId, groupId, name: 'Bien asada', priceDeltaMinor: '0', sort: 1 },
    'modifierOption_insert',
  );
  expectOk(
    await mutate(owner, 'SetProductAvailability', {
      tenantId,
      branchId,
      productId,
      available: true,
      daysMask: null,
      startMinute: null,
      endMinute: null,
    }),
    'SetProductAvailability',
  );
  expectOk(
    await mutate(owner, 'ChangePrice', {
      tenantId,
      branchId,
      productId,
      amountMinor: FIXTURE_PRICE_MINOR,
      currency: 'COP',
    }),
    'ChangePrice',
  );
  const sectorId = await create(
    owner,
    'CreateSector',
    { tenantId, branchId, name: 'Salón', sort: 1 },
    'sector_insert',
  );
  const tableId = await create(
    owner,
    'CreateTable',
    { tenantId, branchId, sectorId, code: 'M1', seats: 4 },
    'diningTable_insert',
  );
  return {
    tenantId,
    branchId,
    taxRuleId,
    categoryId,
    productId,
    groupId,
    optionId,
    sectorId,
    tableId,
    qrPublicId: await qrOf(owner, tenantId, branchId, tableId),
  };
}
