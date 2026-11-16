import { ORDER_LIMITS } from '@tavelyo/contracts';
import { TavelyoButton } from '@tavelyo/design-system';

export interface QuantityStepperProps {
  readonly value: number;
  readonly onChange: (value: number) => void;
  /** Qué se cuenta, para los nombres accesibles («Hamburguesa»). */
  readonly itemName: string;
}

/** Cantidad con botones de 48 px; el valor se anuncia al cambiar. */
export function QuantityStepper({ value, onChange, itemName }: QuantityStepperProps) {
  return (
    <div className="tv-toolbar" role="group" aria-label={`Cantidad de ${itemName}`}>
      <TavelyoButton
        variant="secondary"
        aria-label={`Quitar una unidad de ${itemName}`}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        −
      </TavelyoButton>
      <output className="tv-list__title" aria-live="polite">
        {value}
      </output>
      <TavelyoButton
        variant="secondary"
        aria-label={`Agregar una unidad de ${itemName}`}
        disabled={value >= ORDER_LIMITS.maxQuantity}
        onClick={() => onChange(value + 1)}
      >
        +
      </TavelyoButton>
    </div>
  );
}
