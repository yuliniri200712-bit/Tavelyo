import { useState, type FormEvent, type ReactNode } from 'react';
import type { Result } from '@tavelyo/core';
import {
  CheckboxField,
  SelectField,
  TavelyoButton,
  TextAreaField,
  TextField,
} from '@tavelyo/design-system';
import {
  DESCRIPTION_MAX,
  formatRate,
  NAME_MAX,
  parseCategoryForm,
  parseGroupForm,
  parseOptionForm,
  parseProductForm,
  parseTaxForm,
  PRODUCT_NAME_MAX,
  WEEKDAYS,
  type FieldErrors,
  type ScheduleForm,
} from '../application/forms.ts';
import type {
  CategoryAdmin,
  CategoryInput,
  ModifierGroupInput,
  ModifierOptionInput,
  ProductInput,
  TaxRuleAdmin,
  TaxRuleInput,
} from '../domain/index.ts';

interface FormActions<T> {
  readonly submitLabel: string;
  /** Devuelve true si el servidor aceptó el cambio (entonces el formulario se vacía o se cierra). */
  readonly onSubmit: (input: T) => Promise<boolean>;
  readonly onCancel?: () => void;
}

/**
 * Envío común: valida en el cliente, muestra los errores por campo, evita el doble envío y, si el
 * formulario es de alta (sin «Cancelar»), lo vacía cuando el servidor acepta.
 */
function useFormSubmit<T, K extends string>(
  parse: () => Result<T, FieldErrors<K>>,
  { onSubmit, onCancel }: FormActions<T>,
  reset: () => void,
) {
  const [errors, setErrors] = useState<FieldErrors<K>>({});
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = parse();
    if (!parsed.ok) {
      setErrors(parsed.error);
      return;
    }
    setErrors({});
    setBusy(true);
    const accepted = await onSubmit(parsed.value);
    setBusy(false);
    if (accepted && !onCancel) reset();
  };
  const error = (key: K) => (errors[key] ? { error: errors[key] } : {});
  return { busy, error, submit };
}

