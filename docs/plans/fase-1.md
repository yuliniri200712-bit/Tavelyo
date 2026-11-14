# Plan de Fase 1 — Base

Estado: **cerrada** con aprobación del propietario el 2026-11-14 e integrada en `main` (autorizada el 2026-11-13). Rama de trabajo: `fase-1-base`. Resultados: `progress.md` y `testing/fase-1.md`. Pendiente no bloqueante: revisión en iPhone.

## 1. Objetivo

Dejar la base técnica sobre la que se construyen las demás fases: estructura del repositorio, entornos, CI, autenticación, aislamiento multiempresa y sistema visual base. Sin funciones de negocio (carta, pedidos, pagos).

## 2. Requisitos previos

| Requisito | Motivo |
|---|---|
| ✅ D-14 Plataforma: PWA con React + Vite + TypeScript, dos aplicaciones (ADR-0009) | Estructura de `apps/` y CI |
| ✅ D-15 Navegadores: Chrome (Android), Safari (iOS/iPadOS), Chrome/Edge y Safari de escritorio | Matriz de pruebas de Playwright |
| ✅ D-07 Backend: Cloud Functions con TypeScript (ADR-0003) | Estructura de `backend/` |
| ✅ D-16 Bibliotecas web y alojamiento (ADR-0010) | Dependencias de las apps y despliegue |
| ✅ D-13 Spike de SQL Connect: ejecutado; ADR-0007 y ADR-0008 aceptadas | Patrón de autorización y tiempo real del esquema |
| ✅ Proyecto de Firebase de desarrollo creado por el propietario: `tavelyo-e2b57` (alias `dev`) | Las pruebas automatizadas usan emuladores con un proyecto `demo-tavelyo` (sin acceso a la nube). No se despliega ni se activan servicios facturables (Cloud SQL, plan Blaze) sin autorización expresa; el proyecto de producción se crea más adelante |
| ✅ D-12 Plus Jakarta Sans confirmada (OFL 1.1) · ✅ logotipo aprobado (propuesta A, maestro v1.0.0) | Servir la fuente desde la propia app; iconos de las PWA |

## 3. Alcance

1. Monorepo según ADR-0009 y ADR-0010 con `apps/menu-web`, `apps/operations`, `packages/core`, `packages/contracts`, `packages/design-system`, `packages/data-access`, `packages/features/identity`, `packages/features/tenancy`.
2. Configuración de entornos (desarrollo y pruebas) sin secretos en el repositorio; `.env.example` con nombres ficticios.
3. CI: formato, análisis estático (`tsc --noEmit` y linter), pruebas, validación del esquema SQL Connect, búsqueda de secretos, compilación de las dos PWA y auditoría de PWA (manifiesto, *service worker*, instalación).
4. `core`: `Money` (ADR-0005), `Result`/fallas, utilidades de fecha UTC.
5. Esquema inicial: `Tenant`, `Branch`, `UserProfile`, `Membership`, `MembershipBranch`, `Role`, `Permission`, `AuditEvent`.
6. Autenticación del personal (Firebase Auth), selector de empresa y sucursal, cambio de contexto con limpieza de estado, cierre de sesión visible.
7. Autorización según ADR-0008 en conectores y backend.
8. `design-system`: tokens de marca, funcionales y semánticos como propiedades CSS y TypeScript; tema claro; Plus Jakarta Sans servida localmente; componentes React base (`TavelyoButton`, campo, chip de estado, tarjeta, diálogo de confirmación, aviso de conexión, estados de carga/error/vacío) y catálogo visual.
9. PWA base de ambas aplicaciones: manifiesto, iconos derivados del logotipo aprobado, *service worker* que cachea solo recursos estáticos, aviso de nueva versión y aviso de conexión.
10. Logotipo: maestro y variantes aprobados (propuesta A) en `assets/branding/`, usados en cabeceras e iconos.

**Fuera de alcance:** carta, mesas, pedidos, cocina, pagos, inventario, reportes, modo oscuro, despliegue a producción.

## 4. Archivos y áreas afectadas

`apps/`, `packages/core`, `packages/contracts`, `packages/design-system`, `packages/data-access`, `packages/features/identity`, `packages/features/tenancy`, `dataconnect/`, `backend/`, configuración de CI, `package.json` raíz con npm workspaces, `docs/` (progreso, pruebas, decisiones).

## 5. Pruebas

- Unitarias: `Money` (aritmética, monedas distintas, reparto exacto), permisos y jerarquía de roles.
- Componentes (Vitest + Testing Library): cada componente base en todos sus estados; foco visible; tamaños táctiles ≥ 48 × 48 px CSS.
- PWA (Playwright): instalación, arranque sin conexión con aviso visible, actualización controlada; el *service worker* no cachea respuestas de datos.
- Integración (emuladores): autenticación, membresías, autorización de conectores y backend.
- Seguridad: casos 1 y 2 de PM §12.
- Accesibilidad: contraste de cada par usado (actualizar `brand/contrast-matrix.md`), lector de pantalla y texto al 200 % en el catálogo.

## 6. Criterios de aceptación

1. **Dos empresas de prueba no pueden leer ni escribir datos de la otra**, comprobado por pruebas automatizadas en conectores y backend, incluyendo IDs alterados.
2. Una membresía revocada o degradada es rechazada en la siguiente operación privilegiada.
3. Cambiar de empresa limpia estado, cachés y selección de sucursal.
4. Navegación y componentes base accesibles: contraste AA medido, foco visible, nombres accesibles, texto al 200 % sin recortes.
5. Ningún color, tamaño ni tipografía definido fuera de `design-system`.
6. Las dos PWA son instalables y funcionan en los navegadores de D-15; sin conexión no muestran datos como confirmados.
7. CI en verde con todos los comandos registrados; sin secretos en el repositorio ni en el código que llega al navegador.
8. Documentación actualizada: progreso, pruebas ejecutadas con resultados reales y ADR aceptados.

## 7. Riesgos

- El spike puede mostrar que SQL Connect no expresa la autorización necesaria → más lógica en el backend (ADR-0008).
- Retrasos en la creación de proyectos Firebase por el propietario bloquean las pruebas de integración.
