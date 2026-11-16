import { signInAnonymously, type Auth } from 'firebase/auth';
import { QueryFetchPolicy, type DataConnect } from 'firebase/data-connect';
import { httpsCallable, type Functions } from 'firebase/functions';
import { publicMenu, type PublicMenuData } from '@tavelyo/dataconnect-sdk';
import { err, ok, type Result } from '@tavelyo/core';
import type {
  AuthorizeQuoteRequest,
  AuthorizeQuoteResponse,
  JoinTableSessionRequest,
  JoinTableSessionResponse,
  QuoteOrderRequest,
  QuoteOrderResponse,
} from '@tavelyo/contracts';
import type { CustomerError, CustomerGateway, MenuProduct } from '@tavelyo/table-session/domain';
import { mapDataError } from './sql-connect-gateways.ts';

// Siempre al servidor: la PWA no conserva respuestas de datos (ADR-0008 §8, ADR-0009).
const SERVER_ONLY = { fetchPolicy: QueryFetchPolicy.SERVER_ONLY } as const;
const UUID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

/**
 * Códigos con los que el backend rechaza con un mensaje escrito para la persona (HttpsError en
 * backend/src/presentation/callables.ts). Cualquier otro error se trata como inesperado.
 */
const SERVER_CODES = new Set([
  'invalid-argument',
  'not-found',
  'failed-precondition',
  'permission-denied',
  'resource-exhausted',
  'unavailable',
  'unauthenticated',
]);

/**
 * Traduce un error de una función callable (firebase 12.19): el código llega como
 * «functions/<código>» y el mensaje con el estado HTTP al final («… [400]»). Sin respuesta del
 * servidor (red caída), el SDK usa «internal» como mensaje.
 */
export function mapCallableError(error: unknown): CustomerError {
  const rawCode =
    typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  const code = rawCode.replace(/^functions\//, '');
  const rawMessage = error instanceof Error ? error.message : '';
  const message = rawMessage.replace(/\s*\[\d+\]$/, '').trim();
  if (code === 'deadline-exceeded') return { kind: 'network' };
  if (code === 'internal') return { kind: message === 'internal' ? 'network' : 'unknown' };
  const generic = message === '' || message === code || message.startsWith('Backend error status');
  if (!SERVER_CODES.has(code) || generic) {
    return { kind: code === 'unavailable' ? 'network' : 'unknown' };
  }
  const reason =
    code === 'permission-denied' ? 'not-participant' : code === 'unavailable' ? 'retry' : 'other';
  return { kind: 'rejected', reason, message };
}

type MenuEntry =
  PublicMenuData['diningTables'][number]['sector']['branch']['productBranches_on_branch'][number];

const byOrder = <T extends { readonly sort: number; readonly name: string }>(a: T, b: T) =>
  a.sort - b.sort || a.name.localeCompare(b.name, 'es');

function toProduct(entry: MenuEntry, currency: string): MenuProduct | null {
  const price = entry.currentPrice;
  // Un precio en otra moneda no se muestra: una cuenta no mezcla monedas (PM §2).
  if (!price || price.currency !== currency) return null;
  const { product } = entry;
  const scheduled =
    typeof entry.daysMask === 'number' &&
    typeof entry.startMinute === 'number' &&
    typeof entry.endMinute === 'number';
  return {
    id: product.id,
    name: product.name,
    priceId: price.id,
    priceMinor: String(price.amountMinor),
    currency,
    description: product.description ?? null,
    allergens: product.allergensDeclared ?? [],
    categoryId: product.category.id,
    categoryName: product.category.name,
    categorySort: product.category.sort,
    sort: product.sort,
    schedule: scheduled
      ? {
          daysMask: entry.daysMask as number,
          startMinute: entry.startMinute as number,
          endMinute: entry.endMinute as number,
        }
      : null,
    groups: [...product.modifierGroups_on_product].sort(byOrder).map((group) => ({
      id: group.id,
      name: group.name,
      minSelect: group.minSelect,
      maxSelect: group.maxSelect,
      options: [...group.modifierOptions_on_group].sort(byOrder).map((option) => ({
        id: option.id,
        name: option.name,
        priceDeltaMinor: String(option.priceDeltaMinor),
      })),
    })),
  };
}

export interface CustomerClient {
  readonly auth: Auth;
  readonly dataConnect: DataConnect;
  readonly functions: Functions;
}

/**
 * Cliente en la mesa (ADR-0011): la carta es pública; para unirse, revisar el pedido y pagar
 * hace falta una sesión de Firebase Auth, anónima, que se crea solo cuando la persona pide.
 */
export function createCustomerGateway({
  auth,
  dataConnect,
  functions,
}: CustomerClient): CustomerGateway {
  const ensureSignedIn = async (): Promise<Result<void, CustomerError>> => {
    try {
      await auth.authStateReady();
      if (!auth.currentUser) await signInAnonymously(auth);
      return ok(undefined);
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
      return err({ kind: code === 'auth/network-request-failed' ? 'network' : 'unknown' });
    }
  };

  const call = async <Req, Res>(
    name: string,
    request: Req,
  ): Promise<Result<Res, CustomerError>> => {
    const signedIn = await ensureSignedIn();
    if (!signedIn.ok) return signedIn;
    try {
      const { data } = await httpsCallable<Req, Res>(functions, name)(request);
      return ok(data);
    } catch (error) {
      return err(mapCallableError(error));
    }
  };

  return {
    async menu(qrPublicId) {
      if (!UUID.test(qrPublicId)) return ok(null);
      try {
        const { data } = await publicMenu(dataConnect, { qrPublicId }, SERVER_ONLY);
        const table = data.diningTables[0];
        if (!table) return ok(null);
        const { branch } = table.sector;
        return ok({
          tableCode: table.code,
          branchName: branch.name,
          currency: branch.currency,
          timezone: branch.timezone,
          products: branch.productBranches_on_branch.flatMap((entry) => {
            const product = toProduct(entry, branch.currency);
            return product ? [product] : [];
          }),
        });
      } catch (error) {
        return err({ kind: mapDataError(error) === 'network' ? 'network' : 'unknown' });
      }
    },
    join: (qrPublicId) =>
      call<JoinTableSessionRequest, JoinTableSessionResponse>('joinTableSession', { qrPublicId }),
    quote: (request) => call<QuoteOrderRequest, QuoteOrderResponse>('quoteOrder', request),
    authorize: (request) =>
      call<AuthorizeQuoteRequest, AuthorizeQuoteResponse>('authorizeQuote', request),
  };
}
