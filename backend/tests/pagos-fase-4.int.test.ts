// Pagos en el backend (Fase 4, bloque 3) contra los emuladores de Auth, SQL Connect y Functions:
// la autorización real del cliente deja su PaymentAuthorization y su operación; captura, liberación,
// reembolso, avisos y conciliación se ejercitan con el libro real (SQL Connect) y un adaptador
// simulado en el propio proceso de la prueba, para inyectar fallos y avisos.
import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getDataConnect } from 'firebase-admin/data-connect';
import {
  PREAUTHORIZATION_CONSENT_VERSION,
  type AuthorizeQuoteResponse,
  type JoinTableSessionResponse,
  type QuoteOrderResponse,
} from '@tavelyo/contracts';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  buildFixture,
  FIXTURE_PRICE_MINOR,
  type Fixture,
} from '../../dataconnect/tests/support/catalog-fixture.ts';
import {
  admin,
  createAnonymousUser,
  createUser,
  expectOk,
  mutate,
  PROJECT_ID,
  query,
  server,
  type TestUser,
} from '../../dataconnect/tests/support/emulator.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
} from '../../dataconnect/tests/support/provisioning.ts';
import { createPaymentQuoteStore } from '../src/data/order-quotes.ts';
import {
  createPaymentLedger,
  createProviderEventStore,
  createReconciliationStore,
  toAuthorization,
} from '../src/data/payments.ts';
import type { AuthorizationRecord } from '../src/payments/ledger.ts';
import { createPaymentProcessor } from '../src/payments/payment-processor.ts';
import { createReceiveProviderNotice } from '../src/payments/receive-provider-notice.ts';
import { createReconcilePayments } from '../src/payments/reconcile-payments.ts';
import {
  createSimulatedPaymentGateway,
  SIMULATED_SIGNATURE_HEADER,
} from '../src/payments/simulated-gateway.ts';
import { callFunction, type CallResult } from './support/functions.ts';

const FUNCTIONS_URL = `http://127.0.0.1:5001/${PROJECT_ID}/us-central1`;
const TOTAL = (BigInt(FIXTURE_PRICE_MINOR) * 2n).toString();
const CASHIER = 'cajero-de-prueba';

// Admin SDK de la prueba contra el emulador (DATA_CONNECT_EMULATOR_HOST).
const dataConnect = getDataConnect(
  { serviceId: 'tavelyo', location: 'us-central1', connector: 'tavelyo' },
  initializeApp({ projectId: PROJECT_ID }, 'pagos-fase-4'),
);
const ledger = createPaymentLedger(dataConnect);
const store = createReconciliationStore(dataConnect);
const quoteStore = createPaymentQuoteStore(dataConnect);
const gateway = createSimulatedPaymentGateway(PROJECT_ID);
const processor = createPaymentProcessor({ gateway, ledger, now: () => new Date() });
const silentLog = { warn: () => undefined, error: () => undefined };
const reconcileAt = (now: Date) =>
  createReconcilePayments({ store, ledger, processor, gateway, now: () => now, log: silentLog })();
const receiveNotice = createReceiveProviderNotice({
  gateway,
  events: createProviderEventStore(dataConnect),
  processor,
  now: () => new Date(),
});

let ownerA: TestUser;
let waiterA: TestUser;
let ownerB: TestUser;
let a: Fixture;
let b: Fixture;
let priceIdA: string;
let sessionA: string;
let billA: string;

const tenantBranch = (f: Fixture) => ({ tenantId: f.tenantId, branchId: f.branchId });

function expectOkCall<T>(result: CallResult<T>, label: string): T {
  if (!result.ok) throw new Error(`${label}: ${result.status} ${result.message}`);
  return result.result;
}

async function currentPriceId(f: Fixture, owner: TestUser): Promise<string> {
  const data = expectOk(
    await query<{ productBranches: Array<{ productId: string; currentPrice: { id: string } }> }>(
      owner,
      'BranchCatalog',
      tenantBranch(f),
    ),
    'BranchCatalog',
  );
  const id = data.productBranches.find((pb) => pb.productId === f.productId)?.currentPrice.id;
  if (!id) throw new Error('Sin precio vigente');
  return id;
}

