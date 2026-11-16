import { useCallback, useState, type ReactNode } from 'react';
import { isCurrencyCode, Money, formatMoney } from '@tavelyo/core';
import {
  ActionNotice,
  serverErrorText,
  useServerData,
  type RunCommand,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusChip,
  TavelyoButton,
} from '@tavelyo/design-system';
import { formatRate, minorToInput } from '../application/forms.ts';
import type {
  CatalogAdmin,
  CatalogAdminGateway,
  CategoryAdmin,
  ModifierGroupAdmin,
  ModifierOptionAdmin,
  ProductAdmin,
  TaxRuleAdmin,
} from '../domain/index.ts';
import { CategoryForm, GroupForm, OptionForm, ProductForm, TaxForm } from './forms.tsx';

export interface CatalogAdminPageProps {
  readonly gateway: CatalogAdminGateway;
  readonly tenantId: string;
  /** Moneda de la empresa (la de sus sucursales), para los valores adicionales de las opciones. */
  readonly currency: string;
  /** Propietario con catalog.manage: edita el catálogo de la empresa. Los demás lo consultan. */
  readonly canEditCatalog: boolean;
  /** tenant.settings: crea y edita los impuestos. */
  readonly canEditTaxes: boolean;
  /** Enlace a la carta de la sucursal (disponibilidad, horario y precios). */
  readonly branchLink?: ReactNode;
}

interface Shared {
  readonly gateway: CatalogAdminGateway;
  readonly tenantId: string;
  readonly currency: string;
  readonly run: RunCommand;
  readonly canEdit: boolean;
}

/** Impuestos, categorías, productos, opciones y alérgenos de la empresa (catalog.manage). */
export function CatalogAdminPage(props: CatalogAdminPageProps) {
  const { gateway, tenantId } = props;
  const load = useCallback(() => gateway.catalog(tenantId), [gateway, tenantId]);
  const { state, notice, reload, run } = useServerData<CatalogAdmin>(load);
  const shared: Shared = {
    gateway,
    tenantId,
    currency: props.currency,
    run,
    canEdit: props.canEditCatalog,
  };

  return (
    <div className="tv-page">
      <header className="tv-page__header">
        <div>
          <h1>Carta de la empresa</h1>
          <p className="tv-list__meta">
            Productos, opciones e impuestos comunes a todas las sucursales.
            {props.canEditCatalog ? '' : ' Solo el propietario puede modificarlos.'}
          </p>
        </div>
        {props.branchLink ? <div className="tv-toolbar">{props.branchLink}</div> : null}
      </header>
      <ActionNotice notice={notice} />
      {state.status === 'loading' ? <LoadingState message="Cargando la carta…" /> : null}
      {state.status === 'error' ? (
        <ErrorState
          title="No se pudo cargar la carta"
          description={serverErrorText(state.error)}
          onRetry={reload}
        />
      ) : null}
      {state.status === 'ready' ? (
        <>
          <TaxSection
            taxRules={state.data.taxRules}
            shared={{ ...shared, canEdit: props.canEditTaxes }}
          />
          {props.canEditCatalog ? (
            <Card title="Nueva categoría" headingLevel={2}>
              <CategoryForm
                submitLabel="Agregar categoría"
                onSubmit={(input) =>
                  run(
                    () => gateway.createCategory(tenantId, input),
                    `Categoría «${input.name}» agregada.`,
                  )
                }
              />
            </Card>
          ) : null}
          {state.data.categories.length === 0 ? (
            <EmptyState
              title="Todavía no hay categorías"
              description="Agrega una categoría (por ejemplo, Platos fuertes) y luego sus productos."
            />
          ) : (
            state.data.categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                catalog={state.data}
                shared={shared}
              />
            ))
          )}
        </>
      ) : null}
    </div>
  );
}

function ArchivedChip({ archived, female = false }: { archived: boolean; female?: boolean }) {
  const active = female ? 'Activa' : 'Activo';
  const done = female ? 'Archivada' : 'Archivado';
  return <StatusChip tone={archived ? 'neutral' : 'success'} label={archived ? done : active} />;
}

function TaxSection({
  taxRules,
  shared,
}: {
  readonly taxRules: readonly TaxRuleAdmin[];
  readonly shared: Shared;
}) {
  const { gateway, tenantId, run, canEdit } = shared;
  return (
    <Card title="Impuestos" headingLevel={2}>
      <p className="tv-list__meta">
        Los precios de la carta incluyen el impuesto. La tasa la define la empresa con su contador.
      </p>
      {taxRules.length === 0 ? (
        <p className="tv-list__meta">No hay impuestos: los productos se venden sin impuesto.</p>
      ) : (
        <ul className="tv-list" aria-label="Impuestos">
          {taxRules.map((tax) => (
            <TaxItem key={tax.id} tax={tax} shared={shared} />
          ))}
        </ul>
      )}
      {canEdit ? (
        <fieldset className="tv-fieldset">
          <legend className="tv-fieldset__legend">Nuevo impuesto</legend>
          <TaxForm
            submitLabel="Agregar impuesto"
            onSubmit={(input) =>
              run(
                () => gateway.createTaxRule(tenantId, input),
                `Impuesto «${input.name}» agregado.`,
              )
            }
          />
        </fieldset>
      ) : null}
    </Card>
  );
}

