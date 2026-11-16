import { Money } from '@tavelyo/core';
import { ORDER_LIMITS } from '@tavelyo/contracts';
import type { CartLine, CartOption, CartStorage } from '../domain/index.ts';

/** Un carrito olvidado no reaparece en la visita siguiente. */
export const CART_TTL_MS = 12 * 60 * 60 * 1000;

const VERSION = 1;

export function cartStorageKey(qrPublicId: string): string {
  return `tavelyo.carrito.${qrPublicId}`;
}

const isText = (value: unknown): value is string => typeof value === 'string' && value !== '';
const isMinor = (value: unknown, currency: string): value is string =>
  typeof value === 'string' && Money.fromMinorString(value, currency).ok;

function readOption(value: unknown, currency: string): CartOption | null {
  if (typeof value !== 'object' || value === null) return null;
  const { id, name, priceDeltaMinor } = value as Record<string, unknown>;
  return isText(id) && isText(name) && isMinor(priceDeltaMinor, currency)
    ? { id, name, priceDeltaMinor }
    : null;
}

function readLine(value: unknown): CartLine | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  const { key, productId, productName, priceId, unitPriceMinor, currency, quantity, note } = raw;
  if (![key, productId, productName, priceId, currency].every(isText)) return null;
  const code = currency as string;
  if (!isMinor(unitPriceMinor, code)) return null;
  if (!Number.isInteger(quantity) || (quantity as number) < 1) return null;
  if ((quantity as number) > ORDER_LIMITS.maxQuantity) return null;
  if (note !== null && (typeof note !== 'string' || note.length > ORDER_LIMITS.maxNoteLength)) {
    return null;
  }
  if (!Array.isArray(raw['options'])) return null;
  const options = raw['options'].map((option) => readOption(option, code));
  if (options.some((option) => option === null)) return null;
  return {
    key: key as string,
    productId: productId as string,
    productName: productName as string,
    priceId: priceId as string,
    unitPriceMinor,
    currency: code,
    options: options as CartOption[],
    quantity: quantity as number,
    note,
  };
}

/**
 * Lee el carrito guardado en este teléfono para esta mesa. Lo guardado es un dato no confiable: si
 * no tiene la forma esperada, venció o el navegador no deja leerlo, empieza vacío.
 */
export function loadCart(storage: CartStorage, qrPublicId: string, now: Date): CartLine[] {
  try {
    const text = storage.getItem(cartStorageKey(qrPublicId));
    if (!text) return [];
    const saved = JSON.parse(text) as { version?: unknown; savedAt?: unknown; lines?: unknown };
    if (saved.version !== VERSION || typeof saved.savedAt !== 'number') return [];
    if (now.getTime() - saved.savedAt > CART_TTL_MS || !Array.isArray(saved.lines)) return [];
    const lines = saved.lines.slice(0, ORDER_LIMITS.maxLines).map(readLine);
    return lines.every((line) => line !== null) ? lines : [];
  } catch {
    return [];
  }
}

/** Guarda el carrito solo en este teléfono (D-06). Si el navegador no lo permite, sigue en memoria. */
export function saveCart(
  storage: CartStorage,
  qrPublicId: string,
  lines: readonly CartLine[],
  now: Date,
): void {
  try {
    const key = cartStorageKey(qrPublicId);
    if (lines.length === 0) storage.removeItem(key);
    else storage.setItem(key, JSON.stringify({ version: VERSION, savedAt: now.getTime(), lines }));
  } catch {
    // Modo privado o almacenamiento bloqueado: el carrito sigue en memoria mientras dure la página.
  }
}
