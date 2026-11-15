import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { BranchMenuPage, CatalogAdminPage } from '@tavelyo/catalog';
import { EmptyState } from '@tavelyo/design-system';
import { LayoutAdminPage, PrintQrPage } from '@tavelyo/floor';
import { useTenancy } from '@tavelyo/tenancy';
import { useAppContext } from './app-context.tsx';

export interface AdminModule {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  /** Basta con uno de estos permisos para ver el módulo en la interfaz. */
  readonly permissions: readonly string[];
}

/** Módulos de administración del personal y los permisos que habilitan cada uno en la interfaz. */
export const ADMIN_MODULES: readonly AdminModule[] = [
  {
    path: '/mesas',
    title: 'Mesas y códigos QR',
    description: 'Sectores, mesas y el QR imprimible de cada una.',
    permissions: ['table.manage'],
  },
  {
    path: '/carta',
    title: 'Carta de la empresa',
    description: 'Categorías, productos, opciones, alérgenos e impuestos.',
    permissions: ['catalog.manage', 'price.change'],
  },
  {
    path: '/carta/sucursal',
    title: 'Carta de la sucursal',
    description: 'Disponibilidad, horario y precio de cada producto en esta sucursal.',
    permissions: ['catalog.manage', 'price.change'],
  },
];

/** Sucursal activa y permisos de la persona; los permisos solo orientan la interfaz. */
export function useStaffContext() {
  const { selection } = useTenancy();
  if (selection.status !== 'ready') {
    throw new Error('useStaffContext requiere un contexto de empresa listo.');
  }
  const can = (permission: string) => selection.tenant.permissions.includes(permission);
  return {
    scope: { tenantId: selection.tenant.tenantId, branchId: selection.branch.id },
    branchName: selection.branch.name,
    currency: selection.branch.currency,
    isOwner: selection.tenant.roleCode === 'tenant_owner',
    can,
    canAny: (permissions: readonly string[]) => permissions.some(can),
  };
}

/**
 * Oculta la pantalla si el rol no tiene ninguno de los permisos. Es solo una ayuda: el servidor
 * comprueba el permiso en cada operación (ADR-0008).
 */
export function RequirePermission({
  permissions,
  children,
}: {
  readonly permissions: readonly string[];
  readonly children: ReactNode;
}) {
  const { canAny } = useStaffContext();
  if (canAny(permissions)) return children;
  return (
    <EmptyState
      title="Esta sección no está disponible para tu rol"
      description="Pide a la administración del restaurante el permiso si lo necesitas."
      action={
        <Link className="tv-link-button" to="/">
          Volver al inicio
        </Link>
      }
    />
  );
}

export function TablesAdminRoute() {
  const { services } = useAppContext();
  const { scope, branchName } = useStaffContext();
  return (
    <LayoutAdminPage
      gateway={services.floorAdmin}
      scope={scope}
      branchName={branchName}
      menuWebUrl={services.menuWebUrl}
      printLink={
        <Link className="tv-link-button" to="/mesas/imprimir">
          Imprimir códigos QR
        </Link>
      }
    />
  );
}

export function PrintQrRoute() {
  const { services } = useAppContext();
  const { scope, branchName } = useStaffContext();
  return (
    <PrintQrPage
      gateway={services.floorAdmin}
      scope={scope}
      branchName={branchName}
      menuWebUrl={services.menuWebUrl}
      backLink={
        <Link className="tv-link-button" to="/mesas">
          Volver a las mesas
        </Link>
      }
    />
  );
}

export function CatalogAdminRoute() {
  const { services } = useAppContext();
  const { scope, currency, isOwner, can } = useStaffContext();
  return (
    <CatalogAdminPage
      gateway={services.catalogAdmin}
      tenantId={scope.tenantId}
      currency={currency}
      canEditCatalog={isOwner && can('catalog.manage')}
      canEditTaxes={can('tenant.settings')}
      branchLink={
        <Link className="tv-link-button" to="/carta/sucursal">
          Carta de la sucursal
        </Link>
      }
    />
  );
}

export function BranchMenuRoute() {
  const { services } = useAppContext();
  const { scope, branchName, currency, can } = useStaffContext();
  return (
    <BranchMenuPage
      gateway={services.catalogAdmin}
      scope={scope}
      branchName={branchName}
      currency={currency}
      canManageAvailability={can('catalog.manage')}
      canChangePrice={can('price.change')}
      catalogLink={
        <Link className="tv-link-button" to="/carta">
          Carta de la empresa
        </Link>
      }
    />
  );
}
