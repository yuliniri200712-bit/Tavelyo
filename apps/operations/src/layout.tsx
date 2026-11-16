import { Fragment, type ReactNode } from 'react';
import { Link, Navigate, Outlet } from 'react-router';
import { Card, LoadingState, StatusChip } from '@tavelyo/design-system';
import { InactivityGuard, InactivityHoldProvider, useSession } from '@tavelyo/identity';
import { PwaShell } from '@tavelyo/pwa-shell';
import {
  ContextBar,
  contextKey,
  TenancyProvider,
  TenantSelector,
  useTenancy,
} from '@tavelyo/tenancy';
import { STAFF_MODULES } from './admin-routes.tsx';
import { useAppContext } from './app-context.tsx';

const APP_LABEL = 'Operaciones';

/**
 * Marco de todas las rutas. Con sesión iniciada monta el contexto de empresa, reiniciado por
 * usuario (`key`): al cerrar sesión o cambiar de cuenta no queda nada del anterior.
 */
export function AppLayout() {
  const { services, update } = useAppContext();
  const { session, signOut } = useSession();

  if (session.status !== 'signed-in') {
    return (
      <PwaShell appLabel={APP_LABEL} update={update}>
        {session.status === 'checking' ? (
          <LoadingState message="Comprobando la sesión…" />
        ) : (
          <Outlet />
        )}
      </PwaShell>
    );
  }

  return (
    <TenancyProvider key={session.user.uid} gateway={services.tenancy}>
      <PwaShell
        appLabel={APP_LABEL}
        update={update}
        headerActions={
          <ContextBar
            userName={session.user.displayName || session.user.email}
            onSignOut={() => void signOut()}
          />
        }
      >
        <InactivityHoldProvider>
          <InactivityGuard />
          <Outlet />
        </InactivityHoldProvider>
      </PwaShell>
    </TenancyProvider>
  );
}

/** Solo para personas sin sesión (pantalla de acceso). */
export function PublicOnly({ children }: { readonly children: ReactNode }) {
  const { session } = useSession();
  return session.status === 'signed-in' ? <Navigate to="/" replace /> : children;
}

/**
 * Exige sesión y un contexto de empresa y sucursal listo. Todo lo que hay debajo se desmonta
 * al cambiar de contexto (`key`), así que no conserva datos de la empresa anterior.
 */
export function RequireStaffContext({ children }: { readonly children: ReactNode }) {
  const { session } = useSession();
  if (session.status !== 'signed-in') return <Navigate to="/acceso" replace />;
  return <StaffContextGate>{children}</StaffContextGate>;
}

function StaffContextGate({ children }: { readonly children: ReactNode }) {
  const { selection } = useTenancy();
  const key = contextKey(selection);
  return key ? <Fragment key={key}>{children}</Fragment> : <TenantSelector />;
}

/** Inicio del personal: los módulos que el rol puede usar en la sucursal activa. */
export function StaffHome() {
  const { selection } = useTenancy();
  if (selection.status !== 'ready') return null;
  const modules = STAFF_MODULES.filter((module) =>
    module.permissions.some((permission) => selection.tenant.permissions.includes(permission)),
  );
  return (
    <div className="tv-page">
      <Card title={`${selection.tenant.tenantName} · ${selection.branch.name}`} headingLevel={2}>
        <p>
          Entraste como <strong>{selection.tenant.roleName}</strong>.
        </p>
        <StatusChip tone="success" label="Contexto listo" />
      </Card>
      {modules.length > 0 ? (
        <nav aria-label="Módulos">
          <ul className="tv-list">
            {modules.map((module) => (
              <li key={module.path} className="tv-list__item">
                <Link className="tv-list__title" to={module.path}>
                  {module.title}
                </Link>
                <p className="tv-list__meta">{module.description}</p>
              </li>
            ))}
          </ul>
        </nav>
      ) : (
        <p>Los módulos de tu rol se habilitarán en las próximas fases.</p>
      )}
    </div>
  );
}
