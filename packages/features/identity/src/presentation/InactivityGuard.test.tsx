// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ok } from '@tavelyo/core';
import type { ActivityStore, AuthGateway, StaffUser } from '../domain/index.ts';
import { InactivityGuard } from './InactivityGuard.tsx';
import { InactivityHoldProvider, useInactivityHold } from './InactivityHold.tsx';
import { SessionProvider, useSession } from './SessionProvider.tsx';

const MINUTE = 60_000;
const ana: StaffUser = { uid: 'u1', email: 'ana@lafonda.co', displayName: 'Ana' };

beforeAll(() => {
  // jsdom no implementa <dialog>: basta con alternar `open` (el foco real se prueba en Playwright).
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'setTimeout', 'Date'] });
  vi.setSystemTime(new Date('2026-11-14T15:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

/** Almacén en memoria compartido entre «pestañas» de la prueba. */
function memoryStore(): ActivityStore & { values: Map<string, number> } {
  const values = new Map<string, number>();
  return {
    values,
    read: (uid) => values.get(uid) ?? null,
    write: (uid, at) => void values.set(uid, at),
    clear: (uid) => void values.delete(uid),
  };
}

function signedInAuth(): AuthGateway & { signOut: ReturnType<typeof vi.fn> } {
  let listener: (user: StaffUser | null) => void = () => undefined;
  return {
    onUserChanged: (next) => {
      listener = next;
      next(ana);
      return () => undefined;
    },
    signIn: vi.fn(async () => ok(ana)),
    signOut: vi.fn(async () => listener(null)),
    sendPasswordReset: vi.fn(async () => ok(undefined)),
  };
}

function Status() {
  const { session } = useSession();
  return (
    <output aria-label="estado">
      {session.status === 'signed-out'
        ? `signed-out:${session.reason ?? 'persona'}`
        : session.status}
    </output>
  );
}

function renderGuard(store: ActivityStore = memoryStore()) {
  const auth = signedInAuth();
  render(
    <SessionProvider auth={auth} profiles={{ ensureProfile: vi.fn(async () => ok(undefined)) }}>
      <InactivityGuard store={store} />
      <Status />
    </SessionProvider>,
  );
  return auth;
}

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const status = () => screen.getByLabelText('estado').textContent;
const dialog = () => document.querySelector('dialog');

describe('InactivityGuard', () => {
  it('avisa en el minuto 14 con cuenta atrás y cierra la sesión en el 15', async () => {
    const auth = renderGuard();
    await advance(14 * MINUTE - 1_000);
    expect(dialog()?.open).toBe(false);

    await advance(1_000);
    expect(dialog()?.open).toBe(true);
    expect(screen.getByRole('heading', { name: '¿Sigues ahí?' })).toBeTruthy();
    expect(dialog()?.textContent).toContain('60 segundos');
    await advance(30_000);
    expect(dialog()?.textContent).toContain('30 segundos');

    await advance(30_000);
    expect(auth.signOut).toHaveBeenCalledTimes(1);
    expect(status()).toBe('signed-out:inactivity');
  });

  it('cualquier interacción antes del aviso reinicia el plazo', async () => {
    const auth = renderGuard();
    await advance(10 * MINUTE);
    fireEvent.pointerDown(document.body);
    await advance(10 * MINUTE);
    fireEvent.keyDown(document.body, { key: 'a' });
    await advance(10 * MINUTE);
    expect(auth.signOut).not.toHaveBeenCalled();
    expect(dialog()?.open).toBe(false);
  });

  it('durante el aviso solo «Seguir trabajando» lo detiene', async () => {
    const auth = renderGuard();
    await advance(14 * MINUTE);
    expect(dialog()?.open).toBe(true);
    fireEvent.pointerDown(document.body);
    await advance(10_000);
    expect(dialog()?.open).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Seguir trabajando' }));
    expect(dialog()?.open).toBe(false);
    await advance(14 * MINUTE - 1_000);
    expect(auth.signOut).not.toHaveBeenCalled();
  });

  it('«Cerrar sesión» en el aviso cierra sin motivo de inactividad', async () => {
    renderGuard();
    await advance(14 * MINUTE);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    await advance(0);
    expect(status()).toBe('signed-out:persona');
  });

  it('la actividad en otra pestaña de la misma persona mantiene abierta esta', async () => {
    const store = memoryStore();
    const auth = renderGuard(store);
    await advance(14 * MINUTE);
    expect(dialog()?.open).toBe(true);
    act(() => store.write('u1', Date.now()));
    await advance(1_000);
    expect(dialog()?.open).toBe(false);
    await advance(13 * MINUTE);
    expect(auth.signOut).not.toHaveBeenCalled();
  });

  it('al volver de una suspensión larga cierra de inmediato', async () => {
    const auth = renderGuard();
    // El reloj salta sin que corran los temporizadores (equipo dormido).
    vi.setSystemTime(Date.now() + 2 * 60 * MINUTE);
    await act(async () => document.dispatchEvent(new Event('visibilitychange')));
    expect(auth.signOut).toHaveBeenCalledTimes(1);
  });

  it('al abrir la app con una sesión recordada pero caducada, la cierra y borra la marca', async () => {
    const store = memoryStore();
    store.write('u1', Date.now() - 20 * MINUTE);
    const auth = renderGuard(store);
    await advance(0);
    expect(auth.signOut).toHaveBeenCalledTimes(1);
    expect(store.values.has('u1')).toBe(false);
  });

  it('al cerrar la sesión no deja marca de actividad para el siguiente acceso', async () => {
    const store = memoryStore();
    const auth = renderGuard(store);
    expect(store.values.has('u1')).toBe(true);
    await act(() => auth.signOut());
    expect(store.values.has('u1')).toBe(false);
  });
});

/** Pantalla que retiene el cierre mientras está montada, como la de cocina (D-25). */
function KitchenLikeScreen({ active }: { readonly active: boolean }) {
  useInactivityHold(active);
  return null;
}

function renderHeld(active: boolean) {
  const auth = signedInAuth();
  const view = render(
    <SessionProvider auth={auth} profiles={{ ensureProfile: vi.fn(async () => ok(undefined)) }}>
      <InactivityHoldProvider>
        <InactivityGuard store={memoryStore()} />
        <KitchenLikeScreen active={active} />
      </InactivityHoldProvider>
    </SessionProvider>,
  );
  return { auth, view };
}

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });
}

