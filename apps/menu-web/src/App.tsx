import { createBrowserRouter, RouterProvider } from 'react-router';
import { ErrorState } from '@tavelyo/design-system';
import { PwaShell } from '@tavelyo/pwa-shell';
import { usePwaUpdate } from '@tavelyo/pwa-shell/register';
import { AppContext } from './app-context.tsx';
import { compose } from './composition.ts';
import { routes } from './routes.tsx';

const composition = compose(import.meta.env);
const router = createBrowserRouter(routes);

export function App() {
  const update = usePwaUpdate();
  return (
    <PwaShell appLabel="Menú" update={update}>
      {composition.ok ? (
        <AppContext.Provider value={composition.services}>
          <RouterProvider router={router} />
        </AppContext.Provider>
      ) : (
        <ErrorState
          title="La configuración de la app no es válida"
          description={composition.problems.join(' ')}
        />
      )}
    </PwaShell>
  );
}
