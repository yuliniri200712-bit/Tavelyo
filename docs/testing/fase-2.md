# Registro de pruebas — Fase 2

Rama: `fase-2-salon-carta`. Se registra cada ejecución con el comando, el resultado real y lo que no se pudo ejecutar. Todas las pruebas de integración corren contra los emuladores (`demo-tavelyo`); no hay nada desplegado.

## 2026-11-14 — Bloque 1: capacidades de SQL Connect para ADR-0011

| Comprobación | Comando | Resultado |
|---|---|---|
| Capacidades | `npm run test:integration` (`capacidades-fase-2.int.test.ts`) | ✅ 6 pruebas: carta `PUBLIC` sin sesión, nada con un QR inventado, el cliente anónimo no alcanza operaciones `USER`, `NO_ACCESS` solo para el Admin SDK, una sola sesión abierta por mesa, participante vencido o de una sesión cerrada sin acceso |

## 2026-11-14 — Bloque 2: conectores y autorización

| Comprobación | Comando | Resultado |
|---|---|---|
| Reglas de los conectores | `npm run check` (`connector-rules.test.ts`) | ✅ Incluye la regla nueva: ninguna variable opcional en un filtro. Una operación de prueba con un filtro opcional la hace fallar |
| Autorización | `npm run test:integration` (`salon-carta.int.test.ts`) | ✅ 25 pruebas con dos empresas, dos sucursales, seis roles y un cliente anónimo |
| Conjunto | `npm run check` / `npm run test:integration` | ✅ 364 / 93 pruebas. CI #13 en verde |

Hallazgo: en SQL Connect **una variable omitida o nula en un filtro anula ese filtro**, y `vars.x == null` falla si la variable se omite (hay que usar `has()`). Detalle en ADR-0008.

## 2026-11-14 — Bloque 3: backend del cliente, cálculo y pago simulado

| Comprobación | Comando | Resultado |
|---|---|---|
| `core` | `npx vitest run packages/core` | ✅ 85 pruebas (15 nuevas: impuesto contenido, formato `es-CO` y horario semanal) |
| Backend, unitarias | `npx vitest run backend/src` | ✅ 86 pruebas (cálculo, opciones, `quoteOrder`, `joinTableSession`, pago simulado y `authorizeQuote`) |
| Backend, integración | `npm run test:integration` (`backend/tests/mesa-pedido.int.test.ts`) | ✅ 16 pruebas con las funciones reales en el emulador de Cloud Functions |
| Negativa a arrancar | `GCLOUD_PROJECT=tavelyo-e2b57 node -e "import('./lib/index.js')"` en `backend/` | ✅ Lanza `SimulatedPaymentsNotAllowedError` antes de inicializar Firebase (no contacta ningún servicio). Con `demo-tavelyo` carga las 5 funciones |
| Conjunto | `npm run check` / `npm run test:integration` | ✅ 433 / 109 pruebas |

### Reglas de cálculo verificadas

- **Impuesto contenido (D-01b):** `importe × tasa / (1 + tasa)`, por línea, con redondeo **half-up** a la unidad menor (centavo). El subtotal es total − impuesto, así que subtotal + impuesto = total siempre: se comprobó en 544 combinaciones de importes y tasas (0 %, 5 %, 8 % y 19 %) y en todas las cantidades del cálculo del pedido. Ejemplo: $ 64.000 con impoconsumo del 8 % contienen $ 4.740,74 → `474074`. Esta regla debe conciliarse con la facturación real del restaurante (D-02 y facturación electrónica, fuera de alcance).
- **Formato:** `$ 25.000` en `es-CO` (espacio duro), sin decimales cuando el importe es entero en pesos y con ellos si hay centavos; el importe nunca pasa por `number` (2⁵³ + 1 se formatea exacto).
- **Horario:** día y minuto en la zona IANA de la sucursal; el final del tramo se excluye; un tramo que cruza la medianoche pertenece al día en que empieza; un horario no válido nunca está disponible.
- **Opciones:** mínimo y máximo por grupo, sin repetir y solo del propio producto.

### Casos de PM §12 cubiertos

