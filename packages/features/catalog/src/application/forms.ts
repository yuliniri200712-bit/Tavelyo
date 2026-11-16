import {
  err,
  isCurrencyCode,
  isValidWeeklySchedule,
  Money,
  ok,
  parseMajorAmount,
  toMajorInput,
  type Result,
  type WeeklySchedule,
} from '@tavelyo/core';
import type {
  CategoryInput,
  ModifierGroupInput,
  ModifierOptionInput,
  ProductInput,
  StationInput,
  TaxRuleInput,
} from '../domain/index.ts';

// Validación en el cliente para orientar a la persona; el servidor aplica las mismas reglas y es
// quien decide (carta.gql).

export const NAME_MAX = 60;
/** Mismo tope que aplica el servidor (cocina.gql). */
export const STATION_NAME_MAX = 40;
export const PRODUCT_NAME_MAX = 80;
export const DESCRIPTION_MAX = 500;
export const ALLERGENS_MAX = 20;
export const ALLERGEN_MAX = 40;
export const GROUP_MAX_SELECT = 20;
/** Tope de precio que acepta el servidor (100 000 millones de unidades menores). */
const MAX_AMOUNT_MINOR = 100_000_000_000n;

export type FieldErrors<K extends string> = Partial<Record<K, string>>;
type Parsed<T, K extends string> = Result<T, FieldErrors<K>>;

const finish = <T, K extends string>(errors: FieldErrors<K>, value: () => T): Parsed<T, K> =>
  Object.keys(errors).length > 0 ? err(errors) : ok(value());

function wholeNumber(text: string): number | null {
  const trimmed = text.trim();
  return /^\d{1,4}$/.test(trimmed) ? Number(trimmed) : null;
}

function name(text: string, max: number, missing: string): { value: string; error?: string } {
  const value = text.trim();
  if (value.length === 0) return { value, error: missing };
  if (value.length > max) return { value, error: `Admite hasta ${max} caracteres.` };
  return { value };
}

function sortOrder(text: string): number | null {
  return text.trim() === '' ? 0 : wholeNumber(text);
}

const SORT_ERROR = 'El orden debe ser un número entero, sin signos.';

/** Porcentaje escrito por la persona («8», «8,5», «19 %») a puntos básicos (800, 850, 1900). */
export function parsePercent(text: string): number | null {
  const match = /^(\d{1,3})(?:,(\d{1,2}))?$/.exec(text.replace(/[\s%]/g, ''));
  if (!match) return null;
  const bp = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0') || '0');
  return bp <= 10_000 ? bp : null;
}

/** Tasa en puntos básicos para mostrar: 800 → «8 %», 850 → «8,5 %». */
export function formatRate(rateBp: number): string {
  const whole = Math.trunc(rateBp / 100);
  const fraction = (rateBp % 100).toString().padStart(2, '0').replace(/0+$/, '');
  return `${whole}${fraction ? `,${fraction}` : ''} %`;
}

export function parseTaxForm(form: {
  readonly name: string;
  readonly rate: string;
}): Parsed<TaxRuleInput, 'name' | 'rate'> {
  const errors: FieldErrors<'name' | 'rate'> = {};
  const n = name(form.name, NAME_MAX, 'Escribe el nombre del impuesto (por ejemplo, Impoconsumo).');
  if (n.error) errors.name = n.error;
  const rateBp = parsePercent(form.rate);
  if (rateBp === null)
    errors.rate = 'Escribe la tasa en porcentaje, entre 0 y 100 (por ejemplo, 8).';
  return finish(errors, () => ({ name: n.value, rateBp: rateBp ?? 0 }));
}

export function parseCategoryForm(form: {
  readonly name: string;
  readonly sort: string;
}): Parsed<CategoryInput, 'name' | 'sort'> {
  const errors: FieldErrors<'name' | 'sort'> = {};
  const n = name(form.name, NAME_MAX, 'Escribe el nombre de la categoría.');
  if (n.error) errors.name = n.error;
  const sort = sortOrder(form.sort);
  if (sort === null) errors.sort = SORT_ERROR;
  return finish(errors, () => ({ name: n.value, sort: sort ?? 0 }));
}

/** Alérgenos separados por comas; se quitan los vacíos y los repetidos. */
export function parseAllergens(text: string): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const raw of text.split(',')) {
    const item = raw.trim();
    const key = item.toLocaleLowerCase('es-CO');
    if (item && !seen.has(key)) {
      seen.add(key);
      list.push(item);
    }
  }
  return list;
}

