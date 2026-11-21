/**
 * Cómo se nombra a cada persona de la mesa en el salón, la comanda del mesero y la caja (D-43).
 * Una sola regla para que «Persona 2» sea la misma persona en las tres pantallas:
 * - quien se unió con su teléfono es «Persona N», por orden de llegada solo entre quienes tienen
 *   teléfono;
 * - quien no tiene teléfono es «Persona sin teléfono N», con el número que guarda el servidor.
 * Se numera sobre todas las personas de la sesión, también las vencidas o retiradas, para que el
 * número de nadie cambie durante el servicio.
 */
export interface TablePerson {
  readonly id: string;
  readonly guestNumber: number | null;
}

/** Número de la persona en la mesa: `guestNumber` si no tiene teléfono, `personNumber` si lo tiene. */
export type TableSeat =
  | { readonly guestNumber: number; readonly personNumber?: undefined }
  | { readonly personNumber: number; readonly guestNumber?: undefined };

/** Máximo de personas sin teléfono en una mesa (lo comprueba también el conector). */
export const GUEST_NUMBER_MAX = 99;

/** `people` debe venir en orden de llegada (joinedAt y luego id, como lo entrega el servidor). */
export function numberTablePeople(people: readonly TablePerson[]): ReadonlyMap<string, TableSeat> {
  let phone = 0;
  return new Map(
    people.map((p): [string, TableSeat] => [
      p.id,
      p.guestNumber === null ? { personNumber: ++phone } : { guestNumber: p.guestNumber },
    ]),
  );
}

export function tablePersonLabel(seat: TableSeat): string {
  return seat.guestNumber !== undefined
    ? `Persona sin teléfono ${seat.guestNumber}`
    : `Persona ${seat.personNumber}`;
}

/** Nombres de todas las personas, con la misma numeración de `numberTablePeople`. */
export function tablePersonLabels(people: readonly TablePerson[]): ReadonlyMap<string, string> {
  return new Map([...numberTablePeople(people)].map(([id, seat]) => [id, tablePersonLabel(seat)]));
}

/** Número para la siguiente persona sin teléfono; null si la mesa llegó al máximo. */
export function nextGuestNumber(people: readonly TablePerson[]): number | null {
  const next = Math.max(0, ...people.map((p) => p.guestNumber ?? 0)) + 1;
  return next > GUEST_NUMBER_MAX ? null : next;
}
