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
