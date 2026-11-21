import type { DataConnect } from 'firebase-admin/data-connect';
import type { TenantStore } from '../tenant/tax-id.ts';

// Datos de la empresa (bloque 6a). Documento exclusivo del Admin SDK: las variables proceden del
// caso de uso. La escritura comprueba membresía activa, empresa activa y tenant.settings.

const SET_TAX_ID = `mutation SetTenantTaxId($tenantId: UUID!, $actorId: String!, $taxId: String!, $tenantRef: String!) @transaction {
  query @redact {
    membership(key: { tenantId: $tenantId, userId: $actorId }) @check(expr: "this != null", message: "EMPRESA_SIN_ACCESO") {
      status @check(expr: "this == 'ACTIVE'", message: "EMPRESA_SIN_ACCESO")
      tenant { status @check(expr: "this == 'ACTIVE'", message: "EMPRESA_SIN_ACCESO") }
      role {
        rolePermissions_on_role(where: { permission: { code: { eq: "tenant.settings" } } })
          @check(expr: "this.size() > 0", message: "EMPRESA_SIN_ACCESO") { permission { code } }
      }
    }
  }
  tenant_update(id: $tenantId, data: { taxId: $taxId })
  auditEvent_insert(data: { tenantId: $tenantId, actorId: $actorId, operation: "tenant.tax_id", resourceType: "tenant", resourceId: $tenantRef })
}`;

export function createTenantStore(dc: DataConnect): TenantStore {
  return {
    async setTaxId(actor, tenantId, taxId) {
      try {
        await dc.executeGraphql(SET_TAX_ID, {
          variables: { tenantId, actorId: actor.uid, taxId, tenantRef: tenantId },
        });
        return true;
      } catch (error) {
        if (error instanceof Error && error.message.includes('EMPRESA_SIN_ACCESO')) return false;
        throw error;
      }
    },
  };
}
