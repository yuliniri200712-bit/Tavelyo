# Progreso del proyecto

Última actualización: 2026-11-13

## Fase actual

**Fase 1 — Base.** Autorizada por el propietario el 2026-11-13. Rama: `fase-1-base`. Plan: [`plans/fase-1.md`](plans/fase-1.md).

**Fase 0 — Análisis: cerrada** con aprobación del propietario el 2026-11-13 e integrada en `main`.

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

D-07 Cloud Functions con TypeScript · D-12 (fuente) Plus Jakarta Sans, OFL 1.1 · D-13 spike ejecutado · **D-14 PWA con React + Vite + TypeScript, dos aplicaciones** · **D-15 navegadores:** Chrome (Android), Safari (iOS/iPadOS), Chrome/Edge y Safari de escritorio · **D-16 stack web (ADR-0010)** con Prettier.

## Pendiente

- **Logotipo (D-12):** encargado a Claude; propuesta vectorial para aprobación del propietario.
- Validación de formularios en el cliente (pendiente dentro de ADR-0010; se decide en Fase 1 si hace falta).
- Decisiones de negocio D-01, D-02, D-04 a D-06 y D-09 a D-11 (`requirements.md` §6). No bloquean la Fase 1.

## Bloqueos

- Proyectos de Firebase de desarrollo y pruebas (los crea el propietario): hasta entonces, la Fase 1 se desarrolla y prueba con emuladores locales; el despliegue y la verificación de IAM quedan pendientes.
