// Carta y pedido del cliente en navegador contra los emuladores y el backend (Fase 2, bloque 6).
// Se ejecuta con `npm run test:e2e:emulators`, que compila el backend y arranca los emuladores.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { APPS } from '../../playwright.config.ts';
import { expectNotice } from '../support/notices.ts';
import { FUNCTION_WAIT } from '../support/orders.ts';
import { createUser, expectOk, mutate, query } from '../../dataconnect/tests/support/emulator.ts';
import { buildFixture } from '../../dataconnect/tests/support/catalog-fixture.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
} from '../../dataconnect/tests/support/provisioning.ts';

/** Nombre accesible con importes: Intl separa «$» del número con un espacio duro. */
const named = (text: string) =>
  new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s')}$`);

async function expectNoAxeViolations(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
}

/** Agrega una bandeja bien asada; `price` es el precio que debe mostrar la carta ("$ 32.000"). */
async function addBandeja(page: Page, price: string) {
  await page.getByRole('button', { name: 'Agregar Bandeja paisa' }).click();
  const form = page.getByRole('form', { name: 'Elegir Bandeja paisa' });
  await form.getByLabel('Bien asada').check();
  await form.getByRole('button', { name: named(`Agregar al pedido · ${price}`) }).click();
  await expectNotice(page, 'Agregaste 1 × Bandeja paisa a tu pedido.');
}

interface FloorData {
  sectors: Array<{
    diningTables_on_sector: Array<{ id: string; tableSessions_on_table: Array<{ id: string }> }>;
  }>;
}

test('el cliente pide desde el QR: mesa cerrada, precio cambiado, pago rechazado y aprobado', async ({
  page,
}, testInfo) => {
  await seedAuthorizationCatalog();
  const tag = `${testInfo.project.name}-${Date.now().toString(36)}`;
  const owner = await createUser(`e2e-cliente-owner-${tag}`);
  const waiter = await createUser(`e2e-cliente-mesero-${tag}`);
  for (const user of [owner, waiter]) await createProfile(user);
  const tenant = await provisionTenant(`Cliente ${tag}`, owner, ['Centro']);
  const branchId = tenant.branches['Centro'] ?? '';
  await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
  const fixture = await buildFixture(owner, tenant.id, branchId);
  const scope = { tenantId: tenant.id, branchId };

  // La carta se ve sin sesión, con el precio vigente y los alérgenos declarados.
  await page.goto(`${APPS.menuWeb}/mesa/${fixture.qrPublicId}`);
  await expect(page.getByRole('heading', { level: 1, name: 'Centro' })).toBeVisible();
  await expect(page.getByText('Mesa M1', { exact: true })).toBeVisible();
  await expect(page.getByText('Alérgenos declarados: huevo')).toBeVisible();
  await addBandeja(page, '$ 32.000');
  await expectNoAxeViolations(page);
  await page.getByRole('link', { name: named('Ver mi pedido · 1 producto · $ 32.000') }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Tu pedido' })).toBeVisible();

  // D-21: sin mesa abierta no se puede pedir.
  await page.getByRole('button', { name: 'Revisar pedido' }).click();
  await expectNotice(page, 'La mesa todavía no está abierta. Pide al mesero que la abra.');

  // El mesero abre la mesa y, con el carrito abierto, el propietario sube el precio (caso 5).
  expectOk(
    await mutate(waiter, 'OpenTableSession', { ...scope, tableId: fixture.tableId }),
    'OpenTableSession',
  );
  expectOk(
    await mutate(owner, 'ChangePrice', {
      ...scope,
      productId: fixture.productId,
      amountMinor: '3500000',
      currency: 'COP',
    }),
    'ChangePrice',
  );
  await page.getByRole('button', { name: 'Revisar pedido' }).click();
  // Cada paso espera al backend: con el emulador frío, la respuesta puede tardar (FUNCTION_WAIT).
  await expect(page.getByRole('heading', { name: 'Algunos importes cambiaron' })).toBeVisible({
    timeout: FUNCTION_WAIT,
  });
  await expect(
    page.getByText(/^Bandeja paisa: antes .*32\.000, ahora .*35\.000 por unidad\.$/),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Aceptar los importes actuales' }).click();
  await expect(
    page.getByRole('heading', { name: 'Resumen confirmado por el restaurante' }),
  ).toBeVisible({ timeout: FUNCTION_WAIT });
  await expect(page.getByText('Impuestos incluidos')).toBeVisible();
  await expectNoAxeViolations(page);

  // Pago simulado rechazado: hay que revisar otra vez; luego aprobado.
  await page.getByLabel('Resultado del pago simulado').selectOption('declined');
  await page.getByRole('button', { name: named('Autorizar y enviar a cocina · $ 35.000') }).click();
  await expectNotice(
    page,
    'El pago simulado fue rechazado y el pedido no se envió a cocina. Revisa el pedido para intentarlo de nuevo.',
    FUNCTION_WAIT,
  );
  await page.getByRole('button', { name: 'Revisar pedido' }).click();
  await page.getByLabel('Resultado del pago simulado').selectOption('approved');
  await page.getByRole('button', { name: named('Autorizar y enviar a cocina · $ 35.000') }).click();
  await expect(page.getByRole('heading', { name: 'Pedido enviado a cocina' })).toBeVisible({
    timeout: FUNCTION_WAIT,
  });
  await expect(page.getByText('Pago autorizado (simulado)')).toBeVisible();

  // Caso 12: al cerrar la mesa, el cliente pierde el acceso; la sesión siguiente exige reabrirla.
  const floor = expectOk(await query<FloorData>(waiter, 'FloorView', scope), 'FloorView');
  const sessionId =
    floor.sectors[0]?.diningTables_on_sector.find((t) => t.id === fixture.tableId)
      ?.tableSessions_on_table[0]?.id ?? '';
  expectOk(await mutate(waiter, 'CloseTableSession', { ...scope, sessionId }), 'Cerrar mesa');
  await page.getByRole('button', { name: 'Hacer otro pedido' }).click();
  await page.getByRole('link', { name: 'Volver a la carta' }).click();
  // La carta ya muestra el precio nuevo: se volvió a leer al informar el cambio.
  await addBandeja(page, '$ 35.000');
  await page.getByRole('link', { name: named('Ver mi pedido · 1 producto · $ 35.000') }).click();
  await page.getByRole('button', { name: 'Revisar pedido' }).click();
  await expectNotice(page, 'La mesa todavía no está abierta. Pide al mesero que la abra.');
});

test('un QR inventado no muestra ninguna carta', async ({ page }) => {
  await page.goto(`${APPS.menuWeb}/mesa/00000000-0000-4000-8000-000000000000`);
  await expect(
    page.getByRole('heading', { name: 'Este código QR no corresponde a ninguna mesa activa' }),
  ).toBeVisible();
});
