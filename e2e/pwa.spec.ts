import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { APPS } from '../playwright.config.ts';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const apps = [
  { name: 'menu-web', url: APPS.menuWeb, heading: 'Bienvenido a Tavelyo' },
  { name: 'operations', url: APPS.operations, heading: 'Acceso del personal' },
] as const;

/** Espera a que el service worker esté activo y controle la página. */
async function waitForServiceWorker(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // La primera carga no está controlada; tras recargar sí.
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
    .toBe(true);
}

for (const app of apps) {
  test.describe(app.name, () => {
    test('manifiesto instalable con iconos que existen', async ({ page, request }) => {
      await page.goto(app.url);
      const href = await page.locator('link[rel="manifest"]').getAttribute('href');
      expect(href).toBe('/manifest.webmanifest');
      const manifest = await (await request.get(`${app.url}${href}`)).json();
      expect(manifest).toMatchObject({ display: 'standalone', start_url: '/', lang: 'es' });
      for (const icon of manifest.icons as Array<{ src: string }>) {
        const response = await request.get(`${app.url}${icon.src}`);
        expect(response.status(), icon.src).toBe(200);
        expect(response.headers()['content-type']).toContain('image/png');
      }
    });

    test('sin conexión arranca desde la caché y lo avisa', async ({ page, context }) => {
      await page.goto(app.url);
      await waitForServiceWorker(page);
      await context.setOffline(true);
      await page.reload();
      await expect(page.getByRole('heading', { name: app.heading })).toBeVisible();
      await expect(page.getByText('ningún pedido ni pago se confirma')).toBeVisible();
      await context.setOffline(false);
    });

    test('el service worker no responde peticiones de datos', async ({ page }) => {
      await page.goto(app.url);
      await waitForServiceWorker(page);
      // Una petición que no es del build (como las de Firebase) no está en la caché del SW.
      const cachedDataUrls = await page.evaluate(async () => {
        const urls: string[] = [];
        for (const name of await caches.keys()) {
          const cache = await caches.open(name);
          for (const request of await cache.keys()) urls.push(new URL(request.url).pathname);
        }
        return urls.filter(
          (path) => !/\.(js|css|html|svg|png|ttf|woff2|webmanifest)$/.test(path) && path !== '/',
        );
      });
      expect(cachedDataUrls).toEqual([]);
    });

    test('sin infracciones de axe (WCAG 2.2 A y AA)', async ({ page }) => {
      await page.goto(app.url);
      await expect(page.getByRole('heading', { name: app.heading })).toBeVisible();
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(results.violations).toEqual([]);
    });

    test('el primer Tab lleva al enlace para saltar al contenido', async ({
      page,
      browserName,
    }) => {
      test.skip(
        browserName === 'webkit',
        'Safari no enfoca enlaces con Tab salvo que el usuario lo active.',
      );
      await page.goto(app.url);
      await page.keyboard.press('Tab');
      const skip = page.getByRole('link', { name: 'Saltar al contenido' });
      await expect(skip).toBeFocused();
      await expect(skip).toBeInViewport();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('main')).toBeFocused();
    });

    test('a 320 px de ancho no hay desplazamiento horizontal (reflow)', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await page.goto(app.url);
      await expect(page.getByRole('heading', { name: app.heading })).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}

test.describe('catálogo del sistema de diseño (operations)', () => {
  test('sin infracciones de axe', async ({ page }) => {
    await page.goto(`${APPS.operations}/catalogo`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test('con el texto al 200 % no hay desplazamiento horizontal a 640 px', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 900 });
    await page.goto(`${APPS.operations}/catalogo`);
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('diálogo destructivo: modal, foco en «Cancelar» y Escape lo cierra', async ({ page }) => {
    await page.goto(`${APPS.operations}/catalogo`);
    const trigger = page.getByRole('button', { name: 'Anular pedido 18' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: '¿Anular el pedido 18?' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeFocused();
    // Fondo inerte: con Tab el foco nunca sale a la página de detrás (puede ir a la barra del navegador).
    for (let i = 0; i < 4; i += 1) {
      await page.keyboard.press('Tab');
      const focusOutside = await page.evaluate(() => {
        const active = document.activeElement;
        const modal = document.querySelector('dialog[open]');
        return active !== null && active !== document.body && !modal?.contains(active);
      });
      expect(focusOutside).toBe(false);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});
