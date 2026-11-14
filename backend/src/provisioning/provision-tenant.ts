import { err, isCurrencyCode, ok, type CurrencyCode } from '@tavelyo/core';
import { validateEmail } from '@tavelyo/identity/application';
import { isTimeZone, readFields, readText } from '../shared/input.ts';
import { failure, type Actor, type Outcome } from '../shared/outcome.ts';

/**
 * Afirmación personalizada de Firebase Auth que identifica al operador de plataforma. Solo la
 * concede el Admin SDK y se lee del servidor de Auth en cada llamada, nunca solo del token.
 */
export const PLATFORM_OPERATOR_CLAIM = 'platform_operator';

export interface ProvisionTenantInput {
  readonly tenantName: string;
  readonly branchName: string;
  /** Explícitas: la moneda y la zona horaria no se infieren (D-01 pendiente). */
  readonly currency: CurrencyCode;
  readonly timezone: string;
  readonly ownerEmail: string;
}

export interface OperatorDirectory {
  /** Comprueba en Auth que la cuenta está activa, tiene la afirmación y su sesión no fue revocada. */
  isPlatformOperator(actor: Actor): Promise<boolean>;
}

export interface StaffAccount {
  readonly uid: string;
  readonly displayName: string;
  readonly created: boolean;
}

export interface StaffAccounts {
  /** Busca la cuenta por correo o la crea sin contraseña (la define con «¿Olvidaste tu contraseña?»). */
  findOrCreate(email: string): Promise<StaffAccount>;
}

export interface TenantProvisioning {
  readonly tenantName: string;
  readonly branchName: string;
  readonly currency: CurrencyCode;
  readonly timezone: string;
  readonly ownerId: string;
  readonly ownerDisplayName: string;
  readonly operatorId: string;
}

export interface ProvisionedTenant {
  readonly tenantId: string;
  readonly branchId: string;
}

export interface TenantProvisioner {
  /** Empresa, primera sucursal, membresía de propietario y auditoría en una sola transacción. */
  provision(request: TenantProvisioning): Promise<ProvisionedTenant>;
}

export interface ProvisionTenantDeps {
  readonly operators: OperatorDirectory;
  readonly accounts: StaffAccounts;
  readonly provisioner: TenantProvisioner;
}

export interface ProvisionTenantResult extends ProvisionedTenant {
  readonly ownerId: string;
  readonly ownerAccountCreated: boolean;
}

const NAME = { min: 2, max: 80 } as const;

export function parseProvisionTenantInput(data: unknown): Outcome<ProvisionTenantInput> {
  const fields = readFields(data, [
    'tenantName',
    'branchName',
    'currency',
    'timezone',
    'ownerEmail',
  ]);
  if (!fields.ok) return err(failure('invalid-argument', fields.error));
  const tenantName = readText(fields.value, 'tenantName', {
    label: 'el nombre de la empresa',
    ...NAME,
  });
  if (!tenantName.ok) return err(failure('invalid-argument', tenantName.error));
  const branchName = readText(fields.value, 'branchName', {
    label: 'el nombre de la sucursal',
    ...NAME,
  });
  if (!branchName.ok) return err(failure('invalid-argument', branchName.error));

  const { currency, timezone, ownerEmail } = fields.value;
  if (typeof currency !== 'string' || !isCurrencyCode(currency)) {
    return err(failure('invalid-argument', 'La moneda no está admitida.'));
  }
  if (!isTimeZone(timezone))
    return err(failure('invalid-argument', 'La zona horaria no es válida.'));
  const email = typeof ownerEmail === 'string' ? validateEmail(ownerEmail) : validateEmail('');
  if (!email.ok) return err(failure('invalid-argument', email.error));
  if (email.value.length > 254)
    return err(failure('invalid-argument', 'El correo es demasiado largo.'));

  return ok({
    tenantName: tenantName.value,
    branchName: branchName.value,
    currency,
    timezone,
    ownerEmail: email.value.toLowerCase(),
  });
}

/** Aprovisionamiento de plataforma: la app nunca crea empresas (ADR-0008). */
export function createProvisionTenant(deps: ProvisionTenantDeps) {
  return async (actor: Actor, data: unknown): Promise<Outcome<ProvisionTenantResult>> => {
    // Primero la autorización: quien no es operador no aprende nada de la validación.
    if (!(await deps.operators.isPlatformOperator(actor))) {
      return err(
        failure('permission-denied', 'Solo el operador de plataforma puede crear empresas.'),
      );
    }
    const input = parseProvisionTenantInput(data);
    if (!input.ok) return input;

    const owner = await deps.accounts.findOrCreate(input.value.ownerEmail);
    const tenant = await deps.provisioner.provision({
      tenantName: input.value.tenantName,
      branchName: input.value.branchName,
      currency: input.value.currency,
      timezone: input.value.timezone,
      ownerId: owner.uid,
      ownerDisplayName: owner.displayName,
      operatorId: actor.uid,
    });
    return ok({ ...tenant, ownerId: owner.uid, ownerAccountCreated: owner.created });
  };
}
