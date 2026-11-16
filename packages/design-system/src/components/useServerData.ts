import { useCallback, useEffect, useState } from 'react';

/**
 * Falla de una operación de los módulos de administración. `rejected` lleva el motivo que da el
 * servidor (mensajes fijos de las reglas, sin datos de otras empresas).
 */
export type ServerError =
  | { readonly kind: 'rejected'; readonly message: string }
  | { readonly kind: 'unauthorized' | 'network' | 'unknown' };

type Outcome<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: ServerError };

export type DataState<T> =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly error: ServerError }
  | { readonly status: 'ready'; readonly data: T };

export type ActionResult = { readonly tone: 'success' | 'error'; readonly text: string } | null;

const FAILURE_TEXT = {
  unauthorized: 'Tu sesión ya no tiene permiso para esta acción. Vuelve a iniciar sesión.',
  network: 'No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.',
  unknown: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
} as const;

export function serverErrorText(error: ServerError): string {
  return error.kind === 'rejected' ? error.message : FAILURE_TEXT[error.kind];
}

/**
 * Datos leídos siempre del servidor. Cada cambio se confirma con el servidor y luego se vuelve a
 * leer todo: la pantalla nunca muestra un estado que no existe. `load` debe ser estable
 * (useCallback) para no repetir la lectura en cada render.
 */
export function useServerData<T>(load: () => Promise<Outcome<T>>) {
  const [state, setState] = useState<DataState<T>>({ status: 'loading' });
  const [notice, setNotice] = useState<ActionResult>(null);
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

  /** Vuelve a leer sin mostrar la carga: la pantalla sigue con los datos actuales mientras tanto. */
  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  /** Ejecuta un cambio; devuelve true si el servidor lo aceptó. */
  const run = useCallback(
    async (command: () => Promise<Outcome<void>>, successText: string): Promise<boolean> => {
      const result = await command();
      if (!result.ok) {
        setNotice({ tone: 'error', text: serverErrorText(result.error) });
        return false;
      }
      setNotice({ tone: 'success', text: successText });
      setVersion((v) => v + 1);
      return true;
    },
    [],
  );

  return { state, notice, reload, refresh, run };
}

export type RunCommand = ReturnType<typeof useServerData>['run'];
