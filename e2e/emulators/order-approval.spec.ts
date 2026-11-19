// Aprobación de pedidos por el mesero (D-32, ADR-0012) en navegador contra los emuladores y el
// backend: el propietario activa el modo en «Ajustes de la sucursal»; el cliente envía y ve
// «Esperando al mesero»; el mesero aprueba desde el salón (llega a cocina) o rechaza con motivo; el
// cliente retira un pedido que espera.
// Se ejecuta con `npm run test:e2e:emulators`, que compila el backend y arranca los emuladores.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { APPS } from '../../playwright.config.ts';
import { expectNotice } from '../support/notices.ts';
import { FUNCTION_WAIT, named, openStaffPage, signInStaff } from '../support/orders.ts';
import { createUser, expectOk, mutate } from '../../dataconnect/tests/support/emulator.ts';
import { buildFixture } from '../../dataconnect/tests/support/catalog-fixture.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
} from '../../dataconnect/tests/support/provisioning.ts';

// Varios envíos que pasan por el backend: más tiempo que el general.
test.describe.configure({ timeout: 240_000 });

async function expectNoAxeViolations(page: Page) {
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(axe.violations).toEqual([]);
}

/** El cliente agrega una bandeja desde la carta y envía el pedido. */
async function sendBandeja(page: Page, qrPublicId: string) {
  await page.goto(`${APPS.menuWeb}/mesa/${qrPublicId}`);
  await page.getByRole('button', { name: 'Agregar Bandeja paisa' }).click({ timeout: 15_000 });
  const form = page.getByRole('form', { name: 'Elegir Bandeja paisa' });
  await form.getByLabel('Bien asada').check();
  await form.getByRole('button', { name: named('Agregar al pedido · $ 32.000') }).click();
  await page.getByRole('link', { name: named('Ver mi pedido · 1 producto · $ 32.000') }).click();
  await page.getByRole('button', { name: 'Revisar pedido' }).click();
  await page
    .getByRole('button', { name: named('Enviar pedido · $ 32.000') })
    .click({ timeout: FUNCTION_WAIT });
  await expect(page.getByRole('heading', { name: 'Pedido enviado al mesero' })).toBeVisible({
    timeout: FUNCTION_WAIT,
  });
}

test('el mesero aprueba o rechaza los pedidos del cliente, y el cliente puede retirarlos', async ({
  page,
  browser,
}, testInfo) => {
  await seedAuthorizationCatalog();
  const tag = `${testInfo.project.name}-${Date.now().toString(36)}`;
  const owner = await createUser(`e2e-aprob-owner-${tag}`);
  const waiter = await createUser(`e2e-aprob-mesero-${tag}`);
  for (const user of [owner, waiter]) await createProfile(user);
  const tenantName = `Aprobación ${tag}`;
  const tenant = await provisionTenant(tenantName, owner, ['Centro']);
  const branchId = tenant.branches['Centro'] ?? '';
  const scope = { tenantId: tenant.id, branchId };
  await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
  const fixture = await buildFixture(owner, tenant.id, branchId);
  expectOk(
    await mutate(waiter, 'OpenTableSession', { ...scope, tableId: fixture.tableId }),
    'Abrir',
  );

  // El propietario activa la aprobación del mesero en «Ajustes de la sucursal».
  const admin = await openStaffPage(browser, testInfo, owner.email, tenantName);
  try {
    await admin.page.getByRole('link', { name: 'Ajustes de la sucursal' }).click();
    await expect(
      admin.page.getByRole('heading', { level: 1, name: 'Ajustes de la sucursal' }),
    ).toBeVisible();
    const direct = admin.page.getByLabel('Directo a cocina');
    await expect(direct).toBeChecked();
    await expectNoAxeViolations(admin.page);
    await admin.page.getByLabel('El mesero aprueba cada pedido').check();
    await admin.page.getByRole('button', { name: 'Guardar' }).click();
    await expectNotice(admin.page, 'Guardado: el mesero aprueba cada pedido.');
  } finally {
    await admin.context.close();
  }

  // El mesero, en el salón, con la bandeja «Pedidos por aprobar» vacía.
  await signInStaff(page, waiter.email);
  await expect(page.getByRole('heading', { name: `${tenantName} · Centro` })).toBeVisible();
  // El mesero no ve los ajustes de la sucursal (branch.settings).
  await expect(page.getByRole('link', { name: 'Ajustes de la sucursal' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Salón', exact: true }).click();
  const approvals = page.getByRole('region', { name: 'Pedidos por aprobar' });
  await expect(approvals.getByText('No hay pedidos por aprobar')).toBeVisible();

  // El cliente envía: queda esperando al mesero, que lo ve sin recargar y lo aprueba.
  const customerContext = await browser.newContext();
  const customer = await customerContext.newPage();
  try {
    await sendBandeja(customer, fixture.qrPublicId);
    await expect(customer.getByText('Esperando al mesero')).toBeVisible();
    await expectNoAxeViolations(customer);

    await expect(approvals.getByText('Mesa M1: pedido por aprobar.')).toBeVisible({
      timeout: 15_000,
    });
    await expect(approvals.getByText('1 × Bandeja paisa')).toBeVisible();
    await expectNoAxeViolations(page);
    await approvals
      .getByRole('button', { name: 'Aprobar y enviar a cocina: pedido de la mesa M1' })
      .click();
    await expectNotice(page, 'Mesa M1: pedido aprobado y enviado a cocina.');
    await expect(approvals.getByText('No hay pedidos por aprobar')).toBeVisible();

    await customer.getByRole('link', { name: 'Ver mis pedidos' }).click();
    const sent = customer.getByRole('listitem').filter({ hasText: '1 × Bandeja paisa' });
    await expect(sent.getByText('Recibido en cocina')).toBeVisible({ timeout: 15_000 });

    // Segundo pedido: el mesero lo rechaza con motivo y el cliente ve el motivo.
    await sendBandeja(customer, fixture.qrPublicId);
    await approvals.getByRole('button', { name: 'Rechazar: pedido de la mesa M1' }).click({
      timeout: 15_000,
    });
    const dialog = page.getByRole('dialog', { name: 'Rechazar el pedido de la mesa M1' });
    await dialog.getByLabel('Motivo').fill('Se agotó la bandeja');
    await dialog.getByRole('button', { name: 'Rechazar pedido' }).click();
    await expectNotice(page, 'Mesa M1: pedido rechazado.');
    await customer.getByRole('link', { name: 'Ver mis pedidos' }).click();
    await expect(
      customer.getByText('El mesero no aprobó este pedido. Motivo: Se agotó la bandeja'),
    ).toBeVisible({ timeout: 15_000 });

    // Tercer pedido: el cliente lo retira mientras espera; desaparece de la bandeja del mesero.
    await sendBandeja(customer, fixture.qrPublicId);
    await expect(approvals.getByText('1 pedido por aprobar')).toBeVisible({ timeout: 15_000 });
    await customer.getByRole('link', { name: 'Ver mis pedidos' }).click();
    await customer.getByRole('button', { name: 'Retirar pedido' }).click();
    await customer
      .getByRole('dialog', { name: '¿Retirar este pedido?' })
      .getByRole('button', { name: 'Retirar pedido' })
      .click();
    await expectNotice(customer, 'Retiraste el pedido.');
    await expect(customer.getByText('Retiraste este pedido: no llegó a cocina.')).toBeVisible();
    await expect(approvals.getByText('No hay pedidos por aprobar')).toBeVisible({
      timeout: 15_000,
    });
  } finally {
    await customerContext.close();
  }
});