async function openTable(f: Fixture, staff: TestUser): Promise<string> {
  expectOk(
    await mutate(staff, 'OpenTableSession', { ...tenantBranch(f), tableId: f.tableId }),
    'Abrir mesa',
  );
  const floor = expectOk(
    await query<{
      sectors: Array<{
        diningTables_on_sector: Array<{
          id: string;
          tableSessions_on_table: Array<{ id: string }>;
        }>;
      }>;
    }>(staff, 'FloorView', tenantBranch(f)),
    'FloorView',
  );
  const id = floor.sectors.flatMap((s) => s.diningTables_on_sector).find((t) => t.id === f.tableId)
    ?.tableSessions_on_table[0]?.id;
  if (!id) throw new Error('Sin sesión abierta');
  return id;
}

/** Cliente sentado en la mesa A con un resumen nuevo de $ 64.000. */
async function quotedCustomer(label: string) {
  const user = await createAnonymousUser(label);
  const joined = expectOkCall(
    await callFunction<JoinTableSessionResponse>(user, 'joinTableSession', {
      qrPublicId: a.qrPublicId,
    }),
    `Unirse ${label}`,
  );
  const quoted = expectOkCall(
    await callFunction<QuoteOrderResponse>(user, 'quoteOrder', {
      sessionId: sessionA,
      idempotencyKey: `revisar-${randomUUID()}`,
      lines: [{ productId: a.productId, priceId: priceIdA, quantity: 2, optionIds: [a.optionId] }],
      expectedTotalMinor: TOTAL,
    }),
    `Resumen ${label}`,
  );
  if (quoted.outcome !== 'quoted') throw new Error('El resumen cambió');
  return { user, joined, quoteId: quoted.quoteId };
}

interface AuthorizationRow {
  id: string;
  tenantId: string;
  branchId: string;
  provider: string;
  providerRef: string;
  currency: string;
  authorizedMinor: string;
  capturedMinor: string;
  status: AuthorizationRecord['status'];
  expiresAt: string | null;
  participantId: string;
}

const AUTHORIZATION_FIELDS =
  'id tenantId branchId provider providerRef currency authorizedMinor capturedMinor status expiresAt participantId';

async function authorizationOfQuote(quoteId: string): Promise<AuthorizationRow | undefined> {
  return expectOk(
    await admin<{ paymentAuthorizations: AuthorizationRow[] }>(
      `query ($q: UUID!) { paymentAuthorizations(where: { quoteId: { eq: $q } }) { ${AUTHORIZATION_FIELDS} } }`,
      { q: quoteId },
    ),
    'Autorización del resumen',
  ).paymentAuthorizations[0];
}

async function operation(idempotencyKey: string) {
  return (
    expectOk(
      await admin<{
        paymentOperations: Array<{
          id: string;
          kind: string;
          status: string;
          attempts: number;
          failureCode: string | null;
          providerRef: string | null;
          quoteId: string | null;
        }>;
      }>(
        `query ($k: String!) { paymentOperations(where: { idempotencyKey: { eq: $k } }) { id kind status attempts failureCode providerRef quoteId } }`,
        { k: idempotencyKey },
      ),
      'Operación',
    ).paymentOperations[0] ?? null
  );
}

/**
 * Autorización hecha con el adaptador de ESTA prueba (para poder inyectarle fallos), registrada con
 * las mismas mutaciones que usa authorizeQuote.
 */
async function localAuthorization(label: string): Promise<AuthorizationRecord> {
  const { user, quoteId } = await quotedCustomer(label);
  const quote = await quoteStore.forPayment(quoteId, user.uid);
  if (!quote) throw new Error('Resumen no encontrado');
  const { operation: started } = await ledger.begin({
    ...tenantBranch(a),
    kind: 'AUTHORIZE',
    idempotencyKey: `quote_${quoteId}`,
    currency: 'COP',
    amountMinor: quote.totalMinor,
    providerRef: null,
    quoteId,
  });
  const hold = await gateway.authorize({
    amount: { amountMinor: quote.totalMinor, currency: 'COP' },
    idempotencyKey: `quote_${quoteId}`,
    reference: quoteId,
  });
  expect(
    await quoteStore.setAuthorized(
      quote,
      started.id,
      user.uid,
      {
        provider: 'simulated',
        paymentRef: hold.paymentRef,
        expiresAt: new Date(hold.expiresAt ?? ''),
      },
      PREAUTHORIZATION_CONSENT_VERSION,
    ),
  ).toBe(true);
  const row = await authorizationOfQuote(quoteId);
  if (!row) throw new Error('Sin autorización');
  return toAuthorization(row);
}

