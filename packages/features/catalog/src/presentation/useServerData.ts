import { useCallback, useEffect, useState } from 'react';
import type { Result } from '@tavelyo/core';
import type { CatalogError, CatalogResult } from '../domain/index.ts';

export type DataState<T> =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly error: CatalogError }
  | { readonly status: 'ready'; readonly data: T };

export type Notice = { readonly tone: 'success' | 'error'; readonly text: string } | null;

const FAILURE_TEXT = {
  unauthorized: 'Tu sesión ya no tiene permiso para esta acción. Vuelve a iniciar sesión.',
  network: 'No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.',
  unknown: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
} as const;

export function catalogErrorText(error: CatalogError): string {
  return error.kind === 'rejected' ? error.message : FAILURE_TEXT[error.kind];
}

/**
 * Datos leídos siempre del servidor. Cada cambio se confirma con el servidor y luego se vuelve a
 * leer todo: la pantalla nunca muestra un estado que no existe (precios incluidos).
 */
export function useServerData<T>(load: () => Promise<Result<T, CatalogError>>) {
  const [state, setState] = useState<DataState<T>>({ status: 'loading' });
  const [notice, setNotice] = useState<Notice>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let current = true;
    void load().then((result) => {
      if (!current) return;
      setState(
        result.ok
          ? { status: 'ready', data: result.value }
          : { status: 'error', error: result.error },
      );
    });
    return () => {
      current = false;
    };
  }, [load, version]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setVersion((v) => v + 1);
  }, []);

  /** Ejecuta un cambio; devuelve true si el servidor lo aceptó. */
  const run = useCallback(
    async (command: () => CatalogResult<void>, successText: string): Promise<boolean> => {
      const result = await command();
      if (!result.ok) {
        setNotice({ tone: 'error', text: catalogErrorText(result.error) });
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

export type Run = ReturnType<typeof useServerData>['run'];
