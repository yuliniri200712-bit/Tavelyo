import { useState, type ReactNode } from 'react';
import {
  ActionNotice,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusChip,
  TavelyoButton,
  serverErrorText,
} from '@tavelyo/design-system';
import { tableMenuUrl } from '../application/forms.ts';
import type {
  BranchScope,
  DiningTableAdmin,
  FloorAdminGateway,
  SectorAdmin,
} from '../domain/index.ts';
import { SectorForm, TableForm } from './forms.tsx';
import { TableQrCode } from './TableQrCode.tsx';
import { useFloorLayout } from './useFloorLayout.ts';

export interface LayoutAdminPageProps {
  readonly gateway: FloorAdminGateway;
  readonly scope: BranchScope;
  readonly branchName: string;
  /** Dirección pública de menu-web, para el QR de cada mesa. */
  readonly menuWebUrl: string;
  /** Enlace a la hoja imprimible (la navegación es de la app). */
  readonly printLink: ReactNode;
}

type Run = ReturnType<typeof useFloorLayout>['run'];

/** Sectores y mesas de la sucursal con su QR (requiere table.manage; lo comprueba el servidor). */
export function LayoutAdminPage({
  gateway,
  scope,
  branchName,
  menuWebUrl,
  printLink,
}: LayoutAdminPageProps) {
  const { state, notice, reload, run } = useFloorLayout(gateway, scope);

  return (
    <div className="tv-page">
      <header className="tv-page__header">
        <div>
          <h1>Mesas y códigos QR</h1>
          <p className="tv-list__meta">{branchName}</p>
        </div>
        <div className="tv-toolbar">{printLink}</div>
      </header>
      <ActionNotice notice={notice} />
      <Card title="Nuevo sector" headingLevel={2}>
        <SectorForm
          submitLabel="Agregar sector"
          onSubmit={(input) =>
            run(() => gateway.createSector(scope, input), `Sector «${input.name}» agregado.`)
          }
        />
      </Card>
      {state.status === 'loading' ? <LoadingState message="Cargando el salón…" /> : null}
      {state.status === 'error' ? (
        <ErrorState
          title="No se pudo cargar el salón"
          description={serverErrorText(state.error)}
          onRetry={reload}
        />
      ) : null}
      {state.status === 'ready' && state.data.length === 0 ? (
        <EmptyState
          title="Todavía no hay sectores"
          description="Agrega un sector (por ejemplo, Salón principal) y luego sus mesas."
        />
      ) : null}
      {state.status === 'ready'
        ? state.data.map((sector) => (
            <SectorCard
              key={sector.id}
              sector={sector}
              activeSectors={state.data.filter((s) => !s.archived)}
              gateway={gateway}
              scope={scope}
              menuWebUrl={menuWebUrl}
              run={run}
            />
          ))
        : null}
    </div>
  );
}

interface SectorCardProps {
  readonly sector: SectorAdmin;
  readonly activeSectors: readonly SectorAdmin[];
  readonly gateway: FloorAdminGateway;
  readonly scope: BranchScope;
  readonly menuWebUrl: string;
  readonly run: Run;
}

function SectorCard({ sector, activeSectors, gateway, scope, menuWebUrl, run }: SectorCardProps) {
  const [editing, setEditing] = useState(false);
  const update = (archived: boolean, name = sector.name, sort = sector.sort) =>
    run(
      () => gateway.updateSector(scope, sector.id, { name, sort, archived }),
      archived ? `Sector «${name}» archivado.` : `Sector «${name}» guardado.`,
    );

  return (
    <Card title={sector.name} headingLevel={2}>
      <div className="tv-list__summary">
        <StatusChip
          tone={sector.archived ? 'neutral' : 'success'}
          label={sector.archived ? 'Archivado' : 'Activo'}
        />
        <span className="tv-list__meta">
          {sector.tables.filter((t) => !t.archived).length} mesas activas
        </span>
      </div>
      {editing ? (
        <SectorForm
          initial={{ name: sector.name, sort: sector.sort }}
          submitLabel="Guardar sector"
          onCancel={() => setEditing(false)}
          onSubmit={async (input) => {
            const accepted = await update(sector.archived, input.name, input.sort);
            if (accepted) setEditing(false);
            return accepted;
          }}
        />
      ) : (
        <div className="tv-toolbar">
          <TavelyoButton variant="secondary" onClick={() => setEditing(true)}>
            Editar sector
          </TavelyoButton>
          <TavelyoButton variant="secondary" onClick={() => void update(!sector.archived)}>
            {sector.archived ? 'Restaurar sector' : 'Archivar sector'}
          </TavelyoButton>
        </div>
      )}
      {sector.tables.length > 0 ? (
        <ul className="tv-list" aria-label={`Mesas de ${sector.name}`}>
          {sector.tables.map((table) => (
            <TableItem
              key={table.id}
              table={table}
              sector={sector}
              activeSectors={activeSectors}
              gateway={gateway}
              scope={scope}
              menuWebUrl={menuWebUrl}
              run={run}
            />
          ))}
        </ul>
      ) : (
        <p className="tv-list__meta">Este sector todavía no tiene mesas.</p>
      )}
      {sector.archived ? null : (
        <fieldset className="tv-fieldset">
          <legend className="tv-fieldset__legend">Nueva mesa en {sector.name}</legend>
          <TableForm
            initial={{ sectorId: sector.id, code: '', seats: 4 }}
            sectors={[sector]}
            submitLabel="Agregar mesa"
            onSubmit={(input) =>
              run(() => gateway.createTable(scope, input), `Mesa ${input.code} agregada.`)
            }
          />
        </fieldset>
      )}
    </Card>
  );
}

