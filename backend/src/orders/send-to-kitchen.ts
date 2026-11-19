import { randomUUID } from 'node:crypto';
import type { QuotedLine } from '@tavelyo/contracts';

/** Resumen que su comensal confirmó («Enviar pedido», ADR-0012): lo único que se vuelve pedido. */
export interface ConfirmedQuote {
  readonly id: string;
  readonly tenantId: string;
  readonly branchId: string;
  readonly sessionId: string;
  readonly participantId: string;
  readonly lines: readonly QuotedLine[];
}

/** Estación activa asignada al producto (null: va a la predeterminada) y alérgenos declarados. */
export interface ProductRouting {
  readonly stationId: string | null;
  readonly allergens: readonly string[];
}

export interface OrderRouting {
  readonly products: ReadonlyMap<string, ProductRouting>;
  readonly defaultStationId: string | null;
}

export interface NewOrderModifier {
  readonly position: number;
  readonly optionId: string;
  readonly name: string;
  readonly priceDeltaMinor: string;
}

export interface NewOrderItem {
  readonly id: string;
  readonly position: number;
  readonly productId: string;
  readonly stationId: string;
  readonly productName: string;
  readonly allergens: readonly string[];
  readonly quantity: number;
  readonly unitPriceMinor: string;
  readonly modifiersMinor: string;
  readonly lineTotalMinor: string;
  readonly taxMinor: string;
  readonly note: string | null;
  readonly modifiers: readonly NewOrderModifier[];
}

export interface NewOrder {
  readonly id: string;
  readonly quote: ConfirmedQuote;
  readonly authUid: string;
  readonly items: readonly NewOrderItem[];
}

export interface SendTarget extends Pick<ConfirmedQuote, 'tenantId' | 'branchId' | 'sessionId'> {
  readonly orderId: string;
}

/** sent: llegó a cocina ahora; already-sent: otra solicitud lo envió; rejected: ya no procede. */
export type SendResult = 'sent' | 'already-sent' | 'rejected';

/** Cómo llegan a cocina los pedidos del comensal en la sucursal (D-32). */
export type OrderApprovalMode = 'DIRECT' | 'WAITER_APPROVAL';

/** Aprobación del mesero de un pedido (Order.approval). */
export type OrderApprovalState = 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';

/** requested: quedó pendiente ahora; already-requested: otra solicitud lo hizo; rejected: no procede. */
export type ApprovalRequestResult = 'requested' | 'already-requested' | 'rejected';

export interface StoredOrder {
  readonly id: string;
  readonly sent: boolean;
  readonly approval: OrderApprovalState;
}

export interface KitchenOrderStore {
  byQuote(quoteId: string): Promise<StoredOrder | null>;
  routing(tenantId: string, branchId: string, productIds: readonly string[]): Promise<OrderRouting>;
  /** Crea la estación predeterminada; false si otra solicitud la creó a la vez. */
  createDefaultStation(tenantId: string, branchId: string): Promise<boolean>;
  /** Guarda el pedido sin enviarlo; false si ya había uno para el resumen. */
  insert(order: NewOrder): Promise<boolean>;
  /** Lo envía a cocina con la operación del conector que vuelve a comprobarlo todo. */
  send(target: SendTarget, authUid: string): Promise<SendResult>;
  /** Lo deja pendiente de la aprobación del mesero (D-32), con las mismas comprobaciones. */
  requestApproval(target: SendTarget, authUid: string): Promise<ApprovalRequestResult>;
}

export type DispatchResult =
  | { readonly kind: 'sent'; readonly orderId: string }
  /** Espera a que un mesero lo apruebe (D-32). */
  | { readonly kind: 'pending_approval'; readonly orderId: string }
  /** El mesero lo rechazó o su comensal lo retiró: no llega a cocina. */
  | {
      readonly kind: 'closed';
      readonly orderId: string;
      readonly approval: 'REJECTED' | 'WITHDRAWN';
    }
  /** La mesa se cerró o la persona ya no está: no se envió. */
  | { readonly kind: 'rejected' };

export interface KitchenDispatcherDeps {
  readonly orders: KitchenOrderStore;
  /** Identificadores en el formato de SQL Connect (32 hexadecimales). */
  readonly newId?: () => string;
}

