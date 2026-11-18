import { useCallback, useEffect, useRef, useState } from 'react';
import { elapsedMinutes, formatLocalTime, formatShortWait } from '@tavelyo/core';
import {
  ActionNotice,
  EmptyState,
  Icon,
  KitchenTicket,
  LiveStatus,
  LoadingState,
  PageTitle,
  StatusChip,
  TavelyoButton,
  useLiveData,
  type LiveSubscriber,
} from '@tavelyo/design-system';
import {
  describeNewlyReady,
  describePickup,
  describeReadySince,
  ITEM_STATUS,
  newlyReady,
} from '../application/staff-orders.ts';
import type { BranchScope, PickupItem, StaffOrdersGateway } from '../domain/index.ts';
import { changedText } from './changed-text.ts';

export interface PickupPageProps {
  readonly gateway: StaffOrdersGateway;
  readonly scope: BranchScope;
  readonly branchName: string;
  readonly timezone: string;
  /** delivery.deliver: marcar «Entregado» (el servidor lo vuelve a comprobar). */
  readonly canDeliver: boolean;
  readonly now?: () => Date;
}

const systemNow = () => new Date();

/**
 * «Listos para recoger» (delivery.pickup; lo comprueba el servidor). Las líneas listas de la
 * sucursal, de la que más espera a la más reciente, en tiempo real: «Recogido» y «Entregado».
 */
export function PickupPage({
  gateway,
  scope,
  branchName,
  timezone,
  canDeliver,
  now = systemNow,
}: PickupPageProps) {
  const { tenantId, branchId } = scope;
  const load = useCallback(
    () => gateway.pickupQueue({ tenantId, branchId }),
    [gateway, tenantId, branchId],
  );
  const watch = useCallback(
    (subscriber: LiveSubscriber<readonly PickupItem[]>) =>
      gateway.watchPickupQueue({ tenantId, branchId }, subscriber),
    [gateway, tenantId, branchId],
  );
  const { state, notice, refresh, run } = useLiveData(load, watch, {
    now,
    errorText: changedText,
  });
  const items = state.data;
  const announcement = useReadyAnnouncement(items);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, setTick] = useState(0);

  // Los minutos de espera se actualizan solos.
  useEffect(() => {
    const timer = window.setInterval(() => setTick((n) => n + 1), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const act = async (item: PickupItem, command: () => ReturnType<StaffOrdersGateway['pickUp']>) => {
    setBusyId(item.id);
    const what = `${item.quantity} × ${item.productName}, mesa ${item.tableCode}`;
    await run(command, item.status === 'READY' ? `Recogido: ${what}.` : `Entregado: ${what}.`);
    setBusyId(null);
  };
  const offline = state.connection !== 'live';

  return (
    <div className="tv-page">
      <header className="tv-page__header">
        <div>
          <PageTitle icon="readyToServe">Listos para recoger</PageTitle>
          <p className="tv-list__meta">{branchName}</p>
        </div>
      </header>
      <LiveStatus
        state={state}
        formatTime={(date) => formatLocalTime(date, timezone)}
        liveText="Los platos listos aparecen solos."
        blockedText="No puedes recoger ni entregar"
        onRetry={() => void refresh()}
      />
      <div role="status" aria-live="polite">
        {announcement ? <p className="tv-list__meta">{announcement}</p> : null}
      </div>
      <ActionNotice notice={notice} />
      {items === null && state.connection === 'connecting' ? (
        <LoadingState message="Cargando los platos listos…" />
      ) : null}
      {items && items.length === 0 ? (
        <EmptyState
          title="No hay platos listos"
          description="Cuando cocina marque una línea como lista, aparecerá aquí sin recargar."
        />
      ) : null}
      {items && items.length > 0 ? (
        <>
          <p className="tv-list__meta">{describePickup(items)}</p>
          <ul className="tv-kitchen-queue" aria-label="Platos listos y recogidos">
            {items.map((item) => (
              <PickupLine
                key={item.id}
                item={item}
                now={now()}
                canDeliver={canDeliver}
                disabled={offline || busyId !== null}
                busy={busyId === item.id}
                onPickUp={() => void act(item, () => gateway.pickUp(scope, item))}
                onDeliver={() => void act(item, () => gateway.deliver(scope, item))}
              />
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

/** Aviso en texto de los platos que quedan listos después de abrir la pantalla. */
function useReadyAnnouncement(items: readonly PickupItem[] | null): string | null {
  const seen = useRef<Set<string> | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  useEffect(() => {
    if (!items) return;
    if (seen.current === null) {
      // Lo que ya estaba listo al abrir no es nuevo.
      seen.current = new Set(items.map((item) => item.id));
      return;
    }
    const added = newlyReady(seen.current, items);
    for (const item of items) seen.current.add(item.id);
    if (added.length > 0) setAnnouncement(describeNewlyReady(added, items));
  }, [items]);
  return announcement;
}

function PickupLine({
  item,
  now,
  canDeliver,
  disabled,
  busy,
  onPickUp,
  onDeliver,
}: {
  readonly item: PickupItem;
  readonly now: Date;
  readonly canDeliver: boolean;
  readonly disabled: boolean;
  readonly busy: boolean;
  readonly onPickUp: () => void;
  readonly onDeliver: () => void;
}) {
  const what = `${item.quantity} × ${item.productName}`;
  const status = ITEM_STATUS[item.status];
  return (
    <li>
      <KitchenTicket
        tableCode={item.tableCode}
        tone={item.status === 'READY' ? 'ready' : 'pickedUp'}
        title={`Mesa ${item.tableCode} · ${what}`}
        headingLevel={2}
        waiting={item.readyAt ? formatShortWait(elapsedMinutes(item.readyAt, now)) : '—'}
        waitingLabel={describeReadySince(item.readyAt, now)}
      >
        <div className="tv-list__summary">
          <StatusChip tone={status.tone} label={status.label} />
          <span className="tv-list__meta">{item.stationName}</span>
        </div>
        {item.modifiers.length > 0 ? <p>Opciones: {item.modifiers.join(', ')}</p> : null}
        {item.note ? (
          <p>
            <strong>Nota:</strong> {item.note}
          </p>
        ) : null}
        <div className="tv-toolbar">
          {item.status === 'READY' ? (
            <TavelyoButton
              loading={busy}
              loadingLabel="Marcando…"
              disabled={disabled}
              aria-label={`Recogido ${what}, mesa ${item.tableCode}`}
              onClick={onPickUp}
            >
              <Icon name="readyToServe" />
              Recogido
            </TavelyoButton>
          ) : null}
          {item.status === 'PICKED_UP' && canDeliver ? (
            <TavelyoButton
              loading={busy}
              loadingLabel="Marcando…"
              disabled={disabled}
              aria-label={`Entregado ${what}, mesa ${item.tableCode}`}
              onClick={onDeliver}
            >
              <Icon name="serve" />
              Entregado
            </TavelyoButton>
          ) : null}
        </div>
      </KitchenTicket>
    </li>
  );
}
