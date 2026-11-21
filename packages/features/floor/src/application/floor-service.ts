import { formatLocalTime } from '@tavelyo/core';
import type {
  FloorSector,
  ServiceRequestKind,
  SessionParticipant,
  TableActivity,
} from '../domain/index.ts';

export type ParticipantStatus = 'active' | 'expired' | 'removed';

/**
 * Estado de una persona en la mesa. Solo orienta la pantalla: el servidor vuelve a comprobar la
 * vigencia en cada operación del cliente (ADR-0011).
 */
export function participantStatus(participant: SessionParticipant, now: Date): ParticipantStatus {
  if (participant.removedAt) return 'removed';
  // Sin teléfono no hay acceso que venza: sigue en la mesa hasta que la retiren o se cierre (D-43).
  if (participant.guestNumber !== null) return 'active';
  return participant.expiresAt.getTime() > now.getTime() ? 'active' : 'expired';
}

export function floorCounts(sectors: readonly FloorSector[]): {
  readonly open: number;
  readonly free: number;
} {
  const tables = sectors.flatMap((sector) => sector.tables);
  const open = tables.filter((table) => table.session).length;
  return { open, free: tables.length - open };
}

/** «2 mesas abiertas · 1 libre», en texto: la cuenta no depende del color de las tarjetas. */
export function describeFloorCounts({ open, free }: { open: number; free: number }): string {
  const opened = open === 1 ? '1 mesa abierta' : `${open} mesas abiertas`;
  const freed = free === 1 ? '1 libre' : `${free} libres`;
  return `${opened} · ${freed}`;
}

const plural = (n: number, one: string, many: string) => (n === 1 ? `1 ${one}` : `${n} ${many}`);

/** Pedidos de la mesa en texto, p. ej. «2 líneas en cocina · 1 lista para recoger». */
export function describeTableOrders({ inKitchen, ready, pickedUp }: TableActivity): string {
  const parts = [
    inKitchen > 0 ? plural(inKitchen, 'línea en cocina', 'líneas en cocina') : null,
    ready > 0 ? plural(ready, 'lista para recoger', 'listas para recoger') : null,
    pickedUp > 0 ? plural(pickedUp, 'recogida por entregar', 'recogidas por entregar') : null,
  ].filter((part): part is string => part !== null);
  return parts.length > 0 ? parts.join(' · ') : 'Sin pedidos en curso';
}

const REQUEST_TEXT: Readonly<Record<ServiceRequestKind, string>> = {
  CALL_WAITER: 'Llamó al mesero',
  REQUEST_BILL: 'Pidió la cuenta',
};

/** Solicitudes pendientes en texto, con la hora de la sucursal. */
export function describeTableRequests(
  requests: TableActivity['requests'],
  timezone: string,
): string[] {
  return requests.map(
    (request) =>
      `${REQUEST_TEXT[request.kind]} a las ${formatLocalTime(request.createdAt, timezone)}`,
  );
}

/** Tono visual de una mesa: lo más urgente primero (solicitud, platos listos, abierta, libre). */
export type TableTone = 'free' | 'open' | 'attention' | 'ready';

export function tableTone(activity: TableActivity | null): TableTone {
  if (!activity) return 'free';
  if (activity.requests.length > 0) return 'attention';
  if (activity.ready > 0) return 'ready';
  return 'open';
}

/** Mesas de un sector, en texto: «8 mesas» o «1 mesa». */
export function describeSectorSize(tables: number): string {
  return tables === 1 ? '1 mesa' : `${tables} mesas`;
}