interface TableItemProps extends Omit<SectorCardProps, 'sector'> {
  readonly table: DiningTableAdmin;
  readonly sector: SectorAdmin;
}

function TableItem({
  table,
  sector,
  activeSectors,
  gateway,
  scope,
  menuWebUrl,
  run,
}: TableItemProps) {
  const [mode, setMode] = useState<'idle' | 'editing' | 'qr'>('idle');
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [rotating, setRotating] = useState(false);
  const url = tableMenuUrl(menuWebUrl, table.qrPublicId);
  const base = { sectorId: sector.id, code: table.code, seats: table.seats };

  return (
    <li className="tv-list__item">
      <div className="tv-list__summary">
        <span className="tv-list__title">Mesa {table.code}</span>
        <span className="tv-list__meta">{table.seats} puestos</span>
        <StatusChip
          tone={table.archived ? 'neutral' : 'success'}
          label={table.archived ? 'Archivada' : 'Activa'}
        />
      </div>
      {mode === 'editing' ? (
        <TableForm
          initial={base}
          sectors={activeSectors.length > 0 ? activeSectors : [sector]}
          submitLabel="Guardar mesa"
          onCancel={() => setMode('idle')}
          onSubmit={async (input) => {
            const accepted = await run(
              () => gateway.updateTable(scope, table.id, { ...input, archived: table.archived }),
              `Mesa ${input.code} guardada.`,
            );
            if (accepted) setMode('idle');
            return accepted;
          }}
        />
      ) : (
        <div className="tv-toolbar">
          {table.archived ? null : (
            <TavelyoButton
              variant="secondary"
              aria-expanded={mode === 'qr'}
              onClick={() => setMode(mode === 'qr' ? 'idle' : 'qr')}
            >
              {mode === 'qr' ? 'Ocultar QR' : 'Ver QR'}
            </TavelyoButton>
          )}
          <TavelyoButton variant="secondary" onClick={() => setMode('editing')}>
            Editar mesa
          </TavelyoButton>
          <TavelyoButton
            variant="secondary"
            onClick={() =>
              void run(
                () => gateway.updateTable(scope, table.id, { ...base, archived: !table.archived }),
                table.archived ? `Mesa ${table.code} restaurada.` : `Mesa ${table.code} archivada.`,
              )
            }
          >
            {table.archived ? 'Restaurar mesa' : 'Archivar mesa'}
          </TavelyoButton>
          {table.archived ? null : (
            <TavelyoButton variant="secondary" onClick={() => setConfirmRotate(true)}>
              Generar QR nuevo
            </TavelyoButton>
          )}
        </div>
      )}
      {mode === 'qr' ? (
        <div className="tv-form">
          <TableQrCode url={url} label={`Código QR de la mesa ${table.code}`} />
          <p className="tv-url">{url}</p>
        </div>
      ) : null}
      <ConfirmDialog
        open={confirmRotate}
        title={`¿Generar un QR nuevo para la mesa ${table.code}?`}
        confirmLabel="Generar QR nuevo"
        destructive
        busy={rotating}
        onCancel={() => setConfirmRotate(false)}
        onConfirm={() => {
          setRotating(true);
          void run(
            () => gateway.rotateQr(scope, table.id),
            `QR de la mesa ${table.code} renovado. Imprime y cambia el código en la mesa.`,
          ).then(() => {
            setRotating(false);
            setConfirmRotate(false);
          });
        }}
      >
        <p>
          El QR impreso que está hoy en la mesa dejará de abrir la carta. Úsalo si el código se
          perdió o alguien lo fotografió. Quienes ya están en la mesa no se desconectan.
        </p>
      </ConfirmDialog>
    </li>
  );
}
