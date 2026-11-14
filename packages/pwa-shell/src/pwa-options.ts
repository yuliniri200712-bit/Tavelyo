import type { VitePWAOptions } from 'vite-plugin-pwa';
import { brand } from '@tavelyo/design-system/tokens';

export interface TavelyoAppManifest {
  /** Nombre completo, visible al instalar. */
  readonly name: string;
  /** Nombre corto bajo el icono (≤ 12 caracteres para que no se recorte). */
  readonly shortName: string;
  readonly description: string;
}

/**
 * Solo recursos estáticos del propio build. Nunca respuestas de datos (ADR-0009):
 * no hay `runtimeCaching`, así que las llamadas a Firebase y SQL Connect van siempre a la red.
 */
export const STATIC_PRECACHE_PATTERNS = ['**/*.{js,css,html,svg,png,ttf,woff2}'] as const;

export const THEME_COLOR = brand.cream;

export function pwaOptions(app: TavelyoAppManifest): Partial<VitePWAOptions> {
  return {
    // La persona decide cuándo actualizar (UpdateNotice); nunca se recarga en mitad de un pedido.
    registerType: 'prompt',
    // El registro lo hace la app con `useRegisterSW`, para poder mostrar el aviso.
    injectRegister: false,
    manifest: {
      name: app.name,
      short_name: app.shortName,
      description: app.description,
      lang: 'es',
      dir: 'ltr',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: brand.cream,
      theme_color: THEME_COLOR,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: [...STATIC_PRECACHE_PATTERNS],
      navigateFallback: '/index.html',
      // Rutas reservadas de Firebase Hosting (p. ej. /__/auth) nunca se sirven desde la caché.
      navigateFallbackDenylist: [/^\/__\//],
      cleanupOutdatedCaches: true,
      clientsClaim: false,
      skipWaiting: false,
    },
  };
}
