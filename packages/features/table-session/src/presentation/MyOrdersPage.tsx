import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { formatLocalTime, type OrderItemStatus } from '@tavelyo/core';
import {
  ActionNotice,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LiveStatus,
  LoadingState,
  StatusChip,
  StatusTimeline,
  TavelyoButton,
  useLiveData,
  type LiveSubscriber,
} from '@tavelyo/design-system';
import {
  approvalStates,
  describeApproval,
  describeApprovalChanges,
  describeMyOrder,
  describeMyOrders,
  describeStatusChanges,
  itemStatuses,
  MY_ITEM_STATUS,
  orderProgress,
} from '../application/my-orders.ts';
import { formatMinor } from '../application/review-text.ts';
import type { MyOrder, PublicMenu, TableSeat } from '../domain/index.ts';
import { MenuGate } from './MenuGate.tsx';
import { ServiceCard } from './ServiceCard.tsx';
import { useTableOrder } from './TableOrderProvider.tsx';
import { customerErrorText } from './useCheckout.ts';

export interface MyOrdersPageProps {
  /** Enlace para volver a la carta (la navegación es de la app). */
  readonly menuLink: ReactNode;
}

/**
 * «Mis pedidos» (D-06): solo los de esta persona, con el estado de cada línea en vivo y en texto
 * (ADR-0007). Desde aquí también llama al mesero o pide la cuenta.
 */
export function MyOrdersPage({ menuLink }: MyOrdersPageProps) {
  return (
    <MenuGate>
      {(menu) => (
        <div className="tv-page">
          <header className="tv-page__header">
            <div>
              <h1>Mis pedidos</h1>
              <p className="tv-list__meta">
                {menu.branchName} · Mesa {menu.tableCode}
              </p>
            </div>
            <div className="tv-toolbar">{menuLink}</div>
          </header>
          <ServiceCard />
          <MyOrdersContent menu={menu} />
        </div>
      )}
    </MenuGate>
  );
}

type Lookup =
  | { readonly status: 'checking' }
  | { readonly status: 'done' }
  | {
      readonly status: 'error';
      readonly text: string;
    };

function MyOrdersContent({ menu }: { readonly menu: PublicMenu }) {
  const { seat } = useTableOrder();
  const { resume } = seat;
  const [lookup, setLookup] = useState<Lookup>({ status: 'checking' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    void resume().then((result) => {
      if (!active) return;
      setLookup(
        result.ok ? { status: 'done' } : { status: 'error', text: customerErrorText(result.error) },
      );
    });
    return () => {
      active = false;
    };
  }, [resume, attempt]);

  if (seat.seat) return <LiveOrders seat={seat.seat} menu={menu} />;
  if (lookup.status === 'checking') return <LoadingState message="Buscando tus pedidos…" />;
  if (lookup.status === 'error') {
    return (
      <ErrorState
        title="No pudimos ver tus pedidos"
        description={lookup.text}
        onRetry={() => {
          setLookup({ status: 'checking' });
          setAttempt((n) => n + 1);
        }}
      />
    );
  }
  return (
    <EmptyState
      title="Todavía no tienes pedidos"
      description="Cuando envíes un pedido, aquí verás cómo avanza en cocina."
    />
  );
}

