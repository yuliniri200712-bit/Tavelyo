/** Une nombres de clase ignorando los vacíos. */
export function classNames(...names: ReadonlyArray<string | false | null | undefined>): string {
  return names.filter(Boolean).join(' ');
}
