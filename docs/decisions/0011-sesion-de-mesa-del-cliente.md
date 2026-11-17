# ADR-0011 — Sesión de mesa del cliente y niveles de acceso de los conectores

**Estado:** Aceptada · **Fecha:** 2026-11-14 · Aprobada por el propietario con el plan de la Fase 2 (D-21, D-06 carrito y sesión anónima de Firebase Authentication)

## Contexto

En la Fase 2 el cliente escanea el QR de la mesa, ve la carta y arma un pedido desde su teléfono, sin crear una cuenta. PM §7 exige lo siguiente:
- El QR solo identifica la mesa.
- Leer o modificar una cuenta requiere una credencial de alcance reducido, con expiración y rotación.
- Una sesión cerrada no expone la siguiente (caso 12 de PM §12).

Hasta ahora todas las operaciones de los conectores exigían una persona del personal (`@auth(level: USER)` y membresía, ADR-0008).

## Decisión

1. **El QR es una URL de `menu-web` con el `qrPublicId` de la mesa.**
   - Es un UUID aleatorio, rotable desde administración y sin secretos.
   - Rotarlo invalida los QR impresos anteriores.
2. **La carta es pública.**
   - Una única consulta `@auth(level: PUBLIC)` recibe el `qrPublicId` y devuelve solo la carta de esa sucursal: productos no archivados y disponibles, con precio vigente.
   - No devuelve mesas, sesiones, pedidos ni datos del personal.
   - Ninguna otra operación es pública.
3. **El cliente usa una sesión anónima de Firebase Authentication** para pedir; no hay correo ni contraseña.
   - Las operaciones de cliente usan `@auth(level: USER_ANON)` y comprueban que el `auth.uid` es un **participante vigente** de una sesión de mesa **abierta**.
   - Las operaciones del personal siguen en `@auth(level: USER)`, que **no admite** usuarios anónimos. Así un cliente nunca alcanza una operación del personal, aunque conozca su nombre.
4. **El mesero abre la mesa (D-21).**
   - `joinTableSession` (backend) solo crea el participante si la mesa del `qrPublicId` tiene una sesión abierta.
   - El participante guarda `authUid` y `expiresAt` y puede ser expulsado por el personal.
   - Al cerrar la sesión, ningún participante de ella vuelve a tener acceso; para la sesión siguiente hay que unirse de nuevo.
5. **Operaciones solo de servidor.** Las que escriben importes calculados o resúmenes verificables (`OrderQuote`) se declaran en el conector con `@auth(level: NO_ACCESS)`.
   - Solo el Admin SDK del backend puede ejecutarlas; ningún cliente ni miembro del personal puede llamarlas.
   - El backend las ejecuta después de sus propias comprobaciones (ADR-0008 §7) y de validar al usuario con operaciones suplantadas.
6. **Sucursales desde la app.**
   - El propietario crea y edita sucursales con mutaciones del conector que exigen `tenant.settings`, membresía activa y `AuditEvent` en la misma transacción.
   - Las empresas, roles y permisos siguen creándose solo por aprovisionamiento.
7. **Carrito local por persona (D-06).** No se guarda en el servidor hasta «Revisar pedido». Nadie ve el carrito de otra persona.

## Controles de proceso (amplían los de ADR-0008)

`dataconnect/tests/connector-rules.test.ts` exige:

| Nivel | Uso permitido | Condición |
|---|---|---|
| `PUBLIC` | Solo la lista blanca (carta pública) | Filtra por `qrPublicId` |
| `USER_ANON` | Solo la lista blanca de operaciones del cliente | Comprueban el participante por `auth.uid` |
| `NO_ACCESS` | Solo la lista blanca de operaciones de servidor | — |
| `USER` | Operaciones del personal | Mantiene las reglas de ADR-0008 |

Además, `branch_insert` y `branch_update` solo aparecen en las operaciones autorizadas del propietario.

## Consecuencias

