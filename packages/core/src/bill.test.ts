import { describe, expect, it } from 'vitest';
import {
  allocatePayment,
  buildBill,
  closeBlockers,
  splitEvenly,
  wholeUnitMinor,
  type BillLineInput,
  type BillSummary,
} from './bill';
import { Money } from './money';

const cop = (pesos: number) => Money.ofMinor(BigInt(pesos) * 100n, 'COP');

function line(
  id: string,
  participantId: string,
  pesos: number,
  status: BillLineInput['status'] = 'DELIVERED',
): BillLineInput {
  // Impoconsumo del 8 % contenido, como lo guarda el pedido.
  return {
    id,
    participantId,
    status,
    lineTotal: cop(pesos),
    tax: cop(pesos).includedTax(800, 'half-up'),
  };
}

function billOf(...args: Parameters<typeof buildBill>): BillSummary {
  const result = buildBill(...args);
  if (!result.ok) throw new Error(`cuenta inválida: ${result.error.kind}`);
  return result.value;
}

const ANA = 'ana';
const LUIS = 'luis';
const LINES = [
  line('l1', ANA, 32_000),
  line('l2', ANA, 12_000),
  line('l3', LUIS, 28_000),
  line('l4', LUIS, 15_000, 'CANCELLED'),
];

describe('buildBill', () => {
  it('suma las líneas que se cobran, sin las canceladas, con el impuesto contenido', () => {
    const bill = billOf('COP', LINES, []);
    expect(bill.lines.map((l) => l.id)).toEqual(['l1', 'l2', 'l3']);
    expect(bill.total.equals(cop(72_000))).toBe(true);
    expect(bill.tax.amountMinor).toBe(
      LINES.slice(0, 3).reduce((sum, l) => sum + l.tax.amountMinor, 0n),
    );
    expect(bill.outstanding.equals(cop(72_000))).toBe(true);
  });

  it('separa lo de cada persona (D-06) y descuenta lo pagado', () => {
    const bill = billOf('COP', LINES, [
      { orderItemId: 'l1', amount: cop(32_000) },
      { orderItemId: 'l3', amount: cop(10_000) },
    ]);
    expect(bill.paid.equals(cop(42_000))).toBe(true);
    expect(bill.outstanding.equals(cop(30_000))).toBe(true);
    expect(bill.byParticipant.get(ANA)?.outstanding.equals(cop(12_000))).toBe(true);
    expect(bill.byParticipant.get(LUIS)?.outstanding.equals(cop(18_000))).toBe(true);
    expect([...bill.byParticipant.keys()]).toEqual([ANA, LUIS]);
  });

  it('rechaza cobrar una línea más de su importe (una línea no se cobra dos veces)', () => {
    const result = buildBill('COP', LINES, [
      { orderItemId: 'l1', amount: cop(20_000) },
      { orderItemId: 'l1', amount: cop(20_000) },
    ]);
    expect(result).toEqual({ ok: false, error: { kind: 'over-allocated', orderItemId: 'l1' } });
  });

  it('rechaza asignar a una línea cancelada o ajena, o un importe negativo', () => {
    expect(buildBill('COP', LINES, [{ orderItemId: 'l4', amount: cop(1) }])).toEqual({
      ok: false,
      error: { kind: 'unknown-line', orderItemId: 'l4' },
    });
    expect(buildBill('COP', LINES, [{ orderItemId: 'l1', amount: cop(-1) }])).toEqual({
      ok: false,
      error: { kind: 'invalid-allocation', orderItemId: 'l1' },
    });
  });

  it('no mezcla monedas en una cuenta', () => {
    const usd = { ...line('l9', ANA, 10), lineTotal: Money.ofMinor(1000n, 'USD') };
    expect(buildBill('COP', [usd], [])).toEqual({
      ok: false,
      error: { kind: 'currency-mismatch', lineId: 'l9' },
    });
  });
});

