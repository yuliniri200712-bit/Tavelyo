# Registro de pruebas — Fase 3B (diseño visual)

Plan: [`plans/fase-3b-diseno-visual.md`](../plans/fase-3b-diseno-visual.md). Las pruebas unitarias se lanzan desde `C:\…` (con la unidad en minúscula, Vitest falla en todos los archivos; ver `testing/fase-3.md`, bloque 7).

## 2026-11-17 — Bloque 1: base del sistema de diseño

| Comprobación | Comando | Resultado |
|---|---|---|
| Componentes nuevos | `npx vitest run packages/design-system` | ✅ 11 pruebas nuevas en `visual-components.test.tsx`: `Icon` decorativo oculto y con etiqueta anunciado, y los 39 nombres del catálogo dibujan un icono; `FilterPills` agrupa, anuncia la opción elegida con `aria-pressed` y lee el contador con el nombre; `TableTile` dice la mesa y su estado en texto; `StatusTimeline` marca el paso en curso con `aria-current` y dice el estado de cada paso en texto; `KitchenTicket` con el título como encabezado, la espera en texto y el bloque de color oculto; `ProductCard` con encabezado, precio, alérgenos y motivo cuando no se puede pedir; `SearchField` con nombre propio; `ActionBar` como región con nombre |
| Contraste | ídem (`tokens.test.ts`) | ✅ 19 pares nuevos (`brand/contrast-matrix.md`, «Pares de la Fase 3B») |
| Sin valores sueltos | ídem (`no-loose-values.test.ts`) | ✅ Los componentes y estilos nuevos solo usan tokens |
| Cabecera | `npx vitest run packages/pwa-shell` | ✅ Sin cambios en lo existente; el tono oscuro es opcional |
| Catálogo en el navegador | Capturas de `/catalogo` en Chromium a 390 y 1280 px | ✅ Sin desplazamiento horizontal; mesas, seguimiento, tickets, productos, filtros y buscador revisados a ojo |
| Conjunto | `npm run check` | ✅ 697 pruebas unitarias (38 más: 11 de componentes, 19 de contraste y 8 archivos más sin valores sueltos), tipos, ESLint y Prettier |

Hallazgo corregido: en `FilterPills` el nombre accesible se leía «Todas8», sin espacio entre el nombre y el contador. Ahora se lee «Todas 8».

## 2026-11-17 — Bloque 2: cliente

| Comprobación | Comando | Resultado |
|---|---|---|
| Lógica de la carta y del seguimiento | `npx vitest run packages/features/table-session/src/application` | ✅ 8 pruebas nuevas. Buscador: sin filtro deja la carta igual; busca en nombre, descripción y alérgenos sin distinguir tildes ni mayúsculas; exige todas las palabras y quita las secciones vacías; combina búsqueda y categoría. Seguimiento: pasos hechos, en curso y pendientes según el estado derivado del pedido (también «una parte ya está lista»); entregado completa todo y cancelado no tiene seguimiento |
| Pantallas del cliente | `npx vitest run packages/features/table-session` | ✅ 30 pruebas; nuevas: el buscador filtra la carta y explica cuando no hay resultados; «Mis pedidos» marca el paso en curso y lo actualiza en vivo |
| **Recorridos en navegador** | `npx playwright test --config playwright.emulators.config.ts customer-order customer-live accessibility-fase-2 accessibility-fase-3` | ✅ **5 navegadores** de D-15: 31 superadas y 4 omitidas (Tab en Safari, como antes). Sin cambiar lo que comprueban: los nombres accesibles y los textos se conservan. axe sin infracciones; 320 px y texto al 200 % sin desplazamiento horizontal |
| Conjunto | `npm run check` | ✅ 706 pruebas unitarias, tipos, ESLint y Prettier |
| Capturas de antes y después | `npm run capturas -- --output=capturas/<etiqueta>` (nuevo, fuera de CI) | ✅ 7 pantallas en móvil (Pixel 7) y escritorio (1280 px) con datos fijos: carta, opciones, carta con pedido, tu pedido, resumen y pago, pedido enviado y «Mis pedidos» |

