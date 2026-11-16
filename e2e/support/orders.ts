// Pasos compartidos de los recorridos de pedidos (Fase 3): entrar como personal y pedir como cliente.
import { randomUUID } from 'node:crypto';
import type { Page } from '@playwright/test';
import { PREAUTHORIZATION_CONSENT_VERSION, type QuoteOrderResponse } from '@tavelyo/contracts';
import { APPS } from '../../playwright.config.ts';
import { callFunction } from '../../backend/tests/support/functions.ts';
import {
  createAnonymousUser,
  expectOk,
  query,
  TEST_PASSWORD,
  type TestUser,
} from '../../dataconnect/tests/support/emulator.ts';
import {
  FIXTURE_PRICE_MINOR,
  type Fixture,
} from '../../dataconnect/tests/support/catalog-fixture.ts';

export async function signInStaff(page: Page, email: string): Promise<void> {
  await page.goto(`${APPS.operations}/`);
  await page.getByLabel('Correo').fill(email);
  await page.getByLabel('Contraseña').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

export interface SeatedCustomer {
  readonly user: TestUser;
  readonly sessionId: string;
}

/** Un cliente se une a la mesa, revisa y autoriza: el backend envía el pedido a cocina. */
export async function customerOrders(
  fixture: Fixture,
  owner: TestUser,
  label: string,
  quantity: number,
): Promise<SeatedCustomer> {
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
  return { user: customer, sessionId: joined.result.sessionId };
}
