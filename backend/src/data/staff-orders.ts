import type { DataConnect } from 'firebase-admin/data-connect';
import { BILL_ACCESS, BILL_SCOPE_VARIABLES } from './billing-documents.ts';
import { isConnectorRejection } from './sql-connect.ts';
import type { BillScope } from '@tavelyo/contracts';
import type { QuoteContext } from '../orders/quote-order.ts';

const CONTEXT = `query StaffOrderContext(${BILL_SCOPE_VARIABLES}, $person: UUID!) {
  ${BILL_ACCESS}
  location: branch(id: $branchId) { timezone }
  people: sessionParticipants(where: { _and: [
    {id: {eq: $person}}, {sessionId: {eq: $sessionId}}, {removedAt: {isNull: true}},
    {_or: [{guestNumber: {isNull: false}}, {expiresAt: {gt_expr: "request.time"}}]}
  ]}) { id }
}`;
interface ContextData {
  membership: { role: { code: string }; membershipBranches_on_membership: { branchId: string }[] };
  tableSession: { status: string };
  location: { timezone: string };
  branch: { currency: string };
  people: { id: string }[];
}
export function staffOrderContext(dc: DataConnect) {
  return async (
    scope: BillScope,
    person: string,
    actorId: string,
  ): Promise<QuoteContext | null> => {
    try {
      const { data } = await dc.executeGraphqlRead<ContextData, Record<string, unknown>>(CONTEXT, {
        variables: { ...scope, person, actorId, permission: 'order.create' },
      });
      if (
        data.membership.role.code !== 'tenant_owner' &&
        !data.membership.membershipBranches_on_membership.length
      )
        return null;
      if (!data.people.length || data.tableSession.status !== 'OPEN') return null;
      return {
        participantId: person,
        tenantId: scope.tenantId,
        branchId: scope.branchId,
        currency: data.branch.currency,
        timeZone: data.location.timezone,
        operating: true,
      };
    } catch (error) {
      if (
        isConnectorRejection(error) ||
        (error instanceof Error && error.message.includes('CUENTA_SIN_ACCESO'))
      )
        return null;
      throw error;
    }
  };
}
