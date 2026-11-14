import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import type { Plugin, UserConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { pwaOptions, THEME_COLOR, type TavelyoAppManifest } from './pwa-options.ts';

export interface TavelyoAppConfig extends TavelyoAppManifest {
  readonly port: number;
}

/** Iconos derivados del logotipo aprobado; se sirven en la raíz de cada app. */
const BRAND_ICONS_DIR = fileURLToPath(
  new URL('../../../assets/branding/app-icon', import.meta.url),
);

/** Un único `.env.local` en la raíz del repositorio sirve a las dos apps (ver `.env.example`). */
const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

const BUILD_ID = /^[\w.-]{1,64}$/;

/**
 * Identificador de la versión publicada (p. ej. el commit), en TAVELYO_BUILD_ID; «local» si no
 * se indica o está vacía. Va en index.html, así que cada versión distinta genera un service worker nuevo.
 */
export function buildId(env: NodeJS.ProcessEnv = process.env): string {
  // Vacía equivale a no indicada (habitual en CI).
  const value = env['TAVELYO_BUILD_ID'] || 'local';
  if (!BUILD_ID.test(value)) {
    throw new Error('TAVELYO_BUILD_ID solo admite letras, cifras, «.», «_» y «-» (máx. 64).');
  }
  return value;
}

/** Sustituye en index.html el color del tema (token, sin HEX sueltos) y la versión. */
function indexHtmlPlugin(): Plugin {
  return {
    name: 'tavelyo-index-html',
    transformIndexHtml: (html) =>
      html
        .replaceAll('%TAVELYO_THEME_COLOR%', THEME_COLOR)
        .replaceAll('%TAVELYO_BUILD_ID%', buildId()),
  };
}

/** Configuración de Vite común a `menu-web` y `operations`. */
export function tavelyoViteConfig(app: TavelyoAppConfig): UserConfig {
  return {
    plugins: [react(), indexHtmlPlugin(), VitePWA(pwaOptions(app))],
    publicDir: BRAND_ICONS_DIR,
    envDir: REPO_ROOT,
    server: { port: app.port, strictPort: true },
    preview: { port: app.port + 1000, strictPort: true },
    build: { sourcemap: true },
  };
}
