import { HttpsError } from 'firebase-functions/https';
import { describe, expect, it, vi } from 'vitest';
import { sessionRevoked } from './data/auth.ts';
import { mapConnectorRejection } from './data/sql-connect.ts';
import { actorFrom, handle, respond } from './presentation/callables.ts';
import { failure } from './shared/outcome.ts';

describe('sessionRevoked', () => {
  it('sin revocación registrada, la sesión es válida', () => {
    expect(sessionRevoked(1_000)).toBe(false);
  });

  it('revoca las sesiones iniciadas antes del corte (precisión de segundos)', () => {
    const cut = new Date(1_700_000_000_500).toUTCString();
    expect(sessionRevoked(1_699_999_999, cut)).toBe(true);
    expect(sessionRevoked(1_700_000_000, cut)).toBe(false);
  });
});

describe('mapConnectorRejection', () => {
  it.each([
    'data-connect/query-error',
    'data-connect/permission-denied',
    'data-connect/unauthenticated',
  ])('%s es un rechazo de las reglas', (code) => {
    expect(mapConnectorRejection({ code, message: 'detalle interno' }, 'No permitido.')).toEqual(
      failure('permission-denied', 'No permitido.'),
    );
  });

  it('los demás errores se lanzan (no se disfrazan de rechazo)', () => {
    const error = Object.assign(new Error('caído'), { code: 'data-connect/internal-error' });
    expect(() => mapConnectorRejection(error, 'No permitido.')).toThrow(error);
  });
});

describe('funciones callable', () => {
  const auth = {
    uid: 'u1',
    rawToken: 'token',
    token: { uid: 'u1', sub: 'u1', auth_time: 123 } as never,
  };

  it('el actor sale del token verificado por Cloud Functions', () => {
    expect(actorFrom({ auth })).toEqual({
      uid: 'u1',
      claims: { uid: 'u1', sub: 'u1', auth_time: 123 },
      authTimeSeconds: 123,
    });
    expect(actorFrom({})).toBeNull();
  });

  it('sin sesión responde unauthenticated sin ejecutar el caso de uso', async () => {
    const useCase = vi.fn();
    await expect(handle({ data: {} }, useCase)).rejects.toMatchObject({ code: 'unauthenticated' });
    expect(useCase).not.toHaveBeenCalled();
  });

  it('traduce las fallas a HttpsError con el mismo código y mensaje', () => {
    expect(respond({ ok: true, value: 1 })).toBe(1);
    try {
      respond({ ok: false, error: failure('permission-denied', 'No permitido.') });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(HttpsError);
      expect(error).toMatchObject({ code: 'permission-denied', message: 'No permitido.' });
    }
  });
});
