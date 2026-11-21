/** Datos de la empresa (Fase 4, bloque 6a): el NIT que va en el comprobante. */
export interface SetTenantTaxIdRequest {
  readonly tenantId: string;
  /** Escrito por la persona, con el DV separado con guion («900.123.456-7»). */
  readonly taxId: string;
}

export interface SetTenantTaxIdResponse {
  /** Forma guardada: «900123456-7». */
  readonly taxId: string;
}
