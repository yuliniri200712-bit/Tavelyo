import { useCallback } from 'react';
import { useServerData } from '@tavelyo/design-system';
import type { BranchScope, FloorAdminGateway } from '../domain/index.ts';

/** Sectores y mesas de la sucursal, siempre leídos del servidor (ver useServerData). */
export function useFloorLayout(gateway: FloorAdminGateway, scope: BranchScope) {
  const { tenantId, branchId } = scope;
  const load = useCallback(
    () => gateway.layout({ tenantId, branchId }),
    [gateway, tenantId, branchId],
  );
  return useServerData(load);
}
