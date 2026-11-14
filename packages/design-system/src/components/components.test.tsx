// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Card } from './Card.tsx';
import { ConfirmDialog } from './ConfirmDialog.tsx';
import { ConnectionNotice, UpdateNotice, useOnlineStatus } from './Notices.tsx';
import { EmptyState, ErrorState, LoadingState } from './States.tsx';
import { StatusChip } from './StatusChip.tsx';
import { TavelyoButton } from './TavelyoButton.tsx';
import { TextField } from './TextField.tsx';

describe('TavelyoButton', () => {
  it.each(['primary', 'secondary', 'destructive'] as const)(
    'variante %s con nombre accesible',
    (variant) => {
      render(<TavelyoButton variant={variant}>Enviar a cocina</TavelyoButton>);
      const button = screen.getByRole('button', { name: 'Enviar a cocina' });
      expect(button.className).toContain(`tv-button--${variant}`);
      expect(button.getAttribute('type')).toBe('button');
    },
  );

  it('ejecuta la acción al pulsar', () => {
    const onClick = vi.fn();
    render(<TavelyoButton onClick={onClick}>Guardar</TavelyoButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('mientras carga conserva el foco, anuncia el estado y evita el doble envío', () => {
    const onClick = vi.fn();
    render(
      <TavelyoButton loading loadingLabel="Enviando…" onClick={onClick}>
        Enviar
      </TavelyoButton>,
    );
    const button = screen.getByRole('button', { name: 'Enviando…' });
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('aria-busy')).toBe('true');
    fireEvent.click(button);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('deshabilitado no ejecuta la acción', () => {
    const onClick = vi.fn();
    render(
      <TavelyoButton disabled onClick={onClick}>
        Cobrar
      </TavelyoButton>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cobrar' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('TextField', () => {
  it('asocia etiqueta persistente y ayuda', () => {
    render(
      <TextField label="Correo" hint="El que usas para entrar" placeholder="nombre@ejemplo.com" />,
    );
    const input = screen.getByLabelText('Correo');
    expect(input.getAttribute('aria-describedby')).toBeTruthy();
    expect(screen.getByText('El que usas para entrar').id).toBe(
      input.getAttribute('aria-describedby'),
    );
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('marca el error y lo enlaza al campo', () => {
    render(<TextField label="Correo" error="Escribe un correo válido" />);
    const input = screen.getByLabelText('Correo');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const errorId = screen.getByText('Escribe un correo válido').id;
    expect(input.getAttribute('aria-describedby')?.split(' ')).toContain(errorId);
  });
});

describe('StatusChip', () => {
  it.each(['neutral', 'success', 'warning', 'error', 'info'] as const)(
    'tono %s muestra el texto',
    (tone) => {
      render(<StatusChip tone={tone} label="Pago pendiente" />);
      expect(screen.getByText('Pago pendiente').className).toBe(`tv-chip tv-chip--${tone}`);
    },
  );
});

describe('Card', () => {
  it('la sección toma su nombre del título', () => {
    render(
      <Card title="Mesa 4" headingLevel={2}>
        <p>Cuenta abierta</p>
      </Card>,
    );
    expect(screen.getByRole('region', { name: 'Mesa 4' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Mesa 4' })).toBeTruthy();
  });
});

describe('ConfirmDialog', () => {
  // jsdom no implementa el modal nativo: sustituto mínimo que solo alterna `open`.
  // El foco atrapado y Escape reales se verifican con Playwright en navegadores.
  beforeAll(() => {
    if (typeof HTMLDialogElement.prototype.showModal === 'function') return;
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.removeAttribute('open');
    };
  });

  const renderDialog = (props: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const view = render(
      <ConfirmDialog
        open
        title="Anular pedido"
        confirmLabel="Anular pedido 18"
        onConfirm={onConfirm}
        onCancel={onCancel}
        {...props}
      >
        <p>Se anula el pedido 18 de la mesa 4.</p>
      </ConfirmDialog>,
    );
    return { ...view, onConfirm, onCancel };
  };

  it('se abre como modal con título y descripción', () => {
    renderDialog();
    const dialog = screen.getByRole('dialog', { name: 'Anular pedido' });
    expect((dialog as HTMLDialogElement).open).toBe(true);
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('confirma y cancela', () => {
    const { onConfirm, onCancel } = renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Anular pedido 18' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('Escape cancela salvo mientras la operación está en curso', () => {
    const { onCancel, rerender, onConfirm } = renderDialog();
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    rerender(
      <ConfirmDialog
        open
        busy
        title="Anular pedido"
        confirmLabel="Anular pedido 18"
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        <p>Se anula el pedido 18 de la mesa 4.</p>
      </ConfirmDialog>,
    );
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('en acciones destructivas el foco inicial va a «Cancelar»', () => {
    renderDialog({ destructive: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByRole('button', { name: 'Anular pedido 18' }).className).toContain(
      'tv-button--destructive',
    );
  });

  it('se cierra cuando open pasa a false', () => {
    const { rerender, onConfirm, onCancel } = renderDialog();
    rerender(
      <ConfirmDialog
        open={false}
        title="Anular pedido"
        confirmLabel="Anular"
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        <p>Texto</p>
      </ConfirmDialog>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('Avisos', () => {
  it('sin conexión explica que nada se confirma', () => {
    render(<ConnectionNotice online={false} />);
    expect(screen.getByRole('status').textContent).toContain('ningún pedido ni pago se confirma');
  });

  it('con conexión la región viva queda vacía', () => {
    render(<ConnectionNotice online />);
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('useOnlineStatus sigue los eventos del navegador', () => {
    const onLine = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    function Probe() {
      return <ConnectionNotice online={useOnlineStatus()} />;
    }
    render(<Probe />);
    expect(screen.getByRole('status').textContent).toBe('');
    onLine.mockReturnValue(false);
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByRole('status').textContent).toContain('Sin conexión');
    onLine.mockRestore();
  });

  it('la nueva versión se aplica solo si la persona la acepta', () => {
    const onUpdate = vi.fn();
    const onDismiss = vi.fn();
    render(<UpdateNotice onUpdate={onUpdate} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Más tarde' }));
    expect(onUpdate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('Estados', () => {
  it('carga se anuncia como estado', () => {
    render(<LoadingState message="Cargando pedidos…" />);
    expect(screen.getByRole('status').textContent).toBe('Cargando pedidos…');
  });

  it('error se anuncia como alerta y ofrece reintentar', () => {
    const onRetry = vi.fn();
    render(
      <ErrorState
        title="No se pudieron cargar los pedidos"
        description="Revisa la conexión."
        onRetry={onRetry}
      />,
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('vacío explica qué falta y no se anuncia como error', () => {
    render(
      <EmptyState title="Sin pedidos" description="Todavía no hay pedidos en esta sucursal." />,
    );
    expect(screen.getByRole('heading', { name: 'Sin pedidos' })).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
