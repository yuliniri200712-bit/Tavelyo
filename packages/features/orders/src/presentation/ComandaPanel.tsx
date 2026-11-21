import { useCallback, useState } from 'react';
import {
  cartTotal,
  toQuoteLines,
  addToCart,
  setQuantity,
  removeLine,
  acceptServerPrices,
  CartLines,
  ProductConfigurator,
  type CartLine,
} from '@tavelyo/cart';
import { formatMoney } from '@tavelyo/core';
import {
  TextField,
  SelectField,
  ConfirmDialog,
  ActionNotice,
  ErrorState,
  LoadingState,
  TavelyoButton,
  useServerData,
  serverErrorText,
  type ActionResult,
} from '@tavelyo/design-system';
import type { ComandaScope, ComandaProduct, ComandaGateway } from '../domain/comanda.ts';

interface Props {
  gateway: ComandaGateway;
  scope: ComandaScope;
  tableCode: string;
  sector: string;
  offline: boolean;
}
const key = () => crypto.randomUUID();
export function ComandaPanel({ gateway, scope, tableCode, sector, offline }: Props) {
  const { tenantId, branchId, sessionId } = scope;
  const load = useCallback(
    () => gateway.menu({ tenantId, branchId, sessionId }),
    [gateway, tenantId, branchId, sessionId],
  );
  const { state, refresh, reload } = useServerData(load);
  const [person, setPerson] = useState('');
  const [query, setQuery] = useState('');
  const [product, setProduct] = useState<ComandaProduct | null>(null);
  const [lines, setLines] = useState<readonly CartLine[]>([]);
  const [notice, setNotice] = useState<ActionResult>(null);
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [requestKey, setRequestKey] = useState(key);
  if (state.status === 'loading') return <LoadingState message="Cargando la comanda…" />;
  if (state.status === 'error')
    return (
      <ErrorState
        title="No se pudo cargar la comanda"
        description={serverErrorText(state.error)}
        onRetry={reload}
      />
    );
  const menu = state.data;
  const selected = menu.people.find((p) => p.id === person);
  const total = cartTotal(lines, menu.currency);
  const products = menu.products.filter((p) =>
    (p.name + ' ' + p.categoryName)
      .toLocaleLowerCase('es')
      .includes(query.trim().toLocaleLowerCase('es')),
  );
  const fail = (text: string) => setNotice({ tone: 'error', text });
  const addGuest = async () => {
    setBusy(true);
    try {
      const number = Math.max(0, ...menu.people.map((p) => p.guestNumber ?? 0)) + 1;
      const result = await gateway.addGuest(scope, number);
      if (result.ok) {
        setPerson(result.value);
        setNotice({
          tone: 'success',
          text: 'Persona sin teléfono ' + number + ' agregada a la mesa.',
        });
      } else fail(serverErrorText(result.error));
      refresh();
    } finally {
      setBusy(false);
    }
  };
  const send = async () => {
    if (busy || offline || !selected || !lines.length) return;
    setBusy(true);
    try {
      const r = await gateway.send(scope, selected.id, {
        sessionId,
        idempotencyKey: requestKey,
        lines: toQuoteLines(lines),
        expectedTotalMinor: total.amountMinor.toString(),
      });
      setReview(false);
      if (!r.ok) {
        const unknown = r.error.kind === 'network' || r.error.kind === 'unknown';
        setUncertain(unknown);
        fail(
          unknown
            ? 'Falta confirmar el envío. Reintenta la misma comanda para consultar el resultado.'
            : serverErrorText(r.error),
        );
        return;
      }
      setUncertain(false);
      setRequestKey(key());
      if (r.value.outcome === 'sent') {
        setLines([]);
        setProduct(null);
        setNotice({
          tone: 'success',
          text: 'Pedido enviado a cocina para ' + selected.label + '.',
        });
      } else if (r.value.outcome === 'changed') {
        setLines(acceptServerPrices(lines, r.value.summary));
        fail('Cambió el precio. Revisa el nuevo resumen antes de enviar.');
        refresh();
      } else {
        fail('Revisa los productos y sus opciones antes de enviar.');
        refresh();
      }
    } finally {
      setBusy(false);
    }
  };
  return (
    <section aria-label={'Comanda de la mesa ' + tableCode} className="tv-form">
      <h3>
        Tomar pedido · Mesa {tableCode} · {sector}
      </h3>
      <ActionNotice notice={notice} />
      <fieldset disabled={busy || offline || uncertain} className="tv-fieldset">
        <legend>Persona y productos</legend>
        <SelectField
          label="Persona de la mesa"
          value={person}
          onChange={(e) => setPerson(e.target.value)}
        >
          <option value="">Elige a quién corresponde el pedido</option>
          {menu.people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </SelectField>
        <TavelyoButton variant="secondary" onClick={() => void addGuest()}>
          Agregar persona sin teléfono
        </TavelyoButton>
        <TextField
          label="Buscar por producto o categoría"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {products.length === 0 ? <p>No hay productos disponibles para esta búsqueda.</p> : null}
        <ul className="tv-list">
          {products.map((p) => (
            <li key={p.id} className="tv-list__item">
              <span>
                {p.categoryName} · {p.name}
              </span>
              <TavelyoButton variant="secondary" onClick={() => setProduct(p)}>
                Elegir {p.name}
              </TavelyoButton>
            </li>
          ))}
        </ul>
        {product ? (
          <ProductConfigurator
            key={product.id}
            product={product}
            onCancel={() => setProduct(null)}
            onAdd={(choice) => {
              const next = addToCart(lines, product, choice, key);
              if (!next.ok) return next.message;
              setLines(next.lines);
              setProduct(null);
              return null;
            }}
          />
        ) : null}
        {lines.length ? (
          <CartLines
            lines={lines}
            onQuantity={(id, n) => setLines(setQuantity(lines, id, n))}
            onRemove={(id) => setLines(removeLine(lines, id))}
          />
        ) : null}
      </fieldset>
      {lines.length ? <p>Total {formatMoney(total)}</p> : null}
      <TavelyoButton
        disabled={busy || offline || !selected || !lines.length}
        onClick={() => setReview(true)}
      >
        {uncertain ? 'Reintentar la misma comanda' : 'Revisar comanda'}
      </TavelyoButton>
      <ConfirmDialog
        open={review}
        busy={busy}
        title={'Enviar pedido de la mesa ' + tableCode}
        confirmLabel="Enviar a cocina"
        onCancel={() => setReview(false)}
        onConfirm={() => void send()}
      >
        <p>
          {sector} · Mesa {tableCode} · {selected?.label}
        </p>
        <ul>
          {lines.map((l) => (
            <li key={l.key}>
              {l.quantity} × {l.productName} {l.options.map((o) => o.name).join(', ')} {l.note}
            </li>
          ))}
        </ul>
        <p>Total {formatMoney(total)}</p>
      </ConfirmDialog>
    </section>
  );
}
