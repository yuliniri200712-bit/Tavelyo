// Autorización del backend (Fase 1, criterio 1): las funciones reales en el emulador de Cloud
// Functions, contra Auth y SQL Connect, con dos empresas e IDs alterados.
import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  admin,
  createUser,
  expectOk,
  query,
  type TestUser,
} from '../../dataconnect/tests/support/emulator.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
  type ProvisionedTenant,
} from '../../dataconnect/tests/support/provisioning.ts';
import { PLATFORM_OPERATOR_CLAIM } from '../src/provisioning/provision-tenant.ts';
import {
  adminAuth,
  callFunction,
  nextSecond,
  sessionsRevoked,
  setPasswordThroughReset,
  signInWithForgedClaim,
} from './support/functions.ts';

let ownerA: TestUser;
let ownerB: TestUser;
let adminA: TestUser;
let cashierA: TestUser;
let operator: TestUser;
let outsider: TestUser;
let tenantA: ProvisionedTenant;
let tenantB: ProvisionedTenant;

/** Miembro nuevo de A (y opcionalmente de B) para cada prueba que revoca. */
async function newMember(label: string, alsoInB = false): Promise<TestUser> {
  const user = await createUser(label);
  await createProfile(user);
  await insertMembership(tenantA.id, user, 'waiter', [tenantA.branches['Centro'] ?? '']);
  if (alsoInB) await insertMembership(tenantB.id, user, 'waiter');
  return user;
}

async function membershipStatus(tenantId: string, userId: string): Promise<string | undefined> {
  const data = expectOk(
    await admin<{ membership: { status: string } | null }>(
      `query ($tenantId: UUID!, $userId: String!) { membership(key: { tenantId: $tenantId, userId: $userId }) { status } }`,
      { tenantId, userId },
    ),
    'Estado de la membresía',
  );
  return data.membership?.status;
}

async function myTenantIds(user: TestUser): Promise<string[]> {
  const data = expectOk(
    await query<{ memberships: Array<{ tenant: { id: string } }> }>(user, 'MyMemberships'),
    'Mis empresas',
  );
  return data.memberships.map((membership) => membership.tenant.id);
}

beforeAll(async () => {
  await seedAuthorizationCatalog();
  ownerA = await createUser('be-owner-a');
  ownerB = await createUser('be-owner-b');
  adminA = await createUser('be-admin-a');
  cashierA = await createUser('be-cashier-a');
  operator = await createUser('be-operator');
  outsider = await createUser('be-outsider');
  for (const user of [ownerA, ownerB, adminA, cashierA, operator, outsider]) {
    await createProfile(user);
  }
  tenantA = await provisionTenant('Backend A', ownerA, ['Centro']);
  tenantB = await provisionTenant('Backend B', ownerB, ['Sur']);
  await insertMembership(tenantA.id, adminA, 'branch_admin', [tenantA.branches['Centro'] ?? '']);
  await insertMembership(tenantA.id, cashierA, 'cashier');
  // La afirmación se guarda en la cuenta; el token de la prueba no la lleva, y no hace falta:
  // el backend la lee de Auth en cada llamada.
  await adminAuth.setCustomUserClaims(operator.uid, { [PLATFORM_OPERATOR_CLAIM]: true });
});

