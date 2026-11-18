import { Link, Outlet, useParams, type RouteObject } from 'react-router';
import { EmptyState, Icon } from '@tavelyo/design-system';
import {
  MyOrdersPage,
  OrderReviewPage,
  TableMenuPage,
  TableOrderProvider,
} from '@tavelyo/table-session';
import { useServices } from './app-context.tsx';

/** Mesa del QR: la carta y el pedido comparten el estado (carrito y revisión). */
function TableRoute() {
  const { qrPublicId = '' } = useParams();
  const services = useServices();
  return (
    <TableOrderProvider
      key={qrPublicId}
      gateway={services.customer}
      qrPublicId={qrPublicId}
      storage={services.cartStorage}
    >
      <Outlet />
    </TableOrderProvider>
  );
}

function MenuRoute() {
  return (
    <TableMenuPage
      orderLink={(label) => (
        <Link className="tv-link-button tv-link-button--primary" to="pedido">
          <Icon name="cart" />
          {label}
        </Link>
      )}
      myOrdersLink={
        <Link className="tv-link-button" to="mis-pedidos">
          <Icon name="callWaiter" />
          Mis pedidos y llamar al mesero
        </Link>
      }
    />
  );
}

function MyOrdersRoute() {
  return (
    <MyOrdersPage
      menuLink={
        <Link className="tv-link-button" to="..">
          <Icon name="back" />
          Volver a la carta
        </Link>
      }
    />
  );
}

function OrderRoute() {
  const services = useServices();
  return (
    <OrderReviewPage
      offerSimulatedOutcomes={services.usesEmulators}
      myOrdersLink={(label) => (
        <Link className="tv-link-button tv-link-button--primary" to="../mis-pedidos">
          {label}
        </Link>
      )}
      menuLink={
        <Link className="tv-link-button" to="..">
          <Icon name="back" />
          Volver a la carta
        </Link>
      }
    />
  );
}

/** Rutas del cliente: la carta de la mesa llega por el QR (`/mesa/<qrPublicId>`). */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <EmptyState
        title="Bienvenido a Tavelyo"
        description="Escanea el código QR de tu mesa para ver la carta del restaurante."
      />
    ),
  },
  {
    path: '/mesa/:qrPublicId',
    element: <TableRoute />,
    children: [
      { index: true, element: <MenuRoute /> },
      { path: 'pedido', element: <OrderRoute /> },
      { path: 'mis-pedidos', element: <MyOrdersRoute /> },
    ],
  },
  {
    path: '*',
    element: (
      <EmptyState
        title="No encontramos esta página"
        description="Vuelve a escanear el código QR de tu mesa."
      />
    ),
  },
];