describe('allocatePayment', () => {
  const bill = billOf('COP', LINES, [{ orderItemId: 'l1', amount: cop(30_000) }]);

  it('reparte el pago por las líneas en orden, sin pasar de lo que falta en cada una', () => {
    const result = allocatePayment(bill, cop(10_000));
    expect(result.ok && result.value.map((a) => [a.orderItemId, a.amount.amountMinor])).toEqual([
      ['l1', 200_000n],
      ['l2', 800_000n],
    ]);
  });

  it('se limita a las líneas elegidas (por ejemplo, las de una persona)', () => {
    const result = allocatePayment(bill, cop(28_000), new Set(['l3']));
    expect(result.ok && result.value).toEqual([{ orderItemId: 'l3', amount: cop(28_000) }]);
  });

  it('no cobra más de lo que falta ni importes vacíos o negativos', () => {
    expect(allocatePayment(bill, cop(42_001))).toEqual({
      ok: false,
      error: { kind: 'exceeds-outstanding', outstanding: cop(42_000) },
    });
    expect(allocatePayment(bill, cop(0))).toEqual({ ok: false, error: { kind: 'invalid-amount' } });
    expect(allocatePayment(bill, cop(-5))).toEqual({
      ok: false,
      error: { kind: 'invalid-amount' },
    });
    expect(allocatePayment(bill, cop(1), new Set(['l4']))).toEqual({
      ok: false,
      error: { kind: 'no-lines' },
    });
  });

  it('lo asignado suma siempre el importe exacto y respeta cada línea', () => {
    for (let pesos = 1; pesos <= 42_000; pesos += 997) {
      const result = allocatePayment(bill, cop(pesos));
      if (!result.ok) throw new Error(result.error.kind);
      const sum = result.value.reduce((s, a) => s + a.amount.amountMinor, 0n);
      expect(sum).toBe(BigInt(pesos) * 100n);
      const after = buildBill('COP', LINES, [
        { orderItemId: 'l1', amount: cop(30_000) },
        ...result.value,
      ]);
      expect(after.ok).toBe(true);
    }
  });
});

describe('splitEvenly', () => {
  it('divide en pesos enteros y la suma es el total exacto', () => {
    expect(splitEvenly(cop(100_000), 3).map((p) => p.amountMinor)).toEqual([
      3_333_400n,
      3_333_300n,
      3_333_300n,
    ]);
  });

  it('para cualquier total y número de partes, suma exacta y diferencias de a lo sumo un peso', () => {
    for (const pesos of [1, 7, 999, 72_000, 123_457]) {
      for (let count = 1; count <= 7; count += 1) {
        const parts = splitEvenly(cop(pesos), count);
        expect(parts.reduce((s, p) => s + p.amountMinor, 0n)).toBe(BigInt(pesos) * 100n);
        const max = parts.reduce((m, p) => (p.amountMinor > m ? p.amountMinor : m), 0n);
        const min = parts.reduce((m, p) => (p.amountMinor < m ? p.amountMinor : m), max);
        expect(max - min <= 100n).toBe(true);
        expect(parts.every((p) => p.amountMinor % 100n === 0n)).toBe(true);
      }
    }
  });

  it('si el total trae centavos, van a la primera parte', () => {
    const parts = splitEvenly(Money.ofMinor(1_050n, 'COP'), 2);
    expect(parts.map((p) => p.amountMinor)).toEqual([550n, 500n]);
  });

  it('la unidad entera depende de la moneda', () => {
    expect(wholeUnitMinor('COP')).toBe(100n);
    expect(wholeUnitMinor('CLP')).toBe(1n);
    expect(() => splitEvenly(cop(10), 0)).toThrow(RangeError);
  });
});

describe('closeBlockers (D-30)', () => {
  it('con saldo pendiente o líneas sin entregar no se puede cerrar', () => {
    const lines = [line('l1', ANA, 10_000, 'READY'), line('l2', ANA, 5_000)];
    const bill = billOf('COP', lines, []);
    expect(closeBlockers(bill)).toEqual([
      { kind: 'balance-due', outstanding: cop(15_000) },
      { kind: 'items-pending', lineIds: ['l1'] },
    ]);
  });

  it('pagada y entregada (las canceladas no cuentan), se puede cerrar', () => {
    const lines = [line('l1', ANA, 10_000), line('l2', ANA, 5_000, 'CANCELLED')];
    const bill = billOf('COP', lines, [{ orderItemId: 'l1', amount: cop(10_000) }]);
    expect(closeBlockers(bill)).toEqual([]);
  });
});