function LiveOrders({ seat, menu }: { readonly seat: TableSeat; readonly menu: PublicMenu }) {
  const { gateway, now } = useTableOrder();
  const { sessionId, branchId } = seat;
  const load = useCallback(
    () => gateway.myOrders({ sessionId, branchId }),
    [gateway, sessionId, branchId],
  );
  const watch = useCallback(
    (subscriber: LiveSubscriber<readonly MyOrder[]>) =>
      gateway.watchMyOrders({ sessionId, branchId }, subscriber),
    [gateway, sessionId, branchId],
  );
  const { state, notice, refresh, run } = useLiveData(load, watch, { now });
  const orders = state.data;
  const announcement = useStatusAnnouncement(orders);
  const formatTime = (date: Date) => formatLocalTime(date, menu.timezone);
  const [withdrawing, setWithdrawing] = useState<MyOrder | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const withdraw = async (order: MyOrder) => {
    setWithdrawing(null);
    setBusyId(order.id);
    await run(() => gateway.withdraw({ sessionId, branchId }, order.id), 'Retiraste el pedido.');
    setBusyId(null);
  };

  return (
    <section className="tv-page" aria-label="Estado de tus pedidos">
      {orders ? (
        <LiveStatus
          state={state}
          formatTime={formatTime}
          liveText="Los cambios de tus pedidos llegan solos."
          blockedText="Los estados pueden no estar al día"
          onRetry={() => void refresh()}
        />
      ) : null}
      <div role="status" aria-live="polite">
        {announcement ? <p className="tv-list__meta">{announcement}</p> : null}
      </div>
      <ActionNotice notice={notice} />
      {orders === null && state.problem === null ? (
        <LoadingState message="Cargando tus pedidos…" />
      ) : null}
      {orders === null && state.problem ? (
        <ErrorState
          title="No pudimos cargar tus pedidos"
          description={customerErrorText(state.problem)}
          onRetry={() => void refresh()}
        />
      ) : null}
      {orders ? <p className="tv-list__meta">{describeMyOrders(orders)}</p> : null}
      {orders?.map((order) => {
        const sentAt = formatTime(order.placedAt);
        const approval = describeApproval(order);
        const progress = approval ? null : orderProgress(order);
        return (
          <article
            key={order.id}
            className="tv-card tv-order"
            aria-label={`Pedido de las ${sentAt}`}
          >
            <h2>
              Pedido de las {sentAt} · {approval ? approval.label : describeMyOrder(order)}
            </h2>
            {approval ? (
              <>
                <StatusChip tone={approval.tone} label={approval.label} />
                <p>{approval.detail}</p>
                {order.approval === 'PENDING' ? (
                  <div className="tv-toolbar">
                    <TavelyoButton
                      variant="secondary"
                      loading={busyId === order.id}
                      loadingLabel="Retirando…"
                      disabled={busyId !== null || state.connection === 'offline'}
                      onClick={() => setWithdrawing(order)}
                    >
                      Retirar pedido
                    </TavelyoButton>
                  </div>
                ) : null}
              </>
            ) : null}
            {progress ? (
              <StatusTimeline
                label={`Seguimiento del pedido de las ${sentAt}`}
                steps={progress.map((step, index) =>
                  index === 0 ? { ...step, time: sentAt } : step,
                )}
              />
            ) : null}
            <ul className="tv-list" aria-label={`Platos del pedido de las ${sentAt}`}>
              {order.items.map((item) => {
                const status = MY_ITEM_STATUS[item.status];
                return (
                  <li key={item.id} className="tv-list__item">
                    <div className="tv-list__summary">
                      <span className="tv-list__title">
                        {item.quantity} × {item.productName}
                      </span>
                      {approval ? null : <StatusChip tone={status.tone} label={status.label} />}
                    </div>
                    {item.modifiers.length > 0 ? (
                      <p className="tv-list__meta">{item.modifiers.join(', ')}</p>
                    ) : null}
                    {item.note ? <p className="tv-list__meta">Nota: {item.note}</p> : null}
                    <p className="tv-list__meta">
                      {formatMinor(item.lineTotalMinor, order.currency)}
                    </p>
                  </li>
                );
              })}
            </ul>
            <p className="tv-order__total">
              <span>Total</span>
              <span className="tv-tabular">{formatMinor(order.totalMinor, order.currency)}</span>
            </p>
          </article>
        );
      })}
      <ConfirmDialog
        open={withdrawing !== null}
        title="¿Retirar este pedido?"
        confirmLabel="Retirar pedido"
        cancelLabel="Seguir esperando"
        destructive
        onConfirm={() => {
          if (withdrawing) void withdraw(withdrawing);
        }}
        onCancel={() => setWithdrawing(null)}
      >
        <p>No llegará a cocina ni se sumará a tu cuenta. Puedes volver a pedir desde la carta.</p>
      </ConfirmDialog>
    </section>
  );
}

/**
 * Aviso en texto de cada línea que cambia de estado, y de cada decisión del mesero (D-32), mientras
 * la pantalla está abierta.
 */
function useStatusAnnouncement(orders: readonly MyOrder[] | null): string | null {
  const previous = useRef<{
    readonly items: Map<string, OrderItemStatus>;
    readonly approvals: Map<string, MyOrder['approval']>;
  } | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  useEffect(() => {
    if (!orders) return;
    const before = previous.current;
    previous.current = { items: itemStatuses(orders), approvals: approvalStates(orders) };
    // La primera lectura no es un cambio: es lo que ya había al abrir.
    if (!before) return;
    const text = [
      describeApprovalChanges(before.approvals, orders),
      describeStatusChanges(before.items, orders),
    ]
      .filter(Boolean)
      .join(' ');
    if (text) setAnnouncement(text);
  }, [orders]);
  return announcement;
}
