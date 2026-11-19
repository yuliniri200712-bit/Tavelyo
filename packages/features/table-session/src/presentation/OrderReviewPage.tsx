import type { ReactNode } from 'react';
import { formatLocalTime, formatMoney } from '@tavelyo/core';
import type { QuoteSummary } from '@tavelyo/contracts';
import { CartLines, cartTotal } from '@tavelyo/cart';
import {
  ActionBar,
  ActionNotice,
  Card,
  EmptyState,
  Icon,
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
  /** Enlace a «Mis pedidos», con el texto dado. */
  readonly myOrdersLink: (label: string) => ReactNode;
}

/**
 * Pedido de la persona: carrito, revisión con el servidor y envío (ADR-0012: sin pasarela; se paga
 * al final en el restaurante). Según la sucursal, llega a cocina o espera al mesero (D-32).
 */
export function OrderReviewPage({ menuLink, myOrdersLink }: OrderReviewPageProps) {
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
          <ReviewContent menu={menu} myOrdersLink={myOrdersLink} />
        </div>
      )}
    </MenuGate>
  );
}

function ReviewContent({
  menu,
  myOrdersLink,
}: {
  readonly menu: PublicMenu;
  readonly myOrdersLink: OrderReviewPageProps['myOrdersLink'];
}) {
  const { cart, checkout } = useTableOrder();
  const { state, message } = checkout;
  const notice = message ? { tone: 'error' as const, text: message } : null;

  if (state.step === 'done') {
    const waiting = state.outcome === 'pending_approval';
    return (
      <section className="tv-card" aria-labelledby="pedido-enviado">
        <div className="tv-success-head">
          <Icon name="check" size="large" />
          <h2 id="pedido-enviado">
            {waiting ? 'Pedido enviado al mesero' : 'Pedido enviado a cocina'}
          </h2>
        </div>
        <StatusChip
          tone={waiting ? 'warning' : 'success'}
          label={waiting ? 'Esperando al mesero' : 'En cocina'}
        />
        <QuoteLines summary={state.quote.summary} />
        <p>
          {waiting
            ? 'El mesero revisará tu pedido antes de enviarlo a cocina. En «Mis pedidos» ves si lo aprobó; mientras espera, puedes retirarlo.'
            : 'Tu pedido llegó a cocina. En «Mis pedidos» ves cómo avanza cada producto.'}{' '}
          {PAY_AT_THE_END}
        </p>
        <div className="tv-toolbar">
          {myOrdersLink('Ver mis pedidos')}
          <TavelyoButton variant="secondary" onClick={checkout.editOrder}>
            Hacer otro pedido
          </TavelyoButton>
        </div>
      </section>
    );
  }

  if (state.step === 'quoted' || state.step === 'submitting') {
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
        <SubmitCard
          total={formatMinor(state.quote.summary.totalMinor, state.quote.summary.currency)}
          busy={state.step === 'submitting'}
          onSubmit={checkout.submit}
          onEdit={checkout.editOrder}
        />
      </>
    );
  }

  if (state.step === 'changed') {
    return (
      <Card title="Algunos importes cambiaron" headingLevel={2}>
        <p>Antes de seguir, revisa los importes actuales. No se envía nada sin tu confirmación.</p>
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
      <p className="tv-order__total">
        <span>Total estimado</span>
        <span className="tv-tabular">{formatMoney(cartTotal(cart.lines, menu.currency))}</span>
      </p>
      <p className="tv-callout tv-callout--muted">
        <Icon name="info" />
        <span>
          Los precios incluyen impuestos. Al revisar, el restaurante confirma los precios y el
          total; si algo cambió, te lo mostramos antes de seguir.
        </span>
      </p>
      <ActionBar label="Revisar tu pedido">
        <TavelyoButton
          loading={state.step === 'reviewing'}
          loadingLabel="Revisando…"
          onClick={() => checkout.review(cart.lines)}
        >
          Revisar pedido
        </TavelyoButton>
      </ActionBar>
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

/** Cómo se paga (ADR-0012, D-33): al final, en el restaurante. */
const PAY_AT_THE_END =
  'Pagas al final, con el mesero o en caja: en efectivo, con datáfono o por transferencia.';

function SubmitCard({
  total,
  busy,
  onSubmit,
  onEdit,
}: {
  readonly total: string;
  readonly busy: boolean;
  readonly onSubmit: () => void;
  readonly onEdit: () => void;
}) {
  return (
    <Card title="Enviar tu pedido" headingLevel={2}>
      <div className="tv-callout">
        <Icon name="info" />
        <div className="tv-callout__body">
          <p className="tv-callout__title">Se suma a la cuenta de tu mesa</p>
          <p>{PAY_AT_THE_END} Aquí no se piden datos de tarjeta.</p>
        </div>
      </div>
      <div className="tv-toolbar">
        <TavelyoButton loading={busy} loadingLabel="Enviando…" onClick={onSubmit}>
          Enviar pedido · {total}
        </TavelyoButton>
        <TavelyoButton variant="secondary" disabled={busy} onClick={onEdit}>
          Cambiar el pedido
        </TavelyoButton>
      </div>
    </Card>
  );
}
