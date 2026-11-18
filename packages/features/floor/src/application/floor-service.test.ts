import { describe, expect, it } from 'vitest';
import {
  describeFloorCounts,
  describeSectorSize,
  describeTableOrders,
  describeTableRequests,
  floorCounts,
  participantStatus,
  tableTone,
} from './floor-service.ts';

const now = new Date('2026-11-15T20:00:00Z');
const base = {
  id: 'p1',
  joinedAt: new Date('2026-11-15T19:00:00Z'),
  expiresAt: new Date('2026-11-15T23:00:00Z'),
  removedAt: null,
};

describe('participantStatus', () => {
  it('vigente, vencida o retirada (retirar prevalece sobre la vigencia)', () => {
    expect(participantStatus(base, now)).toBe('active');
    expect(participantStatus({ ...base, expiresAt: now }, now)).toBe('expired');
    expect(participantStatus({ ...base, removedAt: new Date('2026-11-15T19:30:00Z') }, now)).toBe(
      'removed',
    );
  });
});

describe('conteo del salón', () => {
  it('cuenta mesas abiertas y libres de todos los sectores, en texto', () => {
    const session = {
      id: 's1',
      openedAt: now,
      activity: { inKitchen: 0, ready: 0, pickedUp: 0, requests: [] },
    };
    const counts = floorCounts([
      {
        id: 'a',
        name: 'Terraza',
        tables: [
          { id: '1', code: '1', seats: 2, session },
          { id: '2', code: '2', seats: 2, session: null },
        ],
      },
      { id: 'b', name: 'Salón', tables: [{ id: '3', code: '3', seats: 4, session: null }] },
    ]);
    expect(counts).toEqual({ open: 1, free: 2 });
    expect(describeFloorCounts(counts)).toBe('1 mesa abierta · 2 libres');
    expect(describeFloorCounts({ open: 0, free: 1 })).toBe('0 mesas abiertas · 1 libre');
  });
});

describe('actividad de la mesa en texto', () => {
  it('cuenta las líneas en cocina, listas y recogidas, en singular o plural', () => {
    const none = { inKitchen: 0, ready: 0, pickedUp: 0, requests: [] };
    expect(describeTableOrders(none)).toBe('Sin pedidos en curso');
    expect(describeTableOrders({ ...none, inKitchen: 2, ready: 1 })).toBe(
      '2 líneas en cocina · 1 lista para recoger',
    );
    expect(describeTableOrders({ ...none, inKitchen: 1, ready: 3, pickedUp: 2 })).toBe(
      '1 línea en cocina · 3 listas para recoger · 2 recogidas por entregar',
    );
  });

  it('describe cada solicitud con la hora de la sucursal', () => {
    expect(
      describeTableRequests(
        [
          { kind: 'CALL_WAITER', createdAt: new Date('2026-11-16T00:45:00Z') },
          { kind: 'REQUEST_BILL', createdAt: new Date('2026-11-16T00:50:00Z') },
        ],
        'America/Bogota',
      ),
    ).toEqual(['Llamó al mesero a las 19:45', 'Pidió la cuenta a las 19:50']);
  });
});

describe('tono de cada mesa', () => {
  const activity = { inKitchen: 0, ready: 0, pickedUp: 0, requests: [] };
  const request = { kind: 'CALL_WAITER' as const, createdAt: now };

  it('lo más urgente primero: solicitud, platos listos, abierta y libre', () => {
    expect(tableTone(null)).toBe('free');
    expect(tableTone({ ...activity, inKitchen: 2 })).toBe('open');
    expect(tableTone({ ...activity, ready: 1 })).toBe('ready');
    expect(tableTone({ ...activity, ready: 1, requests: [request] })).toBe('attention');
  });

  it('dice cuántas mesas tiene un sector', () => {
    expect(describeSectorSize(1)).toBe('1 mesa');
    expect(describeSectorSize(8)).toBe('8 mesas');
  });
});