async function pendingPayment(authorization: AuthorizationRecord, amountMinor: string) {
  return expectOk(
    await admin<{ billPayment_insert: { id: string } }>(
      `mutation ($t: UUID!, $b: UUID!, $bill: UUID!, $authorization: UUID!, $key: String!, $amount: Int64!) {
        billPayment_insert(data: { tenantId: $t, branchId: $b, billId: $bill, method: CARD_CAPTURE, status: PENDING, idempotencyKey: $key, authorizationId: $authorization, currency: "COP", amountMinor: $amount, tipMinor: 0, createdBy: "${CASHIER}" })
      }`,
      {
        t: a.tenantId,
        b: a.branchId,
        bill: billA,
        authorization: authorization.id,
        key: `cobro-${randomUUID()}`,
        amount: amountMinor,
      },
    ),
    'Pago pendiente',
  ).billPayment_insert.id;
}

async function requestedRefund(paymentId: string, amountMinor: string) {
  return expectOk(
    await admin<{ refund_insert: { id: string } }>(
      `mutation ($t: UUID!, $b: UUID!, $p: UUID!, $key: String!, $amount: Int64!) {
        refund_insert(data: { tenantId: $t, branchId: $b, paymentId: $p, idempotencyKey: $key, currency: "COP", amountMinor: $amount, reason: "Plato equivocado", status: REQUESTED, requestedBy: "${CASHIER}" })
      }`,
      {
        t: a.tenantId,
        b: a.branchId,
        p: paymentId,
        key: `reembolso-${randomUUID()}`,
        amount: amountMinor,
      },
    ),
    'Reembolso solicitado',
  ).refund_insert.id;
}

async function rowStatus(table: 'billPayment' | 'refund' | 'paymentAuthorization', id: string) {
  return expectOk(
    await admin<Record<string, { status: string; providerRef?: string | null } | null>>(
      `query ($id: UUID!) { ${table}(id: $id) { status ${table === 'paymentAuthorization' ? 'capturedMinor' : 'providerRef'} } }`,
      { id },
    ),
    table,
  )[table];
}

beforeAll(async () => {
  await seedAuthorizationCatalog();
  ownerA = await createUser('pg-ownerA');
  waiterA = await createUser('pg-waiterA');
  ownerB = await createUser('pg-ownerB');
  for (const user of [ownerA, waiterA, ownerB]) await createProfile(user);
  const tenantA = await provisionTenant('Pagos A', ownerA, ['Centro']);
  const tenantB = await provisionTenant('Pagos B', ownerB, ['Sur']);
  await insertMembership(tenantA.id, waiterA, 'waiter', [tenantA.branches['Centro'] ?? '']);
  a = await buildFixture(ownerA, tenantA.id, tenantA.branches['Centro'] ?? '');
  b = await buildFixture(ownerB, tenantB.id, tenantB.branches['Sur'] ?? '');
  priceIdA = await currentPriceId(a, ownerA);
  sessionA = await openTable(a, waiterA);
  billA = expectOk(
    await admin<{ bill_insert: { id: string } }>(
      `mutation ($t: UUID!, $b: UUID!, $s: UUID!) { bill_insert(data: { tenantId: $t, branchId: $b, sessionId: $s, currency: "COP", status: OPEN }) }`,
      { ...{ t: a.tenantId, b: a.branchId }, s: sessionA },
    ),
    'Cuenta',
  ).bill_insert.id;
});

