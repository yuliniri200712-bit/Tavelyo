// Aislamiento y autorización del conector «tavelyo» (Fase 1, criterios 1 y 2; PM §12 casos 1 y 2).
// Dos empresas (A y B) con personal de distintos roles; cada operación se prueba con el ID
// legítimo y con IDs alterados de la otra empresa.
import { beforeAll, describe, expect, it } from 'vitest';
import { admin, createUser, expectOk, mutate, query, type TestUser } from './support/emulator.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
  type ProvisionedTenant,
} from './support/provisioning.ts';

interface Users {
  ownerA: TestUser;
  adminA: TestUser;
  waiterA: TestUser;
  kitchenA: TestUser;
  newcomer: TestUser;
  ownerB: TestUser;
  waiterB: TestUser;
  outsider: TestUser;
  ownerSuspended: TestUser;
}

let u: Users;
let tenantA: ProvisionedTenant;
let tenantB: ProvisionedTenant;
let suspended: ProvisionedTenant;

const denied = (result: { errors: readonly string[] }) => result.errors.length > 0;

async function auditCount(tenantId: string): Promise<number> {
  const data = expectOk(
    await admin<{ auditEvents: unknown[] }>(
      `query ($tenantId: UUID!) { auditEvents(where: { tenant: { id: { eq: $tenantId } } }) { id } }`,
      { tenantId },
    ),
    'Conteo de auditoría',
  );
  return data.auditEvents.length;
}

async function branchesOf(user: TestUser, tenantId: string) {
  const result = await query<{ branches: Array<{ id: string; name: string }> }>(
    user,
    'MyBranches',
    {
      tenantId,
    },
  );
  return expectOk(result, `MyBranches de ${user.label}`).branches.map((branch) => branch.name);
}

beforeAll(async () => {
  await seedAuthorizationCatalog();
  const labels = [
    'ownerA',
    'adminA',
    'waiterA',
    'kitchenA',
    'newcomer',
    'ownerB',
    'waiterB',
    'outsider',
    'ownerSuspended',
  ] as const;
  const created = await Promise.all(labels.map((label) => createUser(label)));
  u = Object.fromEntries(created.map((user) => [user.label, user])) as unknown as Users;
  for (const user of created) await createProfile(user);

  tenantA = await provisionTenant('Empresa A', u.ownerA, ['A-Centro', 'A-Norte']);
  tenantB = await provisionTenant('Empresa B', u.ownerB, ['B-Sur']);
  suspended = await provisionTenant('Empresa suspendida', u.ownerSuspended, ['S-1'], 'SUSPENDED');
  const a = tenantA.branches;
  await insertMembership(tenantA.id, u.adminA, 'branch_admin', [a['A-Centro'] ?? '']);
  await insertMembership(tenantA.id, u.waiterA, 'waiter', [a['A-Centro'] ?? '']);
  await insertMembership(tenantA.id, u.kitchenA, 'kitchen', [a['A-Centro'] ?? '']);
  await insertMembership(tenantB.id, u.waiterB, 'waiter', [tenantB.branches['B-Sur'] ?? '']);
});

describe('sin sesión', () => {
  it('ninguna operación responde sin token', async () => {
    expect(denied(await query(null, 'MyMemberships'))).toBe(true);
    expect(denied(await query(null, 'MyBranches', { tenantId: tenantA.id }))).toBe(true);
    expect(denied(await mutate(null, 'UpsertMyProfile', { displayName: 'x' }))).toBe(true);
  });
});

