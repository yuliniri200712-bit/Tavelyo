import { err, ok, type Result } from '@tavelyo/core';
import type { BranchInput } from '../domain/index.ts';

export const BRANCH_NAME_MAX = 80;

/** Misma forma que exige el servidor (sucursales.gql): Región/Ciudad de la base IANA. */
const REGION_CITY = /^[A-Za-z]+(\/[A-Za-z0-9_+-]+)+$/;

/** Zonas horarias que ofrece el navegador y acepta el servidor, en orden alfabético. */
export function availableTimeZones(): string[] {
  return Intl.supportedValuesOf('timeZone')
    .filter((zone) => REGION_CITY.test(zone))
    .sort((a, b) => a.localeCompare(b));
}

export function parseBranchForm(
  form: { readonly name: string; readonly timezone: string },
  zones: readonly string[],
): Result<BranchInput, Partial<Record<'name' | 'timezone', string>>> {
  const errors: Partial<Record<'name' | 'timezone', string>> = {};
  const name = form.name.trim();
  if (name.length === 0) errors.name = 'Escribe el nombre de la sucursal.';
  else if (name.length > BRANCH_NAME_MAX) {
    errors.name = `El nombre admite hasta ${BRANCH_NAME_MAX} caracteres.`;
  }
  if (!zones.includes(form.timezone)) errors.timezone = 'Elige la zona horaria de la sucursal.';
  return Object.keys(errors).length > 0 ? err(errors) : ok({ name, timezone: form.timezone });
}
