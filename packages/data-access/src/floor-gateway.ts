import { QueryFetchPolicy, type DataConnect } from 'firebase/data-connect';
import {
  branchLayout,
  createSector,
  createTable,
  rotateTableQr,
  updateSector,
  updateTable,
} from '@tavelyo/dataconnect-sdk';
import { err, ok } from '@tavelyo/core';
import type { FloorAdminGateway } from '@tavelyo/floor/domain';
import { mapCommandError } from './command-errors.ts';

// Siempre al servidor: la PWA no conserva respuestas de datos (ADR-0008 §8, ADR-0009).
const SERVER_ONLY = { fetchPolicy: QueryFetchPolicy.SERVER_ONLY } as const;
const DUPLICATE_TABLE = 'Ya existe una mesa con ese código en la sucursal.';

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
