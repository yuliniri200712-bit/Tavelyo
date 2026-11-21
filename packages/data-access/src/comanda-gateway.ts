import type { DataConnect } from 'firebase/data-connect';
import type { Functions } from 'firebase/functions';
import { staffOrderDesk, addTableGuest } from '@tavelyo/dataconnect-sdk';
import { err, ok, isWithinWeeklySchedule, nextGuestNumber, tablePersonLabels } from '@tavelyo/core';
import type { StaffOrderResponse } from '@tavelyo/contracts';
import type { ComandaGateway, ComandaMenu } from '@tavelyo/orders/domain';
import { toProduct } from './customer-gateway.ts';
import { callStaffFunction } from './staff-callable.ts';
import { mapCommandError } from './command-errors.ts';
import { SERVER_ONLY } from './live-query.ts';

const GUEST_TAKEN = 'Esa persona sin teléfono ya está en la mesa.';

interface DeskParticipant {
  readonly id: string;
  readonly guestNumber?: number | null;
  readonly expiresAt: string;
  readonly removedAt?: string | null;
}

/**
 * Personas de la comanda: se numeran sobre todas las de la sesión (también vencidas o retiradas,
 * como el salón y la caja, D-43) y solo se ofrecen las vigentes. El servidor vuelve a comprobar la
 * vigencia al enviar (submitStaffOrder).
 */
export function toComandaPeople(
  participants: readonly DeskParticipant[],
  now: Date,
): Pick<ComandaMenu, 'people' | 'nextGuestNumber'> {
  const all = participants.map((p) => ({ ...p, guestNumber: p.guestNumber ?? null }));
  const labels = tablePersonLabels(all);
  return {
    people: all
      .filter(
        (p) => !p.removedAt && (p.guestNumber !== null || Date.parse(p.expiresAt) > now.getTime()),
      )
      .map((p) => ({
        id: p.id,
        guestNumber: p.guestNumber,
        label: labels.get(p.id) ?? 'Persona de la mesa',
      })),
    nextGuestNumber: nextGuestNumber(all),
  };
}

export function createComandaGateway(dc: DataConnect, functions: Functions): ComandaGateway {
  return {
    async menu(scope) {
      try {
        const { data } = await staffOrderDesk(dc, scope, SERVER_ONLY);
        const b = data.branch;
        if (!b) return err({ kind: 'unauthorized' });
        const products = b.productBranches_on_branch
          .flatMap((entry) => {
            const p = toProduct(entry, b.currency);
            return p && isWithinWeeklySchedule(p.schedule, new Date(), b.timezone) ? [p] : [];
          })
          .sort(
            (a, b) =>
              a.categorySort - b.categorySort ||
              a.sort - b.sort ||
              a.name.localeCompare(b.name, 'es'),
          );
        return ok({
          products,
          currency: b.currency,
          ...toComandaPeople(data.sessionParticipants, new Date()),
        });
      } catch (e) {
        return err(mapCommandError(e));
      }
    },
    async addGuest(scope, number) {
      try {
        const { data } = await addTableGuest(dc, { ...scope, number });
        return ok({ outcome: 'added', participantId: data.sessionParticipant_insert.id });
      } catch (e) {
        const mapped = mapCommandError(e, GUEST_TAKEN);
        // La unicidad (sesión, número) hace que repetir el mismo número nunca cree a otra persona.
        return mapped.kind === 'rejected' && mapped.message === GUEST_TAKEN
          ? ok({ outcome: 'taken' })
          : err(mapped);
      }
    },
    send: (scope, participantId, request) =>
      callStaffFunction<StaffOrderResponse>(functions, 'submitStaffOrder', {
        ...scope,
        ...request,
        participantId,
      }),
  };
}
