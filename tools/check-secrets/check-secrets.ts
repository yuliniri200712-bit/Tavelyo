// Búsqueda de secretos (Fase 1, bloque 3). Revisa los archivos versionados y, si existen, los
// builds de las PWA (código que llega al navegador) y del backend. Uso: node tools/check-secrets/check-secrets.ts
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { findSecrets, type SecretFinding } from './patterns.ts';

const BINARY = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.ico',
  '.ttf',
  '.woff',
  '.woff2',
  '.pdf',
]);
// Estos archivos describen los patrones a propósito.
const SELF = new Set(['tools/check-secrets/patterns.ts', 'tools/check-secrets/patterns.test.ts']);

function trackedFiles(): string[] {
  return execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
    .split('\0')
    .filter((file) => file && !SELF.has(file) && !BINARY.has(extname(file).toLowerCase()));
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function buildFiles(): string[] {
  return ['apps/menu-web/dist', 'apps/operations/dist', 'backend/lib']
    .filter((dir) => existsSync(dir))
    .flatMap(walk)
    .filter((file) => !BINARY.has(extname(file).toLowerCase()));
}

const files = [...trackedFiles(), ...buildFiles()];
const findings: SecretFinding[] = files.flatMap((file) =>
  existsSync(file) ? findSecrets(file, readFileSync(file, 'utf8')) : [],
);

if (findings.length > 0) {
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line} · ${finding.kind}`);
  }
  console.error(
    `\n${findings.length} posible(s) secreto(s). Muévelos a .env.local o a Secret Manager.`,
  );
  process.exit(1);
}
console.log(`Sin secretos en ${files.length} archivos revisados.`);
