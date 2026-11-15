import { describe, expect, it } from 'vitest';
import { parseSectorForm, parseTableForm, tableMenuUrl } from './forms.ts';

describe('formulario de sector', () => {
  it('recorta el nombre y acepta el orden vacío como 0', () => {
    expect(parseSectorForm({ name: '  Terraza ', sort: '' })).toEqual({
      ok: true,
      value: { name: 'Terraza', sort: 0 },
    });
    expect(parseSectorForm({ name: 'Barra', sort: '3' })).toEqual({
      ok: true,
      value: { name: 'Barra', sort: 3 },
    });
  });

  it('explica cada campo no válido', () => {
    expect(parseSectorForm({ name: '   ', sort: '-1' })).toEqual({
      ok: false,
      error: {
        name: 'Escribe el nombre del sector.',
        sort: 'El orden debe ser un número entero, sin signos.',
      },
    });
    expect(parseSectorForm({ name: 'x'.repeat(61), sort: '1.5' }).ok).toBe(false);
  });
});

describe('formulario de mesa', () => {
  it('exige sector, código y puestos entre 1 y 50', () => {
    expect(parseTableForm({ sectorId: 's1', code: ' M1 ', seats: '4' })).toEqual({
      ok: true,
      value: { sectorId: 's1', code: 'M1', seats: 4 },
    });
    const invalid = parseTableForm({ sectorId: '', code: '', seats: '0' });
    expect(invalid.ok).toBe(false);
    if (!invalid.ok)
      expect(Object.keys(invalid.error).sort()).toEqual(['code', 'seats', 'sectorId']);
    expect(parseTableForm({ sectorId: 's1', code: 'M1', seats: '51' }).ok).toBe(false);
    expect(parseTableForm({ sectorId: 's1', code: 'x'.repeat(21), seats: '2' }).ok).toBe(false);
  });
});

describe('dirección del QR', () => {
  it('solo lleva el identificador público de la mesa', () => {
    expect(tableMenuUrl('https://carta.tavelyo.co/', 'abc123')).toBe(
      'https://carta.tavelyo.co/mesa/abc123',
    );
    expect(tableMenuUrl('http://localhost:6173', 'a/b')).toBe('http://localhost:6173/mesa/a%2Fb');
  });
});
