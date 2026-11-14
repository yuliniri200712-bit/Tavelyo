# Progreso del proyecto

Última actualización: 2026-11-14

## Fase actual

**Fase 2 — Salón y carta: plan propuesto** (2026-11-14), pendiente de aprobación: [`plans/fase-2.md`](plans/fase-2.md). Decisiones tomadas para el plan: D-01b, D-21, D-22 y D-06 (carrito). No se implementa nada hasta aprobar el plan.

**Fase 1 — Base: cerrada** con aprobación del propietario el 2026-11-14 e integrada en `main` (rama `fase-1-base`, plan [`plans/fase-1.md`](plans/fase-1.md)). Queda pendiente, sin bloquear, la revisión en un iPhone (instalación y VoiceOver).

**Fase 0 — Análisis: cerrada** con aprobación del propietario el 2026-11-13 e integrada en `main`.

## Fase 1 — avance

| Bloque del plan | Estado |
|---|---|
| 1. Monorepo (npm workspaces, TypeScript 6.0.3, ESLint, Prettier, Vitest) | ✅ `apps/menu-web`, `apps/operations`, `packages/core`, `packages/design-system`, `packages/pwa-shell`. `contracts`, `data-access` y `features/*` se crean con los bloques 5–7 |
| 4. `core`: `Money`, `Result`, `UtcInstant` | ✅ 70 pruebas en verde (`testing/fase-1.md`) |
| 8. `design-system` | ✅ Tokens (TypeScript como fuente única y `tokens.css` generado), fuente local, estilos base y componentes: `TavelyoButton`, `TextField`, `StatusChip`, `Card`, `ConfirmDialog`, avisos de conexión y de nueva versión, estados de carga/error/vacío. 38 pares de contraste comprobados en las pruebas. Pendiente: catálogo visual (con las apps) y verificación en navegador real (Playwright) |
| 10. Logotipo | ✅ Propuesta A aprobada; maestro v1.0.0, variantes y PNG en `assets/branding/` (`brand/asset-manifest.md`). El propietario conserva el favicon actual en todos los tamaños (2026-11-14) |
| 9. PWA base | 🔄 Las dos apps compilan como PWA: manifiesto con iconos del logotipo, *service worker* que solo precachea el build (sin `runtimeCaching`), actualización a elección de la persona, aviso sin conexión, enlace para saltar al contenido y catálogo en `operations` (`/catalogo`). Playwright en 5 navegadores de D-15: 81 superadas y 4 omitidas (Tab en Safari), incluido axe sin infracciones. ✅ Actualización entre dos builds reales (2026-11-14): la versión nueva se avisa, no se aplica sola, «Actualizar» la instala y «Más tarde» la deja en espera, en los 5 navegadores. Cada build lleva su versión en `<meta name="tavelyo-build">` (`TAVELYO_BUILD_ID`). ✅ Dispositivo real (2026-11-14, Motorola edge 50 fusion, Android 16, Chrome 157): las dos PWA instaladas como WebAPK, sin conexión, actualización, TalkBack y cierre por inactividad (`testing/fase-1.md`). Pendiente: iPhone (instalación y VoiceOver) |
| 2. Entornos | ✅ `.firebaserc` con `demo-tavelyo` por defecto y `tavelyo-e2b57` como `dev`; `.env.example` sin secretos; `parseFirebaseEnvironment` valida la configuración al arrancar (`architecture/entornos.md`) |
| 5. Esquema inicial | ✅ `Tenant`, `Branch`, `UserProfile`, `Role`, `Permission`, `RolePermission`, `Membership`, `MembershipBranch`, `AuditEvent` con FK compuestas; catálogo de roles en `packages/contracts` sincronizado con `permissions.md` |
| 7. Autorización (conectores y backend) | ✅ Conector `tavelyo` con 11 operaciones bajo el patrón de ADR-0008; reglas de los `.gql` en CI y 33 pruebas de integración con dos empresas e IDs alterados. ✅ Backend mínimo en `backend/` (Cloud Functions con TypeScript, `firebase-functions` 7.4.0 y `firebase-admin` 14.5.0, aprobados el 2026-11-14): `revokeMember` revoca suplantando a quien llama y cierra las sesiones si no le quedan membresías; `provisionTenant` crea empresa, sucursal y propietario, solo para el operador de plataforma. 39 pruebas unitarias y 23 de integración contra el emulador de Functions. Solo emuladores: sin despliegue |
| 6. Autenticación y contexto | ✅ Acceso con correo y contraseña (D-17), recuperación sin revelar si el correo existe, perfil mínimo, selector de empresa y sucursal, cambio de contexto que desmonta todo lo anterior, cierre de sesión siempre visible. Paquetes `features/identity` y `features/tenancy`; pasarelas en `data-access` con el SDK generado y sin caché de datos. ✅ Política de equipos compartidos (2026-11-14): cierre por inactividad a los 15 minutos con aviso (D-19) y casilla «Equipo compartido» con sesión por pestaña (D-20), probados en Chrome y Safari de iPhone contra los emuladores |
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

- iPhone: instalación de las dos PWA y revisión con VoiceOver cuando el propietario tenga uno a mano (pendiente de la Fase 1, aprobado como no bloqueante).
- Fases con cobros o comandas: decidir cómo se comporta el cierre por inactividad a mitad de una operación (hoy no hay ninguna) y si las pantallas de cocina quedan exentas.
- Antes del primer despliegue (requiere autorización): verificar IAM de `executeGraphql`/suplantación en `tavelyo-e2b57`, sembrar el catálogo de roles y permisos en el entorno real (hoy solo lo hacen las pruebas), herramienta para conceder la afirmación `platform_operator` y empaquetado del backend para Cloud Build.
- Validación de formularios en el cliente (pendiente dentro de ADR-0010; se decide en Fase 1 si hace falta).
- Decisiones de negocio: D-01 resuelta en parte (Colombia, COP; falta D-01b, impuestos), D-02 (pasarela: el propietario busca proveedor), D-04 a D-06 y D-09 a D-11 (`requirements.md` §6).

## Bloqueos

- Ninguno. El proyecto de Firebase de desarrollo (`tavelyo-e2b57`) existe; las pruebas siguen en emuladores. Activar Cloud SQL o el plan Blaze, registrar apps web y desplegar requieren autorización expresa del propietario.
