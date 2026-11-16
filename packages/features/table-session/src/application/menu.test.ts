import { describe, expect, it } from 'vitest';
import type { MenuProduct, PublicMenu } from '../domain/index.ts';
import { describeOffering, menuSections } from './menu.ts';

function at<T>(list: readonly T[], index: number): T {
  const value = list[index];
  if (value === undefined) throw new Error(`Falta el elemento ${index}`);
  return value;
}

const base: Omit<MenuProduct, 'id' | 'name' | 'categoryId' | 'categoryName' | 'categorySort'> = {
  priceId: 'pr',
  priceMinor: '1000000',
  currency: 'COP',
  groups: [],
  description: null,
  allergens: [],
  sort: 1,
  schedule: null,
};

const product = (
  id: string,
  name: string,
  category: [string, string, number],
  extra: Partial<MenuProduct> = {},
): MenuProduct => ({
  ...base,
  id,
  name,
  categoryId: category[0],
  categoryName: category[1],
  categorySort: category[2],
  ...extra,
});

const drinks: [string, string, number] = ['c2', 'Bebidas', 2];
const mains: [string, string, number] = ['c1', 'Platos fuertes', 1];
// Viernes 2026-11-20, 20:00 en Bogotá (01:00 UTC del sábado).
const fridayNight = new Date('2026-11-21T01:00:00Z');
const menu: PublicMenu = {
  tableCode: 'M1',
  branchName: 'Centro',
  currency: 'COP',
  timezone: 'America/Bogota',
  products: [
    product('p3', 'Limonada', drinks),
    product('p2', 'Bandeja', mains, { sort: 2 }),
    product('p1', 'Ajiaco', mains, { sort: 2 }),
    product('p4', 'Cóctel', drinks, {
      sort: 0,
      schedule: { daysMask: 0b0010000, startMinute: 18 * 60, endMinute: 2 * 60 },
    }),
    product('p5', 'Desayuno', mains, {
      sort: 0,
      schedule: { daysMask: 0b1111111, startMinute: 6 * 60, endMinute: 11 * 60 },
    }),
  ],
};

describe('carta por categorías', () => {
  it('ordena categorías y productos como los definió el restaurante', () => {
    const sections = menuSections(menu, fridayNight);
    expect(sections.map((s) => s.name)).toEqual(['Platos fuertes', 'Bebidas']);
    expect(at(sections, 0).products.map((p) => p.product.name)).toEqual([
      'Desayuno',
      'Ajiaco',
      'Bandeja',
    ]);
  });

  it('marca lo que está fuera de horario en la hora de la sucursal', () => {
    const sections = menuSections(menu, fridayNight);
    const available = Object.fromEntries(
      sections.flatMap((s) => s.products.map((p) => [p.product.name, p.availableNow])),
    );
    expect(available).toMatchObject({ Cóctel: true, Desayuno: false, Ajiaco: true });
  });

  it('describe el horario en texto', () => {
    expect(describeOffering({ daysMask: 0b0110000, startMinute: 1080, endMinute: 120 })).toBe(
      'Se ofrece vie, sáb de 18:00 a 02:00',
    );
    expect(describeOffering({ daysMask: 0b1111111, startMinute: 360, endMinute: 660 })).toBe(
      'Se ofrece todos los días de 06:00 a 11:00',
    );
  });
});
