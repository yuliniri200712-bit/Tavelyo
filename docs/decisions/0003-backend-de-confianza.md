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

## Verificación pendiente

- Confirmar en la documentación oficial los runtimes de Node.js soportados y las cuotas/costes aplicables.
- No asumir soporte oficial de Dart en Cloud Functions sin verificarlo.
- Confirmar la conexión segura del backend a Cloud SQL (conector oficial, IAM) en el spike o en Fase 1.
