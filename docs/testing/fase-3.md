# Registro de pruebas — Fase 3

Rama: `fase-3-pedidos`. Se registra cada ejecución con el comando, el resultado real y lo que no se pudo ejecutar. Todas las pruebas de integración corren contra los emuladores (`demo-tavelyo`); no hay nada desplegado.

**Entorno local:** Windows bloquea el emulador y la CLI de SQL Connect (Control inteligente de aplicaciones). Desde el bloque 2, con aprobación del propietario, los emuladores y la generación del SDK corren en un contenedor temporal de Docker (`node:24-bookworm-slim`, `firebase-tools` 15.30.2, puertos solo en `127.0.0.1`), igual que en la Fase 2. CI vuelve a validar todo.

## 2026-11-16 — Bloque 1: esquema de pedidos, estaciones y solicitudes

| Comprobación | Comando | Resultado |
|---|---|---|
| Máquina de estados de la línea y estado derivado del pedido | `npx vitest run packages/core/src/order-status.test.ts` | ✅ 15 pruebas: secuencia completa, entregar sin recoger solo desde «listo», pasos saltados y repetidos rechazados, cancelar solo antes de salir de cocina, nunca retrocede (D-26), motivo y merma, y los seis estados derivados |
| Catálogo de permisos y matriz | `npx vitest run packages/contracts` | ✅ 38 pruebas con `service_request.handle` |
| Capacidades del esquema | `npm run test:integration` (`capacidades-fase-3.int.test.ts`) | ✅ 8 pruebas en CI #36: estación predeterminada única, estaciones y opciones de otra sucursal o empresa rechazadas, un pedido por resumen, cambio condicionado por versión que gana una sola vez y una solicitud pendiente por tipo y mesa |
| Conjunto | CI #37 | ✅ Verde en las tres partes. CI #36 falló solo porque el SDK escrito a mano no tenía las interfaces `_Key` de las tablas nuevas |

## 2026-11-16 — Bloque 2: conectores y autorización

| Comprobación | Comando | Resultado |
|---|---|---|
| Reglas de los conectores | `npm run check` (`connector-rules.test.ts`) | ✅ Todas las operaciones nuevas, con `MyOrders` en la lista blanca del cliente |
| Autorización de pedidos, cocina y solicitudes | `npx vitest run --config vitest.integration.config.ts dataconnect/tests` (`pedidos-fase-3.int.test.ts`) | ✅ 19 pruebas, detalle abajo |
| Conjunto | `npm run check` / integración contra el contenedor | ✅ 576 unitarias; 98 de SQL Connect y 23 del backend (114 + 23 = 137 de integración) |

Lo que cubre `pedidos-fase-3.int.test.ts`:

- **Estaciones:** la predeterminada es única, nace con cada sucursal nueva (`CreateBranch`) y no se archiva. Crear y asignar exige `catalog.manage`. Una estación de otra sucursal o archivada no se asigna.
- **D-04:** un pedido con el resumen sin autorizar no llega a cocina ni aparece en la cola. Autorizado, se envía una sola vez, y el reintento lo encuentra ya enviado. Otra persona, otra mesa o una persona retirada no lo envían. Solo el servidor ejecuta el envío.
- **Cocina:** la cola muestra la mesa, los alérgenos, las opciones y la nota, y **ningún importe ni dato del cliente**. El mesero, la cocina de otra sucursal y la otra empresa no la leen. Los pasos fuera de orden y repetidos se rechazan con «Esta línea ya cambió».
- **Caso 4:** **tres «Empezar» simultáneos sobre la misma línea: gana uno, los otros dos reciben «Esta línea ya cambió» y queda un solo registro de auditoría.**
- **IDs alterados:** la cocina de otra empresa, declarando su propia empresa, no toca una línea ajena.
- **Meseros:** recoger y entregar; cocina no recoge; entregar sin recoger exige `delivery.skip_sequence` y motivo, que queda en la auditoría. Cancelar exige motivo, marca merma si la línea ya se empezó y no se puede después de entregar. El salón y los pedidos de la mesa muestran las líneas en curso.
- **D-06:** «Mis pedidos» muestra a cada persona solo los suyos, nada a alguien ajeno y nada con otra sucursal.
- **Solicitudes:** una pendiente de cada tipo por mesa; el personal sin `service_request.handle` no las ve ni las atiende; atendida, sale de la lista y se puede volver a pedir.
- **Caso 12:** al cerrar la mesa, el cliente deja de ver sus pedidos y no puede enviar pedidos ni crear solicitudes.

