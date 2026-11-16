import { useRef, useState } from 'react';
import type {
  QuoteChange,
  QuoteOrderResponse,
  QuoteProblem,
  QuoteSummary,
  SimulatedPaymentOutcome,
} from '@tavelyo/contracts';
import { acceptServerPrices, cartTotal, toQuoteLines, type CartLine } from '@tavelyo/cart';
import { ok, type Result } from '@tavelyo/core';
import { newAttemptKey } from '../application/review-text.ts';
import type { CustomerError, CustomerGateway } from '../domain/index.ts';
import type { CartState } from './useCart.ts';

export type QuotedOrder = Extract<QuoteOrderResponse, { outcome: 'quoted' }>;

/** Paso de «Revisar pedido» y del pago simulado. */
export type CheckoutState =
  | { readonly step: 'editing' }
  | { readonly step: 'reviewing' }
  | { readonly step: 'quoted'; readonly quote: QuotedOrder }
  | { readonly step: 'authorizing'; readonly quote: QuotedOrder }
  | {
      readonly step: 'changed';
      readonly changes: readonly QuoteChange[];
      readonly summary: QuoteSummary;
      readonly lines: readonly CartLine[];
    }
  | {
      readonly step: 'rejected';
      readonly problems: readonly QuoteProblem[];
      readonly lines: readonly CartLine[];
    }
  | { readonly step: 'done'; readonly quote: QuotedOrder };

const FAILURE_TEXT = {
  network: 'No hay conexión con el restaurante. Revisa tu red e inténtalo de nuevo.',
  unknown: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
} as const;

export function customerErrorText(error: CustomerError): string {
  return error.kind === 'rejected' ? error.message : FAILURE_TEXT[error.kind];
}

const EXPIRED = 'El resumen del pedido venció. Revisa el pedido otra vez.';
const DECLINED = 'El pago simulado fue rechazado. Revisa el pedido para intentarlo de nuevo.';
const REQUIRES_ACTION =
  'El pago pide una verificación adicional (simulada). Inténtalo de nuevo; no se cobrará dos veces.';

export interface CheckoutDeps {
  readonly gateway: CustomerGateway;
  readonly qrPublicId: string;
  readonly currency: string;
  readonly cart: CartState;
  readonly randomUuid: () => string;
  /**
   * El servidor informó precios o disponibilidad distintos de los de la carta en pantalla: la app
   * la vuelve a leer para que lo siguiente que se agregue tenga los datos actuales.
   */
  readonly onMenuOutdated: () => void;
}

/**
 * «Revisar pedido» y autorización simulada. El servidor es la autoridad: el total del teléfono
 * solo sirve para detectar si algo cambió. Cada intento tiene su clave de idempotencia; un
 * reintento del mismo carrito reutiliza la clave y recibe el mismo resumen (caso 3).
 */
