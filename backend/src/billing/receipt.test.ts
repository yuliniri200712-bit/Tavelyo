import { describe, expect, it, vi } from 'vitest';
import { err, ok } from '@tavelyo/core';
import { createReadPaymentReceipt, type ReceiptRow, type ReceiptStore } from './receipt.ts';
import { failure, type Actor } from '../shared/outcome.ts';

// Bloque 6a: comprobante comercial del pago, con el NIT de la empresa.

const id = (n: number) => n.toString(16).padStart(32, '0');
const pesos = (n: number) => (BigInt(n) * 100n).toString();
const cashier: Actor = { uid: 'cajero', claims: {}, authTimeSeconds: 0 };
const input = { tenantId: id(1), branchId: id(2), sessionId: id(3), paymentId: id(20) };

const row: ReceiptRow = {
  tenantName: 'Sabor Cucuteño',
  taxId: '800197268-4',
  branchName: 'Centro',
  tableCode: 'M4',
  payment: {
    sessionId: id(3),
    status: 'CONFIRMED',
    method: 'CASH',
    amountMinor: pesos(32_000),
    tipMinor: pesos(3_200),
    currency: 'COP',
    receivedMinor: pesos(40_000),
    changeMinor: pesos(4_800),
    receiptNumber: null,
    confirmedAt: '2026-11-20T18:30:00Z',
    lines: [{ name: 'Mute santandereano', quantity: 1, amountMinor: pesos(32_000) }],
    refundsMinor: [pesos(1_000), pesos(500)],
  },
};

const store = (data: ReceiptRow = row): ReceiptStore => ({
  load: vi.fn(async () => ok(data)),
});

describe('comprobante del pago', () => {
  it('devuelve empresa con NIT, mesa, platos, propina, total, cambio y lo devuelto', async () => {
    const db = store();
    expect(await createReadPaymentReceipt(db)(cashier, input)).toEqual({
      ok: true,
      value: {
        paymentId: id(20),
        tenantName: 'Sabor Cucuteño',
        taxId: '800197268-4',
        branchName: 'Centro',
        tableCode: 'M4',
        paidAt: '2026-11-20T18:30:00Z',
        method: 'CASH',
        receiptNumber: null,
        currency: 'COP',
        lines: [{ name: 'Mute santandereano', quantity: 1, amountMinor: pesos(32_000) }],
        amountMinor: pesos(32_000),
        tipMinor: pesos(3_200),
        totalMinor: pesos(35_200),
        receivedMinor: pesos(40_000),
        changeMinor: pesos(4_800),
        refundedMinor: pesos(1_500),
      },
    });
    expect(db.load).toHaveBeenCalledWith(
      cashier,
      { tenantId: id(1), branchId: id(2), sessionId: id(3) },
      id(20),
    );
  });
  it('sin NIT registrado lo dice con null', async () => {
    expect(
      await createReadPaymentReceipt(store({ ...row, taxId: null }))(cashier, input),
    ).toMatchObject({ ok: true, value: { taxId: null } });
  });
  it.each([
    ['de otra mesa', { sessionId: id(9) }],
    ['sin confirmar', { status: 'PENDING', confirmedAt: null }],
    ['de la pasarela', { method: 'CARD_CAPTURE' as const }],
  ])('un pago %s no tiene comprobante', async (_caso, change) => {
    const data = {
      ...row,
      payment: { ...(row.payment as NonNullable<ReceiptRow['payment']>), ...change },
    };
    expect(await createReadPaymentReceipt(store(data))(cashier, input)).toMatchObject({
      ok: false,
      error: { code: 'not-found' },
    });
  });
  it('un pago inexistente o de otra empresa tampoco', async () => {
    expect(
      await createReadPaymentReceipt(store({ ...row, payment: null }))(cashier, input),
    ).toMatchObject({ ok: false, error: { code: 'not-found' } });
  });
  it('rechaza campos de más y el pago mal escrito sin leer', async () => {
    const db = store();
    for (const data of [
      { ...input, paymentId: 'x' },
      { ...input, amountMinor: '1' },
    ])
      expect((await createReadPaymentReceipt(db)(cashier, data)).ok).toBe(false);
    expect(db.load).not.toHaveBeenCalled();
  });
  it('sin permiso devuelve el rechazo del almacén', async () => {
    const db: ReceiptStore = {
      load: vi.fn(async () => err(failure('permission-denied', 'No tienes acceso a esta cuenta.'))),
    };
    expect(await createReadPaymentReceipt(db)(cashier, input)).toMatchObject({
      ok: false,
      error: { code: 'permission-denied' },
    });
  });
});
