import { signInAnonymously, type Auth } from 'firebase/auth';
import { QueryFetchPolicy, type DataConnect } from 'firebase/data-connect';
import { httpsCallable, type Functions } from 'firebase/functions';
import {
  myOrders,
  myOrdersRef,
  OrderApproval,
  publicMenu,
  withdrawMyOrder,
  type MyOrdersData,
  type PublicMenuData,
} from '@tavelyo/dataconnect-sdk';
import { err, ok, type Result } from '@tavelyo/core';
import type {
  JoinTableSessionRequest,
  JoinTableSessionResponse,
  QuoteOrderRequest,
  QuoteOrderResponse,
  RequestServiceRequest,
  RequestServiceResponse,
  SubmitOrderRequest,
  SubmitOrderResponse,
} from '@tavelyo/contracts';
import type {
  CustomerError,
  CustomerGateway,
  MenuProduct,
  MyOrder,
  MyOrderApproval,
} from '@tavelyo/table-session/domain';
import { mapCommandError } from './command-errors.ts';
import { ITEM_STATUS } from './item-status.ts';
import { readQuery, watchQuery } from './live-query.ts';
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

/** Falla de una lectura de SQL Connect del cliente: sin conexión o inesperada. */
function mapCustomerDataError(error: unknown): CustomerError {
  return { kind: mapDataError(error) === 'network' ? 'network' : 'unknown' };
}

const APPROVAL: Readonly<Record<OrderApproval, MyOrderApproval>> = {
  [OrderApproval.NOT_REQUIRED]: 'NOT_REQUIRED',
  [OrderApproval.PENDING]: 'PENDING',
  [OrderApproval.APPROVED]: 'APPROVED',
  [OrderApproval.REJECTED]: 'REJECTED',
  [OrderApproval.WITHDRAWN]: 'WITHDRAWN',
};

/**
 * «Mis pedidos»: solo los propios (lo filtra el conector, D-06), enviados a cocina o que pasaron
 * por la aprobación del mesero (D-32).
 */
export function toMyOrders(data: MyOrdersData): MyOrder[] {
  return data.orders.flatMap((order) => {
    const placed = order.approvalRequestedAt ?? order.sentToKitchenAt;
    if (!placed) return [];
    return [
      {
        id: order.id,
        placedAt: new Date(placed),
        sentAt: order.sentToKitchenAt ? new Date(order.sentToKitchenAt) : null,
        approval: APPROVAL[order.approval],
        rejectionReason: order.rejectionReason ?? null,
        currency: order.quote.currency,
        totalMinor: String(order.quote.totalMinor),
        items: order.orderItems_on_order.map((item) => ({
          id: item.id,
          status: ITEM_STATUS[item.status],
          quantity: item.quantity,
          productName: item.productNameSnapshot,
          modifiers: item.orderItemModifiers_on_item.map((modifier) => modifier.nameSnapshot),
          note: item.note ?? null,
          lineTotalMinor: String(item.lineTotalMinor),
        })),
      },
    ];
  });
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
    submit: (request) => call<SubmitOrderRequest, SubmitOrderResponse>('submitOrder', request),
    async withdraw(seat, orderId) {
      try {
        await withdrawMyOrder(dataConnect, { ...seat, orderId });
        return ok(undefined);
      } catch (error) {
        const mapped = mapCommandError(error);
        if (mapped.kind === 'rejected') {
          return err({ kind: 'rejected', reason: 'other', message: mapped.message });
        }
        return err({ kind: mapped.kind === 'network' ? 'network' : 'unknown' });
      }
    },
    async resume(qrPublicId) {
      try {
        await auth.authStateReady();
      } catch {
        return err({ kind: 'unknown' });
      }
      // Sin sesión anónima, este teléfono nunca se unió: no se crea una solo por mirar.
      if (!auth.currentUser) return ok(null);
      return call<JoinTableSessionRequest, JoinTableSessionResponse>('joinTableSession', {
        qrPublicId,
      });
    },
    myOrders: (seat) =>
      readQuery(() => myOrders(dataConnect, seat, SERVER_ONLY), toMyOrders, mapCustomerDataError),
    watchMyOrders: (seat, observer) =>
      watchQuery(myOrdersRef(dataConnect, seat), toMyOrders, observer, mapCustomerDataError),
    requestService: (request) =>
      call<RequestServiceRequest, RequestServiceResponse>('requestService', request),
  };
}
