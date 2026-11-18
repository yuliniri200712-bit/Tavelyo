// Capturas de la entrada, el inicio y la administración con datos fijos (Fase 3B). No comprueba nada
// nuevo; sirve para comparar el antes y el después de cada bloque.
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { createUser } from '../../dataconnect/tests/support/emulator.ts';
import { buildFixture } from '../../dataconnect/tests/support/catalog-fixture.ts';
import {
  createProfile,
  provisionTenant,
  seedAuthorizationCatalog,
} from '../../dataconnect/tests/support/provisioning.ts';
import { APPS } from '../../playwright.config.ts';
import { extendFloor } from '../support/demo-floor.ts';
import { extendMenu } from '../support/demo-menu.ts';
import { openStaffPage } from '../support/orders.ts';

test.describe.configure({ timeout: 240_000 });

async function capture(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-${name}.png`),
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
  });
}

test('administración: entrada, inicio, carta, estaciones, mesas y sucursales', async ({
  page,
  browser,
}, testInfo) => {
  await seedAuthorizationCatalog();
  const tag = `${testInfo.project.name}-${Date.now().toString(36)}`;
  const owner = await createUser(`capturas4-owner-${tag}`);
  await createProfile(owner);
  const tenantName = `La Fonda ${tag}`;
  const tenant = await provisionTenant(tenantName, owner, ['Centro']);
  const branchId = tenant.branches['Centro'] ?? '';
  const scope = { tenantId: tenant.id, branchId };
  const fixture = await buildFixture(owner, tenant.id, branchId);
  await extendMenu(owner, fixture, scope);
  await extendFloor(owner, fixture, scope);

  await page.goto(`${APPS.operations}/`);
  await expect(page.getByRole('heading', { name: 'Acceso del personal' })).toBeVisible({
    timeout: 20_000,
  });
  await capture(page, testInfo, '01-entrada');

  const admin = await openStaffPage(browser, testInfo, owner.email, tenantName);
  try {
    const p = admin.page;
    await capture(p, testInfo, '02-inicio');
    for (const [index, title, ready] of [
      ['03', 'Carta de la empresa', 'Bandeja paisa'],
      ['04', 'Carta de la sucursal', 'Bandeja paisa'],
      ['05', 'Estaciones de cocina', 'Cocina'],
      ['06', 'Mesas y códigos QR', 'M1'],
      ['07', 'Sucursales', 'Centro'],
    ] as const) {
      await p.getByRole('link', { name: title, exact: true }).click();
      await expect(p.getByRole('heading', { level: 1, name: title })).toBeVisible();
      await expect(p.getByRole('main').getByText(ready).first()).toBeVisible({ timeout: 15_000 });
      await capture(p, testInfo, `${index}-${title.toLowerCase().replaceAll(' ', '-')}`);
      await p.goBack();
      await expect(p.getByRole('heading', { name: `${tenantName} · Centro` })).toBeVisible();
    }
  } finally {
    await admin.context.close();
  }
});
