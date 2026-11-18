// Salón de demostración: además de la mesa M1 del fixture, M2 y M3 en «Salón» y una terraza.
import { expectOk, mutate, type TestUser } from '../../dataconnect/tests/support/emulator.ts';
import { qrOf, type Fixture } from '../../dataconnect/tests/support/catalog-fixture.ts';

interface Scope {
  readonly tenantId: string;
  readonly branchId: string;
}

export interface DemoTable {
  readonly id: string;
  readonly code: string;
  readonly qrPublicId: string;
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

/** Crea M2 y M3 en el sector del fixture, y el sector «Terraza» con T1 y T2. */
export async function extendFloor(
  owner: TestUser,
  fixture: Fixture,
  scope: Scope,
): Promise<Record<'M2' | 'M3' | 'T1' | 'T2', DemoTable>> {
  const table = async (sectorId: string, code: string, seats: number): Promise<DemoTable> => {
    const id = await created(
      owner,
      'CreateTable',
      { ...scope, sectorId, code, seats },
      'diningTable_insert',
    );
    return { id, code, qrPublicId: await qrOf(owner, scope.tenantId, scope.branchId, id) };
  };
  const terrace = await created(
    owner,
    'CreateSector',
    { ...scope, name: 'Terraza', sort: 2 },
    'sector_insert',
  );
  return {
    M2: await table(fixture.sectorId, 'M2', 4),
    M3: await table(fixture.sectorId, 'M3', 2),
    T1: await table(terrace, 'T1', 4),
    T2: await table(terrace, 'T2', 2),
  };
}
