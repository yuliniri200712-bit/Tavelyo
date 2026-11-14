import { createBrowserRouter, RouterProvider } from 'react-router';
import { PwaShell } from '@tavelyo/pwa-shell';
import { usePwaUpdate } from '@tavelyo/pwa-shell/register';
import { routes } from './routes.tsx';

const router = createBrowserRouter(routes);

export function App() {
  const update = usePwaUpdate();
  return (
    <PwaShell appLabel="Operaciones" update={update}>
      <RouterProvider router={router} />
    </PwaShell>
  );
}
