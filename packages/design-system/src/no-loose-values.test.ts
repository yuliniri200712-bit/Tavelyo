import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Criterio de aceptación 5 de la Fase 1: ningún color ni tamaño suelto en los componentes.
const here = fileURLToPath(new URL('.', import.meta.url));
const componentFiles = readdirSync(join(here, 'components'))
  .filter((name) => name.endsWith('.tsx') && !name.endsWith('.test.tsx'))
  .map((name) => join(here, 'components', name));
const files = [
  ...componentFiles,
  join(here, 'styles', 'components.css'),
  join(here, 'styles', 'base.css'),
];

const HEX = /#[0-9a-f]{3,8}\b/i;
const PIXELS = /\b\d+(\.\d+)?px\b/;

describe('valores sueltos', () => {
  it.each(files.map((file) => [file.slice(here.length), file]))(
    '%s solo usa tokens',
    (_name, file) => {
      const text = readFileSync(file, 'utf8')
        // Excepción documentada: el patrón estándar para ocultar texto visualmente usa 1px.
        .replace(/\.tv-visually-hidden \{[^}]*\}/, '');
      expect(text).not.toMatch(HEX);
      expect(text).not.toMatch(PIXELS);
    },
  );
});