describe('autorización del cliente (función real en el emulador)', () => {
  it('deja la operación AUTHORIZE cerrada y nace la PaymentAuthorization del resumen', async () => {
    const { user, joined, quoteId } = await quotedCustomer('pg-autoriza');
    const result = expectOkCall(
      await callFunction<AuthorizeQuoteResponse>(user, 'authorizeQuote', {
        quoteId,
        consentTextVersion: PREAUTHORIZATION_CONSENT_VERSION,
      }),
      'Autorizar',
    );
    expect(result).toMatchObject({ status: 'authorized', simulated: true });
    const authorization = await authorizationOfQuote(quoteId);
    expect(authorization).toMatchObject({
      tenantId: a.tenantId,
      branchId: a.branchId,
      participantId: joined.participantId,
      provider: 'simulated',
      providerRef: expect.stringMatching(/^sim_/),
      currency: 'COP',
      authorizedMinor: TOTAL,
      capturedMinor: '0',
      status: 'AUTHORIZED',
    });
    // Vence a los 7 días, como informa el adaptador simulado.
    const days = (Date.parse(authorization?.expiresAt ?? '') - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(6.9);
    expect(days).toBeLessThanOrEqual(7);
    expect(await operation(`quote_${quoteId}`)).toMatchObject({
      kind: 'AUTHORIZE',
      status: 'SUCCEEDED',
      attempts: 1,
      quoteId,
      providerRef: authorization?.providerRef,
    });

    // Reintentar no crea otra operación ni otra autorización.
    expectOkCall(
      await callFunction<AuthorizeQuoteResponse>(user, 'authorizeQuote', {
        quoteId,
        consentTextVersion: PREAUTHORIZATION_CONSENT_VERSION,
      }),
      'Reintento',
    );
    const count = expectOk(
      await admin<{ paymentAuthorizations: Array<{ id: string }> }>(
        `query ($q: UUID!) { paymentAuthorizations(where: { quoteId: { eq: $q } }) { id } }`,
        { q: quoteId },
      ),
      'Autorizaciones',
    ).paymentAuthorizations.length;
    expect(count).toBe(1);
  });

  it('rechazada: la operación queda FAILED y no hay retención', async () => {
    const { user, quoteId } = await quotedCustomer('pg-rechazo');
    expect(
      expectOkCall(
        await callFunction<AuthorizeQuoteResponse>(user, 'authorizeQuote', {
          quoteId,
          consentTextVersion: PREAUTHORIZATION_CONSENT_VERSION,
          simulatedOutcome: 'declined',
        }),
        'Rechazo',
      ).status,
    ).toBe('declined');
    expect(await operation(`quote_${quoteId}`)).toMatchObject({
      status: 'FAILED',
      failureCode: 'declined',
    });
    expect(await authorizationOfQuote(quoteId)).toBeUndefined();
  });
});

describe('libro de operaciones (SQL Connect real)', () => {
  it('captura: confirma el pago y la autorización una sola vez; repetir no cobra otra vez', async () => {
    const authorization = await localAuthorization('pg-captura');
    const paymentId = await pendingPayment(authorization, FIXTURE_PRICE_MINOR);
    const command = {
      authorization,
      paymentId,
      amountMinor: FIXTURE_PRICE_MINOR,
      actorId: CASHIER,
    };
    expect(await processor.capture(command)).toEqual({ kind: 'succeeded' });
    expect(await rowStatus('billPayment', paymentId)).toEqual({
      status: 'CONFIRMED',
      providerRef: authorization.providerRef,
    });
    expect(await rowStatus('paymentAuthorization', authorization.id)).toEqual({
      status: 'CAPTURED',
      capturedMinor: FIXTURE_PRICE_MINOR,
    });
    expect(await processor.capture(command)).toEqual({ kind: 'succeeded' });
    expect(await operation(`capture_${paymentId}`)).toMatchObject({
      kind: 'CAPTURE',
      status: 'SUCCEEDED',
      attempts: 1,
    });
    const audits = expectOk(
      await admin<{ auditEvents: Array<{ actorId: string }> }>(
        `query ($id: String!) { auditEvents(where: { operation: { eq: "payment.capture" }, resourceId: { eq: $id } }) { actorId } }`,
        { id: paymentId },
      ),
      'Auditoría',
    ).auditEvents;
    expect(audits).toEqual([{ actorId: CASHIER }]);
  });

  it('una operación cerrada no se vuelve a cerrar ni retrocede (caso 8)', async () => {
    const authorization = await localAuthorization('pg-cerrada');
    const paymentId = await pendingPayment(authorization, TOTAL);
    await processor.capture({ authorization, paymentId, amountMinor: TOTAL, actorId: CASHIER });
    const closed = await ledger.byKey(`capture_${paymentId}`);
    if (!closed) throw new Error('sin operación');
    expect(await ledger.settleCapture(closed, 'sim_otra', CASHIER)).toBe(false);
    expect(await ledger.failCapture(closed, 'tarde', CASHIER)).toBe(false);
    await ledger.markUnknown(closed);
    await ledger.retry(closed);
    expect(await operation(`capture_${paymentId}`)).toMatchObject({
      status: 'SUCCEEDED',
      attempts: 1,
    });
    expect((await rowStatus('billPayment', paymentId))?.status).toBe('CONFIRMED');
  });

  it('la clave de idempotencia es única: un segundo intento reutiliza la operación', async () => {
    const authorization = await localAuthorization('pg-clave');
    const wanted = {
      ...tenantBranch(a),
      kind: 'VOID' as const,
      idempotencyKey: `prueba-${randomUUID()}`,
      currency: 'COP',
      amountMinor: authorization.authorizedMinor,
      providerRef: authorization.providerRef,
      authorizationId: authorization.id,
    };
    const first = await ledger.begin(wanted);
    const second = await ledger.begin(wanted);
    expect(first.created).toBe(true);
    expect(second).toMatchObject({ created: false, operation: { id: first.operation.id } });
  });

  it('no se registran operaciones cruzando empresas ni sucursales', async () => {
    const authorization = await localAuthorization('pg-cruce');
    const base = {
      kind: 'VOID',
      idempotencyKey: `cruce-${randomUUID()}`,
      currency: 'COP',
      amountMinor: '1',
      providerRef: 'sim_x',
    };
    // Sucursal de otra empresa.
    const crossBranch = await server('mutation', 'ServerBeginPaymentOperation', {
      ...base,
      tenantId: a.tenantId,
      branchId: b.branchId,
    });
    expect(crossBranch.errors.length).toBeGreaterThan(0);
    // Autorización de la empresa A con la empresa B.
    const crossAuthorization = await server('mutation', 'ServerBeginPaymentOperation', {
      ...base,
      idempotencyKey: `cruce-${randomUUID()}`,
      ...tenantBranch(b),
      authorizationId: authorization.id,
    });
    expect(crossAuthorization.errors.length).toBeGreaterThan(0);
  });

  it('la autorización de un resumen no se registra con otra empresa', async () => {
    const { user, quoteId } = await quotedCustomer('pg-otra-empresa');
    const quote = await quoteStore.forPayment(quoteId, user.uid);
    if (!quote) throw new Error('Resumen no encontrado');
    const { operation: started } = await ledger.begin({
      ...tenantBranch(a),
      kind: 'AUTHORIZE',
      idempotencyKey: `quote_${quoteId}`,
      currency: 'COP',
      amountMinor: quote.totalMinor,
      providerRef: null,
      quoteId,
    });
    await expect(
      quoteStore.setAuthorized(
        { ...quote, tenantId: b.tenantId, branchId: b.branchId },
        started.id,
        user.uid,
        { provider: 'simulated', paymentRef: 'sim_x', expiresAt: null },
        PREAUTHORIZATION_CONSENT_VERSION,
      ),
    ).rejects.toThrow();
    expect(await authorizationOfQuote(quoteId)).toBeUndefined();
    expect((await operation(`quote_${quoteId}`))?.status).toBe('PROCESSING');
  });
});

describe('reembolsos y avisos firmados (casos 8 y 10)', () => {
  it('confirmado por la pasarela: CONFIRMED con la referencia del reembolso', async () => {
    const authorization = await localAuthorization('pg-reembolso');
    const paymentId = await pendingPayment(authorization, TOTAL);
    await processor.capture({ authorization, paymentId, amountMinor: TOTAL, actorId: CASHIER });
    const refundId = await requestedRefund(paymentId, '1000000');
    expect(
      await processor.refund({
        ...tenantBranch(a),
        refundId,
        paymentId,
        paymentRef: authorization.providerRef,
        currency: 'COP',
        amountMinor: '1000000',
        actorId: CASHIER,
      }),
    ).toEqual({ kind: 'succeeded' });
    expect(await rowStatus('refund', refundId)).toEqual({
      status: 'CONFIRMED',
      providerRef: expect.stringMatching(/^sim_rf_/),
    });
  });

  it('en curso: el aviso firmado lo confirma; repetido o fuera de orden no cambia nada', async () => {
    const authorization = await localAuthorization('pg-aviso');
    const paymentId = await pendingPayment(authorization, TOTAL);
    await processor.capture({ authorization, paymentId, amountMinor: TOTAL, actorId: CASHIER });
    const refundId = await requestedRefund(paymentId, '2000000');
    gateway.controls.takeWebhooks();
    gateway.controls.failNext('refund', 'pending');
    expect(
      await processor.refund({
        ...tenantBranch(a),
        refundId,
        paymentId,
        paymentRef: authorization.providerRef,
        currency: 'COP',
        amountMinor: '2000000',
        actorId: CASHIER,
      }),
    ).toEqual({ kind: 'pending' });
    const refund = await rowStatus('refund', refundId);
    expect(refund?.status).toBe('PROCESSING');
    gateway.controls.settleRefund(refund?.providerRef ?? '', 'refunded');
    const [pending, done] = gateway.controls.takeWebhooks();
    if (!pending || !done) throw new Error('faltan avisos');
    const header = (signature: string) => (name: string) =>
      name === SIMULATED_SIGNATURE_HEADER ? signature : undefined;

    expect(await receiveNotice(done.body, header(done.signature))).toEqual({
      status: 200,
      outcome: 'applied',
    });
    expect((await rowStatus('refund', refundId))?.status).toBe('CONFIRMED');
    expect(await receiveNotice(done.body, header(done.signature))).toEqual({
      status: 200,
      outcome: 'duplicate',
    });
    expect(await receiveNotice(pending.body, header(pending.signature))).toEqual({
      status: 200,
      outcome: 'ignored',
    });
    expect((await rowStatus('refund', refundId))?.status).toBe('CONFIRMED');
    const eventId = (JSON.parse(done.body) as { id: string }).id;
    const stored = expectOk(
      await admin<{
        providerEvents: Array<{
          tenantId: string | null;
          outcome: string;
          processedAt: string | null;
          payloadHash: string;
        }>;
      }>(
        `query ($e: String!) { providerEvents(where: { provider: { eq: "simulated" }, externalEventId: { eq: $e } }) { tenantId outcome processedAt payloadHash } }`,
        { e: eventId },
      ),
      'Aviso guardado',
    ).providerEvents;
    expect(stored).toEqual([
      {
        tenantId: a.tenantId,
        outcome: 'applied',
        processedAt: expect.any(String),
        payloadHash: expect.stringMatching(/^[0-9a-f]{64}$/),
      },
    ]);
  });

  it('el punto de entrada del emulador rechaza avisos sin firma válida y otros métodos', async () => {
    const url = `${FUNCTIONS_URL}/paymentWebhook`;
    const get = await fetch(url);
    expect(get.status).toBe(405);
    const body = JSON.stringify({ id: 'evt_falso', type: 'capture.succeeded' });
    const unsigned = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    expect(unsigned.status).toBe(400);
    expect(await unsigned.json()).toEqual({ error: 'rejected' });
    // Firmado con el secreto de OTRA instancia (la de esta prueba): tampoco.
    const foreign = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [SIMULATED_SIGNATURE_HEADER]: gateway.controls.sign(body, new Date()),
      },
      body,
    });
    expect(foreign.status).toBe(400);
  });
});

