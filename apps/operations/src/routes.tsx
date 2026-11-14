import type { RouteObject } from 'react-router';
import { DesignSystemCatalog, EmptyState } from '@tavelyo/design-system';

/** Rutas del personal. El acceso y el selector de empresa llegan en los bloques 6 y 7. */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <EmptyState
        title="Tavelyo Operaciones"
        description="El acceso del personal estará disponible en esta pantalla."
      />
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
];
