import type { DataConnect } from 'firebase-admin/data-connect';
import { err, ok } from '@tavelyo/core';
import type { ReceiptRow, ReceiptStore } from '../billing/receipt.ts';
import { failure } from '../shared/outcome.ts';
import { BILL_ACCESS, BILL_SCOPE_VARIABLES } from './billing-documents.ts';

// Comprobante del pago (bloque 6a): mismo acceso que la cuenta, con `payment.record`.

const READ_RECEIPT = `query ReadPaymentReceipt(${BILL_SCOPE_VARIABLES}, $paymentId: UUID!) {
  ${BILL_ACCESS}
  tenant(id: $tenantId) { name taxId }
  branchInfo: branch(id: $branchId) { name }
  sessionInfo: tableSession(id: $sessionId) { table { code } }
  billPayment(id: $paymentId) {
    tenantId branchId status method amountMinor tipMinor currency receivedMinor changeMinor receiptNumber confirmedAt
    bill { sessionId }
    paymentAllocations_on_payment(orderBy: [{ orderItemId: ASC }], limit: 1000) {
      amountMinor orderItem { productNameSnapshot quantity }
    }
    refunds_on_payment(where: { status: { eq: CONFIRMED } }, limit: 1000) { amountMinor }
  }
}`;

interface ReceiptData {
  membership: { role: { code: string }; membershipBranches_on_membership: { branchId: string }[] };
  tenant: { name: string; taxId: string | null };
  branchInfo: { name: string };
  sessionInfo: { table: { code: string } };
  billPayment: {
    tenantId: string;
    branchId: string;
    status: string;
    method: NonNullable<ReceiptRow['payment']>['method'];
    amountMinor: string;
    tipMinor: string;
    currency: string;
    receivedMinor: string | null;
    changeMinor: string | null;
    receiptNumber: string | null;
    confirmedAt: string | null;
    bill: { sessionId: string };
    paymentAllocations_on_payment: {
      amountMinor: string;
      orderItem: { productNameSnapshot: string; quantity: number };
    }[];
    refunds_on_payment: { amountMinor: string }[];
  } | null;
}

const denied = () => err(failure('permission-denied', 'No tienes acceso a esta cuenta.'));

export function createReceiptStore(dc: DataConnect): ReceiptStore {
  return {
    async load(actor, scope, paymentId) {
      try {
        const { data } = await dc.executeGraphqlRead<ReceiptData, Record<string, unknown>>(
          READ_RECEIPT,
          {
            variables: { ...scope, actorId: actor.uid, permission: 'payment.record', paymentId },
          },
        );
        if (
          data.membership.role.code !== 'tenant_owner' &&
          data.membership.membershipBranches_on_membership.length === 0
        )
          return denied();
        const p = data.billPayment;
        // Un pago de otra empresa o sucursal no existe para quien pregunta.
        const mine = p && p.tenantId === scope.tenantId && p.branchId === scope.branchId;
        return ok({
          tenantName: data.tenant.name,
          taxId: data.tenant.taxId,
          branchName: data.branchInfo.name,
          tableCode: data.sessionInfo.table.code,
          payment: mine
            ? {
                sessionId: p.bill.sessionId,
                status: p.status,
                method: p.method,
                amountMinor: p.amountMinor,
                tipMinor: p.tipMinor,
                currency: p.currency,
                receivedMinor: p.receivedMinor,
                changeMinor: p.changeMinor,
                receiptNumber: p.receiptNumber,
                confirmedAt: p.confirmedAt,
                lines: p.paymentAllocations_on_payment.map((a) => ({
                  name: a.orderItem.productNameSnapshot,
                  quantity: a.orderItem.quantity,
                  amountMinor: a.amountMinor,
                })),
                refundsMinor: p.refunds_on_payment.map((r) => r.amountMinor),
              }
            : null,
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes('CUENTA_SIN_ACCESO')) return denied();
        throw error;
      }
    },
  };
}
