// Accesibilidad de las pantallas rediseñadas en la Fase 3B que no cubrían las pruebas de las fases
// 2 y 3: la entrada, el inicio con los módulos en tarjetas y las mesas en tarjetas. axe, 320 px,
// texto al 200 % y teclado. Se ejecuta con `npm run test:e2e:emulators`.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { createUser } from '../../dataconnect/tests/support/emulator.ts';
import { buildFixture } from '../../dataconnect/tests/support/catalog-fixture.ts';
import {
  createProfile,
  provisionTenant,
  seedAuthorizationCatalog,
} from '../../dataconnect/tests/support/provisioning.ts';
import { APPS } from '../../playwright.config.ts';
import { expectReflow, tabTo } from '../support/a11y.ts';
import { openStaffPage } from '../support/orders.ts';

test.describe.configure({ timeout: 180_000 });

async function prepare(testInfo: TestInfo) {
  await seedAuthorizationCatalog();
  const tag = `${testInfo.project.name}-${Date.now().toString(36)}`;
  const owner = await createUser(`e2e-a11y3b-owner-${tag}`);
  await createProfile(owner);
  const tenantName = `Accesible3B ${tag}`;
  const tenant = await provisionTenant(tenantName, owner, ['Centro']);
  await buildFixture(owner, tenant.id, tenant.branches['Centro'] ?? '');
  return { owner, tenantName };
}

async function expectNoAxeViolations(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
}

test('la entrada, el inicio y las mesas en tarjetas: axe, 320 px y texto al 200 %', async ({
  page,
  browser,
}, testInfo) => {
  const { owner, tenantName } = await prepare(testInfo);

  await page.goto(`${APPS.operations}/`);
  const signIn = page.getByRole('heading', { name: 'Acceso del personal' });
  await expect(signIn).toBeVisible({ timeout: 20_000 });
  await expectNoAxeViolations(page);
  await expectReflow(page, 'Entrada', signIn);

  const admin = await openStaffPage(browser, testInfo, owner.email, tenantName);
  try {
    const p = admin.page;
    const modules = p.getByRole('navigation', { name: 'Módulos' });
    await expectNoAxeViolations(p);
    await expectReflow(p, 'Inicio', modules.getByRole('link', { name: 'Mesas y códigos QR' }));

    await modules.getByRole('link', { name: 'Mesas y códigos QR' }).click();
    const m1 = p.getByRole('listitem').filter({ hasText: 'Mesa M1' });
    await m1.getByRole('button', { name: 'Ver QR' }).click();
    const qr = m1.getByRole('img', { name: 'Código QR de la mesa M1' });
    await expect(qr).toBeVisible();
    await expectNoAxeViolations(p);
    await expectReflow(p, 'Mesas con el QR abierto', qr);
  } finally {
    await admin.context.close();
  }
});

test('el inicio y las mesas en tarjetas se usan solo con el teclado', async ({
  browser,
  browserName,
}, testInfo) => {
  test.skip(browserName === 'webkit', 'Safari no enfoca botones con Tab salvo que se active.');
  const { owner, tenantName } = await prepare(testInfo);
  const admin = await openStaffPage(browser, testInfo, owner.email, tenantName);
  try {
    const p = admin.page;
    // La tarjeta del módulo entera es clicable, pero el foco cae en su enlace y Enter lo abre.
    const link = p
      .getByRole('navigation', { name: 'Módulos' })
      .getByRole('link', { name: 'Mesas y códigos QR' });
    await tabTo(p, link);
    await p.keyboard.press('Enter');
    await expect(p.getByRole('heading', { level: 1, name: 'Mesas y códigos QR' })).toBeVisible();

    const showQr = p
      .getByRole('listitem')
      .filter({ hasText: 'Mesa M1' })
      .getByRole('button', { name: 'Ver QR' });
    await tabTo(p, showQr);
    await p.keyboard.press('Enter');
    await expect(p.getByRole('img', { name: 'Código QR de la mesa M1' })).toBeVisible();
    await expect(p.getByRole('button', { name: 'Ocultar QR' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  } finally {
    await admin.context.close();
  }
});
