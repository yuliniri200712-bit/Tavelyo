import { useState, type ReactNode } from 'react';
import { formatLocalTime, formatMoney } from '@tavelyo/core';
import type { QuoteSummary, SimulatedPaymentOutcome } from '@tavelyo/contracts';
import { CartLines, cartTotal } from '@tavelyo/cart';
import {
  ActionNotice,
  Card,
  EmptyState,
  SelectField,
  StatusChip,
  TavelyoButton,
} from '@tavelyo/design-system';
import { describeChange, describeProblem, formatMinor } from '../application/review-text.ts';
import type { PublicMenu } from '../domain/index.ts';
import { MenuGate } from './MenuGate.tsx';
import { useTableOrder } from './TableOrderProvider.tsx';

export interface OrderReviewPageProps {
  /** Enlace para volver a la carta (la navegación es de la app). */
  readonly menuLink: ReactNode;
  /** Solo con emuladores: elegir el resultado del pago simulado para probar cada caso. */
  readonly offerSimulatedOutcomes: boolean;
}

const SIMULATED_OUTCOMES: readonly { value: SimulatedPaymentOutcome; label: string }[] = [
  { value: 'approved', label: 'Aprobado' },
  { value: 'declined', label: 'Rechazado' },
  { value: 'requires_action', label: 'Pide verificación adicional' },
  { value: 'timeout', label: 'Sin respuesta a tiempo' },
];

/** Pedido de la persona: carrito, revisión con el servidor y autorización simulada. */
export function OrderReviewPage({ menuLink, offerSimulatedOutcomes }: OrderReviewPageProps) {
  return (
    <MenuGate>
      {(menu) => (
        <div className="tv-page">
          <header className="tv-page__header">
            <div>
              <h1>Tu pedido</h1>
              <p className="tv-list__meta">
                {menu.branchName} · Mesa {menu.tableCode}
              </p>
            </div>
            <div className="tv-toolbar">{menuLink}</div>
          </header>
          <ReviewContent menu={menu} offerSimulatedOutcomes={offerSimulatedOutcomes} />
        </div>
      )}
    </MenuGate>
  );
}

function ReviewContent({
  menu,
  offerSimulatedOutcomes,
}: {
  readonly menu: PublicMenu;
  readonly offerSimulatedOutcomes: boolean;
}) {
  const { cart, checkout } = useTableOrder();
  const { state, message } = checkout;
  const notice = message ? { tone: 'error' as const, text: message } : null;

  if (state.step === 'done') {
    return (
      <Card title="Pedido listo" headingLevel={2}>
        <StatusChip tone="success" label="Pago autorizado (simulado)" />
        <QuoteLines summary={state.quote.summary} />
        <p>
          El pago se autorizó en modo de prueba: no se cobró dinero real. El envío a cocina todavía
          no está disponible (llega en la Fase 3): por ahora, confirma tu pedido con el mesero.
        </p>
        <div className="tv-toolbar">
          <TavelyoButton variant="secondary" onClick={checkout.editOrder}>
            Hacer otro pedido
          </TavelyoButton>
        </div>
      </Card>
    );
  }

  if (state.step === 'quoted' || state.step === 'authorizing') {
    return (
      <>
        <ActionNotice notice={notice} />
        <Card title="Resumen confirmado por el restaurante" headingLevel={2}>
          <QuoteLines summary={state.quote.summary} />
          <p className="tv-list__meta">
            Este resumen vale hasta las{' '}
            {formatLocalTime(new Date(state.quote.expiresAt), menu.timezone)}.
          </p>
        </Card>
        <PaymentCard
          total={formatMinor(state.quote.summary.totalMinor, state.quote.summary.currency)}
          busy={state.step === 'authorizing'}
          offerSimulatedOutcomes={offerSimulatedOutcomes}
          onAuthorize={checkout.authorize}
          onEdit={checkout.editOrder}
        />
      </>
    );
  }

  if (state.step === 'changed') {
    return (
      <Card title="Algunos importes cambiaron" headingLevel={2}>
        <p>Antes de seguir, revisa los importes actuales. No se cobra nada sin tu confirmación.</p>
        <ul className="tv-list" aria-label="Cambios en tu pedido">
          {state.changes.map((change, index) => (
            <li key={index} className="tv-list__item">
              {describeChange(change, state.lines, state.summary)}
            </li>
          ))}
        </ul>
        <p className="tv-list__title">
          Total actual: {formatMinor(state.summary.totalMinor, state.summary.currency)}
        </p>
        <div className="tv-toolbar">
          <TavelyoButton onClick={checkout.acceptChanges}>
            Aceptar los importes actuales
          </TavelyoButton>
          <TavelyoButton variant="secondary" onClick={checkout.editOrder}>
            Cambiar el pedido
          </TavelyoButton>
        </div>
      </Card>
    );
  }

  if (state.step === 'rejected') {
    return (
      <Card title="Hay productos que ya no puedes pedir" headingLevel={2}>
        <ul className="tv-list" aria-label="Productos con problemas">
          {state.problems.map((problem, index) => (
            <li key={index} className="tv-list__item">
              {describeProblem(problem, state.lines)}
            </li>
          ))}
        </ul>
        <div className="tv-toolbar">
          <TavelyoButton onClick={checkout.removeProblems}>Quitar estos productos</TavelyoButton>
        </div>
      </Card>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <>
        <ActionNotice notice={notice} />
        <EmptyState
          title="Tu pedido está vacío"
          description="Agrega productos desde la carta. Tu pedido solo lo ves tú en este teléfono."
        />
      </>
    );
  }

  return (
    <>
      <ActionNotice notice={notice} />
      <CartLines lines={cart.lines} onQuantity={cart.setQuantity} onRemove={cart.remove} />
      <p className="tv-list__title">
        Total estimado: {formatMoney(cartTotal(cart.lines, menu.currency))}
      </p>
      <p className="tv-list__meta">
        Los precios incluyen impuestos. Al revisar, el restaurante confirma los precios y el total;
        si algo cambió, te lo mostramos antes de seguir.
      </p>
      <div className="tv-toolbar">
        <TavelyoButton
          loading={state.step === 'reviewing'}
          loadingLabel="Revisando…"
          onClick={() => checkout.review(cart.lines)}
        >
          Revisar pedido
        </TavelyoButton>
      </div>
    </>
  );
}

