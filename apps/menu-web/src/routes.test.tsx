// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from './routes.tsx';

describe('rutas de menu-web', () => {
  it('el inicio pide escanear el QR de la mesa', () => {
    render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/'] })} />);
    expect(screen.getByText(/Escanea el código QR de tu mesa/)).toBeTruthy();
  });
});
