import { useRef, useState } from 'react';
import type {
  QuoteChange,
  QuoteOrderResponse,
  QuoteProblem,
  QuoteSummary,
  SubmitOrderResponse,
} from '@tavelyo/contracts';
import type { ServerError } from '@tavelyo/design-system';
import { acceptServerPrices, cartTotal, toQuoteLines, type CartLine } from '@tavelyo/cart';
import { newAttemptKey } from '../application/review-text.ts';
import type { CustomerError, CustomerGateway } from '../domain/index.ts';
import type { CartState } from './useCart.ts';
import type { TableSeatState } from './useTableSeat.ts';

export type QuotedOrder = Extract<QuoteOrderResponse, { outcome: 'quoted' }>;

/** Paso de «Revisar pedido» y «Enviar pedido» (ADR-0012: sin pasarela). */
export type CheckoutState =
  | { readonly step: 'editing' }
  | { readonly step: 'reviewing' }
  | { readonly step: 'quoted'; readonly quote: QuotedOrder }
  | { readonly step: 'submitting'; readonly quote: QuotedOrder }
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
  | {
      readonly step: 'done';
      readonly quote: QuotedOrder;
      /** sent: llegó a cocina; pending_approval: espera al mesero (D-32). */
      readonly outcome: SubmitOrderResponse['status'];
    };

const FAILURE_TEXT = {
  network: 'No hay conexión con el restaurante. Revisa tu red e inténtalo de nuevo.',
  unknown: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
} as const;

/** Texto para la persona; también para las fallas de la lectura en vivo de «Mis pedidos». */
export function customerErrorText(error: CustomerError | ServerError): string {
  if (error.kind === 'rejected') return error.message;
  return error.kind === 'network' ? FAILURE_TEXT.network : FAILURE_TEXT.unknown;
}

const EXPIRED = 'El resumen del pedido venció. Revisa el pedido otra vez.';
const NO_LONGER = 'Este pedido ya no se puede enviar. Revisa el pedido otra vez.';

export interface CheckoutDeps {
  readonly gateway: CustomerGateway;
  /** La mesa de este teléfono, compartida con «Mis pedidos» y las solicitudes. */
  readonly seat: TableSeatState;
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
 * «Revisar pedido» y «Enviar pedido» (ADR-0012). El servidor es la autoridad: el total del teléfono
 * solo sirve para detectar si algo cambió. Al enviar, el pedido se suma a la cuenta de la mesa y,
 * según la sucursal, llega a cocina o espera al mesero (D-32); se paga al final en el restaurante.
 * Cada intento tiene su clave de idempotencia; un reintento del mismo carrito reutiliza la clave y
 * recibe el mismo resumen, y enviar dos veces el mismo resumen no crea dos pedidos (caso 3).
 */
export function useCheckout({
  gateway,
  seat,
  currency,
  cart,
  randomUuid,
  onMenuOutdated,
}: CheckoutDeps) {
  const [state, setState] = useState<CheckoutState>({ step: 'editing' });
  const [message, setMessage] = useState<string | null>(null);
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

  const finish = (quote: QuotedOrder, outcome: SubmitOrderResponse['status']) => {
    consumeKey();
    cart.clear();
    setState({ step: 'done', quote, outcome });
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
      const joined = await seat.join();
      if (!joined.ok) return backToEditing(customerErrorText(joined.error));
      const result = await gateway.quote({
        sessionId: joined.value.sessionId,
        idempotencyKey: keyFor(lines),
        lines: toQuoteLines(lines),
        expectedTotalMinor: cartTotal(lines, currency).toMinorString(),
      });
      if (!result.ok) {
        const rejoin =
          result.error.kind === 'rejected' && result.error.reason === 'not-participant';
        if (rejoin && round === 0) {
          seat.forget();
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
      // Ya enviado antes (reintento tras perder la respuesta): se completa sin duplicar nada.
      if (response.status === 'CONFIRMED' || response.status === 'AUTHORIZED') {
        return submitQuote(response);
      }
      consumeKey();
      return backToEditing(response.status === 'EXPIRED' ? EXPIRED : NO_LONGER);
    }
  };

  async function submitQuote(quote: QuotedOrder) {
    setMessage(null);
    setState({ step: 'submitting', quote });
    const result = await gateway.submit({ quoteId: quote.quoteId });
    if (!result.ok) {
      // Sin respuesta segura se puede reintentar el mismo resumen: no crea dos pedidos.
      const retry = result.error.kind !== 'rejected' || result.error.reason === 'retry';
      if (retry) {
        setState({ step: 'quoted', quote });
        return setMessage(customerErrorText(result.error));
      }
      consumeKey();
      return backToEditing(customerErrorText(result.error));
    }
    finish(quote, result.value.status);
  }

  const submit = async () => {
    if (state.step !== 'quoted') return;
    await submitQuote(state.quote);
  };

  return {
    state,
    message,
    review: (lines: readonly CartLine[]) => void review(lines),
    submit: () => void submit(),
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
