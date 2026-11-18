// Cliente en tiempo real en navegador contra los emuladores y el backend (Fase 3, bloque 6).
// «Autorizar y enviar a cocina», «Mis pedidos» en vivo (también tras recargar y sin conexión) y
// «Llamar al mesero» / «Pedir la cuenta».
// Se ejecuta con `npm run test:e2e:emulators`, que compila el backend y arranca los emuladores.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { APPS } from '../../playwright.config.ts';
import { expectNotice } from '../support/notices.ts';
import { FUNCTION_WAIT } from '../support/orders.ts';

// Tres avisos que pasan por el backend: más tiempo que el general (90 s).
test.describe.configure({ timeout: 180_000 });
import {
  createUser,
  expectOk,
  mutate,
  query,
  type TestUser,
} from '../../dataconnect/tests/support/emulator.ts';
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
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(axe.violations).toEqual([]);
}

interface FloorData {
  sectors: Array<{
    diningTables_on_sector: Array<{ id: string; tableSessions_on_table: Array<{ id: string }> }>;
  }>;
}
interface SessionOrdersData {
  orders: Array<{ orderItems_on_order: Array<{ id: string; version: number }> }>;
}
interface PendingData {
  serviceRequests: Array<{ kind: string; session: { table: { code: string } } }>;
}

test('el cliente autoriza y envía a cocina, sigue su pedido en vivo y llama al mesero', async ({
  page,
  context,
}, testInfo) => {
  await seedAuthorizationCatalog();
  const tag = `${testInfo.project.name}-${Date.now().toString(36)}`;
  const owner = await createUser(`e2e-vivo-owner-${tag}`);
  const waiter = await createUser(`e2e-vivo-mesero-${tag}`);
  const cook = await createUser(`e2e-vivo-cocina-${tag}`);
  for (const user of [owner, waiter, cook]) await createProfile(user);
  const tenant = await provisionTenant(`Vivo ${tag}`, owner, ['Centro']);
  const branchId = tenant.branches['Centro'] ?? '';
  const scope = { tenantId: tenant.id, branchId };
  await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
  await insertMembership(tenant.id, cook, 'kitchen', [branchId]);
  const fixture = await buildFixture(owner, tenant.id, branchId);
  expectOk(
    await mutate(waiter, 'OpenTableSession', { ...scope, tableId: fixture.tableId }),
    'Abrir',
  );
  const floor = expectOk(await query<FloorData>(waiter, 'FloorView', scope), 'FloorView');
  const sessionId =
    floor.sectors[0]?.diningTables_on_sector.find((t) => t.id === fixture.tableId)
      ?.tableSessions_on_table[0]?.id ?? '';

  /** Avanza la única línea de la mesa como lo haría el personal. */
  const advance = async (user: TestUser, operation: string) => {
    const data = expectOk(
      await query<SessionOrdersData>(waiter, 'SessionOrders', { ...scope, sessionId }),
      'SessionOrders',
    );
    const line = data.orders[0]?.orderItems_on_order[0];
    if (!line) throw new Error('Sin línea');
    expectOk(
      await mutate(user, operation, { ...scope, itemId: line.id, version: line.version }),
      operation,
    );
  };

  // Autorizar y enviar a cocina.
  await page.goto(`${APPS.menuWeb}/mesa/${fixture.qrPublicId}`);
  await page.getByRole('button', { name: 'Agregar Bandeja paisa' }).click();
  const form = page.getByRole('form', { name: 'Elegir Bandeja paisa' });
  await form.getByLabel('Bien asada').check();
  await form.getByRole('button', { name: named('Agregar al pedido · $ 32.000') }).click();
  await page.getByRole('link', { name: named('Ver mi pedido · 1 producto · $ 32.000') }).click();
  await page.getByRole('button', { name: 'Revisar pedido' }).click();
  const pay = page.getByRole('button', { name: named('Autorizar y enviar a cocina · $ 32.000') });
  // La primera llamada al backend puede tardar (arranque en frío de las funciones).
  await expect(pay).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/Sin autorización no se envía/)).toBeVisible();
  await pay.click();
  await expect(page.getByRole('heading', { name: 'Pedido enviado a cocina' })).toBeVisible({
    timeout: FUNCTION_WAIT,
  });

  // «Mis pedidos»: el estado de la línea, en vivo.
  await page.getByRole('link', { name: 'Ver mis pedidos' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Mis pedidos' })).toBeVisible();
  const line = page.getByRole('listitem').filter({ hasText: '1 × Bandeja paisa' });
  await expect(line.getByText('Recibido en cocina')).toBeVisible();
  await expect(page.getByText('En vivo')).toBeVisible();
  await expectNoAxeViolations(page);
  await advance(cook, 'StartOrderItem');
  await expect(line.getByText('En preparación')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Bandeja paisa: en preparación.')).toBeVisible();

  // Llamar al mesero y pedir la cuenta: llegan al personal; un aviso repetido no crea otro.
  await page.getByRole('button', { name: 'Llamar al mesero' }).click();
  // requestService pasa por el backend: en el emulador, a veces tarda varios segundos.
  await expectNotice(page, 'Avisamos al mesero. Viene a tu mesa.', FUNCTION_WAIT);
  await page.getByRole('button', { name: 'Llamar al mesero' }).click();
  await expectNotice(page, 'El mesero ya tiene tu aviso. Viene en camino.', FUNCTION_WAIT);
  await page.getByRole('button', { name: 'Pedir la cuenta' }).click();
  await expectNotice(page, 'Avisamos al mesero que quieres la cuenta.', FUNCTION_WAIT);
  const pending = expectOk(
    await query<PendingData>(waiter, 'PendingServiceRequests', scope),
    'PendingServiceRequests',
  );
  expect(pending.serviceRequests.map((r) => r.kind).sort()).toEqual([
    'CALL_WAITER',
    'REQUEST_BILL',
  ]);

  // Tras recargar, el teléfono recupera la mesa y sus pedidos sin unirse de nuevo.
  await page.reload();
  await expect(line.getByText('En preparación')).toBeVisible({ timeout: 15_000 });

  // Caso 11: sin conexión lo dice; lo que pasó entretanto aparece al volver.
  await context.setOffline(true);
  await expect(page.getByText('Sin conexión con el servidor.')).toBeVisible({ timeout: 15_000 });
  await advance(cook, 'FinishOrderItem');
  await advance(waiter, 'PickUpOrderItem');
  await context.setOffline(false);
  await expect(page.getByText('En vivo')).toBeVisible({ timeout: 20_000 });
  await expect(line.getByText('En camino a tu mesa')).toBeVisible({ timeout: 20_000 });
  await advance(waiter, 'DeliverOrderItem');
  await expect(line.getByText('Entregado', { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByRole('heading', { name: /^Pedido de las \d{2}:\d{2} · Entregado$/ }),
  ).toBeVisible();
});
