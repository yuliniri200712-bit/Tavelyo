import { err, ok, type Result } from '@tavelyo/core';

/** Configuración pública de Firebase para el navegador (no contiene secretos). */
export interface FirebaseEnvironment {
  readonly projectId: string;
  readonly apiKey: string;
  readonly authDomain: string;
  readonly appId: string;
  /** Auth y SQL Connect apuntan a los emuladores locales. */
  readonly useEmulators: boolean;
  /** Host de los emuladores (127.0.0.1 por defecto; la IP del equipo para probar desde un teléfono). */
  readonly emulatorHost: string;
}

export type RawEnvironment = Readonly<Record<string, string | boolean | undefined>>;

type RequiredName =
  | 'VITE_FIREBASE_PROJECT_ID'
  | 'VITE_FIREBASE_API_KEY'
  | 'VITE_FIREBASE_AUTH_DOMAIN'
  | 'VITE_FIREBASE_APP_ID';

/** Nombres que delatan un secreto de servidor en variables que llegan al navegador. */
const FORBIDDEN_NAME = /SECRET|PRIVATE|PASSWORD|SERVICE_ACCOUNT|DATABASE_URL|GATEWAY_KEY/i;

/**
 * Lee y valida `import.meta.env`. Devuelve todos los problemas juntos para que el
 * arranque falle con un mensaje claro en lugar de conectarse a un proyecto equivocado.
 */
export function parseFirebaseEnvironment(
  env: RawEnvironment,
): Result<FirebaseEnvironment, string[]> {
  const problems: string[] = [];
  const read = (name: RequiredName): string => {
    const value = env[name];
    if (typeof value !== 'string' || value.trim() === '') {
      problems.push(`Falta ${name} (ver .env.example).`);
      return '';
    }
    return value.trim();
  };

  const projectId = read('VITE_FIREBASE_PROJECT_ID');
  const apiKey = read('VITE_FIREBASE_API_KEY');
  const authDomain = read('VITE_FIREBASE_AUTH_DOMAIN');
  const appId = read('VITE_FIREBASE_APP_ID');

  const emulatorsFlag = env['VITE_USE_EMULATORS'];
  if (emulatorsFlag !== undefined && !['true', 'false', true, false].includes(emulatorsFlag)) {
    problems.push('VITE_USE_EMULATORS debe ser «true» o «false».');
  }
  const useEmulators = emulatorsFlag === 'true' || emulatorsFlag === true;

  const rawHost = env['VITE_EMULATOR_HOST'];
  const emulatorHost =
    typeof rawHost === 'string' && rawHost.trim() !== '' ? rawHost.trim() : '127.0.0.1';
  if (!/^[\w.-]+$/.test(emulatorHost)) {
    problems.push(
      'VITE_EMULATOR_HOST debe ser un nombre de equipo o una IP, sin protocolo ni puerto.',
    );
  }

  if (projectId.startsWith('demo-') && !useEmulators) {
    problems.push(
      'Los proyectos «demo-*» solo funcionan con emuladores: usa VITE_USE_EMULATORS=true.',
    );
  }

  for (const name of Object.keys(env)) {
    if (name.startsWith('VITE_') && FORBIDDEN_NAME.test(name)) {
      problems.push(`${name} parece un secreto: las variables VITE_* llegan al navegador.`);
    }
  }

  return problems.length > 0
    ? err(problems)
    : ok({ projectId, apiKey, authDomain, appId, useEmulators, emulatorHost });
}
