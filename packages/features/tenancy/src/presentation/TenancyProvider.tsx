import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { TenancyGateway } from '../domain/index.ts';
import {
  initialSelection,
  selectionReducer,
  type SelectionEvent,
  type SelectionState,
} from '../application/selection.ts';

export interface TenancyContextValue {
  readonly selection: SelectionState;
  readonly dispatch: Dispatch<SelectionEvent>;
  /** Vuelve a leer las sucursales de la empresa activa sin cambiar la sucursal en uso. */
  readonly refreshBranches: () => Promise<void>;
}

const TenancyContext = createContext<TenancyContextValue | null>(null);

export interface TenancyProviderProps {
  readonly gateway: TenancyGateway;
  readonly children: ReactNode;
}

/**
 * Carga membresías y sucursales según el estado. Se monta una vez por sesión: al cerrar sesión
 * se desmonta y su estado desaparece con ella.
 */
export function TenancyProvider({ gateway, children }: TenancyProviderProps) {
  const [selection, dispatch] = useReducer(selectionReducer, initialSelection);
  const loadingTenantId =
    selection.status === 'loading-branches' ? selection.tenant.tenantId : null;

  useEffect(() => {
    if (selection.status !== 'loading-tenants') return;
    let current = true;
    void gateway.myMemberships().then((result) => {
      if (!current) return;
      dispatch(
        result.ok
          ? { type: 'memberships-loaded', memberships: result.value }
          : { type: 'failed', error: result.error },
      );
    });
    return () => {
      current = false;
    };
  }, [gateway, selection.status]);

  useEffect(() => {
    if (!loadingTenantId) return;
    let current = true;
    void gateway.myBranches(loadingTenantId).then((result) => {
      if (!current) return;
      dispatch(
        result.ok
          ? { type: 'branches-loaded', branches: result.value }
          : { type: 'failed', error: result.error },
      );
    });
    return () => {
      current = false;
    };
  }, [gateway, loadingTenantId]);

  const activeTenantId = selection.status === 'ready' ? selection.tenant.tenantId : null;
  const refreshBranches = useCallback(async () => {
    if (!activeTenantId) return;
    const result = await gateway.myBranches(activeTenantId);
    if (result.ok) dispatch({ type: 'branches-refreshed', branches: result.value });
  }, [gateway, activeTenantId]);

  const value = useMemo(
    () => ({ selection, dispatch, refreshBranches }),
    [selection, refreshBranches],
  );
  return <TenancyContext.Provider value={value}>{children}</TenancyContext.Provider>;
}

export function useTenancy(): TenancyContextValue {
  const value = useContext(TenancyContext);
  if (!value) throw new Error('useTenancy debe usarse dentro de <TenancyProvider>.');
  return value;
}
