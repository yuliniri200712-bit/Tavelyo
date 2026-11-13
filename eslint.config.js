// Análisis estático del monorepo (ADR-0010).
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/dataconnect-generated/**',
      'dataconnect/.dataconnect/**',
      'spike/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    rules: {
      // Los módulos se comunican por su API pública, nunca por sus internos (ADR-0010).
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@tavelyo/*/src/*', '@tavelyo/*/*/src/*'],
              message: 'Importa la API pública del paquete, no sus archivos internos.',
            },
          ],
        },
      ],
    },
  },
);
