import { useCallback, type ReactNode } from 'react';
import {
  ErrorState,
  Icon,
  LoadingState,
  PageTitle,
  TavelyoButton,
  serverErrorText,
  useServerData,
} from '@tavelyo/design-system';
import { METHOD_TEXT, money } from '../application/billing.ts';
import type { BillingGateway, BillScope, Receipt } from '../domain/index.ts';

export interface ReceiptPageProps {
  readonly gateway: BillingGateway;
  readonly scope: BillScope;
  readonly paymentId: string;
  readonly timezone: string;
  readonly backLink: ReactNode;
}

const dateTime = (instant: Date, timeZone: string) =>
  new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
    hourCycle: 'h23',
    timeZone,
  }).format(instant);

/**
 * Comprobante comercial del pago, para ver e imprimir (bloque 6a). Lleva el NIT de la empresa. No es
 * factura electrónica: la de la DIAN es otra obligación (RF-PA-08).
 */
export function ReceiptPage({ gateway, scope, paymentId, timezone, backLink }: ReceiptPageProps) {
  const { tenantId, branchId, sessionId } = scope;
  const load = useCallback(
    () => gateway.receipt({ tenantId, branchId, sessionId }, paymentId),
    [gateway, tenantId, branchId, sessionId, paymentId],
  );
  const { state, reload } = useServerData(load);
  return (
    <div className="tv-page">
      <div className="tv-no-print">
        <PageTitle icon="bill">Comprobante del pago</PageTitle>
        <div className="tv-toolbar">
          {backLink}
          {state.status === 'ready' ? (
            <TavelyoButton onClick={() => window.print()}>
              <Icon name="print" /> Imprimir
            </TavelyoButton>
          ) : null}
        </div>
      </div>
      {state.status === 'loading' ? <LoadingState message="Cargando el comprobante…" /> : null}
      {state.status === 'error' ? (
        <ErrorState
          title="No se pudo cargar el comprobante"
          description={serverErrorText(state.error)}
          onRetry={reload}
        />
      ) : null}
      {state.status === 'ready' ? <ReceiptView receipt={state.data} timezone={timezone} /> : null}
    </div>
  );
}

export function ReceiptView({
  receipt,
  timezone,
}: {
  readonly receipt: Receipt;
  readonly timezone: string;
}) {
  return (
    <article className="tv-receipt" aria-label="Comprobante">
      <header className="tv-receipt__head">
        <p className="tv-receipt__title">{receipt.tenantName}</p>
        <p>{receipt.taxId ? `NIT ${receipt.taxId}` : 'NIT sin registrar'}</p>
        <p>Sucursal {receipt.branchName}</p>
      </header>
      {receipt.taxId ? null : (
        <p className="tv-callout tv-no-print" role="status">
          Falta el NIT de la empresa: el propietario lo registra en «Datos de la empresa».
        </p>
      )}
      <p>
        Mesa {receipt.tableCode} · {dateTime(receipt.paidAt, timezone)}
      </p>
      <ul className="tv-list" aria-label="Platos">
        {receipt.lines.map((line, i) => (
          <li key={i} className="tv-receipt__line">
            <span>
              {line.quantity} × {line.name}
            </span>
            <span>{money(line.amountMinor)}</span>
          </li>
        ))}
      </ul>
      <dl className="tv-totals">
        <dt>Consumo</dt>
        <dd>{money(receipt.amountMinor)}</dd>
        <dt>Propina voluntaria</dt>
        <dd>{money(receipt.tipMinor)}</dd>
        <dt className="tv-totals__total">Total pagado</dt>
        <dd className="tv-totals__total">{money(receipt.totalMinor)}</dd>
        <dt>Medio de pago</dt>
        <dd>{METHOD_TEXT[receipt.method]}</dd>
        {receipt.receiptNumber ? (
          <>
            <dt>Comprobante</dt>
            <dd>{receipt.receiptNumber}</dd>
          </>
        ) : null}
        {receipt.receivedMinor ? (
          <>
            <dt>Recibido</dt>
            <dd>{money(receipt.receivedMinor)}</dd>
            <dt>Cambio</dt>
            <dd>{money(receipt.changeMinor ?? '0')}</dd>
          </>
        ) : null}
        {receipt.refundedMinor !== '0' ? (
          <>
            <dt>Reembolsado</dt>
            <dd>{money(receipt.refundedMinor)}</dd>
          </>
        ) : null}
      </dl>
      <p className="tv-receipt__legal">Comprobante de pago. No es factura electrónica.</p>
    </article>
  );
}
