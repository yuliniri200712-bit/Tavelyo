// Recorrido real del personal en navegador contra los emuladores (Auth + SQL Connect).
// Se ejecuta con `npm run test:e2e:emulators`, que arranca los emuladores.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { APPS } from '../../playwright.config.ts';
import {
  admin,
  createUser,
  TEST_PASSWORD,
  type TestUser,
} from '../../dataconnect/tests/support/emulator.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
} from '../../dataconnect/tests/support/provisioning.ts';

// Al cargar o recargar, la app comprueba la sesión con Auth y SQL Connect; con la máquina cargada
// (por ejemplo, al final de la tanda completa) Safari puede tardar más que la espera general de 5 s.
const SESSION_WAIT = 20_000;

interface Scenario {
  readonly waiter: TestUser;
  readonly tenantA: string;
  readonly nameA: string;
  readonly nameB: string;
}

async function prepare(project: string): Promise<Scenario> {
  await seedAuthorizationCatalog();
  const tag = `${project}-${Date.now().toString(36)}`;
  const owner = await createUser(`e2e-owner-${tag}`);
  const waiter = await createUser(`e2e-waiter-${tag}`);
  await createProfile(owner);
  await createProfile(waiter);
  const nameA = `La Fonda ${tag}`;
  const nameB = `El Puerto ${tag}`;
  const a = await provisionTenant(nameA, owner, ['Centro']);
  const b = await provisionTenant(nameB, owner, ['Malecón', 'Aeropuerto']);
  await insertMembership(a.id, waiter, 'waiter', [a.branches['Centro'] ?? '']);
  await insertMembership(b.id, waiter, 'cashier', [
    b.branches['Malecón'] ?? '',
    b.branches['Aeropuerto'] ?? '',
  ]);
  return { waiter, tenantA: a.id, nameA, nameB };
}

async function signIn(page: Page, email: string, password: string) {
  await page.getByLabel('Correo').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

test('acceso, selección de contexto, cambio de empresa, revocación y cierre de sesión', async ({
  page,
}, testInfo) => {
  const { waiter, tenantA, nameA, nameB } = await prepare(testInfo.project.name);

  // Sin sesión, la app lleva al acceso, que es accesible.
  await page.goto(`${APPS.operations}/`);
  await expect(page.getByRole('heading', { name: 'Acceso del personal' })).toBeVisible({
    timeout: SESSION_WAIT,
  });
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze())
      .violations,
  ).toEqual([]);

  // Contraseña incorrecta: mensaje genérico.
  await signIn(page, waiter.email, 'incorrecta');
  await expect(page.getByRole('alert')).toHaveText('El correo o la contraseña no son correctos.');

  // Acceso correcto: dos empresas, se pide elegir.
  await signIn(page, waiter.email, TEST_PASSWORD);
  await page.getByRole('button', { name: `${nameA} · Mesero` }).click();
  await expect(page.getByRole('heading', { name: `${nameA} · Centro` })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();

  // Cambio de empresa: el contenido anterior desaparece y se elige sucursal en la nueva.
  await page.getByRole('button', { name: 'Cambiar empresa o sucursal' }).click();
  await expect(page.getByRole('heading', { name: `${nameA} · Centro` })).toHaveCount(0);
  await page.getByRole('button', { name: `${nameB} · Cajero` }).click();
  await page.getByRole('button', { name: 'Aeropuerto' }).click();
  await expect(page.getByRole('heading', { name: `${nameB} · Aeropuerto` })).toBeVisible();

  // Revocación en el servidor: al volver a cargar las empresas, la revocada ya no aparece.
  const revoked = await admin(
    `mutation ($tenantId: UUID!, $userId: String!) {
      membership_update(key: { tenantId: $tenantId, userId: $userId }, data: { status: REVOKED })
    }`,
    { tenantId: tenantA, userId: waiter.uid },
  );
  expect(revoked.errors).toEqual([]);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Aeropuerto' })).toBeVisible({
    timeout: SESSION_WAIT,
  });
  await expect(page.getByText(nameA)).toHaveCount(0);

  // Cierre de sesión: vuelve al acceso y, al recargar, sigue sin sesión ni datos.
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Acceso del personal' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Acceso del personal' })).toBeVisible({
    timeout: SESSION_WAIT,
  });
  await expect(page.getByText(nameB)).toHaveCount(0);
});
