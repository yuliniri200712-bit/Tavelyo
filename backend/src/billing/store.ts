import type {
  BillScope,
  CashMovementKindCode,
  RecordedPaymentResponse,
  RecordPaymentRequest,
} from '@tavelyo/contracts';
import type { OrderItemStatus, RefundStatus, TablePerson } from '@tavelyo/core';
import type { Actor, Outcome } from '../shared/outcome.ts';

export interface AccountLine {
  readonly id: string;
  readonly version: number;
  readonly status: OrderItemStatus;
  readonly lineTotalMinor: string;
  readonly taxMinor: string;
  readonly productNameSnapshot: string;
  readonly quantity: number;
  readonly order: {
    readonly participantId: string;
    readonly sentToKitchenAt: string | null;
    readonly approval: string;
  };
}

/** Reembolso de un pago (D-34, D-37): con `orderItemId`, por plato; sin él, general. */
export interface AccountRefund {
  readonly id: string;
  readonly amountMinor: string;
  readonly status: RefundStatus;
  readonly orderItemId: string | null;
  readonly idempotencyKey: string;
  readonly requestFingerprint: string | null;
}

export interface AccountPayment extends RecordedPaymentResponse {
  readonly idempotencyKey: string;
  readonly requestFingerprint: string | null;
  readonly allocations: readonly { readonly orderItemId: string; readonly amountMinor: string }[];
  readonly refunds: readonly AccountRefund[];
}

export interface AccountSnapshot {
  readonly currency: string;
  readonly open: boolean;
  /** Rol de quien llama en la empresa; decide el tope de reembolso (D-34). */
  readonly roleCode: string;
  readonly bill: { readonly id: string; readonly version: number; readonly status: string } | null;
  readonly lines: readonly AccountLine[];
  /** Personas de la sesión por orden de llegada, para numerarlas como el salón (D-43). */
  readonly people: readonly TablePerson[];
  readonly payments: readonly AccountPayment[];
  /** Caja abierta de quien llama en la sucursal (D-40): el efectivo pasa por ella. */
  readonly cashSession: {
    readonly id: string;
    readonly version: number;
    readonly openingFloatMinor: string;
    readonly movements: readonly {
      readonly kind: CashMovementKindCode;
      readonly amountMinor: string;
    }[];
  } | null;
}

/** Caja que se bloquea al escribir un movimiento de efectivo (D-40). */
export interface CashUse {
  readonly sessionId: string;
  readonly version: number;
}

export interface PaymentWrite {
  readonly input: RecordPaymentRequest;
  readonly snapshot: AccountSnapshot;
  readonly fingerprint: string;
  readonly payment: RecordedPaymentResponse;
  readonly allocations: readonly { readonly orderItemId: string; readonly amountMinor: string }[];
  /** Solo en efectivo: la caja y la venta (consumo más propina). */
  readonly cash: (CashUse & { readonly saleMinor: string }) | null;
}

export interface RefundWrite {
  readonly scope: BillScope;
  readonly snapshot: AccountSnapshot & { readonly bill: NonNullable<AccountSnapshot['bill']> };
  readonly idempotencyKey: string;
  readonly fingerprint: string;
  readonly reason: string;
  readonly refunds: readonly {
    readonly refundId: string;
    readonly paymentId: string;
    readonly amountMinor: string;
  }[];
  /** Reembolso por plato: la línea que se cancela con su versión y si cuenta como merma. */
  readonly line: { readonly id: string; readonly version: number; readonly wasted: boolean } | null;
  /** Si algún reembolso es de un pago en efectivo: la caja y qué reembolsos salen de ella. */
  readonly cash: (CashUse & { readonly refundIndexes: readonly number[] }) | null;
}

export type BillingPermission = 'bill.read' | 'payment.record' | 'payment.refund' | 'session.close';

/** Cierre de la mesa (D-30): con la cuenta en la versión leída y su total, o sin cuenta. */
export interface CloseWrite {
  readonly scope: BillScope;
  readonly settle: {
    readonly billId: string;
    readonly version: number;
    readonly totalMinor: string;
  } | null;
}

/** Resultado del cierre: hecho, la mesa o la cuenta cambió, o quien cierra perdió el permiso. */
export type CloseOutcome = 'closed' | 'changed' | 'denied';

export interface BillingStore {
  load(
    actor: Actor,
    scope: BillScope,
    permission: BillingPermission,
  ): Promise<Outcome<AccountSnapshot>>;
  /** Guarda pago, asignaciones y auditoría juntos; false si la cuenta cambió. */
  record(actor: Actor, write: PaymentWrite): Promise<boolean>;
  /** Guarda reembolsos, la cancelación del plato (si la hay) y la auditoría juntos; false si cambió. */
  refund(actor: Actor, write: RefundWrite): Promise<boolean>;
  /** Cierra la mesa y, si hay cuenta, la deja saldada, en una transacción. */
  close(actor: Actor, write: CloseWrite): Promise<CloseOutcome>;
}
