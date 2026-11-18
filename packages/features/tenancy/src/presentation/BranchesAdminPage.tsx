import { useCallback, useMemo, useState, type FormEvent } from 'react';
import {
  ActionNotice,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  PageTitle,
  SelectField,
  serverErrorText,
  StatusChip,
  TavelyoButton,
  TextField,
  useServerData,
  type RunCommand,
} from '@tavelyo/design-system';
import {
  availableTimeZones,
  BRANCH_NAME_MAX,
  parseBranchForm,
} from '../application/branch-form.ts';
import type { BranchAdmin, BranchAdminGateway, BranchInput } from '../domain/index.ts';

export interface BranchesAdminPageProps {
  readonly gateway: BranchAdminGateway;
  readonly tenantId: string;
  /** Moneda de la empresa: la de todas sus sucursales. */
  readonly currency: string;
  /** Sucursal en la que se trabaja ahora: no se archiva desde aquí. */
  readonly currentBranchId: string;
  /** Zona horaria propuesta para una sucursal nueva (la de la sucursal actual). */
  readonly defaultTimezone: string;
  /** Tras cada cambio aceptado: la app actualiza la lista de sucursales de su contexto. */
  readonly onBranchesChanged?: () => void;
}

/** Sucursales de la empresa (propietario, tenant.settings; lo comprueba el servidor). */
export function BranchesAdminPage(props: BranchesAdminPageProps) {
  const { gateway, tenantId, onBranchesChanged } = props;
  const load = useCallback(() => gateway.branches(tenantId), [gateway, tenantId]);
  const { state, notice, reload, run: runCommand } = useServerData(load);
  const zones = useMemo(availableTimeZones, []);
  const run: RunCommand = useCallback(
    async (command, successText) => {
      const accepted = await runCommand(command, successText);
      if (accepted) onBranchesChanged?.();
      return accepted;
    },
    [runCommand, onBranchesChanged],
  );

  return (
    <div className="tv-page">
      <header className="tv-page__header">
        <div>
          <PageTitle icon="branch">Sucursales</PageTitle>
          <p className="tv-list__meta">
            Todas usan la moneda de la empresa ({props.currency}). El horario de la carta se aplica
            en la zona horaria de cada sucursal.
          </p>
        </div>
      </header>
      <ActionNotice notice={notice} />
      <Card title="Nueva sucursal" headingLevel={2}>
        <BranchForm
          zones={zones}
          initial={{ name: '', timezone: props.defaultTimezone }}
          submitLabel="Crear sucursal"
          onSubmit={(input) =>
            run(
              () => gateway.createBranch(tenantId, props.currency, input),
              `Sucursal «${input.name}» creada. Para trabajar en ella, elige «Cambiar empresa o sucursal» en la parte superior.`,
            )
          }
        />
      </Card>
      {state.status === 'loading' ? <LoadingState message="Cargando las sucursales…" /> : null}
      {state.status === 'error' ? (
        <ErrorState
          title="No se pudieron cargar las sucursales"
          description={serverErrorText(state.error)}
          onRetry={reload}
        />
      ) : null}
      {state.status === 'ready' && state.data.length === 0 ? (
        <EmptyState
          title="No hay sucursales"
          description="Crea la primera sucursal de la empresa."
        />
      ) : null}
      {state.status === 'ready' && state.data.length > 0 ? (
        <Card title="Sucursales de la empresa" headingLevel={2}>
          <ul className="tv-list" aria-label="Sucursales de la empresa">
            {state.data.map((branch) => (
              <BranchItem
                key={branch.id}
                branch={branch}
                current={branch.id === props.currentBranchId}
                zones={zones}
                gateway={gateway}
                tenantId={tenantId}
                run={run}
              />
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

function BranchItem({
  branch,
  current,
  zones,
  gateway,
  tenantId,
  run,
}: {
  readonly branch: BranchAdmin;
  readonly current: boolean;
  readonly zones: readonly string[];
  readonly gateway: BranchAdminGateway;
  readonly tenantId: string;
  readonly run: RunCommand;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [busy, setBusy] = useState(false);
  const save = (input: BranchInput, archived: boolean, text: string) =>
    run(() => gateway.updateBranch(tenantId, branch.id, { ...input, archived }), text);
  const base = { name: branch.name, timezone: branch.timezone };

  return (
    <li className="tv-list__item">
      <div className="tv-list__summary">
        <span className="tv-list__title">{branch.name}</span>
        <StatusChip
          tone={branch.archived ? 'neutral' : 'success'}
          label={branch.archived ? 'Archivada' : 'Activa'}
        />
        {current ? <StatusChip tone="info" label="Sucursal actual" /> : null}
      </div>
      <p className="tv-list__meta">
        {branch.timezone} · {branch.currency}
      </p>
      {editing ? (
        <BranchForm
          zones={zones}
          initial={base}
          submitLabel="Guardar sucursal"
          onCancel={() => setEditing(false)}
          onSubmit={async (input) => {
            const accepted = await save(
              input,
              branch.archived,
              `Sucursal «${input.name}» guardada.`,
            );
            if (accepted) setEditing(false);
            return accepted;
          }}
        />
      ) : (
        <div className="tv-toolbar">
          <TavelyoButton variant="secondary" onClick={() => setEditing(true)}>
            <Icon name="edit" />
            Editar sucursal
          </TavelyoButton>
          {branch.archived ? (
            <TavelyoButton
              variant="secondary"
              onClick={() => void save(base, false, `Sucursal «${branch.name}» restaurada.`)}
            >
              <Icon name="restore" />
              Restaurar sucursal
            </TavelyoButton>
          ) : current ? (
            <p className="tv-list__meta">Para archivarla, cambia antes a otra sucursal.</p>
          ) : (
            <TavelyoButton variant="secondary" onClick={() => setConfirmArchive(true)}>
              <Icon name="archive" />
              Archivar sucursal
            </TavelyoButton>
          )}
        </div>
      )}
      <ConfirmDialog
        open={confirmArchive}
        title={`¿Archivar la sucursal ${branch.name}?`}
        confirmLabel="Archivar sucursal"
        destructive
        busy={busy}
        onCancel={() => setConfirmArchive(false)}
        onConfirm={() => {
          setBusy(true);
          void save(base, true, `Sucursal «${branch.name}» archivada.`).then(() => {
            setBusy(false);
            setConfirmArchive(false);
          });
        }}
      >
        <p>
          El personal dejará de verla y los QR de sus mesas dejarán de abrir la carta. No se borra
          nada: puedes restaurarla después. No se puede archivar con mesas abiertas.
        </p>
      </ConfirmDialog>
    </li>
  );
}

function BranchForm({
  zones,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  readonly zones: readonly string[];
  readonly initial: BranchInput;
  readonly submitLabel: string;
  readonly onSubmit: (input: BranchInput) => Promise<boolean>;
  readonly onCancel?: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [timezone, setTimezone] = useState(initial.timezone);
  const [errors, setErrors] = useState<Partial<Record<'name' | 'timezone', string>>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseBranchForm({ name, timezone }, zones);
    if (!parsed.ok) {
      setErrors(parsed.error);
      return;
    }
    setErrors({});
    setBusy(true);
    const accepted = await onSubmit(parsed.value);
    setBusy(false);
    if (accepted && !onCancel) setName('');
  };

  return (
    <form className="tv-form" onSubmit={(event) => void submit(event)} noValidate>
      <TextField
        label="Nombre de la sucursal"
        value={name}
        maxLength={BRANCH_NAME_MAX}
        onChange={(event) => setName(event.target.value)}
        {...(errors.name ? { error: errors.name } : {})}
      />
      <SelectField
        label="Zona horaria"
        hint="En Colombia: America/Bogota."
        value={timezone}
        onChange={(event) => setTimezone(event.target.value)}
        {...(errors.timezone ? { error: errors.timezone } : {})}
      >
        {zones.map((zone) => (
          <option key={zone} value={zone}>
            {zone}
          </option>
        ))}
      </SelectField>
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
