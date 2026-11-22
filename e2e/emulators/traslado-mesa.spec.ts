import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { buildFixture } from '../../dataconnect/tests/support/catalog-fixture.ts';
import {
  admin,
  createAnonymousUser,
  createUser,
  expectOk,
  mutate,
  query,
} from '../../dataconnect/tests/support/emulator.ts';
import {
  createProfile,
  provisionTenant,
  seedAuthorizationCatalog,
  insertMembership,
} from '../../dataconnect/tests/support/provisioning.ts';
import { callFunction } from '../../backend/tests/support/functions.ts';
import { signInStaff } from '../support/orders.ts';
import type {
  BillResponse,
  JoinTableSessionResponse,
  StaffOrderResponse,
} from '@tavelyo/contracts';

// Parte 6c (D-42): traslado de la sesión a una mesa libre de la misma sucursal, con su cuenta.
test('el mesero traslada la sesión a una mesa libre y la cuenta pasa con ella', async ({
  page,
}, info) => {
  test.slow();
  const tag = info.project.name + '-' + Date.now().toString(36);
  await seedAuthorizationCatalog();
  const owner = await createUser('traslado-owner-' + tag);
  const waiter = await createUser('traslado-mesero-' + tag);
  const cashier = await createUser('traslado-caja-' + tag);
  for (const u of [owner, waiter, cashier]) await createProfile(u);
  const tenant = await provisionTenant('Traslado ' + tag, owner, ['Centro']);
  const branchId = tenant.branches['Centro'] ?? '';
  const scope = { tenantId: tenant.id, branchId };
  await insertMembership(tenant.id, waiter, 'waiter', [branchId]);
  await insertMembership(tenant.id, cashier, 'cashier', [branchId]);
  const f = await buildFixture(owner, tenant.id, branchId);
  const dest = expectOk(
    await mutate<{ diningTable_insert: { id: string } }>(owner, 'CreateTable', {
      ...scope,
      sectorId: f.sectorId,
      code: 'M2',
      seats: 4,
    }),
    'Crear destino',
  ).diningTable_insert.id;
  const session = expectOk(
    await mutate<{ tableSession_insert: { id: string } }>(waiter, 'OpenTableSession', {
      ...scope,
      tableId: f.tableId,
    }),
    'Abrir mesa',
  ).tableSession_insert.id;
  const seat = { ...scope, sessionId: session };
  // Un pedido del mesero en la mesa de origen, para trasladar una cuenta con consumo.
  const person = expectOk(
    await mutate<{ sessionParticipant_insert: { id: string } }>(waiter, 'AddTableGuest', {
      ...seat,
      number: 1,
    }),
    'Persona sin teléfono',
  ).sessionParticipant_insert.id;
  const menu = expectOk(
    await query<{ branch: { productBranches_on_branch: { currentPrice: { id: string } }[] } }>(
      waiter,
      'StaffOrderDesk',
      seat,
    ),
    'Carta',
  );
  expect(
    await callFunction<StaffOrderResponse>(waiter, 'submitStaffOrder', {
      ...seat,
      participantId: person,
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
    }),
  ).toMatchObject({ ok: true, result: { outcome: 'sent' } });
  // Un comensal con teléfono se unió desde el QR de la mesa de origen.
  const oldQr = expectOk(
    await admin<{ diningTable: { qrPublicId: string } }>(
      'query ($id: UUID!) { diningTable(id: $id) { qrPublicId } }',
      { id: f.tableId },
    ),
    'QR de origen',
  ).diningTable.qrPublicId;
  const diner = await createAnonymousUser('traslado-cliente-' + tag);
  const joined = await callFunction<JoinTableSessionResponse>(diner, 'joinTableSession', {
    qrPublicId: oldQr,
  });
  expect(joined).toMatchObject({ ok: true, result: { tableCode: 'M1' } });
  const bill = await callFunction<BillResponse>(cashier, 'readBill', seat);
  expect(bill).toMatchObject({ ok: true, result: { totalMinor: '3200000' } });

  await signInStaff(page, waiter.email);
  await page.getByRole('link', { name: 'Salón', exact: true }).click();
  await page.getByRole('button', { name: 'Trasladar mesa' }).click();
  const transfer = page.getByRole('dialog', { name: 'Trasladar mesa M1' });
  await transfer.getByLabel('Mesa de destino').selectOption(dest);
  await transfer.getByRole('button', { name: 'Confirmar traslado' }).click();
  await expect(page.getByText('Sesión trasladada a la mesa M2.')).toBeVisible();
  const moved = page
    .getByRole('listitem')
    .filter({ has: page.getByText('Mesa M2', { exact: true }) });
  await expect(moved.getByText('1 línea en cocina')).toBeVisible();
  expect(await callFunction<BillResponse>(cashier, 'readBill', seat)).toEqual(bill);
  // Al recargar con el QR viejo, el comensal llega a su sesión en la mesa nueva.
  expect(
    await callFunction<JoinTableSessionResponse>(diner, 'joinTableSession', { qrPublicId: oldQr }),
  ).toMatchObject({
    ok: true,
    result: {
      sessionId: joined.ok ? joined.result.sessionId : '',
      tableCode: 'M2',
      transferred: true,
    },
  });
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(audit.violations).toEqual([]);

  // Repetir el traslado desde la mesa de origen ya no procede.
  const stale = await mutate(waiter, 'TransferTableSession', {
    ...seat,
    sourceId: f.tableId,
    tableId: dest,
  });
  expect(stale.errors?.length).toBeTruthy();
});
