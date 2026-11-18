// Meseros en tiempo real en navegador contra los emuladores y el backend (Fase 3, bloque 5).
// El salón muestra pedidos y solicitudes sin recargar; «Listos para recoger» recoge y entrega; una
// solicitud se marca atendida; una línea se cancela con motivo desde los pedidos de la mesa.
// Se ejecuta con `npm run test:e2e:emulators`, que compila el backend y arranca los emuladores.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { callFunction } from '../../backend/tests/support/functions.ts';
import { expectNotice } from '../support/notices.ts';
import { customerOrders, signInStaff } from '../support/orders.ts';
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

interface SessionOrdersData {
  orders: Array<{ orderItems_on_order: Array<{ id: string; version: number; status: string }> }>;
}

async function expectNoAxeViolations(page: Page) {
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(axe.violations).toEqual([]);
}

test('el mesero ve pedidos y solicitudes en vivo, recoge, entrega, atiende y cancela', async ({
  page,
  context,
}, testInfo) => {
  await seedAuthorizationCatalog();
  const tag = `${testInfo.project.name}-${Date.now().toString(36)}`;
  const owner = await createUser(`e2e-meseros-owner-${tag}`);
  const waiter = await createUser(`e2e-meseros-mesero-${tag}`);
  const cook = await createUser(`e2e-meseros-cocina-${tag}`);
  for (const user of [owner, waiter, cook]) await createProfile(user);
  const tenantName = `Meseros ${tag}`;
  const tenant = await provisionTenant(tenantName, owner, ['Centro']);
  const branchId = tenant.branches['Centro'] ?? '';
  const scope = { tenantId: tenant.id, branchId };
  await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
  await insertMembership(tenant.id, cook, 'kitchen', [branchId]);
  const fixture = await buildFixture(owner, tenant.id, branchId);
  expectOk(
    await mutate(waiter, 'OpenTableSession', { ...scope, tableId: fixture.tableId }),
    'Abrir',
  );

  /** Línea del pedido de la mesa, leída como la ve el mesero. */
  const lineOf = async (sessionId: string, index: number) => {
    const data = expectOk(
      await query<SessionOrdersData>(waiter, 'SessionOrders', { ...scope, sessionId }),
      'SessionOrders',
    );
    const line = data.orders[index]?.orderItems_on_order[0];
    if (!line) throw new Error('Sin línea');
    return line;
  };
  const advance = async (user: TestUser, operation: string, sessionId: string) => {
    const line = await lineOf(sessionId, 0);
    expectOk(
      await mutate(user, operation, { ...scope, itemId: line.id, version: line.version }),
      operation,
    );
  };

  const first = await customerOrders(fixture, owner, `e2e-meseros-cliente-${tag}`, 2);

  await signInStaff(page, waiter.email);
  await expect(page.getByRole('heading', { name: `${tenantName} · Centro` })).toBeVisible();
  await page.getByRole('link', { name: 'Salón', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Salón' })).toBeVisible();
  await expect(page.getByText('En vivo')).toBeVisible();
  const table = page
    .getByRole('list', { name: 'Mesas de Salón' })
    .getByRole('listitem')
    .filter({ hasText: 'Mesa M1' });
  await expect(table.getByText('1 línea en cocina')).toBeVisible();
  const requests = page.getByRole('region', { name: 'Solicitudes de las mesas' });
  await expect(requests.getByText('No hay solicitudes pendientes')).toBeVisible();

  // El cliente llama al mesero: aparece sin recargar, en la mesa y en la lista de solicitudes.
  const called = await callFunction(first.user, 'requestService', {
    sessionId: first.sessionId,
    kind: 'call_waiter',
  });
  if (!called.ok) throw new Error(`Llamar: ${called.message}`);
  await expect(table.getByText(/^Llamó al mesero a las \d{2}:\d{2}$/)).toBeVisible({
    timeout: 15_000,
  });
  await expect(requests.getByText('Mesa M1: llamó al mesero.')).toBeVisible();
  await expectNoAxeViolations(page);
  await requests.getByRole('button', { name: 'Atendida: mesa M1, llamó al mesero' }).click();
  await expectNotice(page, 'Mesa M1: solicitud atendida.');
  await expect(requests.getByText('No hay solicitudes pendientes')).toBeVisible();
  await expect(table.getByText(/^Llamó al mesero/)).toHaveCount(0);

  // Cocina termina la línea: el salón lo muestra sin recargar.
  await advance(cook, 'StartOrderItem', first.sessionId);
  await advance(cook, 'FinishOrderItem', first.sessionId);
  await expect(table.getByText('1 lista para recoger')).toBeVisible({ timeout: 15_000 });
  await expect(table.getByText('Platos listos')).toBeVisible();

  // «Listos para recoger»: recoger y entregar.
  // De vuelta al inicio con el historial, sin recargar la app.
  await page.goBack();
  await page.getByRole('link', { name: 'Listos para recoger' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Listos para recoger' })).toBeVisible();
  const ready = page.getByRole('listitem').filter({ hasText: 'Mesa M1 · 2 × Bandeja paisa' });
  await expect(ready.getByText('Listo para recoger')).toBeVisible();
  await expect(page.getByText(/\$\s?\d/)).toHaveCount(0);
  await expectNoAxeViolations(page);
  await ready.getByRole('button', { name: 'Recogido 2 × Bandeja paisa, mesa M1' }).click();
  await expectNotice(page, 'Recogido: 2 × Bandeja paisa, mesa M1.');
  await expect(ready.getByText('Recogido', { exact: true })).toBeVisible();

  // Sin conexión no deja entregar; al volver, sí.
  await context.setOffline(true);
  await expect(page.getByText('Sin conexión con el servidor.')).toBeVisible({ timeout: 15_000 });
  await expect(ready.getByRole('button', { name: /^Entregado/ })).toBeDisabled();
  await context.setOffline(false);
  await expect(page.getByText('En vivo')).toBeVisible({ timeout: 20_000 });
  await ready.getByRole('button', { name: 'Entregado 2 × Bandeja paisa, mesa M1' }).click();
  await expectNotice(page, 'Entregado: 2 × Bandeja paisa, mesa M1.');
  await expect(page.getByText('No hay platos listos', { exact: true })).toBeVisible();

  // Un plato que queda listo mientras la pantalla está abierta se anuncia en texto.
  const second = await customerOrders(fixture, owner, `e2e-meseros-cliente2-${tag}`, 1);
  const secondLine = await lineOf(second.sessionId, 1);
  for (const operation of ['StartOrderItem', 'FinishOrderItem']) {
    const current = await lineOf(second.sessionId, 1);
    expectOk(
      await mutate(cook, operation, { ...scope, itemId: current.id, version: current.version }),
      operation,
    );
  }
  await expect(page.getByText('Plato listo: mesa M1.')).toBeVisible({ timeout: 15_000 });
  expect(secondLine.status).toBe('RECEIVED');

  // Pedidos de la mesa: el mesero cancela la línea lista con motivo (queda como merma).
  // De vuelta al inicio con el historial, sin recargar la app.
  await page.goBack();
  await page.getByRole('link', { name: 'Salón', exact: true }).click();
  await table.getByRole('button', { name: 'Ver pedidos' }).click();
  const orders = page.getByRole('region', { name: 'Pedidos de la mesa M1' });
  const delivered = orders.getByRole('listitem').filter({ hasText: '2 × Bandeja paisa' });
  await expect(delivered.getByText('Entregado', { exact: true })).toBeVisible();
  const pending = orders.getByRole('listitem').filter({ hasText: '1 × Bandeja paisa' });
  await expect(pending.getByText('Listo para recoger')).toBeVisible();
  await pending.getByRole('button', { name: 'Cancelar 1 × Bandeja paisa, mesa M1' }).click();
  const dialog = page.getByRole('dialog', { name: '¿Cancelar 1 × Bandeja paisa?' });
  await expect(dialog.getByText(/quedará registrada como merma/)).toBeVisible();
  await dialog.getByLabel('Motivo de la cancelación').fill('El cliente ya no lo quiere');
  await dialog.getByRole('button', { name: 'Cancelar línea' }).click();
  await expectNotice(page, '1 × Bandeja paisa cancelado.');
  await expect(pending.getByText('Cancelado', { exact: true })).toBeVisible();
  await expect(
    pending.getByText('Motivo de la cancelación: El cliente ya no lo quiere'),
  ).toBeVisible();
  await expect(table.getByText('Sin pedidos en curso')).toBeVisible();
  await expectNoAxeViolations(page);
});
