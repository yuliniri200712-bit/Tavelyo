import { createContext, useCallback, useContext, type ReactNode } from 'react';
import type { CartStorage } from '@tavelyo/cart';
import { useServerData, type DataState } from '@tavelyo/design-system';
import type { CustomerGateway, PublicMenu } from '../domain/index.ts';
import { useCart, type CartState } from './useCart.ts';
import { useCheckout, type Checkout } from './useCheckout.ts';
import { useTableSeat, type TableSeatState } from './useTableSeat.ts';

interface TableOrderValue {
  readonly gateway: CustomerGateway;
  readonly qrPublicId: string;
  readonly seat: TableSeatState;
  readonly menu: DataState<PublicMenu | null>;
  readonly reloadMenu: () => void;
  readonly cart: CartState;
  readonly checkout: Checkout;
  readonly now: () => Date;
}

const TableOrderContext = createContext<TableOrderValue | null>(null);

export interface TableOrderProviderProps {
  readonly gateway: CustomerGateway;
  readonly qrPublicId: string;
  readonly storage: CartStorage;
  readonly now?: () => Date;
  readonly randomUuid?: () => string;
  readonly children: ReactNode;
}

const systemNow = () => new Date();
const systemUuid = () => crypto.randomUUID();

/**
 * Estado de la mesa en este teléfono: la carta leída del servidor, el carrito local de la persona,
 * la mesa en la que está, la revisión del pedido y el pago. Lo comparten la carta, el pedido y
 * «Mis pedidos».
 */
export function TableOrderProvider({
  gateway,
  qrPublicId,
  storage,
  now = systemNow,
  randomUuid = systemUuid,
  children,
}: TableOrderProviderProps) {
  const load = useCallback(async () => {
    const result = await gateway.menu(qrPublicId);
    if (result.ok) return result;
    const error = result.error;
    return {
      ok: false as const,
      error:
        error.kind === 'rejected'
          ? { kind: 'rejected' as const, message: error.message }
          : { kind: error.kind },
    };
  }, [gateway, qrPublicId]);
  const { state: menu, reload: reloadMenu, refresh: refreshMenu } = useServerData(load);
  const cart = useCart(storage, qrPublicId, now, randomUuid);
  const currency = menu.status === 'ready' && menu.data ? menu.data.currency : 'COP';
  const seat = useTableSeat(gateway, qrPublicId);
  const checkout = useCheckout({
    gateway,
    seat,
    currency,
    cart,
    randomUuid,
    onMenuOutdated: refreshMenu,
  });

  return (
    <TableOrderContext.Provider
      value={{ gateway, qrPublicId, seat, menu, reloadMenu, cart, checkout, now }}
    >
      {children}
    </TableOrderContext.Provider>
  );
}

export function useTableOrder(): TableOrderValue {
  const value = useContext(TableOrderContext);
  if (!value) throw new Error('useTableOrder requiere TableOrderProvider.');
  return value;
}
