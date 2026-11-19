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

/** Lectura de la cuenta; `parts` pide además dividir lo pendiente en partes iguales (D-06). */
export interface ReadBillRequest extends BillScope {
  readonly parts?: number;
}

/** Partes de la división en partes iguales: de 2 a 20. */
export const BILL_SPLIT_PARTS = { min: 2, max: 20 } as const;

/**
 * Topes de reembolso por rol en pesos (D-34): por cada solicitud, siempre con motivo. `null` es sin
 * tope de rol. Los roles sin `payment.refund` no reembolsan.
 */
export const REFUND_LIMIT_PESOS: Readonly<Record<string, number | null>> = {
  cashier: 50_000,
  branch_admin: 300_000,
  tenant_owner: null,
};

/** Motivo del reembolso: entre 3 y 200 caracteres. */
export const REFUND_REASON = { min: 3, max: 200 } as const;

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
  /** Suma de los reembolsos confirmados (por plato y generales). */
  readonly refundedMinor: string;
  /** Lo pendiente dividido en partes iguales en pesos enteros, si se pidió `parts`. */
  readonly split: readonly string[] | null;
}

/** Pagos de la cuenta con lo reembolsado: solo para quien puede reembolsar (payment.refund). */
export interface BillPaymentsResponse {
  readonly sessionId: string;
  readonly revision: string;
  readonly payments: readonly {
    readonly paymentId: string;
    readonly method: RecordedPaymentMethod;
    readonly amountMinor: string;
    readonly tipMinor: string;
    readonly receiptNumber: string | null;
    readonly refundedMinor: string;
    readonly refundableMinor: string;
  }[];
}

/**
 * Reembolso registrado (D-34, D-37). Por plato: `orderItemId`, se devuelve lo pagado de ese plato y
 * el plato se cancela. General: `paymentId` y `amountMinor`; la cuenta no cambia.
 */
export interface RecordRefundRequest extends BillScope {
  readonly revision: string;
  readonly idempotencyKey: string;
  readonly reason: string;
  readonly orderItemId?: string;
  readonly paymentId?: string;
  readonly amountMinor?: string;
}

export interface RecordRefundResponse {
  readonly kind: 'LINE' | 'GENERAL';
  readonly totalMinor: string;
  readonly orderItemId: string | null;
  readonly refunds: readonly {
    readonly refundId: string;
    readonly paymentId: string;
    readonly amountMinor: string;
  }[];
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

/** Cierre de mesa (D-30): solo con saldo cero, todo entregado y ningún pedido por aprobar. */
export interface CloseTableResponse {
  readonly sessionId: string;
  /** Total de la cuenta saldada; null si la mesa no tuvo consumo. */
  readonly settledTotalMinor: string | null;
}
