// Raíz de composición del backend (ADR-0003). Cloud Functions descubre las funciones exportadas.
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDataConnect } from 'firebase-admin/data-connect';
import { setGlobalOptions } from 'firebase-functions/options';
import { createOperatorDirectory, createSessionRevoker, createStaffAccounts } from './data/auth.ts';
import {
  createAuditLog,
  createMembershipCommands,
  createMembershipDirectory,
  createTenantProvisioner,
} from './data/sql-connect.ts';
import { createRevokeMember } from './members/revoke-member.ts';
import { createCallables } from './presentation/callables.ts';
import { createProvisionTenant } from './provisioning/provision-tenant.ts';

// Misma región que el servicio de SQL Connect (dataconnect/dataconnect.yaml, provisional).
const LOCATION = 'us-central1';

// Límite de instancias para acotar el coste ante un uso abusivo.
setGlobalOptions({ region: LOCATION, maxInstances: 10 });

const app = initializeApp();
const auth = getAuth(app);
const dataConnect = getDataConnect(
  { serviceId: 'tavelyo', location: LOCATION, connector: 'tavelyo' },
  app,
);

export const { revokeMember, provisionTenant } = createCallables({
  revokeMember: createRevokeMember({
    memberships: createMembershipCommands(dataConnect),
    directory: createMembershipDirectory(dataConnect),
    sessions: createSessionRevoker(auth),
    audit: createAuditLog(dataConnect),
  }),
  provisionTenant: createProvisionTenant({
    operators: createOperatorDirectory(auth),
    accounts: createStaffAccounts(auth),
    provisioner: createTenantProvisioner(dataConnect),
  }),
});
