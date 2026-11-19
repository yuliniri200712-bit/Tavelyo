import { PaymentTimeoutError } from '@tavelyo/contracts';
import { describe, expect, it } from 'vitest';
import {
  assertSimulatedPaymentsAllowed,
  configuredProjectId,
  createSimulatedPaymentGateway,
  SimulatedPaymentsNotAllowedError,
} from './simulated-gateway.ts';

// Adaptador simulado (desconectado del restaurante desde ADR-0012; queda para las suscripciones).
describe('adaptador de pago simulado', () => {
  it('se niega a crearse fuera de un proyecto demo-*', () => {
    for (const projectId of ['tavelyo-e2b57', 'demo', 'DEMO-x', 'mi-demo-tavelyo', '', undefined]) {
      expect(() => createSimulatedPaymentGateway(projectId)).toThrow(
        SimulatedPaymentsNotAllowedError,
      );
    }
    expect(() => assertSimulatedPaymentsAllowed('demo-tavelyo')).not.toThrow();
  });

  it('lee el proyecto de Cloud Functions o de FIREBASE_CONFIG', () => {
    expect(configuredProjectId({ GCLOUD_PROJECT: 'tavelyo-e2b57' })).toBe('tavelyo-e2b57');
    expect(configuredProjectId({ FIREBASE_CONFIG: '{"projectId":"demo-tavelyo"}' })).toBe(
      'demo-tavelyo',
    );
    expect(configuredProjectId({ FIREBASE_CONFIG: 'no es json' })).toBeUndefined();
    expect(configuredProjectId({})).toBeUndefined();
  });

  it('rotula cada resultado como simulado y es idempotente por clave', async () => {
    const gateway = createSimulatedPaymentGateway('demo-tavelyo');
    const request = {
      amount: { amountMinor: '100', currency: 'COP' },
      idempotencyKey: 'k1',
      reference: 'q1',
    };
    const first = await gateway.authorize(request);
    expect(first).toMatchObject({
      status: 'authorized',
      simulated: true,
      paymentRef: expect.stringMatching(/^sim_/),
    });
    expect(await gateway.authorize({ ...request, simulatedOutcome: 'declined' })).toEqual(first);
    expect(gateway.simulated).toBe(true);
  });

  it('separa autorizar, capturar, anular y reembolsar', async () => {
    const gateway = createSimulatedPaymentGateway('demo-tavelyo');
    const amount = { amountMinor: '100', currency: 'COP' };
    const auth = await gateway.authorize({ amount, idempotencyKey: 'k2', reference: 'q2' });
    const paymentRef = auth.paymentRef;
    expect(await gateway.refund({ paymentRef, amount, idempotencyKey: 'r0' })).toMatchObject({
      status: 'failed',
      failureCode: 'invalid_state',
    });
    expect((await gateway.capture({ paymentRef, amount, idempotencyKey: 'c1' })).status).toBe(
      'captured',
    );
    expect((await gateway.status('k2'))?.status).toBe('captured');
    expect((await gateway.refund({ paymentRef, amount, idempotencyKey: 'r1' })).status).toBe(
      'refunded',
    );
    const other = await gateway.authorize({ amount, idempotencyKey: 'k3', reference: 'q3' });
    expect(
      (await gateway.voidAuthorization({ paymentRef: other.paymentRef, idempotencyKey: 'v1' }))
        .status,
    ).toBe('voided');
  });

  it('tiempo agotado: la respuesta se pierde, pero la consulta encuentra la autorización', async () => {
    const gateway = createSimulatedPaymentGateway('demo-tavelyo');
    const request = {
      amount: { amountMinor: '100', currency: 'COP' },
      idempotencyKey: 'k4',
      reference: 'q4',
      simulatedOutcome: 'timeout' as const,
    };
    await expect(gateway.authorize(request)).rejects.toBeInstanceOf(PaymentTimeoutError);
    expect((await gateway.status('k4'))?.status).toBe('authorized');
  });
});
