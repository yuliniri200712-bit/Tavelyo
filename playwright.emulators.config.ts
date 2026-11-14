import { defineConfig, devices } from '@playwright/test';
import { APPS, EMULATOR_ENV } from './playwright.config.ts';

// Recorridos que necesitan los emuladores de Auth y SQL Connect en marcha.
// Uso: `npm run test:e2e:emulators` (los arranca y los detiene).
export default defineConfig({
  testDir: './e2e/emulators',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  timeout: 90_000,
  use: { trace: 'retain-on-failure' },
  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'safari-iphone', use: { ...devices['iPhone 15'] } },
  ],
  webServer: {
    command: 'npm run build -w @tavelyo/operations && npm run preview -w @tavelyo/operations',
    env: EMULATOR_ENV,
    url: APPS.operations,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