type ProductField = 'categoryId' | 'name' | 'description' | 'allergens' | 'sort';

export function parseProductForm(form: {
  readonly categoryId: string;
  readonly taxRuleId: string;
  readonly name: string;
  readonly description: string;
  readonly allergens: string;
  readonly sort: string;
}): Parsed<ProductInput, ProductField> {
  const errors: FieldErrors<ProductField> = {};
  if (form.categoryId === '') errors.categoryId = 'Elige la categoría del producto.';
  const n = name(form.name, PRODUCT_NAME_MAX, 'Escribe el nombre del producto.');
  if (n.error) errors.name = n.error;
  const description = form.description.trim();
  if (description.length > DESCRIPTION_MAX) {
    errors.description = `La descripción admite hasta ${DESCRIPTION_MAX} caracteres.`;
  }
  const allergens = parseAllergens(form.allergens);
  if (allergens.length > ALLERGENS_MAX) {
    errors.allergens = `Indica como máximo ${ALLERGENS_MAX} alérgenos.`;
  } else if (allergens.some((item) => item.length > ALLERGEN_MAX)) {
    errors.allergens = `Cada alérgeno admite hasta ${ALLERGEN_MAX} caracteres.`;
  }
  const sort = sortOrder(form.sort);
  if (sort === null) errors.sort = SORT_ERROR;
  return finish(errors, () => ({
    categoryId: form.categoryId,
    taxRuleId: form.taxRuleId === '' ? null : form.taxRuleId,
    name: n.value,
    description: description === '' ? null : description,
    allergens,
    sort: sort ?? 0,
  }));
}

type GroupField = 'name' | 'minSelect' | 'maxSelect' | 'sort';

export function parseGroupForm(form: {
  readonly name: string;
  readonly minSelect: string;
  readonly maxSelect: string;
  readonly sort: string;
}): Parsed<ModifierGroupInput, GroupField> {
  const errors: FieldErrors<GroupField> = {};
  const n = name(form.name, NAME_MAX, 'Escribe el nombre del grupo (por ejemplo, Término).');
  if (n.error) errors.name = n.error;
  const minSelect = wholeNumber(form.minSelect);
  const maxSelect = wholeNumber(form.maxSelect);
  if (minSelect === null || minSelect > GROUP_MAX_SELECT) {
    errors.minSelect = `Indica un mínimo entre 0 y ${GROUP_MAX_SELECT} (0 si es opcional).`;
  }
  if (maxSelect === null || maxSelect < 1 || maxSelect > GROUP_MAX_SELECT) {
    errors.maxSelect = `Indica un máximo entre 1 y ${GROUP_MAX_SELECT}.`;
  } else if (minSelect !== null && maxSelect < minSelect) {
    errors.maxSelect = 'El máximo no puede ser menor que el mínimo.';
  }
  const sort = sortOrder(form.sort);
  if (sort === null) errors.sort = SORT_ERROR;
  return finish(errors, () => ({
    name: n.value,
    minSelect: minSelect ?? 0,
    maxSelect: maxSelect ?? 1,
    sort: sort ?? 0,
  }));
}

/** Importe en pesos a unidades menores; null si no es válido (el mensaje lo pone quien llama). */
function amountMinor(text: string, currency: string, allowZero: boolean): string | null {
  if (!isCurrencyCode(currency)) return null;
  const parsed = parseMajorAmount(text, currency);
  if (!parsed.ok) return null;
  const minor = parsed.value.amountMinor;
  if ((!allowZero && minor === 0n) || minor > MAX_AMOUNT_MINOR) return null;
  return minor.toString();
}

export function parseOptionForm(
  form: { readonly name: string; readonly price: string; readonly sort: string },
  currency: string,
): Parsed<ModifierOptionInput, 'name' | 'price' | 'sort'> {
  const errors: FieldErrors<'name' | 'price' | 'sort'> = {};
  const n = name(form.name, NAME_MAX, 'Escribe el nombre de la opción.');
  if (n.error) errors.name = n.error;
  const priceDeltaMinor = form.price.trim() === '' ? '0' : amountMinor(form.price, currency, true);
  if (priceDeltaMinor === null) {
    errors.price = 'Escribe el valor adicional en pesos, sin centavos (0 si no cuesta más).';
  }
  const sort = sortOrder(form.sort);
  if (sort === null) errors.sort = SORT_ERROR;
  return finish(errors, () => ({
    name: n.value,
    priceDeltaMinor: priceDeltaMinor ?? '0',
    sort: sort ?? 0,
  }));
}

