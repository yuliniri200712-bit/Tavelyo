import { elapsedMinutes } from '@tavelyo/core';
import type { PendingRequest, ServiceRequestKind } from '../domain/index.ts';

export const REQUEST_KIND_TEXT: Readonly<Record<ServiceRequestKind, string>> = {
  CALL_WAITER: 'Llamó al mesero',
  REQUEST_BILL: 'Pidió la cuenta',
};

/** Cuánto lleva esperando, en texto. */
export function describeWaiting(createdAt: Date, now: Date): string {
  const minutes = elapsedMinutes(createdAt, now);
  if (minutes < 1) return 'Hace menos de un minuto';
  return minutes === 1 ? 'Hace 1 minuto' : `Hace ${minutes} minutos`;
}

/** Resumen en texto, p. ej. «2 solicitudes pendientes». */
export function describePending(requests: readonly PendingRequest[]): string {
  if (requests.length === 0) return 'No hay solicitudes pendientes';
  return requests.length === 1
    ? '1 solicitud pendiente'
    : `${requests.length} solicitudes pendientes`;
}

/** Solicitudes que no estaban en la lectura anterior (para el aviso en texto). */
export function newRequests(
  previous: ReadonlySet<string>,
  requests: readonly PendingRequest[],
): PendingRequest[] {
  return requests.filter((request) => !previous.has(request.id));
}

/** Aviso en texto, p. ej. «Mesa M1: llamó al mesero.». */
export function describeNewRequests(requests: readonly PendingRequest[]): string {
  return requests
    .map(
      (request) => `Mesa ${request.tableCode}: ${REQUEST_KIND_TEXT[request.kind].toLowerCase()}.`,
    )
    .join(' ');
}
