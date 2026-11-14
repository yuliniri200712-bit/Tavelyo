import { useState } from 'react';
import { Card } from '../components/Card.tsx';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { ConnectionNotice, UpdateNotice } from '../components/Notices.tsx';
import { EmptyState, ErrorState, LoadingState } from '../components/States.tsx';
import { StatusChip } from '../components/StatusChip.tsx';
import { TavelyoButton } from '../components/TavelyoButton.tsx';
import { TextField } from '../components/TextField.tsx';
import { CheckboxField } from '../components/CheckboxField.tsx';
import { cssVariables, kebab } from '../css-variables.ts';
import { typeScale } from '../tokens.ts';

const colorVariables = cssVariables().filter(([name]) => name.startsWith('--tv-color-'));
const noop = (): void => undefined;

/** Catálogo visual del sistema de diseño con contenido realista (IV §6). Sin datos reales. */
export function DesignSystemCatalog() {
  const [dialogOpen, setDialogOpen] = useState(false);

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
