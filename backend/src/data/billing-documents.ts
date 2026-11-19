/** Documentos exclusivos del Admin SDK. Las variables proceden del caso de uso, nunca de GraphQL del cliente. */
export const BILL_SCOPE_VARIABLES =
  '$tenantId: UUID!, $branchId: UUID!, $sessionId: UUID!, $actorId: String!, $permission: String!';

export const BILL_ACCESS = `
  membership(key: { tenantId: $tenantId, userId: $actorId }) @check(expr: "this != null", message: "CUENTA_SIN_ACCESO") {
    status @check(expr: "this == 'ACTIVE'", message: "CUENTA_SIN_ACCESO")
    tenant { status @check(expr: "this == 'ACTIVE'", message: "CUENTA_SIN_ACCESO") }
    role {
      code
      rolePermissions_on_role(where: { permission: { code: { eq: $permission } } })
        @check(expr: "this.size() > 0", message: "CUENTA_SIN_ACCESO") { permission { code } }
    }
    membershipBranches_on_membership(where: { branchId: { eq: $branchId } }) { branchId }
  }
  tableSession(id: $sessionId) @check(expr: "this != null", message: "CUENTA_SIN_ACCESO") {
    tenantId @check(expr: "this == vars.tenantId", message: "CUENTA_SIN_ACCESO")
    branchId @check(expr: "this == vars.branchId", message: "CUENTA_SIN_ACCESO")
    status
  }
  branch(id: $branchId) @check(expr: "this != null", message: "CUENTA_SIN_ACCESO") {
    tenantId @check(expr: "this == vars.tenantId", message: "CUENTA_SIN_ACCESO")
    currency status @check(expr: "this == 'ACTIVE'", message: "CUENTA_SIN_ACCESO")
  }
`;

export const BILL_ROWS = `
  bills(where: { sessionId: { eq: $sessionId }, tenantId: { eq: $tenantId }, branchId: { eq: $branchId } }, limit: 1) {
    id version status
    billPayments_on_bill(where: { status: { eq: CONFIRMED } }, orderBy: [{ id: ASC }], limit: 1000) {
      id method amountMinor tipMinor currency receivedMinor changeMinor receiptNumber idempotencyKey requestFingerprint
      paymentAllocations_on_payment(orderBy: [{ orderItemId: ASC }], limit: 1000) { orderItemId amountMinor }
      refunds_on_payment(orderBy: [{ id: ASC }], limit: 1000) { id amountMinor status orderItemId idempotencyKey requestFingerprint }
    }
  }
  orderItems(where: { tenantId: { eq: $tenantId }, branchId: { eq: $branchId }, order: { sessionId: { eq: $sessionId } } }, orderBy: [{ id: ASC }], limit: 1000) {
    id version status lineTotalMinor taxMinor productNameSnapshot quantity
    order { participantId sentToKitchenAt approval }
  }
`;

export const READ_BILL = `query ReadAccount(${BILL_SCOPE_VARIABLES}) { ${BILL_ACCESS} ${BILL_ROWS} }`;

/** Dos variantes fijas para crear la cuenta solo con el primer pago. Los índices nunca son entrada libre. */
export function recordPaymentDocument(newBill: boolean, lineCount: number): string {
  const lineVars = Array.from(
    { length: lineCount },
    (_, i) => `$line${i}: UUID!, $version${i}: Int!`,
  ).join(', ');
  const locks = Array.from(
    { length: lineCount },
    (_, i) => `
    line${i}: orderItem_updateMany(where: { id: { eq: $line${i} }, tenantId: { eq: $tenantId }, branchId: { eq: $branchId }, version: { eq: $version${i} }, status: { ne: CANCELLED }, order: { sessionId: { eq: $sessionId }, sentToKitchenAt: { isNull: false }, approval: { in: [NOT_REQUIRED, APPROVED] } } }, data: { version_update: { inc: 1 } })
    checked${i}: query @redact { orderItem(id: $line${i}) @check(expr: "response.line${i} == 1", message: "CUENTA_CAMBIO") { id } }
  `,
  ).join('\n');
  const billWrite = newBill
    ? 'bill_insert(data: { id: $billId, tenantId: $tenantId, branchId: $branchId, sessionId: $sessionId, currency: "COP", status: OPEN })'
    : `bill_updateMany(where: { id: { eq: $billId }, version: { eq: $billVersion }, status: { eq: OPEN } }, data: { version_update: { inc: 1 } })
       checkedBill: query @redact { bill(id: $billId) @check(expr: "response.bill_updateMany == 1", message: "CUENTA_CAMBIO") { id } }`;
  return `mutation RecordAccountPayment(${BILL_SCOPE_VARIABLES}, $billId: UUID!, ${newBill ? '' : '$billVersion: Int!,'}
    $paymentId: UUID!, $paymentRef: String!, $method: PaymentMethod!, $amountMinor: Int64!, $tipMinor: Int64!,
    $key: String!, $fingerprint: String!, $participantId: UUID, $receivedMinor: Int64, $changeMinor: Int64,
    $receiptNumber: String, $allocations: [PaymentAllocation_Data!]!, ${lineVars}) @transaction {
    query @redact { ${BILL_ACCESS} }
    access: query @redact {
      tableSession(id: $sessionId)
        @check(expr: "response.query.membership.role.code == 'tenant_owner' || response.query.membership.membershipBranches_on_membership.size() > 0", message: "CUENTA_SIN_ACCESO")
        @check(expr: "response.query.tableSession.status == 'OPEN'", message: "CUENTA_CAMBIO") { id }
    }
    ${billWrite}
    ${locks}
    billPayment_insert(data: { id: $paymentId, tenantId: $tenantId, branchId: $branchId, billId: $billId,
      method: $method, status: CONFIRMED, idempotencyKey: $key, requestFingerprint: $fingerprint,
      participantId: $participantId, currency: "COP", amountMinor: $amountMinor, tipMinor: $tipMinor,
      receivedMinor: $receivedMinor, changeMinor: $changeMinor, receiptNumber: $receiptNumber,
      createdBy: $actorId, confirmedAt_expr: "request.time" })
    paymentAllocation_insertMany(data: $allocations)
    auditEvent_insert(data: { tenantId: $tenantId, actorId: $actorId, operation: "payment.record", resourceType: "bill_payment", resourceId: $paymentRef })
  }`;
}