describe('revokeMember', () => {
  it('sin sesión: unauthenticated', async () => {
    const waiter = await newMember('be-w-nosession');
    const result = await callFunction(null, 'revokeMember', {
      tenantId: tenantA.id,
      userId: waiter.uid,
    });
    expect(result).toMatchObject({ ok: false, status: 'UNAUTHENTICATED' });
    expect(await membershipStatus(tenantA.id, waiter.uid)).toBe('ACTIVE');
  });

  it.each([
    ['empresa que no es UUID', { tenantId: 'empresa-a', userId: 'x' }],
    ['campos no admitidos', { tenantId: randomUUID(), userId: 'x', roleCode: 'tenant_owner' }],
    ['GraphQL en el usuario', { tenantId: randomUUID(), userId: '") { id } #' }],
  ])('entrada no válida (%s): invalid-argument', async (_case, data) => {
    expect(await callFunction(ownerA, 'revokeMember', data)).toMatchObject({
      ok: false,
      status: 'INVALID_ARGUMENT',
    });
  });

  it('el propietario de B no revoca a un miembro de A (ID de empresa ajeno)', async () => {
    const waiter = await newMember('be-w-cross');
    const result = await callFunction(ownerB, 'revokeMember', {
      tenantId: tenantA.id,
      userId: waiter.uid,
    });
    expect(result).toMatchObject({ ok: false, status: 'PERMISSION_DENIED' });
    expect(await membershipStatus(tenantA.id, waiter.uid)).toBe('ACTIVE');
    expect(await sessionsRevoked(waiter)).toBe(false);
  });

  it('el propietario de B, con su propia empresa y un usuario de A: rechazado', async () => {
    const waiter = await newMember('be-w-altered');
    for (const tenantId of [tenantB.id, randomUUID()]) {
      const result = await callFunction(ownerB, 'revokeMember', { tenantId, userId: waiter.uid });
      expect(result).toMatchObject({ ok: false, status: 'PERMISSION_DENIED' });
    }
    expect(await membershipStatus(tenantA.id, waiter.uid)).toBe('ACTIVE');
  });

  it('sin permiso staff.invite (cajero) o sin membresía: rechazado', async () => {
    const waiter = await newMember('be-w-noperm');
    for (const user of [cashierA, outsider, operator]) {
      const result = await callFunction(user, 'revokeMember', {
        tenantId: tenantA.id,
        userId: waiter.uid,
      });
      expect(result).toMatchObject({ ok: false, status: 'PERMISSION_DENIED' });
    }
    expect(await membershipStatus(tenantA.id, waiter.uid)).toBe('ACTIVE');
  });

  it('nadie revoca a alguien de rango igual o superior (ni a sí mismo)', async () => {
    for (const [user, target] of [
      [adminA, ownerA],
      [ownerA, ownerA],
    ] as const) {
      const result = await callFunction(user, 'revokeMember', {
        tenantId: tenantA.id,
        userId: target.uid,
      });
      expect(result).toMatchObject({ ok: false, status: 'PERMISSION_DENIED' });
    }
    expect(await membershipStatus(tenantA.id, ownerA.uid)).toBe('ACTIVE');
  });

  it('el propietario revoca: la membresía cae, sus sesiones se cierran y queda auditado', async () => {
    const waiter = await newMember('be-w-revoked');
    await nextSecond();
    expect(await sessionsRevoked(waiter)).toBe(false);

    const result = await callFunction(ownerA, 'revokeMember', {
      tenantId: tenantA.id,
      userId: waiter.uid,
      reason: 'Fin de contrato',
    });

    expect(result).toEqual({ ok: true, result: { sessionsRevoked: true } });
    expect(await membershipStatus(tenantA.id, waiter.uid)).toBe('REVOKED');
    expect(await sessionsRevoked(waiter)).toBe(true);
    // Con su ID token aún vigente, la siguiente operación ya no ve la empresa.
    expect(await myTenantIds(waiter)).not.toContain(tenantA.id);

    const audit = expectOk(
      await query<{
        auditEvents: Array<{ operation: string; resourceId: string; reason: string | null }>;
      }>(ownerA, 'TenantAuditEvents', { tenantId: tenantA.id }),
      'Auditoría de A',
    ).auditEvents.filter((event) => event.resourceId === waiter.uid);
    expect(audit.map((event) => event.operation).sort()).toEqual([
      'auth.sessions_revoked',
      'membership.revoke',
    ]);
  });

  it('el administrador de sucursal revoca a un mesero de rango inferior', async () => {
    const waiter = await newMember('be-w-by-admin');
    const result = await callFunction(adminA, 'revokeMember', {
      tenantId: tenantA.id,
      userId: waiter.uid,
    });
    expect(result).toEqual({ ok: true, result: { sessionsRevoked: true } });
  });

  it('si conserva otra membresía activa, sigue con sesión y con acceso a la otra empresa', async () => {
    const shared = await newMember('be-w-shared', true);
    await nextSecond();
    const result = await callFunction(ownerA, 'revokeMember', {
      tenantId: tenantA.id,
      userId: shared.uid,
    });

    expect(result).toEqual({ ok: true, result: { sessionsRevoked: false } });
    expect(await membershipStatus(tenantA.id, shared.uid)).toBe('REVOKED');
    expect(await membershipStatus(tenantB.id, shared.uid)).toBe('ACTIVE');
    expect(await sessionsRevoked(shared)).toBe(false);
    expect(await myTenantIds(shared)).toEqual([tenantB.id]);
  });

  it('revocar dos veces: la segunda es rechazada', async () => {
    const waiter = await newMember('be-w-twice');
    const input = { tenantId: tenantA.id, userId: waiter.uid };
    expect((await callFunction(ownerA, 'revokeMember', input)).ok).toBe(true);
    expect(await callFunction(ownerA, 'revokeMember', input)).toMatchObject({
      ok: false,
      status: 'PERMISSION_DENIED',
    });
  });
});

