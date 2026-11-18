import { useId } from 'react';
import { Icon } from './Icon.tsx';

export interface SearchFieldProps {
  /** Nombre del campo, p. ej. «Buscar en la carta». Se anuncia siempre; a la vista lo sugiere el icono. */
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  /** Ejemplo visible de qué escribir, p. ej. «Platos o ingredientes». No sustituye a `label`. */
  readonly placeholder?: string;
}

/** Buscador con icono. Filtra lo que ya está en pantalla; no llama al servidor. */
export function SearchField({ label, value, onChange, placeholder }: SearchFieldProps) {
  const id = useId();
  return (
    <div className="tv-search">
      <label className="tv-visually-hidden" htmlFor={id}>
        {label}
      </label>
      <Icon name="search" className="tv-search__icon" />
      <input
        id={id}
        className="tv-search__input"
        type="search"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
