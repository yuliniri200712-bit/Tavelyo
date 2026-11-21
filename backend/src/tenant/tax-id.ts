import { err, ok, parseNit } from '@tavelyo/core';
import type { SetTenantTaxIdResponse } from '@tavelyo/contracts';
import { canonicalUuid } from '../shared/clock.ts';
import { isUuid, readFields } from '../shared/input.ts';
import { failure, type Actor, type Outcome } from '../shared/outcome.ts';

// NIT de la empresa (Fase 4, bloque 6a): va en el comprobante del pago. Lo valida el servidor con
// el dígito de verificación de la DIAN; el navegador solo ayuda a escribirlo.

export interface TenantStore {
  /** Guarda el NIT con auditoría si quien llama tiene tenant.settings; false si no tiene acceso. */
  setTaxId(actor: Actor, tenantId: string, taxId: string): Promise<boolean>;
}

export function createSetTenantTaxId(store: TenantStore) {
  return async (actor: Actor, data: unknown): Promise<Outcome<SetTenantTaxIdResponse>> => {
    const fields = readFields(data, ['tenantId', 'taxId']);
    if (!fields.ok || !isUuid(fields.value.tenantId) || typeof fields.value.taxId !== 'string')
      return err(failure('invalid-argument', 'Revisa los datos de la empresa.'));
    const nit = parseNit(fields.value.taxId);
    if (!nit)
      return err(
        failure(
          'invalid-argument',
          'Revisa el NIT: escribe el número y el dígito de verificación separado con guion (por ejemplo, 900123456-7).',
        ),
      );
    const saved = await store.setTaxId(actor, canonicalUuid(fields.value.tenantId), nit.formatted);
    return saved
      ? ok({ taxId: nit.formatted })
      : err(
          failure('permission-denied', 'No tienes permiso para cambiar los datos de la empresa.'),
        );
  };
}
