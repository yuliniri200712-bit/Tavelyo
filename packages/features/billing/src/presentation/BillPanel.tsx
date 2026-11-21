import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { BILL_SPLIT_PARTS, REFUND_REASON } from '@tavelyo/contracts';
import {
  ActionNotice,
  ConfirmDialog,
  ErrorState,
  LoadingState,
  ReasonDialog,
  SelectField,
  StatusChip,
  TavelyoButton,
  TextField,
  serverErrorText,
  type ActionResult,
} from '@tavelyo/design-system';
import {
  METHOD_TEXT,
  money,
  participantLabels,
  readPesos,
  readRefundReason,
} from '../application/billing.ts';
import type {
  Bill,
  BillingError,
  BillingGateway,
  BillPayment,
  BillScope,
  RefundInput,
} from '../domain/index.ts';
import { PaymentForm } from './PaymentForm.tsx';

export interface BillPanelProps {
  readonly gateway: BillingGateway;
  readonly scope: BillScope;
  readonly tableCode: string;
  readonly canRefund: boolean;
  readonly canClose: boolean;
  readonly cashTillOpen: boolean;
  /** Un cobro o un reembolso movió efectivo de la caja. */
  readonly onCashMoved: () => void;
  /** La mesa se cerró. */
  readonly onClosed: () => void;
  readonly receiptLink: (paymentId: string) => ReactNode;
}

type Loaded =
  | { readonly kind: 'loading' }
  | { readonly kind: 'failed'; readonly error: BillingError }
  | { readonly kind: 'ready'; readonly bill: Bill; readonly payments: readonly BillPayment[] };

/** Qué se cobra: todo lo pendiente, una parte de la división o lo de una persona. */
type Target =
  | { readonly kind: 'all' }
  | { readonly kind: 'part'; readonly index: number }
  | { readonly kind: 'person'; readonly participantId: string };

const newKey = () => crypto.randomUUID();