describe('retención del cierre por inactividad (D-25)', () => {
  afterEach(() => setVisibility('visible'));

  it('con la pantalla de cocina visible no avisa ni cierra la sesión', async () => {
    setVisibility('visible');
    const { auth } = renderHeld(true);
    await advance(40 * MINUTE);
    expect(dialog()?.open).toBe(false);
    expect(auth.signOut).not.toHaveBeenCalled();
  });

  it('con la pestaña oculta, la inactividad vuelve a contar', async () => {
    const { auth } = renderHeld(true);
    setVisibility('hidden');
    await advance(15 * MINUTE + 1_000);
    expect(auth.signOut).toHaveBeenCalledTimes(1);
  });

  it('al salir de la pantalla de cocina, vuelve el cierre a los 15 minutos', async () => {
    const { auth, view } = renderHeld(true);
    await advance(30 * MINUTE);
    view.rerender(
      <SessionProvider auth={auth} profiles={{ ensureProfile: vi.fn(async () => ok(undefined)) }}>
        <InactivityHoldProvider>
          <InactivityGuard store={memoryStore()} />
          <KitchenLikeScreen active={false} />
        </InactivityHoldProvider>
      </SessionProvider>,
    );
    await advance(15 * MINUTE + 1_000);
    expect(auth.signOut).toHaveBeenCalled();
  });
});
