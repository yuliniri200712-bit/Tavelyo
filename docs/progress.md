# Progreso del proyecto

Última actualización: 2026-11-14

## Fase actual

**Fase 1 — Base.** Autorizada por el propietario el 2026-11-13. Rama: `fase-1-base`. Plan: [`plans/fase-1.md`](plans/fase-1.md).

**Fase 0 — Análisis: cerrada** con aprobación del propietario el 2026-11-13 e integrada en `main`.

## Fase 1 — avance

| Bloque del plan | Estado |
|---|---|
| 1. Monorepo (npm workspaces, TypeScript 6.0.3, ESLint, Prettier, Vitest) | ✅ `apps/menu-web`, `apps/operations`, `packages/core`, `packages/design-system`, `packages/pwa-shell`. `contracts`, `data-access` y `features/*` se crean con los bloques 5–7 |
| 4. `core`: `Money`, `Result`, `UtcInstant` | ✅ 70 pruebas en verde (`testing/fase-1.md`) |
| 8. `design-system` | ✅ Tokens (TypeScript como fuente única y `tokens.css` generado), fuente local, estilos base y componentes: `TavelyoButton`, `TextField`, `StatusChip`, `Card`, `ConfirmDialog`, avisos de conexión y de nueva versión, estados de carga/error/vacío. 38 pares de contraste comprobados en las pruebas. Pendiente: catálogo visual (con las apps) y verificación en navegador real (Playwright) |
| 10. Logotipo | ✅ Propuesta A aprobada; maestro v1.0.0, variantes y PNG en `assets/branding/` (`brand/asset-manifest.md`). El propietario conserva el favicon actual en todos los tamaños (2026-11-14) |
| 9. PWA base | 🔄 Las dos apps compilan como PWA: manifiesto con iconos del logotipo, *service worker* que solo precachea el build (sin `runtimeCaching`), actualización a elección de la persona, aviso sin conexión, enlace para saltar al contenido y catálogo en `operations` (`/catalogo`). Playwright en 5 navegadores de D-15: 71 superadas y 4 omitidas (Tab en Safari), incluido axe sin infracciones. Pendiente: prueba de actualización entre dos builds e instalación en dispositivos reales |
| 2. Entornos | ✅ `.firebaserc` con `demo-tavelyo` por defecto y `tavelyo-e2b57` como `dev`; `.env.example` sin secretos; `parseFirebaseEnvironment` valida la configuración al arrancar (`architecture/entornos.md`) |
| 5. Esquema inicial | ✅ `Tenant`, `Branch`, `UserProfile`, `Role`, `Permission`, `RolePermission`, `Membership`, `MembershipBranch`, `AuditEvent` con FK compuestas; catálogo de roles en `packages/contracts` sincronizado con `permissions.md` |
| 7. Autorización (conectores y backend) | ✅ Conector `tavelyo` con 11 operaciones bajo el patrón de ADR-0008; reglas de los `.gql` en CI y 33 pruebas de integración con dos empresas e IDs alterados. ✅ Backend mínimo en `backend/` (Cloud Functions con TypeScript, `firebase-functions` 7.4.0 y `firebase-admin` 14.5.0, aprobados el 2026-11-14): `revokeMember` revoca suplantando a quien llama y cierra las sesiones si no le quedan membresías; `provisionTenant` crea empresa, sucursal y propietario, solo para el operador de plataforma. 39 pruebas unitarias y 23 de integración contra el emulador de Functions. Solo emuladores: sin despliegue |
| 6. Autenticación y contexto | ✅ Acceso con correo y contraseña (D-17), recuperación sin revelar si el correo existe, perfil mínimo, selector de empresa y sucursal, cambio de contexto que desmonta todo lo anterior, cierre de sesión siempre visible. Paquetes `features/identity` y `features/tenancy`; pasarelas en `data-access` con el SDK generado y sin caché de datos |
| 3. CI | ✅ GitHub Actions (D-18), `.github/workflows/ci.yml`: formato, ESLint, tipos, unitarias, `npm audit`, esquema y SDK generado al día, compilación de las dos PWA, búsqueda de secretos (`npm run check:secrets`), integración con emuladores y Playwright (matriz D-15 y recorrido del personal). ✅ En verde en GitHub (ejecución #3, commit `41089aa`, 2026-11-14): calidad 1 min, integración 1 min, Playwright 4,5 min. ✅ Con el backend: ejecución #5 (commit `81ddaf6`, 2026-11-14): calidad 55 s, integración de conectores y backend 1 min 52 s, Playwright 3 min 31 s |

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

- Fase 1: bloqueo por inactividad en dispositivos compartidos; prueba de actualización de la PWA entre dos builds; instalación en dispositivos reales y revisión con lector de pantalla.
- Antes del primer despliegue (requiere autorización): verificar IAM de `executeGraphql`/suplantación en `tavelyo-e2b57`, sembrar el catálogo de roles y permisos en el entorno real (hoy solo lo hacen las pruebas), herramienta para conceder la afirmación `platform_operator` y empaquetado del backend para Cloud Build.
- Validación de formularios en el cliente (pendiente dentro de ADR-0010; se decide en Fase 1 si hace falta).
- Decisiones de negocio D-01, D-02, D-04 a D-06 y D-09 a D-11 (`requirements.md` §6). No bloquean la Fase 1.

## Bloqueos

- Ninguno. El proyecto de Firebase de desarrollo (`tavelyo-e2b57`) existe; las pruebas siguen en emuladores. Activar Cloud SQL o el plan Blaze, registrar apps web y desplegar requieren autorización expresa del propietario.