/** Importe guardado (unidades menores) como texto editable en pesos; vacío si es cero. */
export function minorToInput(amountMinor: string, currency: string): string {
  if (amountMinor === '0' || !isCurrencyCode(currency)) return '';
  const money = Money.fromMinorString(amountMinor, currency);
  return money.ok ? toMajorInput(money.value) : '';
}

/** Precio con impuestos incluidos, en pesos, mayor que cero. */
export function parsePriceInput(text: string, currency: string): Result<string, string> {
  const minor = amountMinor(text, currency, false);
  return minor === null
    ? err('Escribe el precio en pesos, sin centavos y mayor que cero (por ejemplo, 25.000).')
    : ok(minor);
}

export const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const WEEKDAY_SHORT = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

/** «HH:MM» (control de hora del navegador) a minutos desde medianoche. */
export function parseClock(text: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(text.trim());
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

export function formatClock(minute: number): string {
  const hours = Math.trunc(minute / 60) % 24;
  return `${hours.toString().padStart(2, '0')}:${(minute % 60).toString().padStart(2, '0')}`;
}

export interface ScheduleForm {
  /** false: disponible todo el día, todos los días. */
  readonly limited: boolean;
  readonly days: readonly boolean[];
  readonly start: string;
  readonly end: string;
}

export function scheduleToForm(schedule: WeeklySchedule | null): ScheduleForm {
  if (!schedule) {
    return { limited: false, days: WEEKDAYS.map(() => true), start: '12:00', end: '15:00' };
  }
  return {
    limited: true,
    days: WEEKDAYS.map((_, day) => (schedule.daysMask & (1 << day)) !== 0),
    start: formatClock(schedule.startMinute),
    end: formatClock(schedule.endMinute),
  };
}

/**
 * Horario semanal en la hora local de la sucursal. Si la hora de fin es anterior a la de inicio,
 * el tramo cruza la medianoche (viernes 18:00 a 02:00). Fin «00:00» significa medianoche.
 */
export function parseScheduleForm(form: ScheduleForm): Result<WeeklySchedule | null, string> {
  if (!form.limited) return ok(null);
  const daysMask = form.days.reduce((mask, on, day) => (on ? mask | (1 << day) : mask), 0);
  if (daysMask === 0) return err('Elige al menos un día.');
  const startMinute = parseClock(form.start);
  const endClock = parseClock(form.end);
  if (startMinute === null || endClock === null) return err('Escribe la hora de inicio y de fin.');
  const endMinute = endClock === 0 ? 1440 : endClock;
  const schedule = { daysMask, startMinute, endMinute };
  if (!isValidWeeklySchedule(schedule))
    return err('La hora de inicio y la de fin no pueden ser iguales.');
  return ok(schedule);
}

/** «Todo el día» o «lun, mié y vie · 18:00 a 02:00 (cruza la medianoche)». */
export function describeSchedule(schedule: WeeklySchedule | null): string {
  if (!schedule) return 'Todo el día, todos los días';
  const days = WEEKDAY_SHORT.filter((_, day) => (schedule.daysMask & (1 << day)) !== 0);
  const dayText =
    days.length === 7
      ? 'Todos los días'
      : days.length === 1
        ? (days[0] ?? '')
        : `${days.slice(0, -1).join(', ')} y ${days.at(-1) ?? ''}`;
  const crosses = schedule.endMinute < schedule.startMinute;
  return `${dayText} · ${formatClock(schedule.startMinute)} a ${formatClock(schedule.endMinute)}${
    crosses ? ' (cruza la medianoche)' : ''
  }`;
}

export function parseStationForm(form: {
  readonly name: string;
  readonly sort: string;
}): Result<StationInput, Partial<Record<'name' | 'sort', string>>> {
  const errors: Partial<Record<'name' | 'sort', string>> = {};
  const name = form.name.trim();
  if (name.length === 0) errors.name = 'Escribe el nombre de la estación.';
  else if (name.length > STATION_NAME_MAX) {
    errors.name = `El nombre admite hasta ${STATION_NAME_MAX} caracteres.`;
  }
  const sortText = form.sort.trim();
  const sort = sortText === '' ? 0 : /^\d{1,4}$/.test(sortText) ? Number(sortText) : null;
  if (sort === null) errors.sort = 'El orden debe ser un número entero, sin signos.';
  return Object.keys(errors).length > 0 ? err(errors) : ok({ name, sort: sort ?? 0 });
}
