import { useCallback, useId, useState } from 'react';
import {
  deriveOrderStatus,
  formatLocalTime,
  isWasteOnCancel,
  ORDER_ITEM_REASON_MAX,
  ORDER_ITEM_REASON_MIN,
  parseOrderItemReason,
} from '@tavelyo/core';
import {
  ActionNotice,
  ErrorState,
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
  ITEM_STATUS,
  ORDER_STATUS_TEXT,
  sessionItemActions,
  type SessionItemPermissions,
} from '../application/staff-orders.ts';
import type {
  BranchScope,
  SessionOrder,
  SessionOrderItem,
  StaffOrdersGateway,
} from '../domain/index.ts';
import { changedText } from './changed-text.ts';

export interface SessionOrdersPanelProps extends SessionItemPermissions {
  readonly gateway: StaffOrdersGateway;
  readonly scope: BranchScope;
  readonly sessionId: string;
  readonly tableCode: string;
  readonly timezone: string;
}

type Pending = { readonly kind: 'cancel' | 'deliverDirectly'; readonly item: SessionOrderItem };

const INVALID_REASON = `Escribe el motivo (entre ${ORDER_ITEM_REASON_MIN} y ${ORDER_ITEM_REASON_MAX} caracteres).`;

/**
 * Pedidos enviados a cocina de una mesa (session.open; lo comprueba el servidor), con el estado de
 * cada línea en vivo. Según el rol: cancelar con motivo y entregar sin pasar por «recogido».
 */
export function SessionOrdersPanel({
  gateway,
  scope,
  sessionId,
  tableCode,
  timezone,
  canCancel,
  canDeliverDirectly,
}: SessionOrdersPanelProps) {
  const { tenantId, branchId } = scope;
  const load = useCallback(
    () => gateway.sessionOrders({ tenantId, branchId }, sessionId),
    [gateway, tenantId, branchId, sessionId],
  );
  const watch = useCallback(
    (subscriber: LiveSubscriber<readonly SessionOrder[]>) =>
      gateway.watchSessionOrders({ tenantId, branchId }, sessionId, subscriber),
    [gateway, tenantId, branchId, sessionId],
  );
  const { state, notice, refresh, run } = useLiveData(load, watch, { errorText: changedText });
  const [pending, setPending] = useState<Pending | null>(null);
  const headingId = useId();
  const label = `Pedidos de la mesa ${tableCode}`;
  const orders = state.data;
  const offline = state.connection === 'offline';
  const formatTime = (date: Date) => formatLocalTime(date, timezone);

  const confirm = (reason: string) => {
    if (!pending) return;
    const { kind, item } = pending;
    setPending(null);
    const what = `${item.quantity} × ${item.productName}`;
    void (kind === 'cancel'
      ? run(() => gateway.cancel(scope, item, reason), `${what} cancelado.`)
      : run(() => gateway.deliverDirectly(scope, item, reason), `${what} entregado.`));
  };

  return (
    <section className="tv-fieldset" aria-labelledby={headingId}>
      <h3 className="tv-list__title" id={headingId}>
        {label}
      </h3>
      {offline && orders ? (
        <LiveStatus
          state={state}
          formatTime={formatTime}
          liveText=""
          blockedText="No puedes cancelar ni entregar"
          onRetry={() => void refresh()}
        />
      ) : null}
      <ActionNotice notice={notice} />
      {orders === null && state.problem === null ? (
        <LoadingState message="Cargando los pedidos de la mesa…" />
      ) : null}
      {orders === null && state.problem ? (
        <ErrorState
          title="No se pudieron cargar los pedidos"
          description={serverErrorText(state.problem)}
          onRetry={() => void refresh()}
        />
      ) : null}
      {orders && orders.length === 0 ? (
        <p className="tv-list__meta">Esta mesa todavía no tiene pedidos enviados a cocina.</p>
      ) : null}
      {orders?.map((order) => (
        <article key={order.id} aria-label={`Pedido de las ${formatTime(order.sentAt)}`}>
          <h4 className="tv-list__title">
            Pedido de las {formatTime(order.sentAt)} ·{' '}
            {ORDER_STATUS_TEXT[deriveOrderStatus(order.items.map((item) => item.status))]}
          </h4>
          <ul className="tv-list">
            {order.items.map((item) => (
              <OrderLine
                key={item.id}
                item={item}
                tableCode={tableCode}
                actions={sessionItemActions(item, { canCancel, canDeliverDirectly })}
                disabled={offline}
                onCancel={() => setPending({ kind: 'cancel', item })}
                onDeliverDirectly={() => setPending({ kind: 'deliverDirectly', item })}
              />
            ))}
          </ul>
        </article>
      ))}
      <ReasonDialog
        open={pending !== null}
        title={dialogTitle(pending)}
        confirmLabel={pending?.kind === 'cancel' ? 'Cancelar línea' : 'Entregar sin recoger'}
        destructive={pending?.kind === 'cancel'}
        label={pending?.kind === 'cancel' ? 'Motivo de la cancelación' : 'Motivo'}
        hint={
          pending?.kind === 'cancel'
            ? 'Por ejemplo: el cliente ya no lo quiere.'
            : 'Por ejemplo: lo llevó quien lo preparó.'
        }
        maxLength={ORDER_ITEM_REASON_MAX}
        parse={parseOrderItemReason}
        invalidText={INVALID_REASON}
        onCancel={() => setPending(null)}
        onConfirm={confirm}
      >
        <p>{dialogText(pending, tableCode)}</p>
      </ReasonDialog>
    </section>
  );
}

