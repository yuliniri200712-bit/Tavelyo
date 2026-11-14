# Registro de pruebas — Fase 1

Rama: `fase-1-base`. Se registra cada ejecución con el comando, el resultado real y lo que no se pudo ejecutar.

## 2026-11-13 — Base del monorepo y `packages/core`

| Comprobación | Comando | Resultado |
|---|---|---|
| Formato | `npx prettier --check .` | ✅ Todos los archivos con el estilo de Prettier |
| Análisis estático | `npx eslint .` | ✅ Sin errores |
| Tipos | `npm run typecheck` (TypeScript 6.0.3 estricto, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) | ✅ Sin errores |
| Unitarias | `npx vitest run` | ✅ 3 archivos, **70 pruebas** |
| Límite entre paquetes | Archivo temporal que importa `@tavelyo/core/src/money` | ✅ ESLint lo rechaza (`no-restricted-imports`); archivo eliminado |

Cobertura funcional de `packages/core` (ADR-0005):

- `Money`: frontera `Int64` como cadena, incluido 2⁵³ + 1 sin pérdida; rechazo de cadenas no canónicas y de monedas no admitidas; aritmética inmutable; error al mezclar monedas; cantidades enteras seguras.
- Puntos básicos con los cuatro modos de redondeo, incluidas mitades exactas y negativos.
- Reparto: la suma de las partes es exactamente el total en 63 combinaciones de importes y pesos; residuo por mayor resto y luego por índice; signo conservado; pesos cero.
- `UtcInstant`: solo ISO 8601 con `Z`; rechaza fechas inexistentes (31 de febrero, 29 de febrero en año no bisiesto); compara por instante.

## 2026-11-13 — `packages/design-system`

| Comprobación | Comando | Resultado |
|---|---|---|
| Conjunto completo | `npm run check` (Prettier, ESLint, `tsc` de cada paquete, Vitest) | ✅ 6 archivos, **149 pruebas** (70 de `core` y 79 de `design-system`) |

Cobertura de `design-system`:

- Contraste: 38 pares realmente usados por los componentes, cada uno con su mínimo AA (4,5:1 texto; 3:1 bordes, foco y señales). La paleta oficial no cambia; el botón primario no usa el tomate de la marca como fondo de texto.
- `tokens.css` sincronizado con `tokens.ts`; tamaños tipográficos y táctiles en `rem` (respetan el zoom y el texto al 200 %).
- Sin valores sueltos: ningún HEX ni `px` en los componentes ni en sus estilos (criterio 5).
- Componentes con Testing Library en jsdom: nombres accesibles, variantes del botón, carga sin doble envío y con foco conservado, campo con etiqueta persistente, ayuda y error enlazados (`aria-describedby`, `aria-invalid`), chips con texto, tarjeta como región con nombre, diálogo (confirmar, cancelar, Escape bloqueado durante la operación, foco inicial en «Cancelar» si es destructivo), aviso sin conexión, aviso de nueva versión que no se aplica sin aceptación, estados de carga (`status`), error (`alert`) y vacío.

## 2026-11-13 — Apps y `packages/pwa-shell`

| Comprobación | Comando | Resultado |
|---|---|---|
| Conjunto completo | `npm run check` | ✅ 10 archivos, **163 pruebas** |
| Compilación | `npm run build -w @tavelyo/menu-web` y `-w @tavelyo/operations` (`tsc` + `vite build`) | ✅ Ambas; *service worker* `generateSW` con 22 entradas precacheadas |
| *Service worker* generado | Inspección de `dist/sw.js` | ✅ Solo `NavigationRoute` hacia `/index.html` con `/__/` excluido; ninguna estrategia de caché en tiempo de ejecución |
| Manifiesto generado | Inspección de `dist/manifest.webmanifest` e `index.html` | ✅ Nombre, `standalone`, `lang: es`, iconos any y maskable 192/512, `theme-color` desde el token, enlace al manifiesto inyectado |

Pruebas nuevas: configuración del *service worker* (sin `runtimeCaching`, solo extensiones estáticas, rutas `/__/` excluidas, actualización con aviso), manifiesto (iconos declarados existen con el tamaño real leído del PNG), marco común (logotipo con texto alternativo, salto al contenido, aviso sin conexión, aviso de nueva versión) y rutas de ambas apps (catálogo y página no encontrada).

