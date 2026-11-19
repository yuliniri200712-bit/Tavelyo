import { describe, expect, it } from 'vitest';
import { mapCommandError, mapStaffCallableError } from './command-errors.ts';

/** Error con la forma de DataConnectOperationError del SDK web (firebase 12.19). */
function operationError(message: string, code: string) {
  return Object.assign(new Error(`DataConnect error while performing request: ${message}`), {
    name: 'DataConnectOperationError',
    response: { errors: [{ message, extensions: { code } }], data: null },
  });
}

describe('mapCommandError', () => {
  it('muestra el motivo de una regla @check, sin los sufijos del servidor', () => {
    expect(
      mapCommandError(
        operationError(
          'Cierra la mesa antes de archivarla (aborted)\n(rolled back)',
          'PERMISSION_DENIED',
        ),
      ),
    ).toEqual({ kind: 'rejected', message: 'Cierra la mesa antes de archivarla' });
    expect(
      mapCommandError(operationError('Sin permiso: table.manage (aborted)', 'PERMISSION_DENIED')),
    ).toEqual({
      kind: 'rejected',
      message: 'Sin permiso: table.manage',
    });
  });

  it('traduce la unicidad solo si la operación da un mensaje propio', () => {
    const duplicate = operationError(
      'duplicate key value violates unique constraint "dining_table_tenant_id_branch_id_code_uidx"',
      'ALREADY_EXISTS',
    );
    expect(mapCommandError(duplicate, 'Ya existe una mesa con ese código.')).toEqual({
      kind: 'rejected',
      message: 'Ya existe una mesa con ese código.',
    });
    // Sin mensaje propio no se muestra el detalle de la base.
    expect(mapCommandError(duplicate)).toEqual({ kind: 'unknown' });
  });

  it('también lee los errores de una respuesta 4xx (mensaje con el cuerpo JSON)', () => {
    const body = (message: string, code: string) =>
      Object.assign(new Error(JSON.stringify({ errors: [{ message, extensions: { code } }] })), {
        name: 'DataConnectError',
        code: 'other',
      });
    expect(
      mapCommandError(body('Sin acceso a la sucursal (aborted)', 'PERMISSION_DENIED')),
    ).toEqual({ kind: 'rejected', message: 'Sin acceso a la sucursal' });
    expect(
      mapCommandError(
        body('duplicate key value violates unique constraint', 'ALREADY_EXISTS'),
        'Ya existe.',
      ),
    ).toEqual({ kind: 'rejected', message: 'Ya existe.' });
    const google = Object.assign(
      new Error(
        JSON.stringify({
          error: {
            code: 409,
            message: 'duplicate key value violates unique constraint',
            status: 'ALREADY_EXISTS',
          },
        }),
      ),
      { name: 'DataConnectError', code: 'other' },
    );
    expect(mapCommandError(google, 'Ya existe.')).toEqual({
      kind: 'rejected',
      message: 'Ya existe.',
    });
    expect(mapCommandError(new Error('{ no es json'))).toEqual({ kind: 'unknown' });
  });

  it('no muestra errores internos ni de @auth como motivo', () => {
    expect(
      mapCommandError(operationError('violates foreign key constraint "x" (aborted)', 'INTERNAL')),
    ).toEqual({ kind: 'unknown' });
    expect(
      mapCommandError(
        operationError('@auth(level: USER) unauthenticated (aborted)', 'PERMISSION_DENIED'),
      ),
    ).toEqual({ kind: 'unauthorized' });
    expect(mapCommandError(new TypeError('Failed to fetch'))).toEqual({ kind: 'network' });
    expect(mapCommandError(null)).toEqual({ kind: 'unknown' });
  });
});

/** Error con la forma de FunctionsError del SDK web (firebase 12.19). */
function callableError(code: string, message: string) {
  return Object.assign(new Error(message), { code: `functions/${code}` });
}

describe('mapStaffCallableError', () => {
  it('muestra el motivo que escribió el backend, sin el estado HTTP', () => {
    expect(
      mapStaffCallableError(
        callableError(
          'failed-precondition',
          'No se puede cerrar la mesa. Falta cobrar $ 30.000. [400]',
        ),
      ),
    ).toEqual({ kind: 'rejected', message: 'No se puede cerrar la mesa. Falta cobrar $ 30.000.' });
  });
  it('distingue sesión vencida, red caída y fallas inesperadas', () => {
    expect(mapStaffCallableError(callableError('unauthenticated', 'x'))).toEqual({
      kind: 'unauthorized',
    });
    expect(mapStaffCallableError(callableError('internal', 'internal'))).toEqual({
      kind: 'network',
    });
    expect(mapStaffCallableError(callableError('unavailable', 'x'))).toEqual({ kind: 'network' });
    expect(mapStaffCallableError(callableError('internal', 'detalle interno'))).toEqual({
      kind: 'unknown',
    });
    expect(mapStaffCallableError(new Error('x'))).toEqual({ kind: 'unknown' });
  });
});
