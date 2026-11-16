import { useId, type TextareaHTMLAttributes } from 'react';
import { classNames } from './class-names.ts';

export interface TextAreaFieldProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'id'
> {
  /** Etiqueta visible y persistente. */
  readonly label: string;
  readonly hint?: string;
  readonly error?: string;
}

/** Texto de varias líneas (descripciones, notas) con la misma estructura que TextField. */
export function TextAreaField({
  label,
  hint,
  error,
  className,
  ...textareaProps
}: TextAreaFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={classNames('tv-field', className)}>
      <label className="tv-field__label" htmlFor={id}>
        {label}
      </label>
      <textarea
        {...textareaProps}
        id={id}
        className="tv-field__input tv-field__input--multiline"
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
