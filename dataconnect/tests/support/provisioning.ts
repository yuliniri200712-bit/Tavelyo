// Siembra del catálogo y aprovisionamiento de empresas con credenciales de servidor.
// Es lo que hará el operador de plataforma: la app nunca crea empresas, sucursales ni roles.
import { PERMISSIONS, ROLES, type RoleCode } from '@tavelyo/contracts';
import { admin, expectOk, mutate, type TestUser } from './emulator.ts';

/** Inserta o actualiza roles, permisos y su relación desde packages/contracts. */
export async function seedAuthorizationCatalog(): Promise<void> {
  const lines: string[] = [];
  let n = 0;
  const alias = () => `m${(n += 1)}`;
  for (const [code, description] of Object.entries(PERMISSIONS)) {
    lines.push(
      `${alias()}: permission_upsert(data: { code: ${JSON.stringify(code)}, description: ${JSON.stringify(description)} })`,
    );
  }
  for (const [code, role] of Object.entries(ROLES)) {
    lines.push(
      `${alias()}: role_upsert(data: { code: ${JSON.stringify(code)}, name: ${JSON.stringify(role.name)}, rank: ${role.rank} })`,
    );
    for (const permission of role.permissions) {
      lines.push(
        `${alias()}: rolePermission_upsert(data: { roleCode: ${JSON.stringify(code)}, permissionCode: ${JSON.stringify(permission)} })`,
      );
    }
  }
  expectOk(await admin(`mutation SeedCatalog {\n${lines.join('\n')}\n}`), 'Siembra del catálogo');
}

export async function createProfile(user: TestUser): Promise<void> {
  expectOk(
    await mutate(user, 'UpsertMyProfile', { displayName: user.label }),
    `Perfil de ${user.label}`,
  );
}

export interface ProvisionedTenant {
  readonly id: string;
  readonly branches: Readonly<Record<string, string>>;
}

/** Crea una empresa con sus sucursales y su propietario (aprovisionamiento de plataforma). */
export async function provisionTenant(
  name: string,
  owner: TestUser,
  branchNames: readonly string[],
  status: 'ACTIVE' | 'SUSPENDED' = 'ACTIVE',
): Promise<ProvisionedTenant> {
  const tenant = expectOk(
    await admin<{ tenant_insert: { id: string } }>(
      `mutation ($name: String!, $status: TenantStatus!) {
        tenant_insert(data: { name: $name, status: $status, defaultCurrency: "COP", defaultTimezone: "America/Bogota" })
      }`,
      { name, status },
    ),
    `Empresa ${name}`,
  ).tenant_insert.id;

  const branches: Record<string, string> = {};
  for (const branchName of branchNames) {
    branches[branchName] = expectOk(
      await admin<{ branch_insert: { id: string } }>(
        `mutation ($tenantId: UUID!, $name: String!) {
          branch_insert(data: { tenantId: $tenantId, name: $name, currency: "COP", timezone: "America/Bogota", status: ACTIVE })
        }`,
        { tenantId: tenant, name: branchName },
      ),
      `Sucursal ${branchName}`,
    ).branch_insert.id;
  }

  await insertMembership(tenant, owner, 'tenant_owner');
  return { id: tenant, branches };
}

/** Membresía creada por el aprovisionamiento (p. ej. el primer propietario). */
export async function insertMembership(
  tenantId: string,
  user: TestUser,
  roleCode: RoleCode,
  branchIds: readonly string[] = [],
): Promise<void> {
  expectOk(
    await admin(
      `mutation ($tenantId: UUID!, $userId: String!, $roleCode: String!) {
        membership_insert(data: { tenantId: $tenantId, userId: $userId, roleCode: $roleCode, status: ACTIVE, createdBy: "aprovisionamiento" })
      }`,
      { tenantId, userId: user.uid, roleCode },
    ),
    `Membresía de ${user.label}`,
  );
  for (const branchId of branchIds) {
    expectOk(
      await admin(
        `mutation ($tenantId: UUID!, $userId: String!, $branchId: UUID!) {
          membershipBranch_insert(data: { tenantId: $tenantId, userId: $userId, branchId: $branchId, createdBy: "aprovisionamiento" })
        }`,
        { tenantId, userId: user.uid, branchId },
      ),
      `Sucursal de ${user.label}`,
    );
  }
}