- **Caso 1 (IDs alterados):** el cliente de otra empresa con el id de la sesión de esta, un producto de otra empresa en el pedido, y autorizar el resumen de otra persona o desde una cuenta del personal: todo rechazado.
- **Caso 3 (parcial, doble pulsación):** dos «Revisar pedido» simultáneos y un reintento con la misma clave dan un solo resumen guardado; la misma clave con otro contenido se rechaza. Unirse dos veces a la vez crea una sola participación. Autorizar dos veces no vuelve a autorizar, y tras un tiempo agotado simulado la consulta encuentra la autorización (sin cobro doble).
- **Caso 5 (precio cambiado con el carrito abierto):** devuelve el importe nuevo con el cambio de precio y de total, **sin guardar nada**; al reenviar con el precio y el total confirmados, se guarda. Un total inventado por el cliente nunca se guarda, y un precio enviado por el cliente se rechaza como campo no admitido.
- **Caso 12 (sesión cerrada):** tras cerrar la mesa nadie pide ni paga con la sesión anterior, ni siquiera tras reabrirla; hay que volver a unirse y la sesión es otra.
- **Expulsión:** el expulsado no pide, no paga ni vuelve a entrar con la misma cuenta.
- **Límites de solicitudes:** la undécima solicitud para unirse en 10 minutos se rechaza con `resource-exhausted`.

### No ejecutado en este bloque

- Recorridos en navegador y en el Android real: llegan con las pantallas (bloques 4 a 7).
- Servicio real de SQL Connect y Cloud Functions: no hay despliegue autorizado.

## 2026-11-15 — Bloque 4a: sectores, mesas y QR (operations)

