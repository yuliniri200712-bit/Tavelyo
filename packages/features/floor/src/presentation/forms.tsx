import { useState, type FormEvent } from 'react';
import { SelectField, TavelyoButton, TextField } from '@tavelyo/design-system';
import {
  parseSectorForm,
  parseTableForm,
  SEATS_MAX,
  SEATS_MIN,
  SECTOR_NAME_MAX,
  TABLE_CODE_MAX,
  type FieldErrors,
} from '../application/forms.ts';
import type { SectorAdmin, SectorInput, TableInput } from '../domain/index.ts';

interface FormActions<T> {
  readonly submitLabel: string;
  /** Devuelve true si el servidor aceptó el cambio (entonces el formulario se vacía o se cierra). */
  readonly onSubmit: (input: T) => Promise<boolean>;
  readonly onCancel?: () => void;
}

export function SectorForm({
  initial = { name: '', sort: 0 },
  submitLabel,
  onSubmit,
  onCancel,
}: FormActions<SectorInput> & { readonly initial?: SectorInput }) {
  const [name, setName] = useState(initial.name);
  const [sort, setSort] = useState(String(initial.sort));
  const [errors, setErrors] = useState<FieldErrors<'name' | 'sort'>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseSectorForm({ name, sort });
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
        label="Nombre del sector"
        hint="Por ejemplo: Salón principal, Terraza o Barra."
        value={name}
        maxLength={SECTOR_NAME_MAX}
        onChange={(event) => setName(event.target.value)}
        {...(errors.name ? { error: errors.name } : {})}
      />
      <TextField
        label="Orden en la lista"
        hint="Los sectores se muestran de menor a mayor."
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

export function TableForm({
  initial,
  sectors,
  submitLabel,
  onSubmit,
  onCancel,
}: FormActions<TableInput> & {
  readonly initial: TableInput;
  /** Sectores activos a los que se puede mover la mesa; si hay uno solo no se muestra la lista. */
  readonly sectors: readonly SectorAdmin[];
}) {
  const [sectorId, setSectorId] = useState(initial.sectorId);
  const [code, setCode] = useState(initial.code);
  const [seats, setSeats] = useState(String(initial.seats));
  const [errors, setErrors] = useState<FieldErrors<'sectorId' | 'code' | 'seats'>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseTableForm({ sectorId, code, seats });
    if (!parsed.ok) {
      setErrors(parsed.error);
      return;
    }
    setErrors({});
    setBusy(true);
    const accepted = await onSubmit(parsed.value);
    setBusy(false);
    if (accepted && !onCancel) {
      setCode('');
      setSeats(String(initial.seats));
    }
  };

  return (
    <form className="tv-form" onSubmit={(event) => void submit(event)} noValidate>
      {sectors.length > 1 ? (
        <SelectField
          label="Sector"
          value={sectorId}
          onChange={(event) => setSectorId(event.target.value)}
          {...(errors.sectorId ? { error: errors.sectorId } : {})}
        >
          {sectors.map((sector) => (
            <option key={sector.id} value={sector.id}>
              {sector.name}
            </option>
          ))}
        </SelectField>
      ) : null}
      <TextField
        label="Código de la mesa"
        hint="Corto y visible en la mesa, por ejemplo M1 o T4. No se repite en la sucursal."
        value={code}
        maxLength={TABLE_CODE_MAX}
        onChange={(event) => setCode(event.target.value)}
        {...(errors.code ? { error: errors.code } : {})}
      />
      <TextField
        label="Puestos"
        hint={`Entre ${SEATS_MIN} y ${SEATS_MAX}.`}
        inputMode="numeric"
        value={seats}
        onChange={(event) => setSeats(event.target.value)}
        {...(errors.seats ? { error: errors.seats } : {})}
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
