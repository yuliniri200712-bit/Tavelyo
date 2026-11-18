import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon.tsx';

/** Estado visual de una mesa en el salón. El texto del estado lo pone quien la usa. */
export type TableTone = 'free' | 'open' | 'attention' | 'ready';

const DEFAULT_ICON: Readonly<Record<TableTone, IconName>> = {
  free: 'freeTable',
  open: 'people',
  attention: 'callWaiter',
  ready: 'readyToServe',
};

export interface TableTileProps {
  /** Código de la mesa, p. ej. «M1». */
  readonly code: string;
  /** Estado en texto, p. ej. «Libre» o «Solicita servicio»: el color nunca es la única señal. */
  readonly status: string;
  readonly tone: TableTone;
  readonly icon?: IconName;
  /** Detalle breve en texto, p. ej. «Abierta 12:40 · 2 en cocina». */
  readonly detail?: ReactNode;
  /** Acciones de la mesa (abrir, ver pedidos…). */
  readonly children?: ReactNode;
}

/** Tarjeta de mesa para la cuadrícula del salón: código grande, icono, estado y detalle. */
export function TableTile({ code, status, tone, icon, detail, children }: TableTileProps) {
  return (
    <div className={`tv-table-tile tv-table-tile--${tone}`}>
      <div className="tv-table-tile__head">
        <Icon name={icon ?? DEFAULT_ICON[tone]} size="large" className="tv-table-tile__icon" />
        <span className="tv-table-tile__code">Mesa {code}</span>
      </div>
      <p className="tv-table-tile__status">{status}</p>
      {detail ? <div className="tv-table-tile__detail">{detail}</div> : null}
      {children ? <div className="tv-table-tile__actions">{children}</div> : null}
    </div>
  );
}
