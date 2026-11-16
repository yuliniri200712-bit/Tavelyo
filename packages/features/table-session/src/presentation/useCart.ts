import { useCallback, useEffect, useState } from 'react';
import {
  addToCart,
  loadCart,
  removeLine,
  saveCart,
  setQuantity,
  type CartLine,
  type CartProduct,
  type CartStorage,
  type ProductChoice,
} from '@tavelyo/cart';

/** Carrito de esta mesa en este teléfono: se guarda en el navegador en cada cambio (D-06). */
export function useCart(
  storage: CartStorage,
  qrPublicId: string,
  now: () => Date,
  newKey: () => string,
) {
  const [lines, setLines] = useState<readonly CartLine[]>(() =>
    loadCart(storage, qrPublicId, now()),
  );

  useEffect(() => {
    saveCart(storage, qrPublicId, lines, now());
  }, [storage, qrPublicId, lines, now]);

  /** Devuelve null si se agregó, o el motivo si no se pudo. */
  const add = useCallback(
    (product: CartProduct, choice: ProductChoice): string | null => {
      const result = addToCart(lines, product, choice, newKey);
      if (!result.ok) return result.message;
      setLines(result.lines);
      return null;
    },
    [lines, newKey],
  );

  return {
    lines,
    add,
    setQuantity: useCallback(
      (key: string, quantity: number) => setLines((current) => setQuantity(current, key, quantity)),
      [],
    ),
    remove: useCallback((key: string) => setLines((current) => removeLine(current, key)), []),
    replace: setLines,
    clear: useCallback(() => setLines([]), []),
  };
}

export type CartState = ReturnType<typeof useCart>;
