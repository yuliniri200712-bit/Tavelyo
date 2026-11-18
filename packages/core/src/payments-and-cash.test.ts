import { describe, expect, it } from 'vitest';
import { cashChange, closeCashCount, expectedCash } from './cash';
import { Money } from './money';
import {
  planSettlement,
  refundableAmount,
  validateRefund,
  type AuthorizationState,
} from './payment-settlement';
import { suggestTip, validateTip } from './tip';

const cop = (pesos: number) => Money.ofMinor(BigInt(pesos) * 100n, 'COP');
const NOW = Date.UTC(2026, 10, 18, 20, 0);
const PARTIAL = { partialCapture: true };

const authorization = (overrides: Partial<AuthorizationState> = {}): AuthorizationState => ({
  status: 'AUTHORIZED',
  authorized: cop(64_000),
  captured: cop(0),
  expiresAtMs: NOW + 3_600_000,
  ...overrides,
});

describe('suggestTip y validateTip (D-05)', () => {
  it('sugiere el 10 % redondeado al peso, con mitades hacia arriba', () => {
    expect(suggestTip(cop(72_000)).equals(cop(7_200))).toBe(true);
    expect(suggestTip(Money.ofMinor(1_500n, 'COP')).equals(cop(2))).toBe(true);
    expect(suggestTip(Money.ofMinor(1_400n, 'COP')).equals(cop(1))).toBe(true);
    expect(suggestTip(cop(0)).isZero()).toBe(true);
    expect(suggestTip(cop(50_000), 1_500).equals(cop(7_500))).toBe(true);
  });

  it('acepta cero (la persona la quita) y rechaza negativas, centavos o más que el consumo', () => {
    expect(validateTip(cop(0), cop(72_000)).ok).toBe(true);
    expect(validateTip(cop(5_000), cop(72_000)).ok).toBe(true);
    expect(validateTip(cop(-1), cop(72_000))).toEqual({
      ok: false,
      error: { kind: 'invalid-amount' },
    });
    expect(validateTip(Money.ofMinor(150n, 'COP'), cop(72_000))).toEqual({
      ok: false,
      error: { kind: 'not-whole-unit' },
    });
    expect(validateTip(cop(72_001), cop(72_000))).toEqual({
      ok: false,
      error: { kind: 'exceeds-consumption' },
    });
  });
});

describe('planSettlement', () => {
  it('captura lo consumido y libera el resto (captura menor, caso 6)', () => {
    expect(planSettlement(authorization(), cop(32_000), NOW, PARTIAL)).toEqual({
      ok: true,
      value: { capture: cop(32_000), release: cop(32_000), shortfall: cop(0) },
    });
  });

  it('nunca captura más de lo autorizado: el exceso queda para otro pago (caso 6)', () => {
    expect(planSettlement(authorization(), cop(70_000), NOW, PARTIAL)).toEqual({
      ok: true,
      value: { capture: cop(64_000), release: cop(0), shortfall: cop(6_000) },
    });
  });

  it('sin consumo (todo cancelado o pagado en efectivo) solo libera', () => {
    expect(planSettlement(authorization(), cop(0), NOW, PARTIAL)).toEqual({
      ok: true,
      value: { capture: cop(0), release: cop(64_000), shortfall: cop(0) },
    });
  });

  it('vencida, ya usada o en otra moneda, no se captura (PM §8, paso 9)', () => {
    expect(planSettlement(authorization({ expiresAtMs: NOW }), cop(1_000), NOW, PARTIAL)).toEqual({
      ok: false,
      error: { kind: 'expired' },
    });
    expect(planSettlement(authorization({ status: 'VOIDED' }), cop(1_000), NOW, PARTIAL)).toEqual({
      ok: false,
      error: { kind: 'not-authorized', status: 'VOIDED' },
    });
    expect(planSettlement(authorization(), Money.ofMinor(100n, 'USD'), NOW, PARTIAL)).toEqual({
      ok: false,
      error: { kind: 'invalid-amount' },
    });
  });

  it('sin vencimiento informado sigue vigente', () => {
    const plan = planSettlement(authorization({ expiresAtMs: null }), cop(10), NOW, PARTIAL);
    expect(plan.ok).toBe(true);
  });

  it('si la pasarela no admite captura parcial, no la intenta', () => {
    const none = { partialCapture: false };
    expect(planSettlement(authorization(), cop(32_000), NOW, none)).toEqual({
      ok: false,
      error: { kind: 'partial-capture-unsupported' },
    });
    expect(planSettlement(authorization(), cop(64_000), NOW, none).ok).toBe(true);
    expect(planSettlement(authorization(), cop(0), NOW, none).ok).toBe(true);
  });

  it('captura más liberación más faltante suman siempre lo necesario', () => {
    for (let pesos = 0; pesos <= 80_000; pesos += 3_331) {
      const result = planSettlement(authorization(), cop(pesos), NOW, PARTIAL);
      if (!result.ok) throw new Error(result.error.kind);
      const { capture, release, shortfall } = result.value;
      expect(capture.plus(release).equals(cop(64_000))).toBe(true);
      expect(capture.plus(shortfall).equals(cop(pesos))).toBe(true);
    }
  });
});

