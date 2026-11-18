import { describe, expect, it } from 'vitest';
import type { MenuProduct, PublicMenu } from '../domain/index.ts';
import { describeOffering, filterMenuSections, menuSections, normalizeSearch } from './menu.ts';

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

const menuOf = (products: MenuProduct[]): PublicMenu => ({ ...menu, products });

describe('buscar y filtrar la carta', () => {
  const sections = menuSections(
    menuOf([
      product('p1', 'Bandeja paisa', mains, { description: 'Frijoles, arroz y huevo' }),
      product('p2', 'Ajiaco santafereño', mains, { allergens: ['lácteos'], sort: 2 }),
      product('p3', 'Limonada de coco', drinks),
    ]),
    fridayNight,
  );
  const names = (result: ReturnType<typeof filterMenuSections>) =>
    result.flatMap((section) => section.products.map(({ product }) => product.name));

  it('sin filtro deja la carta igual', () => {
    expect(names(filterMenuSections(sections, { categoryId: null, query: '  ' }))).toEqual([
      'Bandeja paisa',
      'Ajiaco santafereño',
      'Limonada de coco',
    ]);
  });

  it('busca en el nombre, la descripción y los alérgenos, sin distinguir tildes ni mayúsculas', () => {
    expect(names(filterMenuSections(sections, { categoryId: null, query: 'AJÍACO' }))).toEqual([
      'Ajiaco santafereño',
    ]);
    expect(names(filterMenuSections(sections, { categoryId: null, query: 'arroz' }))).toEqual([
      'Bandeja paisa',
    ]);
    expect(names(filterMenuSections(sections, { categoryId: null, query: 'lacteos' }))).toEqual([
      'Ajiaco santafereño',
    ]);
  });

  it('exige todas las palabras y quita las secciones que quedan vacías', () => {
    const result = filterMenuSections(sections, { categoryId: null, query: 'limonada coco' });
    expect(result.map((section) => section.name)).toEqual(['Bebidas']);
    expect(filterMenuSections(sections, { categoryId: null, query: 'pizza' })).toEqual([]);
  });

  it('filtra por categoría y combina con la búsqueda', () => {
    expect(names(filterMenuSections(sections, { categoryId: 'c2', query: '' }))).toEqual([
      'Limonada de coco',
    ]);
    expect(filterMenuSections(sections, { categoryId: 'c2', query: 'bandeja' })).toEqual([]);
  });

  it('normaliza el texto de búsqueda', () => {
    expect(normalizeSearch('  Ajíaco SANTAFEREÑO ')).toBe('ajiaco santafereno');
  });
});
