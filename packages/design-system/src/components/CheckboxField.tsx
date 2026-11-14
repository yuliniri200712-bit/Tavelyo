import { useId, type InputHTMLAttributes } from 'react';
import { classNames } from './class-names.ts';

export interface CheckboxFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'type'
> {
  /** Etiqueta visible; toda la fila (casilla y etiqueta) es el área táctil de 48 px. */
  readonly label: string;
  /** Explica el efecto de marcarla o desmarcarla. */
  readonly hint?: string;
}

/** Casilla de verificación nativa: teclado, lector de pantalla y foco del navegador. */
export function CheckboxField({ label, hint, className, ...inputProps }: CheckboxFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className={classNames('tv-check', className)}>
      <input
        {...inputProps}
        id={id}
        type="checkbox"
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
