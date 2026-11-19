/**
 * Catálogo versionado de permisos y roles del personal (docs/architecture/permissions.md).
 * Es la semilla de las tablas Role, Permission y RolePermission: la base es la fuente de verdad
 * en tiempo de ejecución (ADR-0008) y este archivo, la fuente de verdad del código.
 * Los permisos con tope o motivo (🔸 en la matriz) se conceden aquí; el tope se aplica en la
 * operación correspondiente cuando exista.
 */

export const PERMISSIONS = {
  'menu.read': 'Ver la carta publicada',
  'catalog.manage': 'Gestionar el catálogo',
  'price.change': 'Cambiar precios',
  'table.manage': 'Gestionar sectores y mesas',
  'session.open': 'Abrir una sesión de mesa',
  'session.close': 'Cerrar una sesión de mesa',
  'session.transfer': 'Trasladar una sesión de mesa',
  'session.merge': 'Unir sesiones de mesa',
  'order.create': 'Crear pedidos',
  'order.amend': 'Modificar un pedido enviado',
  'order.approve': 'Aprobar o rechazar los pedidos de los clientes',
  'order_item.cancel': 'Anular líneas de pedido',
  'kitchen.advance': 'Avanzar estados en cocina',
  'delivery.pickup': 'Recoger platos listos',
  'delivery.deliver': 'Entregar platos',
  'delivery.skip_sequence': 'Saltar la secuencia de entrega',
  'service_request.handle': 'Atender solicitudes de servicio',
  'bill.read': 'Ver cuentas',
  'bill.split': 'Dividir cuentas',
  'bill.discount': 'Aplicar descuentos',
  'payment.authorize': 'Iniciar autorizaciones de pago',
  'payment.capture': 'Capturar pagos',
  'payment.record': 'Registrar pagos',
  'payment.void_authorization': 'Anular autorizaciones',
  'payment.refund': 'Reembolsar pagos',
  'cash_session.open': 'Abrir caja',
  'cash_session.close': 'Cerrar caja',
  'inventory.manage': 'Gestionar inventario',
  'staff.invite': 'Agregar y revocar personal',
  'role.assign': 'Asignar roles y sucursales',
  'report.read': 'Ver reportes',
  'report.export': 'Exportar reportes',
  'tenant.settings': 'Configurar la empresa',
  'branch.settings': 'Configurar la sucursal',
  'audit.read': 'Ver el registro de auditoría',
} as const;

export type PermissionCode = keyof typeof PERMISSIONS;

export type RoleCode = 'tenant_owner' | 'branch_admin' | 'cashier' | 'waiter' | 'kitchen';

export interface RoleDefinition {
  readonly name: string;
  /** Solo se puede asignar, modificar o revocar a quien tiene un rango menor que el propio. */
  readonly rank: number;
  readonly permissions: readonly PermissionCode[];
}

const ALL = Object.keys(PERMISSIONS) as PermissionCode[];

export const ROLES: Readonly<Record<RoleCode, RoleDefinition>> = {
  tenant_owner: {
    name: 'Propietario',
    rank: 100,
    permissions: ALL.filter(
      (code) =>
        !['kitchen.advance', 'delivery.pickup', 'delivery.deliver', 'payment.authorize'].includes(
          code,
        ),
    ),
  },
  branch_admin: {
    name: 'Administrador de sucursal',
    rank: 80,
    permissions: [
      'menu.read',
      'catalog.manage',
      'price.change',
      'table.manage',
      'session.open',
      'session.close',
      'session.transfer',
      'session.merge',
      'order.create',
      'order.amend',
      'order.approve',
      'order_item.cancel',
      'delivery.skip_sequence',
      'service_request.handle',
      'bill.read',
      'bill.split',
      'bill.discount',
      'payment.capture',
      'payment.record',
      'payment.void_authorization',
      'payment.refund',
      'cash_session.open',
      'cash_session.close',
      'inventory.manage',
      'staff.invite',
      'role.assign',
      'report.read',
      'report.export',
      'branch.settings',
    ],
  },
  cashier: {
    name: 'Cajero',
    rank: 40,
    permissions: [
      'menu.read',
      'session.open',
      'session.close',
      'service_request.handle',
      'bill.read',
      'bill.split',
      'bill.discount',
      'payment.authorize',
      'payment.capture',
      'payment.record',
      'payment.void_authorization',
      'payment.refund',
      'cash_session.open',
      'cash_session.close',
      'report.read',
    ],
  },
  waiter: {
    name: 'Mesero',
    rank: 30,
    permissions: [
      'menu.read',
      'session.open',
      'session.close',
      'session.transfer',
      'session.merge',
      'order.create',
      'order.amend',
      'order.approve',
      'order_item.cancel',
      'delivery.pickup',
      'delivery.deliver',
      'service_request.handle',
      'bill.read',
    ],
  },
  kitchen: {
    name: 'Cocina',
    rank: 30,
    permissions: ['menu.read', 'order_item.cancel', 'kitchen.advance'],
  },
};

export function roleHasPermission(role: RoleCode, permission: PermissionCode): boolean {
  return ROLES[role].permissions.includes(permission);
}
