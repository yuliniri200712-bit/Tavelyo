import { describe, expect, it } from 'vitest';
import {
  OrderApprovalMode,
  OrderItemStatus,
  ServiceRequestKind,
  type FloorViewData,
  type PendingApprovalOrdersData,
  type PendingServiceRequestsData,
  type PickupQueueData,
  type SessionOrdersData,
} from '@tavelyo/dataconnect-sdk';
import { toFloorSectors } from './floor-gateway.ts';
import { toApprovalMode, toPendingApprovals } from './order-approval-gateway.ts';
import { toPickupItems, toSessionOrders } from './orders-gateway.ts';
import { toPendingRequests } from './service-requests-gateway.ts';

const at = '2026-11-16T18:00:00Z';

describe('mapeo de las lecturas del personal del salón', () => {
  it('«Listos para recoger» conserva estado, versión, mesa y estación, sin importes', () => {
    const data: PickupQueueData = {
      orderItems: [
        {
          id: 'l1',
          version: 3,
          status: OrderItemStatus.READY,
          quantity: 2,
          productNameSnapshot: 'Ajiaco',
          note: null,
          readyAt: at,
          pickedUpAt: null,
          orderItemModifiers_on_item: [{ nameSnapshot: 'Con aguacate' }],
          station: { name: 'Cocina' },
          order: { session: { id: 's1', table: { code: 'M1' } } },
        },
        {
          id: 'l2',
          version: 1,
          status: OrderItemStatus.RECEIVED,
          quantity: 1,
          productNameSnapshot: 'Arepa',
          orderItemModifiers_on_item: [],
          station: { name: 'Cocina' },
          order: { session: { id: 's1', table: { code: 'M1' } } },
        },
      ],
    };
    expect(toPickupItems(data)).toEqual([
      {
        id: 'l1',
        version: 3,
        status: 'READY',
        quantity: 2,
        productName: 'Ajiaco',
        modifiers: ['Con aguacate'],
        note: null,
        stationName: 'Cocina',
        tableCode: 'M1',
        readyAt: new Date(at),
      },
    ]);
  });

  it('los pedidos de la mesa traen cada línea con su estado y el motivo si se canceló', () => {
    const data: SessionOrdersData = {
      orders: [
        {
          id: 'o1',
          sentToKitchenAt: at,
          orderItems_on_order: [
            {
              id: 'l1',
              version: 2,
              status: OrderItemStatus.CANCELLED,
              quantity: 1,
              productNameSnapshot: 'Arepa',
              note: 'Sin queso',
              cancelReason: 'Se acabó',
              orderItemModifiers_on_item: [],
            },
          ],
        },
      ],
    };
    expect(toSessionOrders(data)).toEqual([
      {
        id: 'o1',
        sentAt: new Date(at),
        items: [
          {
            id: 'l1',
            version: 2,
            status: 'CANCELLED',
            quantity: 1,
            productName: 'Arepa',
            modifiers: [],
            note: 'Sin queso',
            cancelReason: 'Se acabó',
          },
        ],
      },
    ]);
  });

  it('las solicitudes llevan su mesa y su tipo, sin datos de quien pidió', () => {
    const data: PendingServiceRequestsData = {
      serviceRequests: [
        {
          id: 'r1',
          kind: ServiceRequestKind.REQUEST_BILL,
          createdAt: at,
          session: { id: 's1', table: { code: 'T4' } },
        },
      ],
    };
    expect(toPendingRequests(data)).toEqual([
      { id: 'r1', kind: 'REQUEST_BILL', createdAt: new Date(at), tableCode: 'T4' },
    ]);
  });

  it('el salón cuenta por mesa las líneas en cocina, listas y recogidas, y sus solicitudes', () => {
    const item = (status: OrderItemStatus) => ({ status });
    const data: FloorViewData = {
      sectors: [
        {
          id: 'sec1',
          name: 'Terraza',
          diningTables_on_sector: [
            {
              id: 't1',
              code: 'M1',
              seats: 4,
              tableSessions_on_table: [
                {
                  id: 's1',
                  openedAt: at,
                  orders_on_session: [
                    {
                      orderItems_on_order: [
                        item(OrderItemStatus.RECEIVED),
                        item(OrderItemStatus.IN_PREPARATION),
                        item(OrderItemStatus.READY),
                      ],
                    },
                    { orderItems_on_order: [item(OrderItemStatus.PICKED_UP)] },
                  ],
                  serviceRequests_on_session: [
                    { kind: ServiceRequestKind.REQUEST_BILL, createdAt: '2026-11-16T18:05:00Z' },
                    { kind: ServiceRequestKind.CALL_WAITER, createdAt: '2026-11-16T18:01:00Z' },
                  ],
                },
              ],
            },
            { id: 't2', code: 'M2', seats: 2, tableSessions_on_table: [] },
          ],
        },
      ],
    };
    const [sector] = toFloorSectors(data);
    expect(sector?.tables[0]?.session?.activity).toEqual({
      inKitchen: 2,
      ready: 1,
      pickedUp: 1,
      requests: [
        { kind: 'CALL_WAITER', createdAt: new Date('2026-11-16T18:01:00Z') },
        { kind: 'REQUEST_BILL', createdAt: new Date('2026-11-16T18:05:00Z') },
      ],
    });
    expect(sector?.tables[1]?.session).toBeNull();
  });
});

describe('aprobación de pedidos (D-32)', () => {
  it('traduce los pedidos por aprobar con sus líneas y descarta los que no tienen hora', () => {
    const data: PendingApprovalOrdersData = {
      orders: [
        {
          id: 'o1',
          approvalRequestedAt: '2026-11-18T00:55:00Z',
          session: { id: 's1', table: { code: 'M1' } },
          quote: { currency: 'COP', totalMinor: '3200000' },
          orderItems_on_order: [
            {
              id: 'l1',
              quantity: 1,
              productNameSnapshot: 'Bandeja paisa',
              note: null,
              allergensSnapshot: null,
              orderItemModifiers_on_item: [{ nameSnapshot: 'Bien asada' }],
            },
          ],
        },
        {
          id: 'o2',
          approvalRequestedAt: null,
          session: { id: 's1', table: { code: 'M1' } },
          quote: { currency: 'COP', totalMinor: '1' },
          orderItems_on_order: [],
        },
      ],
    };
    expect(toPendingApprovals(data)).toEqual([
      {
        id: 'o1',
        sessionId: 's1',
        tableCode: 'M1',
        requestedAt: new Date('2026-11-18T00:55:00Z'),
        currency: 'COP',
        totalMinor: '3200000',
        lines: [
          {
            quantity: 1,
            productName: 'Bandeja paisa',
            modifiers: ['Bien asada'],
            note: null,
            allergens: [],
          },
        ],
      },
    ]);
  });

  it('traduce el modo de la sucursal; sin sucursal visible, null', () => {
    expect(
      toApprovalMode({
        branches: [{ id: 'b1', name: 'Centro', orderApproval: OrderApprovalMode.WAITER_APPROVAL }],
      }),
    ).toBe('WAITER_APPROVAL');
    expect(toApprovalMode({ branches: [] })).toBeNull();
  });
});
