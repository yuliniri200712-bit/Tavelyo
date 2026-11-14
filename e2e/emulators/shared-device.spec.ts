// Política de dispositivos compartidos (D-19, D-20) en navegador real contra los emuladores:
// sesión por pestaña con «Equipo compartido» y cierre de sesión tras 15 minutos sin uso.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { APPS } from '../../playwright.config.ts';
import {
  createUser,
  TEST_PASSWORD,
  type TestUser,
} from '../../dataconnect/tests/support/emulator.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
} from '../../dataconnect/tests/support/provisioning.ts';

async function staffMember(label: string): Promise<{ user: TestUser; heading: string }> {
  await seedAuthorizationCatalog();
  const tag = `${label}-${Date.now().toString(36)}`;
  const owner = await createUser(`sd-owner-${tag}`);
  const user = await createUser(`sd-waiter-${tag}`);
  await createProfile(owner);
  await createProfile(user);
  const name = `La Fonda ${tag}`;
  const tenant = await provisionTenant(name, owner, ['Centro']);
  await insertMembership(tenant.id, user, 'waiter', [tenant.branches['Centro'] ?? '']);
  return { user, heading: `${name} · Centro` };
}

async function signIn(page: Page, user: TestUser, { shared }: { shared: boolean }) {
  await page.getByLabel('Correo').fill(user.email);
  await page.getByLabel('Contraseña').fill(TEST_PASSWORD);
  const box = page.getByRole('checkbox', { name: 'Equipo compartido' });
  await expect(box).toBeChecked();
  if (!shared) await box.uncheck();
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
}

const signInHeading = (page: Page) => page.getByRole('heading', { name: 'Acceso del personal' });

test('equipo compartido: la sesión no pasa a otra pestaña; en un teléfono propio, sí', async ({
  page,
  context,
}, testInfo) => {
  const { user, heading } = await staffMember(testInfo.project.name);

  await page.goto(`${APPS.operations}/`);
  await signIn(page, user, { shared: true });
  await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  // Recargar la misma pestaña conserva la sesión.
  await page.reload();
  await expect(page.getByRole('heading', { name: heading })).toBeVisible();

  const otherTab = await context.newPage();
  await otherTab.goto(`${APPS.operations}/`);
  await expect(signInHeading(otherTab)).toBeVisible();
  await otherTab.close();

  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await signIn(page, user, { shared: false });
  const personalTab = await context.newPage();
  await personalTab.goto(`${APPS.operations}/`);
  await expect(personalTab.getByRole('heading', { name: heading })).toBeVisible();
  await personalTab.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(signInHeading(personalTab)).toBeVisible();
});

test('15 minutos sin uso: avisa en el minuto 14 y cierra la sesión', async ({ page }, testInfo) => {
  const { user, heading } = await staffMember(`${testInfo.project.name}-inactividad`);
  await page.clock.install();
  await page.goto(`${APPS.operations}/`);
  await signIn(page, user, { shared: true });
  await expect(page.getByRole('heading', { name: heading })).toBeVisible();

  // Aviso: modal accesible con el foco en «Seguir trabajando».
  await page.clock.fastForward('14:01');
  const warning = page.getByRole('dialog', { name: '¿Sigues ahí?' });
  await expect(warning).toBeVisible();
  await expect(page.getByRole('button', { name: 'Seguir trabajando' })).toBeFocused();
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze())
      .violations,
  ).toEqual([]);

  // Seguir trabajando reinicia el plazo y conserva el contexto.
  await page.getByRole('button', { name: 'Seguir trabajando' }).click();
  await expect(warning).toBeHidden();
  await page.clock.fastForward('13:00');
  await expect(warning).toBeHidden();
  await expect(page.getByRole('heading', { name: heading })).toBeVisible();

  // Sin respuesta: se cierra la sesión y el acceso explica por qué.
  await page.clock.fastForward('02:05');
  await expect(signInHeading(page)).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: '15 minutos sin uso' })).toBeVisible();
  await expect(page.getByText(heading)).toHaveCount(0);
  await page.reload();
  await expect(signInHeading(page)).toBeVisible();
});