## 2026-11-14 — Integración continua en GitHub Actions

| Ejecución | Commit | Resultado |
|---|---|---|
| #1 | `0acf725` | ⏹️ Cancelada a los 1 min 17 s por el envío siguiente (`concurrency` con `cancel-in-progress`); no es un fallo |
| #2 | `e4c8c19` | ✅ |
| #3 | `41089aa` | ✅ Los tres trabajos y todos sus pasos: `npm ci`, `npm run check`, `npm audit`, SDK generado al día, compilación de las dos PWA, búsqueda de secretos, `npm run test:integration`, instalación de Chromium, WebKit, Chrome y Edge en Linux, `npm run test:e2e` y `npm run test:e2e:emulators` |

Verificado con la API pública de GitHub (el repositorio es público desde el 2026-11-14).

## 2026-11-14 — Dispositivo real Android

Dispositivo del propietario: **Motorola edge 50 fusion, Android 16, Chrome 157.0.8103.48**. Conexión por cable USB con `adb reverse` (puertos 6173, 6174, 9099 y 9399): el teléfono ve las apps en `localhost`, que es un origen seguro, así que el *service worker* y la instalación funcionan sin publicar nada. Datos de prueba en los emuladores de Auth y SQL Connect del equipo (dos empresas; mesero en ambas). Builds de producción con `vite preview`.

| Bloque | Qué se hizo | Resultado |
|---|---|---|
| 1. Instalación de `operations` | Menú de Chrome → «Instalar app»; abrir desde el icono | ✅ Android generó una **WebAPK** (`org.chromium.webapk…`); icono del logotipo; se abre a pantalla completa (`display-mode: standalone` comprobado por depuración remota) |
| 2. Acceso y contexto | Mesero con «Equipo compartido» marcada; La Fonda → Centro; cambiar a El Puerto → Malecón; cerrar sesión | ✅ Según el propietario, «todo se ve perfecto y funciona perfecto»: teclado sin tapar campos, textos legibles y áreas táctiles cómodas |
| 3. Sin conexión | Se quitan los puertos del servidor y del emulador (`adb reverse --remove`) y se activa el modo avión; cerrar y reabrir la app | ✅ Arranca desde la caché con el aviso de sin conexión; no deja entrar |
| 4. Actualización | Se publica la versión `telefono-2` en el mismo origen; cerrar y reabrir; «Más tarde», reabrir y «Actualizar» | ✅ Aviso, «Más tarde» respetado y actualización al pulsar. Por depuración remota: versión `telefono-2`, controlada por el *service worker*, en modo app, sin aviso pendiente |
| 5. Lector de pantalla | TalkBack en la pantalla de acceso y en el selector de empresa | ✅ Según el propietario, «funciona a la perfección» (encabezado, campos con nombre, casilla con estado y ayuda, botones, error anunciado, opciones de empresa) |
| 6. Instalación de `menu-web` | Menú de Chrome → «Instalar app» | ✅ Segunda WebAPK instalada (comprobado con `adb`): las dos PWA se instalan |
| 7. Cierre por inactividad | Primer intento con 15 minutos reales; después, diagnóstico con una versión local de 2 minutos (aviso a los 90 s) y un monitor por depuración remota cada 5 s | ⚠️ En el primer intento el propietario no vio los avisos y la sesión seguía abierta, con actividad registrada 25 s antes de la inspección; no se pudo reconstruir qué pasó. ✅ Diagnóstico: con la pantalla encendida, aviso a los 94 s sin uso y cierre a los 120 s; con la pantalla apagada, Android congela la app (`freeze` al minuto) y al encenderla (`resume`) cierra la sesión al instante con el mensaje; al cerrar la app desde recientes con «Equipo compartido» marcada, pide entrar de nuevo |

Diagnóstico de inactividad: la versión de 2 minutos solo cambia los valores pasados a `InactivityGuard` (`policy`); se compiló sin guardar el cambio en el repositorio. La lógica es la misma que en producción y los 15 minutos están cubiertos por pruebas unitarias y por Playwright con reloj simulado. Con la pantalla apagada no se puede mostrar el aviso «¿Sigues ahí?»: Android congela la página; la sesión se cierra al volver. Recomendación: repetir una vez con 15 minutos reales cuando haya un entorno de desarrollo publicado.

