import type { OrderApprovalMode, PendingApproval } from '../domain/index.ts';

/** Motivo de un rechazo: el servidor exige de 5 a 200 caracteres (aprobacion.gql). */
export const REJECTION_REASON_MIN = 5;
export const REJECTION_REASON_MAX = 200;

export function parseRejectionReason(text: string): string | null {
  const reason = text.trim();
  return reason.length >= REJECTION_REASON_MIN && reason.length <= REJECTION_REASON_MAX
    ? reason
    : null;
}

export const APPROVAL_MODE_TEXT: Readonly<
  Record<OrderApprovalMode, { readonly title: string; readonly description: string }>
> = {
  DIRECT: {
    title: 'Directo a cocina',
    description:
      'Los pedidos que el cliente envía desde su teléfono llegan a cocina en ese momento. La cuenta se cobra al final.',
  },
  WAITER_APPROVAL: {
    title: 'El mesero aprueba cada pedido',
    description:
      'Los pedidos del teléfono del cliente esperan en «Pedidos por aprobar» hasta que un mesero los aprueba o los rechaza con motivo. Los que toma el mesero van siempre directo.',
  },
};

/** Resumen en texto, p. ej. «2 pedidos por aprobar». */
export function describeApprovals(orders: readonly PendingApproval[]): string {
  if (orders.length === 0) return 'No hay pedidos por aprobar';
  return orders.length === 1 ? '1 pedido por aprobar' : `${orders.length} pedidos por aprobar`;
}

/** Aviso en texto de los pedidos que llegan después de abrir la pantalla. */
export function describeNewApprovals(orders: readonly PendingApproval[]): string {
  return orders.map((order) => `Mesa ${order.tableCode}: pedido por aprobar.`).join(' ');
}
