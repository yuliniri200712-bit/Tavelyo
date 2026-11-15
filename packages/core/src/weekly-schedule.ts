/**
 * Horario semanal de un producto en la hora local de la sucursal (esquema `ProductBranch`):
 * `daysMask` con bit 0 = lunes … bit 6 = domingo, y minutos desde medianoche en
 * [startMinute, endMinute). Si endMinute < startMinute el tramo cruza la medianoche y pertenece al
 * día en que empieza (viernes 18:00–02:00 incluye la madrugada del sábado).
 */
export interface WeeklySchedule {
  readonly daysMask: number;
  readonly startMinute: number;
  readonly endMinute: number;
}

const MINUTES_PER_DAY = 1440;
const ALL_DAYS = 0b111_1111;
const WEEKDAY_INDEX: Readonly<Record<string, number>> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

/** ¿Es un horario válido? Mismas reglas que valida la operación SetProductAvailability. */
export function isValidWeeklySchedule(schedule: WeeklySchedule): boolean {
  const { daysMask, startMinute, endMinute } = schedule;
  return (
    [daysMask, startMinute, endMinute].every(Number.isInteger) &&
    daysMask >= 1 &&
    daysMask <= ALL_DAYS &&
    startMinute >= 0 &&
    startMinute < MINUTES_PER_DAY &&
    endMinute >= 0 &&
    endMinute <= MINUTES_PER_DAY &&
    startMinute !== endMinute
  );
}

/** Día de la semana (0 = lunes) y minuto del día de un instante en una zona horaria IANA. */
export function localWeekMinute(instant: Date, timeZone: string): { day: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';
  const day = WEEKDAY_INDEX[part('weekday')];
  if (day === undefined) throw new RangeError('No se pudo obtener el día de la semana');
  return { day, minute: Number(part('hour')) * 60 + Number(part('minute')) };
}

/** ¿Cae el instante dentro del horario? Sin horario (null), el producto está siempre disponible. */
export function isWithinWeeklySchedule(
  schedule: WeeklySchedule | null,
  instant: Date,
  timeZone: string,
): boolean {
  if (schedule === null) return true;
  if (!isValidWeeklySchedule(schedule)) return false;
  const { day, minute } = localWeekMinute(instant, timeZone);
  const includesDay = (d: number) => (schedule.daysMask & (1 << ((d + 7) % 7))) !== 0;
  const { startMinute, endMinute } = schedule;
  if (startMinute < endMinute) {
    return includesDay(day) && minute >= startMinute && minute < endMinute;
  }
  // Cruza la medianoche: la parte de la noche es del mismo día; la madrugada, del anterior.
  return (
    (includesDay(day) && minute >= startMinute) || (includesDay(day - 1) && minute < endMinute)
  );
}
