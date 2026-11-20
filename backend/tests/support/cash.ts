// Caja de las pruebas (bloque 5, D-40): quien cobra en efectivo necesita su turno abierto.
import type { CashScope, CashSessionResponse, ReadCashSessionResponse } from '@tavelyo/contracts';
import { expectOk, mutate, type TestUser } from '../../../dataconnect/tests/support/emulator.ts';
import { callFunction, type CallResult } from './functions.ts';

let registers = 0;

export function callOk<T>(r: CallResult<T>): T {
  if (!r.ok) throw new Error(`${r.status}: ${r.message}`);
  return r.result;
}

/** Crea una caja en la sucursal con quien tiene `branch.settings` (propietario o administrador). */
export async function createRegister(manager: TestUser, scope: CashScope): Promise<string> {
  return expectOk(
    await mutate<{ register_insert: { id: string } }>(manager, 'CreateRegister', {
      ...scope,
      name: `Caja ${++registers}`,
    }),
    'Crear caja',
  ).register_insert.id;
}

/**
 * Turno abierto de `user` en la sucursal: si ya tiene uno lo devuelve; si no, crea una caja y abre
 * el turno con el fondo indicado.
 */
export async function openTill(
  manager: TestUser,
  scope: CashScope,
  user: TestUser,
  openingFloatMinor = '0',
): Promise<CashSessionResponse> {
  const current = callOk(
    await callFunction<ReadCashSessionResponse>(user, 'readCashSession', scope),
  ).session;
  if (current) return current;
  const registerId = await createRegister(manager, scope);
  return callOk(
    await callFunction<CashSessionResponse>(user, 'openCashSession', {
      ...scope,
      registerId,
      openingFloatMinor,
    }),
  );
}
