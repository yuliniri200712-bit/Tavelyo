// Dos versiones del build de operations para la prueba de actualización de la PWA. Se compilan
// una vez antes de las pruebas (globalSetup), fuera del repositorio y en procesos aparte para no
// alterar el entorno de los servidores de Playwright.
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EMULATOR_ENV } from '../../playwright.config.ts';

export const UPDATE_BUILDS = {
  a: join(tmpdir(), 'tavelyo-pwa-update', 'a'),
  b: join(tmpdir(), 'tavelyo-pwa-update', 'b'),
} as const;

const OPERATIONS = fileURLToPath(new URL('../../apps/operations/', import.meta.url));
const VITE = fileURLToPath(new URL('../../node_modules/vite/bin/vite.js', import.meta.url));

export default function buildUpdateVersions(): void {
  for (const [version, outDir] of Object.entries(UPDATE_BUILDS)) {
    execFileSync(
      process.execPath,
      [VITE, 'build', '--outDir', outDir, '--emptyOutDir', '--logLevel', 'warn'],
      {
        cwd: OPERATIONS,
        env: { ...process.env, ...EMULATOR_ENV, TAVELYO_BUILD_ID: `prueba-${version}` },
        stdio: 'inherit',
      },
    );
  }
}
