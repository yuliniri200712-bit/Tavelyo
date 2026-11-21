import { useCallback, useState, type FormEvent } from 'react';
import {
  ActionNotice,
  Card,
  ErrorState,
  LoadingState,
  StatusChip,
  TavelyoButton,
  TextField,
  serverErrorText,
  useServerData,
} from '@tavelyo/design-system';
import { readRegisterName, REGISTER_NAME_MAX } from '../application/cash-desk.ts';
import type { BranchScope, CashGateway, Register } from '../domain/index.ts';

export interface RegistersAdminProps {
  readonly gateway: CashGateway;
  readonly scope: BranchScope;
  readonly branchName: string;
}

const state = (register: Register) =>
  register.archived
    ? { label: 'Archivada', tone: 'neutral' as const }
    : register.openSession
      ? { label: 'En uso', tone: 'info' as const }
      : { label: 'Libre', tone: 'success' as const };

/**
 * Cajas de la sucursal (D-40): crear, renombrar, archivar y restaurar. Lo hacen el propietario y el
 * administrador de sucursal (branch.settings); el servidor no archiva una caja con turno abierto.
 */
export function RegistersAdmin({ gateway, scope, branchName }: RegistersAdminProps) {
  const { tenantId, branchId } = scope;
  const load = useCallback(
    () => gateway.registers({ tenantId, branchId }),
    [gateway, tenantId, branchId],
  );
  const { state: data, notice, reload, run } = useServerData(load);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>();

  const create = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = readRegisterName(name);
    if (!parsed.ok) return setError(parsed.error);
    setError(undefined);
    if (
      await run(() => gateway.createRegister(scope, parsed.value), `Caja «${parsed.value}» creada.`)
    )
      setName('');
  };

  return (
    <Card title={`Cajas de ${branchName}`} headingLevel={2}>
      <ActionNotice notice={notice} />
      {data.status === 'loading' ? <LoadingState message="Cargando las cajas…" /> : null}
      {data.status === 'error' ? (
        <ErrorState
          title="No se pudieron cargar las cajas"
          description={serverErrorText(data.error)}
          onRetry={reload}
        />
      ) : null}
      {data.status === 'ready' ? (
        data.data.length === 0 ? (
          <p>La sucursal todavía no tiene cajas. Crea la primera para poder cobrar en efectivo.</p>
        ) : (
          <ul className="tv-list">
            {data.data.map((register) => (
              <RegisterRow
                key={register.id}
                register={register}
                onSave={(changes) =>
                  run(
                    () => gateway.updateRegister(scope, { ...register, ...changes }),
                    changes.archived === undefined
                      ? 'Nombre guardado.'
                      : changes.archived
                        ? `Caja «${register.name}» archivada.`
                        : `Caja «${register.name}» restaurada.`,
                  )
                }
              />
            ))}
          </ul>
        )
      ) : null}
      <form className="tv-form" onSubmit={(event) => void create(event)} noValidate>
        <TextField
          label="Nombre de la caja nueva"
          value={name}
          maxLength={REGISTER_NAME_MAX}
          onChange={(event) => setName(event.target.value)}
          hint="Por ejemplo, «Caja principal» o «Barra»."
          error={error}
        />
        <div className="tv-toolbar">
          <TavelyoButton type="submit">Crear caja</TavelyoButton>
        </div>
      </form>
    </Card>
  );
}

function RegisterRow({
  register,
  onSave,
}: {
  readonly register: Register;
  readonly onSave: (changes: { name?: string; archived?: boolean }) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(register.name);
  const [error, setError] = useState<string | undefined>();
  const chip = state(register);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = readRegisterName(name);
    if (!parsed.ok) return setError(parsed.error);
    setError(undefined);
    if (await onSave({ name: parsed.value })) setEditing(false);
  };
  return (
    <li className="tv-list__item">
      <span className="tv-list__title">{register.name}</span>
      <StatusChip label={chip.label} tone={chip.tone} />
      {editing ? (
        <form className="tv-form" onSubmit={(event) => void save(event)} noValidate>
          <TextField
            label={`Nuevo nombre de «${register.name}»`}
            value={name}
            maxLength={REGISTER_NAME_MAX}
            onChange={(event) => setName(event.target.value)}
            error={error}
          />
          <div className="tv-toolbar">
            <TavelyoButton type="submit">Guardar</TavelyoButton>
            <TavelyoButton variant="secondary" onClick={() => setEditing(false)}>
              Cancelar
            </TavelyoButton>
          </div>
        </form>
      ) : (
        <div className="tv-toolbar">
          <TavelyoButton variant="secondary" onClick={() => setEditing(true)}>
            Renombrar
          </TavelyoButton>
          <TavelyoButton
            variant="secondary"
            disabled={!register.archived && register.openSession !== null}
            onClick={() => void onSave({ archived: !register.archived })}
          >
            {register.archived ? 'Restaurar' : 'Archivar'}
          </TavelyoButton>
        </div>
      )}
    </li>
  );
}
