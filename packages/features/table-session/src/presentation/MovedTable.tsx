import { ActionNotice } from '@tavelyo/design-system';
import type { PublicMenu, TableSeat } from '../domain/index.ts';
import { useTableOrder } from './TableOrderProvider.tsx';

/**
 * Código de la mesa que se muestra al comensal: el de la mesa nueva si su sesión se trasladó
 * (D-42); si no, el del QR que escaneó.
 */
export function shownTableCode(seat: TableSeat | null, menu: PublicMenu): string {
  return seat?.movedTo ?? menu.tableCode;
}

/** Aviso del traslado, en texto y en role="status": los pedidos y la cuenta siguen con la persona. */
export function MovedTableNotice() {
  const movedTo = useTableOrder().seat.seat?.movedTo;
  return (
    <ActionNotice
      notice={
        movedTo
          ? {
              tone: 'success',
              text: `Tu mesa se trasladó a la mesa ${movedTo}. Tus pedidos y tu cuenta siguen contigo; si vuelves a escanear, usa el QR de la mesa ${movedTo}.`,
            }
          : null
      }
    />
  );
}
