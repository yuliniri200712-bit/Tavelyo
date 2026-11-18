// Carta de demostración más completa que el fixture de integración: dos categorías y tres platos.
import { expectOk, mutate, type TestUser } from '../../dataconnect/tests/support/emulator.ts';
import type { Fixture } from '../../dataconnect/tests/support/catalog-fixture.ts';

interface Scope {
  readonly tenantId: string;
  readonly branchId: string;
}

async function created(
  owner: TestUser,
  operation: string,
  variables: Record<string, unknown>,
  field: string,
): Promise<string> {
  const data = expectOk(await mutate(owner, operation, variables), operation) as Record<
    string,
    { id: string } | undefined
  >;
  const id = data[field]?.id;
  if (!id) throw new Error(`${operation}: sin ${field}`);
  return id;
}

async function offer(owner: TestUser, scope: Scope, productId: string, amountMinor: string) {
  expectOk(
    await mutate(owner, 'SetProductAvailability', {
      ...scope,
      productId,
      available: true,
      daysMask: null,
      startMinute: null,
      endMinute: null,
    }),
    'SetProductAvailability',
  );
  expectOk(
    await mutate(owner, 'ChangePrice', { ...scope, productId, amountMinor, currency: 'COP' }),
    'ChangePrice',
  );
}

/** Añade al fixture un ajiaco con adiciones y una categoría de bebidas con limonada. */
export async function extendMenu(owner: TestUser, fixture: Fixture, scope: Scope): Promise<void> {
  const { tenantId } = scope;
  const ajiaco = await created(
    owner,
    'CreateProduct',
    {
      tenantId,
      categoryId: fixture.categoryId,
      taxRuleId: fixture.taxRuleId,
      name: 'Ajiaco santafereño',
      description: 'Con pollo, mazorca y guascas',
      allergensDeclared: ['lácteos'],
      sort: 2,
    },
    'product_insert',
  );
  const extras = await created(
    owner,
    'CreateModifierGroup',
    { tenantId, productId: ajiaco, name: 'Adiciones', minSelect: 0, maxSelect: 2, sort: 1 },
    'modifierGroup_insert',
  );
  for (const [name, priceDeltaMinor, sort] of [
    ['Aguacate', '540000', 1],
    ['Crema de leche', '0', 2],
  ] as const) {
    await created(
      owner,
      'CreateModifierOption',
      { tenantId, groupId: extras, name, priceDeltaMinor, sort },
      'modifierOption_insert',
    );
  }
  await offer(owner, scope, ajiaco, '2800000');

  const drinks = await created(
    owner,
    'CreateCategory',
    { tenantId, name: 'Bebidas', sort: 2 },
    'category_insert',
  );
  const lemonade = await created(
    owner,
    'CreateProduct',
    {
      tenantId,
      categoryId: drinks,
      taxRuleId: fixture.taxRuleId,
      name: 'Limonada de coco',
      description: null,
      allergensDeclared: [],
      sort: 1,
    },
    'product_insert',
  );
  await offer(owner, scope, lemonade, '1200000');
}