function TaxItem({ tax, shared }: { readonly tax: TaxRuleAdmin; readonly shared: Shared }) {
  const { gateway, tenantId, run, canEdit } = shared;
  const [editing, setEditing] = useState(false);
  return (
    <li className="tv-list__item">
      <div className="tv-list__summary">
        <span className="tv-list__title">{tax.name}</span>
        <span className="tv-list__meta">{formatRate(tax.rateBp)}</span>
        <ArchivedChip archived={tax.archived} />
      </div>
      {editing ? (
        <TaxForm
          initial={tax}
          submitLabel="Guardar impuesto"
          onCancel={() => setEditing(false)}
          onSubmit={async (input) => {
            const accepted = await run(
              () => gateway.updateTaxRule(tenantId, tax.id, { ...input, archived: tax.archived }),
              `Impuesto «${input.name}» guardado. Los pedidos ya revisados conservan su tasa.`,
            );
            if (accepted) setEditing(false);
            return accepted;
          }}
        />
      ) : canEdit ? (
        <div className="tv-toolbar">
          <TavelyoButton variant="secondary" onClick={() => setEditing(true)}>
            Editar impuesto
          </TavelyoButton>
          <TavelyoButton
            variant="secondary"
            onClick={() =>
              void run(
                () =>
                  gateway.updateTaxRule(tenantId, tax.id, {
                    name: tax.name,
                    rateBp: tax.rateBp,
                    archived: !tax.archived,
                  }),
                tax.archived
                  ? `Impuesto «${tax.name}» restaurado.`
                  : `Impuesto «${tax.name}» archivado.`,
              )
            }
          >
            {tax.archived ? 'Restaurar impuesto' : 'Archivar impuesto'}
          </TavelyoButton>
        </div>
      ) : null}
    </li>
  );
}

function CategoryCard({
  category,
  catalog,
  shared,
}: {
  readonly category: CategoryAdmin;
  readonly catalog: CatalogAdmin;
  readonly shared: Shared;
}) {
  const { gateway, tenantId, run, canEdit } = shared;
  const [editing, setEditing] = useState(false);
  const update = (archived: boolean, name = category.name, sort = category.sort) =>
    run(
      () => gateway.updateCategory(tenantId, category.id, { name, sort, archived }),
      archived ? `Categoría «${name}» archivada.` : `Categoría «${name}» guardada.`,
    );
  const activeCategories = catalog.categories.filter((c) => !c.archived);

  return (
    <Card title={category.name} headingLevel={2}>
      <div className="tv-list__summary">
        <ArchivedChip archived={category.archived} female />
        <span className="tv-list__meta">
          {category.products.filter((p) => !p.archived).length} productos activos
        </span>
      </div>
      {canEdit ? (
        editing ? (
          <CategoryForm
            initial={category}
            submitLabel="Guardar categoría"
            onCancel={() => setEditing(false)}
            onSubmit={async (input) => {
              const accepted = await update(category.archived, input.name, input.sort);
              if (accepted) setEditing(false);
              return accepted;
            }}
          />
        ) : (
          <div className="tv-toolbar">
            <TavelyoButton variant="secondary" onClick={() => setEditing(true)}>
              Editar categoría
            </TavelyoButton>
            <TavelyoButton variant="secondary" onClick={() => void update(!category.archived)}>
              {category.archived ? 'Restaurar categoría' : 'Archivar categoría'}
            </TavelyoButton>
          </div>
        )
      ) : null}
      {category.products.length > 0 ? (
        <ul className="tv-list" aria-label={`Productos de ${category.name}`}>
          {category.products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              category={category}
              categories={activeCategories.length > 0 ? activeCategories : [category]}
              taxRules={catalog.taxRules}
              shared={shared}
            />
          ))}
        </ul>
      ) : (
        <p className="tv-list__meta">Esta categoría todavía no tiene productos.</p>
      )}
      {canEdit && !category.archived ? (
        <fieldset className="tv-fieldset">
          <legend className="tv-fieldset__legend">Nuevo producto en {category.name}</legend>
          <ProductForm
            initial={{
              categoryId: category.id,
              taxRuleId: catalog.taxRules.find((tax) => !tax.archived)?.id ?? null,
              name: '',
              description: null,
              allergens: [],
              sort: 0,
            }}
            categories={[category]}
            taxRules={catalog.taxRules}
            submitLabel="Agregar producto"
            onSubmit={(input) =>
              run(
                () => gateway.createProduct(tenantId, input),
                `Producto «${input.name}» agregado.`,
              )
            }
          />
        </fieldset>
      ) : null}
    </Card>
  );
}

