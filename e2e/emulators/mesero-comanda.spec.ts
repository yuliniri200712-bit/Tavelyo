import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { buildFixture } from '../../dataconnect/tests/support/catalog-fixture.ts';
import { createUser, expectOk, mutate, query } from '../../dataconnect/tests/support/emulator.ts';
import {
  createProfile,
  provisionTenant,
  seedAuthorizationCatalog,
  insertMembership,
} from '../../dataconnect/tests/support/provisioning.ts';
import { callFunction } from '../../backend/tests/support/functions.ts';
import { FUNCTION_WAIT, signInStaff } from '../support/orders.ts';
import type { BillResponse, StaffOrderResponse } from '@tavelyo/contracts';

// Parte 6b (D-42, D-43): el mesero toma el pedido de una persona sin teléfono, que va directo a
// cocina aunque la sucursal pida aprobación, y cada persona conserva su propio saldo.
test('el mesero toma la comanda de una persona sin teléfono y va directo a cocina', async ({
  page,
}, info) => {
  test.slow();
  const tag = info.project.name + '-' + Date.now().toString(36);
  await seedAuthorizationCatalog();
  const owner = await createUser('comanda-owner-' + tag);
  const waiter = await createUser('comanda-mesero-' + tag);
  const cashier = await createUser('comanda-caja-' + tag);
  for (const u of [owner, waiter, cashier]) await createProfile(u);
  const tenant = await provisionTenant('Comanda ' + tag, owner, ['Centro']);
  const branchId = tenant.branches['Centro'] ?? '';
  const scope = { tenantId: tenant.id, branchId };
  await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
  await insertMembership(tenant.id, cashier, 'cashier', [branchId]);
  const f = await buildFixture(owner, tenant.id, branchId);
  const session = expectOk(
    await mutate<{ tableSession_insert: { id: string } }>(waiter, 'OpenTableSession', {
      ...scope,
      tableId: f.tableId,
    }),
    'Abrir mesa',
  ).tableSession_insert.id;
  expectOk(
    await mutate(owner, 'SetBranchOrderApproval', { ...scope, mode: 'WAITER_APPROVAL' }),
    'Activar aprobación',
  );
  await signInStaff(page, waiter.email);
  await page.getByRole('link', { name: 'Salón', exact: true }).click();
  await page.getByRole('button', { name: 'Tomar pedido' }).click();
  await page.getByRole('button', { name: 'Agregar persona sin teléfono' }).click();
  await expect(page.getByLabel('Persona de la mesa')).not.toHaveValue('');
  await page.getByLabel('Buscar por producto o categoría').fill('bandeja');
  await page.getByRole('button', { name: 'Elegir Bandeja paisa' }).click();
  await page.getByLabel('Bien asada').check();
  await page.getByLabel('Nota para la cocina (opcional)').fill('Sin cebolla');
  await page.getByRole('button', { name: /Agregar al pedido/ }).click();
  await page.getByRole('button', { name: 'Revisar comanda' }).click();
  const review = page.getByRole('dialog', { name: 'Enviar pedido de la mesa M1' });
  await expect(review).toContainText('Sin cebolla');
  await expect(review).toContainText('Persona sin teléfono 1');
  await review.getByRole('button', { name: 'Enviar a cocina' }).click();
  await expect(page.getByText('Pedido enviado a cocina para Persona sin teléfono 1.')).toBeVisible({
    timeout: FUNCTION_WAIT,
  });
  const id = await page.getByLabel('Persona de la mesa').inputValue();
  const seat = { ...scope, sessionId: session };
  expect(await callFunction<BillResponse>(cashier, 'readBill', seat)).toMatchObject({
    ok: true,
    result: {
      totalMinor: '3200000',
      participants: [{ participantId: id, guestNumber: 1, outstandingMinor: '3200000' }],
    },
  });
  // En el panel de personas del salón sigue en la mesa: no tiene acceso por QR que venza.
  await page.getByRole('button', { name: 'Ver personas en la mesa' }).click();
  const people = page.getByRole('list', { name: 'Personas en la mesa M1' });
  const guest = people.getByRole('listitem').filter({ hasText: 'Persona sin teléfono 1' });
  await expect(guest.getByText('En la mesa')).toBeVisible();
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(audit.violations).toEqual([]);

  // Otra persona sin teléfono tiene su saldo aunque se repita el envío tras perder la respuesta.
  const other = expectOk(
    await mutate<{ sessionParticipant_insert: { id: string } }>(waiter, 'AddTableGuest', {
      ...seat,
      number: 2,
    }),
    'Segunda persona',
  ).sessionParticipant_insert.id;
  const menu = expectOk(
    await query<{ branch: { productBranches_on_branch: { currentPrice: { id: string } }[] } }>(
      waiter,
      'StaffOrderDesk',
      seat,
    ),
    'Carta',
  );
  const request = {
    ...seat,
    participantId: other,
    idempotencyKey: crypto.randomUUID(),
    expectedTotalMinor: '3200000',
    lines: [
      {
        productId: f.productId,
        priceId: menu.branch.productBranches_on_branch[0]?.currentPrice.id ?? '',
        quantity: 1,
        optionIds: [f.optionId],
      },
    ],
  };
  const sent = await callFunction<StaffOrderResponse>(waiter, 'submitStaffOrder', request);
  expect(sent).toMatchObject({ ok: true, result: { outcome: 'sent' } });
  expect(await callFunction(waiter, 'submitStaffOrder', request)).toEqual(sent);
  expect(await callFunction<BillResponse>(cashier, 'readBill', seat)).toMatchObject({
    ok: true,
    result: {
      totalMinor: '6400000',
      participants: expect.arrayContaining([
        {
          participantId: id,
          guestNumber: 1,
          totalMinor: '3200000',
          paidMinor: '0',
          outstandingMinor: '3200000',
        },
        {
          participantId: other,
          guestNumber: 2,
          totalMinor: '3200000',
          paidMinor: '0',
          outstandingMinor: '3200000',
        },
      ]),
    },
  });
  expect(await callFunction(cashier, 'submitStaffOrder', request)).toMatchObject({
    ok: false,
    status: 'PERMISSION_DENIED',
  });
});
