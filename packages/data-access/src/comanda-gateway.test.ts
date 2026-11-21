import { describe, expect, it } from 'vitest';
import { toComandaPeople } from './comanda-gateway.ts';

const now = new Date('2026-11-21T20:00:00Z');
const later = '2026-11-21T23:00:00Z';
const earlier = '2026-11-21T19:00:00Z';

describe('personas de la comanda del mesero (D-43)', () => {
  it('numera como el salón y solo ofrece a las personas vigentes', () => {
    const result = toComandaPeople(
      [
        { id: 'vencida', guestNumber: null, expiresAt: earlier },
        { id: 'retirada', guestNumber: 1, expiresAt: earlier, removedAt: earlier },
        { id: 'con-telefono', guestNumber: null, expiresAt: later },
        { id: 'sin-telefono', guestNumber: 2, expiresAt: earlier },
      ],
      now,
    );
    expect(result.people).toEqual([
      { id: 'con-telefono', guestNumber: null, label: 'Persona 2' },
      { id: 'sin-telefono', guestNumber: 2, label: 'Persona sin teléfono 2' },
    ]);
  });

  it('el siguiente número cuenta también a la persona retirada, que conserva el suyo', () => {
    const removed = { id: 'r', guestNumber: 4, expiresAt: earlier, removedAt: earlier };
    expect(toComandaPeople([removed], now).nextGuestNumber).toBe(5);
    expect(toComandaPeople([], now).nextGuestNumber).toBe(1);
    expect(
      toComandaPeople([{ id: 'max', guestNumber: 99, expiresAt: earlier }], now).nextGuestNumber,
    ).toBeNull();
  });
});
