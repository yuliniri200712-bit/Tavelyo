import { StatusChip } from './StatusChip.tsx';
import { TavelyoButton } from './TavelyoButton.tsx';
import type { LiveState } from './useLiveData.ts';

export interface LiveStatusProps {
  readonly state: LiveState<unknown>;
  /** Hora en la zona de la sucursal (la formatea quien conoce la zona). */
  readonly formatTime: (date: Date) => string;
  /** Qué llega solo mientras hay conexión, p. ej. «Los pedidos y los cambios llegan solos.». */
  readonly liveText: string;
  /** Qué queda bloqueado sin conexión, p. ej. «No puedes avanzar líneas». */
  readonly blockedText: string;
  readonly onRetry: () => void;
}

/**
 * Estado de la conexión en tiempo real, en texto (el color nunca es la única señal). Sin conexión
 * conserva la hora de la última actualización y explica qué no se puede hacer.
 */
export function LiveStatus({ state, formatTime, liveText, blockedText, onRetry }: LiveStatusProps) {
  const updated = state.lastUpdated
    ? ` Última actualización a las ${formatTime(state.lastUpdated)}.`
    : '';
  if (state.connection === 'live') {
    return (
      <p className="tv-list__meta" role="status">
        <StatusChip tone="success" label="En vivo" /> {liveText}
        {updated}
      </p>
    );
  }
  if (state.connection === 'connecting') {
    return (
      <p className="tv-list__meta" role="status">
        <StatusChip tone="neutral" label="Conectando…" />
        {updated}
      </p>
    );
  }
  const revoked = state.problem?.kind === 'unauthorized';
  return (
    <div className="tv-notice tv-inverse" role="status">
      <p className="tv-notice__text">
        <strong>{revoked ? 'Sin permiso.' : 'Sin conexión con el servidor.'}</strong>
        {updated} {blockedText} hasta{' '}
        {revoked ? 'volver a iniciar sesión.' : 'recuperar la conexión; se reintenta sola.'}
      </p>
      {revoked ? null : (
        <TavelyoButton variant="secondary" onClick={onRetry}>
          Reintentar ahora
        </TavelyoButton>
      )}
    </div>
  );
}
