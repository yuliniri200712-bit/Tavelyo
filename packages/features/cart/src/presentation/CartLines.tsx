import { formatMoney } from '@tavelyo/core';
import { TavelyoButton } from '@tavelyo/design-system';
import { lineTotal } from '../application/cart.ts';
import type { CartLine } from '../domain/index.ts';
import { QuantityStepper } from './QuantityStepper.tsx';

export interface CartLinesProps {
  readonly lines: readonly CartLine[];
  readonly onQuantity: (key: string, quantity: number) => void;
  readonly onRemove: (key: string) => void;
}

export function describeOptions(line: CartLine): string {
  return line.options.map((option) => option.name).join(', ');
}

/** Líneas del carrito con su cantidad, opciones, nota e importe estimado. */
export function CartLines({ lines, onQuantity, onRemove }: CartLinesProps) {
  return (
    <ul className="tv-list" aria-label="Productos de tu pedido">
      {lines.map((line) => (
        <li key={line.key} className="tv-list__item">
          <div className="tv-list__summary">
            <span className="tv-list__title">{line.productName}</span>
            <span className="tv-list__meta">{formatMoney(lineTotal(line))}</span>
          </div>
          {line.options.length > 0 ? (
            <p className="tv-list__meta">{describeOptions(line)}</p>
          ) : null}
          {line.note ? <p className="tv-list__meta">Nota: {line.note}</p> : null}
          <div className="tv-toolbar">
            <QuantityStepper
              value={line.quantity}
              itemName={line.productName}
              onChange={(quantity) => onQuantity(line.key, quantity)}
            />
            <TavelyoButton
              variant="secondary"
              aria-label={`Quitar ${line.productName} del pedido`}
              onClick={() => onRemove(line.key)}
            >
              Quitar
            </TavelyoButton>
          </div>
        </li>
      ))}
    </ul>
  );
}
