import type { ReactNode } from 'react';
import { ConnectionNotice, UpdateNotice, useOnlineStatus } from '@tavelyo/design-system';
import logoUrl from '../../../assets/branding/tavelyo-logo-master.svg';
import logoOnDarkUrl from '../../../assets/branding/tavelyo-logo-horizontal-dark.svg';

export interface PwaUpdateState {
  /** Hay un service worker nuevo esperando. */
  readonly needRefresh: boolean;
  readonly onUpdate: () => void;
  readonly onDismiss: () => void;
}

export interface PwaShellProps {
  /** Nombre del módulo junto al logo, p. ej. «Operaciones». */
  readonly appLabel: string;
  readonly update: PwaUpdateState;
  /** Acciones de la cabecera, p. ej. el contexto activo y «Cerrar sesión». */
  readonly headerActions?: ReactNode;
  /** Cabecera clara (cliente) u oscura sobre espresso (personal, Fase 3B). */
  readonly headerTone?: 'light' | 'dark';
  readonly children: ReactNode;
}

/** Marco común: salto al contenido, logotipo, aviso de conexión y aviso de nueva versión. */
export function PwaShell({
  appLabel,
  update,
  headerActions,
  headerTone = 'light',
  children,
}: PwaShellProps) {
  const online = useOnlineStatus();
  return (
    <>
      <a className="tv-skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header
        className={headerTone === 'dark' ? 'tv-app-header tv-app-header--dark' : 'tv-app-header'}
      >
        <img
          className="tv-app-header__logo"
          src={headerTone === 'dark' ? logoOnDarkUrl : logoUrl}
          alt="Tavelyo"
        />
        <span className="tv-app-header__label">{appLabel}</span>
        {headerActions}
      </header>
      <ConnectionNotice online={online} />
      {update.needRefresh ? (
        <UpdateNotice onUpdate={update.onUpdate} onDismiss={update.onDismiss} />
      ) : null}
      <main id="contenido" className="tv-app-main" tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
