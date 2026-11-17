// Ayudas de accesibilidad para los recorridos con navegador: teclado y texto ampliado.
import { expect, type Locator, type Page } from '@playwright/test';

/** Avanza con Tab hasta que el elemento tenga el foco (falla si no llega). */
export async function tabTo(page: Page, target: Locator, maxPresses = 80) {
  for (let i = 0; i < maxPresses; i += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return;
    await page.keyboard.press('Tab');
  }
  throw new Error(`El foco no llegó con Tab a: ${target.toString()}`);
}

/**
 * Sin desplazamiento horizontal a 320 px (reflow, WCAG 1.4.10) ni con el texto al 200 % a 640 px
 * (WCAG 1.4.4). `ready` es algo visible que indica que la pantalla terminó de cargar.
 */
export async function expectReflow(page: Page, screen: string, ready: Locator) {
  for (const { width, fontSize } of [
    { width: 320, fontSize: '100%' },
    { width: 640, fontSize: '200%' },
  ]) {
    await page.setViewportSize({ width, height: 800 });
    await page.evaluate((size) => {
      document.documentElement.style.fontSize = size;
    }, fontSize);
    await expect(ready).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `${screen} a ${width} px con el texto al ${fontSize}`).toBeLessThanOrEqual(0);
  }
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '';
  });
}
