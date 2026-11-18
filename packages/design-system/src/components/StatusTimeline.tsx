import { Icon, type IconName } from './Icon.tsx';

export type TimelineStepState = 'done' | 'current' | 'pending';

export interface TimelineStep {
  readonly label: string;
  readonly state: TimelineStepState;
  /** Texto breve bajo el paso actual, p. ej. «Estamos preparando tus platos». */
  readonly detail?: string;
  /** Hora ya formateada en la zona de la sucursal. */
  readonly time?: string;
}

const MARKER: Readonly<Record<TimelineStepState, IconName>> = {
  done: 'check',
  current: 'current',
  pending: 'pending',
};

/** Estado de cada paso en texto, para no depender del color ni del icono. */
const STATE_TEXT: Readonly<Record<TimelineStepState, string>> = {
  done: 'completado',
  current: 'en curso',
  pending: 'pendiente',
};

export interface StatusTimelineProps {
  /** Nombre de la lista, p. ej. «Seguimiento del pedido de las 15:30». */
  readonly label: string;
  readonly steps: readonly TimelineStep[];
}

/** Línea de tiempo vertical del seguimiento (recibido → en preparación → listo → entregado). */
export function StatusTimeline({ label, steps }: StatusTimelineProps) {
  return (
    <ol className="tv-timeline" aria-label={label}>
      {steps.map((step) => (
        <li
          key={step.label}
          className={`tv-timeline__step tv-timeline__step--${step.state}`}
          aria-current={step.state === 'current' ? 'step' : undefined}
        >
          <Icon name={MARKER[step.state]} className="tv-timeline__marker" />
          <div className="tv-timeline__body">
            <span className="tv-timeline__label">
              {step.label}
              <span className="tv-visually-hidden"> ({STATE_TEXT[step.state]})</span>
            </span>
            {step.detail ? <span className="tv-timeline__detail">{step.detail}</span> : null}
          </div>
          {step.time ? <span className="tv-timeline__time tv-tabular">{step.time}</span> : null}
        </li>
      ))}
    </ol>
  );
}
