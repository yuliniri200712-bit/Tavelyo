# ADR-0001 — Estructura del repositorio: monorepo con *pub workspaces*

**Estado:** Reemplazada por 0009 (la herramienta *pub workspaces* deja de aplicar; el principio de monorepo se mantiene y su herramienta se propone en ADR-0010) · **Fecha:** 2026-11-13 · Aprobada por el propietario el 2026-11-13

## Contexto

Tavelyo tiene varias experiencias que comparten dominio, sistema de diseño y acceso a datos. Se requiere modularidad por funcionalidad y evitar duplicaciones (CLAUDE.md §3, §6; PM §4).

## Opciones

| Opción | Ventajas | Inconvenientes |
|---|---|---|
| A. Monorepo con *pub workspaces* nativos de Dart | Sin herramienta extra; una resolución de dependencias compartida; soportado por el SDK | Scripts multi-paquete se escriben a mano o en CI |
| B. Monorepo con Melos | Scripts y versionado multi-paquete | Dependencia adicional que hay que aprobar y mantener |
| C. Una sola app con carpetas por feature | Más simple al inicio | Límites entre módulos no forzados por el compilador |

## Decisión

**Opción A**, con la estructura de `architecture/overview.md`. Los paquetes se crean solo cuando una fase los necesita. Melos se reevalúa si los scripts manuales se vuelven costosos.

## Consecuencias

- Los límites entre módulos los hace cumplir `pubspec.yaml` (un paquete no puede importar lo que no declara).
- CI ejecuta `dart format`, `dart analyze` y pruebas en todos los miembros del workspace.

## Verificación pendiente

Confirmar con el SDK instalado (Dart 3.13.5) la sintaxis vigente de `workspace:` y `resolution: workspace` en la documentación oficial antes de crearlo en Fase 1.
