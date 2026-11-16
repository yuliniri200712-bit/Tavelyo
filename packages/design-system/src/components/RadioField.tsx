import { useId, type InputHTMLAttributes } from 'react';
import { classNames } from './class-names.ts';

export interface RadioFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'type'
> {
  /** Etiqueta visible; toda la fila es el área táctil de 48 px, como en CheckboxField. */
  readonly label: string;
  readonly hint?: string;
}

/**
 * Botón de radio nativo para elegir una sola opción de un grupo. Los radios del mismo grupo
 * comparten `name` y van dentro de un fieldset con su leyenda.
 */
export function RadioField({ label, hint, className, ...inputProps }: RadioFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className={classNames('tv-check', className)}>
      <input
        {...inputProps}
        id={id}
        type="radio"
        className="tv-check__input"
        aria-describedby={hintId}
      />
      <label className="tv-check__label" htmlFor={id}>
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="tv-check__hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
