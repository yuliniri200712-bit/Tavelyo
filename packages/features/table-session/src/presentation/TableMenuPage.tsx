import { useState, type ReactNode } from 'react';
import { formatMoney } from '@tavelyo/core';
import { cartTotal, itemCount, ProductConfigurator, type ProductChoice } from '@tavelyo/cart';
import {
  ActionBar,
  ActionNotice,
  EmptyState,
  FilterPills,
  Icon,
  ProductCard,
  SearchField,
  TavelyoButton,
} from '@tavelyo/design-system';
import {
  describeOffering,
  filterMenuSections,
  menuSections,
  type MenuSection,
} from '../application/menu.ts';
import { formatMinor } from '../application/review-text.ts';
import type { MenuProduct } from '../domain/index.ts';
import { MenuGate } from './MenuGate.tsx';
import { useTableOrder } from './TableOrderProvider.tsx';

export interface TableMenuPageProps {
  /** Enlace a la pantalla del pedido con el texto dado (la navegación es de la app). */
  readonly orderLink: (label: string) => ReactNode;
  /** Enlace a «Mis pedidos», donde también se llama al mesero y se pide la cuenta. */
  readonly myOrdersLink: ReactNode;
}

const ALL = 'todas';

/** Carta de la mesa del QR: cualquiera la ve; para pedir hay que unirse a la mesa abierta. */
export function TableMenuPage({ orderLink, myOrdersLink }: TableMenuPageProps) {
  const { cart, now } = useTableOrder();
  const [notice, setNotice] = useState<{ tone: 'success'; text: string } | null>(null);
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState('');

  return (
    <MenuGate>
      {(menu) => {
        const sections = menuSections(menu, now());
        const shown = filterMenuSections(sections, {
          categoryId: category === ALL ? null : category,
          query,
        });
        const count = itemCount(cart.lines);
        return (
          <div className="tv-page">
            <header className="tv-menu-hero">
              <div className="tv-menu-hero__intro">
                <p className="tv-menu-hero__eyebrow">Nuestra carta</p>
                <h1>{menu.branchName}</h1>
                <span className="tv-menu-hero__table">
                  <Icon name="freeTable" />
                  Mesa {menu.tableCode}
                </span>
              </div>
              <div className="tv-toolbar">{myOrdersLink}</div>
            </header>
            <ActionNotice notice={notice} />
            {sections.length === 0 ? (
              <EmptyState
                title="La carta no tiene productos disponibles"
                description="Pregúntale al mesero qué puedes pedir."
              />
            ) : (
              <div className="tv-menu-tools">
                <SearchField
                  label="Buscar en la carta"
                  placeholder="Platos o ingredientes"
                  value={query}
                  onChange={setQuery}
                />
                {sections.length > 1 ? (
                  <FilterPills
                    label="Categorías de la carta"
                    value={category}
                    onChange={setCategory}
                    options={[
                      { value: ALL, label: 'Todas' },
                      ...sections.map((section) => ({
                        value: section.id,
                        label: section.name,
                        count: section.products.length,
                      })),
                    ]}
                  />
                ) : null}
              </div>
            )}
            <p className="tv-callout tv-callout--muted">
              <Icon name="info" />
              <span>
                Los precios incluyen impuestos. Los alérgenos los declara el restaurante y no
                garantizan que un plato no tenga trazas: si tienes una alergia, avísale al mesero.
              </span>
            </p>
            {sections.length > 0 && shown.length === 0 ? (
              <EmptyState
                title="No encontramos platos con esa búsqueda"
                description="Prueba con otra palabra o mira todas las categorías."
              />
            ) : null}
            {shown.map((section) => (
              <MenuSectionView
                key={section.id}
                section={section}
                onAdd={(product, choice) => {
                  const failure = cart.add(product, choice);
                  if (!failure) {
                    const quantity = Math.max(1, choice.quantity);
                    setNotice({
                      tone: 'success',
                      text: `Agregaste ${quantity} × ${product.name} a tu pedido.`,
                    });
                  }
                  return failure;
                }}
              />
            ))}
            {count > 0 ? (
              <ActionBar label="Tu pedido">
                {orderLink(
                  `Ver mi pedido · ${count} ${count === 1 ? 'producto' : 'productos'} · ${formatMoney(cartTotal(cart.lines, menu.currency))}`,
                )}
              </ActionBar>
            ) : null}
          </div>
        );
      }}
    </MenuGate>
  );
}

function MenuSectionView({
  section,
  onAdd,
}: {
  readonly section: MenuSection;
  readonly onAdd: (product: MenuProduct, choice: ProductChoice) => string | null;
}) {
  const headingId = `categoria-${section.id}`;
  return (
    <section className="tv-menu-section" aria-labelledby={headingId}>
      <h2 id={headingId}>{section.name}</h2>
      <ul className="tv-product-grid" aria-label={section.name}>
        {section.products.map(({ product, availableNow }) => (
          <li key={product.id}>
            <MenuItem
              product={product}
              availableNow={availableNow}
              onAdd={(choice) => onAdd(product, choice)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

interface MenuItemProps {
  readonly product: MenuProduct;
  readonly availableNow: boolean;
  readonly onAdd: (choice: ProductChoice) => string | null;
}

function MenuItem({ product, availableNow, onAdd }: MenuItemProps) {
  const [choosing, setChoosing] = useState(false);
  const unavailable = availableNow
    ? undefined
    : ['No disponible ahora.', product.schedule ? `${describeOffering(product.schedule)}.` : null]
        .filter(Boolean)
        .join(' ');

  return (
    <ProductCard
      name={product.name}
      description={product.description ?? undefined}
      price={formatMinor(product.priceMinor, product.currency)}
      allergens={
        product.allergens.length > 0
          ? `Alérgenos declarados: ${product.allergens.join(', ')}`
          : undefined
      }
      unavailable={unavailable}
      action={
        availableNow && !choosing ? (
          <TavelyoButton
            variant="secondary"
            aria-label={`Agregar ${product.name}`}
            onClick={() => setChoosing(true)}
          >
            <Icon name="add" />
            Agregar
          </TavelyoButton>
        ) : undefined
      }
    >
      {availableNow && choosing ? (
        <ProductConfigurator
          product={product}
          onCancel={() => setChoosing(false)}
          onAdd={(choice) => {
            const failure = onAdd(choice);
            if (!failure) setChoosing(false);
            return failure;
          }}
        />
      ) : null}
    </ProductCard>
  );
}