/**
 * Reembolso registrado (D-34, D-37): sube la versión de la cuenta, inserta un reembolso por pago y,
 * si es por plato, cancela la línea en la misma transacción. El rol se vuelve a comprobar dentro,
 * porque decide el tope. Los índices nunca son entrada libre.
 */
export function refundDocument(refundCount: number, cancelsLine: boolean): string {
  const refundVars = Array.from(
    { length: refundCount },
    (_, i) => `$refund${i}: UUID!, $payment${i}: UUID!, $amount${i}: Int64!`,
  ).join(', ');
  const inserts = Array.from(
    { length: refundCount },
    (_, i) => `
    refund${i}: refund_insert(data: { id: $refund${i}, tenantId: $tenantId, branchId: $branchId, paymentId: $payment${i},
      idempotencyKey: $key, requestFingerprint: $fingerprint, currency: "COP", amountMinor: $amount${i}, reason: $reason,
      status: CONFIRMED, orderItemId: $lineId, requestedBy: $actorId, confirmedAt_expr: "request.time" })`,
  ).join('\n');
  const lineVars = cancelsLine ? ', $lineRef: String!, $lineVersion: Int!, $wasted: Boolean!' : '';
  const cancel = cancelsLine
    ? `
    line: orderItem_updateMany(where: { id: { eq: $lineId }, tenantId: { eq: $tenantId }, branchId: { eq: $branchId }, version: { eq: $lineVersion }, status: { ne: CANCELLED }, order: { sessionId: { eq: $sessionId } } },
      data: { status: CANCELLED, version_update: { inc: 1 }, cancelledAt_expr: "request.time", cancelReason: $reason, wasted: $wasted })
    checkedLine: query @redact { orderItem(id: $lineId) @check(expr: "response.line == 1", message: "CUENTA_CAMBIO") { id } }
    lineAudit: auditEvent_insert(data: { tenantId: $tenantId, actorId: $actorId, operation: "order_item.cancel", resourceType: "order_item", resourceId: $lineRef, reason: $reason })`
    : '';
  return `mutation RefundAccountPayment(${BILL_SCOPE_VARIABLES}, $roleCode: String!, $billId: UUID!, $billVersion: Int!,
    $key: String!, $fingerprint: String!, $reason: String!, $billRef: String!, $lineId: UUID${lineVars}, ${refundVars}) @transaction {
    query @redact { ${BILL_ACCESS} }
    access: query @redact {
      tableSession(id: $sessionId)
        @check(expr: "response.query.membership.role.code == 'tenant_owner' || response.query.membership.membershipBranches_on_membership.size() > 0", message: "CUENTA_SIN_ACCESO")
        @check(expr: "response.query.membership.role.code == vars.roleCode", message: "CUENTA_CAMBIO")
        ${cancelsLine ? `@check(expr: "response.query.tableSession.status == 'OPEN'", message: "CUENTA_CAMBIO")` : ''} { id }
    }
    bill_updateMany(where: { id: { eq: $billId }, version: { eq: $billVersion } }, data: { version_update: { inc: 1 } })
    checkedBill: query @redact { bill(id: $billId) @check(expr: "response.bill_updateMany == 1", message: "CUENTA_CAMBIO") { id } }
    ${cancel}
    ${inserts}
    auditEvent_insert(data: { tenantId: $tenantId, actorId: $actorId, operation: "payment.refund", resourceType: "bill", resourceId: $billRef, reason: $reason })
  }`;
}
