import { QueryFetchPolicy, type DataConnect } from 'firebase/data-connect';
import {
  branchLayout,
  closeTableSession,
  createSector,
  createTable,
  floorView,
  openTableSession,
  removeParticipant,
  rotateTableQr,
  sessionParticipants,
  updateSector,
  updateTable,
} from '@tavelyo/dataconnect-sdk';
import { err, ok } from '@tavelyo/core';
import type { FloorAdminGateway, FloorServiceGateway } from '@tavelyo/floor/domain';
import { mapCommandError } from './command-errors.ts';

// Siempre al servidor: la PWA no conserva respuestas de datos (ADR-0008 §8, ADR-0009).
const SERVER_ONLY = { fetchPolicy: QueryFetchPolicy.SERVER_ONLY } as const;
const DUPLICATE_TABLE = 'Ya existe una mesa con ese código en la sucursal.';
const ALREADY_OPEN = 'La mesa ya está abierta. Actualiza el salón para verla.';

/** Ejecuta una mutación y traduce el resultado al contrato del módulo. */
async function command(run: () => Promise<unknown>, duplicateMessage?: string) {
  try {
    await run();
    return ok(undefined);
  } catch (error) {
    return err(mapCommandError(error, duplicateMessage));
  }
}

export function createFloorAdminGateway(dataConnect: DataConnect): FloorAdminGateway {
  return {
    async layout(scope) {
      try {
        const { data } = await branchLayout(dataConnect, scope, SERVER_ONLY);
        return ok(
          data.sectors.map((sector) => ({
            id: sector.id,
            name: sector.name,
            sort: sector.sort,
            archived: Boolean(sector.archivedAt),
            tables: sector.diningTables_on_sector.map((table) => ({
              id: table.id,
              code: table.code,
              seats: table.seats,
              qrPublicId: table.qrPublicId,
              archived: Boolean(table.archivedAt),
            })),
          })),
        );
      } catch (error) {
        return err(mapCommandError(error));
      }
    },
    createSector: (scope, input) =>
      command(() => createSector(dataConnect, { ...scope, ...input })),
    updateSector: (scope, sectorId, input) =>
      command(() => updateSector(dataConnect, { ...scope, sectorId, ...input })),
    createTable: (scope, input) =>
      command(() => createTable(dataConnect, { ...scope, ...input }), DUPLICATE_TABLE),
    updateTable: (scope, tableId, input) =>
      command(() => updateTable(dataConnect, { ...scope, tableId, ...input }), DUPLICATE_TABLE),
    rotateQr: (scope, tableId) => command(() => rotateTableQr(dataConnect, { ...scope, tableId })),
  };
}

/** Salón para el personal en servicio: sin el qrPublicId ni la cuenta de los clientes. */
export function createFloorServiceGateway(dataConnect: DataConnect): FloorServiceGateway {
  return {
    async floor(scope) {
      try {
        const { data } = await floorView(dataConnect, scope, SERVER_ONLY);
        return ok(
          data.sectors.map((sector) => ({
            id: sector.id,
            name: sector.name,
            tables: sector.diningTables_on_sector.map((table) => {
              const session = table.tableSessions_on_table[0];
              return {
                id: table.id,
                code: table.code,
                seats: table.seats,
                session: session ? { id: session.id, openedAt: new Date(session.openedAt) } : null,
              };
            }),
          })),
        );
      } catch (error) {
        return err(mapCommandError(error));
      }
    },
    async participants(scope, sessionId) {
      try {
        const { data } = await sessionParticipants(
          dataConnect,
          { ...scope, sessionId },
          SERVER_ONLY,
        );
        return ok(
          data.sessionParticipants.map((participant) => ({
            id: participant.id,
            joinedAt: new Date(participant.joinedAt),
            expiresAt: new Date(participant.expiresAt),
            removedAt: participant.removedAt ? new Date(participant.removedAt) : null,
          })),
        );
      } catch (error) {
        return err(mapCommandError(error));
      }
    },
    // Dos personas abren la misma mesa a la vez: la unicidad de openTableId rechaza la segunda.
    openTable: (scope, tableId) =>
      command(() => openTableSession(dataConnect, { ...scope, tableId }), ALREADY_OPEN),
    closeSession: (scope, sessionId) =>
      command(() => closeTableSession(dataConnect, { ...scope, sessionId })),
    removeParticipant: (scope, participantId) =>
      command(() => removeParticipant(dataConnect, { ...scope, participantId })),
  };
}
