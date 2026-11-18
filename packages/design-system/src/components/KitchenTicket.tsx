import type { ReactNode } from 'react';
import { Icon } from './Icon.tsx';
import { classNames } from './class-names.ts';

/** Estado visual del ticket: el texto del estado lo pone quien lo usa. */
export type TicketTone = 'received' | 'preparing' | 'ready';

export interface KitchenTicketProps {
  /** Código de la mesa, p. ej. «M1». */
  readonly tableCode: string;
  readonly tone: TicketTone;
  /** Título del ticket (p. ej. «Mesa M1 · 2 × Bandeja paisa»), con su nivel de encabezado. */
  readonly title: string;
  readonly headingLevel?: 2 | 3;
  /** Espera en texto, p. ej. «12 min»; se muestra grande y con cifras tabulares. */
  readonly waiting: string;
  /** Nombre accesible de la espera, p. ej. «Espera: 12 minutos». */
  readonly waitingLabel: string;
  /** Recién llegado: borde destacado; el aviso en texto lo pone quien lo usa. */
  readonly isNew?: boolean;
  readonly children: ReactNode;
}

/**
 * Ticket de cocina (IV §9): bloque de la mesa en color con el código grande, espera visible y
 * contenido (estado, opciones, alérgenos y acciones). Pensado para leerse a distancia.
 */
export function KitchenTicket({
  tableCode,
  tone,
  title,
  headingLevel = 3,
  waiting,
  waitingLabel,
  isNew = false,
  children,
}: KitchenTicketProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className={classNames('tv-ticket', isNew && 'tv-ticket--new')}>
      <div className={`tv-ticket__table tv-ticket__table--${tone}`} aria-hidden="true">
        <Icon name="dish" />
        <span className="tv-ticket__table-label">Mesa</span>
        <span className="tv-ticket__table-code">{tableCode}</span>
      </div>
      <div className="tv-ticket__body">
        <div className="tv-ticket__head">
          <Heading className="tv-ticket__title">{title}</Heading>
          <span className="tv-ticket__waiting tv-tabular">
            <Icon name="timer" />
            <span aria-hidden="true">{waiting}</span>
            <span className="tv-visually-hidden">{waitingLabel}</span>
          </span>
        </div>
        {children}
      </div>
    </article>
  );
}
