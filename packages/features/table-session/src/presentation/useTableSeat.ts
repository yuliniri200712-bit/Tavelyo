import { useCallback, useRef, useState } from 'react';
import { ok, type Result } from '@tavelyo/core';
import type { JoinTableSessionResponse } from '@tavelyo/contracts';
import type { CustomerError, CustomerGateway, TableSeat } from '../domain/index.ts';

/**
 * La mesa de la persona en este teléfono (ADR-0011): se une al revisar el pedido o al llamar al
 * mesero, y se recupera al abrir «Mis pedidos» tras recargar. La comparten el pago, «Mis pedidos»
 * y las solicitudes, para no unirse dos veces.
 */
export function useTableSeat(gateway: CustomerGateway, qrPublicId: string) {
  const current = useRef<TableSeat | null>(null);
  const [seat, setSeat] = useState<TableSeat | null>(null);

  const remember = useCallback((joined: JoinTableSessionResponse): TableSeat => {
    const next: TableSeat = {
      sessionId: joined.sessionId,
      branchId: joined.branchId,
      ...(joined.transferred ? { movedTo: joined.tableCode } : {}),
    };
    current.current = next;
    setSeat(next);
    return next;
  }, []);

  /** Se une a la mesa abierta (crea la sesión anónima si hace falta). */
  const join = useCallback(async (): Promise<Result<TableSeat, CustomerError>> => {
    if (current.current) return ok(current.current);
    const joined = await gateway.join(qrPublicId);
    return joined.ok ? ok(remember(joined.value)) : joined;
  }, [gateway, qrPublicId, remember]);

  /** Vuelve a la mesa solo si este teléfono ya estaba en ella; null si nunca se unió. */
  const resume = useCallback(async (): Promise<Result<TableSeat | null, CustomerError>> => {
    if (current.current) return ok(current.current);
    const joined = await gateway.resume(qrPublicId);
    if (!joined.ok) return joined;
    return ok(joined.value ? remember(joined.value) : null);
  }, [gateway, qrPublicId, remember]);

  /** La participación ya no vale (venció o se cerró la mesa): la próxima vez se vuelve a unir. */
  const forget = useCallback(() => {
    current.current = null;
    setSeat(null);
  }, []);

  return { seat, join, resume, forget };
}

export type TableSeatState = ReturnType<typeof useTableSeat>;
