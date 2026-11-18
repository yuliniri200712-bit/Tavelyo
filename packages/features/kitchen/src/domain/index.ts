import type { LiveObserver, Result } from '@tavelyo/core';

/** Sucursal en la que se trabaja: el servidor vuelve a comprobar empresa, sucursal y permiso. */
export interface BranchScope {
  readonly tenantId: string;
  readonly branchId: string;
}

/** Estación activa entre las que elige quien trabaja en cocina (D-24). */
export interface KitchenStation {
  readonly id: string;
  readonly name: string;
  readonly isDefault: boolean;
}

/**
 * Línea pendiente en la cola de una estación. Sin importes ni datos del cliente
 * (permissions.md §4); con los alérgenos declarados, que siempre se muestran (PM §7).
 */
export interface KitchenItem {
  readonly id: string;
  /** Versión que se envía con cada cambio: si otra persona se adelantó, el servidor lo rechaza. */
  readonly version: number;
  readonly status: 'RECEIVED' | 'IN_PREPARATION';
  readonly quantity: number;
  readonly productName: string;
  readonly allergens: readonly string[];
  readonly note: string | null;
  readonly modifiers: readonly string[];
  readonly tableCode: string;
  readonly orderId: string;
  /** Cuándo llegó a cocina: los minutos de espera se cuentan desde aquí. */
  readonly sentAt: Date;
  readonly startedAt: Date | null;
}

/**
 * Falla de una operación. `rejected` lleva el motivo que da el servidor (p. ej. «Esta línea ya
 * cambió»); `unauthorized` indica que la sesión perdió el permiso (revocación).
 */
export type KitchenError =
  | { readonly kind: 'rejected'; readonly message: string }
  | { readonly kind: 'unauthorized' | 'network' | 'unknown' };

export type KitchenResult<T> = Promise<Result<T, KitchenError>>;

/** Observador de la cola en tiempo real (ADR-0007). */
export type QueueObserver = LiveObserver<readonly KitchenItem[], KitchenError>;

/** Línea a la que se aplica un cambio, con la versión que vio la persona. */
export interface ItemRef {
  readonly id: string;
  readonly version: number;
}

/** Contrato que implementa la capa de datos (SQL Connect, conectores cocina.gql y pedidos.gql). */
export interface KitchenGateway {
  stations(scope: BranchScope): KitchenResult<readonly KitchenStation[]>;
  /** Lectura completa de lo pendiente: al abrir, al reconectar y tras un error (caso 11). */
  queue(scope: BranchScope, stationId: string): KitchenResult<readonly KitchenItem[]>;
  /** Suscripción en tiempo real; devuelve la función que la cancela. */
  watchQueue(scope: BranchScope, stationId: string, observer: QueueObserver): () => void;
  start(scope: BranchScope, item: ItemRef): KitchenResult<void>;
  finish(scope: BranchScope, item: ItemRef): KitchenResult<void>;
  cancel(scope: BranchScope, item: ItemRef, reason: string): KitchenResult<void>;
}
