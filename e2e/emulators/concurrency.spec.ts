// Concurrencia en navegador contra los emuladores y el backend (Fase 3, bloque 7): dos personas
// actúan a la vez sobre lo mismo. El servidor deja un solo ganador (caso 4) y la otra persona ve en
// texto que alguien se adelantó, con el estado actual en pantalla.
// Se ejecuta con `npm run test:e2e:emulators`, que compila el backend y arranca los emuladores.
import { expect, test, type BrowserContext } from '@playwright/test';
import { callFunction } from '../../backend/tests/support/functions.ts';
import { customerOrders, openStaffPage } from '../support/orders.ts';

// Cuatro navegadores a la vez contra los emuladores: más tiempo que el general (90 s).
test.describe.configure({ timeout: 180_000 });
import { createUser, expectOk, mutate } from '../../dataconnect/tests/support/emulator.ts';
import { buildFixture } from '../../dataconnect/tests/support/catalog-fixture.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
} from '../../dataconnect/tests/support/provisioning.ts';

const CHANGED = 'Esta línea ya cambió. La pantalla muestra el estado actual.';

test('dos personas sobre la misma línea o la misma solicitud: un solo cambio y aviso a la otra', async ({
  browser,
}, testInfo) => {
  await seedAuthorizationCatalog();
  const tag = `${testInfo.project.name}-${Date.now().toString(36)}`;
  const owner = await createUser(`e2e-conc-owner-${tag}`);
  const cooks = [
    await createUser(`e2e-conc-cocina1-${tag}`),
    await createUser(`e2e-conc-cocina2-${tag}`),
  ];
  const waiters = [
    await createUser(`e2e-conc-mesero1-${tag}`),
    await createUser(`e2e-conc-mesero2-${tag}`),
  ];
  for (const user of [owner, ...cooks, ...waiters]) await createProfile(user);
  const tenantName = `Concurrencia ${tag}`;
  const tenant = await provisionTenant(tenantName, owner, ['Centro']);
  const branchId = tenant.branches['Centro'] ?? '';
  for (const cook of cooks) await insertMembership(tenant.id, cook, 'kitchen', [branchId]);
  for (const waiter of waiters) await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
  const fixture = await buildFixture(owner, tenant.id, branchId);
  const [firstWaiter] = waiters;
  if (!firstWaiter) throw new Error('Sin mesero');
  expectOk(
    await mutate(firstWaiter, 'OpenTableSession', {
      tenantId: tenant.id,
      branchId,
      tableId: fixture.tableId,
    }),
    'Abrir la mesa',
  );
  const seated = await customerOrders(fixture, owner, `e2e-conc-cliente-${tag}`, 2);

  const opened: BrowserContext[] = [];
  try {
    // Dos cocineros ven la misma línea y pulsan «Empezar» a la vez.
    const kitchens = await Promise.all(
      cooks.map((cook) => openStaffPage(browser, testInfo, cook.email, tenantName)),
    );
    opened.push(...kitchens.map(({ context }) => context));
    const lines = await Promise.all(
      kitchens.map(async ({ page }) => {
        await page.getByRole('link', { name: 'Cocina', exact: true }).click();
        const line = page.getByRole('listitem').filter({ hasText: 'Mesa M1 · 2 × Bandeja paisa' });
        await expect(line.getByRole('button', { name: /^Empezar/ })).toBeEnabled();
        return line;
      }),
    );
    await Promise.all(lines.map((line) => line.getByRole('button', { name: /^Empezar/ }).click()));
    // Las dos pantallas terminan mostrando el estado real: en preparación.
    for (const line of lines) await expect(line.getByText('En preparación')).toBeVisible();
    // Exactamente una persona ve que otra se adelantó.
    const warned = await Promise.all(
      kitchens.map(({ page }) => page.getByText(CHANGED, { exact: true }).isVisible()),
    );
    expect(warned.filter(Boolean)).toHaveLength(1);

    // Dos meseros marcan «Atendida» la misma solicitud a la vez.
    const called = await callFunction(seated.user, 'requestService', {
      sessionId: seated.sessionId,
      kind: 'call_waiter',
    });
    if (!called.ok) throw new Error(`Llamar: ${called.message}`);
    const floors = await Promise.all(
      waiters.map((waiter) => openStaffPage(browser, testInfo, waiter.email, tenantName)),
    );
    opened.push(...floors.map(({ context }) => context));
    const buttons = await Promise.all(
      floors.map(async ({ page }) => {
        await page.getByRole('link', { name: 'Salón', exact: true }).click();
        const button = page.getByRole('button', { name: 'Atendida: mesa M1, llamó al mesero' });
        await expect(button).toBeEnabled({ timeout: 15_000 });
        return button;
      }),
    );
    await Promise.all(buttons.map((button) => button.click()));
    const outcomes = await Promise.all(
      floors.map(async ({ page }) => {
        const done = page.getByText('Mesa M1: solicitud atendida.', { exact: true });
        const late = page.getByText('Esta solicitud ya fue atendida', { exact: true });
        await expect(done.or(late)).toBeVisible({ timeout: 15_000 });
        return (await done.isVisible()) ? 'atendida' : 'ya atendida';
      }),
    );
    expect(outcomes.sort()).toEqual(['atendida', 'ya atendida']);
    for (const { page } of floors) {
      await expect(page.getByText('No hay solicitudes pendientes')).toBeVisible();
    }
  } finally {
    for (const context of opened) await context.close();
  }
});
