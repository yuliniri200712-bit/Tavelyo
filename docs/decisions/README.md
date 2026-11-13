# Registro de decisiones de arquitectura (ADR)

Cada decisión relevante se registra en un archivo `NNNN-titulo.md` con: estado, contexto, opciones, decisión o recomendación, consecuencias y verificaciones pendientes.

Estados: **Propuesta** (pendiente de aprobación del propietario) · **Aceptada** · **Reemplazada por NNNN** · **Rechazada**.
Una decisión solo pasa a *Aceptada* con aprobación expresa del propietario o cuando la impone un documento de origen (se indica cuál).

| ADR | Título | Estado |
|---|---|---|
| [0001](0001-estructura-monorepo.md) | Estructura del repositorio: monorepo con *pub workspaces* | Reemplazada por 0009 (herramienta propuesta en 0010) |
| [0002](0002-division-de-aplicaciones.md) | División en dos aplicaciones Flutter (web y Android) | Reemplazada por 0009 |
| [0003](0003-backend-de-confianza.md) | Backend de confianza: Cloud Functions con TypeScript | Aceptada |
| [0004](0004-estado-y-navegacion.md) | Gestión de estado y navegación: Riverpod + go_router | Reemplazada por 0009 |
| [0005](0005-representacion-de-dinero.md) | Representación de importes | Aceptada (impuesta por PM §6) |
| [0006](0006-contrato-de-pagos.md) | Contrato `PaymentGateway` y flujo idempotente | Aceptada en contrato; proveedor pendiente (D-02) |
| [0007](0007-actualizacion-en-tiempo-real.md) | Mecanismo de actualización de cocina y meseros | Aceptada |
| [0008](0008-autorizacion-multiempresa.md) | Autorización multiempresa y revocación | Aceptada |
| [0009](0009-plataforma-web-pwa.md) | Plataforma: PWA con React, Vite y TypeScript; dos aplicaciones | Aceptada (decisión del propietario) |
| [0010](0010-stack-web.md) | Bibliotecas y herramientas del stack web | Aceptada (validación de formularios pendiente) |
