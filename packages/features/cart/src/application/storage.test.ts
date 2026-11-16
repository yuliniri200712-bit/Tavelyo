import { describe, expect, it } from 'vitest';
import type { CartLine, CartStorage } from '../domain/index.ts';
import { CART_TTL_MS, cartStorageKey, loadCart, saveCart } from './storage.ts';

function memoryStorage(): CartStorage & { readonly data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

const line: CartLine = {
  key: 'k1',
  productId: 'p1',
  productName: 'Hamburguesa',
  priceId: 'pr1',
  unitPriceMinor: '3200000',
  currency: 'COP',
  options: [{ id: 'o1', name: 'Aguacate', priceDeltaMinor: '540000' }],
  quantity: 2,
  note: null,
};
const now = new Date('2026-11-15T20:00:00Z');

describe('carrito guardado en el teléfono', () => {
  it('se guarda por mesa y se recupera igual', () => {
    const storage = memoryStorage();
    saveCart(storage, 'qr-1', [line], now);
    expect(loadCart(storage, 'qr-1', now)).toEqual([line]);
    expect(loadCart(storage, 'qr-2', now)).toEqual([]);
    saveCart(storage, 'qr-1', [], now);
    expect(storage.data.has(cartStorageKey('qr-1'))).toBe(false);
  });

  it('vence a las 12 horas', () => {
    const storage = memoryStorage();
    saveCart(storage, 'qr-1', [line], now);
    expect(loadCart(storage, 'qr-1', new Date(now.getTime() + CART_TTL_MS + 1))).toEqual([]);
  });

  it('lo guardado no es confiable: datos alterados o rotos dejan el carrito vacío', () => {
    const storage = memoryStorage();
    const save = (lines: unknown) =>
      storage.setItem(
        cartStorageKey('qr-1'),
        JSON.stringify({ version: 1, savedAt: now.getTime(), lines }),
      );
    for (const bad of [
      [{ ...line, unitPriceMinor: '12.5' }],
      [{ ...line, quantity: 0 }],
      [{ ...line, quantity: 100 }],
      [{ ...line, note: 'x'.repeat(141) }],
      [{ ...line, options: [{ id: 'o1', name: 'A', priceDeltaMinor: 'mucho' }] }],
      'no es una lista',
    ]) {
      save(bad);
      expect(loadCart(storage, 'qr-1', now)).toEqual([]);
    }
    storage.setItem(cartStorageKey('qr-1'), '{roto');
    expect(loadCart(storage, 'qr-1', now)).toEqual([]);
  });

  it('si el navegador bloquea el almacenamiento, no falla', () => {
    const blocked: CartStorage = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => undefined,
    };
    expect(loadCart(blocked, 'qr-1', now)).toEqual([]);
    expect(() => saveCart(blocked, 'qr-1', [line], now)).not.toThrow();
  });
});
