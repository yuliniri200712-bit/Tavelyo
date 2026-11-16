/** Reloj del servidor: las marcas de tiempo críticas las asigna el backend, no el cliente. */
export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };

/** Identificador nuevo con el formato que devuelve SQL Connect (32 hexadecimales). */
export function newId(): string {
  return crypto.randomUUID().replaceAll('-', '');
}

/** Forma canónica de un UUID para compararlo con los de SQL Connect (sin guiones, minúsculas). */
export function canonicalUuid(value: string): string {
  return value.replaceAll('-', '').toLowerCase();
}
