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
  /** Sucursal de la mesa: acota la actualización en vivo de «Mis pedidos» (ADR-0007). */
  readonly branchId: string;
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
      readonly status: 'QUOTED' | 'AUTHORIZED' | 'DECLINED' | 'EXPIRED' | 'RELEASE_PENDING';
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

/**
 * Versión vigente del texto de preautorización (RF-PA-02). El servidor solo autoriza si el cliente
 * aceptó esta versión y la guarda con el resumen. Cambiar el texto exige una versión nueva.
 */
export const PREAUTHORIZATION_CONSENT_VERSION = '2026-11-16';

/**
 * Texto de la preautorización en la versión vigente: importe, moneda y para qué es. `amount` es el
 * importe ya formateado con su moneda (p. ej. «$ 32.000»).
 */
export function preauthorizationConsentText(amount: string): string {
  return (
    `Autorizas una reserva de ${amount} en tu medio de pago para garantizar este pedido antes ` +
    'de que llegue a cocina. No es un cobro: al pagar la cuenta se cobra solo lo consumido y se ' +
    'libera el resto, también si pagas en efectivo.'
  );
}

export interface AuthorizeQuoteRequest {
  readonly quoteId: string;
  /** Versión del texto de preautorización que la persona leyó y aceptó. */
  readonly consentTextVersion: string;
  readonly simulatedOutcome?: SimulatedPaymentOutcome;
}

export type AuthorizeQuoteResponse =
  /** Autorizado y enviado a cocina (D-04): orderId es el pedido creado para el resumen. */
  | {
      readonly quoteId: string;
      readonly status: 'authorized';
      readonly orderId: string;
      /** true mientras solo exista el adaptador simulado: la interfaz lo rotula como tal. */
      readonly simulated: boolean;
    }
  | {
      readonly quoteId: string;
      readonly status: 'declined' | 'requires_action';
      readonly simulated: boolean;
    };

/** Solicitudes al personal desde la mesa (Fase 3). Pedir la cuenta solo avisa al mesero. */
export type ServiceRequestKind = 'call_waiter' | 'request_bill';

export interface RequestServiceRequest {
  readonly sessionId: string;
  readonly kind: ServiceRequestKind;
}

export interface RequestServiceResponse {
  /** already-pending: la mesa ya tenía ese aviso sin atender; no se crea otro. */
  readonly status: 'sent' | 'already-pending';
}

/** Límites de un pedido: el servidor los exige y la interfaz los respeta antes de enviar. */
export const ORDER_LIMITS = {
  maxLines: 50,
  maxQuantity: 99,
  maxOptionsPerLine: 20,
  maxNoteLength: 140,
} as const;
