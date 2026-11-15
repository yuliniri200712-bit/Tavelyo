// Gestión de sectores, mesas y QR en navegador contra los emuladores (Fase 2, bloque 4a).
// Se ejecuta con `npm run test:e2e:emulators`, que arranca los emuladores.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { APPS } from '../../playwright.config.ts';
import { createUser, TEST_PASSWORD } from '../../dataconnect/tests/support/emulator.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
} from '../../dataconnect/tests/support/provisioning.ts';

async function signIn(page: Page, email: string) {
  await page.goto(`${APPS.operations}/`);
  await page.getByLabel('Correo').fill(email);
  await page.getByLabel('Contraseña').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

async function expectNoAxeViolations(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
}

test('el administrador crea sectores y mesas, ve e imprime el QR y lo renueva', async ({
  page,
}, testInfo) => {
  await seedAuthorizationCatalog();
  const tag = `${testInfo.project.name}-${Date.now().toString(36)}`;
  const owner = await createUser(`e2e-mesas-owner-${tag}`);
  const branchAdmin = await createUser(`e2e-mesas-admin-${tag}`);
  const waiter = await createUser(`e2e-mesas-waiter-${tag}`);
  for (const user of [owner, branchAdmin, waiter]) await createProfile(user);
  const tenantName = `Mesas ${tag}`;
  const tenant = await provisionTenant(tenantName, owner, ['Centro']);
  const centro = tenant.branches['Centro'] ?? '';
  await insertMembership(tenant.id, branchAdmin, 'branch_admin', [centro]);
  await insertMembership(tenant.id, waiter, 'waiter', [centro]);

  await signIn(page, branchAdmin.email);
  await expect(page.getByRole('heading', { name: `${tenantName} · Centro` })).toBeVisible();
  await page.getByRole('link', { name: 'Mesas y códigos QR' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Mesas y códigos QR' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Todavía no hay sectores' })).toBeVisible();

  // Sector y dos mesas, validadas por el servidor.
  await page.getByLabel('Nombre del sector').fill('Terraza');
  await page.getByRole('button', { name: 'Agregar sector' }).click();
  await expect(page.getByText('Sector «Terraza» agregado.')).toBeVisible();
  const terraza = page.getByRole('region', { name: 'Terraza' });
  for (const code of ['T1', 'T2']) {
    await terraza.getByLabel('Código de la mesa').fill(code);
    await terraza.getByRole('button', { name: 'Agregar mesa' }).click();
    await expect(page.getByText(`Mesa ${code} agregada.`)).toBeVisible();
  }
  // El código no se repite en la sucursal (unicidad en la base).
  await terraza.getByLabel('Código de la mesa').fill('T1');
  await terraza.getByRole('button', { name: 'Agregar mesa' }).click();
  await expect(page.getByText('Ya existe una mesa con ese código en la sucursal.')).toBeVisible();
  await expectNoAxeViolations(page);

  // QR con la dirección de menu-web y renovación con confirmación.
  const t1 = terraza.getByRole('listitem').filter({ hasText: 'Mesa T1' });
  await t1.getByRole('button', { name: 'Ver QR' }).click();
  await expect(t1.getByRole('img', { name: 'Código QR de la mesa T1' })).toBeVisible();
  const before = await t1.locator('.tv-url').textContent();
  expect(before).toMatch(/^http:\/\/localhost:6173\/mesa\/[0-9a-f]{32}$/);
  await t1.getByRole('button', { name: 'Ocultar QR' }).click();
  await t1.getByRole('button', { name: 'Generar QR nuevo' }).click();
  const dialog = page.getByRole('dialog', { name: '¿Generar un QR nuevo para la mesa T1?' });
  await expect(dialog.getByText(/dejará de abrir la carta/)).toBeVisible();
  await dialog.getByRole('button', { name: 'Generar QR nuevo' }).click();
  await expect(page.getByText(/QR de la mesa T1 renovado/)).toBeVisible();
  await t1.getByRole('button', { name: 'Ver QR' }).click();
  await expect(t1.locator('.tv-url')).not.toHaveText(before ?? '');

  // Archivar una mesa la saca de la hoja de impresión.
  const t2 = terraza.getByRole('listitem').filter({ hasText: 'Mesa T2' });
  await t2.getByRole('button', { name: 'Archivar mesa' }).click();
  await expect(page.getByText('Mesa T2 archivada.')).toBeVisible();
  await page.getByRole('link', { name: 'Imprimir códigos QR' }).click();
  const sheet = page.getByRole('list', { name: 'Códigos QR de las mesas' });
  await expect(sheet.getByRole('img')).toHaveCount(1);
  await expect(sheet.getByRole('img', { name: 'Código QR de la mesa T1' })).toBeVisible();
  await expectNoAxeViolations(page);

  // El mesero no ve el módulo y la ruta directa no muestra datos.
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await signIn(page, waiter.email);
  await expect(page.getByRole('heading', { name: `${tenantName} · Centro` })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Mesas y códigos QR' })).toHaveCount(0);
  await page.goto(`${APPS.operations}/mesas`);
  await expect(
    page.getByRole('heading', { name: 'Esta sección no está disponible para tu rol' }),
  ).toBeVisible();
});
