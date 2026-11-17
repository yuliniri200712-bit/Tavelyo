import { expect, type Page } from '@playwright/test';

/**
 * Espera el aviso de resultado de una acción. Si no aparece, el error incluye el texto visible de
 * la página (p. ej. el motivo de un rechazo del servidor), que en CI queda en la anotación.
 * `timeout` amplía la espera cuando el aviso depende de una función del backend: en el emulador,
 * una llamada a veces tarda varios segundos.
 */
export async function expectNotice(page: Page, text: string, timeout?: number): Promise<void> {
  try {
    await expect(page.getByText(text, { exact: true })).toBeVisible(timeout ? { timeout } : {});
  } catch (error) {
    const visible = await page
      .locator('main')
      .innerText()
      .catch(() => '(sin contenido)');
    throw new Error(
      `${(error as Error).message}\n--- Texto visible de la página ---\n${visible.slice(0, 2000)}`,
      { cause: error },
    );
  }
}
