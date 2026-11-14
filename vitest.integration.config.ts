import { defineConfig } from 'vitest/config';

// Pruebas de integración contra los emuladores de Auth, SQL Connect y Cloud Functions (backend).
// Se ejecutan con `npm run test:integration`, que arranca y detiene los emuladores.
export default defineConfig({
  test: {
    include: ['dataconnect/tests/**/*.int.test.ts', 'backend/tests/**/*.int.test.ts'],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
