// Accesibilidad de las pantallas de la Fase 2 (bloque 7): teclado y texto ampliado, con datos
// reales en los emuladores. axe ya corre en cada recorrido (mesas, carta, sucursales, salón, cliente).
// Se ejecuta con `npm run test:e2e:emulators`.
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { APPS } from '../../playwright.config.ts';
import { expectReflow, tabTo } from '../support/a11y.ts';
import { expectNotice } from '../support/notices.ts';
import { FUNCTION_WAIT } from '../support/orders.ts';
import {
  createUser,
  expectOk,
  mutate,
  TEST_PASSWORD,
} from '../../dataconnect/tests/support/emulator.ts';
import { buildFixture, type Fixture } from '../../dataconnect/tests/support/catalog-fixture.ts';
import {
  createProfile,
  provisionTenant,
  seedAuthorizationCatalog,
} from '../../dataconnect/tests/support/provisioning.ts';

/** Nombre accesible con importes: Intl separa «$» del número con un espacio duro. */
const named = (text: string) =>
  new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s')}$`);

async function prepare(testInfo: TestInfo) {
  await seedAuthorizationCatalog();
  const tag = `${testInfo.project.name}-${Date.now().toString(36)}`;
  const owner = await createUser(`e2e-a11y-owner-${tag}`);
  await createProfile(owner);
  const tenantName = `Accesible ${tag}`;
  const tenant = await provisionTenant(tenantName, owner, ['Centro']);
  const branchId = tenant.branches['Centro'] ?? '';
  const fixture = await buildFixture(owner, tenant.id, branchId);
  expectOk(
    await mutate(owner, 'OpenTableSession', {
      tenantId: tenant.id,
      branchId,
      tableId: fixture.tableId,
    }),
    'OpenTableSession',
  );
  return { owner, tenantName, fixture };
}

async function openMenu(page: Page, fixture: Fixture) {
  await page.goto(`${APPS.menuWeb}/mesa/${fixture.qrPublicId}`);
  // Primera carga del navegador: incluye registrar el service worker y leer la carta.
  await expect(page.getByRole('heading', { level: 1, name: 'Centro' })).toBeVisible({
    timeout: 15_000,
  });
}

test('el cliente pide y paga en simulado usando solo el teclado', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(browserName === 'webkit', 'Safari no enfoca botones con Tab salvo que se active.');
  const { fixture } = await prepare(testInfo);
  await openMenu(page, fixture);

  await tabTo(page, page.getByRole('button', { name: 'Agregar Bandeja paisa' }));
  await page.keyboard.press('Enter');
  const form = page.getByRole('form', { name: 'Elegir Bandeja paisa' });
  const option = form.getByLabel('Bien asada');
  await tabTo(page, option);
  await page.keyboard.press('Space');
  await expect(option).toBeChecked();
  await tabTo(page, form.getByRole('button', { name: named('Agregar al pedido · $ 32.000') }));
  await page.keyboard.press('Enter');
  await expectNotice(page, 'Agregaste 1 × Bandeja paisa a tu pedido.');

  await tabTo(
    page,
    page.getByRole('link', { name: named('Ver mi pedido · 1 producto · $ 32.000') }),
  );
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'Tu pedido' })).toBeVisible();
  await tabTo(page, page.getByRole('button', { name: 'Revisar pedido' }));
  await page.keyboard.press('Enter');
  const pay = page.getByRole('button', { name: named('Autorizar y enviar a cocina · $ 32.000') });
  // La primera llamada al backend puede tardar (arranque en frío de las funciones).
  await expect(pay).toBeVisible({ timeout: 30_000 });
  await tabTo(page, pay);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Pedido enviado a cocina' })).toBeVisible();
});

test('las pantallas de la Fase 2 se leen a 320 px y con el texto al 200 %', async ({
  page,
}, testInfo) => {
  const { owner, tenantName, fixture } = await prepare(testInfo);

  // Cliente: carta con las opciones abiertas, pedido y resumen del servidor.
  await openMenu(page, fixture);
  await page.getByRole('button', { name: 'Agregar Bandeja paisa' }).click();
  const form = page.getByRole('form', { name: 'Elegir Bandeja paisa' });
  await expectReflow(page, 'Carta con opciones', form);
  await form.getByLabel('Bien asada').check();
  await form.getByRole('button', { name: named('Agregar al pedido · $ 32.000') }).click();
  await page.getByRole('link', { name: named('Ver mi pedido · 1 producto · $ 32.000') }).click();
  await expectReflow(page, 'Pedido', page.getByRole('list', { name: 'Productos de tu pedido' }));
  await page.getByRole('button', { name: 'Revisar pedido' }).click();
  // El resumen lo calcula el backend; con el emulador frío, la primera llamada puede tardar.
  const summary = page.getByRole('heading', { name: 'Resumen confirmado por el restaurante' });
  await expect(summary).toBeVisible({ timeout: FUNCTION_WAIT });
  await expectReflow(page, 'Resumen del pedido', summary);

  // Personal: el propietario ve todas las pantallas nuevas.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${APPS.operations}/`);
  await page.getByLabel('Correo').fill(owner.email);
  await page.getByLabel('Contraseña').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: `${tenantName} · Centro` })).toBeVisible();

  await page.getByRole('link', { name: 'Salón', exact: true }).click();
  const table = page.getByRole('list', { name: 'Mesas de Salón' }).getByRole('listitem');
  await table.getByRole('button', { name: 'Ver personas en la mesa' }).click();
  await expectReflow(page, 'Salón', page.getByRole('list', { name: 'Personas en la mesa M1' }));

  for (const [path, heading] of [
    ['/mesas', 'Mesas y códigos QR'],
    ['/carta', 'Carta de la empresa'],
    ['/carta/sucursal', 'Carta de la sucursal'],
    ['/sucursales', 'Sucursales'],
  ] as const) {
    await page.goto(`${APPS.operations}${path}`);
    await expectReflow(page, heading, page.getByRole('heading', { level: 1, name: heading }));
  }

  // El QR de la mesa abierto, con su dirección completa.
  await page.goto(`${APPS.operations}/mesas`);
  await page.getByRole('button', { name: 'Ver QR' }).click();
  await expectReflow(
    page,
    'QR de la mesa',
    page.getByRole('img', { name: 'Código QR de la mesa M1' }),
  );
});