export function useCheckout({
  gateway,
  qrPublicId,
  currency,
  cart,
  randomUuid,
  onMenuOutdated,
}: CheckoutDeps) {
  const [state, setState] = useState<CheckoutState>({ step: 'editing' });
  const [message, setMessage] = useState<string | null>(null);
  const session = useRef<string | null>(null);
  const attempt = useRef<{ fingerprint: string; key: string } | null>(null);

  const keyFor = (lines: readonly CartLine[]) => {
    const fingerprint = JSON.stringify(toQuoteLines(lines));
    if (attempt.current?.fingerprint !== fingerprint) {
      attempt.current = { fingerprint, key: newAttemptKey(randomUuid) };
    }
    return attempt.current.key;
  };
  const consumeKey = () => {
    attempt.current = null;
  };

  const joinTable = async (): Promise<Result<string, CustomerError>> => {
    if (session.current) return ok(session.current);
    const joined = await gateway.join(qrPublicId);
    if (!joined.ok) return joined;
    session.current = joined.value.sessionId;
    return ok(joined.value.sessionId);
  };

  const finish = (quote: QuotedOrder) => {
    consumeKey();
    cart.clear();
    setState({ step: 'done', quote });
  };

  const backToEditing = (text: string) => {
    setState({ step: 'editing' });
    setMessage(text);
  };

  const review = async (lines: readonly CartLine[]) => {
    if (lines.length === 0) return;
    setMessage(null);
    setState({ step: 'reviewing' });
    // Un segundo intento solo si la participación ya no vale: se vuelve a unir a la mesa.
    for (let round = 0; round < 2; round += 1) {
      const joined = await joinTable();
      if (!joined.ok) return backToEditing(customerErrorText(joined.error));
      const result = await gateway.quote({
        sessionId: joined.value,
        idempotencyKey: keyFor(lines),
        lines: toQuoteLines(lines),
        expectedTotalMinor: cartTotal(lines, currency).toMinorString(),
      });
      if (!result.ok) {
        const rejoin =
          result.error.kind === 'rejected' && result.error.reason === 'not-participant';
        if (rejoin && round === 0) {
          session.current = null;
          consumeKey();
          continue;
        }
        return backToEditing(customerErrorText(result.error));
      }
      const response = result.value;
      if (response.outcome === 'changed') {
        consumeKey();
        onMenuOutdated();
        return setState({
          step: 'changed',
          changes: response.changes,
          summary: response.summary,
          lines,
        });
      }
      if (response.outcome === 'rejected') {
        consumeKey();
        onMenuOutdated();
        return setState({ step: 'rejected', problems: response.problems, lines });
      }
      if (response.status === 'QUOTED') return setState({ step: 'quoted', quote: response });
      if (response.status === 'AUTHORIZED') return finish(response);
      consumeKey();
      return backToEditing(response.status === 'EXPIRED' ? EXPIRED : DECLINED);
    }
  };

  const authorize = async (simulatedOutcome?: SimulatedPaymentOutcome) => {
    if (state.step !== 'quoted') return;
    const { quote } = state;
    setMessage(null);
    setState({ step: 'authorizing', quote });
    const result = await gateway.authorize({
      quoteId: quote.quoteId,
      ...(simulatedOutcome ? { simulatedOutcome } : {}),
    });
    if (!result.ok) {
      // Sin respuesta segura se puede reintentar el mismo resumen: no autoriza dos veces.
      const retry = result.error.kind !== 'rejected' || result.error.reason === 'retry';
      if (retry) {
        setState({ step: 'quoted', quote });
        return setMessage(customerErrorText(result.error));
      }
      consumeKey();
      return backToEditing(customerErrorText(result.error));
    }
    if (result.value.status === 'authorized') return finish(quote);
    if (result.value.status === 'declined') {
      consumeKey();
      return backToEditing(DECLINED);
    }
    setState({ step: 'quoted', quote });
    setMessage(REQUIRES_ACTION);
  };

  return {
    state,
    message,
    review: (lines: readonly CartLine[]) => void review(lines),
    authorize: (simulatedOutcome?: SimulatedPaymentOutcome) => void authorize(simulatedOutcome),
    /** Acepta los importes actuales del servidor y vuelve a revisar con ellos. */
    acceptChanges: () => {
      if (state.step !== 'changed') return;
      const next = acceptServerPrices(state.lines, state.summary);
      cart.replace(next);
      void review(next);
    },
    /** Quita del carrito lo que ya no se puede pedir. */
    removeProblems: () => {
      if (state.step !== 'rejected') return;
      const positions = new Set(state.problems.map((problem) => problem.position));
      cart.replace(state.lines.filter((_, position) => !positions.has(position)));
      setState({ step: 'editing' });
    },
    /** Vuelve a editar el carrito (desde el resumen o tras terminar). */
    editOrder: () => {
      setMessage(null);
      setState({ step: 'editing' });
    },
  };
}

export type Checkout = ReturnType<typeof useCheckout>;
