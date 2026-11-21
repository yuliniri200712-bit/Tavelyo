import type { QuotedLine, QuotedModifier } from '@tavelyo/contracts';
import type { DataConnect } from 'firebase-admin/data-connect';
import type { CatalogEntry } from '../orders/pricing.ts';
import type { QuoteStatus, QuoteStore, StoredQuote } from '../orders/quote-order.ts';
import type { OrderApprovalMode } from '../orders/send-to-kitchen.ts';
import type {
  SubmittableQuote,
  SubmittableQuoteStatus,
  SubmitQuoteStore,
} from '../orders/submit-order.ts';
import { isUniqueViolation } from './table-sessions.ts';

// Resúmenes de pedido con el Admin SDK: lecturas con operaciones NO_ACCESS del conector y el
// guardado con un documento fijo (el SDK web generado no admite listas de tipo _Data).

interface ContextData {
  sessionParticipants: Array<{
    id: string;
    tenantId: string;
    branchId: string;
    session: {
      table: {
        sector: {
          branch: {
            currency: string;
            timezone: string;
            status: string;
            tenant: { status: string };
          };
        };
      };
    };
  }>;
}

interface LineRow {
  position: number;
  productId: string;
  priceId: string;
  productNameSnapshot: string;
  quantity: number;
  unitPriceMinor: string;
  modifiersSnapshot: string[] | null;
  modifiersMinor: string;
  lineTotalMinor: string;
  taxMinor: string;
  note: string | null;
}

interface QuoteRow {
  id: string;
  fingerprint: string;
  status: QuoteStatus;
  currency: string;
  subtotalMinor: string;
  taxMinor: string;
  totalMinor: string;
  expiresAt: string;
  orderQuoteLines_on_quote: LineRow[];
}

interface ProductRow {
  productId: string;
  available: boolean;
  daysMask: number | null;
  startMinute: number | null;
  endMinute: number | null;
  currentPrice: { id: string; amountMinor: string; currency: string } | null;
  product: {
    name: string;
    archivedAt: string | null;
    category: { archivedAt: string | null };
    taxRule: { rateBp: number; archivedAt: string | null } | null;
    modifierGroups_on_product: Array<{
      id: string;
      minSelect: number;
      maxSelect: number;
      modifierOptions_on_group: Array<{ id: string; name: string; priceDeltaMinor: string }>;
    }>;
  };
}

export function toCatalogEntry(row: ProductRow): CatalogEntry {
  const { daysMask, startMinute, endMinute } = row;
  return {
    productId: row.productId,
    name: row.product.name,
    orderable:
      row.available && row.product.archivedAt === null && row.product.category.archivedAt === null,
    schedule:
      daysMask === null || startMinute === null || endMinute === null
        ? null
        : { daysMask, startMinute, endMinute },
    currentPrice: row.currentPrice,
    taxRateBp: row.product.taxRule?.rateBp ?? 0,
    groups: row.product.modifierGroups_on_product.map((group) => ({
      id: group.id,
      minSelect: group.minSelect,
      maxSelect: group.maxSelect,
      options: group.modifierOptions_on_group,
    })),
  };
}

/** Las opciones se guardan como instantáneas JSON (nombre e importe en el momento del resumen). */
export function toQuotedLines(rows: readonly LineRow[]): QuotedLine[] {
  return rows.map((line) => ({
    position: line.position,
    productId: line.productId,
    priceId: line.priceId,
    productName: line.productNameSnapshot,
    quantity: line.quantity,
    unitPriceMinor: line.unitPriceMinor,
    modifiers: (line.modifiersSnapshot ?? []).map((json) => JSON.parse(json) as QuotedModifier),
    modifiersMinor: line.modifiersMinor,
    lineTotalMinor: line.lineTotalMinor,
    taxMinor: line.taxMinor,
    note: line.note,
  }));
}

export function toStoredQuote(row: QuoteRow): StoredQuote {
  const lines = toQuotedLines(row.orderQuoteLines_on_quote);
  return {
    id: row.id,
    fingerprint: row.fingerprint,
    status: row.status,
    expiresAt: new Date(row.expiresAt),
    summary: {
      currency: row.currency,
      lines,
      subtotalMinor: row.subtotalMinor,
      taxMinor: row.taxMinor,
      totalMinor: row.totalMinor,
    },
  };
}

const INSERT_QUOTE = `mutation InsertOrderQuote($staffUid: String, $initialStatus: OrderQuoteStatus!, $quoteId: UUID!, $tenantId: UUID!, $branchId: UUID!, $sessionId: UUID!, $participantId: UUID!, $authUid: String!, $quoteRef: String!, $idempotencyKey: String!, $fingerprint: String!, $currency: String!, $subtotalMinor: Int64!, $taxMinor: Int64!, $totalMinor: Int64!, $expiresAt: Timestamp!, $lines: [OrderQuoteLine_Data!]!) @transaction {
  orderQuote_insert(data: { id: $quoteId, tenantId: $tenantId, branchId: $branchId, sessionId: $sessionId, participantId: $participantId, idempotencyKey: $idempotencyKey, fingerprint: $fingerprint, currency: $currency, subtotalMinor: $subtotalMinor, taxMinor: $taxMinor, totalMinor: $totalMinor, staffUid: $staffUid, status: $initialStatus, expiresAt: $expiresAt })
  orderQuoteLine_insertMany(data: $lines)
  auditEvent_insert(data: { tenantId: $tenantId, actorId: $authUid, operation: "order_quote.create", resourceType: "order_quote", resourceId: $quoteRef })
}`;

