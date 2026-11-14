import { describe, expect, it } from 'vitest';
import { INACTIVITY_POLICY, inactivityPhase, latestActivity } from './inactivity.ts';

const MINUTE = 60_000;

describe('inactivityPhase', () => {
  it('la política es de 15 minutos con aviso en el último minuto (D-19)', () => {
    expect(INACTIVITY_POLICY).toEqual({ timeoutMs: 15 * MINUTE, warningMs: MINUTE });
  });

  it.each([
    [0, { phase: 'active' }],
    [14 * MINUTE - 1, { phase: 'active' }],
    [14 * MINUTE, { phase: 'warning', secondsLeft: 60 }],
    [14 * MINUTE + 500, { phase: 'warning', secondsLeft: 60 }],
    [15 * MINUTE - 1, { phase: 'warning', secondsLeft: 1 }],
    [15 * MINUTE, { phase: 'expired' }],
    // Equipo suspendido o pestaña dormida durante horas: se cierra al volver.
    [3 * 60 * MINUTE, { phase: 'expired' }],
  ])('a los %i ms sin uso: %o', (elapsed, expected) => {
    expect(inactivityPhase(1_000, 1_000 + elapsed)).toEqual(expected);
  });
});

describe('latestActivity', () => {
  it('toma la actividad más reciente de cualquier pestaña', () => {
    expect(latestActivity(100, 200, 300)).toBe(200);
    expect(latestActivity(250, 200, 300)).toBe(250);
  });

  it('ignora marcas ausentes, no numéricas o del futuro', () => {
    expect(latestActivity(100, null, 300)).toBe(100);
    expect(latestActivity(100, Number.NaN, 300)).toBe(100);
    expect(latestActivity(100, 10_000, 300)).toBe(100);
  });
});
