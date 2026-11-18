// Capacidades del esquema de la Fase 4 (caja y pagos), verificadas en el emulador antes de escribir
// el backend y los conectores: una cuenta por sesión, una preautorización por resumen, pagos,
// reembolsos y operaciones sin duplicados por clave de idempotencia (casos 3 y 7), una línea no
// asignada dos veces al mismo pago, avisos de la pasarela deduplicados (caso 8), una sola sesión
// abierta por caja, un conteo por turno, FK compuestas entre empresas y sucursales (caso 1) y la
// versión de la cuenta con cambio condicionado (caso 9).
import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import { admin, createAnonymousUser, createUser, expectOk } from './support/emulator.ts';
import { buildFixture, FIXTURE_PRICE_MINOR, type Fixture } from './support/catalog-fixture.ts';
import {
  createProfile,
  provisionTenant,
  seedAuthorizationCatalog,
} from './support/provisioning.ts';

const REJECTED_REFERENCE = /foreign key|violates|constraint/i;
const DUPLICATE = /duplicate|unique|already exists/i;

interface Table {
  readonly sessionId: string;
  readonly participantId: string;
  readonly quoteId: string;
  readonly itemId: string;
}

let fixture: Fixture;
let otherFixture: Fixture;
let northBranchId: string;
let main: Table;
let other: Table;

async function insertId(document: string, variables: Record<string, unknown>, label: string) {
  const data = expectOk(
    await admin<Record<string, { id: string } | null>>(document, variables),
    label,
  );
  const id = Object.values(data)[0]?.id;
  if (!id) throw new Error(`${label} no devolvió id`);
  return id;
}

const errorsOf = async (document: string, variables: Record<string, unknown>) =>
  (await admin(document, variables)).errors.join(' ');

const scopeOf = (f: Fixture) => ({ t: f.tenantId, b: f.branchId });

/** Mesa abierta con una persona, su resumen autorizado y un pedido de una línea. */
async function openTableWithOrder(f: Fixture, label: string): Promise<Table> {
  const scope = scopeOf(f);
  const sessionId = await insertId(
    `mutation ($t: UUID!, $b: UUID!, $table: UUID!) {
      tableSession_insert(data: { tenantId: $t, branchId: $b, tableId: $table, openTableId: $table, status: OPEN, openedBy: "prueba" })
    }`,
    { ...scope, table: f.tableId },
    `Sesión ${label}`,
  );
  const customer = await createAnonymousUser(`f4-cliente-${label}`);
  const participantId = await insertId(
    `mutation ($t: UUID!, $b: UUID!, $s: UUID!, $uid: String!, $exp: Timestamp!) {
      sessionParticipant_insert(data: { tenantId: $t, branchId: $b, sessionId: $s, authUid: $uid, expiresAt: $exp })
    }`,
    {
      ...scope,
      s: sessionId,
      uid: customer.uid,
      exp: new Date(Date.now() + 3_600_000).toISOString(),
    },
    `Participante ${label}`,
  );
  const quoteId = await insertId(
    `mutation ($t: UUID!, $b: UUID!, $s: UUID!, $p: UUID!, $total: Int64!, $exp: Timestamp!) {
      orderQuote_insert(data: {
        tenantId: $t, branchId: $b, sessionId: $s, participantId: $p, idempotencyKey: "rev_f4",
        fingerprint: "huella", currency: "COP", subtotalMinor: $total, taxMinor: "0", totalMinor: $total,
        status: AUTHORIZED, consentTextVersion: "2026-11-16", consentedAt_expr: "request.time",
        authorizedAt_expr: "request.time", expiresAt: $exp
      })
    }`,
    {
      ...scope,
      s: sessionId,
      p: participantId,
      total: FIXTURE_PRICE_MINOR,
      exp: new Date(Date.now() + 600_000).toISOString(),
    },
    `Resumen ${label}`,
  );
  const stationId = await insertId(
    `mutation ($t: UUID!, $b: UUID!) {
      station_insert(data: { tenantId: $t, branchId: $b, name: "Pagos", sort: 9 })
    }`,
    scope,
    `Estación ${label}`,
  );
  const orderId = await insertId(
    `mutation ($t: UUID!, $b: UUID!, $s: UUID!, $p: UUID!, $q: UUID!) {
      order_insert(data: { tenantId: $t, branchId: $b, sessionId: $s, participantId: $p, quoteId: $q })
    }`,
    { ...scope, s: sessionId, p: participantId, q: quoteId },
    `Pedido ${label}`,
  );
  const itemId = await insertId(
    `mutation ($t: UUID!, $b: UUID!, $o: UUID!, $prod: UUID!, $st: UUID!) {
      orderItem_insert(data: {
        tenantId: $t, branchId: $b, orderId: $o, position: 1, productId: $prod, stationId: $st,
        productNameSnapshot: "Bandeja paisa", quantity: 1, unitPriceMinor: "3200000",
        modifiersMinor: "0", lineTotalMinor: "3200000", taxMinor: "237037", status: DELIVERED
      })
    }`,
    { ...scope, o: orderId, prod: f.productId, st: stationId },
    `Línea ${label}`,
  );
  return { sessionId, participantId, quoteId, itemId };
}