- Hay que habilitar el proveedor anónimo de Firebase Authentication en `tavelyo-e2b57` al desplegar. Es configuración sin coste.
- **Riesgo T11, QR fotografiado:**
  - la mesa la abre el mesero;
  - el backend aplica límites de solicitudes;
  - el mesero ve y puede expulsar a los participantes;
  - un código por sesión queda como mejora si hiciera falta.
- **Riesgo, cuentas anónimas sin límite de tiempo:** Firebase no borra solo las cuentas anónimas. La limpieza periódica se define antes de producción.
- **Verificación pendiente:** que el emulador y el servicio real aplican `USER_ANON`, `NO_ACCESS` y las comparaciones de fechas en `@check` como se describe aquí. Lo comprueban las pruebas de integración del bloque 2.

## Implementación (Fase 2, bloques 2 y 3, 2026-11-14)

- **Verificado en el emulador:** `USER_ANON`, `NO_ACCESS` y las comparaciones de fechas en filtros funcionan como se describe (`capacidades-fase-2.int.test.ts`, `salon-carta.int.test.ts` y `backend/tests/mesa-pedido.int.test.ts`). Queda pendiente comprobarlo en el servicio real al desplegar.
- **`joinTableSession`** (backend): exige sesión de Firebase Auth (también anónima) y que el mesero haya abierto la mesa. La participación vence a las **4 horas** o al cerrar la mesa. Volver a escanear devuelve la misma participación y la renueva si venció. Quien fue expulsado no vuelve a entrar con la misma cuenta, y una mesa admite como máximo **20 participaciones vigentes**. Cada alta queda en la auditoría con el uid anónimo.
- **Expulsión y rotación del QR:** se resolvieron en el conector (`RemoveParticipant`, `RotateTableQr`), sin backend.
- **`quoteOrder`** (backend): revalida participación, disponibilidad, horario en la zona de la sucursal, reglas de opciones y precio vigente, y calcula los importes con `Money`. **Solo guarda el resumen si el total que vio la persona coincide con el del servidor y ningún precio cambió**; si no, devuelve los cambios para confirmarlos (caso 5). La clave de idempotencia y la huella SHA-256 del contenido hacen que una doble pulsación o un reintento devuelvan el mismo resumen, y que la misma clave con otro contenido se rechace. El resumen vale **15 minutos**.
- **`authorizeQuote`** (backend): autoriza el importe guardado, nunca uno enviado por el cliente, con la clave de idempotencia del resumen. Tras un tiempo agotado consulta el estado antes de responder, así que no cobra dos veces. En esta fase usa el **adaptador simulado**, que se niega a arrancar con un proyecto que no sea `demo-*`: con `tavelyo-e2b57` el backend lanza `SimulatedPaymentsNotAllowedError` al cargar.
- **Límites de solicitudes (T11):** se cuentan en la base (`RateLimitHit`), así que valen para todas las instancias a la vez. Unirse: 10 cada 10 minutos por persona y 120 por mesa; «Revisar pedido»: 30 por minuto; pagos: 10 por minuto. La solicitud rechazada no cuenta, porque la transacción se revierte.
- **Limitación encontrada:** el SDK web generado no admite variables de lista de tipo `_Data`, así que el resumen con sus líneas se guarda con un documento fijo de `executeGraphql` en el backend (`backend/src/data/order-quotes.ts`), el mismo patrón que el aprovisionamiento de la Fase 1.
- **Pendiente antes de producción:** purgar las filas antiguas de `RateLimitHit` y las cuentas anónimas (tarea programada), y decidir si App Check se suma como capa adicional.

## Implementación (Fase 2, bloques 5 a 7, 2026-11-15 y 2026-11-16)

