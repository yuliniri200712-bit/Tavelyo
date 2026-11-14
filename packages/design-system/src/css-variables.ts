import { tokens, type Tokens } from './tokens.ts';

const PREFIX = '--tv';
const rem = (px: number): string => `${px / 16}rem`;

/** `bodyLarge` → `body-large`, como en los nombres de las propiedades CSS. */
export const kebab = (key: string): string => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** Convierte los tokens en propiedades CSS personalizadas `--tv-*` (longitudes en rem). */
export function cssVariables(source: Tokens = tokens): Array<[name: string, value: string]> {
  const out: Array<[string, string]> = [];
  const add = (name: string, value: string | number): void => {
    out.push([`${PREFIX}-${name}`, String(value)]);
  };

  for (const [key, value] of Object.entries(source.brand)) add(`brand-${kebab(key)}`, value);
  for (const [key, value] of Object.entries(source.neutral)) add(`neutral-${kebab(key)}`, value);
  for (const [group, values] of Object.entries(source.color)) {
    for (const [key, value] of Object.entries(values)) add(`color-${group}-${kebab(key)}`, value);
  }
  for (const [key, value] of Object.entries(source.font.family)) add(`font-family-${key}`, value);
  for (const [key, value] of Object.entries(source.font.weight)) add(`font-weight-${key}`, value);
  for (const [key, step] of Object.entries(source.typeScale)) {
    const name = `type-${kebab(key)}`;
    add(`${name}-size`, rem(step.size));
    add(`${name}-line-height`, rem(step.lineHeight));
    add(`${name}-weight`, step.weight);
  }
  for (const [key, value] of Object.entries(source.space)) add(`space-${key}`, rem(value));
  for (const [key, value] of Object.entries(source.radius)) add(`radius-${key}`, rem(value));
  for (const [key, value] of Object.entries(source.touchTarget)) add(`touch-${key}`, rem(value));
  for (const [key, value] of Object.entries(source.stroke)) add(`stroke-${kebab(key)}`, rem(value));
  for (const [key, value] of Object.entries(source.size)) add(`size-${kebab(key)}`, rem(value));
  for (const [key, value] of Object.entries(source.motion)) add(`motion-${key}`, `${value}ms`);
  for (const [key, value] of Object.entries(source.elevation)) add(`elevation-${key}`, value);
  return out;
}

/** Contenido de `styles/tokens.css`. */
export function renderTokensCss(source: Tokens = tokens): string {
  const lines = cssVariables(source).map(([name, value]) => `  ${name}: ${value};`);
  return [
    '/* Generado desde src/tokens.ts con `npm run tokens -w @tavelyo/design-system`. No editar a mano. */',
    ':root {',
    ...lines,
    '}',
    '',
  ].join('\n');
}
