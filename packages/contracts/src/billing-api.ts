/** Registro de pagos del restaurante (ADR-0012); importes decimales enteros en unidades menores. */
export type RecordedPaymentMethod = 'CASH' | 'TERMINAL' | 'TRANSFER';

/**
 * Largo máximo del número de comprobante (D-36). Un número de tarjeta tiene de 13 a 19 dígitos,
 * así que con 12 caracteres no cabe completo aunque el cajero lo escriba por error.
 */
export const RECEIPT_NUMBER_MAX_LENGTH = 12;

export interface BillScope {
  readonly tenantId: string;
  readonly branchId: string;
  readonly sessionId: string;
}

export interface BillPartResponse {
  readonly totalMinor: string;
  readonly paidMinor: string;
  readonly outstandingMinor: string;
}

export interface BillResponse extends BillPartResponse {
  readonly sessionId: string;
  readonly currency: string;
  /** Cambia al variar las líneas o los pagos; el cajero debe revisar de nuevo si cambió. */
  readonly revision: string;
  readonly taxMinor: string;
  readonly suggestedTipMinor: string;
  readonly lines: readonly (BillPartResponse & {
    readonly id: string;
    readonly participantId: string;
    readonly name: string;
    readonly quantity: number;
    readonly taxMinor: string;
  })[];
  readonly participants: readonly (BillPartResponse & { readonly participantId: string })[];
}

export interface RecordPaymentRequest extends BillScope {
  readonly revision: string;
  readonly idempotencyKey: string;
  readonly method: RecordedPaymentMethod;
  readonly currency: string;
  readonly amountMinor: string;
  readonly tipMinor: string;
  readonly participantId?: string;
  readonly receivedMinor?: string;
  readonly receiptNumber?: string;
}

export interface RecordedPaymentResponse {
  readonly paymentId: string;
  readonly method: RecordedPaymentMethod;
  readonly amountMinor: string;
  readonly tipMinor: string;
  readonly currency: string;
  readonly receivedMinor: string | null;
  readonly changeMinor: string | null;
  readonly receiptNumber: string | null;
}
