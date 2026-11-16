import { QueryFetchPolicy, type DataConnect } from 'firebase/data-connect';
import { createBranch, tenantBranches, updateBranch } from '@tavelyo/dataconnect-sdk';
import { err, ok } from '@tavelyo/core';
import type { BranchAdminGateway } from '@tavelyo/tenancy/domain';
import { mapCommandError } from './command-errors.ts';

// Siempre al servidor: la PWA no conserva respuestas de datos (ADR-0008 §8, ADR-0009).
const SERVER_ONLY = { fetchPolicy: QueryFetchPolicy.SERVER_ONLY } as const;

async function command(run: () => Promise<unknown>) {
  try {
    await run();
    return ok(undefined);
  } catch (error) {
    return err(mapCommandError(error));
  }
}

export function createBranchAdminGateway(dataConnect: DataConnect): BranchAdminGateway {
  return {
    async branches(tenantId) {
      try {
        const { data } = await tenantBranches(dataConnect, { tenantId }, SERVER_ONLY);
        return ok(
          data.branches.map((branch) => ({
            id: branch.id,
            name: branch.name,
            currency: branch.currency,
            timezone: branch.timezone,
            archived: branch.status === 'ARCHIVED',
          })),
        );
      } catch (error) {
        return err(mapCommandError(error));
      }
    },
    createBranch: (tenantId, currency, input) =>
      command(() => createBranch(dataConnect, { tenantId, currency, ...input })),
    updateBranch: (tenantId, branchId, input) =>
      command(() => updateBranch(dataConnect, { tenantId, branchId, ...input })),
  };
}
