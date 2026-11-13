# ADR-0006 — Contrato `PaymentGateway` y flujo idempotente

**Estado:** Aceptada en cuanto al contrato (PM §8); **proveedor pendiente (D-02)** · **Fecha:** 2026-11-13

## Contexto

La pasarela depende del país, la moneda y el titular de la cuenta comercial. El flujo de preautorización y captura debe ser independiente del proveedor y resistente a fallos entre dos sistemas sin transacción común.

## Decisión

Contrato en el backend (y sus tipos compartidos con el cliente web en `packages/contracts`, ADR-0010):

| Operación | Entrada mínima | Garantía |
|---|---|---|
| `authorize` | intento, importe, moneda, clave idempotente, token del método de pago | Misma clave → mismo resultado |
| `getStatus` | referencia del proveedor | Consulta autenticada |
| `capture` | autorización, importe, clave idempotente | No supera lo autorizado vigente |
| `voidAuthorization` | autorización, clave idempotente | Libera según capacidades reales |
| `refund` | captura, importe, motivo, clave idempotente | No supera lo capturado neto |

Capacidades declaradas por adaptador: `incrementalAuthorization`, `partialCapture`, `multipleCaptures`, `authorizationTtl`. El flujo solo usa las que el adaptador declare y se hayan probado.

Mecanismos obligatorios: intento persistente antes de llamar al proveedor, `IdempotencyRecord`, `OutboxEvent`, deduplicación de `ProviderEvent`, verificación de firma de webhooks, conciliación programada (ver `architecture/state-machines.md`).

## Adaptadores

- `FakePaymentGateway`: **explícitamente simulado**, solo para pruebas y Fase 2–3; nunca habilitado en producción.
- Adaptador real: tras D-02, en entorno de pruebas del proveedor (Fase 4). La habilitación real requiere autorización separada.

## Consecuencias

- Tavelyo nunca recibe PAN ni CVV: se usan componentes de tokenización del proveedor.
- No se afirma cumplimiento PCI por integrar un proveedor.
