import type { ReactNode } from 'react';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  serverErrorText,
  TavelyoButton,
} from '@tavelyo/design-system';
import { tableMenuUrl } from '../application/forms.ts';
import type { BranchScope, FloorAdminGateway } from '../domain/index.ts';
import { TableQrCode } from './TableQrCode.tsx';
import { useFloorLayout } from './useFloorLayout.ts';

export interface PrintQrPageProps {
  readonly gateway: FloorAdminGateway;
  readonly scope: BranchScope;
  readonly branchName: string;
  readonly menuWebUrl: string;
  /** Enlace de vuelta a la gestión de mesas. */
  readonly backLink: ReactNode;
}

/** Una tarjeta por mesa activa, lista para imprimir y recortar. Al imprimir se oculta el resto. */
export function PrintQrPage({
  gateway,
  scope,
  branchName,
  menuWebUrl,
  backLink,
}: PrintQrPageProps) {
  const { state, reload } = useFloorLayout(gateway, scope);

  if (state.status === 'loading') return <LoadingState message="Preparando los códigos QR…" />;
  if (state.status === 'error') {
    return (
      <ErrorState
        title="No se pudieron preparar los códigos QR"
        description={serverErrorText(state.error)}
        onRetry={reload}
      />
    );
  }

  const tables = state.data
    .filter((sector) => !sector.archived)
    .flatMap((sector) =>
      sector.tables
        .filter((table) => !table.archived)
        .map((table) => ({ ...table, sectorName: sector.name })),
    );

  return (
    <div className="tv-page">
      <header className="tv-page__header tv-no-print">
        <div>
          <h1>Códigos QR para imprimir</h1>
          <p className="tv-list__meta">
            {branchName} · {tables.length} mesas activas
          </p>
        </div>
        <div className="tv-toolbar">
          {backLink}
          {tables.length > 0 ? (
            <TavelyoButton onClick={() => window.print()}>Imprimir</TavelyoButton>
          ) : null}
        </div>
      </header>
      {tables.length === 0 ? (
        <EmptyState
          title="No hay mesas activas"
          description="Agrega mesas en Mesas y códigos QR para imprimir sus códigos."
        />
      ) : (
        <ul className="tv-print-sheet" aria-label="Códigos QR de las mesas">
          {tables.map((table) => (
            <li key={table.id} className="tv-print-card">
              <span className="tv-print-card__code">Mesa {table.code}</span>
              <TableQrCode
                url={tableMenuUrl(menuWebUrl, table.qrPublicId)}
                label={`Código QR de la mesa ${table.code}`}
              />
              <span>Escanea para ver la carta</span>
              <span className="tv-list__meta">
                {branchName} · {table.sectorName}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
