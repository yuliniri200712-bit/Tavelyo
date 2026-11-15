import { useId, type SelectHTMLAttributes } from 'react';
import { classNames } from './class-names.ts';

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  /** Etiqueta visible y persistente. */
  readonly label: string;
  readonly hint?: string;
  readonly error?: string;
}

/** Lista desplegable nativa: teclado, lector de pantalla y selector del sistema en el teléfono. */
export function SelectField({
  label,
  hint,
  error,
  className,
  children,
  ...selectProps
}: SelectFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={classNames('tv-field', className)}>
      <label className="tv-field__label" htmlFor={id}>
        {label}
      </label>
      <select
        {...selectProps}
        id={id}
        className="tv-field__input tv-field__input--select"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      >
        {children}
      </select>
      {hint ? (
        <p id={hintId} className="tv-field__hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="tv-field__error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