const INSERT_BILL = `mutation ($t: UUID!, $b: UUID!, $s: UUID!) {
  bill_insert(data: { tenantId: $t, branchId: $b, sessionId: $s, currency: "COP", status: OPEN })
}`;

const INSERT_AUTHORIZATION = `mutation ($t: UUID!, $b: UUID!, $s: UUID!, $p: UUID!, $q: UUID!) {
  paymentAuthorization_insert(data: {
    tenantId: $t, branchId: $b, sessionId: $s, participantId: $p, quoteId: $q,
    provider: "simulated", providerRef: "sim_ref", currency: "COP",
    authorizedMinor: "3200000", capturedMinor: "0", status: AUTHORIZED
  })
}`;

const INSERT_PAYMENT = `mutation ($t: UUID!, $b: UUID!, $bill: UUID!, $key: String!, $cash: UUID) {
  billPayment_insert(data: {
    tenantId: $t, branchId: $b, billId: $bill, method: CASH, status: CONFIRMED, idempotencyKey: $key,
    cashSessionId: $cash, currency: "COP", amountMinor: "3200000", tipMinor: "0", createdBy: "prueba"
  })
}`;

const INSERT_ALLOCATION = `mutation ($t: UUID!, $b: UUID!, $pay: UUID!, $item: UUID!) {
  paymentAllocation_insert(data: { tenantId: $t, branchId: $b, paymentId: $pay, orderItemId: $item, amountMinor: "3200000" })
}`;

const INSERT_REGISTER = `mutation ($t: UUID!, $b: UUID!, $n: String!) {
  register_insert(data: { tenantId: $t, branchId: $b, name: $n })
}`;

const OPEN_CASH = `mutation ($t: UUID!, $b: UUID!, $r: UUID!) {
  cashSession_insert(data: {
    tenantId: $t, branchId: $b, registerId: $r, openRegisterId: $r, status: OPEN, currency: "COP",
    openingFloatMinor: "10000000", openedBy: "prueba"
  })
}`;

beforeAll(async () => {
  await seedAuthorizationCatalog();
  const owner = await createUser('f4-owner');
  const otherOwner = await createUser('f4-owner-b');
  for (const user of [owner, otherOwner]) await createProfile(user);
  const tenant = await provisionTenant('Caja A', owner, ['Centro', 'Norte']);
  const otherTenant = await provisionTenant('Caja B', otherOwner, ['Única']);
  northBranchId = tenant.branches['Norte'] ?? '';
  fixture = await buildFixture(owner, tenant.id, tenant.branches['Centro'] ?? '');
  otherFixture = await buildFixture(
    otherOwner,
    otherTenant.id,
    otherTenant.branches['Única'] ?? '',
  );
  main = await openTableWithOrder(fixture, 'a');
  other = await openTableWithOrder(otherFixture, 'b');
});

