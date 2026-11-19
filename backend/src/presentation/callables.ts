import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/https';
import type {
  JoinTableSessionResponse,
  QuoteOrderResponse,
  RequestServiceResponse,
  SubmitOrderResponse,
  BillResponse,
  BillPaymentsResponse,
  CloseTableResponse,
  RecordedPaymentResponse,
  RecordRefundResponse,
} from '@tavelyo/contracts';
import type { RevokeMemberResult } from '../members/revoke-member.ts';
import type { ProvisionTenantResult } from '../provisioning/provision-tenant.ts';
import { failure, type Actor, type Outcome } from '../shared/outcome.ts';

type UseCase<T> = (actor: Actor, data: unknown) => Promise<Outcome<T>>;

export interface UseCases {
  readonly readBill: UseCase<BillResponse>;
  readonly closeTable: UseCase<CloseTableResponse>;
  readonly readBillPayments: UseCase<BillPaymentsResponse>;
  readonly recordPayment: UseCase<RecordedPaymentResponse>;
  readonly refundPayment: UseCase<RecordRefundResponse>;
  readonly revokeMember: UseCase<RevokeMemberResult>;
  readonly provisionTenant: UseCase<ProvisionTenantResult>;
  readonly joinTableSession: UseCase<JoinTableSessionResponse>;
  readonly quoteOrder: UseCase<QuoteOrderResponse>;
  readonly submitOrder: UseCase<SubmitOrderResponse>;
  readonly requestService: UseCase<RequestServiceResponse>;
}

/** Quien llama, si Cloud Functions verificó su ID token; null si no hay sesión. */
export function actorFrom(request: Pick<CallableRequest, 'auth'>): Actor | null {
  if (!request.auth) return null;
  const { uid, token } = request.auth;
  return { uid, claims: { ...token }, authTimeSeconds: token.auth_time };
}

/** Traduce el resultado al protocolo de las funciones callable. */
export function respond<T>(outcome: Outcome<T>): T {
  if (outcome.ok) return outcome.value;
  throw new HttpsError(outcome.error.code, outcome.error.message);
}

export async function handle<T>(
  request: Pick<CallableRequest, 'auth' | 'data'>,
  useCase: UseCase<T>,
): Promise<T> {
  const actor = actorFrom(request);
  if (!actor) {
    return respond<T>({
      ok: false,
      error: failure('unauthenticated', 'Inicia sesión para continuar.'),
    });
  }
  return respond(await useCase(actor, request.data));
}

// App Check no está aprobado todavía (CLAUDE.md §4); la autorización no depende de él.
const OPTIONS = { enforceAppCheck: false } as const;

export function createCallables(useCases: UseCases) {
  return {
    readBill: onCall(OPTIONS, (request) => handle(request, useCases.readBill)),
    closeTable: onCall(OPTIONS, (request) => handle(request, useCases.closeTable)),
    readBillPayments: onCall(OPTIONS, (request) => handle(request, useCases.readBillPayments)),
    recordPayment: onCall(OPTIONS, (request) => handle(request, useCases.recordPayment)),
    refundPayment: onCall(OPTIONS, (request) => handle(request, useCases.refundPayment)),
    revokeMember: onCall(OPTIONS, (request) => handle(request, useCases.revokeMember)),
    provisionTenant: onCall(OPTIONS, (request) => handle(request, useCases.provisionTenant)),
    // Del cliente en la mesa: exigen sesión de Firebase Auth, también anónima (ADR-0011).
    joinTableSession: onCall(OPTIONS, (request) => handle(request, useCases.joinTableSession)),
    quoteOrder: onCall(OPTIONS, (request) => handle(request, useCases.quoteOrder)),
    submitOrder: onCall(OPTIONS, (request) => handle(request, useCases.submitOrder)),
    requestService: onCall(OPTIONS, (request) => handle(request, useCases.requestService)),
  };
}
