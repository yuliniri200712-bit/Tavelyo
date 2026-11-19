// Raíz de composición del backend (ADR-0003). Cloud Functions descubre las funciones exportadas.
import { initializeApp } from 'firebase-admin/app';
import { createBillingStore } from './data/billing.ts';
import {
  createCloseTable,
  createReadBill,
  createReadBillPayments,
  createRecordPayment,
  createRefundPayment,
} from './billing/account.ts';
import { getAuth } from 'firebase-admin/auth';
import { getDataConnect } from 'firebase-admin/data-connect';
import { setGlobalOptions } from 'firebase-functions/options';
import { createOperatorDirectory, createSessionRevoker, createStaffAccounts } from './data/auth.ts';
import { createQuoteStore, createSubmitQuoteStore } from './data/order-quotes.ts';
import { createKitchenOrderStore } from './data/orders.ts';
import { createServiceRequestStore } from './data/service-requests.ts';
import {
  createAuditLog,
  createMembershipCommands,
  createMembershipDirectory,
  createTenantProvisioner,
} from './data/sql-connect.ts';
import { createRateLimiter, createTableSessionStore } from './data/table-sessions.ts';
import { createRevokeMember } from './members/revoke-member.ts';
import { createQuoteOrder } from './orders/quote-order.ts';
import { createKitchenDispatcher } from './orders/send-to-kitchen.ts';
import { createSubmitOrder } from './orders/submit-order.ts';
import { createCallables } from './presentation/callables.ts';
import { createProvisionTenant } from './provisioning/provision-tenant.ts';
import { createRequestService } from './service-requests/request-service.ts';
import { systemClock } from './shared/clock.ts';
import { createJoinTableSession } from './table-session/join-table-session.ts';

// Misma región que el servicio de SQL Connect (dataconnect/dataconnect.yaml, provisional).
const LOCATION = 'us-central1';

// Límite de instancias para acotar el coste ante un uso abusivo.
setGlobalOptions({ region: LOCATION, maxInstances: 10 });

// Sin pasarela de pago en el restaurante (ADR-0012): los comensales pagan en el local y el cajero lo
// registra. El módulo de pagos (backend/src/payments) queda para la fase de suscripciones a Tavelyo.

const app = initializeApp();
const auth = getAuth(app);
const dataConnect = getDataConnect(
  { serviceId: 'tavelyo', location: LOCATION, connector: 'tavelyo' },
  app,
);
const limiter = createRateLimiter(dataConnect, () => systemClock.now());
export const {
  closeTable,
  readBill,
  readBillPayments,
  recordPayment,
  refundPayment,
  revokeMember,
  provisionTenant,
  joinTableSession,
  quoteOrder,
  submitOrder,
  requestService,
} = createCallables({
  readBill: createReadBill(createBillingStore(dataConnect)),
  closeTable: createCloseTable(createBillingStore(dataConnect)),
  readBillPayments: createReadBillPayments(createBillingStore(dataConnect)),
  recordPayment: createRecordPayment(createBillingStore(dataConnect)),
  refundPayment: createRefundPayment(createBillingStore(dataConnect)),
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
  submitOrder: createSubmitOrder({
    quotes: createSubmitQuoteStore(dataConnect),
    dispatch: createKitchenDispatcher({ orders: createKitchenOrderStore(dataConnect) }),
    limiter,
    clock: systemClock,
  }),
  requestService: createRequestService({
    requests: createServiceRequestStore(dataConnect),
    limiter,
  }),
});