/** Cuenta de una mesa en la caja: cobrar, dividir, reembolsar y cerrar (bloque 6a). */
export function BillPanel({
  gateway,
  scope,
  tableCode,
  canRefund,
  canClose,
  cashTillOpen,
  onCashMoved,
  onClosed,
  receiptLink,
}: BillPanelProps) {
  const { tenantId, branchId, sessionId } = scope;
  const [loaded, setLoaded] = useState<Loaded>({ kind: 'loading' });
  const [parts, setParts] = useState<number | null>(null);
  const [target, setTarget] = useState<Target>({ kind: 'all' });
  const [notice, setNotice] = useState<ActionResult>(null);
  const [lastPayment, setLastPayment] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [lineRefund, setLineRefund] = useState<{ id: string; name: string } | null>(null);

  const load = useCallback(
    async (quiet = false) => {
      if (!quiet) setLoaded({ kind: 'loading' });
      const s = { tenantId, branchId, sessionId };
      const [bill, payments] = await Promise.all([
        gateway.bill(s, parts ?? undefined),
        canRefund ? gateway.payments(s) : Promise.resolve({ ok: true as const, value: [] }),
      ]);
      if (!bill.ok) return setLoaded({ kind: 'failed', error: bill.error });
      if (!payments.ok) return setLoaded({ kind: 'failed', error: payments.error });
      setLoaded({ kind: 'ready', bill: bill.value, payments: payments.value });
    },
    [gateway, tenantId, branchId, sessionId, parts, canRefund],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const failed = (error: BillingError) =>
    setNotice({ tone: 'error', text: serverErrorText(error) });

  if (loaded.kind === 'loading')
    return <LoadingState message={`Cargando la cuenta de la mesa ${tableCode}…`} />;
  if (loaded.kind === 'failed')
    return (
      <ErrorState
        title={`No se pudo cargar la cuenta de la mesa ${tableCode}`}
        description={serverErrorText(loaded.error)}
        onRetry={() => void load()}
      />
    );

  const { bill, payments } = loaded;
  const labels = participantLabels(bill.participants);
  const amountFor = (t: Target): string | null => {
    if (t.kind === 'all') return bill.outstandingMinor;
    if (t.kind === 'part') return bill.split?.[t.index] ?? null;
    return (
      bill.participants.find((p) => p.participantId === t.participantId)?.outstandingMinor ?? null
    );
  };
  const amount = amountFor(target);
  const refund = async (input: RefundInput, text: string) => {
    const result = await gateway.refund(scope, input);
    if (!result.ok) {
      failed(result.error);
      return false;
    }
    setNotice({ tone: 'success', text });
    onCashMoved();
    void load(true);
    return true;
  };

  return (
    <section aria-label={`Cuenta de la mesa ${tableCode}`} className="tv-form">
      <h3>Cuenta de la mesa {tableCode}</h3>
      <ActionNotice notice={notice} />
      {lastPayment ? <p>{receiptLink(lastPayment)}</p> : null}
      {bill.lines.length === 0 ? (
        <p>La mesa todavía no tiene consumo enviado a cocina.</p>
      ) : (
        <ul className="tv-list" aria-label="Platos de la cuenta">
          {bill.lines.map((line) => (
            <li key={line.id} className="tv-list__item">
              <span className="tv-list__title">
                {line.quantity} × {line.name}: {money(line.totalMinor)}
              </span>
              <span className="tv-list__meta">
                {labels.get(line.participantId)} ·{' '}
                {line.outstandingMinor === '0'
                  ? 'pagado'
                  : `pendiente ${money(line.outstandingMinor)}`}
              </span>
              {canRefund && line.paidMinor !== '0' ? (
                <TavelyoButton
                  variant="secondary"
                  onClick={() => setLineRefund({ id: line.id, name: line.name })}
                >
                  Devolver el plato
                </TavelyoButton>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <dl className="tv-totals">
        <dt>Total</dt>
        <dd>{money(bill.totalMinor)}</dd>
        <dt>Impuestos incluidos</dt>
        <dd>{money(bill.taxMinor)}</dd>
        <dt>Pagado</dt>
        <dd>{money(bill.paidMinor)}</dd>
        {bill.refundedMinor !== '0' ? (
          <>
            <dt>Reembolsado</dt>
            <dd>{money(bill.refundedMinor)}</dd>
          </>
        ) : null}
        <dt className="tv-totals__total">Pendiente</dt>
        <dd className="tv-totals__total">{money(bill.outstandingMinor)}</dd>
      </dl>

      {bill.outstandingMinor !== '0' ? (
        <>
          <SelectField
            label="Qué cobrar"
            value={
              target.kind === 'person'
                ? `person:${target.participantId}`
                : target.kind === 'part'
                  ? `part:${target.index}`
                  : 'all'
            }
            onChange={(event) => {
              const [kind, value] = event.target.value.split(':');
              if (kind === 'part') setTarget({ kind: 'part', index: Number(value) });
              else if (kind === 'person' && value)
                setTarget({ kind: 'person', participantId: value });
              else setTarget({ kind: 'all' });
            }}
          >
            <option value="all">Todo lo pendiente ({money(bill.outstandingMinor)})</option>
            {bill.participants
              .filter((p) => p.outstandingMinor !== '0')
              .map((p) => (
                <option key={p.participantId} value={`person:${p.participantId}`}>
                  Lo de {labels.get(p.participantId)} ({money(p.outstandingMinor)})
                </option>
              ))}
            {(bill.split ?? []).map((part, i) => (
              <option key={`part-${i}`} value={`part:${i}`}>
                Parte {i + 1} de {bill.split?.length} ({money(part)})
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Dividir en partes iguales"
            value={parts === null ? '' : String(parts)}
            onChange={(event) => {
              setTarget({ kind: 'all' });
              setParts(event.target.value === '' ? null : Number(event.target.value));
            }}
            hint="Divide lo pendiente; cada parte se cobra aparte, con cualquier medio."
          >
            <option value="">Sin dividir</option>
            {Array.from(
              { length: BILL_SPLIT_PARTS.max - BILL_SPLIT_PARTS.min + 1 },
              (_, i) => i + BILL_SPLIT_PARTS.min,
            ).map((n) => (
              <option key={n} value={n}>
                {n} partes
              </option>
            ))}
          </SelectField>
          {amount ? (
            <PaymentForm
              key={`${bill.revision}-${JSON.stringify(target)}`}
              amountMinor={amount}
              suggestedTipMinor={bill.suggestedTipMinor}
              revision={bill.revision}
              {...(target.kind === 'person' ? { participantId: target.participantId } : {})}
              cashTillOpen={cashTillOpen}
              onPay={async (input) => {
                const result = await gateway.recordPayment(scope, input);
                if (!result.ok) {
                  failed(result.error);
                  return false;
                }
                setNotice({
                  tone: 'success',
                  text:
                    `Cobro de ${money(input.amountMinor)} registrado (${METHOD_TEXT[input.method].toLowerCase()}).` +
                    (result.value.changeMinor
                      ? ` Cambio: ${money(result.value.changeMinor)}.`
                      : ''),
                });
                setLastPayment(result.value.paymentId);
                setTarget({ kind: 'all' });
                setParts(null);
                if (input.method === 'CASH') onCashMoved();
                void load(true);
                return true;
              }}
            />
          ) : null}
        </>
      ) : (
        <p>
          <StatusChip label="Cuenta saldada" tone="success" />
        </p>
      )}

      {canRefund && payments.length > 0 ? (
        <PaymentsList
          payments={payments}
          receiptLink={receiptLink}
          onRefund={(payment, amountMinor, reason) =>
            refund(
              {
                revision: bill.revision,
                idempotencyKey: newKey(),
                reason,
                paymentId: payment.paymentId,
                amountMinor,
              },
              `Reembolso de ${money(amountMinor)} registrado.`,
            )
          }
        />
      ) : null}

      {canClose ? (
        <div className="tv-toolbar">
          <TavelyoButton variant="secondary" onClick={() => setClosing(true)}>
            Cerrar la mesa
          </TavelyoButton>
        </div>
      ) : null}
      <ConfirmDialog
        open={closing}
        title={`¿Cerrar la mesa ${tableCode}?`}
        confirmLabel="Cerrar la mesa"
        onCancel={() => setClosing(false)}
        onConfirm={() => {
          void gateway.closeTable(scope).then((result) => {
            setClosing(false);
            if (!result.ok) return failed(result.error);
            onClosed();
          });
        }}
      >
        <p>Solo se cierra si no queda saldo y todos los platos se entregaron o se cancelaron.</p>
      </ConfirmDialog>
      <ReasonDialog
        open={lineRefund !== null}
        title={`¿Devolver «${lineRefund?.name ?? ''}»?`}
        confirmLabel="Devolver el plato"
        destructive
        label="Motivo"
        maxLength={REFUND_REASON.max}
        parse={readRefundReason}
        invalidText={`Escribe el motivo (entre ${REFUND_REASON.min} y ${REFUND_REASON.max} caracteres).`}
        onCancel={() => setLineRefund(null)}
        onConfirm={(reason) => {
          const line = lineRefund;
          setLineRefund(null);
          if (line)
            void refund(
              { revision: bill.revision, idempotencyKey: newKey(), reason, orderItemId: line.id },
              `Plato «${line.name}» devuelto: se reembolsó lo pagado y salió de la cuenta.`,
            );
        }}
      >
        <p>Se devuelve lo que se pagó por el plato y el plato sale de la cuenta.</p>
      </ReasonDialog>
    </section>
  );
}

function PaymentsList({
  payments,
  receiptLink,
  onRefund,
}: {
  readonly payments: readonly BillPayment[];
  readonly receiptLink: (paymentId: string) => ReactNode;
  readonly onRefund: (
    payment: BillPayment,
    amountMinor: string,
    reason: string,
  ) => Promise<boolean>;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; reason?: string }>({});
  return (
    <section aria-label="Pagos de la mesa">
      <h4>Pagos</h4>
      <ul className="tv-list">
        {payments.map((p) => (
          <li key={p.paymentId} className="tv-list__item">
            <span className="tv-list__title">
              {METHOD_TEXT[p.method]}: {money(p.amountMinor)}
              {p.tipMinor !== '0' ? ` + propina ${money(p.tipMinor)}` : ''}
            </span>
            <span className="tv-list__meta">
              {p.receiptNumber ? `Comprobante ${p.receiptNumber} · ` : ''}
              {p.refundedMinor !== '0' ? `reembolsado ${money(p.refundedMinor)} · ` : ''}
              se puede devolver {money(p.refundableMinor)}
            </span>
            <span>{receiptLink(p.paymentId)}</span>
            {open === p.paymentId ? (
              <div className="tv-form">
                <TextField
                  label="Importe a devolver (pesos)"
                  inputMode="numeric"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  error={errors.amount}
                />
                <TextField
                  label="Motivo del reembolso"
                  value={reason}
                  maxLength={REFUND_REASON.max}
                  onChange={(event) => setReason(event.target.value)}
                  error={errors.reason}
                />
                <div className="tv-toolbar">
                  <TavelyoButton
                    variant="destructive"
                    onClick={() => {
                      const parsed = readPesos(amount);
                      const why = readRefundReason(reason);
                      setErrors({
                        ...(parsed.ok ? {} : { amount: parsed.error }),
                        ...(why
                          ? {}
                          : {
                              reason: `Escribe el motivo (entre ${REFUND_REASON.min} y ${REFUND_REASON.max} caracteres).`,
                            }),
                      });
                      if (!parsed.ok || !why) return;
                      void onRefund(p, parsed.value, why).then((saved) => {
                        if (!saved) return;
                        setOpen(null);
                        setAmount('');
                        setReason('');
                      });
                    }}
                  >
                    Registrar reembolso
                  </TavelyoButton>
                  <TavelyoButton variant="secondary" onClick={() => setOpen(null)}>
                    Cancelar
                  </TavelyoButton>
                </div>
              </div>
            ) : p.refundableMinor !== '0' ? (
              <TavelyoButton variant="secondary" onClick={() => setOpen(p.paymentId)}>
                Reembolsar
              </TavelyoButton>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
