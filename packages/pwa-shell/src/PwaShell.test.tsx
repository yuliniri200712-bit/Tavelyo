// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PwaShell } from './PwaShell.tsx';

const idle = { needRefresh: false, onUpdate: vi.fn(), onDismiss: vi.fn() };

describe('PwaShell', () => {
  it('muestra el logotipo aprobado con texto alternativo y el módulo', () => {
    render(
      <PwaShell appLabel="Operaciones" update={idle}>
        <p>Contenido</p>
      </PwaShell>,
    );
    const logo = screen.getByRole('img', { name: 'Tavelyo' });
    // Vite sirve el maestro por URL o lo incrusta como data: según su tamaño.
    expect(logo.getAttribute('src')).toMatch(/tavelyo-logo-master\.svg|^data:image\/svg\+xml/);
    expect(screen.getByText('Operaciones')).toBeTruthy();
    expect(screen.getByRole('main').textContent).toBe('Contenido');
  });

  it('el enlace para saltar al contenido apunta al main', () => {
    render(
      <PwaShell appLabel="Menú" update={idle}>
        <p>Carta</p>
      </PwaShell>,
    );
    const skip = screen.getByRole('link', { name: 'Saltar al contenido' });
    expect(skip.getAttribute('href')).toBe(`#${screen.getByRole('main').id}`);
  });

  it('avisa al perder la conexión', () => {
    const onLine = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    render(
      <PwaShell appLabel="Menú" update={idle}>
        <p>Carta</p>
      </PwaShell>,
    );
    expect(screen.queryByText(/Sin conexión/)).toBeNull();
    onLine.mockReturnValue(false);
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByText(/Sin conexión/)).toBeTruthy();
    onLine.mockRestore();
  });

  it('ofrece la nueva versión solo cuando existe y la aplica al aceptarla', () => {
    const onUpdate = vi.fn();
    const { rerender } = render(
      <PwaShell appLabel="Menú" update={idle}>
        <p>Carta</p>
      </PwaShell>,
    );
    expect(screen.queryByRole('button', { name: 'Actualizar' })).toBeNull();
    rerender(
      <PwaShell appLabel="Menú" update={{ needRefresh: true, onUpdate, onDismiss: vi.fn() }}>
        <p>Carta</p>
      </PwaShell>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });
});
