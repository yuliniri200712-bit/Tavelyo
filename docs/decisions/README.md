# Registro de decisiones de arquitectura (ADR)

Cada decisión relevante se registra en un archivo `NNNN-titulo.md` con: estado, contexto, opciones, decisión o recomendación, consecuencias y verificaciones pendientes.

Estados: **Propuesta** (pendiente de aprobación del propietario) · **Aceptada** · **Reemplazada por NNNN** · **Rechazada**.
Una decisión solo pasa a *Aceptada* con aprobación expresa del propietario o cuando la impone un documento de origen (se indica cuál).

| ADR | Título | Estado |
|---|---|---|
| [0001](0001-estructura-monorepo.md) | Estructura del repositorio: monorepo con *pub workspaces* | Aceptada |
| [0002](0002-division-de-aplicaciones.md) | División en dos aplicaciones Flutter (web y Android) | Aceptada |
| [0003](0003-backend-de-confianza.md) | Backend de confianza: Cloud Functions con TypeScript | Aceptada |
| [0004](0004-estado-y-navegacion.md) | Gestión de estado y navegación: Riverpod + go_router | Aceptada |
| [0005](0005-representacion-de-dinero.md) | Representación de importes | Aceptada (impuesta por PM §6) |
| [0006](0006-contrato-de-pagos.md) | Contrato `PaymentGateway` y flujo idempotente | Aceptada en contrato; proveedor pendiente (D-02) |
| [0007](0007-actualizacion-en-tiempo-real.md) | Mecanismo de actualización de cocina y meseros | Propuesta (pendiente del resultado del spike) |
| [0008](0008-autorizacion-multiempresa.md) | Autorización multiempresa y revocación | Propuesta (pendiente del resultado del spike) |
