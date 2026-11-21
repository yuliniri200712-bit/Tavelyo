import { formatMoney, Money, parseMajorAmount, type Result, err, ok } from '@tavelyo/core';
import { CASH_REASON } from '@tavelyo/contracts';
import type { CashMovementKind, Register } from '../domain/index.ts';

// Lógica de la pantalla de caja (bloque 6a). Los importes y el efectivo esperado son del servidor;
// aquí solo se leen los formularios y se arman los textos.

export const MOVEMENT_TEXT: Readonly<Record<CashMovementKind, string>> = {
  CASH_IN: 'Entrada',
  CASH_OUT: 'Salida',
  SALE: 'Venta en efectivo',
  REFUND: 'Reembolso en efectivo',
};

export const REGISTER_NAME_MAX = 40;

export const cop = (minor: string) => Money.ofMinor(BigInt(minor), 'COP');
export const money = (minor: string) => formatMoney(cop(minor));

/** Pesos escritos por la persona a unidades menores; `allowZero` para el fondo y el conteo. */
export function readPesos(text: string, allowZero = false): Result<string, string> {
  const parsed = parseMajorAmount(text, 'COP');
  if (!parsed.ok)
    return err(
      parsed.error.kind === 'empty'
        ? 'Escribe el importe en pesos.'
        : 'Escribe el importe en pesos enteros, por ejemplo 50.000.',
    );
  if (!allowZero && parsed.value.amountMinor === 0n)
    return err('El importe debe ser mayor que cero.');
  return ok(parsed.value.amountMinor.toString());
}

export function readCashReason(text: string): Result<string, string> {
  const reason = text.trim();
  return reason.length >= CASH_REASON.min && reason.length <= CASH_REASON.max
    ? ok(reason)
    : err(`Escribe el motivo (entre ${CASH_REASON.min} y ${CASH_REASON.max} caracteres).`);
}

export function readRegisterName(text: string): Result<string, string> {
  const name = text.trim();
  return name.length >= 1 && name.length <= REGISTER_NAME_MAX
    ? ok(name)
    : err(`Escribe el nombre de la caja (hasta ${REGISTER_NAME_MAX} caracteres).`);
}

/** Cajas que se pueden abrir: activas y sin turno. */
export const availableRegisters = (registers: readonly Register[]) =>
  registers.filter((r) => !r.archived && !r.openSession);

/** Contado menos esperado, en texto: «Cuadra», «Faltan $ 5.000» o «Sobran $ 2.000». */
export function describeDifference(expectedMinor: string, countedMinor: string): string {
  const difference = BigInt(countedMinor) - BigInt(expectedMinor);
  if (difference === 0n) return 'Cuadra con lo esperado.';
  const amount = formatMoney(Money.ofMinor(difference < 0n ? -difference : difference, 'COP'));
  return difference < 0n ? `Faltan ${amount}.` : `Sobran ${amount}.`;
}
