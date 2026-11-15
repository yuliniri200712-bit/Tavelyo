import { describe, expect, it } from 'vitest';
import { LOCAL_MENU_WEB_URL, parseMenuWebUrl } from './composition.ts';

describe('dirección de la carta para el QR', () => {
  it('con emuladores usa menu-web local si no se indica', () => {
    expect(parseMenuWebUrl({}, true)).toBe(LOCAL_MENU_WEB_URL);
    expect(parseMenuWebUrl({}, false)).toBeNull();
  });

  it('exige https salvo en este equipo y quita la barra final', () => {
    expect(parseMenuWebUrl({ VITE_MENU_WEB_URL: 'https://carta.tavelyo.co/' }, false)).toBe(
      'https://carta.tavelyo.co',
    );
    expect(parseMenuWebUrl({ VITE_MENU_WEB_URL: 'http://localhost:6173' }, false)).toBe(
      'http://localhost:6173',
    );
    for (const value of [
      'http://carta.tavelyo.co',
      'javascript:alert(1)',
      'https://carta.tavelyo.co/?x=1',
      'https://usuario:clave@carta.tavelyo.co',
      'no es una dirección',
    ]) {
      expect(parseMenuWebUrl({ VITE_MENU_WEB_URL: value }, false), value).toBeNull();
    }
  });
});
