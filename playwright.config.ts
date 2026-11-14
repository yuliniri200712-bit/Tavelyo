import { defineConfig, devices } from '@playwright/test';

// Matriz de navegadores D-15. Chrome y Edge usan los navegadores instalados (canales);
// WebKit cubre Safari de escritorio y, con emulación de iPhone, Safari en iOS.
// Las apps se compilan y se sirven con `vite preview` (build de producción con service worker).
export const APPS = {
  menuWeb: 'http://localhost:6173',
  operations: 'http://localhost:6174',
} as const;

const isCI = Boolean(process.env['CI']);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: [['list']],
  use: {
    trace: 'retain-on-failure',
    serviceWorkers: 'allow',
  },
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
      url: APPS.menuWeb,
      reuseExistingServer: !isCI,
      timeout: 180_000,
    },
    {
      command: 'npm run build -w @tavelyo/operations && npm run preview -w @tavelyo/operations',
      url: APPS.operations,
      reuseExistingServer: !isCI,
      timeout: 180_000,
    },
  ],
});