const sqlConnectId = () => randomUUID().replaceAll('-', '');

/** Las líneas del pedido son la instantánea de las del resumen, con su estación y sus alérgenos. */
export function buildOrder(
  quote: ConfirmedQuote,
  authUid: string,
  routing: OrderRouting,
  defaultStationId: string,
  newId: () => string,
): NewOrder {
  return {
    id: newId(),
    quote,
    authUid,
    items: quote.lines.map((line) => {
      const product = routing.products.get(line.productId);
      return {
        id: newId(),
        position: line.position,
        productId: line.productId,
        stationId: product?.stationId ?? defaultStationId,
        productName: line.productName,
        allergens: product?.allergens ?? [],
        quantity: line.quantity,
        unitPriceMinor: line.unitPriceMinor,
        modifiersMinor: line.modifiersMinor,
        lineTotalMinor: line.lineTotalMinor,
        taxMinor: line.taxMinor,
        note: line.note,
        modifiers: line.modifiers.map((modifier, index) => ({
          position: index + 1,
          optionId: modifier.optionId,
          name: modifier.name,
          priceDeltaMinor: modifier.priceDeltaMinor,
        })),
      };
    }),
  };
}

/**
 * Crea (una sola vez por resumen) el pedido de un resumen confirmado y, según la sucursal (D-32), lo
 * envía a cocina o lo deja pendiente del mesero. Es reanudable: si una caída dejó el pedido guardado
 * sin enviar, o el resumen confirmado sin pedido, repetir la llamada termina el trabajo sin duplicar
 * nada (caso 3). Un pedido ya pendiente, rechazado o retirado se informa tal cual.
 */
export function createKitchenDispatcher(deps: KitchenDispatcherDeps) {
  const newId = deps.newId ?? sqlConnectId;

  async function routingWithDefault(quote: ConfirmedQuote) {
    const productIds = [...new Set(quote.lines.map((line) => line.productId))];
    let routing = await deps.orders.routing(quote.tenantId, quote.branchId, productIds);
    if (routing.defaultStationId === null) {
      await deps.orders.createDefaultStation(quote.tenantId, quote.branchId);
      routing = await deps.orders.routing(quote.tenantId, quote.branchId, productIds);
    }
    if (routing.defaultStationId === null) {
      throw new Error(`La sucursal ${quote.branchId} sigue sin estación predeterminada`);
    }
    return { routing, defaultStationId: routing.defaultStationId };
  }

  async function storedOrderId(quote: ConfirmedQuote, authUid: string): Promise<string> {
    const { routing, defaultStationId } = await routingWithDefault(quote);
    const order = buildOrder(quote, authUid, routing, defaultStationId, newId);
    if (await deps.orders.insert(order)) return order.id;
    const winner = await deps.orders.byQuote(quote.id);
    if (!winner) throw new Error(`El pedido del resumen ${quote.id} no aparece tras el choque`);
    return winner.id;
  }

  return async (
    quote: ConfirmedQuote,
    authUid: string,
    mode: OrderApprovalMode,
  ): Promise<DispatchResult> => {
    const existing = await deps.orders.byQuote(quote.id);
    if (existing?.sent) return { kind: 'sent', orderId: existing.id };
    if (existing?.approval === 'PENDING') return { kind: 'pending_approval', orderId: existing.id };
    if (existing?.approval === 'REJECTED' || existing?.approval === 'WITHDRAWN') {
      return { kind: 'closed', orderId: existing.id, approval: existing.approval };
    }
    const orderId = existing?.id ?? (await storedOrderId(quote, authUid));
    const { tenantId, branchId, sessionId } = quote;
    const target = { tenantId, branchId, sessionId, orderId };
    if (mode === 'WAITER_APPROVAL') {
      const requested = await deps.orders.requestApproval(target, authUid);
      return requested === 'rejected'
        ? { kind: 'rejected' }
        : { kind: 'pending_approval', orderId };
    }
    const result = await deps.orders.send(target, authUid);
    return result === 'rejected' ? { kind: 'rejected' } : { kind: 'sent', orderId };
  };
}

export type KitchenDispatcher = ReturnType<typeof createKitchenDispatcher>;
