import type { FloorSector, SessionParticipant } from '../domain/index.ts';

export type ParticipantStatus = 'active' | 'expired' | 'removed';

/**
 * Estado de una persona en la mesa. Solo orienta la pantalla: el servidor vuelve a comprobar la
 * vigencia en cada operación del cliente (ADR-0011).
 */
export function participantStatus(participant: SessionParticipant, now: Date): ParticipantStatus {
  if (participant.removedAt) return 'removed';
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