function ProductItem({
  product,
  category,
  categories,
  taxRules,
  shared,
}: {
  readonly product: ProductAdmin;
  readonly category: CategoryAdmin;
  readonly categories: readonly CategoryAdmin[];
  readonly taxRules: readonly TaxRuleAdmin[];
  readonly shared: Shared;
}) {
  const { gateway, tenantId, run, canEdit } = shared;
  const [mode, setMode] = useState<'idle' | 'editing' | 'options'>('idle');
  const tax = taxRules.find((t) => t.id === product.taxRuleId);
  const input = {
    categoryId: category.id,
    taxRuleId: product.taxRuleId,
    name: product.name,
    description: product.description,
    allergens: product.allergens,
    sort: product.sort,
  };

  return (
    <li className="tv-list__item">
      <div className="tv-list__summary">
        <span className="tv-list__title">{product.name}</span>
        <ArchivedChip archived={product.archived} />
        <span className="tv-list__meta">
          {tax ? `${tax.name} ${formatRate(tax.rateBp)} incluido` : 'Sin impuesto'}
        </span>
      </div>
      {product.description ? <p>{product.description}</p> : null}
      <p className="tv-list__meta">
        {product.allergens.length > 0
          ? `Alérgenos declarados: ${product.allergens.join(', ')}`
          : 'Sin alérgenos declarados'}
      </p>
      {mode === 'editing' ? (
        <ProductForm
          initial={input}
          categories={categories}
          taxRules={taxRules}
          submitLabel="Guardar producto"
          onCancel={() => setMode('idle')}
          onSubmit={async (next) => {
            const accepted = await run(
              () =>
                gateway.updateProduct(tenantId, product.id, {
                  ...next,
                  archived: product.archived,
                }),
              `Producto «${next.name}» guardado.`,
            );
            if (accepted) setMode('idle');
            return accepted;
          }}
        />
      ) : (
        <div className="tv-toolbar">
          <TavelyoButton
            variant="secondary"
            aria-expanded={mode === 'options'}
            onClick={() => setMode(mode === 'options' ? 'idle' : 'options')}
          >
            {mode === 'options' ? 'Ocultar opciones' : `Opciones (${product.groups.length})`}
          </TavelyoButton>
          {canEdit ? (
            <>
              <TavelyoButton variant="secondary" onClick={() => setMode('editing')}>
                Editar producto
              </TavelyoButton>
              <TavelyoButton
                variant="secondary"
                onClick={() =>
                  void run(
                    () =>
                      gateway.updateProduct(tenantId, product.id, {
                        ...input,
                        archived: !product.archived,
                      }),
                    product.archived
                      ? `Producto «${product.name}» restaurado.`
                      : `Producto «${product.name}» archivado: ya no aparece en la carta.`,
                  )
                }
              >
                {product.archived ? 'Restaurar producto' : 'Archivar producto'}
              </TavelyoButton>
            </>
          ) : null}
        </div>
      )}
      {mode === 'options' ? <ModifierEditor product={product} shared={shared} /> : null}
    </li>
  );
}

function selectionText(group: ModifierGroupAdmin): string {
  if (group.minSelect === 0) return `Opcional, hasta ${group.maxSelect}`;
  if (group.minSelect === group.maxSelect) return `Elige ${group.minSelect}`;
  return `Elige entre ${group.minSelect} y ${group.maxSelect}`;
}

function priceText(priceDeltaMinor: string, currency: string): string {
  if (priceDeltaMinor === '0' || !isCurrencyCode(currency)) return 'Sin costo adicional';
  const money = Money.fromMinorString(priceDeltaMinor, currency);
  return money.ok ? `+ ${formatMoney(money.value)}` : 'Valor no válido';
}

function ModifierEditor({
  product,
  shared,
}: {
  readonly product: ProductAdmin;
  readonly shared: Shared;
}) {
  const { gateway, tenantId, run, canEdit } = shared;
  return (
    <div className="tv-fieldset">
      <p className="tv-fieldset__legend">Opciones de {product.name}</p>
      {product.groups.length === 0 ? (
        <p className="tv-list__meta">Este producto no tiene opciones.</p>
      ) : (
        <ul className="tv-list" aria-label={`Grupos de opciones de ${product.name}`}>
          {product.groups.map((group) => (
            <GroupItem key={group.id} group={group} shared={shared} />
          ))}
        </ul>
      )}
      {canEdit && !product.archived ? (
        <fieldset className="tv-fieldset">
          <legend className="tv-fieldset__legend">Nuevo grupo de opciones</legend>
          <GroupForm
            submitLabel="Agregar grupo"
            onSubmit={(input) =>
              run(
                () => gateway.createModifierGroup(tenantId, product.id, input),
                `Grupo «${input.name}» agregado.`,
              )
            }
          />
        </fieldset>
      ) : null}
    </div>
  );
}

