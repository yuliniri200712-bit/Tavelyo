import { describe, expect, it } from 'vitest';
import { FunctionsError } from 'firebase/functions';
import { OrderApproval, OrderItemStatus } from '@tavelyo/dataconnect-sdk';
import { mapCallableError, toMyOrders } from './customer-gateway.ts';

// Errores tal como los construye el SDK de funciones (firebase 12.19, _errorForResponse).
const backend = (code: string, message: string, status = 400) =>
  new FunctionsError(code as never, `${message} [${status}]`);

describe('errores de las funciones del cliente', () => {
  it('muestra el mensaje que el backend escribió para la persona', () => {
    expect(
      mapCallableError(
        backend(
          'failed-precondition',
          'La mesa todavía no está abierta. Pide al mesero que la abra.',
        ),
      ),
    ).toEqual({
      kind: 'rejected',
      reason: 'other',
      message: 'La mesa todavía no está abierta. Pide al mesero que la abra.',
    });
  });

  it('distingue cuándo hay que volver a unirse y cuándo se puede reintentar', () => {
    expect(
      mapCallableError(backend('permission-denied', 'Ya no formas parte de esta mesa.', 403)),
    ).toMatchObject({ kind: 'rejected', reason: 'not-participant' });
    expect(
      mapCallableError(
        backend('unavailable', 'No pudimos confirmar el pago. Inténtalo de nuevo.', 503),
      ),
    ).toMatchObject({ kind: 'rejected', reason: 'retry' });
  });

  it('sin respuesta del servidor es un problema de red; un fallo interno no muestra detalles', () => {
    expect(mapCallableError(new FunctionsError('internal', 'internal'))).toEqual({
      kind: 'network',
    });
    expect(mapCallableError(new FunctionsError('deadline-exceeded', 'deadline-exceeded'))).toEqual({
      kind: 'network',
    });
    expect(mapCallableError(backend('internal', 'INTERNAL', 500))).toEqual({ kind: 'unknown' });
    expect(mapCallableError(backend('not-found', 'Backend error status: NOT_FOUND', 404))).toEqual({
      kind: 'unknown',
    });
    expect(mapCallableError(new Error('otra cosa'))).toEqual({ kind: 'unknown' });
  });
});

describe('«Mis pedidos»', () => {
  it('traduce cada pedido propio con su total, y cada línea con su estado e importe', () => {
    expect(
      toMyOrders({
        orders: [
          {
            id: 'o1',
            sentToKitchenAt: '2026-11-16T18:00:00Z',
            approval: OrderApproval.NOT_REQUIRED,
            quote: { currency: 'COP', totalMinor: '3740000' },
            orderItems_on_order: [
              {
                id: 'l1',
                status: OrderItemStatus.PICKED_UP,
                quantity: 1,
                productNameSnapshot: 'Hamburguesa',
                lineTotalMinor: '3740000',
                note: null,
                orderItemModifiers_on_item: [{ nameSnapshot: 'Medio' }],
              },
            ],
          },
          {
            id: 'o2',
            sentToKitchenAt: null,
            approval: OrderApproval.NOT_REQUIRED,
            quote: { currency: 'COP', totalMinor: '100' },
            orderItems_on_order: [],
          },
          {
            id: 'o3',
            sentToKitchenAt: null,
            approval: OrderApproval.REJECTED,
            approvalRequestedAt: '2026-11-16T18:05:00Z',
            rejectionReason: 'Se agotó',
            quote: { currency: 'COP', totalMinor: '100' },
            orderItems_on_order: [],
          },
        ],
      }),
    ).toEqual([
      {
        id: 'o1',
        placedAt: new Date('2026-11-16T18:00:00Z'),
        sentAt: new Date('2026-11-16T18:00:00Z'),
        approval: 'NOT_REQUIRED',
        rejectionReason: null,
        currency: 'COP',
        totalMinor: '3740000',
        items: [
          {
            id: 'l1',
            status: 'PICKED_UP',
            quantity: 1,
            productName: 'Hamburguesa',
            modifiers: ['Medio'],
            note: null,
            lineTotalMinor: '3740000',
          },
        ],
      },
      {
        id: 'o3',
        placedAt: new Date('2026-11-16T18:05:00Z'),
        sentAt: null,
        approval: 'REJECTED',
        rejectionReason: 'Se agotó',
        currency: 'COP',
        totalMinor: '100',
        items: [],
      },
    ]);
  });
});
