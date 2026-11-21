import { httpsCallable, type Functions } from 'firebase/functions';
import { err, ok, type Result } from '@tavelyo/core';
import { mapStaffCallableError, type CommandError } from './command-errors.ts';

/** Función callable del backend para el personal, con sus rechazos traducidos para la persona. */
export async function callStaffFunction<T>(
  functions: Functions,
  name: string,
  data: unknown,
): Promise<Result<T, CommandError>> {
  try {
    const result = await httpsCallable<unknown, T>(functions, name)(data);
    return ok(result.data);
  } catch (error) {
    return err(mapStaffCallableError(error));
  }
}
