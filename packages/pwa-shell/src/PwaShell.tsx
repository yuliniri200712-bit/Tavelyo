import type { ReactNode } from 'react';
import { ConnectionNotice, UpdateNotice, useOnlineStatus } from '@tavelyo/design-system';
import logoUrl from '../../../assets/branding/tavelyo-logo-master.svg';

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
  readonly children: ReactNode;
}

/** Marco común: salto al contenido, logotipo, aviso de conexión y aviso de nueva versión. */
export function PwaShell({ appLabel, update, children }: PwaShellProps) {
  const online = useOnlineStatus();
  return (
    <>
      <a className="tv-skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="tv-app-header">
        <img className="tv-app-header__logo" src={logoUrl} alt="Tavelyo" />
        <span className="tv-app-header__label">{appLabel}</span>
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
