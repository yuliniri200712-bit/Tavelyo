import { useState } from 'react';
import { Card } from '../components/Card.tsx';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { ConnectionNotice, UpdateNotice } from '../components/Notices.tsx';
import { EmptyState, ErrorState, LoadingState } from '../components/States.tsx';
import { StatusChip } from '../components/StatusChip.tsx';
import { TavelyoButton } from '../components/TavelyoButton.tsx';
import { TextField } from '../components/TextField.tsx';
import { CheckboxField } from '../components/CheckboxField.tsx';
import { RadioField } from '../components/RadioField.tsx';
import { ActionBar } from '../components/ActionBar.tsx';
import { FilterPills } from '../components/FilterPills.tsx';
import { Icon, iconNames } from '../components/Icon.tsx';
import { KitchenTicket } from '../components/KitchenTicket.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { SearchField } from '../components/SearchField.tsx';
import { StatusTimeline } from '../components/StatusTimeline.tsx';
import { TableTile } from '../components/TableTile.tsx';
import { cssVariables, kebab } from '../css-variables.ts';
import { typeScale } from '../tokens.ts';

const colorVariables = cssVariables().filter(([name]) => name.startsWith('--tv-color-'));
const noop = (): void => undefined;

/** Catálogo visual del sistema de diseño con contenido realista (IV §6). Sin datos reales. */
export function DesignSystemCatalog() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState('todas');
  const [search, setSearch] = useState('');

  return (
    <div className="tv-catalog">
      <h1>Catálogo del sistema de diseño</h1>

      <section aria-labelledby="cat-colores" className="tv-catalog__stack">
        <h2 id="cat-colores">Colores funcionales</h2>
        <ul className="tv-catalog__swatches">
          {colorVariables.map(([name, value]) => (
            <li key={name}>
              <div className="tv-catalog__swatch" style={{ background: `var(${name})` }} />
              <code>{name}</code> <span className="tv-tabular">{value}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="cat-tipografia" className="tv-catalog__stack">
        <h2 id="cat-tipografia">Tipografía</h2>
        {Object.keys(typeScale).map((step) => (
          <p
            key={step}
            style={{
              fontSize: `var(--tv-type-${kebab(step)}-size)`,
              lineHeight: `var(--tv-type-${kebab(step)}-line-height)`,
              fontWeight: `var(--tv-type-${kebab(step)}-weight)`,
            }}
          >
            {step}: Mesa 12 · Total <span className="tv-tabular">$ 48.500</span>
          </p>
        ))}
      </section>

      <section aria-labelledby="cat-botones" className="tv-catalog__stack">
        <h2 id="cat-botones">Botones</h2>
        <div className="tv-catalog__row">
          <TavelyoButton>Enviar a cocina</TavelyoButton>
          <TavelyoButton variant="secondary">Guardar borrador</TavelyoButton>
          <TavelyoButton variant="destructive">Anular pedido</TavelyoButton>
          <TavelyoButton disabled>Cobrar</TavelyoButton>
          <TavelyoButton loading loadingLabel="Enviando…">
            Enviar
          </TavelyoButton>
        </div>
      </section>

      <section aria-labelledby="cat-campos" className="tv-catalog__stack">
        <h2 id="cat-campos">Campos</h2>
        <TextField label="Nombre de la sucursal" hint="Así la verá el personal." />
        <TextField
          label="Correo del personal"
          type="email"
          defaultValue="mesero@"
          error="Escribe un correo completo, por ejemplo nombre@restaurante.com."
        />
        <CheckboxField
          label="Equipo compartido"
          hint="La sesión se borra al cerrar esta pestaña o la app."
          defaultChecked
        />
        <fieldset className="tv-fieldset">
          <legend className="tv-fieldset__legend">Término de la carne · Elige 1</legend>
          <RadioField name="cat-termino" label="Término medio" defaultChecked />
          <RadioField name="cat-termino" label="Bien asado" />
        </fieldset>
      </section>

      <section aria-labelledby="cat-chips" className="tv-catalog__stack">
        <h2 id="cat-chips">Chips de estado</h2>
        <div className="tv-catalog__row">
          <StatusChip label="Abierta" />
          <StatusChip tone="success" label="Listo" />
          <StatusChip tone="warning" label="Demorado 12 min" />
          <StatusChip tone="error" label="Pago rechazado" />
          <StatusChip tone="info" label="Pago pendiente" />
        </div>
      </section>

      <section aria-labelledby="cat-tarjeta" className="tv-catalog__stack">
        <h2 id="cat-tarjeta">Tarjeta y diálogo</h2>
        <Card title="Mesa 4 · Terraza">
          <p>3 comensales · 2 pedidos en preparación</p>
          <StatusChip tone="info" label="Cuenta abierta" />
          <TavelyoButton variant="destructive" onClick={() => setDialogOpen(true)}>
            Anular pedido 18
          </TavelyoButton>
        </Card>
        <ConfirmDialog
          open={dialogOpen}
          destructive
          title="¿Anular el pedido 18?"
          confirmLabel="Anular pedido 18"
          onConfirm={() => setDialogOpen(false)}
          onCancel={() => setDialogOpen(false)}
        >
          <p>Se anula el pedido 18 de la mesa 4 (2 productos). Cocina recibirá el aviso.</p>
        </ConfirmDialog>
      </section>

      <section aria-labelledby="cat-iconos" className="tv-catalog__stack">
        <h2 id="cat-iconos">Iconos (Lucide)</h2>
        <ul className="tv-catalog__swatches">
          {iconNames.map((name) => (
            <li key={name} className="tv-catalog__row">
              <Icon name={name} size="large" />
              <code>{name}</code>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="cat-filtros" className="tv-catalog__stack">
        <h2 id="cat-filtros">Filtros en píldora</h2>
        <FilterPills
          label="Filtrar pedidos por estado"
          options={[
            { value: 'todas', label: 'Todas', count: 8 },
            { value: 'recibidas', label: 'Recibidas', count: 3 },
            { value: 'preparacion', label: 'En preparación', count: 3, icon: 'kitchen' },
            { value: 'listas', label: 'Listas', count: 2, icon: 'readyToServe' },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <SearchField
          label="Buscar en la carta"
          placeholder="Platos o ingredientes"
          value={search}
          onChange={setSearch}
        />
      </section>

      <section aria-labelledby="cat-mesas" className="tv-catalog__stack">
        <h2 id="cat-mesas">Mesas del salón</h2>
        <ul className="tv-table-grid">
          <li>
            <TableTile code="S1" status="Libre" tone="free" />
          </li>
          <li>
            <TableTile
              code="S2"
              status="Abierta"
              tone="open"
              detail="Desde las 12:40 · 2 en cocina"
            />
          </li>
          <li>
            <TableTile
              code="S3"
              status="Solicita servicio"
              tone="attention"
              detail="Llamó al mesero"
            />
          </li>
          <li>
            <TableTile
              code="S6"
              status="Abierta"
              tone="ready"
              badges={<StatusChip tone="info" label="Platos listos" />}
              detail="1 lista para recoger"
              actions={<TavelyoButton variant="secondary">Ver pedidos</TavelyoButton>}
            />
          </li>
        </ul>
      </section>

      <section aria-labelledby="cat-seguimiento" className="tv-catalog__stack">
        <h2 id="cat-seguimiento">Seguimiento del pedido</h2>
        <Card>
          <StatusTimeline
            label="Seguimiento del pedido de las 15:30"
            steps={[
              { label: 'Pedido recibido', state: 'done', time: '15:30' },
              {
                label: 'En preparación',
                state: 'current',
                detail: 'Estamos preparando tus platos.',
              },
              { label: 'Listo para servir', state: 'pending' },
              { label: 'Entregado', state: 'pending' },
            ]}
          />
        </Card>
      </section>

      <section aria-labelledby="cat-tickets" className="tv-catalog__stack">
        <h2 id="cat-tickets">Tickets de cocina</h2>
        <KitchenTicket
          tableCode="M12"
          tone="received"
          title="Mesa M12 · 2 × Bandeja paisa"
          waiting="2 min"
          waitingLabel="Espera: 2 minutos"
          isNew
        >
          <StatusChip tone="info" label="Recibido · Nuevo" />
          <p className="tv-list__meta">Opciones: Bien asada · Nota: sin cebolla</p>
          <p className="tv-kitchen-allergens">Alérgenos declarados: huevo</p>
          <div className="tv-toolbar">
            <TavelyoButton>Empezar</TavelyoButton>
            <TavelyoButton variant="secondary">Cancelar</TavelyoButton>
          </div>
        </KitchenTicket>
        <KitchenTicket
          tableCode="M8"
          tone="preparing"
          title="Mesa M8 · 1 × Ajiaco santafereño"
          waiting="12 min"
          waitingLabel="Espera: 12 minutos"
        >
          <StatusChip tone="warning" label="En preparación" />
          <div className="tv-toolbar">
            <TavelyoButton>Listo</TavelyoButton>
          </div>
        </KitchenTicket>
      </section>

      <section aria-labelledby="cat-productos" className="tv-catalog__stack">
        <h2 id="cat-productos">Productos de la carta</h2>
        <ul className="tv-product-grid">
          <li>
            <ProductCard
              name="Bandeja paisa"
              description="Frijoles, arroz, carne molida, chicharrón y huevo"
              price="$ 32.000"
              allergens="Alérgenos declarados: huevo"
              action={<TavelyoButton variant="secondary">Agregar</TavelyoButton>}
            />
          </li>
          <li>
            <ProductCard
              name="Limonada de coco"
              price="$ 12.000"
              unavailable="Disponible desde las 12:00"
            />
          </li>
        </ul>
        <ActionBar label="Tu pedido">
          <TavelyoButton>Mi pedido (2) · $ 64.000</TavelyoButton>
        </ActionBar>
      </section>

      <section aria-labelledby="cat-avisos" className="tv-catalog__stack">
        <h2 id="cat-avisos">Avisos</h2>
        <ConnectionNotice online={false} />
        <UpdateNotice onUpdate={noop} onDismiss={noop} />
      </section>

      <section aria-labelledby="cat-estados" className="tv-catalog__stack">
        <h2 id="cat-estados">Estados</h2>
        <Card>
          <LoadingState message="Cargando pedidos de la sucursal…" />
        </Card>
        <Card>
          <ErrorState
            title="No se pudieron cargar los pedidos"
            description="Revisa la conexión. Los pedidos ya enviados no se pierden."
            onRetry={noop}
          />
        </Card>
        <Card>
          <EmptyState
            title="Sin pedidos por ahora"
            description="Cuando una mesa envíe un pedido, aparecerá aquí."
          />
        </Card>
      </section>
    </div>
  );
}
