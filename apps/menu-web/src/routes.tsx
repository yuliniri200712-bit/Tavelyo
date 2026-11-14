import type { RouteObject } from 'react-router';
import { EmptyState } from '@tavelyo/design-system';

/** Rutas del cliente. La carta y los pedidos llegan en la Fase 2. */
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
    path: '*',
    element: (
      <EmptyState
        title="No encontramos esta página"
        description="Vuelve a escanear el código QR de tu mesa."
      />
    ),
  },
];
