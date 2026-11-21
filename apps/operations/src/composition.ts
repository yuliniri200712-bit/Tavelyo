import {
  createBillingGateway,
  createComandaGateway,
  createBranchAdminGateway,
  createCashGateway,
  createTenantProfileGateway,
  createCatalogAdminGateway,
  createFirebaseAuthGateway,
  createFloorAdminGateway,
  createFloorServiceGateway,
  createFirebaseClient,
  createFunctionsClient,
  createKitchenGateway,
  createProfileGateway,
  createOrderApprovalGateway,
  createServiceRequestsGateway,
  createStaffOrdersGateway,
  createTenancyGateway,
  parseFirebaseEnvironment,
  type RawEnvironment,
} from '@tavelyo/data-access';
import type { BillingGateway, TenantProfileGateway } from '@tavelyo/billing';
import type { CashGateway } from '@tavelyo/cash';
import type { CatalogAdminGateway } from '@tavelyo/catalog';
import type { FloorAdminGateway, FloorServiceGateway } from '@tavelyo/floor';
import type { AuthGateway, ProfileGateway } from '@tavelyo/identity';
import type { KitchenGateway } from '@tavelyo/kitchen';
import type { OrderApprovalGateway, StaffOrdersGateway } from '@tavelyo/orders';
import type { ServiceRequestsGateway } from '@tavelyo/service-requests';
import type { BranchAdminGateway, TenancyGateway } from '@tavelyo/tenancy';

/** Dependencias de la app, inyectadas por contexto (ADR-0010). */
export interface Services {
  readonly comanda: import('@tavelyo/orders/domain').ComandaGateway;
  readonly auth: AuthGateway;
  readonly profiles: ProfileGateway;
  readonly tenancy: TenancyGateway;
  readonly floorAdmin: FloorAdminGateway;
  readonly floorService: FloorServiceGateway;
  readonly catalogAdmin: CatalogAdminGateway;
  readonly branchAdmin: BranchAdminGateway;
  readonly kitchen: KitchenGateway;
  readonly orders: StaffOrdersGateway;
  readonly serviceRequests: ServiceRequestsGateway;
  readonly orderApproval: OrderApprovalGateway;
  readonly cash: CashGateway;
  readonly billing: BillingGateway;
  readonly tenantProfile: TenantProfileGateway;
  /** Dirección pública de menu-web: la del QR de cada mesa. */
  readonly menuWebUrl: string;
  readonly usesEmulators: boolean;
}

export type Composition =
  | { readonly ok: true; readonly services: Services }
  | { readonly ok: false; readonly problems: readonly string[] };

/** Dirección de menu-web en desarrollo con emuladores (puerto de `vite preview` de menu-web). */
export const LOCAL_MENU_WEB_URL = 'http://localhost:6173';

/**
 * Dirección pública de la carta, que va impresa en el QR de cada mesa. Obligatoria fuera de los
 * emuladores; con emuladores, por defecto la de menu-web en este equipo.
 */
export function parseMenuWebUrl(env: RawEnvironment, useEmulators: boolean): string | null {
  const raw = env['VITE_MENU_WEB_URL'];
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (value === '') return useEmulators ? LOCAL_MENU_WEB_URL : null;
  try {
    const url = new URL(value);
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) return null;
    if (url.search || url.hash || url.username || url.password) return null;
    return url.origin + url.pathname.replace(/\/+$/, '');
  } catch {
    return null;
  }
}

/** Punto de composición: valida el entorno y crea Firebase y las pasarelas una sola vez. */
export function compose(env: RawEnvironment): Composition {
  const environment = parseFirebaseEnvironment(env);
  if (!environment.ok) return { ok: false, problems: environment.error };
  const menuWebUrl = parseMenuWebUrl(env, environment.value.useEmulators);
  if (!menuWebUrl) {
    return {
      ok: false,
      problems: ['VITE_MENU_WEB_URL debe ser la dirección https de la carta (ver .env.example).'],
    };
  }
  const client = createFirebaseClient(environment.value);
  const functions = createFunctionsClient(client, environment.value);
  return {
    ok: true,
    services: {
      comanda: createComandaGateway(client.dataConnect, functions),
      auth: createFirebaseAuthGateway(client.auth),
      profiles: createProfileGateway(client.dataConnect),
      tenancy: createTenancyGateway(client.dataConnect),
      floorAdmin: createFloorAdminGateway(client.dataConnect),
      floorService: createFloorServiceGateway(client.dataConnect, functions),
      catalogAdmin: createCatalogAdminGateway(client.dataConnect),
      branchAdmin: createBranchAdminGateway(client.dataConnect),
      kitchen: createKitchenGateway(client.dataConnect),
      orders: createStaffOrdersGateway(client.dataConnect),
      serviceRequests: createServiceRequestsGateway(client.dataConnect),
      orderApproval: createOrderApprovalGateway(client.dataConnect),
      cash: createCashGateway(client.dataConnect, functions),
      billing: createBillingGateway(client.dataConnect, functions),
      tenantProfile: createTenantProfileGateway(client.dataConnect, functions),
      menuWebUrl,
      usesEmulators: environment.value.useEmulators,
    },
  };
}
