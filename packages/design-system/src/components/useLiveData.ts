import { useCallback, useEffect, useRef, useState } from 'react';
import { serverErrorText, type ActionResult, type ServerError } from './useServerData.ts';

type Outcome<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: ServerError };

/** live: recibe cambios al instante; offline: sin conexión con el servidor (no se cambia nada). */
export type LiveConnection = 'connecting' | 'live' | 'offline';

export interface LiveState<T> {
  /** Última lectura confirmada por el servidor; null hasta la primera. */
  readonly data: T | null;
  readonly connection: LiveConnection;
  readonly lastUpdated: Date | null;
  /** Falla de la última lectura o de la suscripción; null si todo va bien. */
  readonly problem: ServerError | null;
}

export interface LiveSubscriber<T> {
  readonly onData: (value: T) => void;
  readonly onError: (error: ServerError) => void;
}

export interface LiveDataOptions {
  readonly now?: () => Date;
  /** Espera antes de volver a suscribirse tras un error de red. */
  readonly retryMs?: number;
  /** Texto de un cambio rechazado (por defecto, el motivo que da el servidor). */
  readonly errorText?: (error: ServerError) => string;
}

const INITIAL = { data: null, connection: 'connecting', lastUpdated: null, problem: null } as const;
const systemNow = () => new Date();

/** El navegador dice si tiene red; sin `navigator` (pruebas, servidor) se supone que sí. */
const browserOnline = () => typeof navigator === 'undefined' || navigator.onLine !== false;

/**
 * Lectura en tiempo real (ADR-0007). La suscripción trae cada cambio al instante y, además, se
 * vuelve a leer todo al abrir, al recuperar la red, al volver la pestaña a primer plano, tras un
 * error y tras cada cambio propio (caso 11): lo confirmado en el servidor nunca se pierde.
 * `load` y `watch` deben ser estables (useCallback); con null no se lee nada.
 */
export function useLiveData<T>(
  load: (() => Promise<Outcome<T>>) | null,
  watch: ((subscriber: LiveSubscriber<T>) => () => void) | null,
  { now = systemNow, retryMs = 5_000, errorText = serverErrorText }: LiveDataOptions = {},
) {
  const [state, setState] = useState<LiveState<T>>(INITIAL);
  const [notice, setNotice] = useState<ActionResult>(null);
  const [attempt, setAttempt] = useState(0);
  const nowRef = useRef(now);
  useEffect(() => {
    nowRef.current = now;
  }, [now]);

  const accept = useCallback((data: T) => {
    // Una lectura que salió antes de perder la red puede llegar después: actualiza los datos, pero
    // la pantalla sigue «sin conexión» hasta que el navegador recupere la red.
    setState({
      data,
      connection: browserOnline() ? 'live' : 'offline',
      lastUpdated: nowRef.current(),
      problem: null,
    });
  }, []);

  const fail = useCallback((problem: ServerError) => {
    setState((current) => ({ ...current, connection: 'offline', problem }));
  }, []);

  /** Lectura completa (recuperación). */
  const refresh = useCallback(async () => {
    if (!load) return;
    const result = await load();
    if (result.ok) accept(result.value);
    else fail(result.error);
  }, [accept, fail, load]);

  useEffect(() => {
    if (!load || !watch) return undefined;
    let active = true;
    let retry: number | undefined;
    setState((current) => ({ ...current, connection: 'connecting' }));
    void refresh();
    const unsubscribe = watch({
      onData: (data) => {
        if (active) accept(data);
      },
      onError: (error) => {
        if (!active) return;
        fail(error);
        // Una sesión sin permiso no se reintenta: la app la lleva a iniciar sesión otra vez.
        if (error.kind !== 'unauthorized') {
          retry = window.setTimeout(() => setAttempt((n) => n + 1), retryMs);
        }
      },
    });
    const reconnect = () => setAttempt((n) => n + 1);
    const goOffline = () => setState((current) => ({ ...current, connection: 'offline' }));
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    window.addEventListener('online', reconnect);
    window.addEventListener('offline', goOffline);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      active = false;
      window.clearTimeout(retry);
      unsubscribe();
      window.removeEventListener('online', reconnect);
      window.removeEventListener('offline', goOffline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [accept, attempt, fail, load, refresh, retryMs, watch]);

  /**
   * Ejecuta un cambio y, pase lo que pase, vuelve a leer: la pantalla muestra lo que dice el
   * servidor. Devuelve true si el servidor lo aceptó.
   */
  const run = useCallback(
    async (command: () => Promise<Outcome<void>>, successText: string): Promise<boolean> => {
      const result = await command();
      setNotice(
        result.ok
          ? { tone: 'success', text: successText }
          : { tone: 'error', text: errorText(result.error) },
      );
      await refresh();
      return result.ok;
    },
    [errorText, refresh],
  );

  return { state, notice, refresh, run };
}

export type LiveRunCommand = ReturnType<typeof useLiveData>['run'];
