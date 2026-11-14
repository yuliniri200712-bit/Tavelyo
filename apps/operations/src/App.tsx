import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { ErrorState } from '@tavelyo/design-system';
import { SessionProvider } from '@tavelyo/identity';
import { usePwaUpdate } from '@tavelyo/pwa-shell/register';
import { AppContext } from './app-context.tsx';
import { compose } from './composition.ts';
import { routes } from './routes.tsx';

const composition = compose(import.meta.env);
const router = createBrowserRouter(routes);

export function App() {
  const update = usePwaUpdate();
  const value = useMemo(
    () => (composition.ok ? { services: composition.services, update } : null),
    [update],
  );

  if (!composition.ok || !value) {
    return (
      <ErrorState
        title="La configuración de la app no es válida"
        description={composition.ok ? '' : composition.problems.join(' ')}
      />
    );
  }

  return (
    <AppContext.Provider value={value}>
      <SessionProvider auth={value.services.auth} profiles={value.services.profiles}>
        <RouterProvider router={router} />
      </SessionProvider>
    </AppContext.Provider>
  );
}
