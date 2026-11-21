import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { formatLocalTime } from '@tavelyo/core';
import {
  ActionNotice,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  RadioField,
  SelectField,
  StatusChip,
  TavelyoButton,
  TextField,
  serverErrorText,
  type ActionResult,
} from '@tavelyo/design-system';
import {
  availableRegisters,
  describeDifference,
  money,
  MOVEMENT_TEXT,
  readCashReason,
  readPesos,
} from '../application/cash-desk.ts';
import type { BranchScope, CashError, CashGateway, Register, Till } from '../domain/index.ts';

export interface TillPanelProps {
  readonly gateway: CashGateway;
  readonly scope: BranchScope;
  readonly timezone: string;
  /** Cambia cuando otra parte de la pantalla movió efectivo (un cobro o un reembolso). */
  readonly refreshToken?: number;
  /** Avisa si quien usa la pantalla tiene la caja abierta. */
  readonly onTillChange?: (till: Till | null) => void;
}

type Loaded =
  | { readonly kind: 'loading' }
  | { readonly kind: 'failed'; readonly error: CashError }
  | { readonly kind: 'ready'; readonly till: Till | null; readonly registers: readonly Register[] };

const newKey = () => crypto.randomUUID();

/**
 * Turno de caja de quien usa la pantalla (RF-PA-07, D-40): abrir con fondo, entradas y salidas con
 * motivo, efectivo esperado y cierre con conteo. El servidor calcula todo y decide.
 */
export function TillPanel({
  gateway,
  scope,
  timezone,
  refreshToken,
  onTillChange,
}: TillPanelProps) {
  const { tenantId, branchId } = scope;
  const [loaded, setLoaded] = useState<Loaded>({ kind: 'loading' });
  const [notice, setNotice] = useState<ActionResult>(null);

  const load = useCallback(
    async (quiet = false) => {
      if (!quiet) setLoaded({ kind: 'loading' });
      const [till, registers] = await Promise.all([
        gateway.myTill({ tenantId, branchId }),
        gateway.registers({ tenantId, branchId }),
      ]);
      if (!till.ok) return setLoaded({ kind: 'failed', error: till.error });
      if (!registers.ok) return setLoaded({ kind: 'failed', error: registers.error });
      setLoaded({ kind: 'ready', till: till.value, registers: registers.value });
    },
    [gateway, tenantId, branchId],
  );

  useEffect(() => {
    void load(refreshToken !== undefined && refreshToken > 0);
  }, [load, refreshToken]);

  const till = loaded.kind === 'ready' ? loaded.till : null;
  useEffect(() => {
    if (loaded.kind === 'ready') onTillChange?.(loaded.till);
  }, [loaded, onTillChange]);

  const done = (text: string) => {
    setNotice({ tone: 'success', text });
    void load(true);
  };
  const failed = (error: CashError) => setNotice({ tone: 'error', text: serverErrorText(error) });

  return (
    <Card title="Mi caja" headingLevel={2}>
      <ActionNotice notice={notice} />
      {loaded.kind === 'loading' ? <LoadingState message="Cargando tu caja…" /> : null}
      {loaded.kind === 'failed' ? (
        <ErrorState
          title="No se pudo cargar tu caja"
          description={serverErrorText(loaded.error)}
          onRetry={() => void load()}
        />
      ) : null}
      {loaded.kind === 'ready' && !till ? (
        <OpenTillForm
          registers={loaded.registers}
          onOpen={async (registerId, floatMinor) => {
            const result = await gateway.openTill(scope, registerId, floatMinor);
            if (!result.ok) return failed(result.error);
            done(`Caja abierta con ${money(floatMinor)} de fondo.`);
          }}
        />
      ) : null}
      {till ? (
        <>
          <p>
            <StatusChip label="Caja abierta" tone="success" /> desde las{' '}
            {formatLocalTime(till.openedAt, timezone)}
          </p>
          <TillTotals till={till} />
          <MovementForm
            onSubmit={async (movement) => {
              const result = await gateway.move(scope, till, movement);
              if (!result.ok) {
                failed(result.error);
                return false;
              }
              done(`${MOVEMENT_TEXT[movement.kind]} de ${money(movement.amountMinor)} registrada.`);
              return true;
            }}
          />
          <MovementList till={till} timezone={timezone} />
          <CloseTillForm
            till={till}
            onClose={async (countedMinor, reason) => {
              const result = await gateway.closeTill(scope, till, countedMinor, reason);
              if (!result.ok) return failed(result.error);
              done(
                `Caja cerrada. Esperado ${money(result.value.expectedMinor)}, contado ${money(result.value.countedMinor)}. ${describeDifference(result.value.expectedMinor, result.value.countedMinor)}`,
              );
            }}
          />
        </>
      ) : null}
    </Card>
  );
}

