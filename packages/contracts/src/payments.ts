import type { SimulatedPaymentOutcome } from './customer-api.ts';

/**
 * Contrato de la pasarela de pago (RF-PA-01, ADR-0006). Operaciones separadas: autorizar,
 * consultar, capturar, anular la autorización y reembolsar. Ninguna recibe ni devuelve datos de
 * tarjeta: el proveedor certificado tokeniza en su propio formulario y aquí solo viajan
 * referencias e importes (CLAUDE.md §7). El proveedor real está pendiente (D-02); en la Fase 2
 * solo existe el adaptador simulado del backend.
 */

/** Importe en unidades menores como cadena decimal canónica (`Int64` de SQL Connect). */
export interface PaymentAmount {
  readonly amountMinor: string;
  readonly currency: string;
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

export type PaymentStatus =
  'authorized' | 'declined' | 'requires_action' | 'captured' | 'voided' | 'refunded';

export interface PaymentResult {
  readonly status: PaymentStatus;
  /** Referencia del proveedor para consultar, capturar, anular o reembolsar. */
  readonly paymentRef: string;
  /** true solo en el adaptador simulado: la interfaz y los registros lo muestran. */
  readonly simulated: boolean;
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

export interface PaymentGateway {
  /** true si es el adaptador simulado (nunca mueve dinero). */
  readonly simulated: boolean;
  authorize(request: AuthorizeRequest): Promise<PaymentResult>;
  /** Estado de una operación por su clave de idempotencia (tras un tiempo agotado). */
  status(idempotencyKey: string): Promise<PaymentResult | null>;
  capture(paymentRef: string, amount: PaymentAmount): Promise<PaymentResult>;
  voidAuthorization(paymentRef: string): Promise<PaymentResult>;
  refund(paymentRef: string, amount: PaymentAmount): Promise<PaymentResult>;
}