describe('MyMemberships', () => {
  it('devuelve solo las empresas activas del propio usuario, con sus permisos', async () => {
    const data = expectOk(
      await query<{
        memberships: Array<{
          tenant: { id: string };
          role: { code: string; rolePermissions_on_role: Array<{ permission: { code: string } }> };
        }>;
      }>(u.waiterA, 'MyMemberships'),
      'MyMemberships',
    );
    expect(data.memberships).toHaveLength(1);
    const [membership] = data.memberships;
    expect(membership?.tenant.id).toBe(tenantA.id);
    expect(membership?.role.code).toBe('waiter');
    const permissions = membership?.role.rolePermissions_on_role.map((rp) => rp.permission.code);
    expect(permissions).toContain('order.create');
    expect(permissions).not.toContain('staff.invite');
  });

  it('un usuario sin membresías no ve ninguna empresa', async () => {
    const data = expectOk(
      await query<{ memberships: unknown[] }>(u.outsider, 'MyMemberships'),
      'x',
    );
    expect(data.memberships).toEqual([]);
  });

  it('una empresa suspendida no aparece', async () => {
    const data = expectOk(
      await query<{ memberships: unknown[] }>(u.ownerSuspended, 'MyMemberships'),
      'x',
    );
    expect(data.memberships).toEqual([]);
  });
});

describe('MyBranches', () => {
  it('el propietario ve todas las sucursales de su empresa', async () => {
    expect(await branchesOf(u.ownerA, tenantA.id)).toEqual(['A-Centro', 'A-Norte']);
  });

  it('el resto del personal ve solo las sucursales asignadas', async () => {
    expect(await branchesOf(u.waiterA, tenantA.id)).toEqual(['A-Centro']);
  });

  it('con el ID de otra empresa no se ve nada (ID alterado)', async () => {
    expect(await branchesOf(u.ownerB, tenantA.id)).toEqual([]);
    expect(await branchesOf(u.ownerA, tenantB.id)).toEqual([]);
    expect(await branchesOf(u.outsider, tenantA.id)).toEqual([]);
  });

  it('en una empresa suspendida no se ve ninguna sucursal', async () => {
    expect(await branchesOf(u.ownerSuspended, suspended.id)).toEqual([]);
  });
});

describe('TenantMembers', () => {
  it('el propietario lista solo el personal de su empresa', async () => {
    const data = expectOk(
      await query<{ memberships: Array<{ user: { id: string } }> }>(u.ownerA, 'TenantMembers', {
        tenantId: tenantA.id,
      }),
      'TenantMembers',
    );
    const ids = data.memberships.map((m) => m.user.id);
    expect(ids).toEqual(expect.arrayContaining([u.ownerA.uid, u.adminA.uid, u.waiterA.uid]));
    expect(ids).not.toContain(u.ownerB.uid);
    expect(ids).not.toContain(u.waiterB.uid);
  });

  it('un rol sin staff.invite no puede listar al personal', async () => {
    expect(denied(await query(u.waiterA, 'TenantMembers', { tenantId: tenantA.id }))).toBe(true);
  });

  it('el propietario de otra empresa no puede listarlo (ID alterado)', async () => {
    const result = await query(u.ownerB, 'TenantMembers', { tenantId: tenantA.id });
    expect(denied(result)).toBe(true);
    expect(result.data?.['memberships'] ?? null).toBeNull();
  });

  it('en una empresa suspendida se rechaza', async () => {
    expect(denied(await query(u.ownerSuspended, 'TenantMembers', { tenantId: suspended.id }))).toBe(
      true,
    );
  });
});

