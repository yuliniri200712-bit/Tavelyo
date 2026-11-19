# ADR-0012 — La pasarela de pago solo cobra las suscripciones a Tavelyo

**Estado:** Aceptada · **Fecha:** 2026-11-18 · Decisión expresa del propietario (D-32 a D-35). Reemplaza en parte a ADR-0006 y cambia D-04, D-29, D-31 y el alcance de D-02.

## Contexto

Hasta ahora, cada pedido del comensal llegaba a cocina solo con una preautorización de su tarjeta (D-04, ADR-0006). La pasarela de pago estaba en el centro del restaurante: autorizar, capturar, liberar y reembolsar, con un adaptador simulado mientras no hubiera proveedor (D-02, D-31).

El 2026-11-18 el propietario aclaró que **la pasarela solo debe usarse para que los restaurantes registrados en Tavelyo le paguen su plan**. Los comensales pagan en el restaurante como siempre, y Tavelyo solo registra ese pago. El encargo ya distinguía las dos cosas (PM §2: «el cobro del restaurante a sus clientes» y «la eventual suscripción del restaurante a Tavelyo»), y deja la suscripción fuera del alcance inicial, con requisitos propios.

## Decisión

1. **El restaurante no usa pasarela.** Ningún pedido de comensal pasa por una autorización de pago. El comensal paga al final en efectivo, con el **datáfono propio del restaurante** o por **transferencia** (Nequi, Daviplata, QR bancario). El cajero lo registra con el número de comprobante; nunca con datos de la tarjeta (D-33).
2. **Garantía antes de cocina (D-04, nueva versión):** cada **sucursal** elige cómo llegan a cocina los pedidos hechos desde el teléfono del comensal (D-32):
   - **directo a cocina** (por defecto);
   - **el mesero aprueba cada pedido**: el pedido queda pendiente hasta que el mesero lo aprueba o lo rechaza con motivo; el comensal puede retirarlo mientras está pendiente, y el mesero ve cuánto lleva esperando.

   La cambian el propietario y el administrador de sucursal, con auditoría. Los pedidos que toma el mesero van siempre directo a cocina.
3. **La pasarela queda para una fase nueva, «Suscripciones a Tavelyo»:** planes, precios, cobro recurrente a los restaurantes, avisos de la pasarela y qué pasa si un restaurante no paga. D-02 cambia de criterio: ahora se busca **cobro recurrente en Colombia**, no preautorización.
4. **El bloque 3 de la Fase 4 se conserva desconectado** para esa fase. Se conservan:
   - el libro de operaciones con idempotencia;
   - la verificación de avisos firmados;
   - la conciliación;
   - el adaptador simulado.

   No se exportan como funciones ni se usan en el restaurante.
5. **Nada se borra de la base:** las tablas y columnas de la preautorización (`PaymentAuthorization`, los campos de consentimiento de `OrderQuote`, `RELEASE_PENDING`) quedan sin uso.

## Consecuencias

- **El restaurante se puede desplegar sin pasarela.** Antes, el backend se negaba a arrancar en un proyecto real porque usaba el pago simulado. Ese bloqueo pasa a aplicarse solo al módulo de suscripciones.
- **Menor exposición:** Tavelyo no maneja datos de tarjeta de los comensales en ningún punto. Las amenazas T4 (avisos falsificados) y T5 (cobro doble) pasan a la fase de suscripciones.
- **Riesgo aceptado:** en el modo «directo a cocina», alguien podría pedir y marcharse sin pagar, como en cualquier restaurante. Lo mitigan:
  - la mesa la abre el mesero (D-21);
  - la participación vence;
  - hay un límite de personas por mesa;
  - el mesero puede retirar a alguien de la mesa;
  - quien quiera más control activa el modo «el mesero aprueba».
- **Requisitos:** RF-PA-01, RF-PA-02 y RF-PA-06 pasan a la fase de suscripciones. RF-PA-03 se cumple con «otro medio registrado y autorizado». RF-PA-04, RF-PA-05, RF-PA-07 y RF-PA-08 siguen en la Fase 4 sin pasarela.
- **PM §11, Fase 4:** el criterio «pasarela en entorno de prueba, autorización, captura» se cumple en la fase de suscripciones. La Fase 4 queda como cuenta, cobro registrado, división, reembolso registrado, caja y cierre.
- `docs/PROMPT_MAESTRO.md` no se edita: esta decisión del propietario prevalece (CLAUDE.md, «Fuentes y precedencia»).

## Verificaciones pendientes

- Al planificar la fase de suscripciones, rehacer la comparación de pasarelas con el criterio de cobro recurrente, y revisar con el contador la factura electrónica de los planes.
