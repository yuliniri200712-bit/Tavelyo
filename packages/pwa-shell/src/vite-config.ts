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

/** Sustituye `%TAVELYO_THEME_COLOR%` en index.html por el token, sin HEX sueltos. */
function themeColorPlugin(): Plugin {
  return {
    name: 'tavelyo-theme-color',
    transformIndexHtml: (html) => html.replaceAll('%TAVELYO_THEME_COLOR%', THEME_COLOR),
  };
}

/** Configuración de Vite común a `menu-web` y `operations`. */
export function tavelyoViteConfig(app: TavelyoAppConfig): UserConfig {
  return {
    plugins: [react(), themeColorPlugin(), VitePWA(pwaOptions(app))],
    publicDir: BRAND_ICONS_DIR,
    envDir: REPO_ROOT,
    server: { port: app.port, strictPort: true },
    preview: { port: app.port + 1000, strictPort: true },
    build: { sourcemap: true },
  };
}