describe('conciliación (caso 7)', () => {
  it('resuelve una captura sin respuesta repitiendo la misma operación', async () => {
    const authorization = await localAuthorization('pg-concilia');
    const paymentId = await pendingPayment(authorization, TOTAL);
    gateway.controls.failNext('capture', 'timeout-lost');
    expect(
      await processor.capture({ authorization, paymentId, amountMinor: TOTAL, actorId: CASHIER }),
    ).toEqual({ kind: 'unknown' });
    expect(await operation(`capture_${paymentId}`)).toMatchObject({ status: 'UNKNOWN' });
    expect((await rowStatus('billPayment', paymentId))?.status).toBe('PENDING');

    await reconcileAt(new Date(Date.now() + 5 * 60_000));
    expect(await operation(`capture_${paymentId}`)).toMatchObject({
      status: 'SUCCEEDED',
      attempts: 2,
    });
    expect((await rowStatus('billPayment', paymentId))?.status).toBe('CONFIRMED');
  });

  it('libera la retención de un pedido que no llegó a cocina (RELEASE_PENDING)', async () => {
    const authorization = await localAuthorization('pg-liberar');
    const quoteRow = expectOk(
      await admin<{ paymentAuthorization: { quoteId: string; participant: { authUid: string } } }>(
        `query ($id: UUID!) { paymentAuthorization(id: $id) { quoteId participant { authUid } } }`,
        { id: authorization.id },
      ),
      'Resumen de la autorización',
    ).paymentAuthorization;
    const quote = await quoteStore.forPayment(quoteRow.quoteId, quoteRow.participant.authUid);
    if (!quote) throw new Error('Resumen no encontrado');
    await quoteStore.markReleasePending(quote, quoteRow.participant.authUid);

    await reconcileAt(new Date());
    expect((await rowStatus('paymentAuthorization', authorization.id))?.status).toBe('VOIDED');
    expect(await operation(`void_${authorization.id}`)).toMatchObject({
      kind: 'VOID',
      status: 'SUCCEEDED',
    });
  });

  it('autorización perdida con el resumen vencido: registra la retención y la libera', async () => {
    const { quoteId } = await quotedCustomer('pg-huerfana');
    const key = `quote_${quoteId}`;
    const { operation: started } = await ledger.begin({
      ...tenantBranch(a),
      kind: 'AUTHORIZE',
      idempotencyKey: key,
      currency: 'COP',
      amountMinor: TOTAL,
      providerRef: null,
      quoteId,
    });
    await gateway.authorize({
      amount: { amountMinor: TOTAL, currency: 'COP' },
      idempotencyKey: key,
      reference: quoteId,
    });
    await ledger.markUnknown(started);

    // Resumen aún vigente: se espera al cliente.
    await reconcileAt(new Date(Date.now() + 3 * 60_000));
    expect((await operation(key))?.status).toBe('UNKNOWN');

    // Vencido (15 minutos): se registra la retención y se libera.
    await reconcileAt(new Date(Date.now() + 20 * 60_000));
    expect((await operation(key))?.status).toBe('SUCCEEDED');
    const authorization = await authorizationOfQuote(quoteId);
    expect(authorization).toMatchObject({ status: 'VOIDED', authorizedMinor: TOTAL });
    const status = expectOk(
      await admin<{ orderQuote: { status: string } }>(
        `query ($q: UUID!) { orderQuote(id: $q) { status } }`,
        { q: quoteId },
      ),
      'Resumen',
    ).orderQuote.status;
    expect(status).toBe('RELEASE_PENDING');
  });

  it('outbox: libera la retención pedida por otra parte del sistema', async () => {
    const authorization = await localAuthorization('pg-outbox');
    const outboxId = expectOk(
      await admin<{ outboxEvent_insert: { id: string } }>(
        `mutation ($t: UUID!, $p: String!) { outboxEvent_insert(data: { tenantId: $t, kind: "payment.release-authorization", payload: $p, status: PENDING }) }`,
        { t: a.tenantId, p: JSON.stringify({ authorizationId: authorization.id }) },
      ),
      'Tarea',
    ).outboxEvent_insert.id;
    await reconcileAt(new Date(Date.now() + 60_000));
    expect((await rowStatus('paymentAuthorization', authorization.id))?.status).toBe('VOIDED');
    const task = expectOk(
      await admin<{ outboxEvent: { status: string } }>(
        `query ($id: UUID!) { outboxEvent(id: $id) { status } }`,
        { id: outboxId },
      ),
      'Tarea',
    ).outboxEvent;
    expect(task.status).toBe('DONE');
  });
});
