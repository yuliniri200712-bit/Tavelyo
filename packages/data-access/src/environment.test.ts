import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseFirebaseEnvironment } from './environment.ts';

const valid = {
  VITE_FIREBASE_PROJECT_ID: 'tavelyo-dev',
  VITE_FIREBASE_API_KEY: 'clave-publica',
  VITE_FIREBASE_AUTH_DOMAIN: 'tavelyo-dev.firebaseapp.com',
  VITE_FIREBASE_APP_ID: '1:1:web:1',
  VITE_USE_EMULATORS: 'false',
};

/** Lee .env.example como lo haría Vite: líneas NOMBRE=valor, sin comentarios. */
function readEnvExample(): Record<string, string> {
  const text = readFileSync(new URL('../../../.env.example', import.meta.url), 'utf8');
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .filter((line) => line.trim() !== '' && !line.startsWith('#'))
      .map((line) => {
        const at = line.indexOf('=');
        return [line.slice(0, at), line.slice(at + 1)];
      }),
  );
}

describe('parseFirebaseEnvironment', () => {
  it('acepta una configuración completa', () => {
    const result = parseFirebaseEnvironment(valid);
    expect(result).toEqual({
      ok: true,
      value: {
        projectId: 'tavelyo-dev',
        apiKey: 'clave-publica',
        authDomain: 'tavelyo-dev.firebaseapp.com',
        appId: '1:1:web:1',
        useEmulators: false,
        emulatorHost: '127.0.0.1',
      },
    });
  });

  it('.env.example es válido y apunta a los emuladores', () => {
    const result = parseFirebaseEnvironment(readEnvExample());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.projectId).toBe('demo-tavelyo');
      expect(result.value.useEmulators).toBe(true);
    }
  });

  it('informa de todas las variables que faltan a la vez', () => {
    const result = parseFirebaseEnvironment({});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toHaveLength(4);
  });

  it('rechaza un proyecto demo sin emuladores', () => {
    const result = parseFirebaseEnvironment({ ...valid, VITE_FIREBASE_PROJECT_ID: 'demo-tavelyo' });
    expect(result.ok).toBe(false);
  });

  it('rechaza valores ambiguos del indicador de emuladores', () => {
    const result = parseFirebaseEnvironment({ ...valid, VITE_USE_EMULATORS: 'si' });
    expect(result.ok).toBe(false);
  });

  it('acepta un host de emuladores y rechaza URLs', () => {
    const lan = parseFirebaseEnvironment({ ...valid, VITE_EMULATOR_HOST: '192.168.1.20' });
    expect(lan.ok && lan.value.emulatorHost).toBe('192.168.1.20');
    expect(parseFirebaseEnvironment({ ...valid, VITE_EMULATOR_HOST: 'http://x:9' }).ok).toBe(false);
  });

  it('rechaza variables VITE_* con nombre de secreto', () => {
    const result = parseFirebaseEnvironment({ ...valid, VITE_STRIPE_SECRET_KEY: 'x' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error[0]).toContain('VITE_STRIPE_SECRET_KEY');
  });
});