describe('cuenta', () => {
  let billId: string;

  it('una sola cuenta por sesión de mesa', async () => {
    billId = await insertId(INSERT_BILL, { ...scopeOf(fixture), s: main.sessionId }, 'Cuenta');
    expect(await errorsOf(INSERT_BILL, { ...scopeOf(fixture), s: main.sessionId })).toMatch(
      DUPLICATE,
    );
  });

  it('no se crea con la sesión de otra sucursal o empresa (caso 1)', async () => {
    for (const scope of [
      { t: fixture.tenantId, b: northBranchId },
      { t: otherFixture.tenantId, b: otherFixture.branchId },
    ]) {
      expect(await errorsOf(INSERT_BILL, { ...scope, s: main.sessionId })).toMatch(
        REJECTED_REFERENCE,
      );
    }
  });

  it('la versión empieza en 1 y un cambio condicionado gana una sola vez (caso 9)', async () => {
    const settle = () =>
      admin<{ bill_updateMany: number }>(
        `mutation ($id: UUID!) {
          bill_updateMany(
            where: { id: { eq: $id }, version: { eq: 1 } },
            data: { status: SETTLED, version_update: { inc: 1 } }
          )
        }`,
        { id: billId },
      );
    expect(expectOk(await settle(), 'Primer cajero').bill_updateMany).toBe(1);
    expect(expectOk(await settle(), 'Segundo cajero').bill_updateMany).toBe(0);
  });
});

describe('preautorización', () => {
  it('una sola por resumen', async () => {
    const variables = {
      ...scopeOf(fixture),
      s: main.sessionId,
      p: main.participantId,
      q: main.quoteId,
    };
    await insertId(INSERT_AUTHORIZATION, variables, 'Preautorización');
    expect(await errorsOf(INSERT_AUTHORIZATION, variables)).toMatch(DUPLICATE);
  });

  it('no se vincula al resumen de otra empresa', async () => {
    expect(
      await errorsOf(INSERT_AUTHORIZATION, {
        ...scopeOf(fixture),
        s: main.sessionId,
        p: main.participantId,
        q: other.quoteId,
      }),
    ).toMatch(REJECTED_REFERENCE);
  });
});

describe('pagos, asignaciones y reembolsos', () => {
  let billId: string;
  let paymentId: string;

  beforeAll(async () => {
    billId = await insertId(
      INSERT_BILL,
      { ...scopeOf(otherFixture), s: other.sessionId },
      'Cuenta B',
    );
  });

  it('una misma clave de idempotencia no crea dos pagos en la cuenta (caso 3)', async () => {
    const variables = { ...scopeOf(otherFixture), bill: billId, key: 'cobro-1', cash: null };
    paymentId = await insertId(INSERT_PAYMENT, variables, 'Pago');
    expect(await errorsOf(INSERT_PAYMENT, variables)).toMatch(DUPLICATE);
  });

  it('un pago no asigna dos veces la misma línea', async () => {
    const variables = { ...scopeOf(otherFixture), pay: paymentId, item: other.itemId };
    await insertId(INSERT_ALLOCATION, variables, 'Asignación');
    expect(await errorsOf(INSERT_ALLOCATION, variables)).toMatch(DUPLICATE);
  });

  it('no se asigna una línea de otra empresa (caso 1)', async () => {
    expect(
      await errorsOf(INSERT_ALLOCATION, {
        ...scopeOf(otherFixture),
        pay: paymentId,
        item: main.itemId,
      }),
    ).toMatch(REJECTED_REFERENCE);
  });

  it('un reembolso no se repite con la misma clave (caso 10)', async () => {
    const refund = () =>
      admin(
        `mutation ($t: UUID!, $b: UUID!, $pay: UUID!) {
          refund_insert(data: {
            tenantId: $t, branchId: $b, paymentId: $pay, idempotencyKey: "reembolso-1", currency: "COP",
            amountMinor: "100000", reason: "Plato frío", status: REQUESTED, requestedBy: "prueba"
          })
        }`,
        { ...scopeOf(otherFixture), pay: paymentId },
      );
    expectOk(await refund(), 'Reembolso');
    expect((await refund()).errors.join(' ')).toMatch(DUPLICATE);
  });
});