describe('AddMember', () => {
  it('el propietario agrega personal con un rol inferior y queda auditado', async () => {
    const before = await auditCount(tenantA.id);
    expectOk(
      await mutate(u.ownerA, 'AddMember', {
        tenantId: tenantA.id,
        userId: u.newcomer.uid,
        roleCode: 'cashier',
      }),
      'AddMember',
    );
    expect(await auditCount(tenantA.id)).toBe(before + 1);
  });

  it('nadie asigna un rol igual o superior al propio', async () => {
    const before = await auditCount(tenantA.id);
    const variables = { tenantId: tenantA.id, userId: u.outsider.uid };
    expect(
      denied(await mutate(u.adminA, 'AddMember', { ...variables, roleCode: 'branch_admin' })),
    ).toBe(true);
    expect(
      denied(await mutate(u.adminA, 'AddMember', { ...variables, roleCode: 'tenant_owner' })),
    ).toBe(true);
    expect(
      denied(await mutate(u.ownerA, 'AddMember', { ...variables, roleCode: 'tenant_owner' })),
    ).toBe(true);
    expect(await auditCount(tenantA.id)).toBe(before);
  });

  it('un rol sin staff.invite no agrega personal', async () => {
    const result = await mutate(u.waiterA, 'AddMember', {
      tenantId: tenantA.id,
      userId: u.outsider.uid,
      roleCode: 'kitchen',
    });
    expect(denied(result)).toBe(true);
  });

  it('el propietario de otra empresa no agrega personal en A (ID alterado)', async () => {
    const result = await mutate(u.ownerB, 'AddMember', {
      tenantId: tenantA.id,
      userId: u.waiterB.uid,
      roleCode: 'waiter',
    });
    expect(denied(result)).toBe(true);
  });

  it('un rol inexistente se rechaza', async () => {
    const result = await mutate(u.ownerA, 'AddMember', {
      tenantId: tenantA.id,
      userId: u.outsider.uid,
      roleCode: 'superusuario',
    });
    expect(denied(result)).toBe(true);
  });
});

describe('ChangeMemberRole', () => {
  it('el propietario cambia el rol de alguien de rango inferior', async () => {
    expectOk(
      await mutate(u.ownerA, 'ChangeMemberRole', {
        tenantId: tenantA.id,
        userId: u.kitchenA.uid,
        roleCode: 'waiter',
      }),
      'ChangeMemberRole',
    );
  });

  it('nadie modifica a alguien de rango igual o superior', async () => {
    const result = await mutate(u.adminA, 'ChangeMemberRole', {
      tenantId: tenantA.id,
      userId: u.ownerA.uid,
      roleCode: 'waiter',
    });
    expect(denied(result)).toBe(true);
  });

  it('nadie cambia su propio rol', async () => {
    const result = await mutate(u.adminA, 'ChangeMemberRole', {
      tenantId: tenantA.id,
      userId: u.adminA.uid,
      roleCode: 'waiter',
    });
    expect(denied(result)).toBe(true);
  });

  it('el propietario de otra empresa no cambia roles en A (ID alterado)', async () => {
    const result = await mutate(u.ownerB, 'ChangeMemberRole', {
      tenantId: tenantA.id,
      userId: u.waiterA.uid,
      roleCode: 'kitchen',
    });
    expect(denied(result)).toBe(true);
  });
});

describe('AssignMemberBranch y UnassignMemberBranch', () => {
  it('el propietario asigna otra sucursal y el miembro la ve en su siguiente consulta', async () => {
    expectOk(
      await mutate(u.ownerA, 'AssignMemberBranch', {
        tenantId: tenantA.id,
        userId: u.waiterA.uid,
        branchId: tenantA.branches['A-Norte'],
      }),
      'AssignMemberBranch',
    );
    expect(await branchesOf(u.waiterA, tenantA.id)).toEqual(['A-Centro', 'A-Norte']);
  });

  it('quien no es propietario solo asigna sucursales que tiene asignadas', async () => {
    const result = await mutate(u.adminA, 'AssignMemberBranch', {
      tenantId: tenantA.id,
      userId: u.newcomer.uid,
      branchId: tenantA.branches['A-Norte'],
    });
    expect(denied(result)).toBe(true);
  });

  it('no se asigna una sucursal de otra empresa (ID alterado)', async () => {
    const result = await mutate(u.ownerA, 'AssignMemberBranch', {
      tenantId: tenantA.id,
      userId: u.waiterA.uid,
      branchId: tenantB.branches['B-Sur'],
    });
    expect(denied(result)).toBe(true);
  });

  it('quitar la sucursal se aplica en la siguiente consulta (degradación)', async () => {
    expectOk(
      await mutate(u.ownerA, 'UnassignMemberBranch', {
        tenantId: tenantA.id,
        userId: u.waiterA.uid,
        branchId: tenantA.branches['A-Norte'],
      }),
      'UnassignMemberBranch',
    );
    expect(await branchesOf(u.waiterA, tenantA.id)).toEqual(['A-Centro']);
  });

  it('el propietario de otra empresa no quita sucursales en A (ID alterado)', async () => {
    const result = await mutate(u.ownerB, 'UnassignMemberBranch', {
      tenantId: tenantA.id,
      userId: u.waiterA.uid,
      branchId: tenantA.branches['A-Centro'],
    });
    expect(denied(result)).toBe(true);
  });
});