Hallazgo de entorno: `vite preview` escuchaba solo en IPv6 (`::1`) y `adb reverse` conecta por IPv4, así que el primer intento dio `ERR_EMPTY_RESPONSE`. Se arrancó con `--host 127.0.0.1`. No afecta a la app ni a la CI.

Al terminar se quitaron los puertos (`adb reverse --remove-all`) y se detuvieron servidores y emuladores. Las apps instaladas apuntan a `localhost` y no funcionan sin el cable: se recomendó al propietario desinstalarlas.

Pendiente: VoiceOver e instalación en un iPhone (el propietario no tenía uno a mano).

## 2026-11-14 — Equipos compartidos, inactividad y actualización de la PWA

Decisiones del propietario: D-19 (cerrar la sesión tras 15 minutos sin uso, con aviso en el último minuto) y D-20 (casilla «Equipo compartido» marcada por defecto).

| Comprobación | Comando | Resultado |
|---|---|---|
| Unitarias y componentes | `npm run check` | ✅ 25 archivos, **333 pruebas** (antes 303). Nuevas: fases de inactividad en sus límites (14 min, 15 min, suspensión de horas), actividad compartida entre pestañas, `InactivityGuard` con reloj simulado (aviso con cuenta atrás, reinicio por interacción, durante el aviso solo cuenta «Seguir trabajando», actividad de otra pestaña, vuelta de suspensión, sesión recordada pero caducada, sin rastro tras cerrar sesión), `CheckboxField`, casilla y aviso en el acceso, `TAVELYO_BUILD_ID` validado (rechaza HTML) |
| Equipos compartidos e inactividad en navegador | `npm run test:e2e:emulators` (`e2e/emulators/shared-device.spec.ts`) | ✅ Chrome y Safari de iPhone: con la casilla marcada, recargar conserva la sesión y otra pestaña empieza sin ella; desmarcada, otra pestaña la comparte. Con el reloj de Playwright: aviso modal en el minuto 14 con foco en «Seguir trabajando» y axe sin infracciones; seguir reinicia el plazo; sin respuesta se cierra la sesión y el acceso lo explica |
| Actualización entre dos builds | `npm run test:e2e` (`e2e/pwa-update.spec.ts`) | ✅ 10/10 en los 5 navegadores: la versión B se avisa y no se aplica sola; «Actualizar» instala B; «Más tarde» mantiene A, también al recargar, y el aviso vuelve |
| Regresión | `npm run test:integration` · `npm run test:e2e` · `npm run test:e2e:emulators` | ✅ 62/62 · 81 superadas y 4 omitidas (Tab en Safari) · 6/6 |

Cómo se prueba la actualización: antes de las pruebas se compilan dos versiones de `operations` (`prueba-a` y `prueba-b`) fuera del repositorio. Un servidor estático propio (`e2e/support/static-server.ts`, sin dependencias) sirve A y, a mitad de la prueba, pasa a servir B en el mismo origen, como un despliegue.

Pruebas de mutación: si se ignora la casilla (sesión siempre recordada), falla la prueba de la pestaña; con `skipWaiting` y `clientsClaim` activados (actualización forzada), fallan las 2 de actualización. Se restauró el código.

Hallazgos durante el trabajo: la preparación global alteraba `process.env` mientras arrancaba el servidor de Playwright, así que cada versión se compila ahora en un proceso aparte; leer la versión con `evaluate` fallaba durante la recarga y se cambió por una aserción que reintenta; una barra invertida perdida al escribir el archivo dejó mal la expresión de `TAVELYO_BUILD_ID` y la detectaron las pruebas unitarias.

Pendiente: instalación en dispositivos reales y revisión con lector de pantalla.

## 2026-11-14 — Backend mínimo (Cloud Functions)

