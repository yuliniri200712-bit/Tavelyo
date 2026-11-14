import type { ReactNode } from 'react';
import { TavelyoButton } from './TavelyoButton.tsx';

export interface LoadingStateProps {
  readonly message?: string;
}

export function LoadingState({ message = 'Cargando…' }: LoadingStateProps) {
  return (
    <div className="tv-state" role="status" aria-live="polite">
      <span className="tv-spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

export interface ErrorStateProps {
  readonly title: string;
  readonly description: string;
  readonly retryLabel?: string;
  readonly onRetry?: () => void;
}

/** «No se pudo cargar» es distinto de «no hay datos» (IV §6). */
export function ErrorState({
  title,
  description,
  retryLabel = 'Reintentar',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="tv-state" role="alert">
      <h2>{title}</h2>
      <p className="tv-state__description">{description}</p>
      {onRetry ? (
        <TavelyoButton variant="secondary" onClick={onRetry}>
          {retryLabel}
        </TavelyoButton>
      ) : null}
    </div>
  );
}

export interface EmptyStateProps {
  readonly title: string;
  readonly description: string;
  /** Acción disponible para el rol actual, si la hay. */
  readonly action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="tv-state">
      <h2>{title}</h2>
      <p className="tv-state__description">{description}</p>
      {action}
    </div>
  );
}
