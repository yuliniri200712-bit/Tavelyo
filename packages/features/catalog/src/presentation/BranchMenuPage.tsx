import { useCallback, useState, type FormEvent, type ReactNode } from 'react';
import { formatMoney, isCurrencyCode, Money, ok } from '@tavelyo/core';
import {
  ActionNotice,
  Card,
  CheckboxField,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusChip,
  TavelyoButton,
  TextField,
} from '@tavelyo/design-system';
import {
  describeSchedule,
  parsePriceInput,
  parseScheduleForm,
  scheduleToForm,
} from '../application/forms.ts';
import type {
  BranchProduct,
  BranchScope,
  CatalogAdmin,
  CatalogAdminGateway,
  ProductAdmin,
} from '../domain/index.ts';
import { ScheduleFields } from './forms.tsx';
import { catalogErrorText, useServerData, type Run } from './useServerData.ts';

export interface BranchMenuPageProps {
  readonly gateway: CatalogAdminGateway;
  readonly scope: BranchScope;
  readonly branchName: string;
  /** Moneda de la sucursal: los precios se guardan en ella. */
  readonly currency: string;
  /** catalog.manage: disponibilidad y horario en la sucursal. */
  readonly canManageAvailability: boolean;
  /** price.change: precio en la sucursal. */
  readonly canChangePrice: boolean;
  readonly catalogLink?: ReactNode;
}

interface BranchMenuData {
  readonly catalog: CatalogAdmin;
  readonly branch: ReadonlyMap<string, BranchProduct>;
}

/** Texto del precio guardado, o null si no hay. */
function priceLabel(entry: BranchProduct | undefined): string | null {
  const price = entry?.currentPrice;
  if (!price || !isCurrencyCode(price.currency)) return null;
  const money = Money.fromMinorString(price.amountMinor, price.currency);
  return money.ok ? formatMoney(money.value) : null;
}

/**
 * Productos de la carta en esta sucursal. Un producto aparece en la carta pública solo si está
 * disponible y tiene precio; el servidor vuelve a comprobar todo al revisar el pedido.
 */
export function BranchMenuPage(props: BranchMenuPageProps) {
  const { gateway, scope } = props;
  const { tenantId, branchId } = scope;
  const load = useCallback(async () => {
    const [catalog, branch] = await Promise.all([
      gateway.catalog(tenantId),
      gateway.branchProducts({ tenantId, branchId }),
    ]);
    if (!catalog.ok) return catalog;
    if (!branch.ok) return branch;
    return ok({
      catalog: catalog.value,
      branch: new Map(branch.value.map((entry) => [entry.productId, entry])),
    });
  }, [gateway, tenantId, branchId]);
  const { state, notice, reload, run } = useServerData<BranchMenuData>(load);

  return (
    <div className="tv-page">
      <header className="tv-page__header">
        <div>
          <h1>Carta de la sucursal</h1>
          <p className="tv-list__meta">
            {props.branchName} · Disponibilidad, horario y precio con impuestos incluidos.
          </p>
        </div>
        {props.catalogLink ? <div className="tv-toolbar">{props.catalogLink}</div> : null}
      </header>
      <ActionNotice notice={notice} />
      {state.status === 'loading' ? (
        <LoadingState message="Cargando la carta de la sucursal…" />
      ) : null}
      {state.status === 'error' ? (
        <ErrorState
          title="No se pudo cargar la carta de la sucursal"
          description={catalogErrorText(state.error)}
          onRetry={reload}
        />
      ) : null}
      {state.status === 'ready' ? (
        <BranchCategories data={state.data} props={props} run={run} />
      ) : null}
    </div>
  );
}

function BranchCategories({
  data,
  props,
  run,
}: {
  readonly data: BranchMenuData;
  readonly props: BranchMenuPageProps;
  readonly run: Run;
}) {
  const categories = data.catalog.categories
    .filter((category) => !category.archived)
    .map((category) => ({ ...category, products: category.products.filter((p) => !p.archived) }))
    .filter((category) => category.products.length > 0);
  if (categories.length === 0) {
    return (
      <EmptyState
        title="La carta todavía no tiene productos"
        description="El propietario agrega las categorías y los productos en la carta de la empresa."
      />
    );
  }
  return categories.map((category) => (
    <Card key={category.id} title={category.name} headingLevel={2}>
      <ul className="tv-list" aria-label={`Productos de ${category.name}`}>
        {category.products.map((product) => (
          <BranchProductItem
            key={product.id}
            product={product}
            entry={data.branch.get(product.id)}
            props={props}
            run={run}
          />
        ))}
      </ul>
    </Card>
  ));
}

function stateChip(entry: BranchProduct | undefined, price: string | null) {
  if (!entry) return <StatusChip tone="neutral" label="No está en esta sucursal" />;
  if (!entry.available) return <StatusChip tone="neutral" label="No disponible" />;
  if (!price) return <StatusChip tone="warning" label="Sin precio: no aparece en la carta" />;
  return <StatusChip tone="success" label="En la carta" />;
}

