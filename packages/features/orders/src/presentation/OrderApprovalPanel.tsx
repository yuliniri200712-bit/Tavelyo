import { useCallback, useEffect, useRef, useState } from 'react';
import { elapsedMinutes, formatLocalTime, formatMoney, Money } from '@tavelyo/core';
import {
  ActionNotice,
  Card,
  ErrorState,
  Icon,
  LiveStatus,
  LoadingState,
  ReasonDialog,
  StatusChip,
  TavelyoButton,
  serverErrorText,
  useLiveData,
  type LiveSubscriber,
} from '@tavelyo/design-system';
import {
  describeApprovals,
  describeNewApprovals,
  parseRejectionReason,
  REJECTION_REASON_MAX,
} from '../application/order-approval.ts';
import type { BranchScope, OrderApprovalGateway, PendingApproval } from '../domain/index.ts';

export interface OrderApprovalPanelProps {
  readonly gateway: OrderApprovalGateway;
  readonly scope: BranchScope;
  readonly timezone: string;
  readonly now?: () => Date;
}

const systemNow = () => new Date();

function money(minor: string, currency: string): string {
  const parsed = Money.fromMinorString(minor, currency);
  return parsed.ok ? formatMoney(parsed.value) : minor;
}

function waitingText(since: Date, now: Date): string {
  const minutes = elapsedMinutes(since, now);
  if (minutes < 1) return 'Espera desde hace menos de un minuto';
  return minutes === 1 ? 'Espera desde hace 1 minuto' : `Espera desde hace ${minutes} minutos`;
}

/**
 * «Pedidos por aprobar» (D-32, order.approve; lo comprueba el servidor): pedidos que los clientes
 * enviaron desde su teléfono en una sucursal que exige aprobación, en tiempo real y del más antiguo
 * al más reciente. Aprobar lo envía a cocina; rechazar exige un motivo, que ve el cliente.
 */
export function OrderApprovalPanel({
  gateway,
  scope,
  timezone,
  now = systemNow,
}: OrderApprovalPanelProps) {
  const { tenantId, branchId } = scope;
  const load = useCallback(
    () => gateway.pending({ tenantId, branchId }),
    [gateway, tenantId, branchId],
  );
  const watch = useCallback(
    (subscriber: LiveSubscriber<readonly PendingApproval[]>) =>
      gateway.watchPending({ tenantId, branchId }, subscriber),
    [gateway, tenantId, branchId],
  );
  const { state, notice, refresh, run } = useLiveData(load, watch, { now });
  const orders = state.data;
  const announcement = useNewApprovalAnnouncement(orders);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<PendingApproval | null>(null);
  const offline = state.connection === 'offline';

  const approve = async (order: PendingApproval) => {
    setBusyId(order.id);
    await run(
      () => gateway.approve(scope, order),
      `Mesa ${order.tableCode}: pedido aprobado y enviado a cocina.`,
    );
    setBusyId(null);
  };

  const reject = async (order: PendingApproval, reason: string) => {
    setRejecting(null);
    setBusyId(order.id);
    await run(
      () => gateway.reject(scope, order, reason),
      `Mesa ${order.tableCode}: pedido rechazado.`,
    );
    setBusyId(null);
  };

  return (
    <Card title="Pedidos por aprobar" headingLevel={2}>
      {offline && orders ? (
        <LiveStatus
          state={state}
          formatTime={(date) => formatLocalTime(date, timezone)}
          liveText=""
          blockedText="No puedes aprobar ni rechazar pedidos"
          onRetry={() => void refresh()}
        />
      ) : null}
      <div role="status" aria-live="polite">
        {announcement ? <p className="tv-list__meta">{announcement}</p> : null}
      </div>
      <ActionNotice notice={notice} />
      {orders === null && state.problem === null ? (
        <LoadingState message="Cargando los pedidos por aprobar…" />
      ) : null}
      {orders === null && state.problem ? (
        <ErrorState
          title="No se pudieron cargar los pedidos por aprobar"
          description={serverErrorText(state.problem)}
          onRetry={() => void refresh()}
        />
      ) : null}
      {orders ? <p className="tv-list__meta">{describeApprovals(orders)}</p> : null}
      {orders && orders.length > 0 ? (
        <ul className="tv-list" aria-label="Pedidos por aprobar">
          {orders.map((order) => (
            <li key={order.id} className="tv-list__item">
              <div className="tv-list__summary">
                <span className="tv-list__title">Mesa {order.tableCode}</span>
                <StatusChip tone="warning" label="Por aprobar" />
              </div>
              <p className="tv-list__meta">
                {waitingText(order.requestedAt, now())} · a las{' '}
                {formatLocalTime(order.requestedAt, timezone)} · Total{' '}
                {money(order.totalMinor, order.currency)}
              </p>
              <ul
                className="tv-list"
                aria-label={`Productos del pedido de la mesa ${order.tableCode}`}
              >
                {order.lines.map((line, index) => (
                  <li key={index} className="tv-list__item">
                    <span className="tv-list__title">
                      {line.quantity} × {line.productName}
                    </span>
                    {line.modifiers.length > 0 ? (
                      <p className="tv-list__meta">{line.modifiers.join(', ')}</p>
                    ) : null}
                    {line.note ? <p className="tv-list__meta">Nota: {line.note}</p> : null}
                    {line.allergens.length > 0 ? (
                      <p className="tv-list__meta">Alérgenos: {line.allergens.join(', ')}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
              <div className="tv-toolbar">
                <TavelyoButton
                  loading={busyId === order.id}
                  loadingLabel="Aprobando…"
                  disabled={offline || busyId !== null}
                  aria-label={`Aprobar y enviar a cocina: pedido de la mesa ${order.tableCode}`}
                  onClick={() => void approve(order)}
                >
                  <Icon name="check" />
                  Aprobar
                </TavelyoButton>
                <TavelyoButton
                  variant="secondary"
                  disabled={offline || busyId !== null}
                  aria-label={`Rechazar: pedido de la mesa ${order.tableCode}`}
                  onClick={() => setRejecting(order)}
                >
                  Rechazar
                </TavelyoButton>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <ReasonDialog
        open={rejecting !== null}
        title={rejecting ? `Rechazar el pedido de la mesa ${rejecting.tableCode}` : ''}
        confirmLabel="Rechazar pedido"
        destructive
        label="Motivo"
        hint="El cliente lo verá en «Mis pedidos». Por ejemplo: «Se agotó el ajiaco»."
        maxLength={REJECTION_REASON_MAX}
        parse={parseRejectionReason}
        invalidText="Escribe un motivo de 5 a 200 caracteres."
        onConfirm={(reason) => {
          if (rejecting) void reject(rejecting, reason);
        }}
        onCancel={() => setRejecting(null)}
      >
        <p>El pedido no llegará a cocina ni se sumará a la cuenta.</p>
      </ReasonDialog>
    </Card>
  );
}

/** Aviso en texto de los pedidos que llegan después de abrir la pantalla. */
function useNewApprovalAnnouncement(orders: readonly PendingApproval[] | null): string | null {
  const seen = useRef<Set<string> | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  useEffect(() => {
    if (!orders) return;
    if (seen.current === null) {
      seen.current = new Set(orders.map((order) => order.id));
      return;
    }
    const known = seen.current;
    const added = orders.filter((order) => !known.has(order.id));
    for (const order of added) known.add(order.id);
    if (added.length > 0) setAnnouncement(describeNewApprovals(added));
  }, [orders]);
  return announcement;
}
