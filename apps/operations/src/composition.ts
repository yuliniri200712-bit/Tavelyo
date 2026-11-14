import {
  createFirebaseAuthGateway,
  createFirebaseClient,
  createProfileGateway,
  createTenancyGateway,
  parseFirebaseEnvironment,
  type RawEnvironment,
} from '@tavelyo/data-access';
import type { AuthGateway, ProfileGateway } from '@tavelyo/identity';
import type { TenancyGateway } from '@tavelyo/tenancy';

/** Dependencias de la app, inyectadas por contexto (ADR-0010). */
export interface Services {
  readonly auth: AuthGateway;
  readonly profiles: ProfileGateway;
  readonly tenancy: TenancyGateway;
  readonly usesEmulators: boolean;
}

export type Composition =
  | { readonly ok: true; readonly services: Services }
  | { readonly ok: false; readonly problems: readonly string[] };

/** Punto de composición: valida el entorno y crea Firebase y las pasarelas una sola vez. */
export function compose(env: RawEnvironment): Composition {
  const environment = parseFirebaseEnvironment(env);
  if (!environment.ok) return { ok: false, problems: environment.error };
  const client = createFirebaseClient(environment.value);
  return {
    ok: true,
    services: {
      auth: createFirebaseAuthGateway(client.auth),
      profiles: createProfileGateway(client.dataConnect),
      tenancy: createTenancyGateway(client.dataConnect),
      usesEmulators: environment.value.useEmulators,
    },
  };
}
