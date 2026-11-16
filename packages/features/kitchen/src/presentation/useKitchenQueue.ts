import { useCallback, useEffect, useRef, useState } from 'react';
import type { BranchScope, KitchenError, KitchenGateway, KitchenItem } from '../domain/index.ts';

/** live: recibe cambios al instante; offline: sin conexión con el servidor (no se avanza nada). */
export type QueueConnection = 'connecting' | 'live' | 'offline';

export interface KitchenQueueState {
  readonly items: readonly KitchenItem[] | null;
  readonly connection: QueueConnection;
  readonly lastUpdated: Date | null;
  /** Falla de la última lectura o de la suscripción; null si todo va bien. */
  readonly problem: KitchenError | null;
}

export interface KitchenQueueOptions {
  readonly now?: () => Date;
  /** Espera antes de volver a suscribirse tras un error de red. */
  readonly retryMs?: number;
}

const INITIAL: KitchenQueueState = {
  items: null,
  connection: 'connecting',
  lastUpdated: null,
  problem: null,
};

/**
 * Cola de una estación en tiempo real (ADR-0007). La suscripción trae cada cambio al instante y,
 * además, se vuelve a leer todo lo pendiente al abrir, al recuperar la red, al volver la pestaña
 * a primer plano y tras un error (caso 11): lo confirmado en el servidor nunca se pierde.
 */
export function useKitchenQueue(
  gateway: KitchenGateway,
  scope: BranchScope,
  stationId: string | null,
  { now = () => new Date(), retryMs = 5_000 }: KitchenQueueOptions = {},
) {
  const { tenantId, branchId } = scope;
  const [state, setState] = useState<KitchenQueueState>(INITIAL);
  const [attempt, setAttempt] = useState(0);
  const nowRef = useRef(now);
  useEffect(() => {
    nowRef.current = now;
  }, [now]);

  const accept = useCallback((items: readonly KitchenItem[]) => {
    setState({ items, connection: 'live', lastUpdated: nowRef.current(), problem: null });
  }, []);

  const fail = useCallback((problem: KitchenError) => {
    setState((current) => ({ ...current, connection: 'offline', problem }));
  }, []);

  /** Lectura completa de lo pendiente (recuperación). */
  const refresh = useCallback(async () => {
    if (!stationId) return;
    const result = await gateway.queue({ tenantId, branchId }, stationId);
    if (result.ok) accept(result.value);
    else fail(result.error);
  }, [accept, branchId, fail, gateway, stationId, tenantId]);

  useEffect(() => {
    if (!stationId) return undefined;
    let active = true;
    let retry: number | undefined;
    setState((current) => ({ ...current, connection: 'connecting' }));
    void refresh();
    const unsubscribe = gateway.watchQueue({ tenantId, branchId }, stationId, {
      onData: (items) => {
        if (active) accept(items);
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
  }, [accept, attempt, branchId, fail, gateway, refresh, retryMs, stationId, tenantId]);

  return { state, refresh };
}
