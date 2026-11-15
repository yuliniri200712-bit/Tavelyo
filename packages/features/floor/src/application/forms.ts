import { err, ok, type Result } from '@tavelyo/core';
import type { SectorInput, TableInput } from '../domain/index.ts';

// Validación en el cliente para orientar a la persona; el servidor aplica las mismas reglas y es
// quien decide (mesas.gql).

export const SECTOR_NAME_MAX = 60;
export const TABLE_CODE_MAX = 20;
export const SEATS_MIN = 1;
export const SEATS_MAX = 50;

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

function wholeNumber(text: string): number | null {
  const trimmed = text.trim();
  return /^\d{1,4}$/.test(trimmed) ? Number(trimmed) : null;
}

export function parseSectorForm(form: {
  readonly name: string;
  readonly sort: string;
}): Result<SectorInput, FieldErrors<'name' | 'sort'>> {
  const errors: FieldErrors<'name' | 'sort'> = {};
  const name = form.name.trim();
  if (name.length === 0) errors.name = 'Escribe el nombre del sector.';
  else if (name.length > SECTOR_NAME_MAX) {
    errors.name = `El nombre admite hasta ${SECTOR_NAME_MAX} caracteres.`;
  }
  const sort = form.sort.trim() === '' ? 0 : wholeNumber(form.sort);
  if (sort === null) errors.sort = 'El orden debe ser un número entero, sin signos.';
  return Object.keys(errors).length > 0 ? err(errors) : ok({ name, sort: sort ?? 0 });
}

export function parseTableForm(form: {
  readonly sectorId: string;
  readonly code: string;
  readonly seats: string;
}): Result<TableInput, FieldErrors<'sectorId' | 'code' | 'seats'>> {
  const errors: FieldErrors<'sectorId' | 'code' | 'seats'> = {};
  if (form.sectorId === '') errors.sectorId = 'Elige el sector de la mesa.';
  const code = form.code.trim();
  if (code.length === 0) errors.code = 'Escribe el código de la mesa (por ejemplo, M1).';
  else if (code.length > TABLE_CODE_MAX) {
    errors.code = `El código admite hasta ${TABLE_CODE_MAX} caracteres.`;
  }
  const seats = wholeNumber(form.seats);
  if (seats === null || seats < SEATS_MIN || seats > SEATS_MAX) {
    errors.seats = `Indica entre ${SEATS_MIN} y ${SEATS_MAX} puestos.`;
  }
  return Object.keys(errors).length > 0
    ? err(errors)
    : ok({ sectorId: form.sectorId, code, seats: seats ?? SEATS_MIN });
}

/** Dirección que abre la carta de la mesa en menu-web (ADR-0011: solo el qrPublicId, sin secretos). */
export function tableMenuUrl(menuWebUrl: string, qrPublicId: string): string {
  return `${menuWebUrl.replace(/\/+$/, '')}/mesa/${encodeURIComponent(qrPublicId)}`;
}
