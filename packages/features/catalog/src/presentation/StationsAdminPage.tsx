import { useCallback, useState, type FormEvent, type ReactNode } from 'react';
import {
  ActionNotice,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  PageTitle,
  serverErrorText,
  StatusChip,
  TavelyoButton,
  TextField,
  useServerData,
} from '@tavelyo/design-system';
import { parseStationForm, STATION_NAME_MAX } from '../application/forms.ts';
import type {
  BranchScope,
  CatalogAdminGateway,
  StationAdmin,
  StationInput,
} from '../domain/index.ts';

export interface StationsAdminPageProps {
  readonly gateway: CatalogAdminGateway;
  readonly scope: BranchScope;
  readonly branchName: string;
  /** Enlace a la carta de la sucursal, donde se asigna la estación de cada producto. */
  readonly branchMenuLink?: ReactNode;
}

/**
 * Estaciones de cocina de la sucursal (requiere catalog.manage; lo comprueba el servidor). Cada
 * persona de cocina elige en su pantalla la estación que atiende (D-24).
 */
export function StationsAdminPage({
  gateway,
  scope,
  branchName,
  branchMenuLink,
}: StationsAdminPageProps) {
  const { tenantId, branchId } = scope;
  const load = useCallback(
    () => gateway.stations({ tenantId, branchId }),
    [gateway, tenantId, branchId],
  );
  const { state, notice, reload, run } = useServerData<readonly StationAdmin[]>(load);

  return (
    <div className="tv-page">
      <header className="tv-page__header">
        <div>
          <PageTitle icon="stations">Estaciones de cocina</PageTitle>
          <p className="tv-list__meta">
            {branchName} · Cada producto de la carta se prepara en una estación. Lo que no tiene
            estación va a la predeterminada.
          </p>
        </div>
        {branchMenuLink ? <div className="tv-toolbar">{branchMenuLink}</div> : null}
      </header>
      <ActionNotice notice={notice} />
      <Card title="Nueva estación" headingLevel={2}>
        <StationForm
          submitLabel="Agregar estación"
          onSubmit={(input) =>
            run(() => gateway.createStation(scope, input), `Estación «${input.name}» agregada.`)
          }
        />
      </Card>
      {state.status === 'loading' ? <LoadingState message="Cargando las estaciones…" /> : null}
      {state.status === 'error' ? (
        <ErrorState
          title="No se pudieron cargar las estaciones"
          description={serverErrorText(state.error)}
          onRetry={reload}
        />
      ) : null}
      {state.status === 'ready' && state.data.length === 0 ? (
        <EmptyState
          title="La sucursal todavía no tiene estaciones"
          description="Se crea una predeterminada, «Cocina», al enviar el primer pedido."
        />
      ) : null}
      {state.status === 'ready' && state.data.length > 0 ? (
        <Card title="Estaciones de la sucursal" headingLevel={2}>
          <ul className="tv-list" aria-label="Estaciones de la sucursal">
            {state.data.map((station) => (
              <StationItem
                key={station.id}
                station={station}
                onSave={(input, archived) =>
                  run(
                    () => gateway.updateStation(scope, station.id, { ...input, archived }),
                    archived
                      ? `Estación «${input.name}» archivada.`
                      : `Estación «${input.name}» guardada.`,
                  )
                }
              />
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

function stationChip(station: StationAdmin) {
  if (station.archived) return <StatusChip tone="neutral" label="Archivada" />;
  if (station.isDefault) return <StatusChip tone="success" label="Predeterminada" />;
  return <StatusChip tone="success" label="Activa" />;
}

function StationItem({
  station,
  onSave,
}: {
  readonly station: StationAdmin;
  readonly onSave: (input: StationInput, archived: boolean) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const current = { name: station.name, sort: station.sort };
  return (
    <li className="tv-list__item">
      <div className="tv-list__summary">
        <span className="tv-list__title">{station.name}</span>
        {stationChip(station)}
      </div>
      {station.isDefault ? (
        <p className="tv-list__meta">
          Recibe los productos sin estación asignada. No se puede archivar.
        </p>
      ) : null}
      {editing ? (
        <StationForm
          initial={current}
          submitLabel="Guardar estación"
          onCancel={() => setEditing(false)}
          onSubmit={async (input) => {
            const accepted = await onSave(input, station.archived);
            if (accepted) setEditing(false);
            return accepted;
          }}
        />
      ) : (
        <div className="tv-toolbar">
          <TavelyoButton
            variant="secondary"
            aria-label={`Editar ${station.name}`}
            onClick={() => setEditing(true)}
          >
            <Icon name="edit" />
            Editar
          </TavelyoButton>
          {station.isDefault ? null : (
            <TavelyoButton
              variant="secondary"
              aria-label={`${station.archived ? 'Restaurar' : 'Archivar'} ${station.name}`}
              onClick={() => void onSave(current, !station.archived)}
            >
              <Icon name={station.archived ? 'restore' : 'archive'} />
              {station.archived ? 'Restaurar' : 'Archivar'}
            </TavelyoButton>
          )}
        </div>
      )}
    </li>
  );
}

function StationForm({
  initial = { name: '', sort: 0 },
  submitLabel,
  onSubmit,
  onCancel,
}: {
  readonly initial?: StationInput;
  readonly submitLabel: string;
  readonly onSubmit: (input: StationInput) => Promise<boolean>;
  readonly onCancel?: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [sort, setSort] = useState(String(initial.sort));
  const [errors, setErrors] = useState<Partial<Record<'name' | 'sort', string>>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseStationForm({ name, sort });
    if (!parsed.ok) {
      setErrors(parsed.error);
      return;
    }
    setErrors({});
    setBusy(true);
    const accepted = await onSubmit(parsed.value);
    setBusy(false);
    if (accepted && !onCancel) {
      setName('');
      setSort('0');
    }
  };

  return (
    <form className="tv-form" onSubmit={(event) => void submit(event)} noValidate>
      <TextField
        label="Nombre de la estación"
        hint="Por ejemplo: Cocina caliente, Parrilla o Bar."
        value={name}
        maxLength={STATION_NAME_MAX}
        onChange={(event) => setName(event.target.value)}
        {...(errors.name ? { error: errors.name } : {})}
      />
      <TextField
        label="Orden en la lista"
        hint="Las estaciones se muestran de menor a mayor."
        inputMode="numeric"
        value={sort}
        onChange={(event) => setSort(event.target.value)}
        {...(errors.sort ? { error: errors.sort } : {})}
      />
      <div className="tv-toolbar">
        <TavelyoButton type="submit" loading={busy} loadingLabel="Guardando…">
          {submitLabel}
        </TavelyoButton>
        {onCancel ? (
          <TavelyoButton variant="secondary" onClick={onCancel} disabled={busy}>
            Cancelar
          </TavelyoButton>
        ) : null}
      </div>
    </form>
  );
}
