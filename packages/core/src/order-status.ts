import { err, ok, type Result } from './result';

/**
 * Estado de una línea de pedido (docs/architecture/state-machines.md §1). Los códigos coinciden
 * con el enum OrderItemStatus del esquema de SQL Connect.
 */
export type OrderItemStatus =
  'RECEIVED' | 'IN_PREPARATION' | 'READY' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';

/**
 * Cambios de estado de una línea. Cocina empieza y termina; el mesero recoge y entrega (RF-CO-03).
 * - `deliverDirectly` entrega una línea lista sin pasar por «recogido» (exige permiso y motivo).
 * - `cancel` exige permiso y motivo; si la línea ya se empezó a preparar, cuenta como merma.
 * No hay acciones para retroceder (D-26): un error se corrige cancelando.
 */
export type OrderItemAction =
  'start' | 'finish' | 'pickUp' | 'deliver' | 'deliverDirectly' | 'cancel';

interface ActionRule {
  readonly from: readonly OrderItemStatus[];
  readonly to: OrderItemStatus;
  readonly requiresReason: boolean;
}

const RULES: Readonly<Record<OrderItemAction, ActionRule>> = {
  start: { from: ['RECEIVED'], to: 'IN_PREPARATION', requiresReason: false },
  finish: { from: ['IN_PREPARATION'], to: 'READY', requiresReason: false },
  pickUp: { from: ['READY'], to: 'PICKED_UP', requiresReason: false },
  deliver: { from: ['PICKED_UP'], to: 'DELIVERED', requiresReason: false },
  deliverDirectly: { from: ['READY'], to: 'DELIVERED', requiresReason: true },
  cancel: { from: ['RECEIVED', 'IN_PREPARATION', 'READY'], to: 'CANCELLED', requiresReason: true },
};

export interface InvalidOrderItemTransition {
  readonly kind: 'invalid-transition';
  readonly action: OrderItemAction;
  readonly from: OrderItemStatus;
}

/** Estado al que lleva la acción, o el rechazo si no se puede aplicar desde el estado actual. */
export function applyOrderItemAction(
  from: OrderItemStatus,
  action: OrderItemAction,
): Result<OrderItemStatus, InvalidOrderItemTransition> {
  const rule = RULES[action];
  return rule.from.includes(from) ? ok(rule.to) : err({ kind: 'invalid-transition', action, from });
}

/** Acciones que admite una línea en su estado actual, en el orden de la tabla. */
export function availableOrderItemActions(status: OrderItemStatus): readonly OrderItemAction[] {
  return (Object.keys(RULES) as OrderItemAction[]).filter((action) =>
    RULES[action].from.includes(status),
  );
}

export function orderItemActionRequiresReason(action: OrderItemAction): boolean {
  return RULES[action].requiresReason;
}

/** Cancelar una línea que ya se empezó a preparar la convierte en merma (Fase 5 la valoriza). */
export function isWasteOnCancel(from: OrderItemStatus): boolean {
  return from === 'IN_PREPARATION' || from === 'READY';
}

/**
 * Estado de un pedido, derivado de sus líneas (RF-CO-02): no se guarda en la base.
 * - `PARTIALLY_READY`: alguna línea ya salió de cocina y otras no.
 * - `READY`: todas salieron de cocina y alguna falta por entregar.
 * - `CANCELLED`: no le queda ninguna línea activa.
 */
export type OrderStatus =
  'RECEIVED' | 'IN_PREPARATION' | 'PARTIALLY_READY' | 'READY' | 'DELIVERED' | 'CANCELLED';

const OUT_OF_KITCHEN: readonly OrderItemStatus[] = ['READY', 'PICKED_UP', 'DELIVERED'];

export function deriveOrderStatus(items: readonly OrderItemStatus[]): OrderStatus {
  const active = items.filter((status) => status !== 'CANCELLED');
  if (active.length === 0) return 'CANCELLED';
  if (active.every((status) => status === 'DELIVERED')) return 'DELIVERED';
  const outOfKitchen = active.filter((status) => OUT_OF_KITCHEN.includes(status)).length;
  if (outOfKitchen === active.length) return 'READY';
  if (outOfKitchen > 0) return 'PARTIALLY_READY';
  return active.every((status) => status === 'RECEIVED') ? 'RECEIVED' : 'IN_PREPARATION';
}
