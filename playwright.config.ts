import { defineConfig, devices } from '@playwright/test';

// Matriz de navegadores D-15. Chrome y Edge usan los navegadores instalados (canales);
// WebKit cubre Safari de escritorio y, con emulación de iPhone, Safari en iOS.
// Las apps se compilan y se sirven con `vite preview` (build de producción con service worker).
export const APPS = {
  menuWeb: 'http://localhost:6173',
  operations: 'http://localhost:6174',
} as const;

const isCI = Boolean(process.env['CI']);

/** Configuración pública del proyecto demo (solo emuladores). Ver .env.example. */
export const EMULATOR_ENV = {
  VITE_FIREBASE_PROJECT_ID: 'demo-tavelyo',
  VITE_FIREBASE_API_KEY: 'demo-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'demo-tavelyo.firebaseapp.com',
  VITE_FIREBASE_APP_ID: '1:000000000000:web:0000000000000000000000',
  VITE_USE_EMULATORS: 'true',
};

export default defineConfig({
  testDir: './e2e',
  testIgnore: '**/emulators/**',
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
      env: EMULATOR_ENV,
      url: APPS.operations,
      reuseExistingServer: !isCI,
      timeout: 180_000,
    },
  ],
});
