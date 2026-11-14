import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { pwaOptions, STATIC_PRECACHE_PATTERNS } from './pwa-options.ts';

const options = pwaOptions({
  name: 'Tavelyo Prueba',
  shortName: 'Prueba',
  description: 'App de prueba',
});
const iconsDir = fileURLToPath(new URL('../../../assets/branding/app-icon/', import.meta.url));

/** Ancho y alto de un PNG leyendo la cabecera IHDR. */
function pngSize(file: string): [number, number] {
  const bytes = readFileSync(file);
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

describe('service worker (ADR-0009)', () => {
  it('no cachea respuestas de datos: sin runtimeCaching', () => {
    expect(options.workbox?.runtimeCaching).toBeUndefined();
  });

  it('precachea solo recursos estáticos del build', () => {
    expect(STATIC_PRECACHE_PATTERNS).toEqual(['**/*.{js,css,html,svg,png,ttf,woff2}']);
    expect(options.workbox?.globPatterns).toEqual([...STATIC_PRECACHE_PATTERNS]);
    expect(options.workbox?.globPatterns?.join()).not.toMatch(/json|api|graphql/i);
  });

  it('no intercepta las rutas reservadas de Firebase', () => {
    const denylist = options.workbox?.navigateFallbackDenylist ?? [];
    expect(denylist.some((pattern) => pattern.test('/__/auth/handler'))).toBe(true);
    expect(denylist.some((pattern) => pattern.test('/mesa/4'))).toBe(false);
  });

  it('la actualización espera a que la persona la acepte', () => {
    expect(options.registerType).toBe('prompt');
    expect(options.workbox?.skipWaiting).toBe(false);
    expect(options.workbox?.clientsClaim).toBe(false);
  });
});

describe('manifiesto', () => {
  const manifest = options.manifest;
  if (!manifest) throw new Error('Falta el manifiesto');

  it('es instalable: nombre, inicio, modo standalone y español', () => {
    expect(manifest).toMatchObject({
      name: 'Tavelyo Prueba',
      short_name: 'Prueba',
      start_url: '/',
      display: 'standalone',
      lang: 'es',
    });
  });

  it('declara iconos any y maskable de 192 y 512 px que existen con ese tamaño', () => {
    const icons = manifest.icons ?? [];
    for (const purpose of ['any', 'maskable']) {
      for (const size of [192, 512]) {
        const icon = icons.find((i) => i.purpose === purpose && i.sizes === `${size}x${size}`);
        expect(icon, `${purpose} ${size}`).toBeDefined();
        const file = `${iconsDir}${icon?.src.replace(/^\//, '')}`;
        expect(existsSync(file)).toBe(true);
        expect(pngSize(file)).toEqual([size, size]);
      }
    }
  });

  it('el apple-touch-icon existe a 180 px', () => {
    expect(pngSize(`${iconsDir}apple-touch-icon-180.png`)).toEqual([180, 180]);
  });
});
