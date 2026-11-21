import { useCallback, useState, type ReactNode } from 'react';
import { formatLocalTime } from '@tavelyo/core';
import {
  ActionNotice,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FilterPills,
  SelectField,
  Icon,
  LiveStatus,
  LoadingState,
  PageTitle,
  serverErrorText,
  StatusChip,
  TableTile,
  TavelyoButton,
  useLiveData,
  type LiveRunCommand,
  type LiveSubscriber,
} from '@tavelyo/design-system';
import {
  describeFloorCounts,
  describeSectorSize,
  describeTableOrders,
  describeTableRequests,
  floorCounts,
  tableTone,
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
  readonly canTransfer?: boolean;
  readonly renderComanda?: (
    sessionId: string,
    tableCode: string,
    sector: string,
    offline: boolean,
  ) => ReactNode;
  /** Reloj inyectable para las pruebas. */
  readonly now?: () => Date;
  /** Solicitudes pendientes de la sucursal (otro módulo; se muestra arriba si hay permiso). */
  readonly requestsPanel?: ReactNode;
  /** Pedidos de una mesa abierta (otro módulo); sin esta función no se ofrece «Ver pedidos». */
  readonly renderOrders?: (session: FloorSession, tableCode: string) => ReactNode;
}

const systemNow = () => new Date();
const ALL_SECTORS = 'todos';

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
  canTransfer = false,
  renderComanda,
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
  const [sectorFilter, setSectorFilter] = useState(ALL_SECTORS);
  const data = state.data;
  const sectors = data ? data.filter((s) => s.tables.length > 0) : [];
  const free = sectors.flatMap((s) => s.tables.filter((t) => !t.session));
  const shown = sectors.filter((s) => sectorFilter === ALL_SECTORS || s.id === sectorFilter);
  const reload = () => void refresh();

  return (
    <div className="tv-page">
      <header className="tv-page__header">
        <div>
          <PageTitle icon="floor">Salón</PageTitle>
          <p className="tv-list__meta">
            {branchName}
            {data ? ` · ${describeFloorCounts(floorCounts(data))}` : ''}
          </p>
        </div>
        <div className="tv-toolbar">
          <TavelyoButton variant="secondary" onClick={reload}>
            <Icon name="refresh" />
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
      {sectors.length > 0 ? (
        <>
          {sectors.length > 1 ? (
            <FilterPills
              label="Sectores del salón"
              value={sectorFilter}
              onChange={setSectorFilter}
              options={[
                { value: ALL_SECTORS, label: 'Todos' },
                ...sectors.map((sector) => ({
                  value: sector.id,
                  label: sector.name,
                  count: sector.tables.length,
                })),
              ]}
            />
          ) : null}
          <ul className="tv-legend" aria-label="Estados de las mesas">
            <li>
              <Icon name="freeTable" className="tv-legend__free" />
              Mesa libre
            </li>
            <li>
              <Icon name="people" className="tv-legend__open" />
              Mesa abierta
            </li>
            <li>
              <Icon name="callWaiter" className="tv-legend__attention" />
              Con solicitud pendiente
            </li>
            <li>
              <Icon name="readyToServe" className="tv-legend__ready" />
              Con platos listos
            </li>
          </ul>
        </>
      ) : null}
      {shown.map((sector) => (
        <section key={sector.id} className="tv-sector" aria-labelledby={`sector-${sector.id}`}>
          <div className="tv-sector__head">
            <Icon name="floor" />
            <h2 id={`sector-${sector.id}`}>{sector.name}</h2>
            <span className="tv-list__meta">{describeSectorSize(sector.tables.length)}</span>
          </div>
          <ul className="tv-table-grid" aria-label={`Mesas de ${sector.name}`}>
            {sector.tables.map((table) => (
              <FloorTableItem
                key={table.id + (table.session?.id ?? '')}
                free={free}
                canTransfer={canTransfer}
                comanda={
                  renderComanda && table.session
                    ? renderComanda(
                        table.session.id,
                        table.code,
                        sector.name,
                        state.connection === 'offline',
                      )
                    : null
                }
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
        </section>
      ))}
    </div>
  );
}

interface FloorTableItemProps {
  readonly comanda: ReactNode;
  readonly canTransfer: boolean;
  readonly free: readonly FloorTable[];
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
  comanda,
  canTransfer,
  free,
  gateway,
  scope,
  timezone,
  canClose,
  now,
  run,
  offline,
  renderOrders,
}: FloorTableItemProps) {
  const [transferOpen, setTransferOpen] = useState(false);
  const [destination, setDestination] = useState('');
  const [showComanda, setShowComanda] = useState(false);
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

  const closeDialog = session ? (
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
        Las personas unidas a la mesa pierden el acceso y no pueden seguir pidiendo. La mesa queda
        libre para los siguientes clientes, que tendrán que volver a unirse.
      </p>
    </ConfirmDialog>
  ) : null;
  const expanded =
    session && (showComanda || (showOrders && renderOrders) || showPeople) ? (
      <>
        {showComanda ? comanda : null}
        {showOrders && renderOrders ? renderOrders(session, table.code) : null}
        {showPeople ? (
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
      </>
    ) : null;

  return (
    <li>
      <TableTile
        code={table.code}
        status={session ? 'Abierta' : 'Libre'}
        tone={tableTone(session ? session.activity : null)}
        badges={
          <>
            <span className="tv-list__meta">{table.seats} puestos</span>
            {session && session.activity.requests.length > 0 ? (
              <StatusChip tone="warning" label="Solicitud pendiente" />
            ) : null}
            {session && session.activity.ready > 0 ? (
              <StatusChip tone="info" label="Platos listos" />
            ) : null}
          </>
        }
        detail={
          session ? (
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
          ) : null
        }
        actions={
          session ? (
            <>
              {comanda ? (
                <TavelyoButton
                  variant="secondary"
                  aria-expanded={showComanda}
                  disabled={offline}
                  onClick={() => setShowComanda(!showComanda)}
                >
                  {showComanda ? 'Ocultar comanda' : 'Tomar pedido'}
                </TavelyoButton>
              ) : null}
              {canTransfer ? (
                <>
                  <TavelyoButton
                    variant="secondary"
                    disabled={offline || !free.length}
                    onClick={() => {
                      setDestination(free[0]?.id ?? '');
                      setTransferOpen(true);
                    }}
                  >
                    Trasladar mesa
                  </TavelyoButton>
                  <ConfirmDialog
                    open={transferOpen}
                    title={'Trasladar mesa ' + table.code}
                    confirmLabel="Confirmar traslado"
                    busy={busy}
                    onCancel={() => setTransferOpen(false)}
                    onConfirm={() => {
                      const target = free.find((t) => t.id === destination);
                      if (!target || offline) {
                        setTransferOpen(false);
                        return;
                      }
                      void execute(
                        () => gateway.transfer(scope, session.id, table.id, target.id),
                        'Sesión trasladada a la mesa ' + target.code + '.',
                      ).then(() => setTransferOpen(false));
                    }}
                  >
                    <p>La cuenta, las personas y los pedidos pasan juntos a la mesa de destino.</p>
                    <SelectField
                      label="Mesa de destino"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    >
                      {free.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.code}
                        </option>
                      ))}
                    </SelectField>
                  </ConfirmDialog>
                </>
              ) : null}
              {renderOrders ? (
                <TavelyoButton
                  variant="secondary"
                  aria-expanded={showOrders}
                  onClick={() => setShowOrders(!showOrders)}
                >
                  <Icon name="bill" />
                  {showOrders ? 'Ocultar pedidos' : 'Ver pedidos'}
                </TavelyoButton>
              ) : null}
              <TavelyoButton
                variant="secondary"
                aria-expanded={showPeople}
                onClick={() => setShowPeople(!showPeople)}
              >
                <Icon name="people" />
                {showPeople ? 'Ocultar personas' : 'Ver personas en la mesa'}
              </TavelyoButton>
              {canClose ? (
                <TavelyoButton
                  variant="secondary"
                  disabled={offline}
                  onClick={() => setConfirmClose(true)}
                >
                  <Icon name="lock" />
                  Cerrar mesa
                </TavelyoButton>
              ) : null}
              {closeDialog}
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
              <Icon name="add" />
              Abrir mesa
            </TavelyoButton>
          )
        }
      >
        {expanded}
      </TableTile>
    </li>
  );
}
