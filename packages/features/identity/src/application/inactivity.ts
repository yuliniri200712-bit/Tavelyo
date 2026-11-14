/**
 * Cierre de sesión por inactividad del personal (D-19, PM §8): tras 15 minutos sin uso se cierra
 * la sesión; durante el último minuto se avisa y la persona puede seguir trabajando.
 */
export interface InactivityPolicy {
  readonly timeoutMs: number;
  readonly warningMs: number;
}

export const INACTIVITY_POLICY: InactivityPolicy = {
  timeoutMs: 15 * 60_000,
  warningMs: 60_000,
};

export type InactivityPhase =
  | { readonly phase: 'active' }
  | { readonly phase: 'warning'; readonly secondsLeft: number }
  | { readonly phase: 'expired' };

/** Fase según la última actividad. Se calcula con marcas de tiempo: resiste pestañas dormidas. */
export function inactivityPhase(
  lastActivityAt: number,
  now: number,
  policy: InactivityPolicy = INACTIVITY_POLICY,
): InactivityPhase {
  const remaining = lastActivityAt + policy.timeoutMs - now;
  if (remaining <= 0) return { phase: 'expired' };
  if (remaining <= policy.warningMs) {
    return { phase: 'warning', secondsLeft: Math.ceil(remaining / 1000) };
  }
  return { phase: 'active' };
}

/**
 * Última actividad compartida entre las pestañas de la misma persona: trabajar en una pestaña
 * mantiene abiertas las demás. Una marca no válida o del futuro cuenta como ausente.
 */
export function latestActivity(own: number, stored: number | null, now: number): number {
  if (stored === null || !Number.isFinite(stored) || stored > now) return own;
  return Math.max(own, stored);
}
