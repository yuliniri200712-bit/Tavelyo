import { useState, type FormEvent } from 'react';
import { ConfirmDialog, RadioField, TavelyoButton, TextField } from '@tavelyo/design-system';
import { RECEIPT_NUMBER_MAX_LENGTH } from '@tavelyo/contracts';
import {
  changePreview,
  METHOD_TEXT,
  money,
  pesosText,
  readPaymentDraft,
  type DraftErrors,
  type PaymentDraft,
} from '../application/billing.ts';
import type { PaymentInput, PaymentMethod } from '../domain/index.ts';

export interface PaymentFormProps {
  /** Lo que se propone cobrar (saldo, una parte o lo de una persona), en unidades menores. */
  readonly amountMinor: string;
  readonly suggestedTipMinor: string;
  readonly revision: string;
  readonly participantId?: string;
  readonly cashTillOpen: boolean;
  readonly onPay: (input: PaymentInput) => Promise<boolean>;
}

const METHODS: readonly PaymentMethod[] = ['CASH', 'TERMINAL', 'TRANSFER'];
const newKey = () => crypto.randomUUID();

/**
 * Cobro registrado (D-33): efectivo con lo recibido y el cambio; datáfono propio o transferencia con
 * el número de comprobante, nunca datos de tarjeta. La propina es voluntaria (D-05).
 */
export function PaymentForm({
  amountMinor,
  suggestedTipMinor,
  revision,
  participantId,
  cashTillOpen,
  onPay,
}: PaymentFormProps) {
  const [draft, setDraft] = useState<PaymentDraft>({
    method: 'CASH',
    amount: pesosText(amountMinor),
    tip: '',
    received: '',
    receiptNumber: '',
  });
  const [errors, setErrors] = useState<DraftErrors>({});
  const [key] = useState(newKey);
  const [review, setReview] = useState<PaymentInput | null>(null);
  const [recorded, setRecorded] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (change: Partial<PaymentDraft>) => setDraft((d) => ({ ...d, ...change }));
  const change = changePreview(draft);

  const cashUnavailable = draft.method === 'CASH' && !cashTillOpen;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (busy || recorded || cashUnavailable) return;
    const input = readPaymentDraft(draft, {
      revision,
      idempotencyKey: key,
      ...(participantId ? { participantId } : {}),
    });
    if (!input.ok) return setErrors(input.error);
    setErrors({});
    setReview(input.value);
  };

  const confirm = async () => {
    if (!review || busy || recorded || cashUnavailable) return;
    setBusy(true);
    try {
      setRecorded(await onPay(review));
    } finally {
      setBusy(false);
      setReview(null);
    }
  };

  return (
    <form className="tv-form" onSubmit={submit} noValidate>
      <fieldset className="tv-fieldset">
        <legend className="tv-fieldset__legend">Medio de pago</legend>
        {METHODS.map((method) => (
          <RadioField
            key={method}
            name="payment-method"
            value={method}
            checked={draft.method === method}
            onChange={() => set({ method })}
            label={METHOD_TEXT[method]}
            {...(method === 'CASH' && !cashTillOpen
              ? { hint: 'Necesitas tu caja abierta para cobrar en efectivo.' }
              : {})}
          />
        ))}
      </fieldset>
      <TextField
        label="Consumo a cobrar (pesos)"
        inputMode="numeric"
        value={draft.amount}
        onChange={(event) => set({ amount: event.target.value })}
        error={errors.amount}
      />
      <TextField
        label="Propina (pesos, voluntaria)"
        inputMode="numeric"
        value={draft.tip}
        onChange={(event) => set({ tip: event.target.value })}
        hint={`Sugerida para toda la cuenta: ${money(suggestedTipMinor)} (10 %). Déjala vacía si no hay propina.`}
        error={errors.tip}
      />
      {draft.method === 'CASH' ? (
        <TextField
          label="Efectivo recibido (pesos)"
          inputMode="numeric"
          value={draft.received}
          onChange={(event) => set({ received: event.target.value })}
          hint={change !== null ? `Cambio a devolver: ${money(change)}` : undefined}
          error={errors.received}
        />
      ) : (
        <TextField
          label="Número de comprobante"
          value={draft.receiptNumber}
          maxLength={RECEIPT_NUMBER_MAX_LENGTH}
          autoComplete="off"
          onChange={(event) => set({ receiptNumber: event.target.value })}
          hint="El número que da el datáfono o la transferencia. Nunca el número de la tarjeta."
          error={errors.receiptNumber}
        />
      )}
      <div className="tv-toolbar">
        <TavelyoButton type="submit" disabled={cashUnavailable || recorded || busy}>
          Revisar cobro
        </TavelyoButton>
      </div>
      <ConfirmDialog
        open={review !== null}
        title="¿Registrar este cobro?"
        confirmLabel="Registrar cobro"
        busy={busy}
        onCancel={() => setReview(null)}
        onConfirm={() => void confirm()}
      >
        {review ? (
          <p>
            {METHOD_TEXT[review.method]} · Total{' '}
            {money((BigInt(review.amountMinor) + BigInt(review.tipMinor)).toString())}. Consumo{' '}
            {money(review.amountMinor)} y propina {money(review.tipMinor)}.
            {review.receiptNumber ? ` Comprobante ${review.receiptNumber}.` : ''}
            {review.receivedMinor ? ` Recibido ${money(review.receivedMinor)}.` : ''}
          </p>
        ) : null}
      </ConfirmDialog>
    </form>
  );
}
