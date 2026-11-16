import { QueryFetchPolicy, subscribe, type QueryRef } from 'firebase/data-connect';
import { err, ok, type LiveObserver, type Result } from '@tavelyo/core';
import { mapCommandError, type CommandError } from './command-errors.ts';

// Siempre al servidor: la PWA no conserva respuestas de datos (ADR-0008 §8, ADR-0009). La
// suscripción usa el registro propio del SDK, sin caché persistente (ADR-0007, implementación).
export const SERVER_ONLY = { fetchPolicy: QueryFetchPolicy.SERVER_ONLY } as const;

/** Lectura completa traducida al contrato del módulo. */
export async function readQuery<Data, T>(
  run: () => Promise<{ readonly data: Data }>,
  map: (data: Data) => T,
): Promise<Result<T, CommandError>> {
  try {
    const { data } = await run();
    return ok(map(data));
  } catch (error) {
    return err(mapCommandError(error));
  }
}

/**
 * Suscripción en tiempo real a una consulta con `@refresh` (ADR-0007). Devuelve la función que la
 * cancela; cada resultado llega ya traducido al contrato del módulo.
 */
export function watchQuery<Data, Variables, T>(
  ref: QueryRef<Data, Variables>,
  map: (data: Data) => T,
  observer: LiveObserver<T, CommandError>,
): () => void {
  try {
    return subscribe(ref, {
      onNext: (result) => observer.onData(map(result.data)),
      onErr: (error) => {
        if (error) observer.onError(mapCommandError(error));
      },
    });
  } catch (error) {
    // Sin conexión de streaming, el SDK lanza al suscribir: la pantalla lo trata como sin red.
    observer.onError(mapCommandError(error));
    return () => undefined;
  }
}

/** Ejecuta una mutación y traduce el resultado al contrato del módulo. */
export async function runCommand(
  run: () => Promise<unknown>,
  duplicateMessage?: string,
): Promise<Result<void, CommandError>> {
  try {
    await run();
    return ok(undefined);
  } catch (error) {
    return err(mapCommandError(error, duplicateMessage));
  }
}
