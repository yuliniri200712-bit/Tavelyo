# Plan de Fase 1 — Base

Estado: **propuesta para revisión. No autorizada.** No se inicia sin aprobación expresa del propietario.

## 1. Objetivo

Dejar la base técnica sobre la que se construyen las demás fases: estructura del repositorio, entornos, CI, autenticación, aislamiento multiempresa y sistema visual base. Sin funciones de negocio (carta, pedidos, pagos).

## 2. Requisitos previos

| Requisito | Motivo |
|---|---|
| ✅ D-03 Plataformas: web y Android | Objetivos de compilación y CI |
| ✅ D-07 Backend: Cloud Functions con TypeScript (ADR-0003) | Estructura de `backend/` |
| ✅ D-08 Estado y navegación: Riverpod + go_router (ADR-0004) | Dependencias de las apps |
| ⏳ D-13 Spike de SQL Connect: autorizado, **pendiente de ejecutar** | Confirmar ADR-0007 y ADR-0008 antes de comprometer el esquema |
| Proyecto(s) de Firebase de desarrollo y pruebas creados por el propietario | No se crean recursos facturables sin autorización |
| D-12 Licencia de Plus Jakarta Sans | Empaquetar la fuente |

## 3. Alcance

1. Monorepo según ADR-0001 con `apps/client_web`, `apps/operations`, `packages/core`, `packages/design_system`, `packages/features/identity`, `packages/features/tenancy`.
2. Configuración de entornos (desarrollo y pruebas) sin secretos en el repositorio; `.env.example` con nombres ficticios.
3. CI: formato, análisis estático, pruebas, validación del esquema SQL Connect, búsqueda de secretos y compilación para web y Android (D-03).
4. `core`: `Money` (ADR-0005), `Result`/fallas, utilidades de fecha UTC.
5. Esquema inicial: `Tenant`, `Branch`, `UserProfile`, `Membership`, `MembershipBranch`, `Role`, `Permission`, `AuditEvent`.
6. Autenticación del personal (Firebase Auth), selector de empresa y sucursal, cambio de contexto con limpieza de estado, cierre de sesión visible.
7. Autorización según ADR-0008 en conectores y backend.
8. `design_system`: tokens de marca, funcionales y semánticos; tema claro; Plus Jakarta Sans empaquetada; componentes base (`TavelyoButton`, campo, chip de estado, tarjeta, diálogo de confirmación, aviso de conexión, estados de carga/error/vacío) y catálogo visual.
9. Marcador textual «Tavelyo» en lugar del logo mientras falte el maestro.

**Fuera de alcance:** carta, mesas, pedidos, cocina, pagos, inventario, reportes, modo oscuro, despliegue a producción.

## 4. Archivos y áreas afectadas

`apps/`, `packages/core`, `packages/design_system`, `packages/features/identity`, `packages/features/tenancy`, `dataconnect/`, `backend/`, configuración de CI, `pubspec.yaml` del workspace, `docs/` (progreso, pruebas, decisiones).

## 5. Pruebas

- Unitarias: `Money` (aritmética, monedas distintas, reparto exacto), permisos y jerarquía de roles.
- Widgets: cada componente base en todos sus estados; foco visible; tamaños táctiles ≥ 48.
- Integración (emuladores): autenticación, membresías, autorización de conectores y backend.
- Seguridad: casos 1 y 2 de PM §12.
- Accesibilidad: contraste de cada par usado (actualizar `brand/contrast-matrix.md`), lector de pantalla y texto al 200 % en el catálogo.

## 6. Criterios de aceptación

1. **Dos empresas de prueba no pueden leer ni escribir datos de la otra**, comprobado por pruebas automatizadas en conectores y backend, incluyendo IDs alterados.
2. Una membresía revocada o degradada es rechazada en la siguiente operación privilegiada.
3. Cambiar de empresa limpia estado, cachés y selección de sucursal.
4. Navegación y componentes base accesibles: contraste AA medido, foco visible, nombres accesibles, texto al 200 % sin recortes.
5. Ningún color, tamaño ni tipografía definido fuera de `design_system`.
6. CI en verde con todos los comandos registrados; sin secretos en el repositorio.
7. Documentación actualizada: progreso, pruebas ejecutadas con resultados reales y ADR aceptados.

## 7. Riesgos

- El spike puede mostrar que SQL Connect no expresa la autorización necesaria → más lógica en el backend (ADR-0008).
- Retrasos en la creación de proyectos Firebase por el propietario bloquean las pruebas de integración.
