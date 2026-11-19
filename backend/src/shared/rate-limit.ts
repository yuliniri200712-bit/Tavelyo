// Límites de solicitudes del backend (riesgo T11 de ADR-0011: QR fotografiado, abuso de la carta).
// Se cuentan en la base, así que valen para todas las instancias de Cloud Functions a la vez.

export interface RateLimitRule {
  /** Nombre estable de la regla; se guarda con cada solicitud admitida. */
  readonly scope: string;
  /** Solicitudes admitidas por ventana. */
  readonly limit: number;
  readonly windowSeconds: number;
}

export const RATE_LIMITS = {
  /** Unirse a mesas, por persona (uid, también anónimo). */
  joinPerUser: { scope: 'join.uid', limit: 10, windowSeconds: 600 },
  /** Unirse a una misma mesa, por QR: frena a quien crea muchas cuentas anónimas. */
  joinPerTable: { scope: 'join.table', limit: 120, windowSeconds: 600 },
  /** «Revisar pedido», por persona. */
  quotePerUser: { scope: 'quote.uid', limit: 30, windowSeconds: 60 },
  /** «Enviar pedido», por persona. */
  submitPerUser: { scope: 'submit.uid', limit: 10, windowSeconds: 60 },
  /** «Llamar al mesero» y «Pedir la cuenta», por persona. */
  servicePerUser: { scope: 'service.uid', limit: 6, windowSeconds: 600 },
  /** Solicitudes de una misma mesa: frena a quien crea muchas cuentas anónimas. */
  servicePerSession: { scope: 'service.session', limit: 30, windowSeconds: 600 },
} as const satisfies Record<string, RateLimitRule>;

export interface RateLimiter {
  /** true si la solicitud entra en el límite (y queda contada); false si lo supera. */
  admit(rule: RateLimitRule, subject: string): Promise<boolean>;
}

export const RATE_LIMITED_MESSAGE =
  'Hiciste demasiadas solicitudes seguidas. Espera un momento e inténtalo de nuevo.';
