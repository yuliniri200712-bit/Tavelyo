import { useCallback, useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '@tavelyo/design-system';
import type { ActivityStore } from '../domain/index.ts';
import {
  INACTIVITY_POLICY,
  inactivityPhase,
  latestActivity,
  type InactivityPhase,
  type InactivityPolicy,
} from '../application/inactivity.ts';
import { useInactivityHolds } from './InactivityHold.tsx';
import { useSession } from './SessionProvider.tsx';

/** Interacciones que cuentan como actividad (mover el puntero sin tocar no cuenta). */
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
/** Como mucho una escritura compartida cada 5 s, aunque haya muchas pulsaciones. */
const SHARE_EVERY_MS = 5_000;
const CHECK_EVERY_MS = 1_000;

const storageKey = (uid: string) => `tavelyo.actividad.${uid}`;

/** Almacén del navegador. Si el almacenamiento no está disponible, cada pestaña cuenta sola. */
export const browserActivityStore: ActivityStore = {
  read(uid) {
    try {
      const value = window.localStorage.getItem(storageKey(uid));
      return value === null ? null : Number(value);
    } catch {
      return null;
    }
  },
  write(uid, at) {
    try {
      window.localStorage.setItem(storageKey(uid), String(at));
    } catch {
      // Sin almacenamiento compartido: la pestaña usa su propia actividad.
    }
  },
  clear(uid) {
    try {
      window.localStorage.removeItem(storageKey(uid));
    } catch {
      // Nada que borrar.
    }
  },
};

export interface InactivityGuardProps {
  readonly policy?: InactivityPolicy;
  readonly store?: ActivityStore;
  readonly now?: () => number;
}

/**
 * Cierra la sesión del personal tras un tiempo sin uso (D-19), con aviso previo. No muestra nada
 * mientras no haya sesión. Montarlo una vez en la app de operaciones.
 */
export function InactivityGuard({
  policy = INACTIVITY_POLICY,
  store = browserActivityStore,
  now = Date.now,
}: InactivityGuardProps) {
  const { session } = useSession();
  if (session.status !== 'signed-in') return null;
  return (
    <InactivityWatch key={session.user.uid} uid={session.user.uid} {...{ policy, store, now }} />
  );
}

interface InactivityWatchProps {
  readonly uid: string;
  readonly policy: InactivityPolicy;
  readonly store: ActivityStore;
  readonly now: () => number;
}

function InactivityWatch({ uid, policy, store, now }: InactivityWatchProps) {
  const { signOut } = useSession();
  const holds = useInactivityHolds();
  // Referencia estable: el vigilante no se reinicia si cambia el valor del contexto.
  const signOutRef = useRef(signOut);
  useEffect(() => {
    signOutRef.current = signOut;
  }, [signOut]);
  const [phase, setPhase] = useState<InactivityPhase>({ phase: 'active' });
  const phaseRef = useRef<InactivityPhase['phase']>('active');
  const lastOwn = useRef(0);
  const lastShared = useRef(Number.NEGATIVE_INFINITY);
  const expired = useRef(false);

  const record = useCallback(
    (force = false) => {
      const at = now();
      lastOwn.current = at;
      if (force || at - lastShared.current >= SHARE_EVERY_MS) {
        lastShared.current = at;
        store.write(uid, at);
      }
    },
    [now, store, uid],
  );

  const expire = useCallback(() => {
    if (expired.current) return;
    expired.current = true;
    void signOutRef.current('inactivity');
  }, []);

  const check = useCallback(() => {
    // Una pantalla visible que retiene el cierre (cocina, D-25) cuenta como actividad.
    if (
      holds?.isHeld() &&
      document.visibilityState === 'visible' &&
      phaseRef.current === 'active'
    ) {
      record();
    }
    const at = now();
    lastOwn.current = latestActivity(lastOwn.current, store.read(uid), at);
    const next = inactivityPhase(lastOwn.current, at, policy);
    phaseRef.current = next.phase;
    if (next.phase === 'expired') {
      expire();
      return;
    }
    setPhase((previous) =>
      previous.phase === next.phase &&
      (next.phase !== 'warning' ||
        (previous.phase === 'warning' && previous.secondsLeft === next.secondsLeft))
        ? previous
        : next,
    );
  }, [expire, holds, now, policy, record, store, uid]);

  useEffect(() => {
    // Al abrir la app con una sesión recordada, la última actividad guardada decide.
    const stored = store.read(uid);
    if (stored !== null && inactivityPhase(stored, now(), policy).phase === 'expired') {
      store.clear(uid);
      expire();
      return;
    }
    record(true);

    const onActivity = () => {
      // Durante el aviso solo cuenta la respuesta explícita («Seguir trabajando»).
      if (phaseRef.current === 'active') record();
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    for (const type of ACTIVITY_EVENTS) {
      document.addEventListener(type, onActivity, { capture: true, passive: true });
    }
    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(check, CHECK_EVERY_MS);
    return () => {
      for (const type of ACTIVITY_EVENTS) {
        document.removeEventListener(type, onActivity, { capture: true });
      }
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
      // Al cerrar la sesión dentro de la app no queda rastro para el siguiente acceso.
      store.clear(uid);
    };
  }, [check, expire, now, policy, record, store, uid]);

  const keepWorking = () => {
    record(true);
    phaseRef.current = 'active';
    setPhase({ phase: 'active' });
  };

  return (
    <ConfirmDialog
      open={phase.phase === 'warning'}
      title="¿Sigues ahí?"
      confirmLabel="Seguir trabajando"
      cancelLabel="Cerrar sesión"
      onConfirm={keepWorking}
      onCancel={() => void signOut()}
    >
      <p>
        Por seguridad, la sesión se cerrará en{' '}
        <span className="tv-tabular">{phase.phase === 'warning' ? phase.secondsLeft : 0}</span>{' '}
        segundos si no respondes.
      </p>
    </ConfirmDialog>
  );
}
