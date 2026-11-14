// Actualización controlada de la PWA entre dos versiones reales del build (ADR-0009): la versión
// nueva se avisa, nunca se aplica sola y se instala solo cuando la persona pulsa «Actualizar».
import { expect, test, type Page } from '@playwright/test';
import { startStaticServer, type StaticServer } from './support/static-server.ts';
import { UPDATE_BUILDS } from './support/update-builds.ts';

let server: StaticServer;

test.beforeEach(async () => {
  server = await startStaticServer(UPDATE_BUILDS.a);
});

test.afterEach(async () => {
  await server.close();
});

/** Versión servida (meta de index.html); la aserción reintenta aunque la página se recargue. */
const expectVersion = (page: Page, version: 'prueba-a' | 'prueba-b') =>
  expect(page.locator('meta[name="tavelyo-build"]')).toHaveAttribute('content', version);

const notice = (page: Page) =>
  page.getByRole('status').filter({ hasText: 'Hay una nueva versión de Tavelyo disponible.' });

/** Abre la versión A y espera a que su service worker controle la página. */
async function openVersionA(page: Page): Promise<void> {
  await page.goto(server.url);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
    .toBe(true);
  await expectVersion(page, 'prueba-a');
  await expect(notice(page)).toHaveCount(0);
}

/** Publica la versión B y hace la comprobación que el navegador hace al navegar. */
async function deployVersionB(page: Page): Promise<void> {
  server.serve(UPDATE_BUILDS.b);
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration?.update();
  });
}

test('nueva versión: se avisa, no se fuerza y se instala al pulsar «Actualizar»', async ({
  page,
}) => {
  await openVersionA(page);
  await deployVersionB(page);

  await expect(notice(page)).toBeVisible();
  // Mientras la persona no decide, sigue en la versión que estaba usando.
  await expectVersion(page, 'prueba-a');
  await expect(page.getByRole('heading', { name: 'Acceso del personal' })).toBeVisible();

  await notice(page).getByRole('button', { name: 'Actualizar' }).click();
  await expectVersion(page, 'prueba-b');
  await expect(page.getByRole('heading', { name: 'Acceso del personal' })).toBeVisible();
  await expect(notice(page)).toHaveCount(0);
});

test('«Más tarde» conserva la versión actual, también al recargar, y vuelve a avisar', async ({
  page,
}) => {
  await openVersionA(page);
  await deployVersionB(page);
  await expect(notice(page)).toBeVisible();

  await notice(page).getByRole('button', { name: 'Más tarde' }).click();
  await expect(notice(page)).toHaveCount(0);
  await expectVersion(page, 'prueba-a');

  // La versión nueva espera: recargar no la impone, pero el aviso vuelve a aparecer.
  await page.reload();
  await expectVersion(page, 'prueba-a');
  await expect(notice(page)).toBeVisible();
});
