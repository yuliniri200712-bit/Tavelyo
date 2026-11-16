import { useCallback, useEffect, useRef, useState } from 'react';
import { formatLocalTime } from '@tavelyo/core';
import {
  ActionNotice,
  CheckboxField,
  EmptyState,
  ErrorState,
  LiveStatus,
  LoadingState,
  ReasonDialog,
  SelectField,
  StatusChip,
  TavelyoButton,
  serverErrorText,
  useServerData,
  type ActionResult,
} from '@tavelyo/design-system';
import {
  CANCEL_REASON_MAX,
  describeElapsed,
  describeNewOrders,
  describeQueue,
  elapsedMinutes,
  newOrderIds,
  parseCancelReason,
} from '../application/kitchen-queue.ts';
import type {
  BranchScope,
  KitchenError,
  KitchenGateway,
  KitchenItem,
  KitchenStation,
} from '../domain/index.ts';
import { useKitchenQueue } from './useKitchenQueue.ts';

/** Estación elegida en este equipo (comodidad local; la autorización la decide el servidor). */
export interface StationMemory {
  read(branchId: string): string | null;
  write(branchId: string, stationId: string): void;
}

export interface KitchenPageProps {
  readonly gateway: KitchenGateway;
  readonly scope: BranchScope;
  readonly branchName: string;
  readonly timezone: string;
  readonly memory?: StationMemory;
  /** Sonido del aviso de pedido nuevo (por defecto, un tono corto del navegador). */
  readonly chime?: () => void;
  readonly now?: () => Date;
}

const memoryKey = (branchId: string) => `tavelyo.cocina.estacion.${branchId}`;

export const browserStationMemory: StationMemory = {
  read(branchId) {
    try {
      return window.localStorage.getItem(memoryKey(branchId));
    } catch {
      return null;
    }
  },
  write(branchId, stationId) {
    try {
      window.localStorage.setItem(memoryKey(branchId), stationId);
    } catch {
      // Sin almacenamiento: la estación se vuelve a elegir al abrir la pantalla.
    }
  },
};

/** Tono corto con la API de audio del navegador (sin archivos ni paquetes). */
export function browserChime(): void {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 880;
    gain.gain.value = 0.2;
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.25);
    oscillator.onended = () => void context.close();
  } catch {
    // Sin audio disponible: el aviso sigue siendo visible y en texto.
  }
}

const CHANGED_TEXT = 'Esta línea ya cambió. La pantalla muestra el estado actual.';
const NEW_HIGHLIGHT_MS = 60_000;

function errorText(error: KitchenError): string {
  if (error.kind === 'rejected' && /ya cambió/.test(error.message)) return CHANGED_TEXT;
  return serverErrorText(error);
}

/**
 * Pantalla de cocina (kitchen.advance; lo comprueba el servidor). Cola de la estación elegida en
 * tiempo real, con «Empezar», «Listo» y cancelar con motivo. Sin conexión lo dice, muestra la
 * hora de la última actualización y no deja avanzar estados.
 */