Hallazgos del bloque:

- **El SDK web no admite listas de entrada:** el pedido se guarda con un documento fijo y se envía a cocina con una operación del conector (ADR-0007, implementación).
- **El emulador genera el SDK al cargar el conector** y necesita el `package.json` de `packages/data-access` en su copia de trabajo; sin él se detiene sin un error claro. Se añadió a la copia del contenedor.
- En local, las pruebas del backend necesitan `FIREBASE_AUTH_EMULATOR_HOST`, `DATA_CONNECT_EMULATOR_HOST` y `GCLOUD_PROJECT`, que en CI define `emulators:exec`. Esa variable de SQL Connect hace fallar la prueba de pasarelas del SDK web, así que en local las dos suites se ejecutan por separado.

## 2026-11-16 — Bloque 3: backend del envío a cocina y solicitudes

| Comprobación | Comando | Resultado |
|---|---|---|
| Backend, unitarias | `npx vitest run backend/src` | ✅ 101 pruebas. `authorizeQuote` (6): versión del texto, envío tras autorizar, rechazado y con acción pendiente sin pedido, reintento sin cobro doble, retención para liberar y mesa cerrada. Envío a cocina (9): estación y alérgenos por línea, opciones en orden, pedido ya enviado, recuperación, choque de unicidad y estación predeterminada creada. `requestService` (4) |
| Backend, integración | `npx vitest run --config vitest.integration.config.ts backend/tests` | ✅ 47 pruebas con las funciones reales. Nuevas: el pedido llega a la cola de cocina con sus líneas y el consentimiento queda guardado; **dos pulsaciones simultáneas dan un solo pedido**; sin autorización no hay pedido; texto viejo rechazado; **recuperación tras las dos caídas simuladas**; la persona retirada antes del envío deja el resumen `RELEASE_PENDING`; solicitudes con aviso repetido y personas ajenas |
| Recorridos del cliente | `npx playwright test --config playwright.emulators.config.ts --project=chrome customer-order accessibility-fase-2` | ✅ 4 en Chrome, con el texto de la preautorización en la tarjeta de pago |
| Conjunto | `npm run check` / integración de SQL Connect | ✅ 592 unitarias / 98 |

Hallazgo: las pruebas nuevas sentaron más de 20 personas en la misma mesa y el límite por mesa de `joinTableSession` las detuvo, como debía. Cada grupo nuevo usa su propia mesa.

## 2026-11-16 — Bloque 4: estaciones y pantalla de cocina en tiempo real

| Comprobación | Comando | Resultado |
|---|---|---|
| Estaciones (4a) | `npx vitest run packages/features/catalog` | ✅ Lista con estado en texto, la predeterminada sin «Archivar», validación al crear, archivar; estación de cada producto en la carta de la sucursal, solo entre las activas y sin consultarlas si falta `catalog.manage`. CI #40 en verde |
| Lógica de la cola | `npx vitest run packages/features/kitchen` | ✅ 4 pruebas: minutos de espera (nunca negativos), resumen en texto, pedidos nuevos con su mesa y motivo de cancelación |
| Pantalla de cocina | ídem (`KitchenPage.test.tsx`) | ✅ 7 pruebas: detalle de la línea con alérgenos y sin importes, «Empezar» con la versión vista y nueva lectura, «Esta línea ya cambió», pedido nuevo con aviso, marca y sonido opcional, sin conexión con los botones bloqueados y reintento, elección y recuerdo de la estación, cancelación con motivo y aviso de merma |
| D-25 | `npx vitest run packages/features/identity` | ✅ 3 pruebas nuevas: con la cocina visible no avisa ni cierra en 40 minutos; con la pestaña oculta cierra a los 15; al salir de la cocina vuelve el cierre normal |
| **Tiempo real en navegador (caso 11)** | `npx playwright test --config playwright.emulators.config.ts kitchen-realtime` | ✅ **5 navegadores** de D-15. Cocina ve el pedido sin recargar, con aviso y marca de «Nuevo»; «Empezar» y «Listo» cambian la línea; sin red bloquea los botones; al volver recupera el pedido hecho mientras estaba sin conexión. axe sin infracciones |
| Conjunto | `npm run check` | ✅ 609 pruebas unitarias |

