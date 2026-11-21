import { useCallback, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { BillingDesk, CompanyDataCard, ReceiptPage } from '@tavelyo/billing';
import { RegistersAdmin, TillPanel, type Till } from '@tavelyo/cash';
import { BranchMenuPage, CatalogAdminPage, StationsAdminPage } from '@tavelyo/catalog';
import { EmptyState, PageTitle, type IconName } from '@tavelyo/design-system';
import { FloorServicePage, LayoutAdminPage, PrintQrPage } from '@tavelyo/floor';
import { useInactivityHold } from '@tavelyo/identity';
import { KitchenPage } from '@tavelyo/kitchen';
import {
  OrderApprovalPanel,
  ComandaPanel,
  OrderApprovalSettings,
  PickupPage,
  SessionOrdersPanel,
} from '@tavelyo/orders';
import { ServiceRequestsPanel } from '@tavelyo/service-requests';
import { BranchesAdminPage, useTenancy } from '@tavelyo/tenancy';
import { useAppContext } from './app-context.tsx';

export interface StaffModule {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
  /** Basta con uno de estos permisos para ver el módulo en la interfaz. */
  readonly permissions: readonly string[];
}

/** Módulos del personal y los permisos que habilitan cada uno en la interfaz. */
export const STAFF_MODULES: readonly StaffModule[] = [
  {
    path: '/caja',
    icon: 'bill',
    title: 'Caja',
    description:
      'Tu turno de caja y las mesas abiertas: cobrar, dividir, reembolsar, cerrar la mesa y el comprobante.',
    permissions: ['payment.record'],
  },
  {
    path: '/cocina',
    icon: 'kitchen',
    title: 'Cocina',
    description: 'Cola de tu estación en tiempo real: empezar, marcar listo y cancelar con motivo.',
    permissions: ['kitchen.advance'],
  },
  {
    path: '/salon',
    icon: 'floor',
    title: 'Salón',
    description:
      'Mesas en vivo: pedidos en curso, platos listos y solicitudes; abrir, cerrar y ver quién se unió.',
    permissions: ['session.open'],
  },
  {
    path: '/entregas',
    icon: 'readyToServe',
    title: 'Listos para recoger',
    description: 'Platos que cocina marcó listos, en vivo: recoger y entregar en la mesa.',
    permissions: ['delivery.pickup'],
  },
  {
    path: '/mesas',
    icon: 'qr',
    title: 'Mesas y códigos QR',
    description: 'Sectores, mesas y el QR imprimible de cada una.',
    permissions: ['table.manage'],
  },
  {
    path: '/carta',
    icon: 'menu',
    title: 'Carta de la empresa',
    description: 'Categorías, productos, opciones, alérgenos e impuestos.',
    permissions: ['catalog.manage', 'price.change'],
  },
  {
    path: '/carta/sucursal',
    icon: 'schedule',
    title: 'Carta de la sucursal',
    description: 'Disponibilidad, horario y precio de cada producto en esta sucursal.',
    permissions: ['catalog.manage', 'price.change'],
  },
  {
    path: '/carta/estaciones',
    icon: 'stations',
    title: 'Estaciones de cocina',
    description: 'Estaciones de la sucursal (cocina caliente, bar…) y la predeterminada.',
    permissions: ['catalog.manage'],
  },
  {
    path: '/sucursales',
    icon: 'branch',
    title: 'Sucursales',
    description: 'Crear, editar y archivar las sucursales de la empresa.',
    permissions: ['tenant.settings'],
  },
  {
    path: '/empresa',
    icon: 'settings',
    title: 'Datos de la empresa',
    description: 'El NIT que va en el comprobante de cada pago.',
    permissions: ['tenant.settings'],
  },
  {
    path: '/sucursal/ajustes',
    icon: 'settings',
    title: 'Ajustes de la sucursal',
    description:
      'Las cajas de la sucursal y si los pedidos del teléfono del cliente van directo a cocina o los aprueba el mesero.',
    permissions: ['branch.settings'],
  },
];

/** Sucursal activa y permisos de la persona; los permisos solo orientan la interfaz. */
export function useStaffContext() {
  const { selection } = useTenancy();
  if (selection.status !== 'ready') {
    throw new Error('useStaffContext requiere un contexto de empresa listo.');
  }
  const can = (permission: string) => selection.tenant.permissions.includes(permission);
  return {
    scope: { tenantId: selection.tenant.tenantId, branchId: selection.branch.id },
    branchName: selection.branch.name,
    currency: selection.branch.currency,
    timezone: selection.branch.timezone,
    isOwner: selection.tenant.roleCode === 'tenant_owner',
    can,
    canAny: (permissions: readonly string[]) => permissions.some(can),
  };
}

/**
 * Oculta la pantalla si el rol no tiene ninguno de los permisos. Es solo una ayuda: el servidor
 * comprueba el permiso en cada operación (ADR-0008).
 */
export function RequirePermission({
  permissions,
  children,
}: {
  readonly permissions: readonly string[];
  readonly children: ReactNode;
}) {
  const { canAny } = useStaffContext();
  if (canAny(permissions)) return children;
  return (
    <EmptyState
      title="Esta sección no está disponible para tu rol"
      description="Pide a la administración del restaurante el permiso si lo necesitas."
      action={
        <Link className="tv-link-button" to="/">
          Volver al inicio
        </Link>
      }
    />
  );
}

export function FloorServiceRoute() {
  const { services } = useAppContext();
  const { scope, branchName, timezone, can } = useStaffContext();
  return (
    <FloorServicePage
      gateway={services.floorService}
      scope={scope}
      branchName={branchName}
      timezone={timezone}
      canClose={can('session.close')}
      canTransfer={can('session.transfer')}
      {...(can('order.create')
        ? {
            renderComanda: (
              sessionId: string,
              tableCode: string,
              sector: string,
              offline: boolean,
            ) => (
              <ComandaPanel
                key={sessionId}
                gateway={services.comanda}
                scope={{ ...scope, sessionId }}
                tableCode={tableCode}
                sector={sector}
                offline={offline}
              />
            ),
          }
        : {})}
      requestsPanel={
        <>
          {can('order.approve') ? (
            <OrderApprovalPanel
              gateway={services.orderApproval}
              scope={scope}
              timezone={timezone}
            />
          ) : null}
          {can('service_request.handle') ? (
            <ServiceRequestsPanel
              gateway={services.serviceRequests}
              scope={scope}
              timezone={timezone}
            />
          ) : null}
        </>
      }
      renderOrders={(session, tableCode) => (
        <SessionOrdersPanel
          gateway={services.orders}
          scope={scope}
          sessionId={session.id}
          tableCode={tableCode}
          timezone={timezone}
          canCancel={can('order_item.cancel')}
          canDeliverDirectly={can('delivery.skip_sequence')}
        />
      )}
    />
  );
}

export function PickupRoute() {
  const { services } = useAppContext();
  const { scope, branchName, timezone, can } = useStaffContext();
  return (
    <PickupPage
      gateway={services.orders}
      scope={scope}
      branchName={branchName}
      timezone={timezone}
      canDeliver={can('delivery.deliver')}
    />
  );
}

export function KitchenRoute() {
  const { services } = useAppContext();
  const { scope, branchName, timezone } = useStaffContext();
  // D-25: la pantalla de cocina no se cierra por inactividad mientras está visible.
  useInactivityHold();
  return (
    <KitchenPage
      gateway={services.kitchen}
      scope={scope}
      branchName={branchName}
      timezone={timezone}
    />
  );
}

export function TablesAdminRoute() {
  const { services } = useAppContext();
  const { scope, branchName } = useStaffContext();
  return (
    <LayoutAdminPage
      gateway={services.floorAdmin}
      scope={scope}
      branchName={branchName}
      menuWebUrl={services.menuWebUrl}
      printLink={
        <Link className="tv-link-button" to="/mesas/imprimir">
          Imprimir códigos QR
        </Link>
      }
    />
  );
}

export function PrintQrRoute() {
  const { services } = useAppContext();
  const { scope, branchName } = useStaffContext();
  return (
    <PrintQrPage
      gateway={services.floorAdmin}
      scope={scope}
      branchName={branchName}
      menuWebUrl={services.menuWebUrl}
      backLink={
        <Link className="tv-link-button" to="/mesas">
          Volver a las mesas
        </Link>
      }
    />
  );
}

export function CatalogAdminRoute() {
  const { services } = useAppContext();
  const { scope, currency, isOwner, can } = useStaffContext();
  return (
    <CatalogAdminPage
      gateway={services.catalogAdmin}
      tenantId={scope.tenantId}
      currency={currency}
      canEditCatalog={isOwner && can('catalog.manage')}
      canEditTaxes={can('tenant.settings')}
      branchLink={
        <Link className="tv-link-button" to="/carta/sucursal">
          Carta de la sucursal
        </Link>
      }
    />
  );
}

export function BranchMenuRoute() {
  const { services } = useAppContext();
  const { scope, branchName, currency, can } = useStaffContext();
  return (
    <BranchMenuPage
      gateway={services.catalogAdmin}
      scope={scope}
      branchName={branchName}
      currency={currency}
      canManageAvailability={can('catalog.manage')}
      canChangePrice={can('price.change')}
      catalogLink={
        <Link className="tv-link-button" to="/carta">
          Carta de la empresa
        </Link>
      }
    />
  );
}

export function StationsAdminRoute() {
  const { services } = useAppContext();
  const { scope, branchName } = useStaffContext();
  return (
    <StationsAdminPage
      gateway={services.catalogAdmin}
      scope={scope}
      branchName={branchName}
      branchMenuLink={
        <Link className="tv-link-button" to="/carta/sucursal">
          Carta de la sucursal
        </Link>
      }
    />
  );
}

export function BranchesAdminRoute() {
  const { services } = useAppContext();
  const { scope, currency, timezone } = useStaffContext();
  const { refreshBranches } = useTenancy();
  return (
    <BranchesAdminPage
      onBranchesChanged={() => void refreshBranches()}
      gateway={services.branchAdmin}
      tenantId={scope.tenantId}
      currency={currency}
      currentBranchId={scope.branchId}
      defaultTimezone={timezone}
    />
  );
}

/** Ajustes de la sucursal activa (branch.settings): por ahora, el modo de envío a cocina (D-32). */
export function BranchSettingsRoute() {
  const { services } = useAppContext();
  const { scope, branchName } = useStaffContext();
  return (
    <div className="tv-page">
      <header className="tv-page__header">
        <div>
          <h1>Ajustes de la sucursal</h1>
          <p className="tv-list__meta">{branchName}</p>
        </div>
      </header>
      <RegistersAdmin gateway={services.cash} scope={scope} branchName={branchName} />
      <OrderApprovalSettings
        gateway={services.orderApproval}
        scope={scope}
        branchName={branchName}
      />
    </div>
  );
}

/**
 * Caja (bloque 6a): el turno de quien la usa y la cuenta de las mesas abiertas. Cobrar en efectivo
 * exige la caja abierta (D-40); el servidor lo comprueba en cada cobro.
 */
export function CashDeskRoute() {
  const { services } = useAppContext();
  const { scope, branchName, timezone, can } = useStaffContext();
  const [till, setTill] = useState<Till | null>(null);
  const [cashMoves, setCashMoves] = useState(0);
  const onTillChange = useCallback((next: Till | null) => setTill(next), []);
  const onCashMoved = useCallback(() => setCashMoves((n) => n + 1), []);
  return (
    <div className="tv-page">
      <header className="tv-page__header">
        <div>
          <PageTitle icon="bill">Caja</PageTitle>
          <p className="tv-list__meta">{branchName}</p>
        </div>
      </header>
      {can('cash_session.open') ? (
        <TillPanel
          gateway={services.cash}
          scope={scope}
          timezone={timezone}
          refreshToken={cashMoves}
          onTillChange={onTillChange}
        />
      ) : null}
      <BillingDesk
        gateway={services.billing}
        scope={scope}
        timezone={timezone}
        canRefund={can('payment.refund')}
        canClose={can('session.close')}
        cashTillOpen={till !== null}
        onCashMoved={onCashMoved}
        receiptLink={(sessionId, paymentId) => (
          <Link className="tv-link-button" to={`/caja/comprobante/${sessionId}/${paymentId}`}>
            Ver el comprobante
          </Link>
        )}
      />
    </div>
  );
}

/** Comprobante imprimible de un pago (bloque 6a), con el NIT de la empresa. */
export function ReceiptRoute() {
  const { services } = useAppContext();
  const { scope, timezone } = useStaffContext();
  const { sessionId = '', paymentId = '' } = useParams();
  return (
    <ReceiptPage
      gateway={services.billing}
      scope={{ ...scope, sessionId }}
      paymentId={paymentId}
      timezone={timezone}
      backLink={
        <Link className="tv-link-button" to="/caja">
          Volver a la caja
        </Link>
      }
    />
  );
}

/** Datos de la empresa (tenant.settings): el NIT del comprobante. */
export function CompanyDataRoute() {
  const { services } = useAppContext();
  const { scope } = useStaffContext();
  return (
    <div className="tv-page">
      <header className="tv-page__header">
        <PageTitle icon="settings">Datos de la empresa</PageTitle>
      </header>
      <CompanyDataCard gateway={services.tenantProfile} tenantId={scope.tenantId} />
    </div>
  );
}
