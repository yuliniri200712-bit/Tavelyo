import { randomUUID } from 'node:crypto';
import type { QuotedLine } from '@tavelyo/contracts';

/** Resumen cuya preautorización confirmó el servidor: lo único que puede llegar a cocina (D-04). */
export interface AuthorizedQuote {
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
  readonly quote: AuthorizedQuote;
  readonly authUid: string;
  readonly items: readonly NewOrderItem[];
}

export interface SendTarget extends Pick<AuthorizedQuote, 'tenantId' | 'branchId' | 'sessionId'> {
  readonly orderId: string;
}

/** sent: llegó a cocina ahora; already-sent: otra solicitud lo envió; rejected: ya no procede. */
export type SendResult = 'sent' | 'already-sent' | 'rejected';

export interface KitchenOrderStore {
  byQuote(quoteId: string): Promise<{ readonly id: string; readonly sent: boolean } | null>;
  routing(tenantId: string, branchId: string, productIds: readonly string[]): Promise<OrderRouting>;
  /** Crea la estación predeterminada; false si otra solicitud la creó a la vez. */
  createDefaultStation(tenantId: string, branchId: string): Promise<boolean>;
  /** Guarda el pedido sin enviarlo; false si ya había uno para el resumen. */
  insert(order: NewOrder): Promise<boolean>;
  /** Lo envía a cocina con la operación del conector que vuelve a comprobar D-04. */
  send(target: SendTarget, authUid: string): Promise<SendResult>;
}

export type DispatchResult =
  { readonly kind: 'sent'; readonly orderId: string } | { readonly kind: 'rejected' };

export interface KitchenDispatcherDeps {
  readonly orders: KitchenOrderStore;
  /** Identificadores en el formato de SQL Connect (32 hexadecimales). */
  readonly newId?: () => string;
}

const sqlConnectId = () => randomUUID().replaceAll('-', '');

/** Las líneas del pedido son la instantánea de las del resumen, con su estación y sus alérgenos. */
export function buildOrder(
  quote: AuthorizedQuote,
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
 * Crea (una sola vez por resumen) y envía a cocina el pedido de un resumen autorizado. Es
 * reanudable: si una caída dejó el pedido guardado sin enviar, o el resumen autorizado sin pedido,
 * repetir la llamada termina el trabajo sin volver a autorizar ni duplicar nada (caso 3).
 */
export function createKitchenDispatcher(deps: KitchenDispatcherDeps) {
  const newId = deps.newId ?? sqlConnectId;

  async function routingWithDefault(quote: AuthorizedQuote) {
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

  async function storedOrderId(quote: AuthorizedQuote, authUid: string): Promise<string> {
    const { routing, defaultStationId } = await routingWithDefault(quote);
    const order = buildOrder(quote, authUid, routing, defaultStationId, newId);
    if (await deps.orders.insert(order)) return order.id;
    const winner = await deps.orders.byQuote(quote.id);
    if (!winner) throw new Error(`El pedido del resumen ${quote.id} no aparece tras el choque`);
    return winner.id;
  }

  return async (quote: AuthorizedQuote, authUid: string): Promise<DispatchResult> => {
    const existing = await deps.orders.byQuote(quote.id);
    if (existing?.sent) return { kind: 'sent', orderId: existing.id };
    const orderId = existing?.id ?? (await storedOrderId(quote, authUid));
    const { tenantId, branchId, sessionId } = quote;
    const result = await deps.orders.send({ tenantId, branchId, sessionId, orderId }, authUid);
    return result === 'rejected' ? { kind: 'rejected' } : { kind: 'sent', orderId };
  };
}

export type KitchenDispatcher = ReturnType<typeof createKitchenDispatcher>;
