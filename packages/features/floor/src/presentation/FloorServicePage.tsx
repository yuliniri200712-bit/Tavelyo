import { useCallback, useState, type ReactNode } from 'react';
import { formatLocalTime } from '@tavelyo/core';
import {
  ActionNotice,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LiveStatus,
  LoadingState,
  StatusChip,
  TavelyoButton,
  serverErrorText,
  useLiveData,
  type LiveRunCommand,
  type LiveSubscriber,
} from '@tavelyo/design-system';
import {
  describeFloorCounts,
  describeTableOrders,
  describeTableRequests,
  floorCounts,
} from '../application/floor-service.ts';
import type {
  BranchScope,
  FloorSector,
  FloorServiceGateway,
  FloorSession,
  FloorTable,
} from '../domain/index.ts';
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
  /** Solicitudes pendientes de la sucursal (otro módulo; se muestra arriba si hay permiso). */
  readonly requestsPanel?: ReactNode;
  /** Pedidos de una mesa abierta (otro módulo); sin esta función no se ofrece «Ver pedidos». */
  readonly renderOrders?: (session: FloorSession, tableCode: string) => ReactNode;
}

const systemNow = () => new Date();

/**
 * Vista del salón para el personal en servicio (session.open; lo comprueba el servidor). Se
 * actualiza sola (ADR-0007): cada mesa dice en texto si tiene pedidos en curso, platos listos para
 * recoger o solicitudes pendientes (RF-ME-01).
 */
export function FloorServicePage({
  gateway,
  scope,
  branchName,
  timezone,
  canClose,
  now = systemNow,
  requestsPanel,
  renderOrders,
}: FloorServicePageProps) {
  const { tenantId, branchId } = scope;
  const load = useCallback(
    () => gateway.floor({ tenantId, branchId }),
    [gateway, tenantId, branchId],
  );
  const watch = useCallback(
    (subscriber: LiveSubscriber<readonly FloorSector[]>) =>
      gateway.watchFloor({ tenantId, branchId }, subscriber),
    [gateway, tenantId, branchId],
  );
  const { state, notice, refresh, run } = useLiveData(load, watch, { now });
  const data = state.data;
  const sectors = data ? data.filter((s) => s.tables.length > 0) : [];
  const reload = () => void refresh();

  return (
    <div className="tv-page">
      <header className="tv-page__header">
        <div>
          <h1>Salón</h1>
          <p className="tv-list__meta">
            {branchName}
            {data ? ` · ${describeFloorCounts(floorCounts(data))}` : ''}
          </p>
        </div>
        <div className="tv-toolbar">
          <TavelyoButton variant="secondary" onClick={reload}>
            Actualizar salón
          </TavelyoButton>
        </div>
      </header>
      {data ? (
        <LiveStatus
          state={state}
          formatTime={(date) => formatLocalTime(date, timezone)}
          liveText="Los pedidos y las solicitudes llegan solos."
          blockedText="No puedes abrir ni cerrar mesas"
          onRetry={reload}
        />
      ) : null}
      <ActionNotice notice={notice} />
      {data === null && state.problem === null ? (
        <LoadingState message="Cargando el salón…" />
      ) : null}
      {data === null && state.problem ? (
        <ErrorState
          title="No se pudo cargar el salón"
          description={serverErrorText(state.problem)}
          onRetry={reload}
        />
      ) : null}
      {requestsPanel}
      {data && sectors.length === 0 ? (
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
                offline={state.connection === 'offline'}
                renderOrders={renderOrders}
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
  readonly run: LiveRunCommand;
  readonly offline: boolean;
  readonly renderOrders: FloorServicePageProps['renderOrders'];
}

function FloorTableItem({
  table,
  gateway,
  scope,
  timezone,
  canClose,
  now,
  run,
  offline,
  renderOrders,
}: FloorTableItemProps) {
  const [showPeople, setShowPeople] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [busy, setBusy] = useState(false);
  const { session } = table;

  const execute = async (command: Parameters<LiveRunCommand>[0], successText: string) => {
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
        {session && session.activity.requests.length > 0 ? (
          <StatusChip tone="warning" label="Solicitud pendiente" />
        ) : null}
        {session && session.activity.ready > 0 ? (
          <StatusChip tone="info" label="Platos listos" />
        ) : null}
      </div>
      {session ? (
        <>
          <p className="tv-list__meta">
            Abierta desde las {formatLocalTime(session.openedAt, timezone)}
          </p>
          <p>{describeTableOrders(session.activity)}</p>
          {describeTableRequests(session.activity.requests, timezone).map((text) => (
            <p key={text}>
              <strong>{text}</strong>
            </p>
          ))}
        </>
      ) : null}
      <div className="tv-toolbar">
        {session ? (
          <>
            {renderOrders ? (
              <TavelyoButton
                variant="secondary"
                aria-expanded={showOrders}
                onClick={() => setShowOrders(!showOrders)}
              >
                {showOrders ? 'Ocultar pedidos' : 'Ver pedidos'}
              </TavelyoButton>
            ) : null}
            <TavelyoButton
              variant="secondary"
              aria-expanded={showPeople}
              onClick={() => setShowPeople(!showPeople)}
            >
              {showPeople ? 'Ocultar personas' : 'Ver personas en la mesa'}
            </TavelyoButton>
            {canClose ? (
              <TavelyoButton
                variant="secondary"
                disabled={offline}
                onClick={() => setConfirmClose(true)}
              >
                Cerrar mesa
              </TavelyoButton>
            ) : null}
          </>
        ) : (
          <TavelyoButton
            loading={busy}
            loadingLabel="Abriendo…"
            disabled={offline}
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
      {session && showOrders && renderOrders ? renderOrders(session, table.code) : null}
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
              setShowOrders(false);
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
