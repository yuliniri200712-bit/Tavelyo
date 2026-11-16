import { defineConfig, devices } from '@playwright/test';
import { APPS, EMULATOR_ENV } from './playwright.config.ts';

// Recorridos que necesitan los emuladores de Auth, SQL Connect y Cloud Functions en marcha.
// Uso: `npm run test:e2e:emulators` (los arranca y los detiene).
export default defineConfig({
  testDir: './e2e/emulators',
  fullyParallel: false,
  workers: 1,
  // En CI, cada fallo se publica además como anotación de GitHub (visible sin permisos de admin).
  reporter: process.env['CI'] ? [['list'], ['github']] : [['list']],
  timeout: 90_000,
  use: { trace: 'retain-on-failure' },
  // Matriz D-15 completa, como los recorridos sin datos (playwright.config.ts).
  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
    { name: 'safari-escritorio', use: { ...devices['Desktop Safari'] } },
    { name: 'chrome-android', use: { ...devices['Pixel 7'] } },
    { name: 'safari-iphone', use: { ...devices['iPhone 15'] } },
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
