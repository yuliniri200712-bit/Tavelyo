// Capturas del recorrido del cliente con datos fijos (Fase 3B, IV §13.5). No comprueba nada nuevo:
// sirve para comparar el antes y el después de cada bloque. Ver playwright.capturas.config.ts.
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { createUser, expectOk, mutate } from '../../dataconnect/tests/support/emulator.ts';
import { buildFixture } from '../../dataconnect/tests/support/catalog-fixture.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
} from '../../dataconnect/tests/support/provisioning.ts';
import { APPS } from '../../playwright.config.ts';
import { extendMenu } from '../support/demo-menu.ts';
import { expectNotice } from '../support/notices.ts';
import { FUNCTION_WAIT, named, openStaffPage } from '../support/orders.ts';

test.describe.configure({ timeout: 240_000 });

async function capture(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  // Sin animaciones ni cursor parpadeando, para que dos capturas del mismo estado coincidan.
  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-${name}.png`),
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
  });
}

test('cliente: carta, pedido, pago y «Mis pedidos»', async ({ page, browser }, testInfo) => {
  await seedAuthorizationCatalog();
  const tag = `${testInfo.project.name}-${Date.now().toString(36)}`;
  const owner = await createUser(`capturas-owner-${tag}`);
  const waiter = await createUser(`capturas-mesero-${tag}`);
  const cook = await createUser(`capturas-cocina-${tag}`);
  for (const user of [owner, waiter, cook]) await createProfile(user);
  const tenantName = `La Fonda ${tag}`;
  const tenant = await provisionTenant(tenantName, owner, ['Centro']);
  const branchId = tenant.branches['Centro'] ?? '';
  await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
  await insertMembership(tenant.id, cook, 'kitchen', [branchId]);
  const fixture = await buildFixture(owner, tenant.id, branchId);
  await extendMenu(owner, fixture, { tenantId: tenant.id, branchId });
  expectOk(
    await mutate(waiter, 'OpenTableSession', {
      tenantId: tenant.id,
      branchId,
      tableId: fixture.tableId,
    }),
    'Abrir la mesa',
  );

  await page.goto(`${APPS.menuWeb}/mesa/${fixture.qrPublicId}`);
  await expect(page.getByRole('button', { name: 'Agregar Ajiaco santafereño' })).toBeVisible({
    timeout: 20_000,
  });
  await capture(page, testInfo, '01-carta');

  await page.getByRole('button', { name: 'Agregar Bandeja paisa' }).click();
  const form = page.getByRole('form', { name: 'Elegir Bandeja paisa' });
  await capture(page, testInfo, '02-elegir-opciones');
  await form.getByLabel('Bien asada').check();
  await form.getByRole('button', { name: named('Agregar al pedido · $ 32.000') }).click();
  await expectNotice(page, 'Agregaste 1 × Bandeja paisa a tu pedido.');
  await capture(page, testInfo, '03-carta-con-pedido');

  await page.getByRole('link', { name: named('Ver mi pedido · 1 producto · $ 32.000') }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Tu pedido' })).toBeVisible();
  await capture(page, testInfo, '04-tu-pedido');

  await page.getByRole('button', { name: 'Revisar pedido' }).click();
  await expect(
    page.getByRole('heading', { name: 'Resumen confirmado por el restaurante' }),
  ).toBeVisible({ timeout: FUNCTION_WAIT });
  await capture(page, testInfo, '05-resumen-y-pago');

  await page.getByRole('button', { name: named('Autorizar y enviar a cocina · $ 32.000') }).click();
  await expect(page.getByRole('heading', { name: 'Pedido enviado a cocina' })).toBeVisible({
    timeout: FUNCTION_WAIT,
  });
  await capture(page, testInfo, '06-pedido-enviado');

  await page.getByRole('link', { name: 'Ver mis pedidos' }).click();
  await page.getByRole('button', { name: 'Llamar al mesero' }).click();
  await expectNotice(page, 'Avisamos al mesero. Viene a tu mesa.', FUNCTION_WAIT);

  // Cocina empieza el plato para ver «Mis pedidos» con un estado intermedio.
  const kitchen = await openStaffPage(browser, testInfo, cook.email, tenantName);
  try {
    await kitchen.page.getByRole('link', { name: 'Cocina', exact: true }).click();
    const line = kitchen.page
      .getByRole('listitem')
      .filter({ hasText: 'Mesa M1 · 1 × Bandeja paisa' });
    await line.getByRole('button', { name: /^Empezar/ }).click();
    await expect(line.getByText('En preparación')).toBeVisible();
  } finally {
    await kitchen.context.close();
  }
  const mine = page.getByRole('listitem').filter({ hasText: '1 × Bandeja paisa' });
  await expect(mine.getByText('En preparación')).toBeVisible({ timeout: 20_000 });
  await capture(page, testInfo, '07-mis-pedidos');
});
