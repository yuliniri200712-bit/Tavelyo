import { useState, type ReactNode } from 'react';
import { formatMoney } from '@tavelyo/core';
import { cartTotal, itemCount, ProductConfigurator, type ProductChoice } from '@tavelyo/cart';
import { ActionNotice, Card, EmptyState, StatusChip, TavelyoButton } from '@tavelyo/design-system';
import { describeOffering, menuSections } from '../application/menu.ts';
import { formatMinor } from '../application/review-text.ts';
import type { MenuProduct } from '../domain/index.ts';
import { MenuGate } from './MenuGate.tsx';
import { useTableOrder } from './TableOrderProvider.tsx';

export interface TableMenuPageProps {
  /** Enlace a la pantalla del pedido con el texto dado (la navegación es de la app). */
  readonly orderLink: (label: string) => ReactNode;
}

/** Carta de la mesa del QR: cualquiera la ve; para pedir hay que unirse a la mesa abierta. */
export function TableMenuPage({ orderLink }: TableMenuPageProps) {
  const { cart, now } = useTableOrder();
  const [notice, setNotice] = useState<{ tone: 'success'; text: string } | null>(null);

  return (
    <MenuGate>
      {(menu) => {
        const sections = menuSections(menu, now());
        const count = itemCount(cart.lines);
        return (
          <div className="tv-page">
            <header className="tv-page__header">
              <div>
                <h1>{menu.branchName}</h1>
                <p className="tv-list__meta">Mesa {menu.tableCode}</p>
              </div>
              {count > 0 ? (
                <div className="tv-toolbar">
                  {orderLink(
                    `Ver mi pedido · ${count} ${count === 1 ? 'producto' : 'productos'} · ${formatMoney(cartTotal(cart.lines, menu.currency))}`,
                  )}
                </div>
              ) : null}
            </header>
            <ActionNotice notice={notice} />
            <p className="tv-list__meta">
              Los precios incluyen impuestos. Los alérgenos los declara el restaurante y no
              garantizan que un plato no tenga trazas: si tienes una alergia, avísale al mesero.
            </p>
            {sections.length === 0 ? (
              <EmptyState
                title="La carta no tiene productos disponibles"
                description="Pregúntale al mesero qué puedes pedir."
              />
            ) : null}
            {sections.map((section) => (
              <Card key={section.id} title={section.name} headingLevel={2}>
                <ul className="tv-list" aria-label={section.name}>
                  {section.products.map(({ product, availableNow }) => (
                    <MenuItem
                      key={product.id}
                      product={product}
                      availableNow={availableNow}
                      onAdd={(choice) => {
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
                </ul>
              </Card>
            ))}
          </div>
        );
      }}
    </MenuGate>
  );
}

interface MenuItemProps {
  readonly product: MenuProduct;
  readonly availableNow: boolean;
  readonly onAdd: (choice: ProductChoice) => string | null;
}

function MenuItem({ product, availableNow, onAdd }: MenuItemProps) {
  const [choosing, setChoosing] = useState(false);

  return (
    <li className="tv-list__item">
      <div className="tv-list__summary">
        <span className="tv-list__title">{product.name}</span>
        <span className="tv-list__meta">{formatMinor(product.priceMinor, product.currency)}</span>
        {availableNow ? null : <StatusChip tone="neutral" label="No disponible ahora" />}
      </div>
      {product.description ? <p>{product.description}</p> : null}
      {product.allergens.length > 0 ? (
        <p className="tv-list__meta">Alérgenos declarados: {product.allergens.join(', ')}</p>
      ) : null}
      {product.schedule && !availableNow ? (
        <p className="tv-list__meta">{describeOffering(product.schedule)}</p>
      ) : null}
      {availableNow && !choosing ? (
        <div className="tv-toolbar">
          <TavelyoButton
            variant="secondary"
            aria-label={`Agregar ${product.name}`}
            onClick={() => setChoosing(true)}
          >
            Agregar
          </TavelyoButton>
        </div>
      ) : null}
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
    </li>
  );
}
