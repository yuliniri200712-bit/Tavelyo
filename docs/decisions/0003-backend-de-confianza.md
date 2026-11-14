# ADR-0003 — Backend de confianza: Cloud Functions y lenguaje

**Estado:** Aceptada · **Fecha:** 2026-11-13 · Aprobada por el propietario (D-07)

## Contexto

Pagos, webhooks, conciliación, revalidación de precios, inventario y operaciones con invariantes transaccionales no pueden ejecutarse en el cliente (PM §3). El stack obligatorio incluye Cloud Functions; PM §3 permite Cloud Run si se justifica.

## Opciones

| Opción | Ventajas | Inconvenientes |
|---|---|---|
| A. Cloud Functions for Firebase con TypeScript (Node.js) | Integrado con Firebase Auth, emuladores y despliegue; SDK oficiales de la mayoría de pasarelas; tareas programadas y disparadores | Segundo lenguaje en el proyecto |
| B. Cloud Functions con Python | Soporte oficial | Segundo lenguaje; menos afinidad con el resto del stack |
| C. Cloud Run con un servicio en Dart | Un solo lenguaje con Flutter | Sin integración nativa de disparadores de Firebase; más infraestructura propia; SDK de pasarelas para Dart poco probables |

## Decisión

**Opción A**: Cloud Functions con TypeScript. Prima la disponibilidad de SDK oficiales de pasarelas y la integración con los emuladores de Firebase. Las transacciones se hacen con un cliente PostgreSQL directo desde el backend, con permisos mínimos.

## Consecuencias

- `backend/` con su propio `package.json`, pruebas (unitarias y con emulador) y lint en CI.
- El dominio financiero se modela dos veces solo en sus contratos (tipos de API); la autoridad de cálculo es el backend.

## Implementación (Fase 1, 2026-11-14)

- `backend/` (workspace `@tavelyo/backend`) con `firebase-functions` 7.4.0 (MIT) y `firebase-admin` 14.5.0 (Apache-2.0), aprobados por el propietario el 2026-11-14; versiones con más de dos semanas y 0 vulnerabilidades en `npm audit`.
- Runtime `nodejs24` (GA en la CLI 15.30; retiro previsto 2028-10-31). Región `us-central1`, igual que SQL Connect (provisional), y `maxInstances: 10` para acotar costes. App Check no se activa (no aprobado).
- Capas: casos de uso puros con interfaces (`members/`, `provisioning/`), adaptadores del Admin SDK (`data/`) y funciones callable como presentación (`presentation/`). `src/index.ts` es la raíz de composición.
- Compilación con `vite build` en modo servidor (Vite ya aprobado, ADR-0010) a `backend/lib/index.js`: incluye `@tavelyo/core` e `@tavelyo/identity/application` y deja fuera el Admin SDK y `firebase-functions`.
- Datos: por ahora el backend usa SQL Connect (Admin SDK) y no un cliente PostgreSQL directo, para que los cambios se vean en tiempo real (ADR-0007) y las acciones de usuario conserven sus reglas (ADR-0008 §7). El cliente directo se decidirá cuando una operación lo necesite.

## Verificación pendiente

- ~~Confirmar los runtimes de Node.js soportados~~ (Node 24, ver arriba). Pendiente: cuotas y costes, que se revisan antes de activar el plan Blaze.
- Con ADR-0009, cliente y backend comparten TypeScript: los contratos compartidos viven en `packages/contracts` (ADR-0010).
- Confirmar la conexión segura del backend a Cloud SQL (conector oficial, IAM) cuando se necesite el cliente directo.
- Empaquetado para Cloud Build (dependencias del workspace) y primer despliegue: requieren autorización.
