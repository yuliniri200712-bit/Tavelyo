import { useCallback, useState, type ReactNode } from 'react';
import { formatLocalTime } from '@tavelyo/core';
import {
  ActionNotice,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusChip,
  TavelyoButton,
  serverErrorText,
  useServerData,
} from '@tavelyo/design-system';
import type { BillingGateway, BranchScope, OpenTable } from '../domain/index.ts';
import { BillPanel } from './BillPanel.tsx';

export interface BillingDeskProps {
  readonly gateway: BillingGateway;
  readonly scope: BranchScope;
  readonly timezone: string;
  readonly canRefund: boolean;
  readonly canClose: boolean;
  readonly cashTillOpen: boolean;
  readonly onCashMoved: () => void;
  readonly receiptLink: (sessionId: string, paymentId: string) => ReactNode;
}

/** Mesas abiertas de la sucursal y la cuenta de la que se elija (bloque 6a). */
export function BillingDesk({
  gateway,
  scope,
  timezone,
  canRefund,
  canClose,
  cashTillOpen,
  onCashMoved,
  receiptLink,
}: BillingDeskProps) {
  const { tenantId, branchId } = scope;
  const load = useCallback(
    () => gateway.openTables({ tenantId, branchId }),
    [gateway, tenantId, branchId],
  );
  const { state, reload, refresh } = useServerData(load);
  const [selected, setSelected] = useState<OpenTable | null>(null);
  const [closedText, setClosedText] = useState<string | null>(null);

  return (
    <Card title="Mesas abiertas" headingLevel={2}>
      <ActionNotice notice={closedText ? { tone: 'success', text: closedText } : null} />
      <div className="tv-toolbar">
        <TavelyoButton variant="secondary" onClick={refresh}>
          Actualizar mesas
        </TavelyoButton>
      </div>
      {state.status === 'loading' ? <LoadingState message="Cargando las mesas…" /> : null}
      {state.status === 'error' ? (
        <ErrorState
          title="No se pudieron cargar las mesas"
          description={serverErrorText(state.error)}
          onRetry={reload}
        />
      ) : null}
      {state.status === 'ready' && state.data.length === 0 ? (
        <EmptyState
          title="No hay mesas abiertas"
          description="Las mesas abiertas en el salón aparecen aquí."
        />
      ) : null}
      {state.status === 'ready' && state.data.length > 0 ? (
        <ul className="tv-list" aria-label="Mesas abiertas">
          {state.data.map((table) => (
            <li key={table.sessionId} className="tv-list__item">
              <span className="tv-list__title">Mesa {table.tableCode}</span>
              <span className="tv-list__meta">
                {table.sectorName} · abierta a las {formatLocalTime(table.openedAt, timezone)}
              </span>
              {table.billRequestedAt ? (
                <StatusChip
                  label={`Pidió la cuenta a las ${formatLocalTime(table.billRequestedAt, timezone)}`}
                  tone="warning"
                />
              ) : null}
              <TavelyoButton
                variant={selected?.sessionId === table.sessionId ? 'primary' : 'secondary'}
                aria-pressed={selected?.sessionId === table.sessionId}
                onClick={() => {
                  setClosedText(null);
                  setSelected(table);
                }}
              >
                Ver la cuenta de la mesa {table.tableCode}
              </TavelyoButton>
            </li>
          ))}
        </ul>
      ) : null}
      {selected ? (
        <BillPanel
          key={selected.sessionId}
          gateway={gateway}
          scope={{ ...scope, sessionId: selected.sessionId }}
          tableCode={selected.tableCode}
          canRefund={canRefund}
          canClose={canClose}
          cashTillOpen={cashTillOpen}
          onCashMoved={onCashMoved}
          onClosed={() => {
            setClosedText(`Mesa ${selected.tableCode} cerrada y su cuenta saldada.`);
            setSelected(null);
            refresh();
          }}
          receiptLink={(paymentId) => receiptLink(selected.sessionId, paymentId)}
        />
      ) : null}
    </Card>
  );
}
