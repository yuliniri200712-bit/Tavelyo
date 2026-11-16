import {
  createCustomerGateway,
  createFirebaseClient,
  createFunctionsClient,
  parseFirebaseEnvironment,
  type RawEnvironment,
} from '@tavelyo/data-access';
import type { CartStorage } from '@tavelyo/cart';
import type { CustomerGateway } from '@tavelyo/table-session';

/** Dependencias de la app del cliente, inyectadas por contexto (ADR-0010). */
export interface Services {
  readonly customer: CustomerGateway;
  /** Carrito local de cada persona (D-06): el almacenamiento del navegador. */
  readonly cartStorage: CartStorage;
  readonly usesEmulators: boolean;
}

export type Composition =
  | { readonly ok: true; readonly services: Services }
  | { readonly ok: false; readonly problems: readonly string[] };

/** Almacenamiento que nunca falla: en modo privado o bloqueado, el carrito vive en memoria. */
function browserStorage(): CartStorage {
  const memory = new Map<string, string>();
  const local = (): Storage | null => {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  };
  return {
    getItem: (key) => local()?.getItem(key) ?? memory.get(key) ?? null,
    setItem: (key, value) => {
      memory.set(key, value);
      local()?.setItem(key, value);
    },
    removeItem: (key) => {
      memory.delete(key);
      local()?.removeItem(key);
    },
  };
}

/** Punto de composición: valida el entorno y crea Firebase y las pasarelas una sola vez. */
export function compose(env: RawEnvironment): Composition {
  const environment = parseFirebaseEnvironment(env);
  if (!environment.ok) return { ok: false, problems: environment.error };
  const client = createFirebaseClient(environment.value);
  const functions = createFunctionsClient(client, environment.value);
  return {
    ok: true,
    services: {
      customer: createCustomerGateway({
        auth: client.auth,
        dataConnect: client.dataConnect,
        functions,
      }),
      cartStorage: browserStorage(),
      usesEmulators: environment.value.useEmulators,
    },
  };
}
