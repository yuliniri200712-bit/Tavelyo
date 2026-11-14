import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast.ts';
import { contrastPairs } from './contrast-pairs.ts';
import { renderTokensCss } from './css-variables.ts';
import { brand, color } from './tokens.ts';

describe('contrastRatio', () => {
  it('reproduce valores de referencia de WCAG', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBe(1);
    expect(contrastRatio('#BA3526', '#FFFFFF')).toBeCloseTo(5.79, 2);
  });

  it('rechaza colores con formato no válido', () => {
    expect(() => contrastRatio('red', '#FFFFFF')).toThrow('Color no válido');
  });
});

describe('pares de color usados por los componentes', () => {
  it.each(contrastPairs.map((pair) => [pair.use, pair] as const))('%s', (_use, pair) => {
    expect(contrastRatio(pair.foreground, pair.background)).toBeGreaterThanOrEqual(pair.minimum);
  });

  it('la paleta oficial no cambia', () => {
    expect(brand).toEqual({
      tomato: '#E54835',
      paprika: '#EE8A34',
      cream: '#FFF5E9',
      espresso: '#35241F',
      peach: '#FCE6D8',
    });
  });

  it('el botón primario no usa el rojo de la marca como fondo de texto', () => {
    expect(color.action.primary).not.toBe(brand.tomato);
    expect(contrastRatio(color.text.onAction, brand.tomato)).toBeLessThan(4.5);
  });
});

describe('styles/tokens.css', () => {
  it('está sincronizado con tokens.ts', () => {
    const committed = readFileSync(new URL('./styles/tokens.css', import.meta.url), 'utf8');
    expect(committed.replace(/\r\n/g, '\n')).toBe(renderTokensCss());
  });

  it('expresa los tamaños tipográficos en rem para respetar el zoom del navegador', () => {
    const css = renderTokensCss();
    expect(css).toContain('--tv-type-body-size: 1rem;');
    expect(css).toContain('--tv-touch-min: 3rem;');
    expect(css).not.toMatch(/size: \d+px/);
  });
});