| Comprobación | Comando | Resultado |
|---|---|---|
| Conjunto completo | `npm run check` | ✅ 22 archivos, **303 pruebas** (39 nuevas del backend) |
| Integración | `npm run test:integration` (compila el backend y arranca Auth, SQL Connect y Functions) | ✅ 3 archivos, **62 pruebas**: 33 de conectores, 6 de pasarelas y **23 del backend** |
| Navegadores (regresión) | `npm run test:e2e` y `npm run test:e2e:emulators` | ✅ 71 superadas y 4 omitidas (Tab en Safari); recorrido del personal 2/2. Igual que antes |
| Auditoría y secretos | `npm audit` · `npm run check:secrets` (ahora también revisa `backend/lib`) | ✅ 0 vulnerabilidades · sin secretos |

Unitarias (`backend/src`, con dobles de prueba): validación de entrada (UUID con y sin guiones, uid, longitudes, campos no admitidos, inyección en IDs, moneda admitida y explícita, zona horaria IANA, correo); `revokeMember` no consulta otras empresas ni toca sesiones si el conector rechaza; `provisionTenant` comprueba al operador antes de validar o crear nada; regla de sesión revocada con precisión de segundos; los errores inesperados de SQL Connect se lanzan y no se disfrazan de rechazo.

Integración (`backend/tests/backend.int.test.ts`, funciones reales por HTTP con el protocolo callable):

| Caso | Resultado |
|---|---|
| Sin sesión, en las dos funciones | ✅ `UNAUTHENTICATED` |
| Entrada no válida (empresa que no es UUID, campos no admitidos, GraphQL en el uid) | ✅ `INVALID_ARGUMENT` |
| Propietario de B revoca a un miembro de A con el ID de A, con el de B o con uno inventado | ✅ `PERMISSION_DENIED`; la membresía sigue activa y la sesión intacta |
| Cajero (sin `staff.invite`), persona sin membresía y operador de plataforma revocan en A | ✅ Rechazados |
| Administrador revoca al propietario; propietario se revoca a sí mismo | ✅ Rechazados (rango) |
| Propietario revoca a un mesero solo de A | ✅ Membresía `REVOKED`, sesiones revocadas, su ID token vigente ya no ve la empresa y la auditoría tiene `membership.revoke` y `auth.sessions_revoked` |
| Administrador de sucursal revoca a un mesero | ✅ Permitido |
| Revocar a quien también es miembro de B | ✅ Conserva sesión y acceso solo a B |
| Revocar dos veces | ✅ La segunda es rechazada |
| Aprovisionar: propietario o usuario sin la afirmación; afirmación metida en un token (token personalizado) pero no guardada en la cuenta | ✅ Rechazados |
| Operador al que se retira la afirmación (mismo token) o con las sesiones revocadas | ✅ Rechazados de inmediato |
| Operador con moneda no admitida, sin zona horaria, correo no válido o estado elegido por el cliente | ✅ `INVALID_ARGUMENT` |
| Operador crea empresa con correo nuevo | ✅ Empresa, sucursal, membresía `tenant_owner` creada por el operador y auditoría `tenant.provision`; la propietaria define su contraseña con el restablecimiento, entra y solo ve su empresa; ni el operador ni A la ven |
| Operador crea empresa para una cuenta existente | ✅ La reutiliza y no cambia su nombre de perfil |

Pruebas de mutación: sin la suplantación en `revokeMember` (la mutación corre como administrador) fallan 4 pruebas; sin la comprobación de la afirmación del operador fallan 3. Se restauró el código y la suite volvió a 62/62.

Hallazgos y limitaciones:

- SQL Connect devuelve los UUID sin guiones; la primera ejecución falló (10 pruebas) porque la validación solo aceptaba la forma con guiones. Se aceptan las dos y el aprovisionamiento devuelve el formato de SQL Connect.
- El emulador de Auth (CLI 15.30) no aplica la revocación al canjear *refresh tokens* (`grantToken` no consulta `validSince`). La prueba verifica la revocación con `verifyIdToken(token, true)`, el criterio del Admin SDK en producción. En producción Firebase Auth rechaza el canje tras `revokeRefreshTokens`; se comprobará en el entorno real.
- El emulador no aplica IAM: queda pendiente verificar en `tavelyo-e2b57` quién puede invocar `executeGraphql` y la suplantación.
- Al apagar los emuladores aparece `ECONNRESET` del emulador de SQL Connect; el comando termina con código 0.

