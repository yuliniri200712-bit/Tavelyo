import type { DataConnect } from 'firebase/data-connect';
import {
  attendServiceRequest,
  pendingServiceRequests,
  pendingServiceRequestsRef,
  ServiceRequestKind,
  type PendingServiceRequestsData,
} from '@tavelyo/dataconnect-sdk';
import type {
  PendingRequest,
  ServiceRequestsGateway,
  ServiceRequestKind as Kind,
} from '@tavelyo/service-requests/domain';
import { readQuery, runCommand, SERVER_ONLY, watchQuery } from './live-query.ts';

const KIND: Readonly<Record<ServiceRequestKind, Kind>> = {
  [ServiceRequestKind.CALL_WAITER]: 'CALL_WAITER',
  [ServiceRequestKind.REQUEST_BILL]: 'REQUEST_BILL',
};

/** Solicitudes pendientes de mesas abiertas (lo filtra el conector), sin datos de quien pidió. */
export function toPendingRequests(data: PendingServiceRequestsData): PendingRequest[] {
  return data.serviceRequests.map((request) => ({
    id: request.id,
    kind: KIND[request.kind],
    createdAt: new Date(request.createdAt),
    tableCode: request.session.table.code,
  }));
}

/** Solicitudes de servicio para el personal con SQL Connect (service_request.handle). */
export function createServiceRequestsGateway(dataConnect: DataConnect): ServiceRequestsGateway {
  return {
    pending: (scope) =>
      readQuery(() => pendingServiceRequests(dataConnect, scope, SERVER_ONLY), toPendingRequests),
    watchPending: (scope, observer) =>
      watchQuery(pendingServiceRequestsRef(dataConnect, scope), toPendingRequests, observer),
    attend: (scope, requestId) =>
      runCommand(() => attendServiceRequest(dataConnect, { ...scope, requestId })),
  };
}
