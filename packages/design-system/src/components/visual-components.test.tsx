// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ActionBar } from './ActionBar.tsx';
import { FilterPills } from './FilterPills.tsx';
import { Icon, iconNames } from './Icon.tsx';
import { KitchenTicket } from './KitchenTicket.tsx';
import { ProductCard } from './ProductCard.tsx';
import { SearchField } from './SearchField.tsx';
import { StatusTimeline } from './StatusTimeline.tsx';
import { TableTile } from './TableTile.tsx';
import { TavelyoButton } from './TavelyoButton.tsx';

describe('Icon', () => {
  it('sin etiqueta es decorativo: oculto para los lectores de pantalla', () => {
    const { container } = render(<Icon name="search" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('focusable')).toBe('false');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('con etiqueta se anuncia como imagen con ese nombre', () => {
    render(<Icon name="offline" label="Sin conexión" />);
    expect(screen.getByRole('img', { name: 'Sin conexión' })).toBeTruthy();
  });

  it('todos los nombres del catálogo dibujan un icono', () => {
    for (const name of iconNames) {
      const { container, unmount } = render(<Icon name={name} />);
      expect(container.querySelector('svg.tv-icon'), name).toBeTruthy();
      unmount();
    }
  });
});

describe('FilterPills', () => {
  function Example({ onChange }: { onChange: (value: string) => void }) {
    const [value, setValue] = useState('todas');
    return (
      <FilterPills
        label="Filtrar por estado"
        options={[
          { value: 'todas', label: 'Todas', count: 8 },
          { value: 'listas', label: 'Listas', count: 2, icon: 'readyToServe' },
        ]}
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange(next);
        }}
      />
    );
  }

  it('agrupa las opciones, anuncia la elegida y lee el contador con el nombre', () => {
    const onChange = vi.fn();
    render(<Example onChange={onChange} />);
    const group = screen.getByRole('group', { name: 'Filtrar por estado' });
    const all = within(group).getByRole('button', { name: 'Todas 8' });
    const ready = within(group).getByRole('button', { name: 'Listas 2' });
    expect(all.getAttribute('aria-pressed')).toBe('true');
    expect(ready.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(ready);
    expect(onChange).toHaveBeenCalledWith('listas');
    expect(ready.getAttribute('aria-pressed')).toBe('true');
    expect(all.getAttribute('aria-pressed')).toBe('false');
  });
});

describe('TableTile', () => {
  it('dice la mesa y su estado en texto, con sus acciones', () => {
    render(
      <TableTile code="S6" status="Lista para entregar" tone="ready" detail="1 lista para recoger">
        <TavelyoButton>Ver pedidos</TavelyoButton>
      </TableTile>,
    );
    expect(screen.getByText('Mesa S6')).toBeTruthy();
    expect(screen.getByText('Lista para entregar')).toBeTruthy();
    expect(screen.getByText('1 lista para recoger')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ver pedidos' })).toBeTruthy();
    expect(screen.queryByRole('img')).toBeNull();
  });
});

describe('StatusTimeline', () => {
  it('marca el paso en curso y dice el estado de cada paso en texto', () => {
    render(
      <StatusTimeline
        label="Seguimiento del pedido de las 15:30"
        steps={[
          { label: 'Pedido recibido', state: 'done', time: '15:30' },
          { label: 'En preparación', state: 'current', detail: 'Estamos preparando tus platos.' },
          { label: 'Entregado', state: 'pending' },
        ]}
      />,
    );
    const list = screen.getByRole('list', { name: 'Seguimiento del pedido de las 15:30' });
    const steps = within(list).getAllByRole('listitem');
    expect(steps.map((step) => step.textContent)).toEqual([
      'Pedido recibido (completado)15:30',
      'En preparación (en curso)Estamos preparando tus platos.',
      'Entregado (pendiente)',
    ]);
    expect(steps[1]?.getAttribute('aria-current')).toBe('step');
    expect(steps[0]?.hasAttribute('aria-current')).toBe(false);
  });
});

describe('KitchenTicket', () => {
  it('título como encabezado, espera en texto y el bloque de color oculto (ya está en el título)', () => {
    const { container } = render(
      <KitchenTicket
        tableCode="M12"
        tone="received"
        title="Mesa M12 · 2 × Bandeja paisa"
        waiting="2 min"
        waitingLabel="Espera: 2 minutos"
        isNew
      >
        <TavelyoButton>Empezar</TavelyoButton>
      </KitchenTicket>,
    );
    expect(
      screen.getByRole('heading', { level: 3, name: 'Mesa M12 · 2 × Bandeja paisa' }),
    ).toBeTruthy();
    expect(screen.getByText('Espera: 2 minutos')).toBeTruthy();
    expect(container.querySelector('.tv-ticket--new')).toBeTruthy();
    expect(container.querySelector('.tv-ticket__table')?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('button', { name: 'Empezar' })).toBeTruthy();
  });
});

describe('ProductCard', () => {
  it('nombre como encabezado, precio, alérgenos y acción', () => {
    render(
      <ProductCard
        name="Bandeja paisa"
        description="Frijoles, arroz y huevo"
        price="$ 32.000"
        allergens="Alérgenos declarados: huevo"
        action={<TavelyoButton aria-label="Agregar Bandeja paisa">Agregar</TavelyoButton>}
      />,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Bandeja paisa' })).toBeTruthy();
    expect(screen.getByText('$ 32.000')).toBeTruthy();
    expect(screen.getByText('Alérgenos declarados: huevo')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Agregar Bandeja paisa' })).toBeTruthy();
  });

  it('sin acción explica por qué no se puede pedir', () => {
    render(
      <ProductCard name="Limonada" price="$ 12.000" unavailable="Disponible desde las 12:00" />,
    );
    expect(screen.getByText('Disponible desde las 12:00')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('SearchField', () => {
  it('tiene nombre accesible propio y avisa cada cambio', () => {
    const onChange = vi.fn();
    render(
      <SearchField
        label="Buscar en la carta"
        placeholder="Platos o ingredientes"
        value=""
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('searchbox', { name: 'Buscar en la carta' });
    fireEvent.change(input, { target: { value: 'ajiaco' } });
    expect(onChange).toHaveBeenCalledWith('ajiaco');
  });
});

describe('ActionBar', () => {
  it('es una región con nombre que contiene la acción principal', () => {
    render(
      <ActionBar label="Tu pedido">
        <TavelyoButton>Mi pedido (2)</TavelyoButton>
      </ActionBar>,
    );
    const region = screen.getByRole('region', { name: 'Tu pedido' });
    expect(within(region).getByRole('button', { name: 'Mi pedido (2)' })).toBeTruthy();
  });
});