function BranchProductItem({
  product,
  entry,
  props,
  run,
}: {
  readonly product: ProductAdmin;
  readonly entry: BranchProduct | undefined;
  readonly props: BranchMenuPageProps;
  readonly run: Run;
}) {
  const [open, setOpen] = useState(false);
  const price = priceLabel(entry);
  const canEdit = props.canManageAvailability || props.canChangePrice;

  return (
    <li className="tv-list__item">
      <div className="tv-list__summary">
        <span className="tv-list__title">{product.name}</span>
        {stateChip(entry, price)}
      </div>
      <p className="tv-list__meta">
        {price ? `Precio: ${price}` : 'Sin precio'} ·{' '}
        {entry ? describeSchedule(entry.schedule) : 'Sin horario'}
      </p>
      {canEdit ? (
        <TavelyoButton variant="secondary" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? 'Cerrar' : 'Editar en esta sucursal'}
        </TavelyoButton>
      ) : null}
      {open ? (
        <>
          {props.canManageAvailability ? (
            <AvailabilityForm product={product} entry={entry} props={props} run={run} />
          ) : null}
          {props.canChangePrice ? (
            <PriceForm product={product} entry={entry} current={price} props={props} run={run} />
          ) : null}
        </>
      ) : null}
    </li>
  );
}

function AvailabilityForm({
  product,
  entry,
  props,
  run,
}: {
  readonly product: ProductAdmin;
  readonly entry: BranchProduct | undefined;
  readonly props: BranchMenuPageProps;
  readonly run: Run;
}) {
  const [available, setAvailable] = useState(entry?.available ?? true);
  const [schedule, setSchedule] = useState(scheduleToForm(entry?.schedule ?? null));
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseScheduleForm(schedule);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setError(undefined);
    setBusy(true);
    await run(
      () =>
        props.gateway.setAvailability(props.scope, product.id, {
          available,
          schedule: parsed.value,
        }),
      available
        ? `«${product.name}» disponible en ${props.branchName}.`
        : `«${product.name}» no disponible en ${props.branchName}.`,
    );
    setBusy(false);
  };

  return (
    <form className="tv-fieldset" onSubmit={(event) => void submit(event)} noValidate>
      <p className="tv-fieldset__legend">Disponibilidad</p>
      <CheckboxField
        label="Disponible en esta sucursal"
        hint="Desmárcalo cuando se agote: deja de verse en la carta al instante."
        checked={available}
        onChange={(event) => setAvailable(event.target.checked)}
      />
      <ScheduleFields value={schedule} onChange={setSchedule} {...(error ? { error } : {})} />
      <div className="tv-toolbar">
        <TavelyoButton type="submit" loading={busy} loadingLabel="Guardando…">
          Guardar disponibilidad
        </TavelyoButton>
      </div>
    </form>
  );
}

function PriceForm({
  product,
  entry,
  current,
  props,
  run,
}: {
  readonly product: ProductAdmin;
  readonly entry: BranchProduct | undefined;
  readonly current: string | null;
  readonly props: BranchMenuPageProps;
  readonly run: Run;
}) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState<{ minor: string; label: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const review = (event: FormEvent) => {
    event.preventDefault();
    const parsed = parsePriceInput(text, props.currency);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setError(undefined);
    const money = isCurrencyCode(props.currency)
      ? Money.fromMinorString(parsed.value, props.currency)
      : null;
    setPending({ minor: parsed.value, label: money?.ok ? formatMoney(money.value) : text });
  };

  if (!entry) {
    return (
      <p className="tv-list__meta">
        Para ponerle precio, primero guarda la disponibilidad del producto en esta sucursal.
      </p>
    );
  }

  return (
    <form className="tv-fieldset" onSubmit={review} noValidate>
      <p className="tv-fieldset__legend">Precio</p>
      <TextField
        label="Precio nuevo en pesos"
        hint={`Con impuestos incluidos y sin centavos. Precio actual: ${current ?? 'sin precio'}.`}
        inputMode="numeric"
        value={text}
        onChange={(event) => setText(event.target.value)}
        {...(error ? { error } : {})}
      />
      <div className="tv-toolbar">
        <TavelyoButton type="submit">Cambiar precio</TavelyoButton>
      </div>
      <ConfirmDialog
        open={pending !== null}
        title={`¿Cambiar el precio de ${product.name}?`}
        confirmLabel="Cambiar precio"
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return;
          setBusy(true);
          void run(
            () => props.gateway.changePrice(props.scope, product.id, pending.minor, props.currency),
            `Precio de «${product.name}» cambiado a ${pending.label}.`,
          ).then((accepted) => {
            setBusy(false);
            setPending(null);
            if (accepted) setText('');
          });
        }}
      >
        <p>
          {current
            ? `De ${current} a ${pending?.label ?? ''}`
            : `Nuevo precio: ${pending?.label ?? ''}`}{' '}
          en {props.branchName}. Quien tenga el carrito abierto con el precio anterior deberá
          confirmar el importe nuevo antes de pedir.
        </p>
      </ConfirmDialog>
    </form>
  );
}
