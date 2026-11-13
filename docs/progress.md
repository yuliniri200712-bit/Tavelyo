# Progreso del proyecto

Última actualización: 2026-11-13

## Fase actual

**Fase 0 — Análisis.** Autorizada por el propietario el 2026-11-13. Estado: **entregables documentales completos y confirmados en git**; ADR-0001 aprobada; ADR-0007 y ADR-0008 se deciden con el resultado del spike. No hay código de producto ni infraestructura desplegada.

## Estado del repositorio

| Elemento | Estado |
|---|---|
| Rama de trabajo | `fase-0-arquitectura` |
| Commits | `Initial commit` (README) y commit de documentación de Fase 0 en `fase-0-arquitectura` (no integrado en `main`) |
| Código, dependencias, pruebas, CI | No existen |
| Herramientas locales detectadas | Flutter 3.47.7 (Dart 3.13.5), Firebase CLI 15.30.2, Node.js |

## Fase 0 — entregables

| Entregable | Archivo | Estado |
|---|---|---|
| Instrucciones permanentes | `CLAUDE.md` | ✅ Actualizado con precedencia, capas, tecnologías, marca y ubicación de docs |
| Documentos de origen | `docs/PROMPT_MAESTRO.md`, `docs/IDENTIDAD_VISUAL.md` | ✅ Copias idénticas |
| Requisitos, supuestos y decisiones | `docs/requirements.md` | ✅ Borrador |
| Arquitectura | `docs/architecture/overview.md` | ✅ Propuesta |
| ERD y diccionario | `docs/architecture/data-model.md` | ✅ Borrador |
| Matriz de permisos | `docs/architecture/permissions.md` | ✅ Borrador |
| Modelo de amenazas | `docs/architecture/threat-model.md` | ✅ Borrador |
| Estados y flujos | `docs/architecture/state-machines.md` | ✅ Borrador |
| Decisiones (ADR 0001–0008) | `docs/decisions/` | ✅ 6 aceptadas (0001–0006), 2 propuestas pendientes del spike (0007, 0008) |
| Marca | `docs/brand/` | ✅ Manifiesto, matriz de contraste y revisión de referencias |
| Estrategia de pruebas | `docs/testing/strategy.md` | ✅ |
| Verificación de Fase 0 | `docs/testing/fase-0-verificacion.md` | ✅ |
| Plan de Fase 1 | `docs/plans/fase-1.md` | ✅ Propuesta, no autorizada |
| Plan del spike SQL Connect | `docs/plans/spike-sql-connect.md` | ✅ Autorizado, pendiente de ejecutar |

## Decisiones resueltas (2026-11-13)

D-03 web y Android · D-07 Cloud Functions con TypeScript · D-08 Riverpod + go_router · D-13 spike autorizado · ADR-0001 (monorepo con *pub workspaces*) aprobada.

## Pendiente

- Aprobación del resto de entregables de Fase 0 por el propietario; ADR-0007 y ADR-0008 tras el spike.
- Decisiones D-01, D-02, D-04 a D-06 y D-09 a D-12 (`requirements.md` §6).
- Spike de SQL Connect en rama `spike/sql-connect`: en curso (ver esa rama).
- Integración de `fase-0-arquitectura` en `main`: requiere aprobación del propietario.

## Bloqueos

- Fase 1 depende de D-12, del resultado del spike (D-13) y de proyectos Firebase de desarrollo/pruebas creados por el propietario.
