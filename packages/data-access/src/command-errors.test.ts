import { describe, expect, it } from 'vitest';
import { mapCommandError } from './command-errors.ts';

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