describe('reembolsos (caso 10)', () => {
  const paid = cop(50_000);

  it('descuenta los confirmados y los que siguen en curso; no los rechazados', () => {
    const refunds = [
      { status: 'CONFIRMED' as const, amount: cop(10_000) },
      { status: 'PROCESSING' as const, amount: cop(5_000) },
      { status: 'UNKNOWN' as const, amount: cop(1_000) },
      { status: 'REJECTED' as const, amount: cop(20_000) },
    ];
    expect(refundableAmount(paid, refunds).equals(cop(34_000))).toBe(true);
  });

  it('rechaza un reembolso mayor que lo disponible, vacío o sobre el tope del rol', () => {
    const refunds = [{ status: 'CONFIRMED' as const, amount: cop(45_000) }];
    expect(validateRefund(paid, refunds, cop(5_001), null)).toEqual({
      ok: false,
      error: { kind: 'exceeds-refundable', refundable: cop(5_000) },
    });
    expect(validateRefund(paid, [], cop(0), null)).toEqual({
      ok: false,
      error: { kind: 'invalid-amount' },
    });
    expect(validateRefund(paid, [], cop(30_000), cop(20_000))).toEqual({
      ok: false,
      error: { kind: 'exceeds-limit', limit: cop(20_000) },
    });
    expect(validateRefund(paid, refunds, cop(5_000), cop(20_000)).ok).toBe(true);
  });

  it('un reembolso repetido no supera lo pagado', () => {
    const first = validateRefund(paid, [], cop(50_000), null);
    expect(first.ok).toBe(true);
    expect(
      validateRefund(paid, [{ status: 'REQUESTED', amount: cop(50_000) }], cop(50_000), null).ok,
    ).toBe(false);
  });
});

describe('caja', () => {
  it('calcula el cambio y dice cuánto falta si no alcanza', () => {
    expect(cashChange(cop(72_000), cop(100_000))).toEqual({ ok: true, value: cop(28_000) });
    expect(cashChange(cop(72_000), cop(72_000))).toEqual({ ok: true, value: cop(0) });
    expect(cashChange(cop(72_000), cop(50_000))).toEqual({
      ok: false,
      error: { kind: 'insufficient', missing: cop(22_000) },
    });
  });

  it('efectivo esperado: fondo más entradas y ventas, menos salidas y reembolsos', () => {
    const expected = expectedCash(cop(100_000), [
      { kind: 'SALE', amount: cop(72_000) },
      { kind: 'CASH_IN', amount: cop(20_000) },
      { kind: 'CASH_OUT', amount: cop(15_000) },
      { kind: 'REFUND', amount: cop(12_000) },
    ]);
    expect(expected.equals(cop(165_000))).toBe(true);
    expect(() => expectedCash(cop(0), [{ kind: 'SALE', amount: cop(-1) }])).toThrow(RangeError);
  });

  it('cierre: sin diferencia no pide motivo; con diferencia, sí', () => {
    expect(closeCashCount(cop(165_000), cop(165_000), null)).toEqual({
      ok: true,
      value: { expected: cop(165_000), counted: cop(165_000), difference: cop(0) },
    });
    expect(closeCashCount(cop(165_000), cop(164_000), '  ')).toEqual({
      ok: false,
      error: { kind: 'reason-required', difference: cop(-1_000) },
    });
    const withReason = closeCashCount(cop(165_000), cop(164_000), 'Cambio mal dado');
    expect(withReason.ok && withReason.value.difference.equals(cop(-1_000))).toBe(true);
  });
});
