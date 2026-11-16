import { useCallback, useEffect, useRef, useState } from 'react';
import { formatLocalTime } from '@tavelyo/core';
import {
  ActionNotice,
  Card,
  ErrorState,
  LiveStatus,
  LoadingState,
  StatusChip,
  TavelyoButton,
  serverErrorText,
  useLiveData,
  type LiveSubscriber,
} from '@tavelyo/design-system';
import {
  describeNewRequests,
  describePending,
  describeWaiting,
  newRequests,
  REQUEST_KIND_TEXT,
} from '../application/pending-requests.ts';
import type { BranchScope, PendingRequest, ServiceRequestsGateway } from '../domain/index.ts';

export interface ServiceRequestsPanelProps {
  readonly gateway: ServiceRequestsGateway;
  readonly scope: BranchScope;
  readonly timezone: string;
  readonly now?: () => Date;
}

const systemNow = () => new Date();

/**
 * Solicitudes pendientes de la sucursal (service_request.handle; lo comprueba el servidor), en
 * tiempo real y de la más antigua a la más reciente: «Atendida».
 */
export function ServiceRequestsPanel({
  gateway,
  scope,
  timezone,
  now = systemNow,
}: ServiceRequestsPanelProps) {
  const { tenantId, branchId } = scope;
  const load = useCallback(
    () => gateway.pending({ tenantId, branchId }),
    [gateway, tenantId, branchId],
  );
  const watch = useCallback(
    (subscriber: LiveSubscriber<readonly PendingRequest[]>) =>
      gateway.watchPending({ tenantId, branchId }, subscriber),
    [gateway, tenantId, branchId],
  );
  const { state, notice, refresh, run } = useLiveData(load, watch, { now });
  const requests = state.data;
  const announcement = useNewRequestAnnouncement(requests);
  const [busyId, setBusyId] = useState<string | null>(null);
  const offline = state.connection === 'offline';

  const attend = async (request: PendingRequest) => {
    setBusyId(request.id);
    await run(
      () => gateway.attend(scope, request.id),
      `Mesa ${request.tableCode}: solicitud atendida.`,
    );
    setBusyId(null);
  };

  return (
    <Card title="Solicitudes de las mesas" headingLevel={2}>
      {offline && requests ? (
        <LiveStatus
          state={state}
          formatTime={(date) => formatLocalTime(date, timezone)}
          liveText=""
          blockedText="No puedes marcar solicitudes como atendidas"
          onRetry={() => void refresh()}
        />
      ) : null}
      <div role="status" aria-live="polite">
        {announcement ? <p className="tv-list__meta">{announcement}</p> : null}
      </div>
      <ActionNotice notice={notice} />
      {requests === null && state.problem === null ? (
        <LoadingState message="Cargando las solicitudes…" />
      ) : null}
      {requests === null && state.problem ? (
        <ErrorState
          title="No se pudieron cargar las solicitudes"
          description={serverErrorText(state.problem)}
          onRetry={() => void refresh()}
        />
      ) : null}
      {requests ? <p className="tv-list__meta">{describePending(requests)}</p> : null}
      {requests && requests.length > 0 ? (
        <ul className="tv-list" aria-label="Solicitudes pendientes">
          {requests.map((request) => (
            <li key={request.id} className="tv-list__item">
              <div className="tv-list__summary">
                <span className="tv-list__title">Mesa {request.tableCode}</span>
                <StatusChip
                  tone={request.kind === 'REQUEST_BILL' ? 'info' : 'warning'}
                  label={REQUEST_KIND_TEXT[request.kind]}
                />
              </div>
              <p className="tv-list__meta">
                {describeWaiting(request.createdAt, now())} · a las{' '}
                {formatLocalTime(request.createdAt, timezone)}
              </p>
              <div className="tv-toolbar">
                <TavelyoButton
                  loading={busyId === request.id}
                  loadingLabel="Marcando…"
                  disabled={offline || busyId !== null}
                  aria-label={`Atendida: mesa ${request.tableCode}, ${REQUEST_KIND_TEXT[
                    request.kind
                  ].toLowerCase()}`}
                  onClick={() => void attend(request)}
                >
                  Atendida
                </TavelyoButton>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}

/** Aviso en texto de las solicitudes que llegan después de abrir la pantalla. */
function useNewRequestAnnouncement(requests: readonly PendingRequest[] | null): string | null {
  const seen = useRef<Set<string> | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  useEffect(() => {
    if (!requests) return;
    if (seen.current === null) {
      seen.current = new Set(requests.map((request) => request.id));
      return;
    }
    const added = newRequests(seen.current, requests);
    for (const request of added) seen.current.add(request.id);
    if (added.length > 0) setAnnouncement(describeNewRequests(added));
  }, [requests]);
  return announcement;
}
