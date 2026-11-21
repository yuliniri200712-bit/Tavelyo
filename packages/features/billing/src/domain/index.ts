import type { Result } from '@tavelyo/core';

/** Sucursal en la que se trabaja: el servidor vuelve a comprobar empresa, sucursal y permiso. */
export interface BranchScope {
  readonly tenantId: string;
  readonly branchId: string;
}

/** Cuenta de una mesa abierta. */
export interface BillScope extends BranchScope {
  readonly sessionId: string;
}

/** Falla de una operación. `rejected` lleva el motivo que escribe el servidor para la persona. */
export type BillingError =
  | { readonly kind: 'rejected'; readonly message: string }
  | { readonly kind: 'unauthorized' | 'network' | 'unknown' };

export type BillingResult<T> = Promise<Result<T, BillingError>>;

export type PaymentMethod = 'CASH' | 'TERMINAL' | 'TRANSFER';

/** Mesa abierta en la sucursal, sin importes. */
export interface OpenTable {
  readonly sessionId: string;
  readonly tableCode: string;
  readonly sectorName: string;
  readonly openedAt: Date;
  /** Si la mesa pidió la cuenta y todavía nadie la atendió. */
  readonly billRequestedAt: Date | null;
}

export interface BillLine {
  readonly id: string;
  readonly participantId: string;
  readonly name: string;
  readonly quantity: number;
  readonly totalMinor: string;
  readonly paidMinor: string;
  readonly outstandingMinor: string;
}

/** Cuenta calculada por el servidor (D-06, D-30). */
export interface Bill {
  readonly revision: string;
  readonly totalMinor: string;
  readonly taxMinor: string;
  readonly paidMinor: string;
  readonly outstandingMinor: string;
  readonly suggestedTipMinor: string;
  readonly refundedMinor: string;
  readonly lines: readonly BillLine[];
  readonly participants: readonly {
    /** Número en la mesa (D-43): sin teléfono, `guestNumber`; con teléfono, `personNumber`. */
    readonly guestNumber?: number;
    readonly personNumber?: number;
    readonly participantId: string;
    readonly totalMinor: string;
    readonly paidMinor: string;
    readonly outstandingMinor: string;
  }[];
  /** Partes iguales de lo pendiente, si se pidió dividir (D-38). */
  readonly split: readonly string[] | null;
}

export interface BillPayment {
  readonly paymentId: string;
  readonly method: PaymentMethod;
  readonly amountMinor: string;
  readonly tipMinor: string;
  readonly receiptNumber: string | null;
  readonly refundedMinor: string;
  readonly refundableMinor: string;
}

export interface PaymentInput {
  readonly revision: string;
  readonly idempotencyKey: string;
  readonly method: PaymentMethod;
  readonly amountMinor: string;
  readonly tipMinor: string;
  /** Solo en efectivo. */
  readonly receivedMinor?: string;
  /** Solo en datáfono y transferencia (D-33, D-36). */
  readonly receiptNumber?: string;
  /** Cobra solo lo de esa persona. */
  readonly participantId?: string;
}

export interface RecordedPayment {
  readonly paymentId: string;
  readonly changeMinor: string | null;
}

export type RefundInput = {
  readonly revision: string;
  readonly idempotencyKey: string;
  readonly reason: string;
} & (
  { readonly orderItemId: string } | { readonly paymentId: string; readonly amountMinor: string }
);

/** Comprobante comercial de un pago. No es factura electrónica (RF-PA-08). */
export interface Receipt {
  readonly paymentId: string;
  readonly tenantName: string;
  readonly taxId: string | null;
  readonly branchName: string;
  readonly tableCode: string;
  readonly paidAt: Date;
  readonly method: PaymentMethod;
  readonly receiptNumber: string | null;
  readonly lines: readonly {
    readonly name: string;
    readonly quantity: number;
    readonly amountMinor: string;
  }[];
  readonly amountMinor: string;
  readonly tipMinor: string;
  readonly totalMinor: string;
  readonly receivedMinor: string | null;
  readonly changeMinor: string | null;
  readonly refundedMinor: string;
}

/** Contrato que implementa la capa de datos (conector cajas.gql y funciones de cuenta). */
export interface BillingGateway {
  openTables(scope: BranchScope): BillingResult<readonly OpenTable[]>;
  bill(scope: BillScope, parts?: number): BillingResult<Bill>;
  payments(scope: BillScope): BillingResult<readonly BillPayment[]>;
  recordPayment(scope: BillScope, input: PaymentInput): BillingResult<RecordedPayment>;
  refund(scope: BillScope, input: RefundInput): BillingResult<void>;
  closeTable(scope: BillScope): BillingResult<void>;
  receipt(scope: BillScope, paymentId: string): BillingResult<Receipt>;
}

/** Datos de la empresa para el comprobante: el NIT lo valida y lo guarda el backend. */
export interface TenantProfile {
  readonly name: string;
  readonly taxId: string | null;
}

export interface TenantProfileGateway {
  profile(tenantId: string): BillingResult<TenantProfile>;
  /** Devuelve el NIT tal como quedó guardado («900123456-7»). */
  setTaxId(tenantId: string, taxId: string): BillingResult<string>;
}
