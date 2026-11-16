import { useCallback, useState } from 'react';
import { formatLocalTime } from '@tavelyo/core';
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
  useServerData,
  type RunCommand,
} from '@tavelyo/design-system';
import { describeFloorCounts, floorCounts } from '../application/floor-service.ts';
import type { BranchScope, FloorServiceGateway, FloorTable } from '../domain/index.ts';
import { ParticipantsPanel } from './ParticipantsPanel.tsx';

export interface FloorServicePageProps {
  readonly gateway: FloorServiceGateway;
  readonly scope: BranchScope;
  readonly branchName: string;
  /** Zona horaria de la sucursal: las horas se muestran en ella. */
  readonly timezone: string;
  /** session.close: cerrar la mesa y retirar personas (el servidor lo vuelve a comprobar). */
  readonly canClose: boolean;
  /** Reloj inyectable para las pruebas. */
  readonly now?: () => Date;
}

const systemNow = () => new Date();

/** Vista del salón para el personal en servicio (session.open; lo comprueba el servidor). */
export function FloorServicePage({
  gateway,
  scope,
  branchName,
  timezone,
  canClose,
  now = systemNow,
}: FloorServicePageProps) {
  const { tenantId, branchId } = scope;
  const load = useCallback(
    () => gateway.floor({ tenantId, branchId }),
    [gateway, tenantId, branchId],
  );
  const { state, notice, reload, run } = useServerData(load);
  const sectors = state.status === 'ready' ? state.data.filter((s) => s.tables.length > 0) : [];

  return (
    <div className="tv-page">
      <header className="tv-page__header">
        <div>
          <h1>Salón</h1>
          <p className="tv-list__meta">
            {branchName}
            {state.status === 'ready' ? ` · ${describeFloorCounts(floorCounts(state.data))}` : ''}
          </p>
        </div>
        <div className="tv-toolbar">
          <TavelyoButton variant="secondary" onClick={reload}>
            Actualizar salón
          </TavelyoButton>
        </div>
      </header>
      <ActionNotice notice={notice} />
      {state.status === 'loading' ? <LoadingState message="Cargando el salón…" /> : null}
      {state.status === 'error' ? (
        <ErrorState
          title="No se pudo cargar el salón"
          description={serverErrorText(state.error)}
          onRetry={reload}
        />
      ) : null}
      {state.status === 'ready' && sectors.length === 0 ? (
        <EmptyState
          title="Todavía no hay mesas"
          description="La administración agrega los sectores y las mesas en «Mesas y códigos QR»."
        />
      ) : null}
      {sectors.map((sector) => (
        <Card key={sector.id} title={sector.name} headingLevel={2}>
          <ul className="tv-list" aria-label={`Mesas de ${sector.name}`}>
            {sector.tables.map((table) => (
              <FloorTableItem
                key={table.id}
                table={table}
                gateway={gateway}
                scope={scope}
                timezone={timezone}
                canClose={canClose}
                now={now}
                run={run}
              />
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}

interface FloorTableItemProps {
  readonly table: FloorTable;
  readonly gateway: FloorServiceGateway;
  readonly scope: BranchScope;
  readonly timezone: string;
  readonly canClose: boolean;
  readonly now: () => Date;
  readonly run: RunCommand;
}

function FloorTableItem({
  table,
  gateway,
  scope,
  timezone,
  canClose,
  now,
  run,
}: FloorTableItemProps) {
  const [showPeople, setShowPeople] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [busy, setBusy] = useState(false);
  const { session } = table;

  const execute = async (command: Parameters<RunCommand>[0], successText: string) => {
    setBusy(true);
    const accepted = await run(command, successText);
    setBusy(false);
    return accepted;
  };

  return (
    <li className="tv-list__item">
      <div className="tv-list__summary">
        <span className="tv-list__title">Mesa {table.code}</span>
        <span className="tv-list__meta">{table.seats} puestos</span>
        <StatusChip tone={session ? 'warning' : 'success'} label={session ? 'Abierta' : 'Libre'} />
      </div>
      {session ? (
        <p className="tv-list__meta">
          Abierta desde las {formatLocalTime(session.openedAt, timezone)}
        </p>
      ) : null}
      <div className="tv-toolbar">
        {session ? (
          <>
            <TavelyoButton
              variant="secondary"
              aria-expanded={showPeople}
              onClick={() => setShowPeople(!showPeople)}
            >
              {showPeople ? 'Ocultar personas' : 'Ver personas en la mesa'}
            </TavelyoButton>
            {canClose ? (
              <TavelyoButton variant="secondary" onClick={() => setConfirmClose(true)}>
                Cerrar mesa
              </TavelyoButton>
            ) : null}
          </>
        ) : (
          <TavelyoButton
            loading={busy}
            loadingLabel="Abriendo…"
            onClick={() =>
              void execute(
                () => gateway.openTable(scope, table.id),
                `Mesa ${table.code} abierta. Los clientes ya pueden unirse desde el QR.`,
              )
            }
          >
            Abrir mesa
          </TavelyoButton>
        )}
      </div>
      {session && showPeople ? (
        <ParticipantsPanel
          gateway={gateway}
          scope={scope}
          sessionId={session.id}
          tableCode={table.code}
          timezone={timezone}
          canRemove={canClose}
          now={now}
        />
      ) : null}
      {session ? (
        <ConfirmDialog
          open={confirmClose}
          title={`¿Cerrar la mesa ${table.code}?`}
          confirmLabel="Cerrar mesa"
          destructive
          busy={busy}
          onCancel={() => setConfirmClose(false)}
          onConfirm={() => {
            void execute(
              () => gateway.closeSession(scope, session.id),
              `Mesa ${table.code} cerrada. Quedó libre.`,
            ).then(() => {
              setConfirmClose(false);
              setShowPeople(false);
            });
          }}
        >
          <p>
            Las personas unidas a la mesa pierden el acceso y no pueden seguir pidiendo. La mesa
            queda libre para los siguientes clientes, que tendrán que volver a unirse.
          </p>
        </ConfirmDialog>
      ) : null}
    </li>
  );
}
