import { describe, expect, it } from 'vitest';
import { findSecrets } from './patterns.ts';

// Valores construidos por partes para que el propio repositorio no contenga secretos literales.
const samples: Record<string, string> = {
  'Clave privada PEM': ['-----BEGIN', ' PRIVATE KEY-----'].join(''),
  'Cuenta de servicio de Google': ['{ "type": ', '"service', '_account" }'].join(''),
  'Clave de API de Google o Firebase': `apiKey: "${'AIza'}${'x'.repeat(35)}"`,
  'Clave de acceso de AWS': `${'AKIA'}${'A'.repeat(16)}`,
  'Clave secreta de pasarela de pago': `${'sk_'}live_${'a'.repeat(24)}`,
  'Token de GitHub': `${'ghp_'}${'a'.repeat(36)}`,
  'Cadena de conexión de base de datos con contraseña': `${'postgres'}://app:clave@db:5432/x`,
};

describe('findSecrets', () => {
  it.each(Object.entries(samples))('detecta: %s', (kind, text) => {
    const findings = findSecrets('ejemplo.txt', `línea 1\n${text}\n`);
    expect(findings).toEqual([{ file: 'ejemplo.txt', line: 2, kind }]);
  });

  it('no marca la configuración de ejemplo ni código normal', () => {
    const text = [
      'VITE_FIREBASE_API_KEY=demo-api-key',
      "const url = 'postgres://localhost:5432/tavelyo';",
      'export const tokens = { brand: "#E54835" };',
    ].join('\n');
    expect(findSecrets('x', text)).toEqual([]);
  });

  it('no incluye el secreto en el resultado', () => {
    const [finding] = findSecrets('x', samples['Token de GitHub'] ?? '');
    expect(JSON.stringify(finding)).not.toContain('ghp_');
  });
});
