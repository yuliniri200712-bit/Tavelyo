import { Icon, type IconName } from './Icon.tsx';
import { classNames } from './class-names.ts';

export interface FilterOption<V extends string> {
  readonly value: V;
  readonly label: string;
  /** Cuántos elementos hay con este filtro; se lee junto al nombre («Recibidas 3»). */
  readonly count?: number;
  readonly icon?: IconName;
}

export interface FilterPillsProps<V extends string> {
  /** Nombre del grupo para los lectores de pantalla, p. ej. «Filtrar por estado». */
  readonly label: string;
  readonly options: readonly FilterOption<V>[];
  readonly value: V;
  readonly onChange: (value: V) => void;
}

/**
 * Filtros o pestañas en píldora con contador (referencias de la Fase 3B). Cada opción es un botón
 * con `aria-pressed`: la seleccionada se distingue por el relleno y por el estado anunciado.
 */
export function FilterPills<V extends string>({
  label,
  options,
  value,
  onChange,
}: FilterPillsProps<V>) {
  return (
    <div className="tv-pills" role="group" aria-label={label}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={classNames('tv-pills__option', selected && 'tv-pills__option--selected')}
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
          >
            {option.icon ? <Icon name={option.icon} /> : null}
            <span>{option.label}</span>
            {option.count === undefined ? null : (
              <>
                {/* Espacio para que se lea «Recibidas 3» y no «Recibidas3». */}{' '}
                <span className="tv-pills__count tv-tabular">{option.count}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
