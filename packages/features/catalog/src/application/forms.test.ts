import { describe, expect, it } from 'vitest';
import {
  describeSchedule,
  formatRate,
  parseAllergens,
  parseGroupForm,
  parseOptionForm,
  parsePercent,
  parsePriceInput,
  parseProductForm,
  parseScheduleForm,
  parseTaxForm,
  scheduleToForm,
} from './forms.ts';

describe('impuestos', () => {
  it('porcentaje a puntos básicos y de vuelta', () => {
    expect(parsePercent('8')).toBe(800);
    expect(parsePercent('8,5 %')).toBe(850);
    expect(parsePercent('19')).toBe(1900);
    expect(parsePercent('0')).toBe(0);
    expect(parsePercent('100')).toBe(10_000);
    for (const text of ['101', '-8', '8.5', '8,555', '', 'ocho'])
      expect(parsePercent(text)).toBeNull();
    expect(formatRate(800)).toBe('8 %');
    expect(formatRate(850)).toBe('8,5 %');
    expect(formatRate(1905)).toBe('19,05 %');
  });

  it('formulario completo', () => {
    expect(parseTaxForm({ name: ' Impoconsumo ', rate: '8' })).toEqual({
      ok: true,
      value: { name: 'Impoconsumo', rateBp: 800 },
    });
    expect(parseTaxForm({ name: '', rate: 'x' })).toMatchObject({
      ok: false,
      error: { name: expect.any(String), rate: expect.any(String) },
    });
  });
});

describe('productos', () => {
  it('alérgenos separados por comas, sin vacíos ni repetidos', () => {
    expect(parseAllergens('huevo, Leche , ,leche, maní')).toEqual(['huevo', 'Leche', 'maní']);
    expect(parseAllergens('')).toEqual([]);
  });

  it('convierte vacíos en null y valida longitudes', () => {
    const base = {
      categoryId: 'c1',
      taxRuleId: '',
      name: 'Ajiaco',
      description: '  ',
      allergens: '',
      sort: '',
    };
    expect(parseProductForm(base)).toEqual({
      ok: true,
      value: {
        categoryId: 'c1',
        taxRuleId: null,
        name: 'Ajiaco',
        description: null,
        allergens: [],
        sort: 0,
      },
    });
    expect(
      parseProductForm({ ...base, categoryId: '', description: 'x'.repeat(501) }),
    ).toMatchObject({
      ok: false,
      error: { categoryId: expect.any(String), description: expect.any(String) },
    });
    expect(parseProductForm({ ...base, allergens: 'x'.repeat(41) }).ok).toBe(false);
  });
});

describe('opciones', () => {
  it('grupo con mínimo y máximo coherentes', () => {
    expect(parseGroupForm({ name: 'Término', minSelect: '1', maxSelect: '1', sort: '' }).ok).toBe(
      true,
    );
    expect(
      parseGroupForm({ name: 'Salsas', minSelect: '2', maxSelect: '1', sort: '' }),
    ).toMatchObject({
      ok: false,
      error: { maxSelect: 'El máximo no puede ser menor que el mínimo.' },
    });
    expect(parseGroupForm({ name: 'Salsas', minSelect: '0', maxSelect: '0', sort: '' }).ok).toBe(
      false,
    );
  });

  it('el valor adicional va en pesos; vacío es cero', () => {
    expect(parseOptionForm({ name: 'Aguacate', price: '5.400', sort: '' }, 'COP')).toEqual({
      ok: true,
      value: { name: 'Aguacate', priceDeltaMinor: '540000', sort: 0 },
    });
    expect(parseOptionForm({ name: 'Bien asada', price: '', sort: '' }, 'COP')).toMatchObject({
      ok: true,
      value: { priceDeltaMinor: '0' },
    });
    expect(parseOptionForm({ name: 'Extra', price: '-1', sort: '' }, 'COP').ok).toBe(false);
  });
});

describe('precio', () => {
  it('en pesos, mayor que cero y dentro del tope del servidor', () => {
    expect(parsePriceInput('$ 25.000', 'COP')).toEqual({ ok: true, value: '2500000' });
    expect(parsePriceInput('0', 'COP').ok).toBe(false);
    expect(parsePriceInput('25000,50', 'COP').ok).toBe(false);
    expect(parsePriceInput('1.000.000.001', 'COP').ok).toBe(false);
    expect(parsePriceInput('25000', 'XXX').ok).toBe(false);
  });
});

describe('horario', () => {
  it('sin limitar es todo el día', () => {
    expect(parseScheduleForm(scheduleToForm(null))).toEqual({ ok: true, value: null });
  });

  it('días y horas a máscara y minutos, también cruzando la medianoche', () => {
    const fridaySaturday = [false, false, false, false, true, true, false];
    expect(
      parseScheduleForm({ limited: true, days: fridaySaturday, start: '18:00', end: '02:00' }),
    ).toEqual({
      ok: true,
      value: { daysMask: 48, startMinute: 1080, endMinute: 120 },
    });
    // Fin a medianoche.
    expect(
      parseScheduleForm({ limited: true, days: fridaySaturday, start: '18:00', end: '00:00' }),
    ).toMatchObject({
      ok: true,
      value: { endMinute: 1440 },
    });
  });

  it('explica lo que falta', () => {
    const none = [false, false, false, false, false, false, false];
    expect(parseScheduleForm({ limited: true, days: none, start: '12:00', end: '15:00' })).toEqual({
      ok: false,
      error: 'Elige al menos un día.',
    });
    const monday = [true, false, false, false, false, false, false];
    expect(
      parseScheduleForm({ limited: true, days: monday, start: '12:00', end: '12:00' }).ok,
    ).toBe(false);
    expect(parseScheduleForm({ limited: true, days: monday, start: '', end: '15:00' }).ok).toBe(
      false,
    );
  });

  it('vuelve al formulario y se describe en texto', () => {
    const schedule = { daysMask: 1 | 4 | 16, startMinute: 1080, endMinute: 120 };
    expect(parseScheduleForm(scheduleToForm(schedule))).toEqual({ ok: true, value: schedule });
    expect(describeSchedule(schedule)).toBe('lun, mié y vie · 18:00 a 02:00 (cruza la medianoche)');
    expect(describeSchedule({ daysMask: 127, startMinute: 720, endMinute: 900 })).toBe(
      'Todos los días · 12:00 a 15:00',
    );
    expect(describeSchedule(null)).toBe('Todo el día, todos los días');
  });
});
