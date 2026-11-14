/**
 * Tokens del sistema de diseño Tavelyo: única fuente de colores, tipografía, espacios,
 * radios, tamaños táctiles y movimiento (IDENTIDAD_VISUAL §4–§6, CLAUDE.md §5).
 * `styles/tokens.css` se genera a partir de este archivo (`npm run tokens`).
 * Cada par de colores usado está medido en `contrast-pairs.ts`.
 */

/** Paleta oficial de la marca. No se modifica. */
export const brand = {
  tomato: '#E54835',
  paprika: '#EE8A34',
  cream: '#FFF5E9',
  espresso: '#35241F',
  peach: '#FCE6D8',
} as const;

export const neutral = {
  white: '#FFFFFF',
} as const;

/** Colores funcionales y semánticos de la interfaz (tema claro). */
export const color = {
  surface: {
    page: brand.cream,
    card: neutral.white,
    grouped: brand.peach,
    inverse: brand.espresso,
    disabled: '#F0E4DA',
  },
  text: {
    primary: brand.espresso,
    secondary: '#6B5650',
    onInverse: brand.cream,
    onAction: neutral.white,
    disabled: '#7D6A63',
  },
  action: {
    primary: '#BA3526',
    primaryHover: '#A62F22',
    primaryPressed: '#9A2B1F',
    secondary: neutral.white,
    secondaryHover: brand.cream,
    secondaryPressed: brand.peach,
  },
  border: {
    control: '#8A766F',
    subtle: '#EBD9CC',
  },
  focus: {
    ring: brand.espresso,
    ringOnInverse: brand.cream,
  },
  status: {
    success: '#15803D',
    warning: '#B45309',
    error: '#B91C1C',
    info: '#1D4ED8',
  },
  accent: {
    identity: brand.tomato,
    gastronomic: brand.paprika,
  },
} as const;

export const font = {
  family: {
    sans: "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  weight: {
    regular: 400,
    semibold: 600,
    bold: 700,
  },
} as const;

/** Escala tipográfica (IV §5) en píxeles CSS; en CSS se expresa en rem para respetar el zoom. */
export const typeScale = {
  display: { size: 32, lineHeight: 40, weight: font.weight.bold },
  h1: { size: 28, lineHeight: 36, weight: font.weight.bold },
  h2: { size: 24, lineHeight: 32, weight: font.weight.bold },
  h3: { size: 20, lineHeight: 28, weight: font.weight.semibold },
  bodyLarge: { size: 18, lineHeight: 28, weight: font.weight.regular },
  body: { size: 16, lineHeight: 24, weight: font.weight.regular },
  label: { size: 14, lineHeight: 20, weight: font.weight.semibold },
  caption: { size: 12, lineHeight: 16, weight: font.weight.regular },
} as const;

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
} as const;

export const radius = {
  control: 8,
  card: 12,
  container: 16,
  pill: 999,
} as const;

/** Objetivos táctiles mínimos (IV §6): 48 general, 56 en cocina. */
export const touchTarget = {
  min: 48,
  kitchen: 56,
} as const;

/** Puntos de corte por espacio disponible (IV §5). */
export const breakpoint = {
  medium: 600,
  wide: 1024,
} as const;

/** Grosores de borde y del anillo de foco (WCAG 2.4.13: foco visible de al menos 2 px). */
export const stroke = {
  hairline: 1,
  control: 2,
  focus: 3,
  focusOffset: 2,
} as const;

/** Medidas de componentes que no son espacios ni radios. */
export const size = {
  icon: 20,
  dialogMaxWidth: 480,
  contentMaxWidth: 1200,
} as const;

export const motion = {
  fast: 120,
  base: 200,
  spin: 800,
} as const;

export const elevation = {
  card: '0 1px 2px rgba(53, 36, 31, 0.08)',
  overlay: '0 8px 24px rgba(53, 36, 31, 0.16)',
} as const;

export const tokens = {
  brand,
  neutral,
  color,
  font,
  typeScale,
  space,
  radius,
  touchTarget,
  stroke,
  size,
  breakpoint,
  motion,
  elevation,
} as const;

export type Tokens = typeof tokens;
