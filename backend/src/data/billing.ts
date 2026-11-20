import type { DataConnect } from 'firebase-admin/data-connect';
import { err, ok } from '@tavelyo/core';
import type {
  AccountLine,
  AccountPayment,
  AccountSnapshot,
  BillingStore,
} from '../billing/store.ts';
import { newId } from '../shared/clock.ts';
import { failure } from '../shared/outcome.ts';
import { READ_BILL, recordPaymentDocument, refundDocument } from './billing-documents.ts';

/** La cuenta cambió entre la lectura y la escritura, o hubo una carrera: se vuelve a leer. */
function isLostRace(error: unknown): boolean {
  return (
    isUniqueViolation(error) ||
    (error instanceof Error &&
      /CUENTA_CAMBIO|CUENTA_SIN_ACCESO|could not serialize|deadlock detected/i.test(error.message))
  );
}
import { isUniqueViolation } from './table-sessions.ts';

interface AccountData {
  membership: { role: { code: string }; membershipBranches_on_membership: { branchId: string }[] };
  tableSession: { status: string };
  branch: { currency: string };
  orderItems: AccountLine[];
  cashSessions: Array<{
    id: string;
    version: number;
    openingFloatMinor: string;
    cashMovements_on_cashSession: NonNullable<
      AccountSnapshot['cashSession']
    >['movements'][number][];
  }>;
  bills: Array<{
    id: string;
    version: number;
    status: string;
    billPayments_on_bill: Array<
      Omit<AccountPayment, 'paymentId' | 'allocations' | 'refunds'> & {
        id: string;
        paymentAllocations_on_payment: AccountPayment['allocations'];
        refunds_on_payment: AccountPayment['refunds'];
      }
    >;
  }>;
}

