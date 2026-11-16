import { useCallback, useId, useState } from 'react';
import { formatLocalTime } from '@tavelyo/core';
import {
  ActionNotice,
  ConfirmDialog,
  ErrorState,
  LoadingState,
  StatusChip,
  TavelyoButton,
  serverErrorText,
  useServerData,
  type RunCommand,
} from '@tavelyo/design-system';
import { participantStatus, type ParticipantStatus } from '../application/floor-service.ts';
import type { BranchScope, FloorServiceGateway, SessionParticipant } from '../domain/index.ts';

export interface ParticipantsPanelProps {
  readonly gateway: FloorServiceGateway;
  readonly scope: BranchScope;
  readonly sessionId: string;
  readonly tableCode: string;
  readonly timezone: string;
  readonly canRemove: boolean;
  readonly now: () => Date;
}

const STATUS: Record<
  ParticipantStatus,
  { readonly label: string; readonly tone: 'success' | 'neutral' }
> = {
  active: { label: 'En la mesa', tone: 'success' },
  expired: { label: 'Acceso vencido', tone: 'neutral' },
  removed: { label: 'Retirada', tone: 'neutral' },
};

/**
 * Personas que se unieron a la mesa desde el QR (riesgo T11 de ADR-0011): el personal ve cuántas
 * hay y retira a quien no está sentado en la mesa. El servidor no entrega su cuenta.
 */
export function ParticipantsPanel({
  gateway,
  scope,
  sessionId,
  tableCode,
  timezone,
  canRemove,
  now,
}: ParticipantsPanelProps) {
  const { tenantId, branchId } = scope;
  const load = useCallback(
    () => gateway.participants({ tenantId, branchId }, sessionId),
    [gateway, tenantId, branchId, sessionId],
  );
  const { state, notice, reload, run } = useServerData(load);
  const label = `Personas en la mesa ${tableCode}`;
  const headingId = useId();

  return (
    <section className="tv-fieldset" aria-labelledby={headingId}>
      <h3 className="tv-list__title" id={headingId}>
        {label}
      </h3>
      <ActionNotice notice={notice} />
      {state.status === 'loading' ? (
        <LoadingState message="Cargando las personas de la mesa…" />
      ) : null}
      {state.status === 'error' ? (
        <ErrorState
          title="No se pudieron cargar las personas"
          description={serverErrorText(state.error)}
          onRetry={reload}
        />
      ) : null}
      {state.status === 'ready' && state.data.length === 0 ? (
        <p className="tv-list__meta">Todavía nadie se unió desde el QR.</p>
      ) : null}
      {state.status === 'ready' && state.data.length > 0 ? (
        <ul className="tv-list" aria-label={label}>
          {state.data.map((participant, index) => (
            <ParticipantItem
              key={participant.id}
              participant={participant}
              number={index + 1}
              tableCode={tableCode}
              status={participantStatus(participant, now())}
              timezone={timezone}
              canRemove={canRemove}
              onRemove={(text) => run(() => gateway.removeParticipant(scope, participant.id), text)}
            />
          ))}
        </ul>
      ) : null}
      <div className="tv-toolbar">
        <TavelyoButton variant="secondary" onClick={reload}>
          Actualizar personas
        </TavelyoButton>
      </div>
    </section>
  );
}

interface ParticipantItemProps {
  readonly participant: SessionParticipant;
  readonly number: number;
  readonly tableCode: string;
  readonly status: ParticipantStatus;
  readonly timezone: string;
  readonly canRemove: boolean;
  readonly onRemove: (successText: string) => ReturnType<RunCommand>;
}

function ParticipantItem({
  participant,
  number,
  tableCode,
  status,
  timezone,
  canRemove,
  onRemove,
}: ParticipantItemProps) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const name = `Persona ${number}`;

  return (
    <li className="tv-list__item">
      <div className="tv-list__summary">
        <span className="tv-list__title">{name}</span>
        <StatusChip tone={STATUS[status].tone} label={STATUS[status].label} />
      </div>
      <p className="tv-list__meta">
        Se unió a las {formatLocalTime(participant.joinedAt, timezone)}
        {status === 'expired' ? '. Si sigue en la mesa, vuelve a unirse con el QR.' : ''}
      </p>
      {canRemove && status === 'active' ? (
        <div className="tv-toolbar">
          <TavelyoButton variant="secondary" onClick={() => setConfirm(true)}>
            Retirar de la mesa
          </TavelyoButton>
        </div>
      ) : null}
      <ConfirmDialog
        open={confirm}
        title={`¿Retirar a la ${name.toLowerCase()} de la mesa ${tableCode}?`}
        confirmLabel="Retirar de la mesa"
        destructive
        busy={busy}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setBusy(true);
          void onRemove(`${name} retirada de la mesa ${tableCode}.`).then(() => {
            setBusy(false);
            setConfirm(false);
          });
        }}
      >
        <p>
          Pierde el acceso a la mesa al instante. Úsalo si se unió alguien que no está sentado en la
          mesa. Si vuelve a pasar, pide a la administración generar un QR nuevo para esta mesa.
        </p>
      </ConfirmDialog>
    </li>
  );
}
