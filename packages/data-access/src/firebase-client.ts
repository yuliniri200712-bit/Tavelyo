import { initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import {
  connectDataConnectEmulator,
  getDataConnect,
  type DataConnect,
} from 'firebase/data-connect';
import { connectFunctionsEmulator, getFunctions, type Functions } from 'firebase/functions';
import { connectorConfig } from '@tavelyo/dataconnect-sdk';
import type { FirebaseEnvironment } from './environment.ts';

export interface FirebaseClient {
  readonly app: FirebaseApp;
  readonly auth: Auth;
  readonly dataConnect: DataConnect;
}

export const EMULATOR_PORTS = { auth: 9099, dataConnect: 9399, functions: 5001 } as const;

/** Región de las funciones del backend (backend/src/index.ts). */
export const FUNCTIONS_REGION = 'us-central1';

/**
 * Funciones callable del backend, solo para la app que las usa (menu-web). Con emuladores apuntan
 * al emulador de Cloud Functions de la máquina local.
 */
export function createFunctionsClient(client: FirebaseClient, env: FirebaseEnvironment): Functions {
  const functions = getFunctions(client.app, FUNCTIONS_REGION);
  if (env.useEmulators) {
    connectFunctionsEmulator(functions, env.emulatorHost, EMULATOR_PORTS.functions);
  }
  return functions;
}

/**
 * Inicializa Firebase para una app. `appName` permite instancias aisladas (p. ej. en pruebas).
 * Con emuladores, Auth y SQL Connect apuntan a la máquina local y nada sale a la nube.
 */
export function createFirebaseClient(env: FirebaseEnvironment, appName?: string): FirebaseClient {
  const app = initializeApp(
    {
      apiKey: env.apiKey,
      authDomain: env.authDomain,
      projectId: env.projectId,
      appId: env.appId,
    },
    appName,
  );
  const auth = getAuth(app);
  const dataConnect = getDataConnect(app, connectorConfig);
  if (env.useEmulators) {
    connectAuthEmulator(auth, `http://${env.emulatorHost}:${EMULATOR_PORTS.auth}`, {
      disableWarnings: true,
    });
    connectDataConnectEmulator(dataConnect, env.emulatorHost, EMULATOR_PORTS.dataConnect);
  }
  return { app, auth, dataConnect };
}