Hallazgo: en el SDK web 12.19 la suscripción funciona sin `clientCache` (ADR-0007, implementación), así que se conserva ADR-0008 §8: no se guardan datos que haya que vaciar al cerrar sesión.

## 2026-11-16 — Bloque 5: meseros

| Comprobación | Comando | Resultado |
|---|---|---|
| Tiempo real compartido | `npx vitest run packages/design-system/src/components/live-data` | ✅ 6 pruebas: lectura al abrir y cambios de la suscripción; sin red conserva lo último, explica qué se bloquea y se vuelve a suscribir solo; sin permiso no reintenta; un cambio propio avisa y vuelve a leer; al volver la red se suscribe y lee todo. Diálogo de motivo: no confirma sin un motivo válido |
| Cocina tras el cambio | `npx vitest run packages/features/kitchen` | ✅ Las 11 pruebas del bloque 4 siguen pasando con `useLiveData`, `LiveStatus` y `ReasonDialog` |
| Salón | `npx vitest run packages/features/floor` | ✅ 4 de lógica (actividad en texto, en singular y plural, solicitudes con la hora de la sucursal) y 11 de pantalla, 3 nuevas: se actualiza solo con cada cambio, sin conexión no deja abrir ni cerrar, solicitudes arriba y pedidos de la mesa al pedirlos |
| «Listos para recoger» y pedidos de la mesa | `npx vitest run packages/features/orders` | ✅ 15 pruebas: resumen y espera en texto, aviso del plato que queda listo, acciones según estado y permiso; «Recogido» con la versión vista, «Esta línea ya cambió», sin `delivery.deliver` no hay «Entregado»; estado derivado del pedido, cancelar con motivo y merma, entregar sin recoger con motivo, sin permisos solo estados |
| Solicitudes | `npx vitest run packages/features/service-requests` | ✅ 4 pruebas: mesa, tipo y espera en texto; «Atendida» y nueva lectura; ya atendida por otra persona; aviso de la solicitud nueva en vivo |
| Capa de datos | `npx vitest run packages/data-access/src/staff-mappers` | ✅ 4 pruebas de traducción de las lecturas: sin importes ni datos de quien pidió, y conteo por mesa |
| Rutas | `npx vitest run apps/operations` | ✅ El mesero ve el salón con solicitudes y «Listos para recoger»; un rol sin `delivery.pickup` no la ve |
| **Meseros en navegador** | `npx playwright test --config playwright.emulators.config.ts waiter-service` | ✅ **5 navegadores** de D-15. Con un pedido real autorizado: la mesa muestra la línea en cocina; el cliente llama al mesero y aparece **sin recargar** en la mesa y en la lista; «Atendida». Cocina termina la línea y el salón muestra «1 lista para recoger» sin recargar. «Recogido»; sin red no deja entregar y al volver sí; «Entregado». Un segundo plato que queda listo se anuncia en texto. En los pedidos de la mesa se cancela con motivo y aviso de merma. axe sin infracciones en el salón, en «Listos para recoger» y con los pedidos abiertos |
| Regresión en navegador | ídem con `kitchen-realtime waiter-floor`, y `accessibility-fase-2` en Chrome y Safari de iPhone | ✅ Cocina y el salón de la Fase 2 en los 5 navegadores; 320 px, texto al 200 % y teclado sin cambios (Tab omitido en Safari, como antes) |
| Conjunto | `npm run check` | ✅ 648 pruebas unitarias, tipos, ESLint y Prettier |

Hallazgo durante la prueba: el recorrido pedía la solicitud con el código `CALL_WAITER` del esquema, y `requestService` la rechazó como inválida, como debía: el contrato del cliente usa `call_waiter`. Se corrigió la prueba.

Pendiente de verificar en los bloques siguientes: TalkBack y el Android real (bloque 7).
