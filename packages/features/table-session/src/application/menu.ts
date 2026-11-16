import { isWithinWeeklySchedule, type WeeklySchedule } from '@tavelyo/core';
import type { MenuProduct, PublicMenu } from '../domain/index.ts';

export interface MenuSection {
  readonly id: string;
  readonly name: string;
  readonly products: readonly { readonly product: MenuProduct; readonly availableNow: boolean }[];
}

const byOrder = <T extends { readonly sort: number; readonly name: string }>(a: T, b: T) =>
  a.sort - b.sort || a.name.localeCompare(b.name, 'es');

/**
 * Carta por categorías, en el orden que definió el restaurante. Un producto fuera de su horario
 * se muestra pero no se puede agregar; quoteOrder vuelve a comprobar el horario en el servidor.
 */
export function menuSections(menu: PublicMenu, now: Date): MenuSection[] {
  const sections = new Map<string, { name: string; sort: number; products: MenuProduct[] }>();
  for (const product of menu.products) {
    const section = sections.get(product.categoryId) ?? {
      name: product.categoryName,
      sort: product.categorySort,
      products: [],
    };
    section.products.push(product);
    sections.set(product.categoryId, section);
  }
  return [...sections.entries()]
    .map(([id, section]) => ({ id, ...section }))
    .sort(byOrder)
    .map((section) => ({
      id: section.id,
      name: section.name,
      products: [...section.products].sort(byOrder).map((product) => ({
        product,
        availableNow:
          product.schedule === null || isWithinWeeklySchedule(product.schedule, now, menu.timezone),
      })),
    }));
}

const DAY_NAMES = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'] as const;

function clock(minute: number): string {
  const hours = Math.floor(minute / 60) % 24;
  return `${String(hours).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
}

/** «Se ofrece vie y sáb de 18:00 a 02:00», en la hora local de la sucursal. */
export function describeOffering(schedule: WeeklySchedule): string {
  const days = DAY_NAMES.filter((_, index) => (schedule.daysMask & (1 << index)) !== 0);
  const when = days.length === DAY_NAMES.length ? 'todos los días' : days.join(', ');
  return `Se ofrece ${when} de ${clock(schedule.startMinute)} a ${clock(schedule.endMinute)}`;
}
