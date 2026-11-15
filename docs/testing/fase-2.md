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
| Navegador con emuladores | `npm run test:e2e:emulators` (`tables-admin.spec.ts`, Chrome y Safari de iPhone) | ⚠️ **No se pudo ejecutar en el equipo local**: Windows bloquea el ejecutable del emulador de SQL Connect («Una directiva de Control de aplicaciones bloqueó este archivo»). Se verifica en CI |

Recorrido de `tables-admin.spec.ts`: el administrador de sucursal crea un sector y dos mesas; el código repetido muestra «Ya existe una mesa con ese código en la sucursal»; ve el QR con la dirección de menu-web, lo renueva con confirmación y la dirección cambia; archiva una mesa y la hoja imprimible solo muestra la activa; axe sin infracciones en las dos pantallas; el mesero no ve el módulo y la ruta directa no muestra datos.
