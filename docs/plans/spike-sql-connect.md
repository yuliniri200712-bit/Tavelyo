# Plan de prueba técnica (spike) de SQL Connect — D-13

Estado: **autorizado por el propietario el 2026-11-13; pendiente de ejecutar** (PM §3 lo exige antes de comprometer la arquitectura).

## Objetivo

Comprobar con evidencia las capacidades que la arquitectura no puede suponer:

1. Autorización: ¿`@auth` y los filtros de SQL Connect permiten restringir por membresía activa (`auth.uid` → `Membership` → `tenant_id`)? (ADR-0008)
2. Generación del SDK Dart para las operaciones necesarias y su uso desde Flutter. *(Con ADR-0009 este punto pasa a ser el SDK web generado en TypeScript y su uso desde el navegador.)*
3. Atomicidad: ¿qué operaciones multi-tabla se pueden expresar en una mutación atómica y cuáles deben ir al backend?
4. Actualización: ¿existe un mecanismo de suscripción/tiempo real utilizable para cocina? Si no, medir la consulta incremental por cursor. (ADR-0007)

## Límites

- Solo **emuladores locales** (Firebase CLI 15.30.2 instalada; comandos `firebase dataconnect:*`). Sin crear proyectos ni recursos facturables.
- Rama aparte (`spike/sql-connect`), código desechable que **no** se integra en `main`.
- Modelo mínimo: `Tenant`, `Membership`, `Order`, `OrderItem` con dos empresas de prueba.

## Entregable

`docs/architecture/spike-sql-connect.md` con comandos ejecutados, resultados reales, limitaciones encontradas y la actualización de ADR-0007 y ADR-0008.

## Verificación previa

Consultar la documentación oficial vigente de SQL Connect (nombres de paquetes, CLI, emulador, directivas de autorización) antes de escribir el esquema.
