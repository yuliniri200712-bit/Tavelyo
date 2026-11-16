import { useCallback } from 'react';
import { useLiveData, type LiveDataOptions, type LiveSubscriber } from '@tavelyo/design-system';
import type { BranchScope, KitchenGateway, KitchenItem } from '../domain/index.ts';

/**
 * Cola de una estación en tiempo real (ADR-0007): suscripción más lectura completa al abrir, al
 * reconectar, al volver a primer plano y tras un error (caso 11), con `useLiveData`.
 */
export function useKitchenQueue(
  gateway: KitchenGateway,
  scope: BranchScope,
  stationId: string,
  options: LiveDataOptions = {},
) {
  const { tenantId, branchId } = scope;
  const load = useCallback(
    () => gateway.queue({ tenantId, branchId }, stationId),
    [gateway, tenantId, branchId, stationId],
  );
  const watch = useCallback(
    (subscriber: LiveSubscriber<readonly KitchenItem[]>) =>
      gateway.watchQueue({ tenantId, branchId }, stationId, subscriber),
    [gateway, tenantId, branchId, stationId],
  );
  return useLiveData(load, watch, options);
}
