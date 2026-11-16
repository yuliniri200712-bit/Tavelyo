import type { CartOption, CartOptionGroup } from '../domain/index.ts';

/** Qué pide un grupo, en texto para la persona («Elige 1», «Elige hasta 3»). */
export function describeGroupRule(group: CartOptionGroup): string {
  const { minSelect: min, maxSelect: max } = group;
  if (min === max) return min === 1 ? 'Elige 1' : `Elige ${min}`;
  if (min === 0) return max === 1 ? 'Opcional: elige hasta 1' : `Opcional: elige hasta ${max}`;
  return `Elige de ${min} a ${max}`;
}

/**
 * Un grupo obligatorio de exactamente una opción se muestra con botones de radio. Uno opcional de
 * máximo 1 usa casillas (una casilla se puede desmarcar; un radio no).
 */
export function isSingleChoice(group: CartOptionGroup): boolean {
  return group.minSelect === 1 && group.maxSelect === 1;
}

/**
 * Comprueba las elecciones contra el mínimo y el máximo de cada grupo. Devuelve el error de cada
 * grupo que no cumple. Es una ayuda: quoteOrder vuelve a validar las opciones en el servidor.
 */
export function validateSelection(
  groups: readonly CartOptionGroup[],
  selected: ReadonlySet<string>,
): Readonly<Record<string, string>> {
  const errors: Record<string, string> = {};
  for (const group of groups) {
    const count = group.options.filter((option) => selected.has(option.id)).length;
    if (count < group.minSelect) {
      errors[group.id] =
        group.minSelect === 1
          ? `Elige una opción de «${group.name}».`
          : `Elige al menos ${group.minSelect} opciones de «${group.name}».`;
    } else if (count > group.maxSelect) {
      errors[group.id] = `Elige como máximo ${group.maxSelect} de «${group.name}».`;
    }
  }
  return errors;
}

/** Opciones elegidas, en el orden en que aparecen en la carta. */
export function selectedOptions(
  groups: readonly CartOptionGroup[],
  selected: ReadonlySet<string>,
): CartOption[] {
  return groups.flatMap((group) => group.options.filter((option) => selected.has(option.id)));
}

/**
 * Al tocar una opción: en un grupo excluyente reemplaza la elección (y, si el grupo es opcional,
 * tocar la elegida la quita); si no, la alterna.
 */
export function toggleOption(
  group: CartOptionGroup,
  selected: ReadonlySet<string>,
  optionId: string,
): Set<string> {
  const next = new Set(selected);
  if (group.maxSelect === 1) {
    const wasSelected = next.has(optionId);
    for (const option of group.options) next.delete(option.id);
    if (!wasSelected || group.minSelect > 0) next.add(optionId);
    return next;
  }
  if (next.has(optionId)) next.delete(optionId);
  else next.add(optionId);
  return next;
}
