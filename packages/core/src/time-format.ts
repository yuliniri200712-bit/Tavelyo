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