function FormShell({
  busy,
  submitLabel,
  onCancel,
  onSubmit,
  children,
}: {
  readonly busy: boolean;
  readonly submitLabel: string;
  readonly onCancel: (() => void) | undefined;
  readonly onSubmit: (event: FormEvent) => Promise<void>;
  readonly children: ReactNode;
}) {
  return (
    <form className="tv-form" onSubmit={(event) => void onSubmit(event)} noValidate>
      {children}
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

export function TaxForm(props: FormActions<TaxRuleInput> & { readonly initial?: TaxRuleInput }) {
  const initial = props.initial ?? { name: '', rateBp: 0 };
  const [name, setName] = useState(initial.name);
  const [rate, setRate] = useState(
    props.initial ? formatRate(initial.rateBp).replace(' %', '') : '',
  );
  const form = useFormSubmit(
    () => parseTaxForm({ name, rate }),
    props,
    () => {
      setName('');
      setRate('');
    },
  );
  return (
    <FormShell
      busy={form.busy}
      onSubmit={form.submit}
      submitLabel={props.submitLabel}
      onCancel={props.onCancel}
    >
      <TextField
        label="Nombre del impuesto"
        hint="Como lo nombra tu contador: Impoconsumo, IVA, Exento…"
        value={name}
        maxLength={NAME_MAX}
        onChange={(event) => setName(event.target.value)}
        {...form.error('name')}
      />
      <TextField
        label="Tasa (%)"
        hint="Incluida en el precio. Por ejemplo, 8 para el impoconsumo o 0 si no aplica."
        inputMode="decimal"
        value={rate}
        onChange={(event) => setRate(event.target.value)}
        {...form.error('rate')}
      />
    </FormShell>
  );
}

export function CategoryForm(
  props: FormActions<CategoryInput> & { readonly initial?: CategoryInput },
) {
  const initial = props.initial ?? { name: '', sort: 0 };
  const [name, setName] = useState(initial.name);
  const [sort, setSort] = useState(String(initial.sort));
  const form = useFormSubmit(
    () => parseCategoryForm({ name, sort }),
    props,
    () => {
      setName('');
      setSort('0');
    },
  );
  return (
    <FormShell
      busy={form.busy}
      onSubmit={form.submit}
      submitLabel={props.submitLabel}
      onCancel={props.onCancel}
    >
      <TextField
        label="Nombre de la categoría"
        hint="Por ejemplo: Entradas, Platos fuertes o Bebidas."
        value={name}
        maxLength={NAME_MAX}
        onChange={(event) => setName(event.target.value)}
        {...form.error('name')}
      />
      <TextField
        label="Orden en la carta"
        inputMode="numeric"
        value={sort}
        onChange={(event) => setSort(event.target.value)}
        {...form.error('sort')}
      />
    </FormShell>
  );
}

export function ProductForm(
  props: FormActions<ProductInput> & {
    readonly initial: ProductInput;
    readonly categories: readonly CategoryAdmin[];
    readonly taxRules: readonly TaxRuleAdmin[];
  },
) {
  const { initial } = props;
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [taxRuleId, setTaxRuleId] = useState(initial.taxRuleId ?? '');
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description ?? '');
  const [allergens, setAllergens] = useState(initial.allergens.join(', '));
  const [sort, setSort] = useState(String(initial.sort));
  const form = useFormSubmit(
    () => parseProductForm({ categoryId, taxRuleId, name, description, allergens, sort }),
    props,
    () => {
      setName('');
      setDescription('');
      setAllergens('');
      setSort('0');
    },
  );
  const activeTaxes = props.taxRules.filter((tax) => !tax.archived || tax.id === initial.taxRuleId);
  return (
    <FormShell
      busy={form.busy}
      onSubmit={form.submit}
      submitLabel={props.submitLabel}
      onCancel={props.onCancel}
    >
      {props.categories.length > 1 ? (
        <SelectField
          label="Categoría"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          {...form.error('categoryId')}
        >
          {props.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </SelectField>
      ) : null}
      <TextField
        label="Nombre del producto"
        value={name}
        maxLength={PRODUCT_NAME_MAX}
        onChange={(event) => setName(event.target.value)}
        {...form.error('name')}
      />
      <TextAreaField
        label="Descripción (opcional)"
        hint="Lo que verá el cliente en la carta."
        value={description}
        maxLength={DESCRIPTION_MAX}
        onChange={(event) => setDescription(event.target.value)}
        {...form.error('description')}
      />
      <TextField
        label="Alérgenos declarados (opcional)"
        hint="Separados por comas, por ejemplo: huevo, leche, maní. Es información que declara el restaurante; la app no garantiza su ausencia."
        value={allergens}
        onChange={(event) => setAllergens(event.target.value)}
        {...form.error('allergens')}
      />
      <SelectField
        label="Impuesto incluido en el precio"
        value={taxRuleId}
        onChange={(event) => setTaxRuleId(event.target.value)}
      >
        <option value="">Sin impuesto</option>
        {activeTaxes.map((tax) => (
          <option key={tax.id} value={tax.id}>
            {tax.name} ({formatRate(tax.rateBp)})
          </option>
        ))}
      </SelectField>
      <TextField
        label="Orden en la categoría"
        inputMode="numeric"
        value={sort}
        onChange={(event) => setSort(event.target.value)}
        {...form.error('sort')}
      />
    </FormShell>
  );
}

export function GroupForm(
  props: FormActions<ModifierGroupInput> & { readonly initial?: ModifierGroupInput },
) {
  const initial = props.initial ?? { name: '', minSelect: 0, maxSelect: 1, sort: 0 };
  const [name, setName] = useState(initial.name);
  const [minSelect, setMin] = useState(String(initial.minSelect));
  const [maxSelect, setMax] = useState(String(initial.maxSelect));
  const [sort, setSort] = useState(String(initial.sort));
  const form = useFormSubmit(
    () => parseGroupForm({ name, minSelect, maxSelect, sort }),
    props,
    () => {
      setName('');
      setMin('0');
      setMax('1');
      setSort('0');
    },
  );
  return (
    <FormShell
      busy={form.busy}
      onSubmit={form.submit}
      submitLabel={props.submitLabel}
      onCancel={props.onCancel}
    >
      <TextField
        label="Nombre del grupo"
        hint="Por ejemplo: Término de la carne, Acompañamiento o Adiciones."
        value={name}
        maxLength={NAME_MAX}
        onChange={(event) => setName(event.target.value)}
        {...form.error('name')}
      />
      <TextField
        label="Mínimo a elegir"
        hint="0 si es opcional; 1 o más si el cliente debe elegir."
        inputMode="numeric"
        value={minSelect}
        onChange={(event) => setMin(event.target.value)}
        {...form.error('minSelect')}
      />
      <TextField
        label="Máximo a elegir"
        inputMode="numeric"
        value={maxSelect}
        onChange={(event) => setMax(event.target.value)}
        {...form.error('maxSelect')}
      />
      <TextField
        label="Orden"
        inputMode="numeric"
        value={sort}
        onChange={(event) => setSort(event.target.value)}
        {...form.error('sort')}
      />
    </FormShell>
  );
}

export function OptionForm(
  props: FormActions<ModifierOptionInput> & {
    readonly currency: string;
    readonly initial?: { readonly name: string; readonly price: string; readonly sort: number };
  },
) {
  const initial = props.initial ?? { name: '', price: '', sort: 0 };
  const [name, setName] = useState(initial.name);
  const [price, setPrice] = useState(initial.price);
  const [sort, setSort] = useState(String(initial.sort));
  const form = useFormSubmit(
    () => parseOptionForm({ name, price, sort }, props.currency),
    props,
    () => {
      setName('');
      setPrice('');
      setSort('0');
    },
  );
  return (
    <FormShell
      busy={form.busy}
      onSubmit={form.submit}
      submitLabel={props.submitLabel}
      onCancel={props.onCancel}
    >
      <TextField
        label="Nombre de la opción"
        value={name}
        maxLength={NAME_MAX}
        onChange={(event) => setName(event.target.value)}
        {...form.error('name')}
      />
      <TextField
        label="Valor adicional en pesos (opcional)"
        hint="Con impuestos incluidos. Déjalo vacío si no cuesta más."
        inputMode="numeric"
        value={price}
        onChange={(event) => setPrice(event.target.value)}
        {...form.error('price')}
      />
      <TextField
        label="Orden"
        inputMode="numeric"
        value={sort}
        onChange={(event) => setSort(event.target.value)}
        {...form.error('sort')}
      />
    </FormShell>
  );
}

/** Campos del horario: casilla para limitarlo, días de la semana y horas de inicio y fin. */
export function ScheduleFields({
  value,
  onChange,
  error,
}: {
  readonly value: ScheduleForm;
  readonly onChange: (next: ScheduleForm) => void;
  readonly error?: string;
}) {
  return (
    <>
      <CheckboxField
        label="Solo en un horario"
        hint="Sin marcar, el producto se ofrece todo el día, todos los días. El horario es el de la sucursal."
        checked={value.limited}
        onChange={(event) => onChange({ ...value, limited: event.target.checked })}
      />
      {value.limited ? (
        <fieldset className="tv-fieldset">
          <legend className="tv-fieldset__legend">Días y horas</legend>
          {WEEKDAYS.map((day, index) => (
            <CheckboxField
              key={day}
              label={day}
              checked={value.days[index] ?? false}
              onChange={(event) =>
                onChange({
                  ...value,
                  days: value.days.map((on, i) => (i === index ? event.target.checked : on)),
                })
              }
            />
          ))}
          <TextField
            label="Desde"
            type="time"
            value={value.start}
            onChange={(event) => onChange({ ...value, start: event.target.value })}
          />
          <TextField
            label="Hasta"
            type="time"
            hint="Si es anterior a la hora de inicio, el horario termina al día siguiente."
            value={value.end}
            onChange={(event) => onChange({ ...value, end: event.target.value })}
          />
          {error ? <p className="tv-form__error">{error}</p> : null}
        </fieldset>
      ) : null}
    </>
  );
}
