import type { DataConnect } from 'firebase/data-connect';
import type { Functions } from 'firebase/functions';
import { billingTables, tenantProfile, type BillingTablesData } from '@tavelyo/dataconnect-sdk';
import { err, ok } from '@tavelyo/core';
import type {
  BillPaymentsResponse,
  BillResponse,
  PaymentReceiptResponse,
  RecordedPaymentResponse,
  SetTenantTaxIdResponse,
} from '@tavelyo/contracts';
import type {
  BillingGateway,
  OpenTable,
  Receipt,
  TenantProfileGateway,
} from '@tavelyo/billing/domain';
import { callStaffFunction as call } from './staff-callable.ts';
import { readQuery, SERVER_ONLY } from './live-query.ts';

export function toOpenTables(data: BillingTablesData): OpenTable[] {
  return data.tableSessions.map((s) => {
    const request = s.serviceRequests_on_session[0];
    return {
      sessionId: s.id,
      tableCode: s.table.code,
      sectorName: s.table.sector.name,
      openedAt: new Date(s.openedAt),
      billRequestedAt: request ? new Date(request.createdAt) : null,
    };
  });
}

export function toReceipt(r: PaymentReceiptResponse): Receipt {
  return {
    paymentId: r.paymentId,
    tenantName: r.tenantName,
    taxId: r.taxId,
    branchName: r.branchName,
    tableCode: r.tableCode,
    paidAt: new Date(r.paidAt),
    method: r.method,
    receiptNumber: r.receiptNumber,
    lines: r.lines,
    amountMinor: r.amountMinor,
    tipMinor: r.tipMinor,
    totalMinor: r.totalMinor,
    receivedMinor: r.receivedMinor,
    changeMinor: r.changeMinor,
    refundedMinor: r.refundedMinor,
  };
}

/** Cuenta, cobro, reembolsos, cierre y comprobante: los calcula y decide el backend (bloque 6a). */
export function createBillingGateway(
  dataConnect: DataConnect,
  functions: Functions,
): BillingGateway {
  return {
    openTables: (scope) =>
      readQuery(() => billingTables(dataConnect, scope, SERVER_ONLY), toOpenTables),
    async bill(scope, parts) {
      const result = await call<BillResponse>(functions, 'readBill', {
        ...scope,
        ...(parts === undefined ? {} : { parts }),
      });
      if (!result.ok) return result;
      const b = result.value;
      return ok({
        revision: b.revision,
        totalMinor: b.totalMinor,
        taxMinor: b.taxMinor,
        paidMinor: b.paidMinor,
        outstandingMinor: b.outstandingMinor,
        suggestedTipMinor: b.suggestedTipMinor,
        refundedMinor: b.refundedMinor,
        lines: b.lines,
        participants: b.participants,
        split: b.split,
      });
    },
    async payments(scope) {
      const result = await call<BillPaymentsResponse>(functions, 'readBillPayments', scope);
      return result.ok ? ok(result.value.payments) : result;
    },
    async recordPayment(scope, input) {
      const result = await call<RecordedPaymentResponse>(functions, 'recordPayment', {
        ...scope,
        currency: 'COP',
        ...input,
      });
      return result.ok
        ? ok({ paymentId: result.value.paymentId, changeMinor: result.value.changeMinor })
        : result;
    },
    async refund(scope, input) {
      const result = await call(functions, 'refundPayment', { ...scope, ...input });
      return result.ok ? ok(undefined) : result;
    },
    async closeTable(scope) {
      const result = await call(functions, 'closeTable', scope);
      return result.ok ? ok(undefined) : result;
    },
    async receipt(scope, paymentId) {
      const result = await call<PaymentReceiptResponse>(functions, 'readPaymentReceipt', {
        ...scope,
        paymentId,
      });
      return result.ok ? ok(toReceipt(result.value)) : result;
    },
  };
}

/** NIT de la empresa: se lee del conector (sucursales.gql) y lo guarda el backend con su DV. */
export function createTenantProfileGateway(
  dataConnect: DataConnect,
  functions: Functions,
): TenantProfileGateway {
  return {
    async profile(tenantId) {
      const result = await readQuery(
        () => tenantProfile(dataConnect, { tenantId }, SERVER_ONLY),
        (data) => data.tenant,
      );
      if (!result.ok) return result;
      return result.value
        ? ok({ name: result.value.name, taxId: result.value.taxId ?? null })
        : err({ kind: 'unknown' as const });
    },
    async setTaxId(tenantId, taxId) {
      const result = await call<SetTenantTaxIdResponse>(functions, 'setTenantTaxId', {
        tenantId,
        taxId,
      });
      return result.ok ? ok(result.value.taxId) : result;
    },
  };
}
