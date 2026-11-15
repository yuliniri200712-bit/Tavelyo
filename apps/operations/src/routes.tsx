import type { RouteObject } from 'react-router';
import { DesignSystemCatalog, EmptyState } from '@tavelyo/design-system';
import { SignInPage } from '@tavelyo/identity';
import { PrintQrRoute, RequirePermission, TablesAdminRoute } from './admin-routes.tsx';
import { AppLayout, PublicOnly, RequireStaffContext, StaffHome } from './layout.tsx';

/** Rutas del personal. Toda ruta con datos exige sesión y contexto de empresa (bloques 6 y 7). */
export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: (
          <RequireStaffContext>
            <StaffHome />
          </RequireStaffContext>
        ),
      },
      {
        path: '/mesas',
        element: (
          <RequireStaffContext>
            <RequirePermission permission="table.manage">
              <TablesAdminRoute />
            </RequirePermission>
          </RequireStaffContext>
        ),
      },
      {
        path: '/mesas/imprimir',
        element: (
          <RequireStaffContext>
            <RequirePermission permission="table.manage">
              <PrintQrRoute />
            </RequirePermission>
          </RequireStaffContext>
        ),
      },
      {
        path: '/acceso',
        element: (
          <PublicOnly>
            <SignInPage />
          </PublicOnly>
        ),
      },
      { path: '/catalogo', element: <DesignSystemCatalog /> },
      {
        path: '*',
        element: (
          <EmptyState
            title="No encontramos esta página"
            description="Revisa la dirección o vuelve al inicio."
          />
        ),
      },
    ],
  },
];
