// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { err, ok } from '@tavelyo/core';
import type { TenancyGateway } from '../domain/index.ts';
import { contextKey } from '../application/selection.ts';
import { TenancyProvider, useTenancy } from './TenancyProvider.tsx';
import { ContextBar, TenantSelector } from './TenantSelector.tsx';

const memberships = [
  {
    tenantId: 'a',
    tenantName: 'La Fonda',
    roleCode: 'waiter',
    roleName: 'Mesero',
    permissions: [],
  },
  {
    tenantId: 'b',
    tenantName: 'El Puerto',
    roleCode: 'cashier',
    roleName: 'Cajero',
    permissions: [],
  },
];
const branchesOf: Record<
  string,
  Array<{ id: string; name: string; currency: string; timezone: string }>
> = {
  a: [{ id: 'a1', name: 'Centro', currency: 'COP', timezone: 'America/Bogota' }],
  b: [
    { id: 'b1', name: 'Malecón', currency: 'COP', timezone: 'America/Bogota' },
    { id: 'b2', name: 'Aeropuerto', currency: 'COP', timezone: 'America/Bogota' },
  ],
};

function fakeGateway(overrides: Partial<TenancyGateway> = {}): TenancyGateway {
  return {
    myMemberships: vi.fn(async () => ok(memberships)),
    myBranches: vi.fn(async (tenantId: string) => ok(branchesOf[tenantId] ?? [])),
    ...overrides,
  };
}

function ActiveContext() {
  const { selection } = useTenancy();
  return <output aria-label="contexto">{contextKey(selection) ?? 'ninguno'}</output>;
}

function renderSelector(gateway: TenancyGateway, onSignOut = vi.fn()) {
  render(
    <TenancyProvider gateway={gateway}>
      <ContextBar userName="Ana" onSignOut={onSignOut} />
      <TenantSelector />
      <ActiveContext />
    </TenancyProvider>,
  );
  return onSignOut;
}

describe('TenantSelector', () => {
  it('elige empresa y sucursal y muestra el contexto activo', async () => {
    renderSelector(fakeGateway());
    fireEvent.click(await screen.findByRole('button', { name: 'El Puerto · Cajero' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Aeropuerto' }));
    expect(screen.getByLabelText('contexto').textContent).toBe('b:b2');
    expect(screen.getByText('Ana · El Puerto · Aeropuerto · Cajero')).toBeTruthy();
  });

  it('cambiar de empresa limpia la sucursal y vuelve a preguntar', async () => {
    renderSelector(fakeGateway());
    fireEvent.click(await screen.findByRole('button', { name: 'La Fonda · Mesero' }));
    expect((await screen.findByLabelText('contexto')).textContent).toBe('a:a1');
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar empresa o sucursal' }));
    expect(screen.getByLabelText('contexto').textContent).toBe('ninguno');
    expect(screen.getByRole('heading', { name: '¿En qué empresa vas a trabajar?' })).toBeTruthy();
  });

  it('el cierre de sesión siempre está visible', async () => {
    const onSignOut = renderSelector(fakeGateway());
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('sin membresías explica qué hacer', async () => {
    renderSelector(fakeGateway({ myMemberships: vi.fn(async () => ok([])) }));
    expect(await screen.findByText('Todavía no tienes acceso a ninguna empresa')).toBeTruthy();
  });

  it('un error de red se muestra y se puede reintentar', async () => {
    const myMemberships = vi
      .fn<TenancyGateway['myMemberships']>()
      .mockResolvedValueOnce(err('network'))
      .mockResolvedValueOnce(ok(memberships));
    renderSelector(fakeGateway({ myMemberships }));
    expect(await screen.findByRole('alert')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('button', { name: 'La Fonda · Mesero' })).toBeTruthy();
  });
});
