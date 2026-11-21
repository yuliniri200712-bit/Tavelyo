import type { LiveObserver, Result } from '@tavelyo/core';

/** Mesa tal como la ve quien gestiona el salón (incluye el identificador del QR). */
export interface DiningTableAdmin {
  readonly id: string;
  readonly code: string;
  readonly seats: number;
  readonly qrPublicId: string;
  readonly archived: boolean;
}

export interface SectorAdmin {
  readonly id: string;
  readonly name: string;
  readonly sort: number;
  readonly archived: boolean;
  readonly tables: readonly DiningTableAdmin[];
}

/** Sucursal en la que se trabaja: el servidor vuelve a comprobar empresa, sucursal y permiso. */
export interface BranchScope {
  readonly tenantId: string;
  readonly branchId: string;
}

export interface SectorInput {
  readonly name: string;
  readonly sort: number;
}

export interface TableInput {
  readonly sectorId: string;
  readonly code: string;
  readonly seats: number;
}

/**
 * Falla de una operación. `rejected` lleva el motivo que da el servidor (mensajes fijos y sin
 * datos de otras empresas); el resto son fallas de conexión o inesperadas.
 */
export type FloorError =
  | { readonly kind: 'rejected'; readonly message: string }
  | { readonly kind: 'unauthorized' | 'network' | 'unknown' };

export type FloorResult<T> = Promise<Result<T, FloorError>>;

/** Contrato que implementa la capa de datos (SQL Connect). */
export interface FloorAdminGateway {
  layout(scope: BranchScope): FloorResult<readonly SectorAdmin[]>;
  createSector(scope: BranchScope, input: SectorInput): FloorResult<void>;
  updateSector(
    scope: BranchScope,
    sectorId: string,
    input: SectorInput & { readonly archived: boolean },
  ): FloorResult<void>;
  createTable(scope: BranchScope, input: TableInput): FloorResult<void>;
  updateTable(
    scope: BranchScope,
    tableId: string,
    input: TableInput & { readonly archived: boolean },
  ): FloorResult<void>;
  rotateQr(scope: BranchScope, tableId: string): FloorResult<void>;
}

export type ServiceRequestKind = 'CALL_WAITER' | 'REQUEST_BILL';

/** Lo que pasa en una mesa abierta, para mostrarlo en texto en el salón (RF-ME-01). */
export interface TableActivity {
  /** Líneas recibidas o en preparación. */
  readonly inKitchen: number;
  /** Líneas listas para recoger. */
  readonly ready: number;
  /** Líneas recogidas que faltan por entregar. */
  readonly pickedUp: number;
  /** Solicitudes pendientes, de la más antigua a la más reciente. */
  readonly requests: readonly { readonly kind: ServiceRequestKind; readonly createdAt: Date }[];
}

export interface FloorSession {
  readonly id: string;
  readonly openedAt: Date;
  readonly activity: TableActivity;
}

/** Mesa tal como la ve el mesero: sin el identificador del QR. */
export interface FloorTable {
  readonly id: string;
  readonly code: string;
  readonly seats: number;
  /** Sesión abierta de la mesa; null si está libre. */
  readonly session: FloorSession | null;
}

export interface FloorSector {
  readonly id: string;
  readonly name: string;
  readonly tables: readonly FloorTable[];
}

/**
 * Persona de la mesa: se unió desde su teléfono o, sin teléfono, la agregó el mesero con un número
 * (`guestNumber`, D-43). El servidor no entrega su cuenta.
 */
export interface SessionParticipant {
  readonly id: string;
  readonly guestNumber: number | null;
  readonly joinedAt: Date;
  readonly expiresAt: Date;
  readonly removedAt: Date | null;
}

/** Contrato del salón para el personal en servicio (session.open y session.close). */
export interface FloorServiceGateway {
  /** Lectura completa: al abrir, al reconectar y tras cada cambio (caso 11). */
  floor(scope: BranchScope): FloorResult<readonly FloorSector[]>;
  /** Suscripción en tiempo real (ADR-0007); devuelve la función que la cancela. */
  watchFloor(
    scope: BranchScope,
    observer: LiveObserver<readonly FloorSector[], FloorError>,
  ): () => void;
  participants(scope: BranchScope, sessionId: string): FloorResult<readonly SessionParticipant[]>;
  openTable(scope: BranchScope, tableId: string): FloorResult<void>;
  transfer(
    scope: BranchScope,
    sessionId: string,
    sourceId: string,
    tableId: string,
  ): FloorResult<void>;
  closeSession(scope: BranchScope, sessionId: string): FloorResult<void>;
  removeParticipant(scope: BranchScope, participantId: string): FloorResult<void>;
}
