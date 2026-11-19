import type { SimulatedPaymentOutcome } from './customer-api.ts';

/**
 * Contrato de la pasarela de pago (RF-PA-01, ADR-0006). Operaciones separadas: autorizar,
 * consultar, capturar, anular la autorización y reembolsar, más la verificación de sus avisos
 * (webhooks). Ninguna recibe ni devuelve datos de tarjeta: el proveedor certificado tokeniza en su
 * propio formulario y aquí solo viajan referencias e importes (CLAUDE.md §7). El proveedor real
 * está pendiente (D-02); mientras tanto solo existe el adaptador simulado del backend.
 */

/** Importe en unidades menores como cadena decimal canónica (`Int64` de SQL Connect). */
export interface PaymentAmount {
  readonly amountMinor: string;
  readonly currency: string;
}

/** Lo que admite la pasarela; el backend no intenta lo que no admite (Fase 4, bloque 3). */
export interface GatewayCapabilities {
  /** Capturar menos de lo autorizado; el resto se libera en la misma operación. */
  readonly partialCapture: boolean;
  /** Ampliar una autorización existente (no se usa todavía: se informa al elegir D-02). */
  readonly incrementalAuthorization: boolean;
  /** Varios reembolsos parciales de un mismo pago. */
  readonly partialRefund: boolean;
}

export interface AuthorizeRequest {
  readonly amount: PaymentAmount;
  /** Misma clave en un reintento ⇒ misma autorización (sin cobrar dos veces). */
  readonly idempotencyKey: string;
  /** Referencia propia (p. ej. el resumen de pedido), sin datos personales. */
  readonly reference: string;
  /** Solo lo admite el adaptador simulado; un adaptador real debe rechazarlo. */
  readonly simulatedOutcome?: SimulatedPaymentOutcome;
}

/** Captura de una autorización: lo que no se captura se libera (si la pasarela lo admite). */
export interface CaptureRequest {
  readonly paymentRef: string;
  readonly amount: PaymentAmount;
  readonly idempotencyKey: string;
}

/** Anulación (liberación) de una autorización sin capturar. */
export interface VoidRequest {
  readonly paymentRef: string;
  readonly idempotencyKey: string;
}

/** Reembolso de lo capturado de un pago. */
export interface RefundRequest {
  readonly paymentRef: string;
  readonly amount: PaymentAmount;
  readonly idempotencyKey: string;
}

export type PaymentStatus =
  | 'authorized'
  | 'declined'
  | 'requires_action'
  | 'captured'
  | 'voided'
  | 'refunded'
  /** El reembolso está en curso: se confirma después con un aviso o una consulta. */
  | 'refund_pending'
  /** La pasarela rechazó la operación (no la autorización): `failureCode` dice por qué. */
  | 'failed'
  /** La autorización venció: ya no se puede capturar (PM §8, paso 9). */
  | 'expired';

export interface PaymentResult {
  readonly status: PaymentStatus;
  /**
   * Referencia del proveedor: la de la autorización (también al capturarla o anularla) o la del
   * reembolso.
   */
  readonly paymentRef: string;
  /** true solo en el adaptador simulado: la interfaz y los registros lo muestran. */
  readonly simulated: boolean;
  /** Vencimiento de la autorización (ISO 8601), si la pasarela lo informa. */
  readonly expiresAt?: string;
  /** Código del rechazo, sin datos de la tarjeta ni del cliente (PM §10). */
  readonly failureCode?: string;
}

/** El proveedor no respondió a tiempo: el resultado es desconocido y se consulta con `status`. */
export class PaymentTimeoutError extends Error {
  readonly idempotencyKey: string;

  constructor(idempotencyKey: string) {
    super('La pasarela de pago no respondió a tiempo');
    this.name = 'PaymentTimeoutError';
    this.idempotencyKey = idempotencyKey;
  }
}

/** Se repitió una clave de idempotencia con otra operación u otro importe: error de programación. */
export class PaymentKeyConflictError extends Error {
  readonly idempotencyKey: string;

  constructor(idempotencyKey: string) {
    super('La clave de idempotencia ya se usó con otra operación o importe');
    this.name = 'PaymentKeyConflictError';
    this.idempotencyKey = idempotencyKey;
  }
}

/**
 * Aviso de la pasarela ya verificado (firma y antigüedad). Dice el estado de una operación; el
 * backend lo contrasta con su propio registro antes de aplicarlo (importe, moneda y referencia).
 */
export interface ProviderNotice {
  /** Identificador del aviso en la pasarela: los repetidos se descartan (caso 8). */
  readonly eventId: string;
  readonly type: string;
  /** Clave de idempotencia de la operación, si la pasarela la devuelve. */
  readonly operationKey: string | null;
  readonly paymentRef: string;
  readonly status: PaymentStatus;
  readonly amount: PaymentAmount;
  readonly occurredAt: string;
}

export type WebhookRejection = 'invalid-signature' | 'stale' | 'malformed';

export type WebhookVerification =
  | { readonly ok: true; readonly notice: ProviderNotice }
  | { readonly ok: false; readonly reason: WebhookRejection };

export interface PaymentGateway {
  /** true si es el adaptador simulado (nunca mueve dinero). */
  readonly simulated: boolean;
  /** Nombre del proveedor que se guarda con cada autorización y aviso («simulated»). */
  readonly provider: string;
  readonly capabilities: GatewayCapabilities;
  authorize(request: AuthorizeRequest): Promise<PaymentResult>;
  /** Estado de una operación por su clave de idempotencia (tras un tiempo agotado). */
  status(idempotencyKey: string): Promise<PaymentResult | null>;
  capture(request: CaptureRequest): Promise<PaymentResult>;
  voidAuthorization(request: VoidRequest): Promise<PaymentResult>;
  refund(request: RefundRequest): Promise<PaymentResult>;
  /**
   * Verifica un aviso con el cuerpo tal como llegó (sin volver a serializarlo) y la cabecera de
   * firma del proveedor. Sin firma válida o fuera de plazo, no se usa nada del cuerpo.
   */
  verifyWebhook(
    rawBody: string,
    header: (name: string) => string | undefined,
    now: Date,
  ): WebhookVerification;
}