## 2026-11-13 — Búsqueda de secretos

`npm run check:secrets` (`tools/check-secrets`, sin dependencias): revisa los archivos versionados y los builds de las PWA con patrones de claves privadas PEM, cuentas de servicio de Google, claves de API de Google/Firebase, claves de AWS, claves secretas de pasarela (`sk_live_`/`rk_live_`), tokens de GitHub y Slack y cadenas de conexión de base de datos con contraseña. Resultado: ✅ sin secretos en 216 archivos. 14 pruebas comprueban que detecta cada patrón (con muestras construidas por partes), que no marca la configuración de ejemplo y que no copia el secreto en el informe.

## 2026-11-13 — Autenticación del personal y contexto de empresa

| Comprobación | Comando | Resultado |
|---|---|---|
| Unitarias y componentes | `npm run check` | ✅ 18 archivos, **255 pruebas** |
| Integración | `npm run test:integration` | ✅ **39/39** (33 de autorización + 6 de las pasarelas reales con el SDK web de Firebase y el SDK generado) |
| Navegadores (sin emuladores) | `npm run test:e2e` | ✅ 71 superadas, 4 omitidas (Tab en Safari); axe sin infracciones también en la pantalla de acceso |
| Recorrido real con emuladores | `npm run test:e2e:emulators` | ✅ 2/2 (Chrome y Safari iPhone) |
| Auditoría | `npm audit` | ✅ 0 vulnerabilidades |

Cobertura nueva:

- Selección de contexto (máquina de estados pura): selección automática con una sola opción, IDs que no están en la lista se ignoran, cambiar de contexto descarta empresa y sucursal, respuestas tardías ignoradas, reintento tras error.
- Pantalla de acceso: validación antes de llamar al servidor, mensaje único para correo o contraseña incorrectos, contraseña borrada tras un error, sin doble envío, recuperación con la misma respuesta exista o no el correo, perfil mínimo al entrar.
- Pasarelas reales contra emuladores: contraseña incorrecta y correo inexistente responden igual; perfil creado; sin membresías no hay empresas; con membresía, solo la sucursal asignada; ID de otra empresa sin resultados; tras cerrar sesión las consultas se rechazan.
- Rutas de `operations`: sin sesión llevan al acceso; con sesión piden empresa; cambiar de empresa quita el contenido anterior; cerrar sesión vuelve al acceso sin datos visibles.
- Recorrido en navegador: acceso accesible (axe), error genérico, selección, cambio de empresa y sucursal, revocación en el servidor reflejada al recargar y cierre de sesión que persiste tras recargar.

~~Pendiente: bloqueo por inactividad y política de dispositivos compartidos (PM §8).~~ Resuelto el 2026-11-14 (D-19, D-20; ver la entrada «Equipos compartidos, inactividad y actualización de la PWA»).

## 2026-11-13 — Esquema inicial y autorización (SQL Connect)

| Comprobación | Comando | Resultado |
|---|---|---|
| Unitarias | `npm run check` | ✅ 14 archivos, **223 pruebas** (37 del catálogo de roles contra `permissions.md`, 12 de reglas de los conectores) |
| Integración | `npm run test:integration` (emuladores de la CLI 15.30.2: Auth y SQL Connect con PGlite, proyecto `demo-tavelyo`) | ✅ **33/33** |
| Prueba de mutación | Quitar la comprobación de membresía de `TenantMembers` y repetir la integración | ✅ Fallan 4 pruebas (ID alterado, rol sin permiso, empresa suspendida, revocación); se restauró el archivo |

Casos de integración (dos empresas, A y B, más una suspendida): sin sesión no responde nada; `MyMemberships` solo devuelve las empresas activas propias; `MyBranches` muestra todas las sucursales al propietario, las asignadas al resto y ninguna con el ID de otra empresa; `TenantMembers` y `TenantAuditEvents` exigen permiso y rechazan IDs ajenos; `AddMember`, `ChangeMemberRole`, `AssignMemberBranch`, `UnassignMemberBranch` y `RevokeMember` rechazan IDs de otra empresa, roles sin permiso, rangos iguales o superiores (incluido cambiarse el propio rol) y sucursales de otra empresa o no asignadas al administrador; quitar una sucursal y revocar una membresía se aplican en la **siguiente operación con el mismo token**; las operaciones rechazadas no dejan eventos de auditoría (atomicidad); la FK compuesta impide una sucursal de otra empresa incluso con credenciales de servidor.

