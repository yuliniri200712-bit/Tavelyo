import type { BillScope, RecordedPaymentResponse, RecordPaymentRequest } from '@tavelyo/contracts';
import type { OrderItemStatus } from '@tavelyo/core';
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

export interface AccountPayment extends RecordedPaymentResponse {
  readonly idempotencyKey: string;
  readonly requestFingerprint: string | null;
  readonly allocations: readonly { readonly orderItemId: string; readonly amountMinor: string }[];
}

export interface AccountSnapshot {
  readonly currency: string;
  readonly open: boolean;
  readonly bill: { readonly id: string; readonly version: number; readonly status: string } | null;
  readonly lines: readonly AccountLine[];
  readonly payments: readonly AccountPayment[];
}

export interface PaymentWrite {
  readonly input: RecordPaymentRequest;
  readonly snapshot: AccountSnapshot;
  readonly fingerprint: string;
  readonly payment: RecordedPaymentResponse;
  readonly allocations: readonly { readonly orderItemId: string; readonly amountMinor: string }[];
}

export interface BillingStore {
  load(
    actor: Actor,
    scope: BillScope,
    permission: 'bill.read' | 'payment.record',
  ): Promise<Outcome<AccountSnapshot>>;
  /** Guarda pago, asignaciones y auditoría juntos; false si la cuenta cambió. */
  record(actor: Actor, write: PaymentWrite): Promise<boolean>;
}
