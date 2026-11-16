import { Link, Outlet, useParams, type RouteObject } from 'react-router';
import { EmptyState } from '@tavelyo/design-system';
import { OrderReviewPage, TableMenuPage, TableOrderProvider } from '@tavelyo/table-session';
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
        <Link className="tv-link-button" to="pedido">
          {label}
        </Link>
      )}
    />
  );
}

function OrderRoute() {
  const services = useServices();
  return (
    <OrderReviewPage
      offerSimulatedOutcomes={services.usesEmulators}
      menuLink={
        <Link className="tv-link-button" to="..">
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