describe('RevokeMember', () => {
  it('nadie revoca a alguien de rango igual o superior', async () => {
    const result = await mutate(u.adminA, 'RevokeMember', {
      tenantId: tenantA.id,
      userId: u.ownerA.uid,
    });
    expect(denied(result)).toBe(true);
  });

  it('el propietario de otra empresa no revoca en A (ID alterado)', async () => {
    const result = await mutate(u.ownerB, 'RevokeMember', {
      tenantId: tenantA.id,
      userId: u.waiterA.uid,
    });
    expect(denied(result)).toBe(true);
  });

  it('la revocación se aplica en la siguiente operación con el mismo token', async () => {
    expect(await branchesOf(u.adminA, tenantA.id)).toEqual(['A-Centro']);
    expectOk(
      await mutate(u.ownerA, 'RevokeMember', {
        tenantId: tenantA.id,
        userId: u.adminA.uid,
        reason: 'Prueba de revocación',
      }),
      'RevokeMember',
    );
    // Mismo ID token que antes de la revocación.
    expect(await branchesOf(u.adminA, tenantA.id)).toEqual([]);
    expect(denied(await query(u.adminA, 'TenantMembers', { tenantId: tenantA.id }))).toBe(true);
    const result = await mutate(u.adminA, 'AddMember', {
      tenantId: tenantA.id,
      userId: u.outsider.uid,
      roleCode: 'waiter',
    });
    expect(denied(result)).toBe(true);
    const memberships = expectOk(
      await query<{ memberships: unknown[] }>(u.adminA, 'MyMemberships'),
      'MyMemberships',
    );
    expect(memberships.memberships).toEqual([]);
  });
});

describe('TenantAuditEvents', () => {
  it('el propietario ve solo los eventos de su empresa', async () => {
    const data = expectOk(
      await query<{ auditEvents: Array<{ operation: string; actorId: string }> }>(
        u.ownerA,
        'TenantAuditEvents',
        { tenantId: tenantA.id },
      ),
      'TenantAuditEvents',
    );
    const operations = data.auditEvents.map((event) => event.operation);
    expect(operations).toEqual(
      expect.arrayContaining([
        'membership.add',
        'membership.change_role',
        'membership.assign_branch',
        'membership.unassign_branch',
        'membership.revoke',
      ]),
    );
    expect(data.auditEvents.every((event) => event.actorId === u.ownerA.uid)).toBe(true);
  });

  it('sin audit.read o desde otra empresa se rechaza', async () => {
    expect(denied(await query(u.waiterA, 'TenantAuditEvents', { tenantId: tenantA.id }))).toBe(
      true,
    );
    expect(denied(await query(u.ownerB, 'TenantAuditEvents', { tenantId: tenantA.id }))).toBe(true);
  });

  it('la otra empresa no tiene eventos de A', async () => {
    expect(await auditCount(tenantB.id)).toBe(0);
  });
});

describe('integridad en la base (incluso con credenciales de servidor)', () => {
  it('la FK compuesta impide asignar una sucursal de otra empresa', async () => {
    const result = await admin(
      `mutation ($tenantId: UUID!, $userId: String!, $branchId: UUID!) {
        membershipBranch_insert(data: { tenantId: $tenantId, userId: $userId, branchId: $branchId, createdBy: "prueba" })
      }`,
      { tenantId: tenantA.id, userId: u.waiterA.uid, branchId: tenantB.branches['B-Sur'] },
    );
    expect(result.errors.join(' ')).toMatch(/foreign key/i);
  });
});