export function createBillingStore(dc: DataConnect): BillingStore {
  return {
    async load(actor, scope, permission) {
      try {
        const { data } = await dc.executeGraphqlRead<AccountData, Record<string, unknown>>(
          READ_BILL,
          {
            variables: {
              tenantId: scope.tenantId,
              branchId: scope.branchId,
              sessionId: scope.sessionId,
              actorId: actor.uid,
              permission,
            },
          },
        );
        if (
          data.membership.role.code !== 'tenant_owner' &&
          data.membership.membershipBranches_on_membership.length === 0
        ) {
          return err(failure('permission-denied', 'No tienes acceso a esta cuenta.'));
        }
        const bill = data.bills[0];
        const cash = data.cashSessions[0];
        // Nunca calcular un saldo sobre una respuesta truncada. Las cuentas mayores requieren paginación.
        if (
          data.orderItems.length >= 1000 ||
          (bill?.billPayments_on_bill.length ?? 0) >= 1000 ||
          (cash?.cashMovements_on_cashSession.length ?? 0) >= 1000 ||
          bill?.billPayments_on_bill.some(
            (p) =>
              p.paymentAllocations_on_payment.length >= 1000 || p.refunds_on_payment.length >= 1000,
          )
        ) {
          return err(
            failure(
              'resource-exhausted',
              'La cuenta excede el tamaño admitido para esta operación.',
            ),
          );
        }
        return ok({
          currency: data.branch.currency,
          open: data.tableSession.status === 'OPEN',
          roleCode: data.membership.role.code,
          bill: bill ? { id: bill.id, version: bill.version, status: bill.status } : null,
          lines: data.orderItems,
          payments: (bill?.billPayments_on_bill ?? []).map(
            ({ id, paymentAllocations_on_payment, refunds_on_payment, ...p }) => ({
              ...p,
              paymentId: id,
              allocations: paymentAllocations_on_payment,
              refunds: refunds_on_payment,
            }),
          ),
          cashSession: cash
            ? {
                id: cash.id,
                version: cash.version,
                openingFloatMinor: cash.openingFloatMinor,
                movements: cash.cashMovements_on_cashSession,
              }
            : null,
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes('CUENTA_SIN_ACCESO'))
          return err(failure('permission-denied', 'No tienes acceso a esta cuenta.'));
        throw error;
      }
    },
    async record(actor, write) {
      const { input, snapshot, payment, allocations } = write;
      const billId = snapshot.bill?.id ?? newId();
      const scope = { tenantId: input.tenantId, branchId: input.branchId };
      const lines = new Map(snapshot.lines.map((l) => [l.id, l]));
      const variables = {
        ...scope,
        sessionId: input.sessionId,
        actorId: actor.uid,
        permission: 'payment.record',
        billId,
        ...(snapshot.bill ? { billVersion: snapshot.bill.version } : {}),
        paymentId: payment.paymentId,
        paymentRef: payment.paymentId,
        method: input.method,
        amountMinor: input.amountMinor,
        tipMinor: input.tipMinor,
        key: input.idempotencyKey,
        fingerprint: write.fingerprint,
        participantId: input.participantId ?? null,
        receivedMinor: payment.receivedMinor,
        changeMinor: payment.changeMinor,
        receiptNumber: payment.receiptNumber,
        ...(write.cash
          ? {
              cashSessionId: write.cash.sessionId,
              cashVersion: write.cash.version,
              saleMinor: write.cash.saleMinor,
            }
          : {}),
        allocations: allocations.map((a) => ({ ...scope, paymentId: payment.paymentId, ...a })),
        ...Object.fromEntries(
          allocations.flatMap((a, i) => {
            const line = lines.get(a.orderItemId);
            if (!line) throw new Error('La asignación no pertenece a la cuenta leída');
            return [
              [`line${i}`, a.orderItemId],
              [`version${i}`, line.version],
            ];
          }),
        ),
      };
      try {
        await dc.executeGraphql(
          recordPaymentDocument(!snapshot.bill, allocations.length, write.cash !== null),
          {
            variables,
          },
        );
        return true;
      } catch (error) {
        if (isLostRace(error)) return false;
        throw error;
      }
    },
    async refund(actor, write) {
      const { scope, snapshot, refunds, line } = write;
      const variables = {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        sessionId: scope.sessionId,
        actorId: actor.uid,
        permission: 'payment.refund',
        roleCode: snapshot.roleCode,
        billId: snapshot.bill.id,
        billVersion: snapshot.bill.version,
        key: write.idempotencyKey,
        fingerprint: write.fingerprint,
        reason: write.reason,
        billRef: snapshot.bill.id,
        lineId: line?.id ?? null,
        ...(line ? { lineRef: line.id, lineVersion: line.version, wasted: line.wasted } : {}),
        ...(write.cash
          ? {
              cashSessionId: write.cash.sessionId,
              cashVersion: write.cash.version,
              ...Object.fromEntries(
                write.cash.refundIndexes.map((i) => [`refundRef${i}`, refunds[i]?.refundId]),
              ),
            }
          : {}),
        ...Object.fromEntries(
          refunds.flatMap((r, i) => [
            [`refund${i}`, r.refundId],
            [`payment${i}`, r.paymentId],
            [`amount${i}`, r.amountMinor],
          ]),
        ),
      };
      try {
        await dc.executeGraphql(
          refundDocument(refunds.length, line !== null, write.cash?.refundIndexes ?? []),
          { variables },
        );
        return true;
      } catch (error) {
        if (isLostRace(error)) return false;
        throw error;
      }
    },
    async close(actor, { scope, settle }) {
      // Operaciones con nombre del conector: así las pantallas en vivo se refrescan (@refresh).
      const base = {
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        sessionId: scope.sessionId,
        authUid: actor.uid,
      };
      try {
        if (settle)
          await dc.executeMutation('ServerCloseSettledTableSession', {
            ...base,
            billId: settle.billId,
            billVersion: settle.version,
            totalMinor: settle.totalMinor,
          });
        else await dc.executeMutation('ServerCloseTableSession', base);
        return 'closed';
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (/Sin membresía|Sin permiso/.test(message)) return 'denied';
        if (
          /La cuenta de la mesa cambió|La mesa ya cambió|could not serialize|deadlock/.test(message)
        )
          return 'changed';
        throw error;
      }
    },
  };
}
