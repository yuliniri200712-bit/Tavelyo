# ADR-0007 — Mecanismo de actualización de cocina y meseros

**Estado:** Aceptada · **Fecha:** 2026-11-13 · Aprobada por el propietario tras el spike D-13

## Contexto

Cocina y meseros necesitan ver cambios en segundos. PM §3 y §9 prohíben asumir suscripciones en tiempo real o persistencia sin conexión solo por usar Firebase, y exigen recuperar el estado por versión/cursor al reconectar.

## Opciones

| Opción | Ventajas | Inconvenientes |
|---|---|---|
| A. Suscripciones de SQL Connect | Sin infraestructura adicional; verificadas en el spike | Solo las operaciones del conector emiten señal |
| B. Consultas incrementales periódicas por cursor (`updated_at`/versión) | Simple, predecible, funciona sin funciones especiales | Latencia igual al intervalo; coste por consulta |
| C. Aviso por FCM + consulta incremental | Latencia baja con poco tráfico | FCM puede perder o duplicar avisos; necesita B como respaldo |

## Evidencia (spike D-13, SDK web, emulador)

- Un pedido o cambio de estado hecho por otro cliente llega a la cocina en menos de 100 ms (emulador local, no representativo de producción).
- Una suscripción a otra empresa nunca recibe datos: cada refresco vuelve a aplicar `@auth`/`@check` con la identidad del suscriptor.
- Los rechazos llegan al cliente en `onErr`, incluida la revocación de una membresía durante una suscripción activa.
- Los cambios hechos con GraphQL arbitrario de administrador **no** emiten señal; los hechos con una operación del conector (incluida `impersonateMutation` desde el backend), sí.

## Decisión

1. **Mecanismo principal (A):** suscripciones de SQL Connect (`subscribe()` con `@refresh(onMutationExecuted)` y `condition` por empresa y sucursal).
2. **Base y recuperación (B, se mantiene):** consulta incremental por cursor al abrir la pantalla, al reconectar, al volver la PWA a primer plano y tras cualquier `onErr`.
3. **Regla para el backend:** todo cambio que deba verse en tiempo real se hace con una **operación del conector** (`impersonateMutation` o una operación de servidor definida en el conector), nunca con `executeGraphql` arbitrario, `_updateMany`/`_deleteMany` ni SQL directo.
4. **Cliente:** `onErr` con `PERMISSION_DENIED` o `UNAUTHENTICATED` (p. ej. revocación) → salir del contexto de la empresa y volver al selector o al inicio de sesión. Errores de red → indicador de conexión y re-consulta.
5. **FCM (C):** descartado para cocina; solo para avisos fuera de la app (Web Push, según los navegadores de D-15).

## Consecuencias

- Toda consulta suscribible declara sus `@refresh` con `condition` por empresa y sucursal; sin `condition`, cualquier mutación de cualquier empresa provocaría refrescos inútiles.
- El SDK generado necesita `clientCache`.
- Las pruebas de Fase 3 cubren el caso 11 de PM §12 (desconexión y reconexión de cocina) con esta combinación A + B.

## Verificación pendiente

- Navegadores reales con *service worker* (D-15).
- Producción: latencia, límites de suscripciones y coste con la carga de D-09.
- Reconexión tras cortes de red.

## Implementación (Fase 3, bloque 2, 2026-11-16)

- **Consultas suscribibles:** `KitchenQueue`, `PickupQueue`, `SessionOrders`, `FloorView`, `PendingServiceRequests` y `MyOrders`. Cada una declara un `@refresh(onMutationExecuted)` por operación que la afecta, con `condition` por sucursal (`branchId`) o, para el aviso de pedido nuevo al cliente, por sesión (`sessionId`).
- **`_updateMany` dentro de una operación con nombre sí refresca.** La documentación dice que `_updateMany` y `_deleteMany` no emiten las señales **implícitas** (las de consultas por clave primaria). Con `@refresh(onMutationExecuted: { operation })` explícito, el refresco depende del nombre de la operación y no de cómo escribe por dentro. Los cambios de estado de las líneas usan `_updateMany` condicionado por estado y versión (caso 4).
- **Envío a cocina en dos pasos:** el SDK web no admite listas de entrada (`_Data`), así que el backend guarda el pedido con sus líneas mediante un documento fijo de `executeGraphql`, que no emite señal. Después lo envía con la operación del conector `ServerSendOrderToKitchen`, que comprueba la autorización (D-04) y marca `sentToKitchenAt`. Las consultas de cocina, del salón y del cliente solo muestran pedidos enviados. Así se cumple la regla 3.
- **Recuperación (B):** la cola de cocina, «Listos para recoger» y las solicitudes son el estado pendiente completo de la sucursal, no una lista de eventos. Al abrir la pantalla, al reconectar o tras un `onErr` se vuelven a pedir completas, sin cursor (caso 11).
- **Sin caché de datos (bloque 4):** en el SDK web 12.19, `subscribe()` funciona sin `clientCache`: guarda el último resultado en el registro de la propia suscripción y no en una caché compartida. Se mantiene ADR-0008 §8 (nada que vaciar al cerrar sesión o cambiar de empresa). La documentación de Firebase pide activar la caché; si una versión futura del SDK la exige, se activa por sesión.
- **Verificado en navegadores reales (bloque 4, `e2e/emulators/kitchen-realtime.spec.ts`):** en Chrome, Edge, Safari de escritorio, Chrome de Android y Safari de iPhone (D-15), con los emuladores, cocina recibe el pedido nuevo sin recargar. Sin red, la pantalla lo dice, conserva la hora de la última actualización y no deja avanzar. Al volver la red, recupera el pedido confirmado entretanto. Sigue pendiente medir la latencia y los límites en producción.
- **Pantalla:** `useKitchenQueue` combina la suscripción con una lectura completa al abrir, al volver la red (`online`), al volver la pestaña a primer plano y tras cada cambio propio. Tras un error de red se vuelve a suscribir a los 5 segundos. Un error de permiso (revocación) no se reintenta.
