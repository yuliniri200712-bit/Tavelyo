import { describe, expect, it } from 'vitest';
import {
  GUEST_NUMBER_MAX,
  nextGuestNumber,
  numberTablePeople,
  tablePersonLabel,
  tablePersonLabels,
} from './table-people';

const phone = (id: string) => ({ id, guestNumber: null });
const guest = (id: string, guestNumber: number) => ({ id, guestNumber });

describe('personas de la mesa (D-43)', () => {
  it('numera a quienes tienen teléfono sin contar a las personas sin teléfono', () => {
    const labels = tablePersonLabels([phone('a'), guest('g1', 1), phone('b'), guest('g2', 2)]);
    expect([...labels.values()]).toEqual([
      'Persona 1',
      'Persona sin teléfono 1',
      'Persona 2',
      'Persona sin teléfono 2',
    ]);
  });

  it('conserva el número del servidor aunque falte una persona sin teléfono intermedia', () => {
    expect(numberTablePeople([guest('g3', 3)]).get('g3')).toEqual({ guestNumber: 3 });
    expect(tablePersonLabel({ personNumber: 4 })).toBe('Persona 4');
  });

  it('propone el siguiente número y se detiene en el máximo', () => {
    expect(nextGuestNumber([])).toBe(1);
    expect(nextGuestNumber([phone('a'), guest('g', 4)])).toBe(5);
    expect(nextGuestNumber([guest('g', GUEST_NUMBER_MAX)])).toBeNull();
  });
});