Hallazgos:
- **Del equipo local, no del código:** compilada desde `c:\…` (unidad en minúscula), la app empaqueta React dos veces y sale en blanco («Cannot read properties of null (reading 'useSyncExternalStore')»). Desde `C:\…` funciona; la CI no lo sufre. Las compilaciones y Playwright se lanzan desde `C:\`.
- **Corregido en la revisión de capturas:** en escritorio, al abrir las opciones de un plato, la tarjeta vecina se estiraba y dejaba un hueco vacío; ahora el plato abierto ocupa toda la fila.
- Playwright vacía `test-results` al empezar cada ejecución, así que las capturas van a `capturas/` (excluida de git).
- **CI #50 (bloque 1):** la prueba de concurrencia falló una vez en Safari de iPhone porque miraba el aviso «Esta línea ya cambió» una sola vez, justo cuando la pantalla que pierde ya tenía el cambio en vivo pero aún no la respuesta de su pulsación. Ahora espera hasta 15 s a que exactamente una pantalla lo muestre. No es un fallo de la app.
- **Fuera de alcance, a propósito:** el «consumo acumulado» de las referencias suma importes en el teléfono; la cuenta y sus totales son de la Fase 4 y los calcula el servidor.

## 2026-11-18 — Bloque 3: personal

| Comprobación | Comando | Resultado |
|---|---|---|
| Lógica nueva | `npx vitest run packages/features/floor packages/core` | ✅ Tono de cada mesa, de lo más urgente a lo menos (solicitud, platos listos, abierta, libre) y tamaño del sector en texto; `formatShortWait` («12 min», nunca negativo) |
| Pantallas | `npx vitest run packages/features/kitchen packages/features/orders packages/features/floor packages/features/service-requests apps/operations` | ✅ Nueva: la cocina filtra la cola por estado con su contador sin perder las demás líneas. Ajustadas dos comprobaciones de cocina y entregas: la espera y la hora (o la estación) ya no van en una sola línea, sino la espera grande en el ticket («12 min», y completa para el lector de pantalla) y la hora o la estación junto al estado |
| **Tanda completa con emuladores** | `npx playwright test --config playwright.emulators.config.ts` | ✅ **5 navegadores**: 79 superadas, 4 omitidas (Tab en Safari) y 2 fallidas en Safari de iPhone, las dos por esperar al backend con el emulador frío (ver hallazgos). Repetidas con el backend caliente: ✅ las 2 pasan. La cabecera oscura no rompe ninguna pantalla de `operations` a 320 px ni con el texto al 200 % |
| Conjunto | `npm run check` | ✅ 710 pruebas unitarias, tipos, ESLint y Prettier |
| Capturas de antes y después | `npm run capturas -- personal --output=capturas/<etiqueta>` | ✅ Cocina, «Listos para recoger», salón y pedidos de una mesa, en móvil y escritorio, con un salón de demostración (`e2e/support/demo-floor.ts`: M1 con pedidos y llamada al mesero, M2 con platos listos y uno recogido, M3 libre, y una terraza con una mesa abierta y otra libre) |

Hallazgos en la revisión de capturas, corregidos:
- el icono de «Atendida» tomaba el color del aviso y casi no se veía sobre el botón rojo;
- en la cocina, el resumen de la cola quedaba pegado al aviso del sonido;
- en escritorio, las mesas eran tan estrechas que los botones partían el texto y una mesa libre se estiraba hasta la altura de su vecina; desde 1024 px son más anchas y cada una tiene su altura;
- la captura de los pedidos de una mesa se tomaba mientras cargaban: ahora espera a que aparezcan.

Hallazgos de la tanda completa (de las pruebas, no de la app):
- **Backend frío en el emulador:** tras un rato sin uso (el equipo se suspendió unos 50 minutos a mitad de la tanda), la primera llamada desde el navegador tarda mucho más. `accessibility-fase-2` esperaba solo 5 s el resumen del pedido; ahora espera `FUNCTION_WAIT` (60 s), como las demás llamadas al backend. `accessibility-fase-3` encadena varias llamadas y pasó de su límite de 3 minutos; ahora tiene 5. Medido sin navegador, el backend responde en unos 0,8 s.

## 2026-11-18 — Bloque 4: entrada, inicio y administración

| Comprobación | Comando | Resultado |
|---|---|---|
| Sistema de diseño | `npx vitest run packages/design-system` | ✅ `PageTitle`: es el encabezado principal y el icono no cambia su nombre. Catálogo de iconos con 44 nombres (5 nuevos: carta, horario, inicio, persona y acceso), todos dibujan su icono |
| Pantallas y rutas | `npx vitest run packages apps` | ✅ Sin cambios en lo que comprueban: los títulos, enlaces y botones conservan su nombre accesible |
| Capturas de antes y después | `npm run capturas -- administracion --output=capturas/<etiqueta>` | ✅ Entrada, inicio del propietario, carta de la empresa y de la sucursal, estaciones, mesas y QR, y sucursales, en móvil y escritorio |
| **Tanda completa con emuladores** | `npx playwright test --config playwright.emulators.config.ts` | ✅ **5 navegadores**: 80 superadas, 4 omitidas (Tab en Safari, como antes) y 1 fallida en Safari de escritorio (`staff-session`, ver hallazgos). Corregida la espera de la prueba: ✅ pasa 5 de 5 seguidas en Safari de escritorio |
| Conjunto | `npm run check` y `npm run check:secrets` | ✅ 712 pruebas unitarias, tipos, ESLint y Prettier; sin secretos en 448 archivos |

Pulido pedido por el propietario al aprobar el bloque (iconos en las acciones de administración y mesas como tarjetas):

| Comprobación | Comando | Resultado |
|---|---|---|
| Mesas y códigos QR | `npx vitest run packages/features/floor` | ✅ Prueba nueva: cada mesa es una tarjeta y el panel solo aparece al ver su QR (y entonces ocupa la fila). Las pruebas de estado en texto («Activa», «Archivada») siguen igual |
| Capturas | `npm run capturas -- administracion --output=capturas/bloque-4-pulido` | ✅ Las mismas pantallas y una nueva con el QR de una mesa abierto. Hallazgo corregido: la tarjeta recibía un panel vacío y ocupaba toda la fila; en el móvil, dos mesas por fila partían el texto de los botones, así que en administración van más anchas (una por fila en el móvil) |
| Conjunto | `npm run check` | ✅ 713 pruebas unitarias, tipos, ESLint y Prettier |

Hallazgos de la tanda completa (de las pruebas, no de la app):
- **Comprobación de la sesión lenta en Safari con la máquina cargada:** al cargar o recargar, la app muestra «Comprobando la sesión…» mientras consulta Auth y SQL Connect. Justo después de la tanda completa (38 minutos), en Safari de escritorio esa comprobación superó la espera general de 5 s de `staff-session` (3 de 3 intentos, cada uno de 28 a 33 s). Con el equipo descansado pasó 5 de 5 con este bloque (unos 20 s cada uno) y 2 de 2 sin él, así que no es una regresión del diseño. Las esperas tras cargar y recargar pasan a 20 s, como las demás esperas de conexión de las pruebas; los pasos y lo que comprueban no cambian.

## 2026-11-18 — Bloque 5: cierre

| Comprobación | Comando | Resultado |
|---|---|---|
| Accesibilidad de lo rediseñado | `npx playwright test --config playwright.emulators.config.ts accessibility-fase-3b` | ✅ Prueba nueva para lo que no cubrían las de las fases 2 y 3: **entrada**, **inicio** con los módulos en tarjetas y **mesas en tarjetas** con el QR abierto, sin infracciones de axe y sin desplazamiento horizontal a 320 px ni con el texto al 200 %, en los 5 navegadores. **Solo con el teclado** (Chrome, Edge y Chrome Android; omitido en Safari, como en las fases anteriores): Tab llega al enlace de la tarjeta del módulo y Enter lo abre; Tab llega a «Ver QR» de la mesa y Enter muestra el QR con `aria-expanded`. La carta, el pedido, el salón, la cocina, «Listos para recoger», las estaciones, la carta de la sucursal y las sucursales ya los comprueban `accessibility-fase-2` y `accessibility-fase-3` |
| Tamaño de la descarga | `npm run build` de las dos apps, en `main` (antes de la fase) y en la rama | ✅ `menu-web`: JS de 158,9 a 166,6 KB con gzip (+7,7) y CSS de 3,0 a 4,8 KB (+1,8). `operations`: JS de 185,1 a 194,3 KB (+9,2) y el mismo CSS. Solo llegan los iconos de Lucide que se usan |
| **Tanda completa con emuladores** | `npx playwright test --config playwright.emulators.config.ts` | ✅ **5 navegadores**, 95 pruebas: 86 superadas, 6 omitidas (teclado en Safari) y 3 fallidas al empezar, las tres esperando al backend recién arrancado (ver hallazgos). Repetidas `customer-order`, `customer-live` y `accessibility-fase-2` en los 5 navegadores: ✅ 23 superadas y 2 omitidas |
| Capturas finales | `npm run capturas -- cliente personal administracion --output=capturas/fase-3b-final` | ✅ 38 pantallas (19 en móvil y 19 en escritorio): carta, opciones, pedido, resumen y pago, pedido enviado, «Mis pedidos», cocina, «Listos para recoger», salón, entrada, inicio, carta de la empresa y de la sucursal, estaciones, mesas (también con el QR abierto) y sucursales. Comparación con las capturas de antes de cada bloque en `capturas/comparacion-fase-3b.html` (local, fuera del repositorio) |
| **Android real** | motorola edge 50 fusion, Android 16, Chrome 157; emuladores en Docker y puertos con `adb reverse` | ✅ El teléfono tenía la versión de la Fase 3 y ofreció «Actualizar»; tras actualizar, la carta salió con el diseño nuevo. El propietario recorrió la carta, las opciones, el pedido, el resumen con el pago simulado y «Mis pedidos», con el personal en el computador: «funciona de maravilla y el diseño también se ve perfecto» (2026-11-18) |

No verificado: **TalkBack** en las pantallas rediseñadas. El propietario decidió el 2026-11-18 dejarlo pendiente sin bloquear el cierre, como en la Fase 3. Los nombres accesibles no cambiaron y las pruebas de componentes y axe comprueban que cada estado y cada acción tengan su texto. VoiceOver en iPhone sigue pendiente desde la Fase 1.

Hallazgos de la tanda completa (de las pruebas, no de la app):
- **Backend recién arrancado:** Docker Desktop estaba cerrado y los emuladores se encendieron justo antes de la tanda. Las tres primeras pruebas del cliente que esperaban al backend (autorizar y enviar a cocina, y el aviso de importes cambiados) usaban la espera general de 5 s. Ahora esas esperas, y las demás del recorrido `customer-order` que esperan al backend (resumen confirmado y pago rechazado), usan `FUNCTION_WAIT` (60 s), como el resto de las llamadas al backend. Lo que comprueban no cambia.
