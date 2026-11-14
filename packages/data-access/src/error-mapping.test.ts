import { describe, expect, it } from 'vitest';
import { mapAuthError } from './auth-gateway.ts';
import { mapDataError } from './sql-connect-gateways.ts';

describe('mapAuthError', () => {
  it.each([
    'auth/invalid-credential',
    'auth/invalid-login-credentials',
    'auth/user-not-found',
    'auth/wrong-password',
    'auth/invalid-email',
    'auth/user-disabled',
  ])('%s no revela si la cuenta existe', (code) => {
    expect(mapAuthError({ code })).toBe('invalid-credentials');
  });

  it('distingue demasiados intentos, red y errores desconocidos', () => {
    expect(mapAuthError({ code: 'auth/too-many-requests' })).toBe('too-many-attempts');
    expect(mapAuthError({ code: 'auth/network-request-failed' })).toBe('network');
    expect(mapAuthError(new Error('x'))).toBe('unknown');
    expect(mapAuthError(null)).toBe('unknown');
  });
});

describe('mapDataError', () => {
  it('reconoce falta de autorización, red y otros errores', () => {
    expect(mapDataError({ code: 'unauthorized', message: 'x' })).toBe('unauthorized');
    expect(mapDataError(new Error('Sin membresía (permission denied)'))).toBe('unauthorized');
    expect(mapDataError(new TypeError('Failed to fetch'))).toBe('network');
    expect(mapDataError(new Error('boom'))).toBe('unknown');
  });
});
