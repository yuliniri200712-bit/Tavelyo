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

Pendiente de verificar en los bloques siguientes: las suscripciones (`@refresh`) con el SDK web en el navegador, y la reconexión de cocina (caso 11).
