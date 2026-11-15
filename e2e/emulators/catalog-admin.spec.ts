// Carta de la empresa y de la sucursal en navegador contra los emuladores (Fase 2, bloque 4b).
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

test('el propietario arma la carta y la sucursal le pone disponibilidad, horario y precio', async ({
  page,
}, testInfo) => {
  await seedAuthorizationCatalog();
  const tag = `${testInfo.project.name}-${Date.now().toString(36)}`;
  const owner = await createUser(`e2e-carta-owner-${tag}`);
  const branchAdmin = await createUser(`e2e-carta-admin-${tag}`);
  for (const user of [owner, branchAdmin]) await createProfile(user);
  const tenantName = `Carta ${tag}`;
  const tenant = await provisionTenant(tenantName, owner, ['Centro']);
  await insertMembership(tenant.id, branchAdmin, 'branch_admin', [tenant.branches['Centro'] ?? '']);

  // Propietario: impuesto, categoría, producto con alérgenos y un grupo de opciones.
  await signIn(page, owner.email);
  await expect(page.getByRole('heading', { name: `${tenantName} · Centro` })).toBeVisible();
  await page.getByRole('link', { name: 'Carta de la empresa' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Carta de la empresa' })).toBeVisible();

  const taxes = page.getByRole('region', { name: 'Impuestos' });
  await taxes.getByLabel('Nombre del impuesto').fill('Impoconsumo');
  await taxes.getByLabel('Tasa (%)').fill('8');
  await taxes.getByRole('button', { name: 'Agregar impuesto' }).click();
  await expect(page.getByText('Impuesto «Impoconsumo» agregado.')).toBeVisible();

  const newCategory = page.getByRole('region', { name: 'Nueva categoría' });
  await newCategory.getByLabel('Nombre de la categoría').fill('Platos fuertes');
  await newCategory.getByRole('button', { name: 'Agregar categoría' }).click();
  await expect(page.getByText('Categoría «Platos fuertes» agregada.')).toBeVisible();

  const category = page.getByRole('region', { name: 'Platos fuertes' });
  await category.getByLabel('Nombre del producto').fill('Bandeja paisa');
  await category.getByLabel('Alérgenos declarados (opcional)').fill('huevo, leche');
  await category.getByRole('button', { name: 'Agregar producto' }).click();
  await expect(page.getByText('Producto «Bandeja paisa» agregado.')).toBeVisible();
  const product = category.getByRole('listitem').filter({ hasText: 'Bandeja paisa' }).first();
  await expect(product.getByText('Alérgenos declarados: huevo, leche')).toBeVisible();
  await expect(product.getByText('Impoconsumo 8 % incluido')).toBeVisible();

  await product.getByRole('button', { name: 'Opciones (0)' }).click();
  await product.getByLabel('Nombre del grupo').fill('Término de la carne');
  await product.getByLabel('Mínimo a elegir').fill('1');
  await product.getByRole('button', { name: 'Agregar grupo' }).click();
  await expect(page.getByText('Grupo «Término de la carne» agregado.')).toBeVisible();
  // El servidor también rechaza un mínimo mayor que el máximo (aquí lo detecta el cliente).
  await product.getByLabel('Nombre del grupo').fill('Salsas');
  await product.getByLabel('Mínimo a elegir').fill('3');
  await product.getByLabel('Máximo a elegir').fill('1');
  await product.getByRole('button', { name: 'Agregar grupo' }).click();
  await expect(product.getByText('El máximo no puede ser menor que el mínimo.')).toBeVisible();

  const group = product.getByRole('listitem').filter({ hasText: 'Término de la carne' }).first();
  await group.getByLabel('Nombre de la opción').fill('Con aguacate');
  await group.getByLabel('Valor adicional en pesos (opcional)').fill('5.400');
  await group.getByRole('button', { name: 'Agregar opción' }).click();
  await expect(page.getByText('Opción «Con aguacate» agregada.')).toBeVisible();
  await expect(group.getByText(/\+ \$\s5\.400/)).toBeVisible();
  await expectNoAxeViolations(page);

  // Carta de la sucursal: disponibilidad con horario y precio con confirmación.
  await page.getByRole('link', { name: 'Carta de la sucursal' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Carta de la sucursal' })).toBeVisible();
  const item = page.getByRole('listitem').filter({ hasText: 'Bandeja paisa' });
  await expect(item.getByText('No está en esta sucursal')).toBeVisible();
  await item.getByRole('button', { name: 'Editar en esta sucursal' }).click();
  await item.getByLabel('Solo en un horario').check();
  for (const day of ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Domingo']) {
    await item.getByLabel(day).uncheck();
  }
  await item.getByLabel('Desde').fill('18:00');
  await item.getByLabel('Hasta').fill('02:00');
  await item.getByRole('button', { name: 'Guardar disponibilidad' }).click();
  await expect(page.getByText('«Bandeja paisa» disponible en Centro.')).toBeVisible();
  await expect(item.getByText('Sin precio: no aparece en la carta')).toBeVisible();
  await expect(item.getByText(/vie y sáb · 18:00 a 02:00 \(cruza la medianoche\)/)).toBeVisible();

  // El panel sigue abierto tras guardar: ahora ya admite precio.
  await item.getByLabel('Precio nuevo en pesos').fill('32.000');
  await item.getByRole('button', { name: 'Cambiar precio' }).click();
  const dialog = page.getByRole('dialog', { name: '¿Cambiar el precio de Bandeja paisa?' });
  await dialog.getByRole('button', { name: 'Cambiar precio' }).click();
  await expect(item.getByText('En la carta')).toBeVisible();
  await expect(item.getByText(/Precio: \$\s32\.000/)).toBeVisible();
  await expectNoAxeViolations(page);

  // Administrador de sucursal: consulta la carta de la empresa y cambia el precio en su sucursal.
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await signIn(page, branchAdmin.email);
  await page.getByRole('link', { name: 'Carta de la empresa' }).click();
  await expect(page.getByText(/Solo el propietario puede modificarlos/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Agregar categoría' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Carta de la sucursal' }).click();
  const forAdmin = page.getByRole('listitem').filter({ hasText: 'Bandeja paisa' });
  await forAdmin.getByRole('button', { name: 'Editar en esta sucursal' }).click();
  await forAdmin.getByLabel('Precio nuevo en pesos').fill('35000');
  await forAdmin.getByRole('button', { name: 'Cambiar precio' }).click();
  const adminDialog = page.getByRole('dialog', { name: '¿Cambiar el precio de Bandeja paisa?' });
  await expect(adminDialog.getByText(/De \$\s32\.000 a \$\s35\.000 en Centro/)).toBeVisible();
  await adminDialog.getByRole('button', { name: 'Cambiar precio' }).click();
  await expect(forAdmin.getByText(/Precio: \$\s35\.000/)).toBeVisible();
});
