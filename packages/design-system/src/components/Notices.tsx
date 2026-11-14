import { useSyncExternalStore } from 'react';
import { TavelyoButton } from './TavelyoButton.tsx';

function subscribeToConnection(onChange: () => void): () => void {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

/** Estado de conexión del navegador. Es una pista para la interfaz, no una garantía de red. */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribeToConnection,
    () => navigator.onLine,
    () => true,
  );
}

export interface ConnectionNoticeProps {
  readonly online: boolean;
}

/** Aviso persistente sin conexión: nada se confirma sin servidor (ADR-0009). */
export function ConnectionNotice({ online }: ConnectionNoticeProps) {
  return (
    <div role="status" aria-live="polite">
      {online ? null : (
        <div className="tv-notice tv-inverse">
          <p className="tv-notice__text">
            <strong>Sin conexión.</strong> Puedes seguir viendo esta pantalla, pero ningún pedido ni
            pago se confirma hasta recuperar la conexión.
          </p>
        </div>
      )}
    </div>
  );
}

export interface UpdateNoticeProps {
  readonly onUpdate: () => void;
  readonly onDismiss: () => void;
}

/** Aviso de nueva versión de la PWA: la actualización la decide la persona, no se fuerza. */
export function UpdateNotice({ onUpdate, onDismiss }: UpdateNoticeProps) {
  return (
    <div className="tv-notice tv-inverse" role="status" aria-live="polite">
      <p className="tv-notice__text">Hay una nueva versión de Tavelyo disponible.</p>
      <TavelyoButton variant="secondary" onClick={onDismiss}>
        Más tarde
      </TavelyoButton>
      <TavelyoButton onClick={onUpdate}>Actualizar</TavelyoButton>
    </div>
  );
}