function OpenTillForm({
  registers,
  onOpen,
}: {
  readonly registers: readonly Register[];
  readonly onOpen: (registerId: string, floatMinor: string) => Promise<void>;
}) {
  const choices = availableRegisters(registers);
  const [registerId, setRegisterId] = useState('');
  const [float, setFloat] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  if (choices.length === 0)
    return (
      <EmptyState
        title="No hay cajas libres"
        description="Todas las cajas de la sucursal están en uso o no hay ninguna. Pide a la administración que cree una."
      />
    );
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const amount = readPesos(float, true);
    if (!amount.ok) return setError(amount.error);
    setError(undefined);
    setBusy(true);
    await onOpen(registerId || (choices[0]?.id ?? ''), amount.value);
    setBusy(false);
  };
  return (
    <form className="tv-form" onSubmit={(event) => void submit(event)} noValidate>
      <p>Para cobrar o devolver efectivo necesitas tu caja abierta.</p>
      <SelectField
        label="Caja"
        value={registerId || (choices[0]?.id ?? '')}
        onChange={(event) => setRegisterId(event.target.value)}
      >
        {choices.map((register) => (
          <option key={register.id} value={register.id}>
            {register.name}
          </option>
        ))}
      </SelectField>
      <TextField
        label="Fondo inicial (pesos)"
        inputMode="numeric"
        value={float}
        onChange={(event) => setFloat(event.target.value)}
        hint="El efectivo con el que empiezas, por ejemplo 100.000."
        error={error}
      />
      <div className="tv-toolbar">
        <TavelyoButton type="submit" loading={busy} loadingLabel="Abriendo…">
          Abrir caja
        </TavelyoButton>
      </div>
    </form>
  );
}

function TillTotals({ till }: { readonly till: Till }) {
  return (
    <dl className="tv-totals">
      <dt>Fondo inicial</dt>
      <dd>{money(till.openingFloatMinor)}</dd>
      <dt>Entradas</dt>
      <dd>{money(till.cashInMinor)}</dd>
      <dt>Ventas en efectivo</dt>
      <dd>{money(till.salesMinor)}</dd>
      <dt>Salidas</dt>
      <dd>− {money(till.cashOutMinor)}</dd>
      <dt>Reembolsos en efectivo</dt>
      <dd>− {money(till.refundsMinor)}</dd>
      <dt className="tv-totals__total">Efectivo esperado</dt>
      <dd className="tv-totals__total">{money(till.expectedMinor)}</dd>
    </dl>
  );
}

function MovementForm({
  onSubmit,
}: {
  readonly onSubmit: (movement: {
    kind: 'CASH_IN' | 'CASH_OUT';
    amountMinor: string;
    reason: string;
    idempotencyKey: string;
  }) => Promise<boolean>;
}) {
  const [kind, setKind] = useState<'CASH_IN' | 'CASH_OUT'>('CASH_OUT');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; reason?: string }>({});
  const [key, setKey] = useState(newKey);
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsedAmount = readPesos(amount);
    const parsedReason = readCashReason(reason);
    setErrors({
      ...(parsedAmount.ok ? {} : { amount: parsedAmount.error }),
      ...(parsedReason.ok ? {} : { reason: parsedReason.error }),
    });
    if (!parsedAmount.ok || !parsedReason.ok) return;
    setBusy(true);
    const saved = await onSubmit({
      kind,
      amountMinor: parsedAmount.value,
      reason: parsedReason.value,
      idempotencyKey: key,
    });
    setBusy(false);
    if (saved) {
      setAmount('');
      setReason('');
      setKey(newKey());
    }
  };
  return (
    <form className="tv-form" onSubmit={(event) => void submit(event)} noValidate>
      <fieldset className="tv-fieldset">
        <legend className="tv-fieldset__legend">Entrada o salida de efectivo</legend>
        <RadioField
          name="cash-movement"
          value="CASH_OUT"
          checked={kind === 'CASH_OUT'}
          onChange={() => setKind('CASH_OUT')}
          label="Salida"
          hint="Por ejemplo, un pago a un proveedor."
        />
        <RadioField
          name="cash-movement"
          value="CASH_IN"
          checked={kind === 'CASH_IN'}
          onChange={() => setKind('CASH_IN')}
          label="Entrada"
          hint="Por ejemplo, cambio traído del banco."
        />
      </fieldset>
      <TextField
        label="Importe (pesos)"
        inputMode="numeric"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        error={errors.amount}
      />
      <TextField
        label="Motivo"
        value={reason}
        maxLength={200}
        onChange={(event) => setReason(event.target.value)}
        error={errors.reason}
      />
      <div className="tv-toolbar">
        <TavelyoButton type="submit" variant="secondary" loading={busy} loadingLabel="Registrando…">
          Registrar {kind === 'CASH_IN' ? 'entrada' : 'salida'}
        </TavelyoButton>
      </div>
    </form>
  );
}