| Comprobación | Comando | Resultado |
|---|---|---|
| Conjunto | `npm run check` | ✅ 34 archivos, 456 pruebas (nuevas: formularios y QR de `floor`, pantalla de mesas, hoja imprimible, traductor de errores de `data-access`, dirección de la carta y rutas por permiso) |
| Compilación | `npm run build -w @tavelyo/operations` | ✅ |
| Navegador con emuladores | `npm run test:e2e:emulators` (`tables-admin.spec.ts`, Chrome y Safari de iPhone) | ✅ En CI (ejecución #17). ⚠️ No se pudo ejecutar en el equipo local: Windows bloquea el ejecutable del emulador de SQL Connect («Una directiva de Control de aplicaciones bloqueó este archivo») |

Hallazgos corregidos por el recorrido en CI:

- **Contraste en un instante de transición (Safari de iPhone):** al salir de «Guardando…», el texto blanco del botón volvía al instante mientras el fondo deshabilitado se animaba hacia el rojo, y axe midió 1,24:1. Se quitó la transición de fondo de los botones.
- **Errores HTTP 4xx del SDK web:** llegan como `DataConnectError` con el cuerpo JSON en el mensaje y sin `response`; el traductor de errores ahora los lee (pruebas en `command-errors.test.ts`).
- Playwright publica cada fallo como anotación de GitHub en CI, para diagnosticar sin permisos de administrador del repositorio.

Recorrido de `tables-admin.spec.ts`: el administrador de sucursal crea un sector y dos mesas; el código repetido muestra «Ya existe una mesa con ese código en la sucursal»; ve el QR con la dirección de menu-web, lo renueva con confirmación y la dirección cambia; archiva una mesa y la hoja imprimible solo muestra la activa; axe sin infracciones en las dos pantallas; el mesero no ve el módulo y la ruta directa no muestra datos.

## 2026-11-15 — Bloque 4b: carta de la empresa y de la sucursal (operations)

| Comprobación | Comando | Resultado |
|---|---|---|
| Conjunto | `npm run check` | ✅ 484 pruebas (nuevas: captura de importes en `core`, formularios de la carta, pantallas de la carta de la empresa y de la sucursal) |
| Compilación | `npm run build -w @tavelyo/operations` | ✅ |
| Navegador con emuladores | `npm run test:e2e:emulators` (`catalog-admin.spec.ts`, Chrome y Safari de iPhone) | ✅ CI #20 (en el equipo local el emulador sigue bloqueado por el Control inteligente de aplicaciones de Windows; el propietario decidió no instalar Node en WSL) |

Cobertura:

- **Importes:** «25000», «25.000» y «$ 25.000» dan 2.500.000 unidades menores; en COP no se admiten centavos; nunca pasa por `number` (también con importes de 20 cifras).
- **Impuestos:** «8», «8,5 %» y «19» a puntos básicos y de vuelta («8 %», «8,5 %»).
- **Horario:** días y horas a máscara y minutos; fin «00:00» es medianoche; un tramo que termina antes de empezar cruza la medianoche y se describe así («vie y sáb · 18:00 a 02:00 (cruza la medianoche)»).
- **Pantallas:** el propietario ve y edita todo; el administrador de sucursal consulta la carta de la empresa sin controles de edición y cambia disponibilidad y precio en su sucursal; cambiar un precio pide confirmación con el importe anterior y el nuevo; un precio no válido se explica sin llamar al servidor; sin precio el producto se marca «Sin precio: no aparece en la carta».

Recorrido de `catalog-admin.spec.ts`: el propietario crea un impuesto, una categoría, un producto con alérgenos y un grupo de opciones con un adicional de $ 5.400; en la sucursal lo deja disponible viernes y sábado de 18:00 a 02:00 y le pone $ 32.000; el administrador de sucursal no puede editar la carta de la empresa y sube el precio a $ 35.000 con confirmación; axe sin infracciones en las dos pantallas.

## 2026-11-15 — Bloque 4c: sucursales (operations)

| Comprobación | Comando | Resultado |
|---|---|---|
| Conjunto | `npm run check` | ✅ 491 pruebas (nuevas: formulario y pantalla de sucursales y lista de sucursales actualizada sin cambiar la sucursal activa) |
| Autorización de `TenantBranches` | `npm run test:integration` (`salon-carta.int.test.ts`) | ✅ CI #21: el propietario ve sus sucursales archivadas incluidas y no las de otra empresa; administrador de sucursal y mesero sin `tenant.settings`; otra empresa sin membresía |
| Navegador con emuladores | `npm run test:e2e:emulators` (`branches-admin.spec.ts`) | ✅ CI #21: crear, archivar con confirmación y restaurar; la sucursal actual no se archiva; la nueva aparece al cambiar de contexto; el administrador de sucursal no ve el módulo |
| SDK generado | CI (`dataconnect:sdk:generate` + `git diff`) | ✅ CI #21: el SDK escrito a mano siguiendo el formato del generador coincide byte a byte con el del generador real (la CLI no corre en el equipo local) |

## 2026-11-15 — Bloque 4: dispositivo real Android

Dispositivo del propietario: **Motorola edge 50 fusion, Android 16, Chrome**. Conexión por cable USB con `adb reverse` (puertos 6174, 9099 y 9399), como en la Fase 1. Build de producción de `operations` con `vite preview --host 127.0.0.1`.

Entorno: Windows bloquea el ejecutable del emulador de SQL Connect (Control inteligente de aplicaciones, ahora activado; el 2026-11-14 estaba en evaluación). Sin cambiar esa configuración ni instalar nada en Windows, los emuladores de Auth y SQL Connect se ejecutaron en un contenedor temporal de Docker Desktop (imagen oficial `node:24-bookworm-slim`, `firebase-tools@15.30.2`, escuchando en `0.0.0.0` dentro del contenedor y publicados solo en `127.0.0.1`). El esquema se copió dentro del contenedor (montaje de solo lectura), así que no se escribió nada en el repositorio. Datos: empresa «La Fonda de Prueba» (Centro y Norte), con propietario, administrador de Centro y mesero de Centro, sembrados con las ayudas de `dataconnect/tests/support`. Al terminar se borraron el contenedor y la imagen y se quitaron los puertos del teléfono.

| Recorrido | Resultado |
|---|---|
| Propietario: sucursales (crear, archivar con confirmación, restaurar; la actual no se archiva; la nueva aparece al cambiar de contexto) | ✅ |
| Propietario: carta de la empresa (impuesto en porcentaje, categoría, producto, grupo de opciones con valor adicional) | ✅ |
| Propietario: carta de la sucursal (precio con confirmación, agotado y disponible, horario que cruza la medianoche) | ✅ |
| Propietario: sectores, mesas, QR, renovación y hoja de impresión | ✅ |
| Administrador de sucursal: mesas y cartas; la de la empresa solo para consultar; sin «Sucursales» | ✅ |
| Mesero: sin módulos de administración | ✅ |

Según el propietario, «todo funciona perfectamente». La carta del cliente al escanear el QR llega en el bloque 6 y no se probó.
