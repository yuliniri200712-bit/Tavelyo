# Progreso del proyecto

Última actualización: 2026-11-14

## Fase actual

**Fase 2 — Salón y carta.** Autorizada por el propietario el 2026-11-14. Rama: `fase-2-salon-carta`. Plan: [`plans/fase-2.md`](plans/fase-2.md). Decisiones: D-01b, D-21, D-22, D-06 (carrito) y ADR-0011.

| Bloque del plan | Estado |
|---|---|
| 1. Decisiones, ADR-0011 y esquema | ✅ ADR-0011 aceptada y **verificada en el emulador** (6 pruebas de capacidades: carta `PUBLIC` sin sesión y nada con un QR inventado; un cliente anónimo no alcanza operaciones `USER`; `NO_ACCESS` rechaza a cliente, personal y anónimo y solo lo ejecuta el Admin SDK; una sola sesión abierta por mesa; participante vencido o de una sesión cerrada sin acceso; la sesión siguiente queda aislada). Esquema de salón, carta y resumen de pedido. Reglas de conectores ampliadas con listas blancas para `PUBLIC`, `USER_ANON` y `NO_ACCESS` |
| 2. Conectores y autorización | ✅ 25 operaciones nuevas en `salon.gql`, `mesas.gql`, `carta.gql` y `sucursales.gql` (permisos en `architecture/permissions.md` §5). La rotación del QR y la expulsión de participantes quedan resueltas en el conector, sin backend. La carta pública se oculta con la mesa o el sector archivados, la sucursal archivada o la empresa suspendida. 25 pruebas de integración con dos empresas, IDs alterados, sucursal no asignada, archivado, validación de datos, QR rotado, expulsión, sesión cerrada y auditoría. Hallazgo: una variable omitida en un filtro lo anula, y una regla nueva de CI lo impide (ADR-0008). `npm run check`: 364 pruebas; integración: 93 |
| 3. Backend | ✅ `joinTableSession` (mesa abierta por el mesero, participación de 4 horas, máximo 20 por mesa, sin reingreso del expulsado), `quoteOrder` (revalida todo y calcula con `Money`; solo guarda el resumen si el total coincide y ningún precio cambió, con idempotencia y huella SHA-256) y `authorizeQuote` con el **adaptador de pago simulado**, que se niega a arrancar fuera de un proyecto `demo-*`. Contrato `PaymentGateway` y API del cliente en `packages/contracts`; impuesto contenido (half-up por línea), formato `es-CO` y horario semanal en `packages/core`. Límites de solicitudes contados en la base. Pruebas: `npm run check` 433; integración 109 (`testing/fase-2.md`) |
| 4. Operaciones, administración | ✅ **4a ✅ Sectores, mesas y QR** (`packages/features/floor`): crear, editar, archivar y restaurar sectores y mesas; ver el QR de cada mesa (SVG propio con `qrcode-generator` 2.0.4) y renovarlo con confirmación; hoja imprimible solo con las mesas activas. El inicio muestra los módulos según los permisos del rol (solo interfaz; el servidor decide). Los mensajes de las reglas `@check` se muestran tal cual; cualquier otro error de la base, no. Nuevos en `design-system`: `SelectField`, `TextAreaField`, listas, barra de acciones, QR y estilos de impresión. **4b ✅ Carta** (`packages/features/catalog`): «Carta de la empresa» con impuestos (tasa en %, `tenant.settings`), categorías, productos con descripción y alérgenos declarados, y grupos de opciones con mínimo, máximo y valor adicional en pesos; solo el propietario la edita y el resto la consulta. «Carta de la sucursal»: disponibilidad, horario semanal (también cruzando la medianoche) y precio en pesos con confirmación del importe anterior y el nuevo. `core`: `parseMajorAmount` y `toMajorInput` (pesos ↔ unidades menores, sin `number`). **4c ✅ Sucursales** (en `packages/features/tenancy`): el propietario las lista (archivadas incluidas, consulta nueva `TenantBranches`), crea, edita, archiva con confirmación y restaura; la sucursal en uso no se archiva desde ahí, y tras cada cambio se actualiza la lista del contexto sin sacar a la persona de la pantalla. El gancho `useServerData` pasa a `design-system` y lo comparten salón, carta y sucursales. El SDK generado se actualizó a mano siguiendo el formato del generador (la CLI también está bloqueada en el equipo local); CI lo verifica contra el generador real y, si difiere, publica la diferencia como anotación. **Bloque 4 terminado.** ⚠️ La prueba desde el celular queda pendiente: el propietario decidió no instalar Node en WSL y Windows bloquea el emulador de SQL Connect (Control inteligente de aplicaciones); las pruebas con emuladores corren en CI |

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
