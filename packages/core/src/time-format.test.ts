import { describe, expect, it } from 'vitest';
import { formatLocalTime } from './time-format';

describe('formatLocalTime', () => {
  it('muestra la hora de la sucursal en 24 horas, no la del equipo', () => {
    const instant = new Date('2026-11-15T00:42:00Z');
    expect(formatLocalTime(instant, 'America/Bogota')).toBe('19:42');
    expect(formatLocalTime(instant, 'Europe/Madrid')).toBe('01:42');
  });

  it('la medianoche se escribe 00:00', () => {
    expect(formatLocalTime(new Date('2026-11-15T05:00:00Z'), 'America/Bogota')).toBe('00:00');
  });
});
