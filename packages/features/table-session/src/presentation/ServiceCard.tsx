import { useState } from 'react';
import type { ServiceRequestKind } from '@tavelyo/contracts';
import { ActionNotice, Card, Icon, TavelyoButton, type ActionResult } from '@tavelyo/design-system';
import { serviceRequestText } from '../application/my-orders.ts';
import { useTableOrder } from './TableOrderProvider.tsx';
import { customerErrorText } from './useCheckout.ts';

/**
 * «Llamar al mesero» y «Pedir la cuenta»: solo avisan al personal (la cuenta es de la Fase 4).
 * Si la persona todavía no estaba en la mesa, se une; el backend aplica los límites (T11).
 */
export function ServiceCard() {
  const { gateway, seat } = useTableOrder();
  const [busy, setBusy] = useState<ServiceRequestKind | null>(null);
  const [notice, setNotice] = useState<ActionResult>(null);

  const send = async (kind: ServiceRequestKind) => {
    setBusy(kind);
    setNotice(null);
    // Un segundo intento solo si la participación ya no vale: se vuelve a unir a la mesa.
    for (let round = 0; round < 2; round += 1) {
      const joined = await seat.join();
      if (!joined.ok) {
        setNotice({ tone: 'error', text: customerErrorText(joined.error) });
        break;
      }
      const result = await gateway.requestService({ sessionId: joined.value.sessionId, kind });
      if (result.ok) {
        setNotice({ tone: 'success', text: serviceRequestText(kind, result.value.status) });
        break;
      }
      const rejoin = result.error.kind === 'rejected' && result.error.reason === 'not-participant';
      if (rejoin && round === 0) {
        seat.forget();
        continue;
      }
      setNotice({ tone: 'error', text: customerErrorText(result.error) });
      break;
    }
    setBusy(null);
  };

  return (
    <Card title="¿Necesitas algo?" headingLevel={2}>
      <ActionNotice notice={notice} />
      <div className="tv-toolbar">
        <TavelyoButton
          variant="secondary"
          loading={busy === 'call_waiter'}
          loadingLabel="Avisando…"
          disabled={busy !== null}
          onClick={() => void send('call_waiter')}
        >
          <Icon name="callWaiter" />
          Llamar al mesero
        </TavelyoButton>
        <TavelyoButton
          variant="secondary"
          loading={busy === 'request_bill'}
          loadingLabel="Avisando…"
          disabled={busy !== null}
          onClick={() => void send('request_bill')}
        >
          <Icon name="bill" />
          Pedir la cuenta
        </TavelyoButton>
      </div>
      <p className="tv-list__meta">
        Al pedir la cuenta avisamos al mesero; él te la trae a la mesa.
      </p>
    </Card>
  );
}
