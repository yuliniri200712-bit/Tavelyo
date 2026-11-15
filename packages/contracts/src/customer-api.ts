/**
 * Contratos de las funciones del backend que usa el cliente en la mesa (ADR-0011). Los importes
 * viajan en unidades menores como cadenas decimales canónicas; los identificadores, como los
 * devuelve SQL Connect. El servidor es la autoridad: el cliente nunca decide un importe.
 */

export interface JoinTableSessionRequest {
  readonly qrPublicId: string;
}

export interface JoinTableSessionResponse {
  readonly sessionId: string;
  readonly participantId: string;
  readonly tableCode: string;
  /** La participación vence en este instante UTC (o antes, si se cierra la mesa). */
  readonly expiresAt: string;
}

export interface QuoteLineRequest {
  readonly productId: string;
  /** Versión del precio que vio el cliente (Price.id). */
  readonly priceId: string;
  readonly quantity: number;
  readonly optionIds: readonly string[];
  readonly note?: string | null;
}

export interface QuoteOrderRequest {
  readonly sessionId: string;
  /** Una por intento de «Revisar pedido»; se repite en los reintentos del mismo intento. */
  readonly idempotencyKey: string;
  readonly lines: readonly QuoteLineRequest[];
  /** Total que el cliente mostró a la persona; si difiere del del servidor, hay que confirmar. */
  readonly expectedTotalMinor: string;
}

export interface QuotedModifier {
  readonly optionId: string;
  readonly name: string;
  readonly priceDeltaMinor: string;
}

export interface QuotedLine {
  readonly position: number;
  readonly productId: string;
  readonly priceId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly unitPriceMinor: string;
  readonly modifiers: readonly QuotedModifier[];
  /** Suma de los adicionales por unidad. */
  readonly modifiersMinor: string;
  readonly lineTotalMinor: string;
  /** Impuesto contenido en la línea (D-01b). */
  readonly taxMinor: string;
  readonly note: string | null;
}

export interface QuoteSummary {
  readonly currency: string;
  readonly lines: readonly QuotedLine[];
  /** Total sin el impuesto contenido. */
  readonly subtotalMinor: string;
  readonly taxMinor: string;
  readonly totalMinor: string;
}

/** Algo del carrito que ya no se puede pedir: hay que quitarlo o corregirlo. */
export type QuoteProblem =
  | { readonly kind: 'unavailable'; readonly position: number; readonly productId: string }
  | { readonly kind: 'invalid-options'; readonly position: number; readonly productId: string };

/** Algo que cambió y que la persona debe confirmar (caso 5): nunca se aplica en silencio. */
export type QuoteChange =
  | {
      readonly kind: 'price-changed';
      readonly position: number;
      readonly productId: string;
      readonly previousPriceId: string;
      readonly priceId: string;
    }
  | {
      readonly kind: 'total-changed';
      readonly expectedTotalMinor: string;
      readonly totalMinor: string;
    };

export type QuoteOrderResponse =
  /** Resumen verificable guardado; la Fase 3 lo envía a cocina. */
  | {
      readonly outcome: 'quoted';
      readonly quoteId: string;
      readonly fingerprint: string;
      readonly expiresAt: string;
      readonly status: 'QUOTED' | 'AUTHORIZED' | 'DECLINED' | 'EXPIRED';
      readonly summary: QuoteSummary;
    }
  /** No se guardó nada: el resumen trae los importes actuales para confirmarlos y reenviar. */
  | {
      readonly outcome: 'changed';
      readonly changes: readonly QuoteChange[];
      readonly summary: QuoteSummary;
    }
  | { readonly outcome: 'rejected'; readonly problems: readonly QuoteProblem[] };

/** Resultados que se pueden forzar en el adaptador simulado (solo con el proyecto demo). */
export type SimulatedPaymentOutcome = 'approved' | 'declined' | 'requires_action' | 'timeout';

export interface AuthorizeQuoteRequest {
  readonly quoteId: string;
  readonly simulatedOutcome?: SimulatedPaymentOutcome;
}

export interface AuthorizeQuoteResponse {
  readonly quoteId: string;
  readonly status: 'authorized' | 'declined' | 'requires_action';
  /** Siempre true en la Fase 2: la interfaz lo rotula como pago simulado. */
  readonly simulated: boolean;
}
