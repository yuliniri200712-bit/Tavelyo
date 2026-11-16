// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { LiveStatus } from './LiveStatus.tsx';
import { ReasonDialog } from './ReasonDialog.tsx';
import { useLiveData, type LiveSubscriber } from './useLiveData.ts';
import type { ServerError } from './useServerData.ts';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

afterEach(() => {
  vi.useRealTimers();
});

const NOW = new Date('2026-11-16T18:12:00Z');
type Outcome =
  | { readonly ok: true; readonly value: string[] }
  | { readonly ok: false; readonly error: ServerError };

function setup(first: Outcome = { ok: true, value: ['a'] }) {
  let subscriber: LiveSubscriber<string[]> | null = null;
  const load = vi.fn(async (): Promise<Outcome> => first);
  const unsubscribe = vi.fn();
  const watch = vi.fn((next: LiveSubscriber<string[]>) => {
    subscriber = next;
    return unsubscribe;
  });
  const command = vi.fn(async () => ({ ok: true as const, value: undefined }));

  function Screen() {
    const { state, notice, refresh, run } = useLiveData(load, watch, {
      now: () => NOW,
      retryMs: 1_000,
    });
    return (
      <>
        <LiveStatus
          state={state}
          formatTime={(date) => date.toISOString().slice(11, 16)}
          liveText="Los cambios llegan solos."
          blockedText="No puedes cambiar nada"
          onRetry={() => void refresh()}
        />
        <p>Datos: {state.data?.join(',') ?? 'ninguno'}</p>
        {notice ? <p>{notice.text}</p> : null}
        <button type="button" onClick={() => void run(command, 'Hecho.')}>
          Cambiar
        </button>
      </>
    );
  }

  const view = render(<Screen />);
  return {
    view,
    load,
    watch,
    unsubscribe,
    command,
    push: (value: string[]) => act(() => subscriber?.onData(value)),
    fail: (error: ServerError) => act(() => subscriber?.onError(error)),
  };
}

describe('useLiveData y LiveStatus', () => {
  it('lee al abrir, se suscribe y aplica cada cambio que llega', async () => {
    const live = setup();
    expect(await screen.findByText('Datos: a')).toBeTruthy();
    expect(screen.getByText('En vivo')).toBeTruthy();
    expect(screen.getByText(/Última actualización a las 18:12/)).toBeTruthy();
    await live.push(['a', 'b']);
    expect(screen.getByText('Datos: a,b')).toBeTruthy();
    expect(live.watch).toHaveBeenCalledTimes(1);
  });

  it('sin red conserva lo último, explica qué se bloquea y se vuelve a suscribir solo', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const live = setup();
    await screen.findByText('Datos: a');
    await live.fail({ kind: 'network' });
    expect(screen.getByText('Sin conexión con el servidor.')).toBeTruthy();
    expect(screen.getByText(/No puedes cambiar nada hasta recuperar la conexión/)).toBeTruthy();
    expect(screen.getByText('Datos: a')).toBeTruthy();
    await act(() => vi.advanceTimersByTimeAsync(1_000));
    await waitFor(() => expect(live.watch).toHaveBeenCalledTimes(2));
    expect(live.unsubscribe).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('En vivo')).toBeTruthy();
  });

  it('sin permiso no reintenta ni ofrece reintentar', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const live = setup();
    await screen.findByText('Datos: a');
    await live.fail({ kind: 'unauthorized' });
    expect(screen.getByText('Sin permiso.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Reintentar ahora' })).toBeNull();
    await act(() => vi.advanceTimersByTimeAsync(5_000));
    expect(live.watch).toHaveBeenCalledTimes(1);
  });

  it('un cambio propio avisa y vuelve a leer lo que dice el servidor', async () => {
    const live = setup();
    await screen.findByText('Datos: a');
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar' }));
    expect(await screen.findByText('Hecho.')).toBeTruthy();
    expect(live.load).toHaveBeenCalledTimes(2);
  });

  it('al recuperar la red vuelve a suscribirse y a leer todo', async () => {
    const live = setup();
    await screen.findByText('Datos: a');
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByText('Sin conexión con el servidor.')).toBeTruthy();
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    await waitFor(() => expect(live.watch).toHaveBeenCalledTimes(2));
    expect(live.load).toHaveBeenCalledTimes(2);
    expect(await screen.findByText('En vivo')).toBeTruthy();
  });
});

describe('ReasonDialog', () => {
  it('no confirma sin un motivo válido y entrega el motivo limpio', () => {
    const onConfirm = vi.fn();
    render(
      <ReasonDialog
        open
        title="¿Entregar sin recoger?"
        confirmLabel="Entregar"
        label="Motivo"
        maxLength={200}
        parse={(text) => (text.trim().length >= 3 ? text.trim() : null)}
        invalidText="Escribe el motivo."
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      >
        <p>Queda en el registro.</p>
      </ReasonDialog>,
    );
    const dialog = screen.getByRole('dialog', { name: '¿Entregar sin recoger?' });
    fireEvent.click(screen.getByRole('button', { name: 'Entregar' }));
    expect(screen.getByText('Escribe el motivo.')).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Motivo'), { target: { value: '  Lo llevé yo ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entregar' }));
    expect(onConfirm).toHaveBeenCalledWith('Lo llevé yo');
    expect(dialog).toBeTruthy();
  });
});
