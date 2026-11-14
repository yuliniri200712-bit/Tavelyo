// Pasarelas reales de packages/data-access (SDK web de Firebase + SDK generado de SQL Connect)
// contra los emuladores. Comprueba de punta a punta lo que usa la app de operaciones.
import { deleteApp } from 'firebase/app';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createFirebaseAuthGateway,
  createFirebaseClient,
  createProfileGateway,
  createTenancyGateway,
  type FirebaseClient,
} from '@tavelyo/data-access';
import { createUser, TEST_PASSWORD, type TestUser } from './support/emulator.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
  type ProvisionedTenant,
} from './support/provisioning.ts';

let client: FirebaseClient;
let waiter: TestUser;
let tenant: ProvisionedTenant;
let otherTenant: ProvisionedTenant;

beforeAll(async () => {
  await seedAuthorizationCatalog();
  const owner = await createUser('gw-owner');
  const otherOwner = await createUser('gw-other-owner');
  waiter = await createUser('gw-waiter');
  for (const user of [owner, otherOwner]) await createProfile(user);
  tenant = await provisionTenant('Empresa pasarelas', owner, ['Centro', 'Norte']);
  otherTenant = await provisionTenant('Otra empresa', otherOwner, ['Sur']);
  // El perfil del mesero lo crea la pasarela al iniciar sesión; la membresía se agrega después.
  client = createFirebaseClient(
    {
      projectId: 'demo-tavelyo',
      apiKey: 'demo-api-key',
      authDomain: 'demo-tavelyo.firebaseapp.com',
      appId: '1:000000000000:web:0000000000000000000000',
      useEmulators: true,
      emulatorHost: '127.0.0.1',
    },
    `pasarelas-${Date.now()}`,
  );
});

afterAll(async () => {
  if (client) await deleteApp(client.app);
});

describe('pasarelas de data-access contra los emuladores', () => {
  it('una contraseña incorrecta da invalid-credentials', async () => {
    const auth = createFirebaseAuthGateway(client.auth);
    expect(await auth.signIn(waiter.email, 'incorrecta')).toEqual({
      ok: false,
      error: 'invalid-credentials',
    });
  });

  it('un correo inexistente responde igual que uno registrado (sin enumeración)', async () => {
    const auth = createFirebaseAuthGateway(client.auth);
    expect(await auth.signIn('nadie@example.test', 'x')).toEqual({
      ok: false,
      error: 'invalid-credentials',
    });
    expect(await auth.sendPasswordReset('nadie@example.test')).toEqual({
      ok: true,
      value: undefined,
    });
  });

  it('inicia sesión, crea el perfil y, sin membresías, no ve empresas', async () => {
    const auth = createFirebaseAuthGateway(client.auth);
    const signedIn = await auth.signIn(waiter.email, TEST_PASSWORD);
    expect(signedIn.ok && signedIn.value.uid).toBe(waiter.uid);
    expect(
      (await createProfileGateway(client.dataConnect).ensureProfile('Mesero de prueba')).ok,
    ).toBe(true);
    expect(await createTenancyGateway(client.dataConnect).myMemberships()).toEqual({
      ok: true,
      value: [],
    });
  });

  it('con membresía ve su empresa, su rol y solo la sucursal asignada', async () => {
    await insertMembership(tenant.id, waiter, 'waiter', [tenant.branches['Norte'] ?? '']);
    const tenancy = createTenancyGateway(client.dataConnect);
    const memberships = await tenancy.myMemberships();
    expect(memberships.ok).toBe(true);
    if (!memberships.ok) return;
    expect(memberships.value).toHaveLength(1);
    expect(memberships.value[0]).toMatchObject({
      tenantId: tenant.id,
      tenantName: 'Empresa pasarelas',
      roleCode: 'waiter',
      roleName: 'Mesero',
    });
    expect(memberships.value[0]?.permissions).toContain('order.create');

    const branches = await tenancy.myBranches(tenant.id);
    expect(branches.ok && branches.value.map((b) => b.name)).toEqual(['Norte']);
  });

  it('con el ID de otra empresa no ve sucursales (ID alterado)', async () => {
    const branches = await createTenancyGateway(client.dataConnect).myBranches(otherTenant.id);
    expect(branches).toEqual({ ok: true, value: [] });
  });

  it('tras cerrar sesión, las consultas se rechazan', async () => {
    await createFirebaseAuthGateway(client.auth).signOut();
    const memberships = await createTenancyGateway(client.dataConnect).myMemberships();
    expect(memberships.ok).toBe(false);
  });
});
