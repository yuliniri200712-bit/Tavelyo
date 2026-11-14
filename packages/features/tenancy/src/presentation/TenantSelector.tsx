import { Card, EmptyState, ErrorState, LoadingState, TavelyoButton } from '@tavelyo/design-system';
import { canChangeContext } from '../application/selection.ts';
import { useTenancy } from './TenancyProvider.tsx';

const ERROR_TEXT = {
  unauthorized: 'Tu sesión ya no tiene acceso. Vuelve a iniciar sesión.',
  network: 'No hay conexión con el servidor. Revisa tu red.',
  unknown: 'Ocurrió un error inesperado.',
} as const;

/** Elección de empresa y sucursal. Se muestra mientras el contexto no está listo. */
export function TenantSelector() {
  const { selection, dispatch } = useTenancy();

  switch (selection.status) {
    case 'loading-tenants':
      return <LoadingState message="Cargando tus empresas…" />;
    case 'loading-branches':
      return (
        <LoadingState message={`Cargando las sucursales de ${selection.tenant.tenantName}…`} />
      );
    case 'error':
      return (
        <ErrorState
          title="No se pudieron cargar tus empresas"
          description={ERROR_TEXT[selection.error]}
          onRetry={() => dispatch({ type: 'reload' })}
        />
      );
    case 'no-memberships':
      return (
        <EmptyState
          title="Todavía no tienes acceso a ninguna empresa"
          description="Pide a la persona responsable del restaurante que te agregue al personal."
        />
      );
    case 'no-branches':
      return (
        <EmptyState
          title={`No tienes sucursales asignadas en ${selection.tenant.tenantName}`}
          description="Pide a la administración que te asigne una sucursal."
        />
      );
    case 'choose-tenant':
      return (
        <Card title="¿En qué empresa vas a trabajar?" headingLevel={2}>
          <ul className="tv-choice-list">
            {selection.memberships.map((membership) => (
              <li key={membership.tenantId}>
                <TavelyoButton
                  variant="secondary"
                  onClick={() => dispatch({ type: 'tenant-chosen', tenantId: membership.tenantId })}
                >
                  {membership.tenantName} · {membership.roleName}
                </TavelyoButton>
              </li>
            ))}
          </ul>
        </Card>
      );
    case 'choose-branch':
      return (
        <Card title={`¿En qué sucursal de ${selection.tenant.tenantName}?`} headingLevel={2}>
          <ul className="tv-choice-list">
            {selection.branches.map((branch) => (
              <li key={branch.id}>
                <TavelyoButton
                  variant="secondary"
                  onClick={() => dispatch({ type: 'branch-chosen', branchId: branch.id })}
                >
                  {branch.name}
                </TavelyoButton>
              </li>
            ))}
          </ul>
        </Card>
      );
    case 'ready':
      return null;
  }
}

export interface ContextBarProps {
  readonly userName: string;
  readonly onSignOut: () => void;
}

/** Contexto activo siempre visible, con cambio de contexto y cierre de sesión (PM §8). */
export function ContextBar({ userName, onSignOut }: ContextBarProps) {
  const { selection, dispatch } = useTenancy();
  return (
    <div className="tv-context-bar">
      <p className="tv-context-bar__text">
        {userName}
        {selection.status === 'ready'
          ? ` · ${selection.tenant.tenantName} · ${selection.branch.name} · ${selection.tenant.roleName}`
          : null}
      </p>
      {canChangeContext(selection) ? (
        <TavelyoButton variant="secondary" onClick={() => dispatch({ type: 'change-context' })}>
          Cambiar empresa o sucursal
        </TavelyoButton>
      ) : null}
      <TavelyoButton variant="secondary" onClick={onSignOut}>
        Cerrar sesión
      </TavelyoButton>
    </div>
  );
}
