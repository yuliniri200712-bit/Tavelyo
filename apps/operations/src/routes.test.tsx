// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from './routes.tsx';

const renderAt = (path: string) =>
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />);

describe('rutas de operations', () => {
  it('el catálogo muestra los componentes base', () => {
    renderAt('/catalogo');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Catálogo del sistema de diseño' }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Enviar a cocina' })).toBeTruthy();
    expect(screen.getByLabelText('Correo del personal').getAttribute('aria-invalid')).toBe('true');
  });

  it('una ruta desconocida explica qué pasó', () => {
    renderAt('/no-existe');
    expect(screen.getByRole('heading', { name: 'No encontramos esta página' })).toBeTruthy();
  });
});
