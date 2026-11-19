import { describe, expect, it, vi } from 'vitest';
import { ok } from '@tavelyo/core';
import { accountRevision, createReadBill, createRecordPayment } from './account.ts';
import { parseRecordPayment } from './input.ts';
import type { AccountLine, AccountSnapshot, BillingStore } from './store.ts';
import type { Actor } from '../shared/outcome.ts';

const id = (n: number) => n.toString(16).padStart(32, '0');
const actor: Actor = { uid: 'cajero', claims: {}, authTimeSeconds: 0 };
const scope = { tenantId: id(1), branchId: id(2), sessionId: id(3) };
const line: AccountLine = {
  id: id(4),
  version: 1,
  status: 'RECEIVED',
  lineTotalMinor: '1000000',
  taxMinor: '74074',
  productNameSnapshot: 'Plato',
  quantity: 1,
  order: {
    participantId: id(5),
    sentToKitchenAt: '2026-11-19T12:00:00Z',
    approval: 'NOT_REQUIRED',
  },
};
const snapshot: AccountSnapshot = {
  currency: 'COP',
  open: true,
  roleCode: 'cashier',
  bill: null,
  lines: [line],
  payments: [],
};
const input = {
  ...scope,
  revision: accountRevision(snapshot),
  idempotencyKey: 'pago-prueba-001',
  method: 'CASH',
  currency: 'COP',
  amountMinor: '1000000',
  tipMinor: '100000',
  receivedMinor: '2000000',
};
function store(data = snapshot): BillingStore {
  return {
    load: vi.fn(async () => ok(data)),
    record: vi.fn(async () => true),
    refund: vi.fn(async () => true),
  };
}

describe('cuenta y pagos registrados (4a)', () => {
  it('solo cobra enviados a cocina: descarta pendientes, rechazados, retirados y cancelados', async () => {
    const excluded = ['PENDING', 'REJECTED', 'WITHDRAWN'].map((approval, i) => ({
      ...line,
      id: id(10 + i),
      order: { ...line.order, sentToKitchenAt: null, approval },
    }));
    const result = await createReadBill(
      store({
        ...snapshot,
        lines: [line, ...excluded, { ...line, id: id(20), status: 'CANCELLED' }],
      }),
    )(actor, scope);
    expect(result).toMatchObject({
      ok: true,
      value: {
        totalMinor: '1000000',
        taxMinor: '74074',
        paidMinor: '0',
        outstandingMinor: '1000000',
        lines: [{ id: line.id }],
      },
    });
  });
  it('registra consumo y propina separados y calcula el cambio en el servidor', async () => {
    const db = store();
    expect(await createRecordPayment(db)(actor, input)).toMatchObject({
      ok: true,
      value: { changeMinor: '900000', tipMinor: '100000' },
    });
    expect(db.load).toHaveBeenCalledWith(actor, expect.anything(), 'payment.record');
    expect(db.record).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({ allocations: [{ orderItemId: line.id, amountMinor: '1000000' }] }),
    );
  });
  it.each([
    { amountMinor: '1000001' },
    { receivedMinor: '1000000' },
    { tipMinor: '1000001' },
    { tipMinor: '1' },
    { currency: 'USD' },
    { participantId: id(99) },
    { revision: 'a'.repeat(64) },
  ])('rechaza importes, persona o revisión incorrectos: %j', async (change) => {
    const db = store();
    expect((await createRecordPayment(db)(actor, { ...input, ...change })).ok).toBe(false);
    expect(db.record).not.toHaveBeenCalled();
  });
  it.each(['TERMINAL', 'TRANSFER'])(
    'exige comprobante en %s y no acepta efectivo recibido',
    (method) => {
      const { receivedMinor: _received, ...base } = input;
      void _received;
      expect(parseRecordPayment({ ...base, method }).ok).toBe(false);
      expect(parseRecordPayment({ ...base, method, receiptNumber: 'REF-0001' }).ok).toBe(true);
      expect(parseRecordPayment({ ...input, method, receiptNumber: 'REF-0001' }).ok).toBe(false);
    },
  );
  it.each([
    ['12 caracteres', 'AB12-3456_78', true],
    ['13 caracteres', 'AB12-3456_789', false],
    ['un número de tarjeta de 16 dígitos', '4111111111111111', false],
    ['un número de tarjeta de 13 dígitos', '4222222222222', false],
    ['espacios', 'REF 0001', false],
    ['vacío', '', false],
  ])('número de comprobante con %s (D-36)', (_caso, receiptNumber, valid) => {
    const { receivedMinor: _received, ...base } = input;
    void _received;
    expect(parseRecordPayment({ ...base, method: 'TERMINAL', receiptNumber }).ok).toBe(valid);
  });
  it.each(['cardNumber', 'last4', 'cvv', 'expiry', 'cardToken', 'note'])(
    'rechaza el campo %s antes de consultar o persistir',
    async (field) => {
      const db = store();
      expect(
        (await createRecordPayment(db)(actor, { ...input, [field]: 'dato-no-admitido' })).ok,
      ).toBe(false);
      expect(db.load).not.toHaveBeenCalled();
      expect(db.record).not.toHaveBeenCalled();
    },
  );
  it('rechaza cuenta cerrada y no asigna propina sugerida automáticamente', async () => {
    expect((await createRecordPayment(store({ ...snapshot, open: false }))(actor, input)).ok).toBe(
      false,
    );
    expect(await createRecordPayment(store())(actor, { ...input, tipMinor: '0' })).toMatchObject({
      ok: true,
      value: { tipMinor: '0', changeMinor: '1000000' },
    });
  });
});
