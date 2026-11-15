import { describe, expect, it } from 'vitest';
import { Money } from './money';
import { formatMoney } from './money-format';
import { isValidWeeklySchedule, isWithinWeeklySchedule, localWeekMinute } from './weekly-schedule';

const cop = (pesos: number) => Money.ofMinor(BigInt(pesos) * 100n, 'COP');
const NBSP = ' ';

describe('impuesto contenido (D-01b)', () => {
  it('impoconsumo del 8 % contenido en $ 32.400 es $ 2.400', () => {
    expect(cop(32_400).includedTax(800, 'half-up').amountMinor).toBe(240_000n);
  });

  it('IVA del 19 % contenido en $ 11.900 es $ 1.900', () => {
    expect(cop(11_900).includedTax(1900, 'half-up').amountMinor).toBe(190_000n);
  });

  it('tasa cero no contiene impuesto', () => {
    expect(cop(25_000).includedTax(0, 'half-up').isZero()).toBe(true);
  });

  it('redondea según el modo indicado', () => {
    // 1 centavo × 8 % / 108 % = 0,074… → 0 en half-up; 1 con away-from-zero.
    const one = Money.ofMinor(1n, 'COP');
    expect(one.includedTax(800, 'half-up').amountMinor).toBe(0n);
    expect(one.includedTax(800, 'away-from-zero').amountMinor).toBe(1n);
    // 175 × 800 / 10 800 = 12,96 → 13.
    expect(Money.ofMinor(175n, 'COP').includedTax(800, 'half-up').amountMinor).toBe(13n);
  });

  it('base más impuesto suman siempre el importe exacto', () => {
    for (let minor = 0n; minor < 5_000n; minor += 37n) {
      for (const bp of [0, 800, 1900, 500]) {
        const total = Money.ofMinor(minor, 'COP');
        const tax = total.includedTax(bp, 'half-up');
        expect(total.minus(tax).plus(tax).equals(total)).toBe(true);
        expect(tax.isNegative()).toBe(false);
        expect(tax.amountMinor <= total.amountMinor).toBe(true);
      }
    }
  });

  it('rechaza tasas negativas o no enteras', () => {
    expect(() => cop(100).includedTax(-1, 'half-up')).toThrow(RangeError);
    expect(() => cop(100).includedTax(8.5, 'half-up')).toThrow(RangeError);
  });
});

describe('formato de importes (es-CO)', () => {
  it('pesos sin decimales y con punto de miles', () => {
    expect(formatMoney(cop(25_000))).toBe(`$${NBSP}25.000`);
    expect(formatMoney(cop(1_234_567))).toBe(`$${NBSP}1.234.567`);
    expect(formatMoney(cop(0))).toBe(`$${NBSP}0`);
  });

  it('si hay centavos, los muestra en lugar de ocultarlos', () => {
    expect(formatMoney(Money.ofMinor(2_500_050n, 'COP'))).toBe(`$${NBSP}25.000,50`);
  });

  it('importes negativos y muy grandes sin perder precisión', () => {
    expect(formatMoney(cop(-25_000))).toBe(`-$${NBSP}25.000`);
    expect(formatMoney(Money.ofMinor(900_719_925_474_099_300n, 'COP'))).toBe(
      `$${NBSP}9.007.199.254.740.993`,
    );
  });

  it('otras monedas con su exponente', () => {
    expect(formatMoney(Money.ofMinor(1999n, 'USD'), 'en-US')).toBe('$19.99');
    expect(formatMoney(Money.ofMinor(1500n, 'CLP'), 'es-CL')).toBe(`$1.500`);
  });
});

describe('horario semanal', () => {
  const TZ = 'America/Bogota';
  // Bogotá es UTC−5 sin horario de verano. 2026-11-13 es viernes.
  const at = (iso: string) => new Date(iso);
  const FRI = 1 << 4;
  const SAT = 1 << 5;

  it('obtiene el día y el minuto locales', () => {
    expect(localWeekMinute(at('2026-11-14T04:30:00Z'), TZ)).toEqual({
      day: 4,
      minute: 23 * 60 + 30,
    });
    expect(localWeekMinute(at('2026-11-16T05:00:00Z'), TZ)).toEqual({ day: 0, minute: 0 });
  });

  it('sin horario siempre está disponible', () => {
    expect(isWithinWeeklySchedule(null, at('2026-11-14T04:30:00Z'), TZ)).toBe(true);
  });

  it('tramo dentro del día, con el final excluido', () => {
    const lunch = { daysMask: FRI, startMinute: 12 * 60, endMinute: 15 * 60 };
    expect(isWithinWeeklySchedule(lunch, at('2026-11-13T17:00:00Z'), TZ)).toBe(true); // vie 12:00
    expect(isWithinWeeklySchedule(lunch, at('2026-11-13T19:59:00Z'), TZ)).toBe(true); // vie 14:59
    expect(isWithinWeeklySchedule(lunch, at('2026-11-13T20:00:00Z'), TZ)).toBe(false); // vie 15:00
    expect(isWithinWeeklySchedule(lunch, at('2026-11-14T17:00:00Z'), TZ)).toBe(false); // sáb 12:00
  });

  it('tramo que cruza la medianoche pertenece al día en que empieza', () => {
    const night = { daysMask: FRI, startMinute: 18 * 60, endMinute: 2 * 60 };
    expect(isWithinWeeklySchedule(night, at('2026-11-14T00:00:00Z'), TZ)).toBe(true); // vie 19:00
    expect(isWithinWeeklySchedule(night, at('2026-11-14T06:30:00Z'), TZ)).toBe(true); // sáb 01:30
    expect(isWithinWeeklySchedule(night, at('2026-11-14T07:00:00Z'), TZ)).toBe(false); // sáb 02:00
    expect(isWithinWeeklySchedule(night, at('2026-11-14T23:30:00Z'), TZ)).toBe(false); // sáb 18:30
    const weekend = { daysMask: SAT | (1 << 6), startMinute: 20 * 60, endMinute: 60 };
    // Domingo 20:00 → lunes 00:30 sigue siendo del domingo.
    expect(isWithinWeeklySchedule(weekend, at('2026-11-16T05:30:00Z'), TZ)).toBe(true);
  });

  it('un horario no válido nunca está disponible', () => {
    for (const schedule of [
      { daysMask: 0, startMinute: 0, endMinute: 60 },
      { daysMask: 128, startMinute: 0, endMinute: 60 },
      { daysMask: 1, startMinute: 60, endMinute: 60 },
      { daysMask: 1, startMinute: 1440, endMinute: 60 },
      { daysMask: 1, startMinute: 0.5, endMinute: 60 },
    ]) {
      expect(isValidWeeklySchedule(schedule)).toBe(false);
      expect(isWithinWeeklySchedule(schedule, at('2026-11-16T05:30:00Z'), TZ)).toBe(false);
    }
  });
});
