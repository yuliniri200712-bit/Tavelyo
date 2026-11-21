import type { DataConnect } from 'firebase/data-connect';
import type { Functions } from 'firebase/functions';
import { staffOrderDesk, addTableGuest } from '@tavelyo/dataconnect-sdk';
import { err, ok, isWithinWeeklySchedule } from '@tavelyo/core';
import type { StaffOrderResponse } from '@tavelyo/contracts';
import type { ComandaGateway } from '@tavelyo/orders/domain';
import { toProduct } from './customer-gateway.ts';
import { callStaffFunction } from './staff-callable.ts';
import { mapCommandError } from './command-errors.ts';
import { SERVER_ONLY } from './live-query.ts';

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
        const people = data.sessionParticipants.map((p, i) => ({
          id: p.id,
          guestNumber: p.guestNumber ?? null,
          label: p.guestNumber ? 'Persona sin teléfono ' + p.guestNumber : 'Persona ' + (i + 1),
        }));
        return ok({ products, people, currency: b.currency });
      } catch (e) {
        return err(mapCommandError(e));
      }
    },
    async addGuest(scope, number) {
      try {
        const { data } = await addTableGuest(dc, { ...scope, number });
        return ok(data.sessionParticipant_insert.id);
      } catch (e) {
        return err(mapCommandError(e, 'Esa persona ya está en la mesa. Actualiza las personas.'));
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
