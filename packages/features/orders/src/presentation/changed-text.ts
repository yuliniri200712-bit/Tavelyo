import { serverErrorText, type ServerError } from '@tavelyo/design-system';

const CHANGED_TEXT = 'Esta línea ya cambió. La pantalla muestra el estado actual.';

/** Si otra persona se adelantó (caso 4), lo explica; el resto, con el motivo del servidor. */
export function changedText(error: ServerError): string {
  if (error.kind === 'rejected' && /ya cambió/.test(error.message)) return CHANGED_TEXT;
  return serverErrorText(error);
}