/** Líneas e importes calculados por el servidor (D-01b: el impuesto va incluido). */
function QuoteLines({ summary }: { readonly summary: QuoteSummary }) {
  const money = (minor: string) => formatMinor(minor, summary.currency);
  return (
    <>
      <ul className="tv-list" aria-label="Productos del resumen">
        {summary.lines.map((line) => (
          <li key={line.position} className="tv-list__item">
            <div className="tv-list__summary">
              <span className="tv-list__title">
                {line.quantity} × {line.productName}
              </span>
              <span className="tv-list__meta">{money(line.lineTotalMinor)}</span>
            </div>
            {line.modifiers.length > 0 ? (
              <p className="tv-list__meta">
                {line.modifiers.map((modifier) => modifier.name).join(', ')}
              </p>
            ) : null}
            {line.note ? <p className="tv-list__meta">Nota: {line.note}</p> : null}
          </li>
        ))}
      </ul>
      <dl className="tv-totals">
        <dt>Subtotal sin impuestos</dt>
        <dd>{money(summary.subtotalMinor)}</dd>
        <dt>Impuestos incluidos</dt>
        <dd>{money(summary.taxMinor)}</dd>
        <dt className="tv-totals__total">Total</dt>
        <dd className="tv-totals__total">{money(summary.totalMinor)}</dd>
      </dl>
    </>
  );
}

function PaymentCard({
  total,
  busy,
  offerSimulatedOutcomes,
  onAuthorize,
  onEdit,
}: {
  readonly total: string;
  readonly busy: boolean;
  readonly offerSimulatedOutcomes: boolean;
  readonly onAuthorize: (outcome?: SimulatedPaymentOutcome) => void;
  readonly onEdit: () => void;
}) {
  const [outcome, setOutcome] = useState<SimulatedPaymentOutcome>('approved');
  return (
    <Card title="Pago simulado" headingLevel={2}>
      <p>
        Esta versión de prueba no cobra dinero real: el pago se simula y no se piden datos de
        tarjeta.
      </p>
      {offerSimulatedOutcomes ? (
        <SelectField
          label="Resultado del pago simulado"
          hint="Solo en el entorno de pruebas, para revisar cada caso."
          value={outcome}
          onChange={(event) => setOutcome(event.target.value as SimulatedPaymentOutcome)}
        >
          {SIMULATED_OUTCOMES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      ) : null}
      <div className="tv-toolbar">
        <TavelyoButton
          loading={busy}
          loadingLabel="Autorizando…"
          onClick={() => onAuthorize(offerSimulatedOutcomes ? outcome : undefined)}
        >
          Autorizar pago simulado · {total}
        </TavelyoButton>
        <TavelyoButton variant="secondary" disabled={busy} onClick={onEdit}>
          Cambiar el pedido
        </TavelyoButton>
      </div>
    </Card>
  );
}
