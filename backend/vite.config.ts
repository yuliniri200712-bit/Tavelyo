import { defineConfig } from 'vite';

// Empaqueta el backend en lib/index.js (ESM para Node 24). Los paquetes del monorepo
// (@tavelyo/core, contracts, identity/application) se incluyen en el paquete; el Admin SDK y
// firebase-functions quedan como dependencias externas que instala Cloud Functions.
export default defineConfig({
  build: {
    ssr: 'src/index.ts',
    outDir: 'lib',
    emptyOutDir: true,
    target: 'node24',
    sourcemap: true,
    rolldownOptions: {
      external: [/^firebase-admin(\/|$)/, /^firebase-functions(\/|$)/],
      output: { format: 'es', entryFileNames: 'index.js' },
    },
  },
});
