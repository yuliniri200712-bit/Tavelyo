// Raíz de composición del backend (ADR-0003). Cloud Functions descubre las funciones exportadas.
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDataConnect } from 'firebase-admin/data-connect';
import { logger } from 'firebase-functions';
import { setGlobalOptions } from 'firebase-functions/options';
import { createOperatorDirectory, createSessionRevoker, createStaffAccounts } from './data/auth.ts';
import { createPaymentQuoteStore, createQuoteStore } from './data/order-quotes.ts';
import {
  createAuditLog,
  createMembershipCommands,
  createMembershipDirectory,
  createTenantProvisioner,
} from './data/sql-connect.ts';
import { createRateLimiter, createTableSessionStore } from './data/table-sessions.ts';
import { createRevokeMember } from './members/revoke-member.ts';
import { createQuoteOrder } from './orders/quote-order.ts';
import { createAuthorizeQuote } from './payments/authorize-quote.ts';
import {
  configuredProjectId,
  createSimulatedPaymentGateway,
} from './payments/simulated-gateway.ts';
import { createCallables } from './presentation/callables.ts';
import { createProvisionTenant } from './provisioning/provision-tenant.ts';
import { systemClock } from './shared/clock.ts';
import { createJoinTableSession } from './table-session/join-table-session.ts';

// Misma región que el servicio de SQL Connect (dataconnect/dataconnect.yaml, provisional).
const LOCATION = 'us-central1';

// Límite de instancias para acotar el coste ante un uso abusivo.
setGlobalOptions({ region: LOCATION, maxInstances: 10 });

// Fase 2: solo hay pago SIMULADO. Lanza al cargar el backend con un proyecto que no sea demo-*,
// así que en un proyecto real ninguna función llega a servir hasta configurar la pasarela (D-02).
const payments = createSimulatedPaymentGateway(configuredProjectId());
logger.warn(
  'PAGO SIMULADO: el backend usa el adaptador de pago simulado (Fase 2, sin dinero real).',
);

const app = initializeApp();
const auth = getAuth(app);
const dataConnect = getDataConnect(
  { serviceId: 'tavelyo', location: LOCATION, connector: 'tavelyo' },
  app,
);
const limiter = createRateLimiter(dataConnect, () => systemClock.now());

export const { revokeMember, provisionTenant, joinTableSession, quoteOrder, authorizeQuote } =
  createCallables({
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
    joinTableSession: createJoinTableSession({
      sessions: createTableSessionStore(dataConnect),
      limiter,
      clock: systemClock,
    }),
    quoteOrder: createQuoteOrder({
      quotes: createQuoteStore(dataConnect),
      limiter,
      clock: systemClock,
    }),
    authorizeQuote: createAuthorizeQuote({
      quotes: createPaymentQuoteStore(dataConnect),
      payments,
      limiter,
      clock: systemClock,
    }),
  });
