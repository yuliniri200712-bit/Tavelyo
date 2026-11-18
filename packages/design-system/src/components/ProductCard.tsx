import type { ReactNode } from 'react';

export interface ProductCardProps {
  readonly name: string;
  readonly headingLevel?: 2 | 3;
  readonly description?: string;
  /** Precio ya formateado (`formatMoney` de `core`). */
  readonly price: string;
  /** Texto completo de alérgenos, p. ej. «Alérgenos declarados: huevo». */
  readonly allergens?: string;
  /** Motivo por el que no se puede pedir ahora, p. ej. «Disponible desde las 12:00». */
  readonly unavailable?: string;
  /** Acción principal (p. ej. el botón «Agregar»). */
  readonly action?: ReactNode;
}

/**
 * Tarjeta de producto de la carta. Sin foto por ahora (D-22): el diseño deja el precio y la acción
 * abajo, de modo que una foto futura se añade arriba sin mover lo demás.
 */
export function ProductCard({
  name,
  headingLevel = 3,
  description,
  price,
  allergens,
  unavailable,
  action,
}: ProductCardProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="tv-product">
      <div className="tv-product__body">
        <Heading className="tv-product__name">{name}</Heading>
        {description ? <p className="tv-product__description">{description}</p> : null}
        {allergens ? <p className="tv-product__allergens">{allergens}</p> : null}
        {unavailable ? <p className="tv-product__unavailable">{unavailable}</p> : null}
      </div>
      <div className="tv-product__footer">
        <span className="tv-product__price tv-tabular">{price}</span>
        {action}
      </div>
    </article>
  );
}
