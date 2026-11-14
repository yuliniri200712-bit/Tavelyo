import { err, ok, type Result } from '@tavelyo/core';

// Validación de la entrada de las funciones: el backend nunca confía en el cliente (CLAUDE.md §7).

export type Fields = Readonly<Record<string, unknown>>;

/** Acepta solo un objeto plano con las claves permitidas (rechaza campos inesperados). */
export function readFields(data: unknown, allowed: readonly string[]): Result<Fields, string> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return err('La solicitud no tiene el formato esperado.');
  }
  const unexpected = Object.keys(data).filter((key) => !allowed.includes(key));
  if (unexpected.length > 0) return err('La solicitud incluye campos no admitidos.');
  return ok(data as Fields);
}

interface TextRule {
  readonly label: string;
  readonly min: number;
  readonly max: number;
}

/** Texto obligatorio, sin espacios sobrantes y con longitud acotada. */
export function readText(fields: Fields, key: string, rule: TextRule): Result<string, string> {
  const value = fields[key];
  if (typeof value !== 'string') return err(`Falta ${rule.label}.`);
  const trimmed = value.trim();
  if (trimmed.length < rule.min || trimmed.length > rule.max) {
    return err(`${capitalize(rule.label)} debe tener entre ${rule.min} y ${rule.max} caracteres.`);
  }
  return ok(trimmed);
}

/** Texto opcional: ausente o null equivale a no indicarlo. */
export function readOptionalText(
  fields: Fields,
  key: string,
  rule: TextRule,
): Result<string | undefined, string> {
  const value = fields[key];
  if (value === undefined || value === null) return ok(undefined);
  return readText(fields, key, rule);
}

// SQL Connect devuelve los UUID sin guiones (32 hexadecimales) y acepta las dos formas.
const UUID = /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

// Los uid de Firebase Auth tienen como máximo 128 caracteres.
const UID = /^[A-Za-z0-9_-]{1,128}$/;

export function isUid(value: unknown): value is string {
  return typeof value === 'string' && UID.test(value);
}

/** Zona horaria IANA conocida por el entorno de ejecución. */
export function isTimeZone(value: unknown): value is string {
  return typeof value === 'string' && Intl.supportedValuesOf('timeZone').includes(value);
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
