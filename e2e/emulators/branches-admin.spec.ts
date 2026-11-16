// Sucursales del propietario en navegador contra los emuladores (Fase 2, bloque 4c).
// Se ejecuta con `npm run test:e2e:emulators`, que arranca los emuladores.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { APPS } from '../../playwright.config.ts';
import { expectNotice } from '../support/notices.ts';
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

test('el propietario crea, archiva y restaura una sucursal; el resto no ve el módulo', async ({
  page,
}, testInfo) => {
  await seedAuthorizationCatalog();
  const tag = `${testInfo.project.name}-${Date.now().toString(36)}`;
  const owner = await createUser(`e2e-suc-owner-${tag}`);
  const branchAdmin = await createUser(`e2e-suc-admin-${tag}`);
  for (const user of [owner, branchAdmin]) await createProfile(user);
  const tenantName = `Sucursales ${tag}`;
  const tenant = await provisionTenant(tenantName, owner, ['Centro']);
  await insertMembership(tenant.id, branchAdmin, 'branch_admin', [tenant.branches['Centro'] ?? '']);

  await signIn(page, owner.email);
  await expect(page.getByRole('heading', { name: `${tenantName} · Centro` })).toBeVisible();
  await page.getByRole('link', { name: 'Sucursales' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Sucursales' })).toBeVisible();

  const form = page.getByRole('region', { name: 'Nueva sucursal' });
  await form.getByLabel('Nombre de la sucursal').fill('Chapinero');
  await expect(form.getByLabel('Zona horaria')).toHaveValue('America/Bogota');
  await form.getByRole('button', { name: 'Crear sucursal' }).click();
  await expectNotice(
    page,
    'Sucursal «Chapinero» creada. Para trabajar en ella, elige «Cambiar empresa o sucursal» en la parte superior.',
  );

  const list = page.getByRole('list', { name: 'Sucursales de la empresa' });
  const centro = list.getByRole('listitem').filter({ hasText: 'Centro' });
  await expect(centro.getByText('Sucursal actual')).toBeVisible();
  await expect(centro.getByRole('button', { name: 'Archivar sucursal' })).toHaveCount(0);

  const chapinero = list.getByRole('listitem').filter({ hasText: 'Chapinero' });
  await chapinero.getByRole('button', { name: 'Archivar sucursal' }).click();
  const dialog = page.getByRole('dialog', { name: '¿Archivar la sucursal Chapinero?' });
  await dialog.getByRole('button', { name: 'Archivar sucursal' }).click();
  await expectNotice(page, 'Sucursal «Chapinero» archivada.');
  await expect(chapinero.getByText('Archivada', { exact: true })).toBeVisible();
  await chapinero.getByRole('button', { name: 'Restaurar sucursal' }).click();
  await expectNotice(page, 'Sucursal «Chapinero» restaurada.');
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);

  // La sucursal nueva aparece al cambiar de contexto.
  await page.getByRole('button', { name: 'Cambiar empresa o sucursal' }).click();
  await expect(page.getByRole('button', { name: 'Chapinero' })).toBeVisible();

  // El administrador de sucursal no ve el módulo y la ruta directa no muestra datos.
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await signIn(page, branchAdmin.email);
  await expect(page.getByRole('heading', { name: `${tenantName} · Centro` })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sucursales' })).toHaveCount(0);
  await page.goto(`${APPS.operations}/sucursales`);
  await expect(
    page.getByRole('heading', { name: 'Esta sección no está disponible para tu rol' }),
  ).toBeVisible();
});
