import { initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import {
  connectDataConnectEmulator,
  getDataConnect,
  type DataConnect,
} from 'firebase/data-connect';
import { connectorConfig } from '@tavelyo/dataconnect-sdk';
import type { FirebaseEnvironment } from './environment.ts';

export interface FirebaseClient {
  readonly app: FirebaseApp;
  readonly auth: Auth;
  readonly dataConnect: DataConnect;
}

export const EMULATOR_PORTS = { auth: 9099, dataConnect: 9399 } as const;

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
