// Accesibilidad de las pantallas de la Fase 3 (bloque 7): texto ampliado, 320 px y teclado, con
// datos reales en los emuladores. axe ya corre en cada recorrido (cocina, meseros y cliente).
// Se ejecuta con `npm run test:e2e:emulators`.
import { expect, test, type BrowserContext, type TestInfo } from '@playwright/test';
import { expectReflow, tabTo } from '../support/a11y.ts';
import { expectNotice } from '../support/notices.ts';
import { customerOrders, FUNCTION_WAIT, openStaffPage, orderFromMenu } from '../support/orders.ts';

// Varios navegadores a la vez contra los emuladores: más tiempo que el general (90 s).
test.describe.configure({ timeout: 180_000 });
import { createUser, expectOk, mutate } from '../../dataconnect/tests/support/emulator.ts';
import { buildFixture } from '../../dataconnect/tests/support/catalog-fixture.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
} from '../../dataconnect/tests/support/provisioning.ts';

async function prepare(testInfo: TestInfo) {
  await seedAuthorizationCatalog();
  const tag = `${testInfo.project.name}-${Date.now().toString(36)}`;
  const owner = await createUser(`e2e-a11y3-owner-${tag}`);
  const cook = await createUser(`e2e-a11y3-cocina-${tag}`);
  const waiter = await createUser(`e2e-a11y3-mesero-${tag}`);
  for (const user of [owner, cook, waiter]) await createProfile(user);
  const tenantName = `Accesible3 ${tag}`;
  const tenant = await provisionTenant(tenantName, owner, ['Centro']);
  const branchId = tenant.branches['Centro'] ?? '';
  await insertMembership(tenant.id, cook, 'kitchen', [branchId]);
  await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
  const fixture = await buildFixture(owner, tenant.id, branchId);
  expectOk(
    await mutate(waiter, 'OpenTableSession', {
      tenantId: tenant.id,
      branchId,
      tableId: fixture.tableId,
    }),
    'Abrir la mesa',
  );
  return { owner, cook, waiter, tenantName, fixture };
}

test('las pantallas de la Fase 3 se leen a 320 px y con el texto al 200 %', async ({
  page,
  browser,
}, testInfo) => {
  const { owner, cook, waiter, tenantName, fixture } = await prepare(testInfo);
  const opened: BrowserContext[] = [];
  try {
    // Cliente: pedido enviado, «Mis pedidos» con una solicitud hecha.
    await orderFromMenu(page, fixture);
    await expectReflow(
      page,
      'Pedido enviado a cocina',
      page.getByRole('heading', { name: 'Pedido enviado a cocina' }),
    );
    await page.getByRole('link', { name: 'Ver mis pedidos' }).click();
    await page.getByRole('button', { name: 'Llamar al mesero' }).click();
    await expectNotice(page, 'Avisamos al mesero. Viene a tu mesa.', FUNCTION_WAIT);
    await expectReflow(page, 'Mis pedidos', page.getByText('1 × Bandeja paisa'));

    // Cocina: la línea con sus alérgenos; luego la deja lista.
    const kitchen = await openStaffPage(browser, testInfo, cook.email, tenantName);
    opened.push(kitchen.context);
    await kitchen.page.getByRole('link', { name: 'Cocina', exact: true }).click();
    const line = kitchen.page
      .getByRole('listitem')
      .filter({ hasText: 'Mesa M1 · 1 × Bandeja paisa' });
    await expectReflow(kitchen.page, 'Cocina', line.getByText('Alérgenos declarados:'));
    await line.getByRole('button', { name: /^Empezar/ }).click();
    await line.getByRole('button', { name: /^Listo/ }).click();
    await expect(line).toHaveCount(0);

    // Mesero: salón con solicitudes y pedidos abiertos, y «Listos para recoger».
    const floor = await openStaffPage(browser, testInfo, waiter.email, tenantName);
    opened.push(floor.context);
    await floor.page.getByRole('link', { name: 'Salón', exact: true }).click();
    const table = floor.page
      .getByRole('list', { name: 'Mesas de Salón' })
      .getByRole('listitem')
      .filter({ hasText: 'Mesa M1' });
    await table.getByRole('button', { name: 'Ver pedidos' }).click();
    await expectReflow(
      floor.page,
      'Salón con solicitudes y pedidos',
      floor.page.getByRole('region', { name: 'Pedidos de la mesa M1' }),
    );
    await floor.page.goBack();
    await floor.page.getByRole('link', { name: 'Listos para recoger' }).click();
    await expectReflow(
      floor.page,
      'Listos para recoger',
      floor.page.getByRole('button', { name: 'Recogido 1 × Bandeja paisa, mesa M1' }),
    );

    // Administración: estaciones de cocina.
    const admin = await openStaffPage(browser, testInfo, owner.email, tenantName);
    opened.push(admin.context);
    await admin.page.getByRole('link', { name: 'Estaciones de cocina' }).click();
    await expectReflow(
      admin.page,
      'Estaciones de cocina',
      admin.page.getByRole('heading', { level: 1, name: 'Estaciones de cocina' }),
    );
  } finally {
    for (const context of opened) await context.close();
  }
});

