import { ok } from '@tavelyo/core';
import { describe, expect, it, vi } from 'vitest';
import type { Actor } from '../shared/outcome.ts';
import {
  createProvisionTenant,
  parseProvisionTenantInput,
  type ProvisionTenantDeps,
} from './provision-tenant.ts';

const operator: Actor = { uid: 'operator', claims: { sub: 'operator' }, authTimeSeconds: 1 };
const input = {
  tenantName: 'Restaurante A',
  branchName: 'Centro',
  currency: 'COP',
  timezone: 'America/Bogota',
  ownerEmail: 'Duena@Restaurante.test',
};

function deps(isOperator = true) {
  return {
    operators: { isPlatformOperator: vi.fn(async () => isOperator) },
    accounts: {
      findOrCreate: vi.fn(async () => ({ uid: 'owner-uid', displayName: 'duena', created: true })),
    },
    provisioner: {
      provision: vi.fn(async () => ({ tenantId: 'tenant-id', branchId: 'branch-id' })),
    },
  } satisfies ProvisionTenantDeps;
}

describe('parseProvisionTenantInput', () => {
  it('normaliza nombres y correo', () => {
    const result = parseProvisionTenantInput({ ...input, tenantName: '  Restaurante A ' });
    expect(result).toEqual(
      ok({ ...input, tenantName: 'Restaurante A', ownerEmail: 'duena@restaurante.test' }),
    );
  });

  it.each([
    ['sin datos', undefined],
    ['nombre de empresa vacío', { ...input, tenantName: '   ' }],
    ['nombre de empresa demasiado largo', { ...input, tenantName: 'x'.repeat(81) }],
    ['sin sucursal', { ...input, branchName: undefined }],
    ['moneda no admitida', { ...input, currency: 'XYZ' }],
    ['moneda en minúsculas', { ...input, currency: 'cop' }],
    ['sin moneda (no se infiere)', { ...input, currency: undefined }],
    ['zona horaria inventada', { ...input, timezone: 'America/Atlantida' }],
    ['correo incompleto', { ...input, ownerEmail: 'duena@' }],
    ['correo que no es texto', { ...input, ownerEmail: 42 }],
    ['correo demasiado largo', { ...input, ownerEmail: `${'a'.repeat(250)}@x.co` }],
    ['campos no admitidos', { ...input, status: 'ACTIVE' }],
  ])('rechaza %s', (_case, data) => {
    const result = parseProvisionTenantInput(data);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('invalid-argument');
  });
});

describe('createProvisionTenant', () => {
  it('crea la empresa con su propietario y registra al operador', async () => {
    const d = deps();
    const result = await createProvisionTenant(d)(operator, input);

    expect(result).toEqual(
      ok({
        tenantId: 'tenant-id',
        branchId: 'branch-id',
        ownerId: 'owner-uid',
        ownerAccountCreated: true,
      }),
    );
    expect(d.accounts.findOrCreate).toHaveBeenCalledWith('duena@restaurante.test');
    expect(d.provisioner.provision).toHaveBeenCalledWith({
      tenantName: 'Restaurante A',
      branchName: 'Centro',
      currency: 'COP',
      timezone: 'America/Bogota',
      ownerId: 'owner-uid',
      ownerDisplayName: 'duena',
      operatorId: 'operator',
    });
  });

  it('quien no es operador no crea nada, ni siquiera con datos no válidos', async () => {
    const d = deps(false);
    for (const data of [input, { tenantName: '' }]) {
      const result = await createProvisionTenant(d)(operator, data);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe('permission-denied');
    }
    expect(d.accounts.findOrCreate).not.toHaveBeenCalled();
    expect(d.provisioner.provision).not.toHaveBeenCalled();
  });

  it('con datos no válidos no crea cuentas', async () => {
    const d = deps();
    const result = await createProvisionTenant(d)(operator, { ...input, currency: 'XYZ' });
    expect(result.ok).toBe(false);
    expect(d.accounts.findOrCreate).not.toHaveBeenCalled();
  });
});
