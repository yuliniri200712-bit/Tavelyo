declare function deepmerge<T1, T2>(
  x: Partial<T1>,
  y: Partial<T2>,
  options?: deepmerge.Options,
): T1 & T2;
declare namespace deepmerge {
  interface Options {
    arrayMerge?(target: unknown[], source: unknown[], options?: Options): unknown[];
    clone?: boolean;
    customMerge?: (
      key: string,
      options?: Options,
    ) => ((x: unknown, y: unknown) => unknown) | undefined;
    isMergeableObject?(value: object): boolean;
  }
  function all<T>(objects: object[], options?: Options): T;
}
export = deepmerge;
