import type { RouteObject } from 'react-router';
import { DesignSystemCatalog, EmptyState } from '@tavelyo/design-system';
import { SignInPage } from '@tavelyo/identity';
import {
  BranchesAdminRoute,
  BranchMenuRoute,
  CatalogAdminRoute,
  PrintQrRoute,
  RequirePermission,
  TablesAdminRoute,
} from './admin-routes.tsx';
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
            <RequirePermission permissions={['table.manage']}>
              <TablesAdminRoute />
            </RequirePermission>
          </RequireStaffContext>
        ),
      },
      {
        path: '/mesas/imprimir',
        element: (
          <RequireStaffContext>
            <RequirePermission permissions={['table.manage']}>
              <PrintQrRoute />
            </RequirePermission>
          </RequireStaffContext>
        ),
      },
      {
        path: '/carta',
        element: (
          <RequireStaffContext>
            <RequirePermission permissions={['catalog.manage', 'price.change']}>
              <CatalogAdminRoute />
            </RequirePermission>
          </RequireStaffContext>
        ),
      },
      {
        path: '/carta/sucursal',
        element: (
          <RequireStaffContext>
            <RequirePermission permissions={['catalog.manage', 'price.change']}>
              <BranchMenuRoute />
            </RequirePermission>
          </RequireStaffContext>
        ),
      },
      {
        path: '/sucursales',
        element: (
          <RequireStaffContext>
            <RequirePermission permissions={['tenant.settings']}>
              <BranchesAdminRoute />
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
