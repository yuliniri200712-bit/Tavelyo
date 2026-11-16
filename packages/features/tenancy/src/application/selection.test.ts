import { describe, expect, it } from 'vitest';
import type { BranchOption, TenantMembership } from '../domain/index.ts';
import {
  canChangeContext,
  contextKey,
  initialSelection,
  selectionReducer,
  type SelectionEvent,
  type SelectionState,
} from './selection.ts';

const membership = (id: string): TenantMembership => ({
  tenantId: id,
  tenantName: `Empresa ${id}`,
  roleCode: 'waiter',
  roleName: 'Mesero',
  permissions: ['order.create'],
});
const branch = (id: string): BranchOption => ({
  id,
  name: `Sucursal ${id}`,
  currency: 'COP',
  timezone: 'America/Bogota',
});

const run = (...events: SelectionEvent[]): SelectionState =>
  events.reduce(selectionReducer, initialSelection);

describe('selección de empresa y sucursal', () => {
  it('sin membresías no hay contexto', () => {
    expect(run({ type: 'memberships-loaded', memberships: [] }).status).toBe('no-memberships');
  });

  it('con una sola empresa y una sola sucursal queda listo sin preguntar', () => {
    const state = run(
      { type: 'memberships-loaded', memberships: [membership('a')] },
      { type: 'branches-loaded', branches: [branch('1')] },
    );
    expect(state.status).toBe('ready');
    expect(contextKey(state)).toBe('a:1');
    expect(canChangeContext(state)).toBe(false);
  });

  it('con varias empresas pide elegir y luego la sucursal', () => {
    let state = run({
      type: 'memberships-loaded',
      memberships: [membership('a'), membership('b')],
    });
    expect(state.status).toBe('choose-tenant');
    state = selectionReducer(state, { type: 'tenant-chosen', tenantId: 'b' });
    expect(state.status).toBe('loading-branches');
    state = selectionReducer(state, {
      type: 'branches-loaded',
      branches: [branch('1'), branch('2')],
    });
    expect(state.status).toBe('choose-branch');
    state = selectionReducer(state, { type: 'branch-chosen', branchId: '2' });
    expect(contextKey(state)).toBe('b:2');
  });

  it('no acepta una empresa o sucursal que no está en la lista (ID alterado)', () => {
    const tenants = run({
      type: 'memberships-loaded',
      memberships: [membership('a'), membership('b')],
    });
    expect(selectionReducer(tenants, { type: 'tenant-chosen', tenantId: 'z' })).toBe(tenants);
    const branches = run(
      { type: 'memberships-loaded', memberships: [membership('a')] },
      { type: 'branches-loaded', branches: [branch('1'), branch('2')] },
    );
    expect(selectionReducer(branches, { type: 'branch-chosen', branchId: '9' })).toBe(branches);
  });

  it('cambiar de contexto descarta la empresa y la sucursal anteriores', () => {
    const ready = run(
      { type: 'memberships-loaded', memberships: [membership('a'), membership('b')] },
      { type: 'tenant-chosen', tenantId: 'a' },
      { type: 'branches-loaded', branches: [branch('1')] },
    );
    expect(canChangeContext(ready)).toBe(true);
    const changed = selectionReducer(ready, { type: 'change-context' });
    expect(changed.status).toBe('choose-tenant');
    expect(contextKey(changed)).toBeNull();
    expect('branch' in changed).toBe(false);
  });

  it('con una empresa y varias sucursales, cambiar vuelve a elegir sucursal', () => {
    const ready = run(
      { type: 'memberships-loaded', memberships: [membership('a')] },
      { type: 'branches-loaded', branches: [branch('1'), branch('2')] },
      { type: 'branch-chosen', branchId: '1' },
    );
    expect(selectionReducer(ready, { type: 'change-context' }).status).toBe('choose-branch');
  });

  it('una respuesta tardía de otra fase se ignora', () => {
    const choosing = run({
      type: 'memberships-loaded',
      memberships: [membership('a'), membership('b')],
    });
    expect(selectionReducer(choosing, { type: 'branches-loaded', branches: [branch('1')] })).toBe(
      choosing,
    );
  });

  it('un error se puede reintentar desde el principio', () => {
    const failed = selectionReducer(initialSelection, { type: 'failed', error: 'network' });
    expect(failed).toEqual({ status: 'error', error: 'network' });
    expect(selectionReducer(failed, { type: 'reload' })).toEqual(initialSelection);
  });

  it('sin sucursales asignadas se informa', () => {
    const state = run(
      { type: 'memberships-loaded', memberships: [membership('a')] },
      { type: 'branches-loaded', branches: [] },
    );
    expect(state.status).toBe('no-branches');
  });
});

describe('lista de sucursales actualizada', () => {
  const tenant = {
    tenantId: 't',
    tenantName: 'T',
    roleCode: 'tenant_owner',
    roleName: 'Propietario',
    permissions: [],
  };
  const centro = { id: 'b1', name: 'Centro', currency: 'COP', timezone: 'America/Bogota' };
  const ready = {
    status: 'ready' as const,
    memberships: [tenant],
    tenant,
    branches: [centro],
    branch: centro,
  };

  it('añade la sucursal nueva sin cambiar la activa (y habilita cambiar de contexto)', () => {
    const norte = { ...centro, id: 'b2', name: 'Norte' };
    const next = selectionReducer(ready, { type: 'branches-refreshed', branches: [centro, norte] });
    expect(next).toMatchObject({ status: 'ready', branch: centro, branches: [centro, norte] });
    expect(canChangeContext(next)).toBe(true);
    expect(contextKey(next)).toBe(contextKey(ready));
  });

  it('se ignora si la sucursal activa ya no está o si no hay contexto listo', () => {
    expect(selectionReducer(ready, { type: 'branches-refreshed', branches: [] })).toBe(ready);
    expect(
      selectionReducer(initialSelection, { type: 'branches-refreshed', branches: [centro] }),
    ).toBe(initialSelection);
  });
});
