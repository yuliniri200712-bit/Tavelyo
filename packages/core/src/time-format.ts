import { DEFAULT_LOCALE } from './money-format';

/**
 * Hora local de un instante en la zona horaria de la sucursal, en formato de 24 horas («19:42»),
 * igual que los horarios de la carta. Las fechas del servidor están en UTC (PM §8).
 */
export function formatLocalTime(
  instant: Date,
  timeZone: string,
  locale: string = DEFAULT_LOCALE,
): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).format(instant);
}

/** Minutos completos transcurridos desde un instante (nunca negativos, aunque el reloj difiera). */
export function elapsedMinutes(since: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - since.getTime()) / 60_000));
}

/** Espera corta para leer de un vistazo, p. ej. «12 min» (el texto completo va aparte). */
export function formatShortWait(minutes: number): string {
  return `${Math.max(0, Math.floor(minutes))} min`;
}