describe('provisionTenant', () => {
  const request = (ownerEmail: string) => ({
    tenantName: 'Restaurante C',
    branchName: 'Principal',
    currency: 'COP',
    timezone: 'America/Bogota',
    ownerEmail,
  });

  it('sin sesión: unauthenticated', async () => {
    expect(await callFunction(null, 'provisionTenant', request('x@example.test'))).toMatchObject({
      ok: false,
      status: 'UNAUTHENTICATED',
    });
  });

  it('un propietario o cualquier usuario sin la afirmación: rechazado', async () => {
    for (const user of [ownerA, outsider]) {
      expect(
        await callFunction(user, 'provisionTenant', request(`no-${randomUUID()}@example.test`)),
      ).toMatchObject({ ok: false, status: 'PERMISSION_DENIED' });
    }
  });

  it('una afirmación metida en el token pero no guardada en la cuenta: rechazado', async () => {
    const forged = await signInWithForgedClaim(outsider.uid, { [PLATFORM_OPERATOR_CLAIM]: true });
    expect(
      await callFunction(forged, 'provisionTenant', request(`forged-${randomUUID()}@example.test`)),
    ).toMatchObject({ ok: false, status: 'PERMISSION_DENIED' });
  });

  it('al operador se le retira la afirmación: rechazado de inmediato, con el mismo token', async () => {
    const former = await createUser('be-former-operator');
    await adminAuth.setCustomUserClaims(former.uid, { [PLATFORM_OPERATOR_CLAIM]: true });
    const email = `former-${randomUUID()}@example.test`;
    expect((await callFunction(former, 'provisionTenant', request(email))).ok).toBe(true);

    await adminAuth.setCustomUserClaims(former.uid, null);
    expect(await callFunction(former, 'provisionTenant', request(email))).toMatchObject({
      ok: false,
      status: 'PERMISSION_DENIED',
    });
  });

  it('operador con las sesiones revocadas: rechazado', async () => {
    const revoked = await createUser('be-revoked-operator');
    await adminAuth.setCustomUserClaims(revoked.uid, { [PLATFORM_OPERATOR_CLAIM]: true });
    await nextSecond();
    await adminAuth.revokeRefreshTokens(revoked.uid);
    expect(
      await callFunction(revoked, 'provisionTenant', request(`rev-${randomUUID()}@example.test`)),
    ).toMatchObject({ ok: false, status: 'PERMISSION_DENIED' });
  });

  it.each([
    ['moneda no admitida', { currency: 'XYZ' }],
    ['sin zona horaria', { timezone: undefined }],
    ['correo no válido', { ownerEmail: 'duena@' }],
    ['estado elegido por el cliente', { status: 'SUSPENDED' }],
  ])('operador con entrada no válida (%s): invalid-argument', async (_case, change) => {
    const result = await callFunction(operator, 'provisionTenant', {
      ...request(`bad-${randomUUID()}@example.test`),
      ...change,
    });
    expect(result).toMatchObject({ ok: false, status: 'INVALID_ARGUMENT' });
  });

  it('crea empresa, sucursal y propietaria nueva, que define su contraseña y entra solo a lo suyo', async () => {
    const email = `duena-c-${randomUUID()}@example.test`;
    const result = await callFunction<{
      tenantId: string;
      branchId: string;
      ownerId: string;
      ownerAccountCreated: boolean;
    }>(operator, 'provisionTenant', request(email));
    if (!result.ok) throw new Error(result.message);
    const { tenantId, branchId, ownerId, ownerAccountCreated } = result.result;
    expect(ownerAccountCreated).toBe(true);

    const stored = expectOk(
      await admin<{
        tenant: { name: string; status: string; defaultCurrency: string; defaultTimezone: string };
        branch: { tenantId: string; name: string; currency: string; timezone: string };
        membership: { status: string; roleCode: string; createdBy: string };
        auditEvents: Array<{ actorId: string; operation: string }>;
      }>(
        `query ($tenantId: UUID!, $branchId: UUID!, $ownerId: String!) {
          tenant(id: $tenantId) { name status defaultCurrency defaultTimezone }
          branch(id: $branchId) { tenantId name currency timezone }
          membership(key: { tenantId: $tenantId, userId: $ownerId }) { status roleCode createdBy }
          auditEvents(where: { tenant: { id: { eq: $tenantId } } }) { actorId operation }
        }`,
        { tenantId, branchId, ownerId },
      ),
      'Empresa aprovisionada',
    );
    expect(stored.tenant).toEqual({
      name: 'Restaurante C',
      status: 'ACTIVE',
      defaultCurrency: 'COP',
      defaultTimezone: 'America/Bogota',
    });
    expect(stored.branch).toEqual({
      tenantId,
      name: 'Principal',
      currency: 'COP',
      timezone: 'America/Bogota',
    });
    expect(stored.membership).toEqual({
      status: 'ACTIVE',
      roleCode: 'tenant_owner',
      createdBy: operator.uid,
    });
    expect(stored.auditEvents).toEqual([{ actorId: operator.uid, operation: 'tenant.provision' }]);

    // La propietaria entra con «¿Olvidaste tu contraseña?» y solo ve su empresa.
    const session = await setPasswordThroughReset(email);
    expect(session.uid).toBe(ownerId);
    const owner = { label: 'duena-c', email, uid: ownerId, token: session.token, refreshToken: '' };
    expect(await myTenantIds(owner)).toEqual([tenantId]);

    // Ni el operador ni las otras empresas obtienen acceso a la nueva.
    expect(await myTenantIds(operator)).not.toContain(tenantId);
    expect(await myTenantIds(ownerA)).toEqual([tenantA.id]);
  });

  it('con una cuenta existente: la reutiliza sin cambiar su nombre', async () => {
    const result = await callFunction<{
      tenantId: string;
      ownerId: string;
      ownerAccountCreated: boolean;
    }>(operator, 'provisionTenant', request(ownerB.email));
    if (!result.ok) throw new Error(result.message);
    expect(result.result).toMatchObject({ ownerId: ownerB.uid, ownerAccountCreated: false });
    expect((await myTenantIds(ownerB)).sort()).toEqual([tenantB.id, result.result.tenantId].sort());

    const profile = expectOk(
      await admin<{ userProfile: { displayName: string } }>(
        `query ($id: String!) { userProfile(id: $id) { displayName } }`,
        { id: ownerB.uid },
      ),
      'Perfil de B',
    );
    expect(profile.userProfile.displayName).toBe(ownerB.label);
  });
});
