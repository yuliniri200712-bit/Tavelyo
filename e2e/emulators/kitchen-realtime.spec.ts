// Cocina en tiempo real en navegador contra los emuladores y el backend (Fase 3, bloque 4).
// Verifica en un navegador real lo que ADR-0007 dejó pendiente: el pedido nuevo llega sin
// recargar y, tras perder la conexión, la pantalla recupera lo pendiente (caso 11).
// Se ejecuta con `npm run test:e2e:emulators`, que compila el backend y arranca los emuladores.
import { randomUUID } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { PREAUTHORIZATION_CONSENT_VERSION, type QuoteOrderResponse } from '@tavelyo/contracts';
import { APPS } from '../../playwright.config.ts';
import { callFunction } from '../../backend/tests/support/functions.ts';
import {
  createAnonymousUser,
  createUser,
  expectOk,
  mutate,
  query,
  TEST_PASSWORD,
  type TestUser,
} from '../../dataconnect/tests/support/emulator.ts';
import {
  buildFixture,
  FIXTURE_PRICE_MINOR,
  type Fixture,
} from '../../dataconnect/tests/support/catalog-fixture.ts';
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

/** Un cliente se une a la mesa, revisa y autoriza: el backend envía el pedido a cocina. */
async function customerOrders(
  fixture: Fixture,
  owner: TestUser,
  label: string,
  quantity: number,
): Promise<void> {
  const customer = await createAnonymousUser(label);
  const joined = await callFunction<{ sessionId: string }>(customer, 'joinTableSession', {
    qrPublicId: fixture.qrPublicId,
  });
  if (!joined.ok) throw new Error(`Unirse: ${joined.message}`);
  const catalog = expectOk(
    await query<{ productBranches: Array<{ productId: string; currentPrice: { id: string } }> }>(
      owner,
      'BranchCatalog',
      { tenantId: fixture.tenantId, branchId: fixture.branchId },
    ),
    'Precio vigente',
  );
  const priceId =
    catalog.productBranches.find((p) => p.productId === fixture.productId)?.currentPrice.id ?? '';
  const quoted = await callFunction<QuoteOrderResponse>(customer, 'quoteOrder', {
    sessionId: joined.result.sessionId,
    idempotencyKey: `rev_${randomUUID()}`,
    lines: [
      {
        productId: fixture.productId,
        priceId,
        quantity,
        optionIds: [fixture.optionId],
        note: 'Sin cebolla',
      },
    ],
    expectedTotalMinor: (BigInt(FIXTURE_PRICE_MINOR) * BigInt(quantity)).toString(),
  });
  if (!quoted.ok || quoted.result.outcome !== 'quoted') {
    throw new Error(`Revisar: ${quoted.ok ? quoted.result.outcome : quoted.message}`);
  }
  const paid = await callFunction(customer, 'authorizeQuote', {
    quoteId: quoted.result.quoteId,
    consentTextVersion: PREAUTHORIZATION_CONSENT_VERSION,
  });
  if (!paid.ok) throw new Error(`Autorizar: ${paid.message}`);
}

test('cocina recibe los pedidos en vivo, los avanza y se recupera tras perder la conexión', async ({
  page,
  context,
}, testInfo) => {
  await seedAuthorizationCatalog();
  const tag = `${testInfo.project.name}-${Date.now().toString(36)}`;
  const owner = await createUser(`e2e-cocina-owner-${tag}`);
  const waiter = await createUser(`e2e-cocina-mesero-${tag}`);
  const cook = await createUser(`e2e-cocina-${tag}`);
  for (const user of [owner, waiter, cook]) await createProfile(user);
  const tenantName = `Cocina ${tag}`;
  const tenant = await provisionTenant(tenantName, owner, ['Centro']);
  const branchId = tenant.branches['Centro'] ?? '';
  await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
  await insertMembership(tenant.id, cook, 'kitchen', [branchId]);
  const fixture = await buildFixture(owner, tenant.id, branchId);
  expectOk(
    await mutate(waiter, 'OpenTableSession', {
      tenantId: tenant.id,
      branchId,
      tableId: fixture.tableId,
    }),
    'Abrir la mesa',
  );
  // El primer pedido crea la estación predeterminada de la sucursal.
  await customerOrders(fixture, owner, `e2e-cocina-cliente1-${tag}`, 2);

  await signIn(page, cook.email);
  await expect(page.getByRole('heading', { name: `${tenantName} · Centro` })).toBeVisible();
  await page.getByRole('link', { name: 'Cocina', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Cocina' })).toBeVisible();
  await expect(page.getByText('En vivo')).toBeVisible();

  const first = page.getByRole('listitem').filter({ hasText: 'Mesa M1 · 2 × Bandeja paisa' });
  await expect(first).toBeVisible();
  await expect(first.getByText('Alérgenos declarados:')).toBeVisible();
  await expect(first.getByText('Opciones: Bien asada')).toBeVisible();
  await expect(first.getByText('Sin cebolla')).toBeVisible();
  // Cocina no ve importes.
  await expect(page.getByText(/\$\s?\d/)).toHaveCount(0);

  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(axe.violations).toEqual([]);

  // Un pedido nuevo llega sin recargar la página.
  await customerOrders(fixture, owner, `e2e-cocina-cliente2-${tag}`, 1);
  const second = page.getByRole('listitem').filter({ hasText: 'Mesa M1 · 1 × Bandeja paisa' });
  await expect(second).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Pedido nuevo: mesa M1.')).toBeVisible();
  await expect(second.getByText('Nuevo', { exact: true })).toBeVisible();

  // Empezar y Listo: la línea cambia y luego sale de la cola.
  await first.getByRole('button', { name: /^Empezar/ }).click();
  await expect(first.getByText('En preparación')).toBeVisible();
  await first.getByRole('button', { name: /^Listo/ }).click();
  await expect(first).toHaveCount(0);

  // Caso 11: sin conexión no se avanza; lo confirmado entretanto aparece al volver.
  await context.setOffline(true);
  await expect(page.getByText('Sin conexión con el servidor.')).toBeVisible({ timeout: 15_000 });
  await expect(second.getByRole('button', { name: /^Empezar/ })).toBeDisabled();
  await customerOrders(fixture, owner, `e2e-cocina-cliente3-${tag}`, 3);
  await context.setOffline(false);
  await expect(page.getByText('En vivo')).toBeVisible({ timeout: 20_000 });
  await expect(
    page.getByRole('listitem').filter({ hasText: 'Mesa M1 · 3 × Bandeja paisa' }),
  ).toBeVisible({ timeout: 20_000 });
  await expect(second.getByRole('button', { name: /^Empezar/ })).toBeEnabled();
});