function MovementList({ till, timezone }: { readonly till: Till; readonly timezone: string }) {
  if (till.movements.length === 0) return <p>Todavía no hay movimientos en este turno.</p>;
  return (
    <section aria-label="Movimientos del turno">
      <h3>Movimientos del turno</h3>
      <ul className="tv-list">
        {till.movements.map((m) => (
          <li key={m.id} className="tv-list__item">
            <span className="tv-list__title">
              {MOVEMENT_TEXT[m.kind]}: {m.kind === 'CASH_OUT' || m.kind === 'REFUND' ? '− ' : ''}
              {money(m.amountMinor)}
            </span>
            <span className="tv-list__meta">
              {formatLocalTime(m.createdAt, timezone)}
              {m.reason ? ` · ${m.reason}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CloseTillForm({
  till,
  onClose,
}: {
  readonly till: Till;
  readonly onClose: (countedMinor: string, reason: string | null) => Promise<void>;
}) {
  const [counted, setCounted] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<{ counted?: string; reason?: string }>({});
  const [confirm, setConfirm] = useState<{ counted: string; reason: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const parsed = readPesos(counted, true);
  const matches = parsed.ok && parsed.value === till.expectedMinor;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!parsed.ok) return setErrors({ counted: parsed.error });
    const why = matches ? null : readCashReason(reason);
    if (why && !why.ok)
      return setErrors({ reason: 'La caja no cuadra: ' + why.error.toLowerCase() });
    setErrors({});
    setConfirm({ counted: parsed.value, reason: why?.ok ? why.value : null });
  };
  return (
    <form className="tv-form" onSubmit={submit} noValidate>
      <h3>Cerrar la caja</h3>
      <TextField
        label="Efectivo contado (pesos)"
        inputMode="numeric"
        value={counted}
        onChange={(event) => setCounted(event.target.value)}
        hint={
          parsed.ok
            ? describeDifference(till.expectedMinor, parsed.value)
            : 'Cuenta el efectivo de la caja.'
        }
        error={errors.counted}
      />
      {parsed.ok && !matches ? (
        <TextField
          label="Motivo de la diferencia"
          value={reason}
          maxLength={200}
          onChange={(event) => setReason(event.target.value)}
          error={errors.reason}
        />
      ) : null}
      <div className="tv-toolbar">
        <TavelyoButton type="submit" variant="secondary">
          Cerrar caja
        </TavelyoButton>
      </div>
      <ConfirmDialog
        open={confirm !== null}
        title="¿Cerrar la caja?"
        confirmLabel="Cerrar caja"
        busy={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          setBusy(true);
          void onClose(confirm.counted, confirm.reason).finally(() => {
            setBusy(false);
            setConfirm(null);
          });
        }}
      >
        <p>
          Esperado {money(till.expectedMinor)}; contado {confirm ? money(confirm.counted) : ''}.{' '}
          {confirm ? describeDifference(till.expectedMinor, confirm.counted) : ''} Después de cerrar
          ya no podrás cobrar en efectivo hasta abrir otro turno.
        </p>
      </ConfirmDialog>
    </form>
  );
}
