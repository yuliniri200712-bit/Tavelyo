import type { DataConnect } from 'firebase/data-connect';
import type { Functions } from 'firebase/functions';
import {
  branchRegisters,
  createRegister,
  updateRegister,
  type BranchRegistersData,
} from '@tavelyo/dataconnect-sdk';
import { ok } from '@tavelyo/core';
import type {
  CashSessionResponse,
  CloseCashSessionResponse,
  ReadCashSessionResponse,
} from '@tavelyo/contracts';
import type { CashGateway, Register, Till } from '@tavelyo/cash/domain';
import { callStaffFunction as call } from './staff-callable.ts';
import { readQuery, runCommand, SERVER_ONLY } from './live-query.ts';

const DUPLICATE_REGISTER = 'Ya existe una caja con ese nombre en la sucursal.';

export function toRegisters(data: BranchRegistersData): Register[] {
  return data.registers.map((r) => {
    const open = r.cashSessions_on_register[0];
    return {
      id: r.id,
      name: r.name,
      archived: Boolean(r.archivedAt),
      openSession: open ? { id: open.id, openedAt: new Date(open.openedAt) } : null,
    };
  });
}

export function toTill(session: CashSessionResponse): Till {
  return {
    id: session.cashSessionId,
    registerId: session.registerId,
    openedAt: new Date(session.openedAt),
    revision: session.revision,
    openingFloatMinor: session.openingFloatMinor,
    cashInMinor: session.cashInMinor,
    cashOutMinor: session.cashOutMinor,
    salesMinor: session.salesMinor,
    refundsMinor: session.refundsMinor,
    expectedMinor: session.expectedMinor,
    movements: session.movements.map((m) => ({
      id: m.id,
      kind: m.kind,
      amountMinor: m.amountMinor,
      reason: m.reason,
      createdAt: new Date(m.createdAt),
    })),
  };
}

/** Caja con SQL Connect (cajas.gql) y las funciones de turno del backend (D-40). */
export function createCashGateway(dataConnect: DataConnect, functions: Functions): CashGateway {
  return {
    registers: (scope) =>
      readQuery(() => branchRegisters(dataConnect, scope, SERVER_ONLY), toRegisters),
    createRegister: (scope, name) =>
      runCommand(() => createRegister(dataConnect, { ...scope, name }), DUPLICATE_REGISTER),
    updateRegister: (scope, register) =>
      runCommand(
        () =>
          updateRegister(dataConnect, {
            ...scope,
            registerId: register.id,
            name: register.name,
            archived: register.archived,
          }),
        DUPLICATE_REGISTER,
      ),
    async myTill(scope) {
      const result = await call<ReadCashSessionResponse>(functions, 'readCashSession', scope);
      return result.ok ? ok(result.value.session ? toTill(result.value.session) : null) : result;
    },
    async openTill(scope, registerId, openingFloatMinor) {
      const result = await call<CashSessionResponse>(functions, 'openCashSession', {
        ...scope,
        registerId,
        openingFloatMinor,
      });
      return result.ok ? ok(toTill(result.value)) : result;
    },
    async move(scope, till, movement) {
      const result = await call<CashSessionResponse>(functions, 'recordCashMovement', {
        ...scope,
        cashSessionId: till.id,
        revision: till.revision,
        ...movement,
      });
      return result.ok ? ok(toTill(result.value)) : result;
    },
    async closeTill(scope, till, countedMinor, reason) {
      const result = await call<CloseCashSessionResponse>(functions, 'closeCashSession', {
        ...scope,
        cashSessionId: till.id,
        revision: till.revision,
        countedMinor,
        ...(reason ? { reason } : {}),
      });
      return result.ok
        ? ok({
            expectedMinor: result.value.expectedMinor,
            countedMinor: result.value.countedMinor,
            differenceMinor: result.value.differenceMinor,
          })
        : result;
    },
  };
}
