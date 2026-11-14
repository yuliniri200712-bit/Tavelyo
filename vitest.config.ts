import { defineConfig } from 'vitest/config';

// Pruebas unitarias. Las de integración (*.int.test.ts) necesitan los emuladores y se
// ejecutan con `npm run test:integration` (vitest.integration.config.ts).
export default defineConfig({
  test: {
    include: [
      'packages/**/src/**/*.test.{ts,tsx}',
      'apps/**/src/**/*.test.{ts,tsx}',
      'tools/**/*.test.ts',
      'backend/src/**/*.test.ts',
      'dataconnect/tests/**/*.test.ts',
    ],
    exclude: ['**/node_modules/**', '**/*.int.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
