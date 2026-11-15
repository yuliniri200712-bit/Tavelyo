import { useCallback, useEffect, useState } from 'react';
import type {
  BranchScope,
  FloorAdminGateway,
  FloorError,
  FloorResult,
  SectorAdmin,
} from '../domain/index.ts';

export type LayoutState =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly error: FloorError }
  | { readonly status: 'ready'; readonly sectors: readonly SectorAdmin[] };

export type Notice = { readonly tone: 'success' | 'error'; readonly text: string } | null;

const FAILURE_TEXT = {
  unauthorized: 'Tu sesión ya no tiene permiso para esta acción. Vuelve a iniciar sesión.',
  network: 'No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.',
  unknown: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
} as const;

export function floorErrorText(error: FloorError): string {
  return error.kind === 'rejected' ? error.message : FAILURE_TEXT[error.kind];
}

/**
 * Sectores y mesas de la sucursal, siempre leídos del servidor. Cada cambio se confirma con el
 * servidor y luego se vuelve a leer todo: la pantalla nunca muestra un estado que no existe.
 */
export function useFloorLayout(gateway: FloorAdminGateway, scope: BranchScope) {
  const [state, setState] = useState<LayoutState>({ status: 'loading' });
  const [notice, setNotice] = useState<Notice>(null);
  const [version, setVersion] = useState(0);
  const { tenantId, branchId } = scope;

  useEffect(() => {
    let current = true;
    void gateway.layout({ tenantId, branchId }).then((result) => {
      if (!current) return;
      setState(
        result.ok
          ? { status: 'ready', sectors: result.value }
          : { status: 'error', error: result.error },
      );
    });
    return () => {
      current = false;
    };
  }, [gateway, tenantId, branchId, version]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setVersion((v) => v + 1);
  }, []);

  /** Ejecuta un cambio; devuelve true si el servidor lo aceptó. */
  const run = useCallback(
    async (command: () => FloorResult<void>, successText: string): Promise<boolean> => {
      const result = await command();
      if (!result.ok) {
        setNotice({ tone: 'error', text: floorErrorText(result.error) });
        return false;
      }
      setNotice({ tone: 'success', text: successText });
      setVersion((v) => v + 1);
      return true;
    },
    [],
  );

  return { state, notice, reload, run };
}
