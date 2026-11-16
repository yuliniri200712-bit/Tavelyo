/** Opción de un grupo (p. ej. «Con aguacate», + $ 5.400). Importes en unidades menores. */
export interface CartOption {
  readonly id: string;
  readonly name: string;
  readonly priceDeltaMinor: string;
}

/** Grupo de opciones con su mínimo y máximo de elecciones. */
export interface CartOptionGroup {
  readonly id: string;
  readonly name: string;
  readonly minSelect: number;
  readonly maxSelect: number;
  readonly options: readonly CartOption[];
}

/** Producto tal como se puede agregar al carrito: con la versión de precio que vio la persona. */
export interface CartProduct {
  readonly id: string;
  readonly name: string;
  readonly priceId: string;
  readonly priceMinor: string;
  readonly currency: string;
  readonly groups: readonly CartOptionGroup[];
}

/**
 * Línea del carrito. Vive solo en el teléfono de la persona (D-06) hasta «Revisar pedido»; el
 * servidor recalcula todo y es la autoridad sobre los importes.
 */
export interface CartLine {
  readonly key: string;
  readonly productId: string;
  readonly productName: string;
  readonly priceId: string;
  readonly unitPriceMinor: string;
  readonly currency: string;
  readonly options: readonly CartOption[];
  readonly quantity: number;
  readonly note: string | null;
}

/** Almacenamiento local del navegador (inyectable para las pruebas). */
export interface CartStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
