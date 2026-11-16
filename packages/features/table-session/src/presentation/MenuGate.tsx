import type { ReactNode } from 'react';
import { EmptyState, ErrorState, LoadingState, serverErrorText } from '@tavelyo/design-system';
import type { PublicMenu } from '../domain/index.ts';
import { useTableOrder } from './TableOrderProvider.tsx';

/** Muestra la carga, el error o el QR inválido; con la carta lista, el contenido. */
export function MenuGate({ children }: { readonly children: (menu: PublicMenu) => ReactNode }) {
  const { menu, reloadMenu } = useTableOrder();
  if (menu.status === 'loading') return <LoadingState message="Cargando la carta…" />;
  if (menu.status === 'error') {
    return (
      <ErrorState
        title="No se pudo cargar la carta"
        description={serverErrorText(menu.error)}
        onRetry={reloadMenu}
      />
    );
  }
  if (!menu.data) {
    return (
      <EmptyState
        title="Este código QR no corresponde a ninguna mesa activa"
        description="Pide ayuda al personal del restaurante."
      />
    );
  }
  return children(menu.data);
}
