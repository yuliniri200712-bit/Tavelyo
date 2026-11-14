/** Patrones de secretos que nunca deben estar en el repositorio ni en el código del navegador. */
export const SECRET_PATTERNS: ReadonlyArray<{ readonly name: string; readonly pattern: RegExp }> = [
  {
    name: 'Clave privada PEM',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----/,
  },
  { name: 'Cuenta de servicio de Google', pattern: /"type"\s*:\s*"service_account"/ },
  { name: 'Clave privada en JSON', pattern: /"private_key"\s*:\s*"-----BEGIN/ },
  { name: 'Clave de API de Google o Firebase', pattern: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: 'Clave de acceso de AWS', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Clave secreta de pasarela de pago', pattern: /\b(?:sk|rk)_live_[0-9A-Za-z]{10,}\b/ },
  {
    name: 'Token de GitHub',
    pattern: /\b(?:ghp|gho|ghs|ghu)_[A-Za-z0-9]{36}\b|\bgithub_pat_[A-Za-z0-9_]{40,}\b/,
  },
  { name: 'Token de Slack', pattern: /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/ },
  {
    name: 'Cadena de conexión de base de datos con contraseña',
    pattern: /\bpostgres(?:ql)?:\/\/[^\s:/@]+:[^\s@/]+@/,
  },
];

export interface SecretFinding {
  readonly file: string;
  readonly line: number;
  readonly kind: string;
}

/** Devuelve los hallazgos de un texto (sin incluir el secreto en el resultado). */
export function findSecrets(file: string, text: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  text.split(/\r?\n/).forEach((content, index) => {
    for (const { name, pattern } of SECRET_PATTERNS) {
      if (pattern.test(content)) findings.push({ file, line: index + 1, kind: name });
    }
  });
  return findings;
}
