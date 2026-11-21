import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { buildFixture } from '../../dataconnect/tests/support/catalog-fixture.ts';
import { createUser, expectOk, mutate } from '../../dataconnect/tests/support/emulator.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
} from '../../dataconnect/tests/support/provisioning.ts';
import { customerOrders, FUNCTION_WAIT, named, signInStaff } from '../support/orders.ts';

test('el cajero confirma un solo cobro con cambio y abre su comprobante', async ({
  page,
}, testInfo) => {
  test.slow();
  await seedAuthorizationCatalog();
  const tag = `${testInfo.project.name}-${Date.now().toString(36)}`;
  const owner = await createUser(`caja-owner-${tag}`);
  const cashier = await createUser(`caja-cajero-${tag}`);
  for (const user of [owner, cashier]) await createProfile(user);
  const name = `Caja ${tag}`;
  const tenant = await provisionTenant(name, owner, ['Centro']);
  const branchId = tenant.branches['Centro'] ?? '';
  const scope = { tenantId: tenant.id, branchId };
  await insertMembership(tenant.id, cashier, 'cashier', [branchId]);
  const fixture = await buildFixture(owner, tenant.id, branchId);
  expectOk(await mutate(owner, 'CreateRegister', { ...scope, name: 'Principal' }), 'Crear caja');
  expectOk(
    await mutate(owner, 'OpenTableSession', { ...scope, tableId: fixture.tableId }),
    'Abrir mesa',
  );
  await customerOrders(fixture, owner, `cliente-caja-${tag}`, 1);

  await signInStaff(page, cashier.email);
  await page.getByRole('link', { name: 'Caja', exact: true }).click();
  await page.getByRole('button', { name: 'Ver la cuenta de la mesa M1' }).click();
  const review = page.getByRole('button', { name: 'Revisar cobro' });
  await expect(review).toBeDisabled({ timeout: FUNCTION_WAIT });
  await page.getByLabel('Fondo inicial (pesos)').fill('10000');
  await page.getByRole('button', { name: 'Abrir caja' }).click();
  await expect(review).toBeEnabled({ timeout: FUNCTION_WAIT });
  await page.getByLabel('Efectivo recibido (pesos)').fill('50000');
  await review.click();
  const dialog = page.getByRole('dialog', { name: '¿Registrar este cobro?' });
  await expect(dialog).toContainText(/Efectivo · Total\s*\$\s*32\.000/);
  await dialog.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.getByLabel('Consumo a cobrar (pesos)')).toHaveValue('32000');
  await review.click();
  await dialog.getByRole('button', { name: 'Registrar cobro' }).click();
  await expect(page.getByText('Cuenta saldada')).toBeVisible({ timeout: FUNCTION_WAIT });
  await expect(page.getByText(named('$ 42.000'))).toBeVisible({ timeout: FUNCTION_WAIT });
  const payments = page.getByRole('region', { name: 'Pagos de la mesa' });
  await expect(payments.getByRole('listitem')).toHaveCount(1);
  await payments.getByRole('link', { name: 'Ver el comprobante' }).click();
  const receipt = page.getByRole('article', { name: 'Comprobante' });
  await expect(receipt).toBeVisible({ timeout: FUNCTION_WAIT });
  await expect(receipt).toContainText('1 × Bandeja paisa');
  await expect(receipt).toContainText(/Cambio\s*\$\s*18\.000/);
  await expect(receipt).toContainText('Comprobante de pago. No es factura electrónica.');
  await expect(page.getByRole('button', { name: 'Imprimir' })).toBeVisible();
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(audit.violations).toEqual([]);
});
