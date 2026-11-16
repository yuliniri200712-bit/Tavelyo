import { describe, expect, it } from 'vitest';
import { FunctionsError } from 'firebase/functions';
import { mapCallableError } from './customer-gateway.ts';

// Errores tal como los construye el SDK de funciones (firebase 12.19, _errorForResponse).
const backend = (code: string, message: string, status = 400) =>
  new FunctionsError(code as never, `${message} [${status}]`);

describe('errores de las funciones del cliente', () => {
  it('muestra el mensaje que el backend escribió para la persona', () => {
    expect(
      mapCallableError(
        backend(
          'failed-precondition',
          'La mesa todavía no está abierta. Pide al mesero que la abra.',
        ),
      ),
    ).toEqual({
      kind: 'rejected',
      reason: 'other',
      message: 'La mesa todavía no está abierta. Pide al mesero que la abra.',
    });
  });

  it('distingue cuándo hay que volver a unirse y cuándo se puede reintentar', () => {
    expect(
      mapCallableError(backend('permission-denied', 'Ya no formas parte de esta mesa.', 403)),
    ).toMatchObject({ kind: 'rejected', reason: 'not-participant' });
    expect(
      mapCallableError(
        backend('unavailable', 'No pudimos confirmar el pago. Inténtalo de nuevo.', 503),
      ),
    ).toMatchObject({ kind: 'rejected', reason: 'retry' });
  });

  it('sin respuesta del servidor es un problema de red; un fallo interno no muestra detalles', () => {
    expect(mapCallableError(new FunctionsError('internal', 'internal'))).toEqual({
      kind: 'network',
    });
    expect(mapCallableError(new FunctionsError('deadline-exceeded', 'deadline-exceeded'))).toEqual({
      kind: 'network',
    });
    expect(mapCallableError(backend('internal', 'INTERNAL', 500))).toEqual({ kind: 'unknown' });
    expect(mapCallableError(backend('not-found', 'Backend error status: NOT_FOUND', 404))).toEqual({
      kind: 'unknown',
    });
    expect(mapCallableError(new Error('otra cosa'))).toEqual({ kind: 'unknown' });
  });
});
