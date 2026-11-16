// Salón del mesero en navegador contra los emuladores (Fase 2, bloque 5).
// Se ejecuta con `npm run test:e2e:emulators`, que arranca los emuladores.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { APPS } from '../../playwright.config.ts';
import { expectNotice } from '../support/notices.ts';
import {
  createAnonymousUser,
  createUser,
  expectOk,
  query,
  server,
  TEST_PASSWORD,
} from '../../dataconnect/tests/support/emulator.ts';
import { buildFixture } from '../../dataconnect/tests/support/catalog-fixture.ts';
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

interface FloorData {
  sectors: Array<{
    diningTables_on_sector: Array<{ id: string; tableSessions_on_table: Array<{ id: string }> }>;
  }>;
}

test('el mesero abre la mesa, ve quién se unió, retira a una persona y cierra', async ({
  page,
}, testInfo) => {
  await seedAuthorizationCatalog();
  const tag = `${testInfo.project.name}-${Date.now().toString(36)}`;
  const owner = await createUser(`e2e-salon-owner-${tag}`);
  const waiter = await createUser(`e2e-salon-mesero-${tag}`);
  const cook = await createUser(`e2e-salon-cocina-${tag}`);
  for (const user of [owner, waiter, cook]) await createProfile(user);
  const tenantName = `Salón ${tag}`;
  const tenant = await provisionTenant(tenantName, owner, ['Centro']);
  const branchId = tenant.branches['Centro'] ?? '';
  await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
  await insertMembership(tenant.id, cook, 'kitchen', [branchId]);
  const fixture = await buildFixture(owner, tenant.id, branchId);

  await signIn(page, waiter.email);
  await expect(page.getByRole('heading', { name: `${tenantName} · Centro` })).toBeVisible();
  // El mesero no ve la administración.
  await expect(page.getByRole('link', { name: 'Mesas y códigos QR' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Salón', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Salón' })).toBeVisible();
  await expect(page.getByText('Centro · 0 mesas abiertas · 1 libre')).toBeVisible();

  const table = page
    .getByRole('list', { name: 'Mesas de Salón' })
    .getByRole('listitem')
    .filter({ hasText: 'Mesa M1' });
  await expect(table.getByText('Libre', { exact: true })).toBeVisible();
  await table.getByRole('button', { name: 'Abrir mesa' }).click();
  await expectNotice(page, 'Mesa M1 abierta. Los clientes ya pueden unirse desde el QR.');
  await expect(table.getByText('Abierta', { exact: true })).toBeVisible();
  await expect(table.getByText(/^Abierta desde las \d{2}:\d{2}$/)).toBeVisible();

  // Dos clientes se unen desde el QR (lo que hace joinTableSession en el backend).
  const floor = expectOk(
    await query<FloorData>(waiter, 'FloorView', { tenantId: tenant.id, branchId }),
    'FloorView',
  );
  const sessionId =
    floor.sectors[0]?.diningTables_on_sector.find((t) => t.id === fixture.tableId)
      ?.tableSessions_on_table[0]?.id ?? '';
  expect(sessionId).not.toBe('');
  for (const label of ['cliente', 'intruso']) {
    const customer = await createAnonymousUser(`e2e-salon-${label}-${tag}`);
    expectOk(
      await server('mutation', 'ServerInsertParticipant', {
        tenantId: tenant.id,
        branchId,
        sessionId,
        authUid: customer.uid,
        expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
      }),
      `Participante ${label}`,
    );
  }

  await table.getByRole('button', { name: 'Ver personas en la mesa' }).click();
  const people = page.getByRole('list', { name: 'Personas en la mesa M1' });
  await expect(people.getByRole('listitem')).toHaveCount(2);
  const second = people.getByRole('listitem').filter({ hasText: 'Persona 2' });
  await second.getByRole('button', { name: 'Retirar de la mesa' }).click();
  const removeDialog = page.getByRole('dialog', { name: '¿Retirar a la persona 2 de la mesa M1?' });
  await removeDialog.getByRole('button', { name: 'Retirar de la mesa' }).click();
  await expectNotice(page, 'Persona 2 retirada de la mesa M1.');
  await expect(second.getByText('Retirada', { exact: true })).toBeVisible();
  await expect(
    people
      .getByRole('listitem')
      .filter({ hasText: 'Persona 1' })
      .getByText('En la mesa', { exact: true }),
  ).toBeVisible();

  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);

  await table.getByRole('button', { name: 'Cerrar mesa' }).click();
  const closeDialog = page.getByRole('dialog', { name: '¿Cerrar la mesa M1?' });
  await closeDialog.getByRole('button', { name: 'Cerrar mesa' }).click();
  await expectNotice(page, 'Mesa M1 cerrada. Quedó libre.');
  await expect(table.getByText('Libre', { exact: true })).toBeVisible();
  await expect(page.getByText('Centro · 0 mesas abiertas · 1 libre')).toBeVisible();

  // Cocina no tiene session.open: ni el módulo ni la ruta directa muestran el salón.
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await signIn(page, cook.email);
  await expect(page.getByRole('heading', { name: `${tenantName} · Centro` })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Salón', exact: true })).toHaveCount(0);
  await page.goto(`${APPS.operations}/salon`);
  await expect(
    page.getByRole('heading', { name: 'Esta sección no está disponible para tu rol' }),
  ).toBeVisible();
});
