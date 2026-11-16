import { useId, useState, type FormEvent } from 'react';
import { formatMoney } from '@tavelyo/core';
import { ORDER_LIMITS } from '@tavelyo/contracts';
import { CheckboxField, RadioField, TavelyoButton, TextAreaField } from '@tavelyo/design-system';
import {
  describeGroupRule,
  isSingleChoice,
  selectedOptions,
  toggleOption,
  validateSelection,
} from '../application/selection.ts';
import { minorAmount as minor } from '../application/amount.ts';
import type { CartOption, CartProduct } from '../domain/index.ts';
import { QuantityStepper } from './QuantityStepper.tsx';

export interface ProductChoice {
  readonly options: readonly CartOption[];
  readonly quantity: number;
  readonly note: string;
}

export interface ProductConfiguratorProps {
  readonly product: CartProduct;
  /** Devuelve null si se agregó, o el motivo si no se pudo. */
  readonly onAdd: (choice: ProductChoice) => string | null;
  readonly onCancel: () => void;
}

/** Opciones, cantidad y nota de un producto antes de agregarlo al carrito. */
export function ProductConfigurator({ product, onAdd, onCancel }: ProductConfiguratorProps) {
  const formId = useId();
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const errors = validateSelection(product.groups, selected);
  const shownErrors = submitted ? errors : {};

  const options = selectedOptions(product.groups, selected);
  const unit = options.reduce(
    (sum, option) => sum.plus(minor(option.priceDeltaMinor, product.currency)),
    minor(product.priceMinor, product.currency),
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    setFailure(onAdd({ options, quantity, note }));
  };

  return (
    <form className="tv-form" onSubmit={submit} noValidate aria-label={`Elegir ${product.name}`}>
      {product.groups.map((group) => {
        const errorId = `${formId}-${group.id}-error`;
        const error = shownErrors[group.id];
        const Field = isSingleChoice(group) ? RadioField : CheckboxField;
        return (
          <fieldset
            key={group.id}
            className="tv-fieldset"
            aria-describedby={error ? errorId : undefined}
          >
            <legend className="tv-fieldset__legend">
              {group.name} · {describeGroupRule(group)}
            </legend>
            {group.options.map((option) => {
              const delta = minor(option.priceDeltaMinor, product.currency);
              return (
                <Field
                  key={option.id}
                  name={`${formId}-${group.id}`}
                  label={delta.isZero() ? option.name : `${option.name} + ${formatMoney(delta)}`}
                  checked={selected.has(option.id)}
                  onChange={() => setSelected(toggleOption(group, selected, option.id))}
                />
              );
            })}
            {error ? (
              <p id={errorId} className="tv-field__error">
                {error}
              </p>
            ) : null}
          </fieldset>
        );
      })}
      <div className="tv-field">
        <span className="tv-field__label">Cantidad</span>
        <QuantityStepper value={quantity} onChange={setQuantity} itemName={product.name} />
      </div>
      <TextAreaField
        label="Nota para la cocina (opcional)"
        hint="Por ejemplo: sin cebolla. Si tienes una alergia, avísale también al mesero."
        maxLength={ORDER_LIMITS.maxNoteLength}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      {failure ? <p className="tv-form__error">{failure}</p> : null}
      <div className="tv-toolbar">
        <TavelyoButton type="submit">
          Agregar al pedido · {formatMoney(unit.times(quantity))}
        </TavelyoButton>
        <TavelyoButton variant="secondary" onClick={onCancel}>
          Cancelar
        </TavelyoButton>
      </div>
    </form>
  );
}
