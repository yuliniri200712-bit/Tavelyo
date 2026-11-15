import { createHash } from 'node:crypto';
import { err, isCurrencyCode, ok, type Result } from '@tavelyo/core';
import type {
  QuoteChange,
  QuoteLineRequest,
  QuoteOrderRequest,
  QuoteOrderResponse,
  QuoteSummary,
} from '@tavelyo/contracts';
import { canonicalUuid, newId, type Clock } from '../shared/clock.ts';
import { isUuid, readFields } from '../shared/input.ts';
import { failure, type Actor, type Outcome } from '../shared/outcome.ts';
import { RATE_LIMITED_MESSAGE, RATE_LIMITS, type RateLimiter } from '../shared/rate-limit.ts';
import { priceOrder, type CatalogEntry } from './pricing.ts';

/** El resumen vale este tiempo; después hay que volver a revisar el pedido. */
export const QUOTE_TTL_MS = 15 * 60 * 1000;
export const MAX_LINES = 50;
export const MAX_QUANTITY = 99;
export const MAX_OPTIONS_PER_LINE = 20;
export const MAX_NOTE_LENGTH = 140;

const IDEMPOTENCY_KEY = /^[A-Za-z0-9_-]{16,64}$/;
const CANONICAL_NON_NEGATIVE = /^(?:0|[1-9]\d{0,17})$/;

export interface QuoteContext {
  readonly participantId: string;
  readonly tenantId: string;
  readonly branchId: string;
  readonly currency: string;
  readonly timeZone: string;
  /** Sucursal activa y empresa activa. */
  readonly operating: boolean;
}

export type QuoteStatus = 'QUOTED' | 'AUTHORIZED' | 'DECLINED' | 'EXPIRED';

export interface StoredQuote {
  readonly id: string;
  readonly fingerprint: string;
  readonly status: QuoteStatus;
  readonly expiresAt: Date;
  readonly summary: QuoteSummary;
}

export interface NewQuote {
  readonly id: string;
  readonly tenantId: string;
  readonly branchId: string;
  readonly sessionId: string;
  readonly participantId: string;
  readonly authUid: string;
  readonly idempotencyKey: string;
  readonly fingerprint: string;
  readonly expiresAt: Date;
  readonly summary: QuoteSummary;
}

export interface QuoteStore {
  /** Participación vigente de quien llama en una sesión abierta; null si no la tiene. */
  context(sessionId: string, authUid: string): Promise<QuoteContext | null>;
  byKey(participantId: string, idempotencyKey: string): Promise<StoredQuote | null>;
  catalog(branchId: string, productIds: readonly string[]): Promise<Map<string, CatalogEntry>>;
  /** false si ya existía uno con la misma clave (dos solicitudes simultáneas). */
  insert(quote: NewQuote): Promise<boolean>;
}

export interface QuoteOrderDeps {
  readonly quotes: QuoteStore;
  readonly limiter: RateLimiter;
  readonly clock: Clock;
}

const invalid = (message: string) => err(failure('invalid-argument', message));

function parseLine(value: unknown): Result<QuoteLineRequest, string> {
  const fields = readFields(value, ['productId', 'priceId', 'quantity', 'optionIds', 'note']);
  if (!fields.ok) return fields;
  const { productId, priceId, quantity, optionIds, note } = fields.value;
  if (!isUuid(productId) || !isUuid(priceId)) return err('Un producto del pedido no es válido.');
  if (!Number.isSafeInteger(quantity) || (quantity as number) < 1) {
    return err('Cada producto debe tener al menos una unidad.');
  }
  if ((quantity as number) > MAX_QUANTITY) {
    return err(`Cada producto admite como máximo ${MAX_QUANTITY} unidades.`);
  }
  if (
    !Array.isArray(optionIds) ||
    optionIds.length > MAX_OPTIONS_PER_LINE ||
    !optionIds.every(isUuid)
  ) {
    return err('Las opciones de un producto no son válidas.');
  }
  let cleanNote: string | null = null;
  if (note !== undefined && note !== null) {
    if (typeof note !== 'string') return err('La nota no es válida.');
    const trimmed = note.trim();
    if (trimmed.length > MAX_NOTE_LENGTH) {
      return err(`La nota admite como máximo ${MAX_NOTE_LENGTH} caracteres.`);
    }
    cleanNote = trimmed === '' ? null : trimmed;
  }
  return ok({
    productId: canonicalUuid(productId),
    priceId: canonicalUuid(priceId),
    quantity: quantity as number,
    optionIds: optionIds.map(canonicalUuid).sort(),
    note: cleanNote,
  });
}