Limitación: el emulador no aplica IAM (ADR-0008, verificación pendiente en `tavelyo-e2b57`).

## 2026-11-13 — Corrección de vulnerabilidades de dependencias

| Comprobación | Comando | Resultado |
|---|---|---|
| Auditoría | `npm audit` | ✅ 0 vulnerabilidades (antes 13: 2 bajas, 11 moderadas) |
| Conjunto completo | `npm run check` | ✅ 12 archivos, **174 pruebas** (5 nuevas de `tools/deepmerge-safe`) |
| Compilación de las PWA | `npm run build` de cada app | ✅ 22 entradas precacheadas en cada una, igual que antes |
| Navegadores | `npm run test:e2e` | ✅ 71 superadas, 4 omitidas (Tab en Safari), igual que antes |

## 2026-11-13 — Entornos (`packages/data-access`)

`npm run check`: ✅ 11 archivos, **169 pruebas**. Nuevas: `parseFirebaseEnvironment` acepta una configuración completa; `.env.example` es válido y apunta a los emuladores; informa de todas las variables que faltan a la vez; rechaza un proyecto *demo* sin emuladores, un indicador de emuladores ambiguo y variables `VITE_*` con nombre de secreto.

## 2026-11-13 — Navegadores (Playwright 1.64.1 + axe-core 4.14.0)

Comando: `npm run test:e2e` (compila las dos apps y las sirve con `vite preview`). Matriz D-15: Chrome 157.0.8103.78 y Edge 157.0.4341.46 instalados (canales `chrome` y `msedge`), WebKit 27.2 de Playwright como Safari de escritorio, Chrome en Android emulado (Pixel 7) y Safari en iPhone emulado (iPhone 15).

| Prueba (en cada app) | Resultado |
|---|---|
| Manifiesto instalable; los iconos declarados responden 200 como PNG | ✅ 5 navegadores |
| Sin conexión: tras activarse el *service worker*, la app arranca desde la caché y muestra «ningún pedido ni pago se confirma» | ✅ 5 navegadores |
| La caché del *service worker* solo contiene recursos del build (JS, CSS, HTML, imágenes, fuentes y manifiesto) | ✅ 5 navegadores |
| axe sin infracciones WCAG 2.0/2.1/2.2 A y AA (inicio de ambas apps y catálogo) | ✅ 5 navegadores |
| *Reflow*: sin desplazamiento horizontal a 320 px; catálogo con texto al 200 % a 640 px | ✅ 5 navegadores |
| Diálogo destructivo real: modal, foco inicial en «Cancelar», Tab no sale a la página de detrás, Escape lo cierra | ✅ 5 navegadores |
| Primer Tab al enlace «Saltar al contenido» y Enter enfoca el `main` | ✅ Chrome, Edge, Chrome Android · ⏭️ Safari (por defecto Safari no enfoca enlaces con Tab; se revisa en dispositivo real con la opción activada) |

Total: **71 superadas, 4 omitidas** (las de Safari indicadas), 0 fallidas. Una primera ejecución falló porque el filtro de la prueba trataba `manifest.webmanifest` (precacheado por `vite-plugin-pwa`) como dato; es un archivo estático del build y se corrigió el filtro, no el *service worker*.

Pendiente en navegador: actualización controlada entre dos versiones del build (el aviso y `registerType: 'prompt'` ya tienen prueba unitaria), instalación real en dispositivos Android e iOS y revisión con lector de pantalla (VoiceOver y TalkBack).

Limitaciones conocidas: jsdom no implementa `showModal()`; la prueba usa un sustituto que solo alterna `open`. El foco atrapado, el fondo inerte y la tecla Escape reales se verifican con Playwright en navegadores (bloque 9).

No ejecutado todavía: integración con emuladores, PWA, matriz de navegadores y auditoría axe (siguientes bloques de la fase).
