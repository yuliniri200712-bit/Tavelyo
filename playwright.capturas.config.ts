import { defineConfig, devices } from '@playwright/test';
import { APPS, EMULATOR_ENV } from './playwright.config.ts';

// Capturas con datos fijos para revisar el diseño (Fase 3B, IV §13.5). No corre en CI: necesita
// los emuladores en marcha. Uso: `npm run capturas -- --output=capturas/<etiqueta>`. Van fuera de
// `test-results`, que Playwright vacía al empezar cualquier otra ejecución.
export default defineConfig({
  testDir: './e2e/capturas',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  outputDir: 'capturas/ultima',
  use: { screenshot: 'only-on-failure' },
  timeout: 240_000,
  projects: [
    { name: 'movil', use: { ...devices['Pixel 7'] } },
    {
      name: 'escritorio',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
  ],
  webServer: [
    {
      command: 'npm run build -w @tavelyo/menu-web && npm run preview -w @tavelyo/menu-web',
      env: EMULATOR_ENV,
      url: APPS.menuWeb,
      reuseExistingServer: false,
      timeout: 180_000,
    },
    {
      command: 'npm run build -w @tavelyo/operations && npm run preview -w @tavelyo/operations',
      env: EMULATOR_ENV,
      url: APPS.operations,
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
