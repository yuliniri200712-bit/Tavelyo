import { useCallback, useState, type FormEvent } from 'react';
import { parseNit } from '@tavelyo/core';
import {
  ActionNotice,
  Card,
  ErrorState,
  LoadingState,
  TavelyoButton,
  TextField,
  serverErrorText,
  useServerData,
  type ActionResult,
} from '@tavelyo/design-system';
import type { TenantProfileGateway } from '../domain/index.ts';

export interface CompanyDataCardProps {
  readonly gateway: TenantProfileGateway;
  readonly tenantId: string;
}

const NIT_HINT =
  'El número y el dígito de verificación separado con guion, como en el RUT: por ejemplo 900123456-7.';

/** NIT de la empresa, que va en el comprobante de cada pago (bloque 6a). Lo edita el propietario. */
export function CompanyDataCard({ gateway, tenantId }: CompanyDataCardProps) {
  const load = useCallback(() => gateway.profile(tenantId), [gateway, tenantId]);
  const { state, reload, refresh } = useServerData(load);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [notice, setNotice] = useState<ActionResult>(null);
  const [busy, setBusy] = useState(false);

  const current = state.status === 'ready' ? (state.data.taxId ?? '') : '';
  const value = text ?? current;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!parseNit(value)) return setError(`Revisa el NIT y su dígito de verificación. ${NIT_HINT}`);
    setError(undefined);
    setBusy(true);
    const result = await gateway.setTaxId(tenantId, value);
    setBusy(false);
    if (!result.ok) return setNotice({ tone: 'error', text: serverErrorText(result.error) });
    setNotice({ tone: 'success', text: `NIT guardado: ${result.value}.` });
    setText(null);
    refresh();
  };

  return (
    <Card title="Datos de la empresa" headingLevel={2}>
      <ActionNotice notice={notice} />
      {state.status === 'loading' ? <LoadingState message="Cargando los datos…" /> : null}
      {state.status === 'error' ? (
        <ErrorState
          title="No se pudieron cargar los datos de la empresa"
          description={serverErrorText(state.error)}
          onRetry={reload}
        />
      ) : null}
      {state.status === 'ready' ? (
        <form className="tv-form" onSubmit={(event) => void submit(event)} noValidate>
          <p>
            {state.data.name}:{' '}
            {state.data.taxId
              ? `NIT ${state.data.taxId}.`
              : 'todavía no tiene NIT registrado. Los comprobantes lo necesitan.'}
          </p>
          <TextField
            label="NIT"
            value={value}
            inputMode="numeric"
            autoComplete="off"
            maxLength={20}
            onChange={(event) => setText(event.target.value)}
            hint={NIT_HINT}
            error={error}
          />
          <div className="tv-toolbar">
            <TavelyoButton type="submit" loading={busy} loadingLabel="Guardando…">
              Guardar NIT
            </TavelyoButton>
          </div>
        </form>
      ) : null}
    </Card>
  );
}