export function parseQuoteOrderInput(data: unknown): Outcome<QuoteOrderRequest> {
  const fields = readFields(data, ['sessionId', 'idempotencyKey', 'lines', 'expectedTotalMinor']);
  if (!fields.ok) return invalid(fields.error);
  const { sessionId, idempotencyKey, lines, expectedTotalMinor } = fields.value;
  if (!isUuid(sessionId)) return invalid('La mesa no es válida.');
  if (typeof idempotencyKey !== 'string' || !IDEMPOTENCY_KEY.test(idempotencyKey)) {
    return invalid('La solicitud no es válida.');
  }
  if (typeof expectedTotalMinor !== 'string' || !CANONICAL_NON_NEGATIVE.test(expectedTotalMinor)) {
    return invalid('El total del pedido no es válido.');
  }
  if (!Array.isArray(lines) || lines.length === 0) return invalid('El pedido está vacío.');
  if (lines.length > MAX_LINES) {
    return invalid(`Un pedido admite como máximo ${MAX_LINES} productos distintos.`);
  }
  const parsed: QuoteLineRequest[] = [];
  for (const line of lines) {
    const result = parseLine(line);
    if (!result.ok) return invalid(result.error);
    parsed.push(result.value);
  }
  return ok({
    sessionId: canonicalUuid(sessionId),
    idempotencyKey,
    lines: parsed,
    expectedTotalMinor,
  });
}

/**
 * Huella SHA-256 del contenido del pedido: identifica el resumen verificable (la Fase 3 lo envía a
 * cocina) y detecta una clave de idempotencia reutilizada con otro contenido.
 */
export function quoteFingerprint(participantId: string, request: QuoteOrderRequest): string {
  const canonical = JSON.stringify({
    v: 1,
    participantId,
    sessionId: request.sessionId,
    expectedTotalMinor: request.expectedTotalMinor,
    lines: request.lines.map((line) => [
      line.productId,
      line.priceId,
      line.quantity,
      [...line.optionIds].sort(),
      line.note ?? null,
    ]),
  });
  return createHash('sha256').update(canonical).digest('hex');
}

const NOT_PARTICIPANT =
  'Ya no formas parte de esta mesa. Escanea otra vez el código QR para continuar.';
const NOT_OPERATING = 'Este restaurante no está recibiendo pedidos en este momento.';
const KEY_REUSED = 'La solicitud no coincide con la anterior. Revisa el pedido otra vez.';

function asResponse(quote: StoredQuote, now: Date): QuoteOrderResponse {
  const expired = quote.status === 'QUOTED' && quote.expiresAt <= now;
  return {
    outcome: 'quoted',
    quoteId: quote.id,
    fingerprint: quote.fingerprint,
    expiresAt: quote.expiresAt.toISOString(),
    status: expired ? 'EXPIRED' : quote.status,
    summary: quote.summary,
  };
}

/**
 * «Revisar pedido» (caso 5 y caso 3 parcial). El servidor revalida participación, disponibilidad,
 * horario, opciones y precios vigentes, y calcula los importes. Solo guarda el resumen si el total
 * que vio la persona coincide con el del servidor y ningún precio cambió; si no, devuelve los
 * cambios para que los confirme. Con la misma clave devuelve el mismo resumen.
 */
export function createQuoteOrder(deps: QuoteOrderDeps) {
  return async (actor: Actor, data: unknown): Promise<Outcome<QuoteOrderResponse>> => {
    const input = parseQuoteOrderInput(data);
    if (!input.ok) return input;
    const request = input.value;

    if (!(await deps.limiter.admit(RATE_LIMITS.quotePerUser, actor.uid))) {
      return err(failure('resource-exhausted', RATE_LIMITED_MESSAGE));
    }

    const context = await deps.quotes.context(request.sessionId, actor.uid);
    if (!context) return err(failure('permission-denied', NOT_PARTICIPANT));
    if (!context.operating || !isCurrencyCode(context.currency)) {
      return err(failure('failed-precondition', NOT_OPERATING));
    }

    const now = deps.clock.now();
    const fingerprint = quoteFingerprint(context.participantId, request);
    const previous = await deps.quotes.byKey(context.participantId, request.idempotencyKey);
    if (previous) {
      if (previous.fingerprint !== fingerprint) return invalid(KEY_REUSED);
      return ok(asResponse(previous, now));
    }

    const productIds = [...new Set(request.lines.map((line) => line.productId))];
    const catalog = await deps.quotes.catalog(context.branchId, productIds);
    const priced = priceOrder(request.lines, catalog, {
      currency: context.currency,
      timeZone: context.timeZone,
      now,
    });
    if (priced.kind === 'rejected') return ok({ outcome: 'rejected', problems: priced.problems });

    const changes: QuoteChange[] = [...priced.priceChanges];
    if (priced.summary.totalMinor !== request.expectedTotalMinor) {
      changes.push({
        kind: 'total-changed',
        expectedTotalMinor: request.expectedTotalMinor,
        totalMinor: priced.summary.totalMinor,
      });
    }
    if (changes.length > 0) return ok({ outcome: 'changed', changes, summary: priced.summary });

    const quote: NewQuote = {
      id: newId(),
      tenantId: context.tenantId,
      branchId: context.branchId,
      sessionId: request.sessionId,
      participantId: context.participantId,
      authUid: actor.uid,
      idempotencyKey: request.idempotencyKey,
      fingerprint,
      expiresAt: new Date(now.getTime() + QUOTE_TTL_MS),
      summary: priced.summary,
    };
    if (await deps.quotes.insert(quote)) {
      return ok(asResponse({ ...quote, status: 'QUOTED' }, now));
    }
    // Doble pulsación simultánea: la otra solicitud lo guardó primero.
    const raced = await deps.quotes.byKey(context.participantId, request.idempotencyKey);
    if (!raced || raced.fingerprint !== fingerprint) return invalid(KEY_REUSED);
    return ok(asResponse(raced, now));
  };
}