function GroupItem({
  group,
  shared,
}: {
  readonly group: ModifierGroupAdmin;
  readonly shared: Shared;
}) {
  const { gateway, tenantId, run, canEdit, currency } = shared;
  const [editing, setEditing] = useState(false);
  const base = {
    name: group.name,
    minSelect: group.minSelect,
    maxSelect: group.maxSelect,
    sort: group.sort,
  };
  return (
    <li className="tv-list__item">
      <div className="tv-list__summary">
        <span className="tv-list__title">{group.name}</span>
        <span className="tv-list__meta">{selectionText(group)}</span>
        <ArchivedChip archived={group.archived} />
      </div>
      {canEdit ? (
        editing ? (
          <GroupForm
            initial={base}
            submitLabel="Guardar grupo"
            onCancel={() => setEditing(false)}
            onSubmit={async (input) => {
              const accepted = await run(
                () =>
                  gateway.updateModifierGroup(tenantId, group.id, {
                    ...input,
                    archived: group.archived,
                  }),
                `Grupo «${input.name}» guardado.`,
              );
              if (accepted) setEditing(false);
              return accepted;
            }}
          />
        ) : (
          <div className="tv-toolbar">
            <TavelyoButton variant="secondary" onClick={() => setEditing(true)}>
              Editar grupo
            </TavelyoButton>
            <TavelyoButton
              variant="secondary"
              onClick={() =>
                void run(
                  () =>
                    gateway.updateModifierGroup(tenantId, group.id, {
                      ...base,
                      archived: !group.archived,
                    }),
                  group.archived
                    ? `Grupo «${group.name}» restaurado.`
                    : `Grupo «${group.name}» archivado.`,
                )
              }
            >
              {group.archived ? 'Restaurar grupo' : 'Archivar grupo'}
            </TavelyoButton>
          </div>
        )
      ) : null}
      <ul className="tv-list" aria-label={`Opciones de ${group.name}`}>
        {group.options.map((option) => (
          <OptionItem key={option.id} option={option} shared={shared} />
        ))}
      </ul>
      {canEdit && !group.archived ? (
        <fieldset className="tv-fieldset">
          <legend className="tv-fieldset__legend">Nueva opción en {group.name}</legend>
          <OptionForm
            currency={currency}
            submitLabel="Agregar opción"
            onSubmit={(input) =>
              run(
                () => gateway.createModifierOption(tenantId, group.id, input),
                `Opción «${input.name}» agregada.`,
              )
            }
          />
        </fieldset>
      ) : null}
    </li>
  );
}

function OptionItem({
  option,
  shared,
}: {
  readonly option: ModifierOptionAdmin;
  readonly shared: Shared;
}) {
  const { gateway, tenantId, run, canEdit, currency } = shared;
  const [editing, setEditing] = useState(false);
  const priceInput = minorToInput(option.priceDeltaMinor, currency);
  return (
    <li className="tv-list__item">
      <div className="tv-list__summary">
        <span className="tv-list__title">{option.name}</span>
        <span className="tv-list__meta">{priceText(option.priceDeltaMinor, currency)}</span>
        <ArchivedChip archived={option.archived} female />
      </div>
      {canEdit ? (
        editing ? (
          <OptionForm
            currency={currency}
            initial={{ name: option.name, price: priceInput, sort: option.sort }}
            submitLabel="Guardar opción"
            onCancel={() => setEditing(false)}
            onSubmit={async (input) => {
              const accepted = await run(
                () =>
                  gateway.updateModifierOption(tenantId, option.id, {
                    ...input,
                    archived: option.archived,
                  }),
                `Opción «${input.name}» guardada.`,
              );
              if (accepted) setEditing(false);
              return accepted;
            }}
          />
        ) : (
          <div className="tv-toolbar">
            <TavelyoButton variant="secondary" onClick={() => setEditing(true)}>
              Editar opción
            </TavelyoButton>
            <TavelyoButton
              variant="secondary"
              onClick={() =>
                void run(
                  () =>
                    gateway.updateModifierOption(tenantId, option.id, {
                      name: option.name,
                      priceDeltaMinor: option.priceDeltaMinor,
                      sort: option.sort,
                      archived: !option.archived,
                    }),
                  option.archived
                    ? `Opción «${option.name}» restaurada.`
                    : `Opción «${option.name}» archivada.`,
                )
              }
            >
              {option.archived ? 'Restaurar opción' : 'Archivar opción'}
            </TavelyoButton>
          </div>
        )
      ) : null}
    </li>
  );
}