describe('operaciones con la pasarela y avisos', () => {
  const INSERT_OPERATION = `mutation ($t: UUID!, $b: UUID!, $key: String!) {
    paymentOperation_insert(data: {
      tenantId: $t, branchId: $b, kind: CAPTURE, status: CREATED, idempotencyKey: $key,
      currency: "COP", amountMinor: "3200000"
    })
  }`;

  it('la clave de idempotencia de una operación es única (casos 3 y 7)', async () => {
    const key = `op-${randomUUID()}`;
    await insertId(INSERT_OPERATION, { ...scopeOf(fixture), key }, 'Operación');
    expect(await errorsOf(INSERT_OPERATION, { ...scopeOf(fixture), key })).toMatch(DUPLICATE);
  });

  it('una operación no se registra en una sucursal de otra empresa', async () => {
    expect(
      await errorsOf(INSERT_OPERATION, {
        t: fixture.tenantId,
        b: otherFixture.branchId,
        key: `op-${randomUUID()}`,
      }),
    ).toMatch(REJECTED_REFERENCE);
  });

  it('un aviso repetido de la pasarela se descarta (caso 8)', async () => {
    const id = `evt-${randomUUID()}`;
    const insert = () =>
      admin(
        `mutation ($id: String!) {
          providerEvent_insert(data: { provider: "simulated", externalEventId: $id, type: "capture.succeeded", payloadHash: "abc" })
        }`,
        { id },
      );
    expectOk(await insert(), 'Aviso');
    expect((await insert()).errors.join(' ')).toMatch(DUPLICATE);
  });

  it('una tarea pendiente se guarda con su empresa', async () => {
    expectOk(
      await admin(
        `mutation ($t: UUID!) {
          outboxEvent_insert(data: { tenantId: $t, kind: "void_authorization", payload: "{}", status: PENDING })
        }`,
        { t: fixture.tenantId },
      ),
      'Tarea pendiente',
    );
  });
});

describe('caja', () => {
  let registerId: string;
  let cashSessionId: string;

  it('el nombre de la caja no se repite en la sucursal', async () => {
    registerId = await insertId(
      INSERT_REGISTER,
      { ...scopeOf(fixture), n: 'Caja principal' },
      'Caja',
    );
    expect(await errorsOf(INSERT_REGISTER, { ...scopeOf(fixture), n: 'Caja principal' })).toMatch(
      DUPLICATE,
    );
  });

  it('una sola sesión abierta por caja; cerrada, se puede abrir otra', async () => {
    cashSessionId = await insertId(OPEN_CASH, { ...scopeOf(fixture), r: registerId }, 'Turno');
    expect(await errorsOf(OPEN_CASH, { ...scopeOf(fixture), r: registerId })).toMatch(DUPLICATE);
    expectOk(
      await admin(
        `mutation ($id: UUID!) {
          cashSession_update(key: { id: $id }, data: { status: CLOSED, openRegisterId: null, closedBy: "prueba", closedAt_expr: "request.time" })
        }`,
        { id: cashSessionId },
      ),
      'Cerrar turno',
    );
    await insertId(OPEN_CASH, { ...scopeOf(fixture), r: registerId }, 'Turno siguiente');
  });

  it('un solo conteo por turno', async () => {
    const count = () =>
      admin(
        `mutation ($t: UUID!, $b: UUID!, $s: UUID!) {
          cashCount_insert(data: {
            tenantId: $t, branchId: $b, cashSessionId: $s, expectedMinor: "10000000",
            countedMinor: "9990000", differenceMinor: "-10000", reason: "Faltante", countedBy: "prueba"
          })
        }`,
        { ...scopeOf(fixture), s: cashSessionId },
      );
    expectOk(await count(), 'Conteo');
    expect((await count()).errors.join(' ')).toMatch(DUPLICATE);
  });

  it('una caja no se usa desde otra sucursal y un movimiento no apunta a pagos ajenos (caso 1)', async () => {
    expect(
      await errorsOf(OPEN_CASH, { t: fixture.tenantId, b: northBranchId, r: registerId }),
    ).toMatch(REJECTED_REFERENCE);
    const foreignPayment = expectOk(
      await admin<{ billPayments: Array<{ id: string }> }>(
        `query ($t: UUID!) { billPayments(where: { tenantId: { eq: $t } }, limit: 1) { id } }`,
        { t: otherFixture.tenantId },
      ),
      'Pago de la otra empresa',
    ).billPayments[0]?.id;
    expect(
      await errorsOf(
        `mutation ($t: UUID!, $b: UUID!, $s: UUID!, $pay: UUID!) {
          cashMovement_insert(data: {
            tenantId: $t, branchId: $b, cashSessionId: $s, kind: SALE, amountMinor: "3200000",
            paymentId: $pay, createdBy: "prueba"
          })
        }`,
        { ...scopeOf(fixture), s: cashSessionId, pay: foreignPayment },
      ),
    ).toMatch(REJECTED_REFERENCE);
  });
});
