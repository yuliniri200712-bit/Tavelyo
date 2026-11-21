import { describe, expect, it, vi } from 'vitest';
import { createSetTenantTaxId, type TenantStore } from './tax-id.ts';
import type { Actor } from '../shared/outcome.ts';

const owner: Actor = { uid: 'propietario', claims: {}, authTimeSeconds: 0 };
const tenantId = '0'.repeat(31) + '1';
const store = (saved = true): TenantStore => ({ setTaxId: vi.fn(async () => saved) });

describe('NIT de la empresa', () => {
  it('valida el DV y guarda la forma «número-DV»', async () => {
    const db = store();
    expect(await createSetTenantTaxId(db)(owner, { tenantId, taxId: '800.197.268-4' })).toEqual({
      ok: true,
      value: { taxId: '800197268-4' },
    });
    expect(db.setTaxId).toHaveBeenCalledWith(owner, tenantId, '800197268-4');
  });
  it.each(['800197268-5', '800197268', 'abc', ''])('rechaza «%s» sin escribir', async (taxId) => {
    const db = store();
    expect(await createSetTenantTaxId(db)(owner, { tenantId, taxId })).toMatchObject({
      ok: false,
      error: { code: 'invalid-argument', message: expect.stringMatching(/Revisa el NIT/) },
    });
    expect(db.setTaxId).not.toHaveBeenCalled();
  });
  it('rechaza campos de más y una empresa mal escrita', async () => {
    const db = store();
    for (const data of [
      { tenantId, taxId: '800197268-4', name: 'Otra' },
      { tenantId: 'x', taxId: '800197268-4' },
    ])
      expect((await createSetTenantTaxId(db)(owner, data)).ok).toBe(false);
    expect(db.setTaxId).not.toHaveBeenCalled();
  });
  it('sin tenant.settings responde permiso denegado', async () => {
    expect(
      await createSetTenantTaxId(store(false))(owner, { tenantId, taxId: '800197268-4' }),
    ).toMatchObject({ ok: false, error: { code: 'permission-denied' } });
  });
});