test('cocina, mesero y cliente usan las acciones nuevas solo con el teclado', async ({
  page,
  browser,
  browserName,
}, testInfo) => {
  test.skip(browserName === 'webkit', 'Safari no enfoca botones con Tab salvo que se active.');
  const { owner, cook, waiter, tenantName, fixture } = await prepare(testInfo);
  const opened: BrowserContext[] = [];
  try {
    // Cliente: de «Pedido enviado a cocina» a «Mis pedidos» y llamar al mesero, con el teclado.
    await orderFromMenu(page, fixture);
    await tabTo(page, page.getByRole('link', { name: 'Ver mis pedidos' }));
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: 'Mis pedidos' })).toBeVisible();
    await tabTo(page, page.getByRole('button', { name: 'Llamar al mesero' }));
    await page.keyboard.press('Enter');
    await expectNotice(page, 'Avisamos al mesero. Viene a tu mesa.', FUNCTION_WAIT);

    // Cocina: empezar, listo y cancelar con motivo, sin ratón.
    await customerOrders(fixture, owner, `e2e-a11y3-cliente2-${testInfo.project.name}`, 3);
    const kitchen = await openStaffPage(browser, testInfo, cook.email, tenantName);
    opened.push(kitchen.context);
    const k = kitchen.page;
    await k.getByRole('link', { name: 'Cocina', exact: true }).click();
    const first = k.getByRole('listitem').filter({ hasText: 'Mesa M1 · 1 × Bandeja paisa' });
    await tabTo(k, first.getByRole('button', { name: /^Empezar/ }));
    await k.keyboard.press('Enter');
    await expect(first.getByText('En preparación')).toBeVisible();
    await tabTo(k, first.getByRole('button', { name: /^Listo/ }));
    await k.keyboard.press('Enter');
    await expect(first).toHaveCount(0);

    const second = k.getByRole('listitem').filter({ hasText: 'Mesa M1 · 3 × Bandeja paisa' });
    const cancel = second.getByRole('button', { name: /^Cancelar/ });
    await tabTo(k, cancel);
    await k.keyboard.press('Enter');
    const dialog = k.getByRole('dialog', { name: '¿Cancelar 3 × Bandeja paisa?' });
    await expect(dialog).toBeVisible();
    // Escape cierra sin cancelar y el foco vuelve al botón que lo abrió.
    await k.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(cancel).toBeFocused();
    await k.keyboard.press('Enter');
    // En una acción destructiva el foco empieza en «Volver»; el motivo está justo antes.
    await expect(dialog.getByRole('button', { name: 'Volver' })).toBeFocused();
    await k.keyboard.press('Shift+Tab');
    await expect(dialog.getByLabel('Motivo de la cancelación')).toBeFocused();
    await k.keyboard.type('Se acabó el chicharrón');
    await tabTo(k, dialog.getByRole('button', { name: 'Cancelar línea' }));
    await k.keyboard.press('Enter');
    await expect(second).toHaveCount(0);

    // Mesero: recoger y entregar con el teclado.
    const floor = await openStaffPage(browser, testInfo, waiter.email, tenantName);
    opened.push(floor.context);
    const f = floor.page;
    await f.getByRole('link', { name: 'Listos para recoger' }).click();
    await tabTo(f, f.getByRole('button', { name: 'Recogido 1 × Bandeja paisa, mesa M1' }));
    await f.keyboard.press('Enter');
    await expectNotice(f, 'Recogido: 1 × Bandeja paisa, mesa M1.');
    await tabTo(f, f.getByRole('button', { name: 'Entregado 1 × Bandeja paisa, mesa M1' }));
    await f.keyboard.press('Enter');
    await expect(f.getByText('No hay platos listos', { exact: true })).toBeVisible();
  } finally {
    for (const context of opened) await context.close();
  }
});