- **Mesero (`operations`, módulo «Salón»):** abre y cierra la mesa, ve a las personas unidas como «Persona 1, 2…» con su hora de ingreso y su estado, sin ningún dato de su cuenta, y las retira con confirmación. La lista no se actualiza sola: se refresca con un botón (las actualizaciones en vivo son de la Fase 3).
- **Cliente (`menu-web`, `/mesa/<qrPublicId>`):** la carta se lee sin sesión. La sesión anónima se crea **solo al revisar el pedido**, no al mirar la carta, para no crear cuentas anónimas por cada visita. El carrito vive en el navegador de la persona (D-06) y se lee como dato no confiable; el servidor recalcula todo.
- **Cambios de precio (caso 5):** si `quoteOrder` informa cambios, la pantalla muestra el importe anterior y el actual y no sigue sin confirmación; además la carta se vuelve a leer para que lo siguiente que se agregue tenga el precio vigente (hallazgo del recorrido en CI #26).
- **Pago simulado:** rotulado en la pantalla; con emuladores la persona elige el resultado para probar cada caso. Aprobado termina en «Pedido listo»; nada llega a cocina hasta la Fase 3.

## Implementación (Fase 3, bloque 3, 2026-11-16)

- **`authorizeQuote` envía a cocina (D-04):** solo después de confirmar la autorización crea el pedido (uno por resumen) y lo envía con `ServerSendOrderToKitchen`, que vuelve a comprobar en el servidor el pago autorizado, la mesa abierta, la persona vigente y el resumen sin vencer. La respuesta incluye el `orderId`.
- **Consentimiento (RF-PA-02):** el cliente envía la versión del texto de preautorización que aceptó (`PREAUTHORIZATION_CONSENT_VERSION`, en `packages/contracts`, con el texto en `preauthorizationConsentText`). El servidor solo autoriza la versión vigente y la guarda con el resumen, junto con `consentedAt` y `authorizedAt`.
- **Reanudable (caso 3):** repetir la llamada con un resumen ya autorizado no vuelve a autorizar. Si una caída dejó el resumen sin pedido, o el pedido guardado sin enviar, el reintento termina el envío. Dos pulsaciones simultáneas dan un solo pedido.
- **Para liberar:** si al enviar la mesa ya se cerró o la persona ya no está, el pedido no llega a cocina, el resumen pasa a `RELEASE_PENDING` y el cliente lo lee en texto. La liberación real de la retención es de la Fase 4. Falta una tarea programada de conciliación para los resúmenes autorizados que nadie vuelve a intentar: necesita Cloud Scheduler, un recurso facturable que requiere aprobación.
- **`requestService`:** «Llamar al mesero» y «Pedir la cuenta», solo para quien sigue en una mesa abierta. Repetir un aviso que el personal aún no atendió responde `already-pending` sin crear otro.
- **Límites (T11):** 6 solicitudes de servicio cada 10 minutos por persona y 30 por mesa.
- **Estación predeterminada:** se crea con cada sucursal (`CreateBranch` y `provisionTenant`). Si una sucursal anterior a la Fase 3 no la tiene, el backend la crea al enviar el primer pedido.

## Implementación (Fase 3, bloque 6, 2026-11-17)

- **«Autorizar y enviar a cocina»:** el botón de pago dice qué hace. Antes de pulsarlo, la tarjeta muestra el texto de la preautorización y aclara que sin autorización el pedido no se envía. Al terminar, «Pedido enviado a cocina» lleva a «Mis pedidos».
- **«Mis pedidos»** (`/mesa/<qrPublicId>/mis-pedidos`, D-06): solo los pedidos propios, con el estado de cada línea en vivo y en texto (consulta `MyOrders`, ADR-0007). Cada cambio de estado se anuncia también en una región de aviso, para el lector de pantalla.
- **Volver a la mesa sin crear cuentas:** tras recargar el teléfono, «Mis pedidos» recupera la mesa con `joinTableSession`, que es idempotente, pero solo si el teléfono ya tenía su sesión anónima. Mirar «Mis pedidos» sin haber pedido ni llamado al mesero no crea una sesión anónima ni una participación.
- **`joinTableSession` devuelve también la sucursal (`branchId`)**: la suscripción de «Mis pedidos» la necesita para acotar el refresco a la sucursal de la mesa.
- **«Llamar al mesero» y «Pedir la cuenta»** están en «Mis pedidos», enlazada desde la carta. Si la persona todavía no estaba en la mesa, se une al pulsar. Un aviso repetido se responde en texto («El mesero ya tiene tu aviso») sin crear otro. La cuenta en sí es de la Fase 4.

