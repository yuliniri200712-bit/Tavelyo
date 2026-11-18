// Flujo del cliente en la mesa (Fases 2 y 3): unirse con sesión anónima, «Revisar pedido» validado
// por el servidor, autorización con el adaptador simulado y envío a cocina, y solicitudes de servicio. Funciones reales en el emulador de Cloud
// Functions, contra Auth y SQL Connect, con dos empresas, IDs alterados y sesiones cerradas.
import { randomUUID } from 'node:crypto';
import {
  PREAUTHORIZATION_CONSENT_VERSION,
  type AuthorizeQuoteResponse,
  type JoinTableSessionResponse,
  type QuoteOrderRequest,
  type QuoteOrderResponse,
  type RequestServiceResponse,
} from '@tavelyo/contracts';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  buildFixture,
  FIXTURE_PRICE_MINOR,
  qrOf,
  type Fixture,
} from '../../dataconnect/tests/support/catalog-fixture.ts';
import {
  admin,
  createAnonymousUser,
  createUser,
  expectOk,
  mutate,
  query,
  type TestUser,
} from '../../dataconnect/tests/support/emulator.ts';
import {
  createProfile,
  insertMembership,
  provisionTenant,
  seedAuthorizationCatalog,
} from '../../dataconnect/tests/support/provisioning.ts';
import { callFunction, type CallResult } from './support/functions.ts';

let ownerA: TestUser;
let waiterA: TestUser;
let kitchenA: TestUser;
let ownerB: TestUser;
let a: Fixture;
let b: Fixture;
let priceIdA: string;

const CONSENT = { consentTextVersion: PREAUTHORIZATION_CONSENT_VERSION };

const tenantBranch = (f: Fixture) => ({ tenantId: f.tenantId, branchId: f.branchId });

function expectOkCall<T>(result: CallResult<T>, label: string): T {
  if (!result.ok) throw new Error(`${label}: ${result.status} ${result.message}`);
  return result.result;
}

