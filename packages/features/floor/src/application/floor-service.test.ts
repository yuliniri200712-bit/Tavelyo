import { describe, expect, it } from 'vitest';
import { describeFloorCounts, floorCounts, participantStatus } from './floor-service.ts';

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
    const session = { id: 's1', openedAt: now };
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
