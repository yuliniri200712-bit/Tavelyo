import { useCallback, useEffect, useState } from 'react';
import {
  ActionNotice,
  Card,
  ErrorState,
  LoadingState,
  RadioField,
  TavelyoButton,
  serverErrorText,
  type ActionResult,
} from '@tavelyo/design-system';
import { APPROVAL_MODE_TEXT } from '../application/order-approval.ts';
import type {
  BranchScope,
  OrderApprovalGateway,
  OrderApprovalMode,
  OrdersError,
} from '../domain/index.ts';

export interface OrderApprovalSettingsProps {
  readonly gateway: OrderApprovalGateway;
  readonly scope: BranchScope;
  readonly branchName: string;
}

const MODES: readonly OrderApprovalMode[] = ['DIRECT', 'WAITER_APPROVAL'];

type Loaded =
  | { readonly kind: 'loading' }
  | { readonly kind: 'failed'; readonly error: OrdersError }
  | { readonly kind: 'ready'; readonly saved: OrderApprovalMode };

/**
 * Cómo llegan a cocina los pedidos del cliente en la sucursal (D-32): directo o con aprobación del
 * mesero. Lo cambian el propietario y el administrador de sucursal (branch.settings; lo comprueba el
 * servidor, que deja el cambio en la auditoría).
 */
export function OrderApprovalSettings({ gateway, scope, branchName }: OrderApprovalSettingsProps) {
  const { tenantId, branchId } = scope;
  const [loaded, setLoaded] = useState<Loaded>({ kind: 'loading' });
  const [choice, setChoice] = useState<OrderApprovalMode>('DIRECT');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<ActionResult>(null);

  const load = useCallback(async () => {
    setLoaded({ kind: 'loading' });
    const result = await gateway.mode({ tenantId, branchId });
    if (!result.ok) return setLoaded({ kind: 'failed', error: result.error });
    setLoaded({ kind: 'ready', saved: result.value });
    setChoice(result.value);
  }, [gateway, tenantId, branchId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setNotice(null);
    const result = await gateway.setMode(scope, choice);
    setSaving(false);
    if (!result.ok) {
      setNotice({ tone: 'error', text: serverErrorText(result.error) });
      return;
    }
    setLoaded({ kind: 'ready', saved: choice });
    setNotice({
      tone: 'success',
      text: `Guardado: ${APPROVAL_MODE_TEXT[choice].title.toLowerCase()}.`,
    });
  };

  return (
    <Card title="Pedidos desde el teléfono del cliente" headingLevel={2}>
      <ActionNotice notice={notice} />
      {loaded.kind === 'loading' ? <LoadingState message="Cargando el ajuste…" /> : null}
      {loaded.kind === 'failed' ? (
        <ErrorState
          title="No se pudo cargar el ajuste"
          description={serverErrorText(loaded.error)}
          onRetry={() => void load()}
        />
      ) : null}
      {loaded.kind === 'ready' ? (
        <>
          <fieldset className="tv-fieldset">
            <legend className="tv-fieldset__legend">¿Cómo llegan a cocina en {branchName}?</legend>
            {MODES.map((mode) => (
              <RadioField
                key={mode}
                name="order-approval"
                value={mode}
                checked={choice === mode}
                onChange={() => setChoice(mode)}
                label={APPROVAL_MODE_TEXT[mode].title}
                hint={APPROVAL_MODE_TEXT[mode].description}
              />
            ))}
          </fieldset>
          <div className="tv-toolbar">
            <TavelyoButton
              loading={saving}
              loadingLabel="Guardando…"
              disabled={choice === loaded.saved}
              onClick={() => void save()}
            >
              Guardar
            </TavelyoButton>
          </div>
        </>
      ) : null}
    </Card>
  );
}
