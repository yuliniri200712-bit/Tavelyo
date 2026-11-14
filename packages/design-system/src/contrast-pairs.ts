import { color } from './tokens.ts';

/**
 * Pares de color realmente usados por los componentes, con el mínimo WCAG 2.2 AA exigido.
 * 4.5 = texto normal · 3 = texto grande, bordes de controles, foco y señales gráficas.
 * Las pruebas fallan si un par no alcanza su mínimo (`docs/brand/contrast-matrix.md`).
 */
export interface ContrastPair {
  readonly use: string;
  readonly foreground: string;
  readonly background: string;
  readonly minimum: 4.5 | 3;
}

const lightSurfaces = {
  'surface.page': color.surface.page,
  'surface.card': color.surface.card,
  'surface.grouped': color.surface.grouped,
} as const;

const onLightSurfaces = (use: string, foreground: string, minimum: 4.5 | 3): ContrastPair[] =>
  Object.entries(lightSurfaces).map(([name, background]) => ({
    use: `${use} sobre ${name}`,
    foreground,
    background,
    minimum,
  }));

export const contrastPairs: readonly ContrastPair[] = [
  ...onLightSurfaces('text.primary', color.text.primary, 4.5),
  ...onLightSurfaces('text.secondary', color.text.secondary, 4.5),
  ...onLightSurfaces('border.control', color.border.control, 3),
  ...onLightSurfaces('focus.ring', color.focus.ring, 3),
  ...onLightSurfaces('action.primary (límite del botón)', color.action.primary, 3),
  ...onLightSurfaces('status.error (texto de error de campo)', color.status.error, 4.5),
  {
    use: 'text.onAction sobre action.primary',
    foreground: color.text.onAction,
    background: color.action.primary,
    minimum: 4.5,
  },
  {
    use: 'text.onAction sobre action.primaryHover',
    foreground: color.text.onAction,
    background: color.action.primaryHover,
    minimum: 4.5,
  },
  {
    use: 'text.onAction sobre action.primaryPressed',
    foreground: color.text.onAction,
    background: color.action.primaryPressed,
    minimum: 4.5,
  },
  {
    use: 'text.onAction sobre status.error (botón destructivo)',
    foreground: color.text.onAction,
    background: color.status.error,
    minimum: 4.5,
  },
  {
    use: 'text.primary sobre action.secondary',
    foreground: color.text.primary,
    background: color.action.secondary,
    minimum: 4.5,
  },
  {
    use: 'text.primary sobre action.secondaryHover',
    foreground: color.text.primary,
    background: color.action.secondaryHover,
    minimum: 4.5,
  },
  {
    use: 'text.primary sobre action.secondaryPressed',
    foreground: color.text.primary,
    background: color.action.secondaryPressed,
    minimum: 4.5,
  },
  {
    use: 'text.onInverse sobre surface.inverse',
    foreground: color.text.onInverse,
    background: color.surface.inverse,
    minimum: 4.5,
  },
  {
    use: 'focus.ringOnInverse sobre surface.inverse',
    foreground: color.focus.ringOnInverse,
    background: color.surface.inverse,
    minimum: 3,
  },
  {
    use: 'accent.identity (indicador de selección) sobre surface.page',
    foreground: color.accent.identity,
    background: color.surface.page,
    minimum: 3,
  },
  {
    use: 'accent.identity (indicador de selección) sobre surface.card',
    foreground: color.accent.identity,
    background: color.surface.card,
    minimum: 3,
  },
  // Los controles deshabilitados están exentos de 1.4.3; aun así se exige 3:1 para que se lean.
  {
    use: 'text.disabled sobre surface.disabled',
    foreground: color.text.disabled,
    background: color.surface.disabled,
    minimum: 3,
  },
  // Chips de estado: texto del color semántico sobre tarjeta o página, nunca sobre durazno.
  ...(['success', 'warning', 'error', 'info'] as const).flatMap((status) =>
    (['card', 'page'] as const).map((surface) => ({
      use: `status.${status} sobre surface.${surface}`,
      foreground: color.status[status],
      background: color.surface[surface],
      minimum: 4.5 as const,
    })),
  ),
];
