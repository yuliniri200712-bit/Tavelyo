# Progreso del proyecto

Última actualización: 2026-11-13

## Fase actual

**Fase 1 — Base.** Autorizada por el propietario el 2026-11-13. Rama: `fase-1-base`. Plan: [`plans/fase-1.md`](plans/fase-1.md).

**Fase 0 — Análisis: cerrada** con aprobación del propietario el 2026-11-13 e integrada en `main`.

## Fase 1 — avance

| Bloque del plan | Estado |
|---|---|
| 1. Monorepo (npm workspaces, TypeScript 6.0.3, ESLint, Prettier, Vitest) | ✅ Base creada; `apps/` y los demás paquetes se crean en sus bloques |
| 4. `core`: `Money`, `Result`, `UtcInstant` | ✅ 70 pruebas en verde (`testing/fase-1.md`) |
| 8. `design-system` | ✅ Tokens (TypeScript como fuente única y `tokens.css` generado), fuente local, estilos base y componentes: `TavelyoButton`, `TextField`, `StatusChip`, `Card`, `ConfirmDialog`, avisos de conexión y de nueva versión, estados de carga/error/vacío. 38 pares de contraste comprobados en las pruebas. Pendiente: catálogo visual (con las apps) y verificación en navegador real (Playwright) |
| 10. Logotipo | ✅ Propuesta A aprobada; maestro v1.0.0, variantes y PNG en `assets/branding/` (`brand/asset-manifest.md`). Pendiente: favicon simplificado de 16 px (requiere aprobación) |
| 2, 3, 5, 6, 7, 9 | ⏳ Entornos, CI, esquema inicial, autenticación y selector de empresa, autorización, PWA base |

## Fase 0 — resumen de cierre

| Entregable | Archivo | Estado |
|---|---|---|
| Instrucciones permanentes | `CLAUDE.md` | ✅ Adaptado a web/PWA |
| Documentos de origen | `docs/PROMPT_MAESTRO.md`, `docs/IDENTIDAD_VISUAL.md` | ✅ Copias idénticas, sin editar (desviación registrada en ADR-0009) |
| Requisitos, supuestos y decisiones | `docs/requirements.md` | ✅ |
| Arquitectura | `docs/architecture/` (visión general, modelo de datos, permisos, amenazas, estados) | ✅ Adaptada a PWA |
| Resultado del spike D-13 | `docs/architecture/spike-sql-connect.md` | ✅ Cerrado; el código desechable queda en la rama `spike/sql-connect` |
| Decisiones (ADR 0001–0010) | `docs/decisions/` | ✅ 0003, 0005–0010 aceptadas (0006 con proveedor pendiente, D-02); 0001, 0002 y 0004 reemplazadas |
| Marca | `docs/brand/` | ✅ Manifiesto, matriz de contraste y revisión de referencias |
| Estrategia y verificación de pruebas | `docs/testing/` | ✅ Re-verificado al cierre: documentos de origen intactos, 17 enlaces sin roturas, 10 ADR indexadas, 16 decisiones definidas |
| Plan de Fase 1 | `docs/plans/fase-1.md` | ✅ Autorizado |

Hitos de la fase: cambio de plataforma a PWA con React + Vite + TypeScript (ADR-0009); spike de SQL Connect con autorización 23/23, credenciales de servidor 9/9 y tiempo real verificado con el SDK web.

## Decisiones resueltas (2026-11-13)

D-07 Cloud Functions con TypeScript · D-12 (fuente) Plus Jakarta Sans, OFL 1.1 · **D-12 (logotipo) propuesta A aprobada** · D-13 spike ejecutado · **D-14 PWA con React + Vite + TypeScript, dos aplicaciones** · **D-15 navegadores:** Chrome (Android), Safari (iOS/iPadOS), Chrome/Edge y Safari de escritorio · **D-16 stack web (ADR-0010)** con Prettier.

## Pendiente

- **Favicon de 16 px:** aprobar una variante simplificada del isotipo (las curvas no se distinguen a ese tamaño).
- Validación de formularios en el cliente (pendiente dentro de ADR-0010; se decide en Fase 1 si hace falta).
- Decisiones de negocio D-01, D-02, D-04 a D-06 y D-09 a D-11 (`requirements.md` §6). No bloquean la Fase 1.

## Bloqueos

- Ninguno. El proyecto de Firebase de desarrollo (`tavelyo-e2b57`) existe; las pruebas siguen en emuladores. Activar Cloud SQL o el plan Blaze, registrar apps web y desplegar requieren autorización expresa del propietario.
