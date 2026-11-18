import type { ReactNode } from 'react';

export interface ActionBarProps {
  /** Nombre de la región, p. ej. «Tu pedido». */
  readonly label: string;
  readonly children: ReactNode;
}

/**
 * Barra fija al pie con la acción principal (p. ej. «Mi pedido (2)»), al alcance del pulgar. Deja
 * espacio debajo para no tapar contenido y respeta el área segura del teléfono.
 */
export function ActionBar({ label, children }: ActionBarProps) {
  return (
    <div className="tv-action-bar" role="region" aria-label={label}>
      <div className="tv-action-bar__content">{children}</div>
    </div>
  );
}