export function KitchenPage(props: KitchenPageProps) {
  const { gateway, scope, memory = browserStationMemory } = props;
  const { tenantId, branchId } = scope;
  const load = useCallback(
    () => gateway.stations({ tenantId, branchId }),
    [gateway, tenantId, branchId],
  );
  const { state, reload } = useServerData<readonly KitchenStation[]>(load);
  const [chosen, setChosen] = useState<string | null>(() => memory.read(branchId));

  const stations = state.status === 'ready' ? state.data : [];
  const station =
    stations.find((s) => s.id === chosen) ??
    (stations.length === 1 ? stations[0] : undefined) ??
    null;

  return (
    <div className="tv-page">
      <header className="tv-page__header">
        <div>
          <h1>Cocina</h1>
          <p className="tv-list__meta">
            {props.branchName}
            {station ? ` · ${station.name}` : ''}
          </p>
        </div>
      </header>
      {state.status === 'loading' ? <LoadingState message="Cargando las estaciones…" /> : null}
      {state.status === 'error' ? (
        <ErrorState
          title="No se pudieron cargar las estaciones"
          description={serverErrorText(state.error)}
          onRetry={reload}
        />
      ) : null}
      {state.status === 'ready' && stations.length === 0 ? (
        <EmptyState
          title="La sucursal no tiene estaciones activas"
          description="La administración las crea en «Estaciones de cocina». Con el primer pedido se crea la predeterminada."
        />
      ) : null}
      {stations.length > 1 ? (
        <SelectField
          label="Estación que atiendes"
          hint="Verás solo los productos que se preparan en esta estación."
          value={station?.id ?? ''}
          onChange={(event) => {
            setChosen(event.target.value);
            memory.write(branchId, event.target.value);
          }}
        >
          <option value="" disabled>
            Elige una estación
          </option>
          {stations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </SelectField>
      ) : null}
      {station ? <StationQueue key={station.id} station={station} props={props} /> : null}
    </div>
  );
}

function StationQueue({
  station,
  props,
}: {
  readonly station: KitchenStation;
  readonly props: KitchenPageProps;
}) {
  const { gateway, scope, timezone, chime = browserChime } = props;
  const now = props.now ?? (() => new Date());
  const { state, refresh } = useKitchenQueue(gateway, scope, station.id, { now });
  const [notice, setNotice] = useState<ActionResult>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<KitchenItem | null>(null);
  const [sound, setSound] = useState(false);
  const items = state.data;
  const fresh = useFreshOrders(items, sound ? chime : null, now);
  const [, setTick] = useState(0);

  // Los minutos de espera se actualizan solos.
  useEffect(() => {
    const timer = window.setInterval(() => setTick((n) => n + 1), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const offline = state.connection !== 'live';
  const act = async (item: KitchenItem, run: () => ReturnType<KitchenGateway['start']>) => {
    setBusyId(item.id);
    const result = await run();
    setBusyId(null);
    if (result.ok) {
      setNotice(null);
    } else {
      setNotice({ tone: 'error', text: errorText(result.error) });
    }
    // Pase lo que pase, la pantalla vuelve a mostrar lo que dice el servidor.
    await refresh();
  };

  return (
    <section aria-label={`Cola de ${station.name}`}>
      <LiveStatus
        state={state}
        formatTime={(date) => formatLocalTime(date, timezone)}
        liveText="Los pedidos y los cambios llegan solos."
        blockedText="No puedes avanzar líneas"
        onRetry={() => void refresh()}
      />
      <div role="status" aria-live="polite">
        {fresh.announcement ? <p className="tv-list__meta">{fresh.announcement}</p> : null}
      </div>
      <CheckboxField
        label="Sonido con cada pedido nuevo"
        hint="El aviso también aparece en pantalla y en texto."
        checked={sound}
        onChange={(event) => setSound(event.target.checked)}
      />
      <ActionNotice notice={notice} />
      {items === null && state.connection === 'connecting' ? (
        <LoadingState message="Cargando la cola…" />
      ) : null}
      {items ? (
        <>
          <p className="tv-list__meta">{describeQueue(items)}</p>
          <ul className="tv-kitchen-queue" aria-label={`Líneas de ${station.name}`}>
            {items.map((item) => (
              <QueueItem
                key={item.id}
                item={item}
                isNew={fresh.ids.has(item.orderId)}
                timezone={timezone}
                now={now()}
                disabled={offline || busyId !== null}
                busy={busyId === item.id}
                onStart={() => void act(item, () => gateway.start(scope, item))}
                onFinish={() => void act(item, () => gateway.finish(scope, item))}
                onCancel={() => setCancelling(item)}
              />
            ))}
          </ul>
        </>
      ) : null}
      <CancelDialog
        item={cancelling}
        onClose={() => setCancelling(null)}
        onConfirm={async (item, reason) => {
          setCancelling(null);
          await act(item, () => gateway.cancel(scope, item, reason));
        }}
      />
    </section>
  );
}

/** Pedidos llegados después de abrir la pantalla: aviso en texto, marca visible y sonido opcional. */
function useFreshOrders(
  items: readonly KitchenItem[] | null,
  chime: (() => void) | null,
  now: () => Date,
) {
  const seen = useRef<Set<string> | null>(null);
  const [fresh, setFresh] = useState<{ ids: Map<string, number>; announcement: string | null }>({
    ids: new Map(),
    announcement: null,
  });

  useEffect(() => {
    if (!items) return;
    if (seen.current === null) {
      // La primera lectura no es «nueva»: es lo que ya estaba pendiente al abrir.
      seen.current = new Set(items.map((item) => item.orderId));
      return;
    }
    const added = newOrderIds(seen.current, items);
    if (added.length === 0) return;
    for (const id of added) seen.current.add(id);
    const at = now().getTime();
    setFresh((current) => {
      const ids = new Map(current.ids);
      for (const id of added) ids.set(id, at);
      return { ids, announcement: describeNewOrders(added, items) };
    });
    chime?.();
  }, [items, chime, now]);

  const at = now().getTime();
  const ids = new Set(
    [...fresh.ids].filter(([, since]) => at - since < NEW_HIGHLIGHT_MS).map(([id]) => id),
  );
  return { ids, announcement: fresh.announcement };
}

function QueueItem({
  item,
  isNew,
  timezone,
  now,
  disabled,
  busy,
  onStart,
  onFinish,
  onCancel,
}: {
  readonly item: KitchenItem;
  readonly isNew: boolean;
  readonly timezone: string;
  readonly now: Date;
  readonly disabled: boolean;
  readonly busy: boolean;
  readonly onStart: () => void;
  readonly onFinish: () => void;
  readonly onCancel: () => void;
}) {
  const what = `${item.quantity} × ${item.productName}`;
  const waiting = item.status === 'RECEIVED';
  return (
    <li className={`tv-kitchen-item${isNew ? ' tv-kitchen-item--new' : ''}`}>
      <div className="tv-list__summary">
        <h2 className="tv-kitchen-item__title">
          Mesa {item.tableCode} · {what}
        </h2>
        <StatusChip
          tone={waiting ? 'warning' : 'info'}
          label={waiting ? 'Por empezar' : 'En preparación'}
        />
        {isNew ? <StatusChip tone="info" label="Nuevo" /> : null}
      </div>
      <p className="tv-list__meta">
        {describeElapsed(elapsedMinutes(item.sentAt, now))} · llegó a las{' '}
        {formatLocalTime(item.sentAt, timezone)}
      </p>
      {item.modifiers.length > 0 ? <p>Opciones: {item.modifiers.join(', ')}</p> : null}
      {item.note ? (
        <p>
          <strong>Nota:</strong> {item.note}
        </p>
      ) : null}
      <p className="tv-kitchen-allergens">
        {item.allergens.length > 0 ? (
          <>
            <strong>Alérgenos declarados:</strong> {item.allergens.join(', ')}
          </>
        ) : (
          'Sin alérgenos declarados.'
        )}
      </p>
      <div className="tv-toolbar">
        {waiting ? (
          <TavelyoButton
            loading={busy}
            loadingLabel="Empezando…"
            disabled={disabled}
            aria-label={`Empezar ${what}, mesa ${item.tableCode}`}
            onClick={onStart}
          >
            Empezar
          </TavelyoButton>
        ) : (
          <TavelyoButton
            loading={busy}
            loadingLabel="Marcando…"
            disabled={disabled}
            aria-label={`Listo ${what}, mesa ${item.tableCode}`}
            onClick={onFinish}
          >
            Listo
          </TavelyoButton>
        )}
        <TavelyoButton
          variant="secondary"
          disabled={disabled}
          aria-label={`Cancelar ${what}, mesa ${item.tableCode}`}
          onClick={onCancel}
        >
          Cancelar
        </TavelyoButton>
      </div>
    </li>
  );
}

function CancelDialog({
  item,
  onClose,
  onConfirm,
}: {
  readonly item: KitchenItem | null;
  readonly onClose: () => void;
  readonly onConfirm: (item: KitchenItem, reason: string) => Promise<void>;
}) {
  return (
    <ReasonDialog
      open={item !== null}
      title={item ? `¿Cancelar ${item.quantity} × ${item.productName}?` : 'Cancelar línea'}
      confirmLabel="Cancelar línea"
      destructive
      label="Motivo de la cancelación"
      hint="Por ejemplo: se acabó un ingrediente."
      maxLength={CANCEL_REASON_MAX}
      parse={parseCancelReason}
      invalidText={`Escribe el motivo (entre 3 y ${CANCEL_REASON_MAX} caracteres).`}
      onCancel={onClose}
      onConfirm={(reason) => {
        if (item) void onConfirm(item, reason);
      }}
    >
      <p>
        {item ? `Mesa ${item.tableCode}. ` : ''}
        {item?.status === 'IN_PREPARATION'
          ? 'Ya se empezó a preparar: quedará registrada como merma.'
          : 'Todavía no se empezó a preparar.'}{' '}
        El motivo queda en el registro.
      </p>
    </ReasonDialog>
  );
}
