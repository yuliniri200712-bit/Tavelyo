import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { EmptyState } from '@tavelyo/design-system';
import { LayoutAdminPage, PrintQrPage } from '@tavelyo/floor';
import { useTenancy } from '@tavelyo/tenancy';
import { useAppContext } from './app-context.tsx';

/** Módulos de administración del personal y el permiso que habilita cada uno en la interfaz. */
export const ADMIN_MODULES = [
  {
    path: '/mesas',
    title: 'Mesas y códigos QR',
    description: 'Sectores, mesas y el QR imprimible de cada una.',
    permission: 'table.manage',
  },
] as const;

/** Sucursal activa y permisos de la persona; los permisos solo orientan la interfaz. */
export function useStaffContext() {
  const { selection } = useTenancy();
  if (selection.status !== 'ready') {
    throw new Error('useStaffContext requiere un contexto de empresa listo.');
  }
  return {
    scope: { tenantId: selection.tenant.tenantId, branchId: selection.branch.id },
    branchName: selection.branch.name,
    can: (permission: string) => selection.tenant.permissions.includes(permission),
  };
}

/**
 * Oculta la pantalla si el rol no tiene el permiso. Es solo una ayuda: el servidor comprueba el
 * permiso en cada operación (ADR-0008).
 */
export function RequirePermission({
  permission,
  children,
}: {
  readonly permission: string;
  readonly children: ReactNode;
}) {
  const { can } = useStaffContext();
  if (can(permission)) return children;
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
