import type { LiveObserver, Result } from '@tavelyo/core';

/** Sucursal en la que se trabaja: el servidor vuelve a comprobar empresa, sucursal y permiso. */
export interface BranchScope {
  readonly tenantId: string;
  readonly branchId: string;
}

export type ServiceRequestKind = 'CALL_WAITER' | 'REQUEST_BILL';

/** Solicitud pendiente de una mesa abierta. Sin datos de quien la hizo. */
export interface PendingRequest {
  readonly id: string;
  readonly kind: ServiceRequestKind;
  readonly createdAt: Date;
  readonly tableCode: string;
}

export type ServiceRequestsError =
  | { readonly kind: 'rejected'; readonly message: string }
  | { readonly kind: 'unauthorized' | 'network' | 'unknown' };

export type ServiceRequestsResult<T> = Promise<Result<T, ServiceRequestsError>>;

export type PendingRequestsObserver = LiveObserver<readonly PendingRequest[], ServiceRequestsError>;

/** Contrato que implementa la capa de datos (conector pedidos.gql, service_request.handle). */
export interface ServiceRequestsGateway {
  pending(scope: BranchScope): ServiceRequestsResult<readonly PendingRequest[]>;
  /** Suscripción en tiempo real (ADR-0007); devuelve la función que la cancela. */
  watchPending(scope: BranchScope, observer: PendingRequestsObserver): () => void;
  /** «Atendida»: sale de la lista y la mesa puede volver a pedirla. */
  attend(scope: BranchScope, requestId: string): ServiceRequestsResult<void>;
}