function expectFailure<T>(result: CallResult<T>, status: string, message?: RegExp): void {
  expect(result.ok, 'debía fallar').toBe(false);
  if (result.ok) return;
  expect(result.status).toBe(status);
  if (message) expect(result.message).toMatch(message);
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

async function join(user: TestUser, qrPublicId: string) {
  return callFunction<JoinTableSessionResponse>(user, 'joinTableSession', { qrPublicId });
}

/** Cliente unido a la mesa abierta de la empresa indicada. */
async function seatedCustomer(label: string, f: Fixture) {
  const user = await createAnonymousUser(label);
  const joined = expectOkCall(await join(user, f.qrPublicId), `Unirse ${label}`);
  return { user, joined };
}

function order(
  sessionId: string,
  overrides: Partial<QuoteOrderRequest> & { quantity?: number; priceId?: string } = {},
): QuoteOrderRequest {
  const { quantity = 2, priceId = priceIdA, ...rest } = overrides;
  return {
    sessionId,
    idempotencyKey: `revisar-${randomUUID()}`,
    lines: [
      { productId: a.productId, priceId, quantity, optionIds: [a.optionId], note: 'Sin cebolla' },
    ],
    expectedTotalMinor: (BigInt(FIXTURE_PRICE_MINOR) * BigInt(quantity)).toString(),
    ...rest,
  };
}

async function quote(user: TestUser, request: QuoteOrderRequest) {
  return callFunction<QuoteOrderResponse>(user, 'quoteOrder', request);
}

async function storedQuotes(participantId: string) {
  return expectOk(
    await admin<{
      orderQuotes: Array<{
        id: string;
        status: string;
        totalMinor: string;
        taxMinor: string;
        fingerprint: string;
        paymentRef: string | null;
        orderQuoteLines_on_quote: Array<{
          productNameSnapshot: string;
          modifiersSnapshot: string[];
          note: string | null;
        }>;
      }>;
    }>(
      `query ($p: UUID!) { orderQuotes(where: { participantId: { eq: $p } }) { id status totalMinor taxMinor fingerprint paymentRef orderQuoteLines_on_quote { productNameSnapshot modifiersSnapshot note } } }`,
      { p: participantId },
    ),
    'Resúmenes guardados',
  ).orderQuotes;
}

let sessionA: string;

/** Mesa nueva de la empresa A, abierta por el mesero: su QR. */
async function openExtraTable(code: string): Promise<string> {
  const tableId = expectOk(
    await mutate<{ diningTable_insert: { id: string } }>(ownerA, 'CreateTable', {
      ...tenantBranch(a),
      sectorId: a.sectorId,
      code,
      seats: 8,
    }),
    `Mesa ${code}`,
  ).diningTable_insert.id;
  expectOk(
    await mutate(waiterA, 'OpenTableSession', { ...tenantBranch(a), tableId }),
    `Abrir ${code}`,
  );
  return qrOf(ownerA, a.tenantId, a.branchId, tableId);
}

/** Cliente unido a la mesa del QR indicado. */
async function seatedAt(label: string, qrPublicId: string) {
  const user = await createAnonymousUser(label);
  const joined = expectOkCall(await join(user, qrPublicId), `Unirse ${label}`);
  return { user, joined };
}

beforeAll(async () => {
  await seedAuthorizationCatalog();
  ownerA = await createUser('mp-ownerA');
  waiterA = await createUser('mp-waiterA');
  kitchenA = await createUser('mp-kitchenA');
  ownerB = await createUser('mp-ownerB');
  for (const user of [ownerA, waiterA, kitchenA, ownerB]) await createProfile(user);
  const tenantA = await provisionTenant('Mesa y pedido A', ownerA, ['Centro']);
  const tenantB = await provisionTenant('Mesa y pedido B', ownerB, ['Sur']);
  await insertMembership(tenantA.id, waiterA, 'waiter', [tenantA.branches['Centro'] ?? '']);
  await insertMembership(tenantA.id, kitchenA, 'kitchen', [tenantA.branches['Centro'] ?? '']);
  a = await buildFixture(ownerA, tenantA.id, tenantA.branches['Centro'] ?? '');
  b = await buildFixture(ownerB, tenantB.id, tenantB.branches['Sur'] ?? '');
  priceIdA = await currentPriceId(a, ownerA);
});

describe('joinTableSession', () => {
  it('sin sesión de Auth, con QR inventado o con la mesa sin abrir no se une', async () => {
    expectFailure(
      await callFunction(null, 'joinTableSession', { qrPublicId: a.qrPublicId }),
      'UNAUTHENTICATED',
    );
    const visitor = await createAnonymousUser('mp-visitante');
    expectFailure(await join(visitor, randomUUID()), 'NOT_FOUND');
    expectFailure(await join(visitor, a.qrPublicId), 'FAILED_PRECONDITION', /mesero/);
    expectFailure(
      await callFunction(visitor, 'joinTableSession', {
        qrPublicId: a.qrPublicId,
        tenantId: a.tenantId,
      }),
      'INVALID_ARGUMENT',
    );
  });

  it('con la mesa abierta se une con sesión anónima; repetir devuelve la misma participación', async () => {
    sessionA = await openTable(a, waiterA);
    const { user, joined } = await seatedCustomer('mp-cliente-1', a);
    expect(joined).toMatchObject({ sessionId: sessionA, tableCode: 'M1' });
    expect(expectOkCall(await join(user, a.qrPublicId), 'Repetir').participantId).toBe(
      joined.participantId,
    );
    const mine = expectOk(
      await query<{ sessionParticipants: Array<{ id: string }> }>(user, 'MyParticipation', {
        sessionId: sessionA,
      }),
      'MyParticipation',
    );
    expect(mine.sessionParticipants.map((p) => p.id)).toEqual([joined.participantId]);
  });

  it('doble pulsación simultánea: una sola participación', async () => {
    const user = await createAnonymousUser('mp-doble');
    const [first, second] = await Promise.all([join(user, a.qrPublicId), join(user, a.qrPublicId)]);
    expect(expectOkCall(first, 'primera').participantId).toBe(
      expectOkCall(second, 'segunda').participantId,
    );
  });

  it('rotar el QR invalida el anterior para unirse', async () => {
    const t = { ...tenantBranch(a), tableId: a.tableId };
    expectOk(await mutate(ownerA, 'RotateTableQr', t), 'Rotar QR');
    const fresh = await qrOf(ownerA, a.tenantId, a.branchId, a.tableId);
    const user = await createAnonymousUser('mp-qr-rotado');
    expectFailure(await join(user, a.qrPublicId), 'NOT_FOUND');
    expectOkCall(await join(user, fresh), 'QR nuevo');
    a = { ...a, qrPublicId: fresh };
  });

  it('límite de solicitudes por persona', async () => {
    const user = await createAnonymousUser('mp-insistente');
    const results = [];
    for (let i = 0; i < 11; i++) results.push(await join(user, a.qrPublicId));
    expect(results.slice(0, 10).every((r) => r.ok)).toBe(true);
    expectFailure(results[10] as CallResult<unknown>, 'RESOURCE_EXHAUSTED');
  });
});

describe('quoteOrder', () => {
  it('guarda el resumen verificable con el total del servidor y el impuesto contenido', async () => {
    const { user, joined } = await seatedCustomer('mp-pide', a);
    const result = expectOkCall(await quote(user, order(sessionA)), 'Revisar pedido');
    // $ 64.000 con impoconsumo del 8 % contenido: 6.400.000 × 800 / 10.800 = 474.074,07 → 474.074.
    expect(result).toMatchObject({
      outcome: 'quoted',
      status: 'QUOTED',
      summary: { totalMinor: '6400000', taxMinor: '474074', subtotalMinor: '5925926' },
    });
    const [stored] = await storedQuotes(joined.participantId);
    expect(stored).toMatchObject({ status: 'QUOTED', totalMinor: '6400000', taxMinor: '474074' });
    expect(stored?.fingerprint).toMatch(/^[0-9a-f]{64}$/);
    expect(stored?.orderQuoteLines_on_quote).toEqual([
      expect.objectContaining({ productNameSnapshot: 'Bandeja paisa', note: 'Sin cebolla' }),
    ]);
    const operations = expectOk(
      await admin<{ auditEvents: Array<{ operation: string }> }>(
        `query ($t: UUID!, $actor: String!) { auditEvents(where: { tenant: { id: { eq: $t } }, actorId: { eq: $actor } }) { operation } }`,
        { t: a.tenantId, actor: user.uid },
      ),
      'Auditoría',
    ).auditEvents.map((e) => e.operation);
    expect(operations).toEqual(
      expect.arrayContaining(['session_participant.join', 'order_quote.create']),
    );
  });

  it('doble pulsación y reintento con la misma clave: un solo resumen (caso 3, parcial)', async () => {
    const { user, joined } = await seatedCustomer('mp-doble-pedido', a);
    const request = order(sessionA);
    const [first, second] = await Promise.all([quote(user, request), quote(user, request)]);
    const retry = await quote(user, request);
    const ids = [first, second, retry].map((r) => {
      const value = expectOkCall(r, 'Revisar');
      return value.outcome === 'quoted' ? value.quoteId : '';
    });
    expect(new Set(ids).size).toBe(1);
    expect(await storedQuotes(joined.participantId)).toHaveLength(1);
    // Misma clave con otro contenido.
    expectFailure(
      await quote(user, {
        ...order(sessionA, { quantity: 3 }),
        idempotencyKey: request.idempotencyKey,
      }),
      'INVALID_ARGUMENT',
    );
  });

  it('el importe lo pone el servidor: un total inventado nunca se guarda', async () => {
    const { user, joined } = await seatedCustomer('mp-tramposo', a);
    const result = expectOkCall(
      await quote(user, order(sessionA, { expectedTotalMinor: '100' })),
      'Total inventado',
    );
    expect(result).toMatchObject({
      outcome: 'changed',
      changes: [{ kind: 'total-changed', expectedTotalMinor: '100', totalMinor: '6400000' }],
    });
    expect(await storedQuotes(joined.participantId)).toEqual([]);
    expectFailure(
      await callFunction(user, 'quoteOrder', {
        ...order(sessionA),
        lines: [
          {
            productId: a.productId,
            priceId: priceIdA,
            quantity: 1,
            optionIds: [a.optionId],
            unitPriceMinor: '1',
          },
        ],
      }),
      'INVALID_ARGUMENT',
    );
  });

  it('opciones obligatorias y productos de otra empresa se rechazan', async () => {
    const { user, joined } = await seatedCustomer('mp-opciones', a);
    const withoutOption = order(sessionA);
    const missing = expectOkCall(
      await quote(user, {
        ...withoutOption,
        lines: withoutOption.lines.map((line) => ({ ...line, optionIds: [] })),
      }),
      'Sin opción',
    );
    expect(missing).toEqual({
      outcome: 'rejected',
      problems: [{ kind: 'invalid-options', position: 0, productId: a.productId }],
    });
    const foreign = expectOkCall(
      await quote(user, {
        ...withoutOption,
        lines: [
          { productId: b.productId, priceId: priceIdA, quantity: 1, optionIds: [b.optionId] },
        ],
      }),
      'Producto de B',
    );
    expect(foreign).toMatchObject({
      outcome: 'rejected',
      problems: [{ kind: 'unavailable', productId: b.productId }],
    });
    expect(await storedQuotes(joined.participantId)).toEqual([]);
  });

  it('quien no está en la mesa no obtiene resumen, ni con el id de la sesión de otra empresa', async () => {
    const stranger = await createAnonymousUser('mp-extrano');
    expectFailure(await quote(stranger, order(sessionA)), 'PERMISSION_DENIED');
    const sessionB = await openTable(b, ownerB);
    const { user: customerB } = await seatedCustomer('mp-cliente-b', b);
    expectFailure(await quote(customerB, order(sessionA)), 'PERMISSION_DENIED');
    expectFailure(await callFunction(null, 'quoteOrder', order(sessionA)), 'UNAUTHENTICATED');
    expectOk(
      await mutate(ownerB, 'CloseTableSession', { ...tenantBranch(b), sessionId: sessionB }),
      'Cerrar B',
    );
  });

  it('precio cambiado con el carrito abierto exige confirmar el nuevo importe (caso 5)', async () => {
    const { user, joined } = await seatedCustomer('mp-caso-5', a);
    expectOk(
      await mutate(ownerA, 'ChangePrice', {
        ...tenantBranch(a),
        productId: a.productId,
        amountMinor: '3500000',
        currency: 'COP',
      }),
      'Subir precio',
    );
    const newPriceId = await currentPriceId(a, ownerA);
    const changed = expectOkCall(await quote(user, order(sessionA)), 'Con el precio anterior');
    expect(changed).toMatchObject({
      outcome: 'changed',
      changes: [
        { kind: 'price-changed', previousPriceId: priceIdA, priceId: newPriceId },
        { kind: 'total-changed', totalMinor: '7000000' },
      ],
      summary: { totalMinor: '7000000' },
    });
    expect(await storedQuotes(joined.participantId)).toEqual([]);

    const confirmed = expectOkCall(
      await quote(user, order(sessionA, { priceId: newPriceId, expectedTotalMinor: '7000000' })),
      'Confirmado',
    );
    expect(confirmed).toMatchObject({ outcome: 'quoted', summary: { totalMinor: '7000000' } });
    priceIdA = newPriceId;
  });
});

describe('authorizeQuote (adaptador SIMULADO)', () => {
  async function quotedFor(label: string) {
    const { user, joined } = await seatedCustomer(label, a);
    const quoted = expectOkCall(
      await quote(user, order(sessionA, { expectedTotalMinor: '7000000' })),
      'Revisar',
    );
    if (quoted.outcome !== 'quoted') throw new Error(`esperaba un resumen: ${quoted.outcome}`);
    return { user, joined, quoteId: quoted.quoteId };
  }

  it('autoriza el importe del resumen y lo deja registrado; repetir no autoriza otra vez', async () => {
    const { user, joined, quoteId } = await quotedFor('mp-paga');
    const result = expectOkCall(
      await callFunction(user, 'authorizeQuote', { ...CONSENT, quoteId }),
      'Autorizar',
    );
    expect(result).toEqual({
      quoteId,
      status: 'authorized',
      orderId: expect.any(String),
      simulated: true,
    });
    const [stored] = await storedQuotes(joined.participantId);
    expect(stored).toMatchObject({
      status: 'AUTHORIZED',
      paymentRef: expect.stringMatching(/^sim_/),
    });
    expect(
      expectOkCall(await callFunction(user, 'authorizeQuote', { ...CONSENT, quoteId }), 'Repetir'),
    ).toEqual(result);
    expect((await storedQuotes(joined.participantId))[0]?.paymentRef).toBe(stored?.paymentRef);
  });

  it('rechazado, requiere acción y tiempo agotado', async () => {
    const declined = await quotedFor('mp-rechazado');
    expect(
      expectOkCall(
        await callFunction(declined.user, 'authorizeQuote', {
          ...CONSENT,
          quoteId: declined.quoteId,
          simulatedOutcome: 'declined',
        }),
        'Rechazo',
      ),
    ).toMatchObject({ status: 'declined' });
    expect((await storedQuotes(declined.joined.participantId))[0]?.status).toBe('DECLINED');

    const action = await quotedFor('mp-accion');
    expect(
      expectOkCall(
        await callFunction(action.user, 'authorizeQuote', {
          ...CONSENT,
          quoteId: action.quoteId,
          simulatedOutcome: 'requires_action',
        }),
        'Acción',
      ),
    ).toMatchObject({ status: 'requires_action' });
    expect((await storedQuotes(action.joined.participantId))[0]?.status).toBe('QUOTED');

    const timeout = await quotedFor('mp-sin-respuesta');
    expect(
      expectOkCall(
        await callFunction(timeout.user, 'authorizeQuote', {
          ...CONSENT,
          quoteId: timeout.quoteId,
          simulatedOutcome: 'timeout',
        }),
        'Tiempo agotado',
      ),
    ).toMatchObject({ status: 'authorized' });
  });

  it('nadie autoriza el resumen de otra persona', async () => {
    const { quoteId } = await quotedFor('mp-dueno');
    const other = await seatedCustomer('mp-vecino', a);
    expectFailure(
      await callFunction(other.user, 'authorizeQuote', { ...CONSENT, quoteId }),
      'NOT_FOUND',
    );
    expectFailure(
      await callFunction(ownerA, 'authorizeQuote', { ...CONSENT, quoteId }),
      'NOT_FOUND',
    );
  });
});

describe('envío a cocina al autorizar (Fase 3, D-04)', () => {
  let qr: string;
  beforeAll(async () => {
    qr = await openExtraTable('F3-envio');
  });

  async function quotedFor(label: string) {
    const { user, joined } = await seatedAt(label, qr);
    const quoted = expectOkCall(
      await quote(user, order(joined.sessionId, { expectedTotalMinor: '7000000' })),
      'Revisar',
    );
    if (quoted.outcome !== 'quoted') throw new Error(`esperaba un resumen: ${quoted.outcome}`);
    return { user, joined, quoteId: quoted.quoteId };
  }

  const pay = (user: TestUser, quoteId: string) =>
    callFunction<AuthorizeQuoteResponse>(user, 'authorizeQuote', { ...CONSENT, quoteId });

  async function ordersOf(quoteId: string) {
    return expectOk(
      await admin<{
        orders: Array<{
          id: string;
          sentToKitchenAt: string | null;
          orderItems_on_order: Array<{
            status: string;
            quantity: number;
            note: string | null;
            allergensSnapshot: string[] | null;
            orderItemModifiers_on_item: Array<{ nameSnapshot: string }>;
          }>;
        }>;
      }>(
        `query ($q: UUID!) { orders(where: { quoteId: { eq: $q } }) { id sentToKitchenAt orderItems_on_order { status quantity note allergensSnapshot orderItemModifiers_on_item { nameSnapshot } } } }`,
        { q: quoteId },
      ),
      'Pedidos del resumen',
    ).orders;
  }

  async function kitchenQueueIds(): Promise<string[]> {
    const stations = expectOk(
      await query<{ stations: Array<{ id: string; defaultForBranchId: string | null }> }>(
        kitchenA,
        'KitchenStations',
        tenantBranch(a),
      ),
      'Estaciones',
    ).stations;
    const ids: string[] = [];
    for (const station of stations) {
      const queue = expectOk(
        await query<{ orderItems: Array<{ order: { id: string } }> }>(kitchenA, 'KitchenQueue', {
          ...tenantBranch(a),
          stationId: station.id,
        }),
        'Cola de cocina',
      );
      ids.push(...queue.orderItems.map((item) => item.order.id));
    }
    return ids;
  }

  const markAuthorized = (quoteId: string) =>
    admin(`mutation ($q: UUID!) { orderQuote_update(id: $q, data: { status: AUTHORIZED }) }`, {
      q: quoteId,
    });

  it('autorizado, el pedido llega a cocina con sus líneas y el consentimiento queda guardado', async () => {
    const { user, quoteId } = await quotedFor('mp3-envia');
    const paid = expectOkCall(await pay(user, quoteId), 'Autorizar');
    if (paid.status !== 'authorized') throw new Error(`esperaba autorizado: ${paid.status}`);
    const [sent] = await ordersOf(quoteId);
    expect(sent).toMatchObject({
      id: paid.orderId,
      orderItems_on_order: [
        {
          status: 'RECEIVED',
          quantity: 2,
          note: 'Sin cebolla',
          allergensSnapshot: ['huevo'],
          orderItemModifiers_on_item: [{ nameSnapshot: 'Bien asada' }],
        },
      ],
    });
    expect(sent?.sentToKitchenAt).toBeTruthy();
    expect(await kitchenQueueIds()).toContain(paid.orderId);

    const stored = expectOk(
      await admin<{ orderQuote: { consentTextVersion: string; authorizedAt: string | null } }>(
        `query ($q: UUID!) { orderQuote(id: $q) { consentTextVersion authorizedAt } }`,
        { q: quoteId },
      ),
      'Consentimiento',
    ).orderQuote;
    expect(stored.consentTextVersion).toBe(PREAUTHORIZATION_CONSENT_VERSION);
    expect(stored.authorizedAt).toBeTruthy();
  });

  it('doble pulsación y reintento: un solo pedido para el resumen (caso 3)', async () => {
    const { user, quoteId } = await quotedFor('mp3-doble');
    const results = await Promise.all([pay(user, quoteId), pay(user, quoteId)]);
    const orderIds = results.map((result) => {
      const value = expectOkCall(result, 'Pulsación');
      return value.status === 'authorized' ? value.orderId : null;
    });
    expect(orderIds[0]).toBeTruthy();
    expect(orderIds[1]).toBe(orderIds[0]);
    const again = expectOkCall(await pay(user, quoteId), 'Reintento');
    expect(again).toMatchObject({ status: 'authorized', orderId: orderIds[0] });
    expect(await ordersOf(quoteId)).toHaveLength(1);
  });

  it('sin la autorización confirmada no hay pedido', async () => {
    const { user, quoteId } = await quotedFor('mp3-rechazo');
    expectOkCall(
      await callFunction(user, 'authorizeQuote', {
        ...CONSENT,
        quoteId,
        simulatedOutcome: 'declined',
      }),
      'Rechazo',
    );
    const action = await quotedFor('mp3-accion');
    expectOkCall(
      await callFunction(action.user, 'authorizeQuote', {
        ...CONSENT,
        quoteId: action.quoteId,
        simulatedOutcome: 'requires_action',
      }),
      'Acción pendiente',
    );
    expect(await ordersOf(quoteId)).toEqual([]);
    expect(await ordersOf(action.quoteId)).toEqual([]);
  });

  it('un texto de autorización que no es el vigente se rechaza sin autorizar', async () => {
    const { user, quoteId } = await quotedFor('mp3-texto');
    expectFailure(
      await callFunction(user, 'authorizeQuote', { quoteId, consentTextVersion: '2020-01-01' }),
      'FAILED_PRECONDITION',
      /texto de la autorización cambió/,
    );
    expectFailure(await callFunction(user, 'authorizeQuote', { quoteId }), 'INVALID_ARGUMENT');
    expect(
      (await storedQuotes((await quotedFor('mp3-otro')).joined.participantId))[0]?.status,
    ).toBe('QUOTED');
  });

  it('recuperación: autorizado sin pedido, o pedido guardado sin enviar, termina en cocina', async () => {
    // Caída justo después de autorizar: el resumen quedó autorizado y sin pedido.
    const lost = await quotedFor('mp3-caida');
    expectOk(await markAuthorized(lost.quoteId), 'Autorizado sin pedido');
    const recovered = expectOkCall(await pay(lost.user, lost.quoteId), 'Recuperar');
    expect(recovered.status).toBe('authorized');
    expect((await ordersOf(lost.quoteId))[0]?.sentToKitchenAt).toBeTruthy();

    // Caída entre guardar el pedido y enviarlo: nadie lo ve hasta el reintento.
    const half = await quotedFor('mp3-medio');
    const first = expectOkCall(await pay(half.user, half.quoteId), 'Primer envío');
    if (first.status !== 'authorized') throw new Error('esperaba autorizado');
    expectOk(
      await admin(
        `mutation ($o: UUID!) { order_update(id: $o, data: { sentToKitchenAt: null }) }`,
        { o: first.orderId },
      ),
      'Simular la caída',
    );
    expect(await kitchenQueueIds()).not.toContain(first.orderId);
    expect(expectOkCall(await pay(half.user, half.quoteId), 'Reintento')).toMatchObject({
      status: 'authorized',
      orderId: first.orderId,
    });
    expect(await kitchenQueueIds()).toContain(first.orderId);
    expect(await ordersOf(half.quoteId)).toHaveLength(1);
  });

  it('si la persona sale de la mesa antes del envío, no llega a cocina y queda para liberar', async () => {
    const { user, joined, quoteId } = await quotedFor('mp3-sale');
    expectOk(await markAuthorized(quoteId), 'Autorizado');
    expectOk(
      await mutate(waiterA, 'RemoveParticipant', {
        ...tenantBranch(a),
        participantId: joined.participantId,
      }),
      'Retirar',
    );
    expectFailure(await pay(user, quoteId), 'FAILED_PRECONDITION', /no se envió a cocina/);
    expect((await storedQuotes(joined.participantId))[0]?.status).toBe('RELEASE_PENDING');
    expect((await ordersOf(quoteId)).filter((o) => o.sentToKitchenAt !== null)).toEqual([]);
    expectFailure(await pay(user, quoteId), 'FAILED_PRECONDITION', /no se envió a cocina/);
  });
});

describe('requestService (Fase 3)', () => {
  let qr: string;
  beforeAll(async () => {
    qr = await openExtraTable('F3-avisos');
  });

  const ask = (user: TestUser, sessionId: string, kind: string) =>
    callFunction<RequestServiceResponse>(user, 'requestService', { sessionId, kind });

  it('avisa al mesero; repetir el mismo aviso sin atender no crea otro', async () => {
    const { user, joined } = await seatedAt('mp3-llama', qr);
    const sessionId = joined.sessionId;
    expect(expectOkCall(await ask(user, sessionId, 'call_waiter'), 'Llamar')).toEqual({
      status: 'sent',
    });
    const neighbour = await seatedAt('mp3-vecina', qr);
    expect(expectOkCall(await ask(neighbour.user, sessionId, 'call_waiter'), 'Repetir')).toEqual({
      status: 'already-pending',
    });
    expect(expectOkCall(await ask(user, sessionId, 'request_bill'), 'Cuenta')).toEqual({
      status: 'sent',
    });
    const pending = expectOk(
      await query<{ serviceRequests: Array<{ kind: string; session: { id: string } }> }>(
        waiterA,
        'PendingServiceRequests',
        tenantBranch(a),
      ),
      'Solicitudes del mesero',
    ).serviceRequests.filter((r) => r.session.id === sessionId);
    expect(pending.map((r) => r.kind).sort()).toEqual(['CALL_WAITER', 'REQUEST_BILL']);
  });

  it('quien no está en la mesa, o con el id de otra mesa, no avisa; un tipo inventado se rechaza', async () => {
    const { user, joined } = await seatedAt('mp3-tipo', qr);
    const outsider = await createAnonymousUser('mp3-ajeno');
    expectFailure(await ask(outsider, joined.sessionId, 'call_waiter'), 'NOT_FOUND');
    expectFailure(await ask(user, joined.sessionId, 'propina'), 'INVALID_ARGUMENT');
    expectFailure(await ask(user, randomUUID().replaceAll('-', ''), 'call_waiter'), 'NOT_FOUND');
  });
});

describe('expulsión y cierre de la mesa', () => {
  it('el expulsado no pide, no paga ni vuelve a entrar con la misma cuenta', async () => {
    const { user, joined } = await seatedCustomer('mp-expulsado', a);
    const quoted = expectOkCall(
      await quote(user, order(sessionA, { expectedTotalMinor: '7000000' })),
      'Antes',
    );
    if (quoted.outcome !== 'quoted') throw new Error('esperaba un resumen');
    expectOk(
      await mutate(waiterA, 'RemoveParticipant', {
        ...tenantBranch(a),
        participantId: joined.participantId,
      }),
      'Expulsar',
    );
    expectFailure(
      await quote(user, order(sessionA, { expectedTotalMinor: '7000000' })),
      'PERMISSION_DENIED',
    );
    expectFailure(
      await callFunction(user, 'authorizeQuote', { ...CONSENT, quoteId: quoted.quoteId }),
      'NOT_FOUND',
    );
    expectFailure(await join(user, a.qrPublicId), 'PERMISSION_DENIED', /retiró/);
  });

  it('al cerrar la mesa nadie pide ni paga, y la sesión siguiente exige volver a unirse (caso 12)', async () => {
    const { user } = await seatedCustomer('mp-cierre', a);
    const quoted = expectOkCall(
      await quote(user, order(sessionA, { expectedTotalMinor: '7000000' })),
      'Antes',
    );
    if (quoted.outcome !== 'quoted') throw new Error('esperaba un resumen');
    expectOk(
      await mutate(waiterA, 'CloseTableSession', { ...tenantBranch(a), sessionId: sessionA }),
      'Cerrar',
    );
    expectFailure(
      await quote(user, order(sessionA, { expectedTotalMinor: '7000000' })),
      'PERMISSION_DENIED',
    );
    expectFailure(
      await callFunction(user, 'authorizeQuote', { ...CONSENT, quoteId: quoted.quoteId }),
      'NOT_FOUND',
    );
    expectFailure(await join(user, a.qrPublicId), 'FAILED_PRECONDITION');

    const next = await openTable(a, waiterA);
    expectFailure(
      await quote(user, order(next, { expectedTotalMinor: '7000000' })),
      'PERMISSION_DENIED',
    );
    const rejoined = expectOkCall(await join(user, a.qrPublicId), 'Volver a unirse');
    expect(rejoined.sessionId).toBe(next);
    expect(rejoined.sessionId).not.toBe(sessionA);
  });
});
