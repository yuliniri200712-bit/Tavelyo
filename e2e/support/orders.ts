// Pasos compartidos de los recorridos de pedidos (Fase 3): entrar como personal y pedir como cliente.
import { randomUUID } from 'node:crypto';
import {
  expect,
  type Browser,
  type BrowserContext,
  type Page,
  type TestInfo,
} from '@playwright/test';
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

/**
 * Espera de un aviso que depende de una función del backend. En el emulador en Docker, una llamada
 * desde el navegador a veces arranca un proceso nuevo de la función y tarda hasta unos 25 s.
 */
export const FUNCTION_WAIT = 60_000;

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

/**
 * Una persona del personal en su propio navegador (contexto aislado, como otro equipo), con el
 * mismo dispositivo que el proyecto de Playwright (escritorio o móvil).
 */
export async function openStaffPage(
  browser: Browser,
  testInfo: TestInfo,
  email: string,
  tenantName: string,
): Promise<{ context: BrowserContext; page: Page }> {
  const { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch } = testInfo.project.use;
  const options = Object.fromEntries(
    Object.entries({ viewport, userAgent, deviceScaleFactor, isMobile, hasTouch }).filter(
      ([, value]) => value !== undefined,
    ),
  );
  const context = await browser.newContext(options);
  const page = await context.newPage();
  await signInStaff(page, email);
  // Con varios navegadores abiertos a la vez, entrar puede tardar más de lo habitual.
  await expect(page.getByRole('heading', { name: `${tenantName} · Centro` })).toBeVisible({
    timeout: 30_000,
  });
  return { context, page };
}

/** Nombre accesible con importes: Intl separa «$» del número con un espacio duro. */
export const named = (text: string) =>
  new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s')}$`);

/** El cliente pide una bandeja bien asada desde la carta, autoriza y la envía a cocina. */
export async function orderFromMenu(page: Page, fixture: Fixture): Promise<void> {
  await page.goto(`${APPS.menuWeb}/mesa/${fixture.qrPublicId}`);
  await page.getByRole('button', { name: 'Agregar Bandeja paisa' }).click({ timeout: 15_000 });
  const form = page.getByRole('form', { name: 'Elegir Bandeja paisa' });
  await form.getByLabel('Bien asada').check();
  await form.getByRole('button', { name: named('Agregar al pedido · $ 32.000') }).click();
  await page.getByRole('link', { name: named('Ver mi pedido · 1 producto · $ 32.000') }).click();
  await page.getByRole('button', { name: 'Revisar pedido' }).click();
  const pay = page.getByRole('button', { name: named('Autorizar y enviar a cocina · $ 32.000') });
  // La primera llamada al backend puede tardar (arranque en frío de las funciones).
  await pay.click({ timeout: FUNCTION_WAIT });
  await expect(page.getByRole('heading', { name: 'Pedido enviado a cocina' })).toBeVisible({
    timeout: FUNCTION_WAIT,
  });
}
