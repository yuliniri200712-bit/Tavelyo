import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon.tsx';

export interface PageTitleProps {
  /** Icono del módulo; es decorativo: el nombre del encabezado es solo el texto. */
  readonly icon: IconName;
  readonly children: ReactNode;
}

/** Título principal de una pantalla del personal, con el icono de su módulo. */
export function PageTitle({ icon, children }: PageTitleProps) {
  return (
    <h1 className="tv-page-title">
      <Icon name={icon} size="large" />
      {children}
    </h1>
  );
}