export function createQuoteStore(
  dataConnect: DataConnect,
  staffUid: string | null = null,
): QuoteStore {
  return {
    async context(sessionId, authUid) {
      const { data } = await dataConnect.executeQuery<
        ContextData,
        { sessionId: string; authUid: string }
      >('ServerQuoteContext', { sessionId, authUid });
      const participant = data.sessionParticipants[0];
      if (!participant) return null;
      const branch = participant.session.table.sector.branch;
      return {
        participantId: participant.id,
        tenantId: participant.tenantId,
        branchId: participant.branchId,
        currency: branch.currency,
        timeZone: branch.timezone,
        operating: branch.status === 'ACTIVE' && branch.tenant.status === 'ACTIVE',
      };
    },

    async byKey(participantId, idempotencyKey) {
      const { data } = await dataConnect.executeQuery<
        { orderQuotes: QuoteRow[] },
        { participantId: string; idempotencyKey: string }
      >('ServerQuoteByKey', {
        participantId,
        idempotencyKey: staffUid ? JSON.stringify([staffUid, idempotencyKey]) : idempotencyKey,
      });
      const row = data.orderQuotes[0];
      return row ? toStoredQuote(row) : null;
    },

    async catalog(branchId, productIds) {
      const { data } = await dataConnect.executeQuery<
        { productBranches: ProductRow[] },
        { branchId: string; productIds: readonly string[] }
      >('ServerProductsForQuote', { branchId, productIds });
      return new Map(data.productBranches.map((row) => [row.productId, toCatalogEntry(row)]));
    },

    async insert(quote) {
      const { summary } = quote;
      try {
        await dataConnect.executeGraphql(INSERT_QUOTE, {
          variables: {
            quoteId: quote.id,
            tenantId: quote.tenantId,
            branchId: quote.branchId,
            sessionId: quote.sessionId,
            participantId: quote.participantId,
            authUid: quote.authUid,
            quoteRef: quote.id,
            staffUid,
            initialStatus: staffUid ? 'CONFIRMED' : 'QUOTED',
            idempotencyKey: staffUid
              ? JSON.stringify([staffUid, quote.idempotencyKey])
              : quote.idempotencyKey,
            fingerprint: quote.fingerprint,
            currency: summary.currency,
            subtotalMinor: summary.subtotalMinor,
            taxMinor: summary.taxMinor,
            totalMinor: summary.totalMinor,
            expiresAt: quote.expiresAt.toISOString(),
            lines: summary.lines.map((line) => ({
              tenantId: quote.tenantId,
              branchId: quote.branchId,
              quoteId: quote.id,
              position: line.position,
              productId: line.productId,
              priceId: line.priceId,
              productNameSnapshot: line.productName,
              quantity: line.quantity,
              unitPriceMinor: line.unitPriceMinor,
              modifiersSnapshot: line.modifiers.map((modifier) => JSON.stringify(modifier)),
              modifiersMinor: line.modifiersMinor,
              lineTotalMinor: line.lineTotalMinor,
              taxMinor: line.taxMinor,
              note: line.note,
            })),
          },
        });
        return true;
      } catch (error) {
        if (isUniqueViolation(error)) return false;
        throw error;
      }
    },
  };
}

interface SubmittableRow {
  id: string;
  tenantId: string;
  branchId: string;
  sessionId: string;
  participantId: string;
  status: SubmittableQuoteStatus;
  currency: string;
  totalMinor: string;
  expiresAt: string;
  session: { status: string; table: { sector: { branch: { orderApproval: OrderApprovalMode } } } };
  participant: { removedAt: string | null; expiresAt: string };
  orderQuoteLines_on_quote: LineRow[];
}

export function toSubmittableQuote(row: SubmittableRow): SubmittableQuote {
  return {
    id: row.id,
    tenantId: row.tenantId,
    branchId: row.branchId,
    sessionId: row.sessionId,
    participantId: row.participantId,
    status: row.status,
    currency: row.currency,
    totalMinor: row.totalMinor,
    expiresAt: new Date(row.expiresAt),
    sessionOpen: row.session.status === 'OPEN',
    participantRemoved: row.participant.removedAt !== null,
    participantExpiresAt: new Date(row.participant.expiresAt),
    orderApproval: row.session.table.sector.branch.orderApproval,
    lines: toQuotedLines(row.orderQuoteLines_on_quote),
  };
}

/** El @check de ServerConfirmQuote cuando el resumen ya no está pendiente de confirmar. */
const ALREADY_CHANGED = /El resumen ya cambió/;

export function createSubmitQuoteStore(dataConnect: DataConnect): SubmitQuoteStore {
  return {
    async forSubmit(quoteId, authUid): Promise<SubmittableQuote | null> {
      const { data } = await dataConnect.executeQuery<
        { orderQuotes: SubmittableRow[] },
        { quoteId: string; authUid: string }
      >('ServerQuoteForSubmit', { quoteId, authUid });
      const row = data.orderQuotes[0];
      return row ? toSubmittableQuote(row) : null;
    },

    async confirm(quote, authUid) {
      try {
        await dataConnect.executeMutation('ServerConfirmQuote', {
          quoteId: quote.id,
          tenantId: quote.tenantId,
          authUid,
        });
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (ALREADY_CHANGED.test(message)) return false;
        throw error;
      }
    },
  };
}
