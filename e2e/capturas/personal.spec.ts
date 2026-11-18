// Capturas de las pantallas del personal con datos fijos (Fase 3B): cocina, salón y «Listos para
// recoger». No comprueba nada nuevo; sirve para comparar el antes y el después de cada bloque.
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { callFunction } from '../../backend/tests/support/functions.ts';
import { createUser, expectOk, mutate } from '../../dataconnect/tests/support/emulator.ts';
import { buildFixture } from '../../dataconnect/tests/support/catalog-fixture.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
} from '../../dataconnect/tests/support/provisioning.ts';
import { extendFloor } from '../support/demo-floor.ts';
import { expectNotice } from '../support/notices.ts';
import { customerOrders, openStaffPage } from '../support/orders.ts';

test.describe.configure({ timeout: 300_000 });

async function capture(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-${name}.png`),
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
  });
}

test('personal: cocina, salón y «Listos para recoger»', async ({ browser }, testInfo) => {
  await seedAuthorizationCatalog();
  const tag = `${testInfo.project.name}-${Date.now().toString(36)}`;
  const owner = await createUser(`capturas3-owner-${tag}`);
  const waiter = await createUser(`capturas3-mesero-${tag}`);
  const cook = await createUser(`capturas3-cocina-${tag}`);
  for (const user of [owner, waiter, cook]) await createProfile(user);
  const tenantName = `La Fonda ${tag}`;
  const tenant = await provisionTenant(tenantName, owner, ['Centro']);
  const branchId = tenant.branches['Centro'] ?? '';
  const scope = { tenantId: tenant.id, branchId };
  await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
  await insertMembership(tenant.id, cook, 'kitchen', [branchId]);
  const fixture = await buildFixture(owner, tenant.id, branchId);
  const tables = await extendFloor(owner, fixture, scope);
  for (const tableId of [fixture.tableId, tables.M2.id, tables.T1.id]) {
    expectOk(await mutate(waiter, 'OpenTableSession', { ...scope, tableId }), 'Abrir la mesa');
  }

  // M1: dos pedidos y una llamada al mesero. M2: dos platos que cocina deja listos.
  const m1 = await customerOrders(fixture, owner, `capturas3-cliente1-${tag}`, 2);
  await customerOrders(fixture, owner, `capturas3-cliente2-${tag}`, 1);
  const m2 = { ...fixture, qrPublicId: tables.M2.qrPublicId };
  await customerOrders(m2, owner, `capturas3-cliente3-${tag}`, 1);
  await customerOrders(m2, owner, `capturas3-cliente4-${tag}`, 1);
  const called = await callFunction(m1.user, 'requestService', {
    sessionId: m1.sessionId,
    kind: 'call_waiter',
  });
  if (!called.ok) throw new Error(`Llamar: ${called.message}`);

  const kitchen = await openStaffPage(browser, testInfo, cook.email, tenantName);
  const floor = await openStaffPage(browser, testInfo, waiter.email, tenantName);
  try {
    const k = kitchen.page;
    await k.getByRole('link', { name: 'Cocina', exact: true }).click();
    for (let round = 0; round < 2; round += 1) {
      const line = k
        .getByRole('listitem')
        .filter({ hasText: 'Mesa M2 · 1 × Bandeja paisa' })
        .filter({ has: k.getByRole('button', { name: /^Empezar/ }) })
        .first();
      await line.getByRole('button', { name: /^Empezar/ }).click();
      const started = k
        .getByRole('listitem')
        .filter({ hasText: 'Mesa M2 · 1 × Bandeja paisa' })
        .filter({ has: k.getByRole('button', { name: /^Listo/ }) })
        .first();
      await started.getByRole('button', { name: /^Listo/ }).click();
      await expect(
        k.getByRole('listitem').filter({ hasText: 'Mesa M2 · 1 × Bandeja paisa' }),
      ).toHaveCount(1 - round, { timeout: 15_000 });
    }
    const small = k.getByRole('listitem').filter({ hasText: 'Mesa M1 · 1 × Bandeja paisa' });
    await small.getByRole('button', { name: /^Empezar/ }).click();
    await expect(small.getByText('En preparación')).toBeVisible();
    await capture(k, testInfo, '01-cocina');

    const f = floor.page;
    await f.getByRole('link', { name: 'Listos para recoger' }).click();
    const ready = f.getByRole('listitem').filter({ hasText: 'Mesa M2 · 1 × Bandeja paisa' });
    await expect(ready).toHaveCount(2, { timeout: 15_000 });
    await ready
      .first()
      .getByRole('button', { name: /^Recogido/ })
      .click();
    await expectNotice(f, 'Recogido: 1 × Bandeja paisa, mesa M2.');
    await capture(f, testInfo, '02-listos-para-recoger');

    await f.goBack();
    await f.getByRole('link', { name: 'Salón', exact: true }).click();
    const m1Tile = f
      .getByRole('list', { name: 'Mesas de Salón' })
      .getByRole('listitem')
      .filter({ hasText: 'Mesa M1' });
    await expect(m1Tile.getByText(/^Llamó al mesero a las/)).toBeVisible({ timeout: 15_000 });
    await capture(f, testInfo, '03-salon');
    await m1Tile.getByRole('button', { name: 'Ver pedidos' }).click();
    const orders = f.getByRole('region', { name: 'Pedidos de la mesa M1' });
    await expect(orders.getByText('2 × Bandeja paisa')).toBeVisible({ timeout: 15_000 });
    await capture(f, testInfo, '04-salon-pedidos-de-la-mesa');
  } finally {
    await kitchen.context.close();
    await floor.context.close();
  }
});
