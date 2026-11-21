import { useId, type InputHTMLAttributes } from 'react';
import { classNames } from './class-names.ts';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Etiqueta visible y persistente; el placeholder nunca la sustituye (IV §6). */
  readonly label: string;
  readonly hint?: string | undefined;
  readonly error?: string | undefined;
}

export function TextField({ label, hint, error, className, ...inputProps }: TextFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={classNames('tv-field', className)}>
      <label className="tv-field__label" htmlFor={id}>
        {label}
      </label>
      <input
        {...inputProps}
        id={id}
        className="tv-field__input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
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
