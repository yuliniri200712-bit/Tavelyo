# Progreso del proyecto

Última actualización: 2026-11-13

## Fase actual

**Fase 0 — Análisis.** Autorizada por el propietario el 2026-11-13. Estado: **entregables documentales completos y adaptados a la plataforma web/PWA** (ADR-0009). Todas las ADR vigentes aceptadas (ADR-0005, 0007, 0008 y 0010 aprobadas el 2026-11-13 tras el spike). No hay código de producto ni infraestructura desplegada.

## Cambio de plataforma (2026-11-13)

Por decisión expresa del propietario, **no se usa Flutter**. Tavelyo será un sistema web instalable como PWA, con React + Vite + TypeScript y dos aplicaciones (`menu-web` y `operations`).

| Qué | Efecto |
|---|---|
| ADR-0009 | Nueva, **aceptada**. Incluye la tabla de equivalencias Flutter → web para leer los documentos de origen, que no se editan |
| ADR-0010 | Nueva, **aceptada** (formateador y validación de formularios pendientes): bibliotecas (React Router, SDK núcleo de SQL Connect con *hooks* propios, `vite-plugin-pwa`, Vitest, Playwright, ESLint), npm workspaces y Firebase Hosting |
| ADR-0001, 0002, 0004 | Reemplazadas por ADR-0009 |
| ADR-0003, 0005, 0006, 0007 | Referencias a Dart adaptadas a TypeScript/web, sin cambiar su decisión |
| `CLAUDE.md`, arquitectura, requisitos, plan de Fase 1, estrategia de pruebas, permisos, marca | Adaptados |
| D-03 y D-08 | Sustituidas por D-14; D-16 (stack web) resuelta; D-15 (navegadores) pendiente |
| Spike D-13 | Siguen válidos los resultados de servidor (autorización, revocación, atomicidad, FK compuestas, T10). Parte de cliente **repetida con el SDK web**: `Int64` exacto como cadena, tiempo real con aislamiento y errores entregados en `onErr` (ver `spike/sql-connect`) |

## Estado del repositorio

| Elemento | Estado |
|---|---|
| Rama de trabajo | `fase-0-arquitectura`; spike en `spike/sql-connect` |
| Commits | Documentación de Fase 0 en `fase-0-arquitectura` (no integrada en `main`) |
| Código, dependencias, pruebas, CI | No existen en el producto |
| Herramientas locales detectadas | Node.js 24.19.0, Firebase CLI 15.30.2, Chrome 157. Flutter 3.47.7 instalado, pero ya no se usa |

## Fase 0 — entregables

| Entregable | Archivo | Estado |
|---|---|---|
| Instrucciones permanentes | `CLAUDE.md` | ✅ Adaptado a web/PWA |
| Documentos de origen | `docs/PROMPT_MAESTRO.md`, `docs/IDENTIDAD_VISUAL.md` | ✅ Copias idénticas, sin editar (desviación registrada en ADR-0009) |
| Requisitos, supuestos y decisiones | `docs/requirements.md` | ✅ Borrador |
| Arquitectura | `docs/architecture/overview.md` | ✅ Propuesta, adaptada a PWA |
| ERD y diccionario | `docs/architecture/data-model.md` | ✅ Borrador |
| Matriz de permisos | `docs/architecture/permissions.md` | ✅ Borrador |
| Modelo de amenazas | `docs/architecture/threat-model.md` | ✅ Borrador |
| Estados y flujos | `docs/architecture/state-machines.md` | ✅ Borrador |
| Decisiones (ADR 0001–0010) | `docs/decisions/` | ✅ 0003, 0005, 0006, 0007, 0008, 0009 y 0010 aceptadas (0006 con proveedor pendiente, D-02); 0001, 0002 y 0004 reemplazadas |
| Marca | `docs/brand/` | ✅ Manifiesto, matriz de contraste y revisión de referencias |
| Estrategia de pruebas | `docs/testing/strategy.md` | ✅ Adaptada a herramientas web (ADR-0010) |
| Verificación de Fase 0 | `docs/testing/fase-0-verificacion.md` | ✅ |
| Plan de Fase 1 | `docs/plans/fase-1.md` | ✅ Propuesta adaptada a PWA, no autorizada |
| Plan del spike SQL Connect | `docs/plans/spike-sql-connect.md` | ✅ Ejecutado (cliente web); resultados y propuestas en `architecture/spike-sql-connect.md` de la rama `spike/sql-connect` |

## Decisiones resueltas (2026-11-13)

D-07 Cloud Functions con TypeScript · D-13 spike ejecutado · **D-14 PWA con React + Vite + TypeScript, dos aplicaciones** (sustituye a D-03 y D-08) · **D-16 stack web (ADR-0010)** · ADR-0005, 0007 y 0008 aprobadas tras el spike.

## Pendiente

- Elección de navegadores soportados (D-15).
- Formateador y validación de formularios (pendientes dentro de ADR-0010).
- Aprobación del resto de entregables de Fase 0 por el propietario.
- Decisiones D-01, D-02, D-04 a D-06 y D-09 a D-12 (`requirements.md` §6).
- Integración de `fase-0-arquitectura` en `main`: requiere aprobación del propietario.

## Bloqueos

- Fase 1 depende de D-12, D-15, de su autorización expresa y de proyectos Firebase de desarrollo/pruebas creados por el propietario.
