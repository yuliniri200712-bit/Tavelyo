import type { DataConnect } from 'firebase/data-connect';
import { httpsCallable, type Functions } from 'firebase/functions';
import {
  branchLayout,
  createSector,
  createTable,
  floorView,
  floorViewRef,
  openTableSession,
  transferTableSession,
  OrderItemStatus,
  removeParticipant,
  rotateTableQr,
  ServiceRequestKind,
  sessionParticipants,
  updateSector,
  updateTable,
  type FloorViewData,
} from '@tavelyo/dataconnect-sdk';
import { err, ok } from '@tavelyo/core';
import type {
  FloorAdminGateway,
  FloorSector,
  FloorServiceGateway,
  TableActivity,
} from '@tavelyo/floor/domain';
import { mapCommandError, mapStaffCallableError } from './command-errors.ts';
import { readQuery, runCommand as command, SERVER_ONLY, watchQuery } from './live-query.ts';

const DUPLICATE_TABLE = 'Ya existe una mesa con ese código en la sucursal.';
const ALREADY_OPEN = 'La mesa ya está abierta. Actualiza el salón para verla.';

type FloorViewSession =
  FloorViewData['sectors'][number]['diningTables_on_sector'][number]['tableSessions_on_table'][number];

const IN_KITCHEN: readonly OrderItemStatus[] = [
  OrderItemStatus.RECEIVED,
  OrderItemStatus.IN_PREPARATION,
];

/** Cuenta las líneas activas de la mesa por etapa (el conector ya excluye entregadas y canceladas). */
export function toTableActivity(session: FloorViewSession): TableActivity {
  const statuses = session.orders_on_session.flatMap((order) =>
    order.orderItems_on_order.map((item) => item.status),
  );
  return {
    inKitchen: statuses.filter((status) => IN_KITCHEN.includes(status)).length,
    ready: statuses.filter((status) => status === OrderItemStatus.READY).length,
    pickedUp: statuses.filter((status) => status === OrderItemStatus.PICKED_UP).length,
    requests: session.serviceRequests_on_session
      .map((request) => ({
        kind:
          request.kind === ServiceRequestKind.REQUEST_BILL
            ? ('REQUEST_BILL' as const)
            : ('CALL_WAITER' as const),
        createdAt: new Date(request.createdAt),
      }))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
  };
}

/** Salón del personal: sectores, mesas y, en las abiertas, su actividad. */
export function toFloorSectors(data: FloorViewData): FloorSector[] {
  return data.sectors.map((sector) => ({
    id: sector.id,
    name: sector.name,
    tables: sector.diningTables_on_sector.map((table) => {
      const session = table.tableSessions_on_table[0];
      return {
        id: table.id,
        code: table.code,
        seats: table.seats,
        session: session
          ? {
              id: session.id,
              openedAt: new Date(session.openedAt),
              activity: toTableActivity(session),
            }
          : null,
      };
    }),
  }));
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
export function createFloorServiceGateway(
  dataConnect: DataConnect,
  functions: Functions,
): FloorServiceGateway {
  return {
    floor: (scope) => readQuery(() => floorView(dataConnect, scope, SERVER_ONLY), toFloorSectors),
    watchFloor: (scope, observer) =>
      watchQuery(floorViewRef(dataConnect, scope), toFloorSectors, observer),
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
            guestNumber: participant.guestNumber ?? null,
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
    transfer: (scope, sessionId, sourceId, tableId) =>
      command(
        () => transferTableSession(dataConnect, { ...scope, sessionId, sourceId, tableId }),
        'La mesa de destino ya está ocupada.',
      ),
    // D-30: el backend cierra solo con saldo cero y todo entregado, y explica qué falta si no.
    async closeSession(scope, sessionId) {
      try {
        await httpsCallable(functions, 'closeTable')({ ...scope, sessionId });
        return ok(undefined);
      } catch (error) {
        return err(mapStaffCallableError(error));
      }
    },
    removeParticipant: (scope, participantId) =>
      command(() => removeParticipant(dataConnect, { ...scope, participantId })),
  };
}