function dialogTitle(pending: Pending | null): string {
  if (!pending) return 'Motivo';
  const what = `${pending.item.quantity} × ${pending.item.productName}`;
  return pending.kind === 'cancel' ? `¿Cancelar ${what}?` : `¿Entregar ${what} sin recoger?`;
}

function dialogText(pending: Pending | null, tableCode: string): string {
  if (!pending) return '';
  if (pending.kind === 'deliverDirectly') {
    return `Mesa ${tableCode}. Se marca entregada sin pasar por «Recogido». El motivo queda en el registro.`;
  }
  const waste = isWasteOnCancel(pending.item.status)
    ? 'Ya se empezó a preparar: quedará registrada como merma.'
    : 'Todavía no se empezó a preparar.';
  return `Mesa ${tableCode}. ${waste} El cobro autorizado no cambia en esta fase. El motivo queda en el registro.`;
}

function OrderLine({
  item,
  tableCode,
  actions,
  disabled,
  onCancel,
  onDeliverDirectly,
}: {
  readonly item: SessionOrderItem;
  readonly tableCode: string;
  readonly actions: ReturnType<typeof sessionItemActions>;
  readonly disabled: boolean;
  readonly onCancel: () => void;
  readonly onDeliverDirectly: () => void;
}) {
  const what = `${item.quantity} × ${item.productName}`;
  const status = ITEM_STATUS[item.status];
  return (
    <li className="tv-list__item">
      <div className="tv-list__summary">
        <span className="tv-list__title">{what}</span>
        <StatusChip tone={status.tone} label={status.label} />
      </div>
      {item.modifiers.length > 0 ? (
        <p className="tv-list__meta">Opciones: {item.modifiers.join(', ')}</p>
      ) : null}
      {item.note ? <p className="tv-list__meta">Nota: {item.note}</p> : null}
      {item.cancelReason ? (
        <p className="tv-list__meta">Motivo de la cancelación: {item.cancelReason}</p>
      ) : null}
      {actions.cancel || actions.deliverDirectly ? (
        <div className="tv-toolbar">
          {actions.deliverDirectly ? (
            <TavelyoButton
              variant="secondary"
              disabled={disabled}
              aria-label={`Entregar sin recoger ${what}, mesa ${tableCode}`}
              onClick={onDeliverDirectly}
            >
              Entregar sin recoger
            </TavelyoButton>
          ) : null}
          {actions.cancel ? (
            <TavelyoButton
              variant="secondary"
              disabled={disabled}
              aria-label={`Cancelar ${what}, mesa ${tableCode}`}
              onClick={onCancel}
            >
              Cancelar
            </TavelyoButton>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
