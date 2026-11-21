# Registro de pruebas — Fase 4 (caja y pagos)

Plan: [`plans/fase-4.md`](../plans/fase-4.md). Las pruebas unitarias se lanzan desde `C:\…` en PowerShell (con la unidad en minúscula, Vitest falla en todos los archivos; ver `testing/fase-3.md`, bloque 7). Los emuladores corren en el contenedor de Docker `tavelyo-emu`, autorizado para esta fase (ver `testing/fase-2.md`).

## 2026-11-18 — Bloque 1: decisiones y esquema

| Comprobación | Comando | Resultado |
|---|---|---|
| Esquema nuevo | Emulador de SQL Connect (`cuenta.gql` y `caja.gql`) | ✅ Compila y crea las 12 tablas con sus FK compuestas, unicidades e índices |
| Capacidades del esquema | `npx vitest run --config vitest.integration.config.ts dataconnect/tests/capacidades-fase-4.int.test.ts` | ✅ 17 pruebas: una cuenta por sesión; cuenta, caja y operaciones rechazadas con la sesión o la sucursal de otra empresa o sucursal (caso 1); la versión de la cuenta gana una sola vez (caso 9); una preautorización por resumen; misma clave sin pagos, reembolsos ni operaciones duplicados (casos 3, 7 y 10); una línea no se asigna dos veces al mismo pago ni se asigna una de otra empresa; aviso repetido de la pasarela descartado (caso 8); tarea pendiente con su empresa; nombre de caja único por sucursal; una sesión abierta por caja y, cerrada, otra nueva; un conteo por turno; movimientos sin pagos ajenos |
| Regresión de SQL Connect | `npx vitest run --config vitest.integration.config.ts dataconnect` | ✅ 115 pruebas en 7 archivos |
| SDK generado | `firebase-tools@15.30.2 dataconnect:sdk:generate` en el contenedor | ✅ Solo añade las interfaces `*_Key` de las tablas nuevas; el repositorio queda igual que la salida del generador |
| Conjunto | `npm run check` | ✅ 713 pruebas unitarias, tipos, ESLint y Prettier |

## 2026-11-18 — Bloque 2: dinero de la cuenta

| Comprobación | Comando | Resultado |
|---|---|---|
| Cuenta (`bill.ts`) | `npx vitest run packages/core` | ✅ La cuenta suma las líneas que se cobran (sin las canceladas) con su impuesto contenido y lo de cada persona (D-06); rechaza cobrar una línea más de su importe, asignar a una línea cancelada o ajena, importes negativos y monedas mezcladas. Un pago se reparte por las líneas elegidas sin pasar de lo que falta; probado con 43 importes distintos: lo asignado suma siempre el importe exacto. La división en partes iguales va en pesos enteros y suma siempre el total exacto (35 combinaciones de total y partes), con diferencias de a lo sumo un peso. La mesa no se cierra con saldo o con líneas sin entregar (D-30) |
| Propina (`tip.ts`) | ídem | ✅ Sugerida en 10 % y redondeada al peso con mitades hacia arriba (D-05); acepta cero; rechaza negativas, centavos o más que el consumo |
| Cobro de preautorizaciones y reembolsos (`payment-settlement.ts`) | ídem | ✅ Captura lo consumido y libera el resto (captura menor, caso 6); nunca captura más de lo autorizado y deja el faltante para otro pago; sin consumo solo libera; vencida, ya usada o en otra moneda no se captura; sin captura parcial en la pasarela no la intenta. En 25 importes, captura más liberación da lo autorizado y captura más faltante da lo debido. Reembolsos: descuentan los confirmados y los que siguen en curso, no los rechazados; uno mayor que lo disponible, vacío, repetido o sobre el tope del rol se rechaza (caso 10) |
| Caja (`cash.ts`) | ídem | ✅ Cambio y faltante en efectivo; efectivo esperado del turno; cierre con diferencia exige motivo |
| Paquete `core` | `npx vitest run packages/core`, `tsc` y ESLint | ✅ 140 pruebas (30 nuevas) |

## 2026-11-18 — Bloque 3: pagos en el backend con el adaptador simulado

| Comprobación | Comando | Resultado |
|---|---|---|
| Adaptador simulado (`simulated-gateway.test.ts`) | `npx vitest run backend/src` | ✅ 16 pruebas: captura menor con liberación del resto; nunca más de lo autorizado, en otra moneda o cero; sin captura parcial declarada solo el total; vencida no se captura ni se libera; liberar lo capturado falla; misma clave con otro importe es un error. Fallos inyectados: rechazo, tiempo agotado con la operación hecha (la consulta la encuentra y repetir no captura otra vez) y sin llegar a la pasarela (la consulta no la conoce y se repite). Reembolsos parciales sin pasar de lo capturado; en curso cuenta como usado y se confirma o rechaza después. Avisos firmados: solo el cuerpo exacto, con la firma correcta y de menos de 5 minutos; otra instancia no puede firmarlos; identificadores únicos entre instancias |
| Procesador de pagos (`payment-processor.test.ts`) | ídem | ✅ 22 pruebas: la operación se guarda antes de llamar, con la misma clave; doble pulsación o reintento, una sola captura (caso 3); misma clave con otro importe, rechazada; nada se captura de una autorización usada o vencida, por encima de lo autorizado o en parcial si la pasarela no lo admite; rechazo y vencimiento dejan el pago FAILED. Tiempo agotado (caso 7): la consulta confirma; sin rastro queda UNKNOWN y la resolución repite la misma operación; un error inesperado también queda UNKNOWN. Liberación: una por autorización; tras un rechazo definitivo se reintenta con la clave siguiente (como mucho 5); sin respuesta, con la misma. Reembolso: CONFIRMED solo cuando la pasarela confirma; en curso, PROCESSING hasta el aviso o la consulta; rechazado, REJECTED (caso 10). Avisos (caso 8): repetidos, tardíos o desordenados no retroceden; con otro importe, moneda o referencia no se aplican; estados que no corresponden se ignoran; vencimiento por referencia |
| Conciliación (`reconcile-payments.test.ts`) | ídem | ✅ 10 pruebas: resuelve la captura sin respuesta repitiendo la misma operación y no la toca mientras es reciente; autorización perdida: espera mientras el resumen está vigente y, vencido, registra la retención y la libera, o falla la operación si la pasarela no la conoce; libera las retenciones RELEASE_PENDING; marca vencidas las que pasaron su plazo y avisa 24 h antes; outbox: libera, reintenta con espera creciente (1 min a 1 h), abandona tras 10 intentos o con datos inválidos y da por hecha una retención ya liberada o capturada; operaciones con 10 intentos se informan y no se repiten |
| Avisos y punto de entrada (`receive-provider-notice.test.ts`) | ídem | ✅ 8 pruebas: verifica, guarda una sola vez y aplica; sin firma válida no se guarda nada; uno que llegó y no terminó se procesa al repetirse; mismo id con otro cuerpo, rechazado; más de 64 KB, rechazado. HTTP: solo POST; el rechazo no se explica a quien llama (queda en el registro); el cuerpo pasa sin volver a serializarse; un error responde 500 para que la pasarela lo repita |
| Autorización del cliente (`payments.test.ts`) | ídem | ✅ 13 pruebas (2 nuevas): la operación AUTHORIZE se guarda antes de llamar y la autorización se registra con su vencimiento; sin respuesta ni rastro queda UNKNOWN y el reintento usa la misma operación; cerrada por la conciliación, no se vuelve a autorizar |
| Integración de pagos | `npx vitest run --config vitest.integration.config.ts backend/tests/pagos-fase-4.int.test.ts` (con las variables de los emuladores) | ✅ 14 pruebas contra los emuladores: la función real `authorizeQuote` deja la operación cerrada y una `PaymentAuthorization` con su vencimiento a 7 días; el reintento no duplica; rechazada, sin retención. Con el libro real: captura con pago CONFIRMED y auditoría, una sola vez; una operación cerrada no se cierra otra vez ni retrocede; clave única; sin operaciones cruzando empresas o sucursales ni autorizaciones con otra empresa (caso 1); reembolso confirmado; aviso firmado que confirma un reembolso en curso, repetido (duplicate) o desordenado (ignored), guardado con su huella y su empresa; el punto de entrada `paymentWebhook` del emulador rechaza GET, avisos sin firma y firmados con otro secreto; conciliación de una captura sin respuesta, de una retención RELEASE_PENDING, de una autorización perdida con el resumen vencido y de una tarea del outbox. Repetida sobre la misma base, pasa igual |
| Regresión del backend | `npx vitest run --config vitest.integration.config.ts backend/tests` | ✅ 61 pruebas en 3 archivos |
| Regresión de SQL Connect | `npx vitest run --config vitest.integration.config.ts dataconnect` | ✅ 115 pruebas en 7 archivos |
| SDK generado | `firebase-tools@15.30.2 dataconnect:sdk:generate` en el contenedor | ✅ Operaciones nuevas de `pagos.gql`; el repositorio queda igual que la salida del generador |
| Conjunto | `npm run check` y `npm run check:secrets` | ✅ 828 pruebas unitarias (85 nuevas: 58 del backend y 27 de las reglas del conector, una por operación nueva), tipos, ESLint y Prettier; sin secretos |

**Encontrado y corregido durante las pruebas:**
- Los avisos del adaptador simulado se numeraban por instancia (`evt_sim_1`, `evt_sim_2`…). Al reiniciar el backend, un aviso nuevo podía repetir el id de otro ya guardado y se rechazaba como conflicto. Ahora llevan un identificador aleatorio de la instancia, como los de una pasarela real.
- Con una clave fija por autorización, una liberación rechazada no se podía reintentar nunca. Ahora se pasa a la clave siguiente solo tras un rechazo definitivo; sin respuesta se repite la misma.

**No se pudo probar en los emuladores:** el disparador programado `reconcilePayments` (el emulador de Functions lo ignora sin el de Pub/Sub). Las pruebas llaman al mismo caso de uso que ejecuta.

## 2026-11-18 — Bloque 3A: pasarela solo para suscripciones (ADR-0012)

| Comprobación | Comando | Resultado |
|---|---|---|
| Esquema y conectores | Emulador de SQL Connect y generación del SDK en el contenedor | ✅ Compilan `Branch.orderApproval`, `Order.approval` y sus marcas, el estado `CONFIRMED` del resumen y el conector nuevo `aprobacion.gql`; el SDK queda igual que la salida del generador |
| Reglas de los conectores | `npx vitest run dataconnect/tests/connector-rules.test.ts` | ✅ Las operaciones nuevas cumplen ADR-0008 y ADR-0011 (`WithdrawMyOrder` del cliente, `SetBranchOrderApproval` en la lista de sucursales) |
| Backend (unitarias) | `npx vitest run backend/src` | ✅ `submitOrder`: confirma el resumen y envía sin pasarela; con aprobación queda pendiente; un resumen ya confirmado termina el envío sin duplicar; doble pulsación; rechazado o retirado se explica; mesa cerrada o persona fuera no envía; solo admite el resumen (ni importes, ni consentimiento, ni resultados simulados); límite por persona. Despachador: pendiente sin enviar a cocina; pendiente, aprobado, rechazado o retirado se informa sin tocarlo aunque cambie el modo |
| Integración de SQL Connect | `npx vitest run --config vitest.integration.config.ts dataconnect` | ✅ 117 pruebas; sin confirmar no llega a cocina; un pedido que espera al mesero no entra por el envío directo; los resúmenes autorizados antes de ADR-0012 siguen llegando |
| Integración del backend | `npx vitest run --config vitest.integration.config.ts backend/tests` (con las variables de los emuladores) | ✅ `submitOrder` real: envío directo, doble pulsación, recuperación tras caídas, persona que sale. Aprobación (D-32): solo el propietario o el administrador cambian el modo y solo en su empresa, con auditoría; pendiente no llega a cocina y lo ven el mesero y el cliente; cocina y otra empresa no ven la bandeja; aprobar lo envía a cocina y decidir dos veces no pasa; rechazar exige motivo y el cliente lo ve; el cliente retira el suyo (nadie más) y después no se aprueba; no se aprueba si la persona salió; con el modo directo otra vez, directo a cocina. El libro del bloque 3, desconectado, sigue probado |
| Interfaz (unitarias) | `npm run check` | ✅ 856 pruebas: «Enviar pedido» y «Pedido enviado al mesero», «Mis pedidos» con «Esperando al mesero», «Retirar pedido» y el aviso de la decisión del mesero; bandeja «Pedidos por aprobar» (aprobar, rechazar con motivo, aviso en texto de los nuevos); ajuste de la sucursal; traductores de datos |
| Recorridos en navegador (Chrome) | `npx playwright test --config playwright.emulators.config.ts --project=chrome …` | ✅ 7 recorridos: el cliente envía con teclado y a 320 px con texto al 200 %; envía y sigue su pedido en vivo; mesa cerrada, precio cambiado y envío sin pasarela; QR inventado; **aprobación del mesero de punta a punta** (el propietario activa el modo, el cliente ve «Esperando al mesero», el mesero aprueba desde el salón y llega a cocina, rechaza con motivo que ve el cliente, y el cliente retira un pedido), con revisión axe sin fallos; servicio del mesero. El resto de navegadores los corre la CI |
| Secretos | `npm run check:secrets` | ✅ Sin secretos |

## 2026-11-19 — Parte 4a: cuenta y pagos registrados

Alcance aprobado: `readBill` y `recordPayment`, permiso `payment.record`, efectivo sin turno hasta el bloque 5, datáfono propio y transferencia con número de comprobante. Sin pasarela, sin campos de tarjeta y sin cambios en las pantallas; división/reembolsos y cierre completo siguen en 4b/4c.

| Comprobación | Comando | Resultado |
|---|---|---|
| Calidad completa | `npm run check` | ✅ Formato, ESLint, tipos y 875 pruebas unitarias en 68 archivos |
| Cuenta, validación y permisos | `npx vitest run backend/src/billing/account.test.ts packages/contracts/src/authorization.test.ts` | ✅ 59 pruebas: solo pedidos enviados y no cancelados, cambio y propina, exceso, persona ajena, revisión antigua, comprobantes obligatorios y rechazo de campos extra de tarjeta; matriz de permisos sincronizada |
| Backend compilado | `npm run build -w backend` | ✅ Compila; exporta `readBill` y `recordPayment`; la pasarela permanece desconectada |
| SDK y esquema | `docker exec tavelyo-emu sh /scripts/gen-sdk.sh`, copiar salida al paquete y `git diff --exit-code -- packages/data-access/dataconnect-generated` | ✅ Generador real, sin diferencias con el SDK guardado; los campos nuevos no alteran las operaciones públicas generadas |
| Integración inicial de 4a | `npx vitest run --config vitest.integration.config.ts backend/tests/cuenta-fase-4a.int.test.ts` con variables de emuladores | ✅ 9 pruebas: cuenta vacía y estados de aprobación, efectivo sin turno y auditoría única, datáfono/transferencia, pago parcial por persona, exceso, roles/empresas/sucursales, revocación, mesa cerrada, revisión antigua, campos no admitidos y doble envío |
| Integración final y regresión (2026-11-19) | Conectores sin variables: `npx vitest run --config vitest.integration.config.ts dataconnect`; backend con las variables indicadas abajo: `npx vitest run --config vitest.integration.config.ts backend/tests` | ✅ Conectores: 117 pruebas en 7 archivos (243 s). Backend: 73 pruebas en 4 archivos (387 s), incluida `cuenta-fase-4a.int.test.ts` |
| Calidad repetida (2026-11-19) | `npm run check` | ✅ 875 pruebas unitarias en 68 archivos |
| Secretos | `npm run check:secrets` | ✅ Sin secretos en 488 archivos, con los archivos nuevos de 4a |
| Recorridos en navegador | — | No aplica en 4a: no cambia pantallas. La CI corre la tanda completa |
| CI | Rama `fase-4-caja-pagos` | Pendiente del resultado tras subir el commit de 4a |

Variables del backend en PowerShell: `$env:FIREBASE_AUTH_EMULATOR_HOST='127.0.0.1:9099'; $env:DATA_CONNECT_EMULATOR_HOST='127.0.0.1:9399'; $env:GCLOUD_PROJECT='demo-tavelyo'`. No se pasan a la ejecución de conectores porque alteran las pruebas de pasarelas existentes.

Hallazgos durante la verificación:

- Docker estaba apagado al reanudar; se inició únicamente Docker Desktop y `tavelyo-emu`. La primera conexión llegó antes de terminar de arrancar SQL Connect; se repitió con los emuladores listos.
- El recorrido de siete pedidos reales superó 30 segundos; solo esa prueba tiene ahora un límite de 60 segundos. Después pasó completa.
- ESLint analizaba la copia temporal del SDK en `tools/emuladores-docker/salida`, ya ignorada por Git. Se excluye únicamente esa salida generada; las reglas sobre el código del proyecto se mantienen.
- Una línea pagada no puede cancelarse directamente: el conector revierte la cancelación si encuentra asignaciones confirmadas. El flujo de revisión/reembolso corresponde a 4b.

## 2026-11-19 — Corrección D-36: número de comprobante de 12 caracteres como máximo

Al revisar 4a se vio que el comprobante admitía 40 caracteres, así que un número de tarjeta completo (13 a 19 dígitos) escrito por error se habría guardado. El propietario eligió limitarlo: máximo 12 caracteres (D-36, `RECEIPT_NUMBER_MAX_LENGTH` en `packages/contracts`).

| Comprobación | Comando | Resultado |
|---|---|---|
| Calidad completa | `npm run check` | ✅ 881 pruebas unitarias (6 nuevas: 12 caracteres admitidos; 13 caracteres, tarjetas de 16 y 13 dígitos, espacios y vacío rechazados) |
| Backend compilado | `npm run build -w backend` | ✅ |
| Integración de 4a | `npx vitest run --config vitest.integration.config.ts backend/tests/cuenta-fase-4a.int.test.ts` con las variables del backend | ✅ 10 pruebas (la primera ejecución falló porque los emuladores aún arrancaban tras `docker restart`; se repitió con ellos listos) |

## 2026-11-19 — Parte 4b: división y reembolsos

Alcance aprobado: división en partes iguales (D-38) y reembolsos por plato y generales (D-37) con los topes de D-34. Funciones nuevas `readBillPayments` y `refundPayment`; `readBill` admite `parts`. Sin cambios en pantallas (bloque 6).

| Comprobación | Comando | Resultado |
|---|---|---|
| Calidad completa | `npm run check` | ✅ 911 pruebas unitarias en 69 archivos (36 nuevas en `backend/src/billing/refund.test.ts`: división exacta y límites de partes; reembolso general y lo que queda del pago; topes por rol; reembolso por plato desde varios pagos, merma y mesa cerrada; la cuenta sin el plato devuelto; idempotencia, revisión antigua, conflicto y entrada inválida, incluido un campo de tarjeta) |
| SDK y esquema | `docker exec tavelyo-emu sh /scripts/gen-sdk.sh`, copiar al paquete y `git status` | ✅ Sin diferencias: los campos nuevos de `Refund` no cambian las operaciones públicas |
| Integración de 4b | `npx vitest run --config vitest.integration.config.ts backend/tests/cuenta-fase-4b.int.test.ts` con las variables del backend | ✅ 6 pruebas: división en 3 partes cobrada hasta saldar; reembolso general con reintento único, auditoría y lista de pagos; topes de cajero y administrador y exceso del propietario; reembolso por plato que cancela el plato y baja el total; aislamiento (mesero, otra empresa y otra sucursal); dos reembolsos simultáneos, solo uno pasa |
| Regresión de conectores | `npx vitest run --config vitest.integration.config.ts dataconnect` | ✅ 117 pruebas |
| Regresión del backend | `npx vitest run --config vitest.integration.config.ts backend/tests` con las variables del backend | ✅ 79 pruebas en 5 archivos |
| Secretos | `npm run check:secrets` | ✅ Sin secretos en 495 archivos |
| CI | Rama `fase-4-caja-pagos` | Pendiente del resultado tras subir el commit |

Hallazgos durante la verificación:

- **Regresión encontrada y corregida:** la primera ejecución completa del backend falló en 4 pruebas de 4a. Al añadir los reembolsos a los datos del pago, el reintento de un pago devolvía también el campo `refunds`. Ahora la respuesta del reintento se arma campo por campo, con una prueba unitaria nueva que lo vigila.
- Docker Desktop estaba apagado al reanudar; se inició únicamente Docker Desktop y `tavelyo-emu`.
- Limitación conocida: un reembolso por plato de una línea que sigue en cocina la cancela desde el backend, que no dispara el `@refresh` de las pantallas en vivo; la cocina lo ve en su siguiente lectura completa. Lo habitual es devolver platos ya entregados. Se revisa en el bloque 6.

## 2026-11-19 — Parte 4c: cierre de mesa y concurrencia

Alcance aprobado: cierre D-30 desde el servidor (`closeTable`, D-39) con la cuenta saldada, protección del cierre directo del salón y escenarios de concurrencia de cajeros y pedidos. La pantalla «Salón» de `operations` cierra ahora por `closeTable`.

| Comprobación | Comando | Resultado |
|---|---|---|
| Calidad completa | `npm run check` | ✅ 928 pruebas unitarias en 70 archivos (nuevas: 13 del cierre en `backend/src/billing/close.test.ts` y 2 de errores de funciones del personal en `command-errors.test.ts`) |
| SDK y esquema | `docker exec tavelyo-emu sh /scripts/gen-sdk.sh` y copia al paquete | ✅ Regenerado: `CloseTableSessionData` cambia a `tableSession_updateMany`, `ApproveOrderData` suma `sessionLock` y se añaden las dos operaciones `ServerClose*` |
| Integración de 4c | `npx vitest run --config vitest.integration.config.ts backend/tests/cuenta-fase-4c.int.test.ts` con las variables del backend | ✅ 8 pruebas: mesa sin consumo (servidor y cierre directo); saldo y platos sin entregar bloquean, también el cierre directo; cuenta saldada con su total, auditoría y sin segundo cierre; pedido esperando al mesero; cocina y otra empresa sin permiso; **dos cajeros cobran a la vez** (uno solo, sin cobrar de más); **dos cierres a la vez**; **cobro y cierre a la vez** (nunca una mesa cerrada con saldo); **pedido y cierre a la vez**, tres rondas (nunca un pedido en una mesa cerrada) |
| Regresión de conectores | `npx vitest run --config vitest.integration.config.ts dataconnect` | ✅ 117 pruebas |
| Regresión del backend | `npx vitest run --config vitest.integration.config.ts backend/tests` con las variables del backend | ✅ 87 pruebas en 6 archivos (`mesa-pedido.int.test.ts` repetido aparte tras adaptarlo: 29) |
| Recorridos en Chrome | `npx playwright test --config playwright.emulators.config.ts --project=chrome e2e/emulators/customer-order.spec.ts e2e/emulators/waiter-floor.spec.ts` | ✅ 3 recorridos, incluido el mesero que cierra la mesa desde «Salón» por el servidor. El resto de navegadores los corre la CI |
| Secretos | `npm run check:secrets` | ✅ Sin secretos |
| CI | Rama `fase-4-caja-pagos` | Pendiente del resultado tras subir el commit |

Hallazgos durante la verificación:

- **Carrera corregida en el diseño:** con PostgreSQL en READ COMMITTED, un envío a cocina y un cierre simultáneos podían pasar los dos y dejar un pedido en una mesa cerrada. El envío, la petición y la decisión de aprobación y los dos cierres toman ahora la fila de la sesión (`TableSession.version`), y los cierres comprueban después de tomarla. La prueba de tres rondas lo verifica.
- Tres pruebas antiguas del caso 12 (`pedidos-fase-3.int.test.ts`, `mesa-pedido.int.test.ts` y `e2e/emulators/customer-order.spec.ts`) cerraban mesas con pedidos por la vía directa, que D-30 ya no permite. Ahora cancelan los platos antes de cerrar; siguen probando lo mismo (el cliente pierde el acceso al cerrar).
- Un fallo de Prettier en un comando con *heredoc* dejó vacío `close.test.ts`; se reescribió y se volvió a verificar.

## 2026-11-20 — Bloque 5: caja

Alcance autorizado: cajas de la sucursal, turno de caja (apertura con fondo, entradas y salidas con motivo, efectivo esperado, conteo y cierre con diferencia) y efectivo de cobros y reembolsos a través de la caja abierta de quien lo registra. Reglas de D-40, aprobadas por el propietario el 2026-11-20 junto con el bloque. Sin pantalla (bloque 6).

| Comprobación | Comando | Resultado |
|---|---|---|
| Calidad completa | `npm run check` | ✅ 958 pruebas unitarias en 71 archivos (nuevas: `backend/src/cash/cash.test.ts`, con lectura, apertura, entradas y salidas y cierre con conteo, y el bloque «efectivo y caja» de `backend/src/billing/refund.test.ts`) |
| SDK y esquema | `docker exec tavelyo-emu sh /scripts/gen-sdk.sh` y copia al paquete | ✅ Regenerado con `BranchRegisters`, `CreateRegister` y `UpdateRegister`; las 4 funciones de caja cargan en el emulador |
| Integración de caja | `npx vitest run --config vitest.integration.config.ts backend/tests/caja-fase-4.int.test.ts` con las variables del backend | ✅ 7 pruebas: apertura con fondo, doble clic que responde el mismo turno, caja ocupada y segunda caja rechazadas, caja con turno que no se archiva, lista de cajas con su turno y auditoría; solo `branch.settings` crea cajas y una archivada no se abre; entradas y salidas (esperado, reintento sin duplicar, revisión antigua, salida mayor que lo que hay, motivo obligatorio); cierre que cuadra y con diferencia (motivo, signo, reintento, caja y persona liberadas, turno nuevo en la misma caja); **venta y cierre a la vez**, dos rondas (gana uno, nunca una venta en un turno cerrado); reembolso en efectivo que sale de la caja de quien devuelve y no supera lo que hay; aislamiento (otro cajero, mesero, otra sucursal, otra empresa y sin sesión; el administrador sí lee y cierra) |
| Cobros adaptados | `backend/tests/cuenta-fase-4a/4b/4c.int.test.ts` | ✅ 24 pruebas. Cada cajero, administrador o propietario que cobra o devuelve efectivo abre su caja (`backend/tests/support/cash.ts`). Nuevas comprobaciones: sin caja no se cobra en efectivo; el pago guarda su turno y una venta de consumo más propina; los reembolsos salen como `REFUND` de la caja de quien devuelve; con dos cajeros a la vez entra una sola venta |
| Regresión de conectores | `npx vitest run --config vitest.integration.config.ts dataconnect` | ✅ 117 pruebas |
| Regresión del backend | `npx vitest run --config vitest.integration.config.ts backend/tests` con las variables del backend | ✅ 94 pruebas en 7 archivos |
| Recorridos en Chrome | `npx playwright test --config playwright.emulators.config.ts --project=chrome e2e/emulators/customer-order.spec.ts e2e/emulators/waiter-floor.spec.ts` | ✅ 3 recorridos. El resto de navegadores los corre la CI |
| Secretos | `npm run check:secrets` | ✅ Sin secretos en 499 archivos |
| CI | Rama `fase-4-caja-pagos` | ✅ CI #70 en verde (commit `2f7a3cb`) |

Hallazgos durante la verificación:

- Como se esperaba, la primera regresión tras exigir caja falló en las 12 pruebas de 4a, 4b y 4c que cobraban en efectivo sin turno («Abre tu caja para registrar efectivo.»); el resto (192) pasó. Se adaptaron abriendo la caja de cada persona.
- `tsc` rechazó pasar `CashScope` a la consulta genérica de las pruebas; se corrigió copiando el objeto.

## 2026-11-21 — Bloque 6 en desarrollo, caja y comprobante

El cierre anterior se verificó directamente en GitHub. La rama `fase-4-caja-pagos` apunta a `8cb5356`, que registra la aprobación del bloque 5 y de D-40. Pasaron la [CI de la implementación](https://github.com/yuliniri200712-bit/Tavelyo/actions/runs/44779285439) y la [CI del cierre documental](https://github.com/yuliniri200712-bit/Tavelyo/actions/runs/44803569658).

| Comprobación local | Resultado |
|---|---|
| `npm run check` | Formato, ESLint y tipos correctos. Pasaron 993 pruebas en 75 archivos. Las nuevas cubren el acceso del cajero, las rutas restringidas para el mesero y la confirmación de datáfono y transferencia con la misma clave al reintentar. |
| `caja-comprobante.spec.ts` con Chrome y emuladores | Un pedido de $32.000. Antes de abrir turno, el cajero no puede confirmar efectivo. Abre con $10.000, revisa y cancela, luego confirma un único cobro con $50.000 recibidos. El turno muestra $42.000 y el comprobante muestra $18.000 de cambio. El comprobante ofrece impresión y pasó la revisión automatizada de accesibilidad con axe. |
| Regresión de `backend/tests/caja-fase-4.int.test.ts` en el emulador | Pasaron las 7 pruebas del bloque 5 sobre la copia de trabajo del bloque 6, incluidas venta simultánea al cierre y devolución de efectivo. |
| `npm run check:secrets` | Sin hallazgos en los 508 archivos revisados por el comando. |

En el primer recorrido de Chrome caducó la espera de la prueba mientras las funciones cargaban la cuenta. El recorrido pasó con la espera de arranque en frío usada por las demás pruebas del proyecto. La impresión en papel y los demás navegadores quedan pendientes.

## 2026-11-21 — Revisión del trabajo local del bloque 6 y verificación de la 6a

Revisión del trabajo sin confirmar que dejaron Claude Code (2026-11-20) y Codex (2026-11-21), antes de seguir con la 6a (D-42).

Correcciones:

- Formato de Prettier en 27 archivos y 4 errores de ESLint (aserciones `!` en `backend/src/billing/account.ts`, `dataconnect/tests/salon-carta.int.test.ts` y `e2e/emulators/mesero-comanda-traslado.spec.ts`), sin cambiar el comportamiento.
- Decisiones registradas en `requirements.md`: D-41 (NIT en el comprobante, aprobado el 2026-11-20), D-42 (bloque 6 en tres partes y recomendaciones aceptadas) y D-43 (persona sin teléfono con su propio saldo). Modelo de datos al día.
- Pruebas unitarias nuevas de `submitStaffOrder` (`backend/src/orders/staff-order.test.ts`, 7): envío directo a cocina, identificadores y campos no admitidos, sin acceso a la mesa, precio cambiado, mesa cerrada y reintento con la misma clave.

| Comprobación | Resultado |
|---|---|
| `npm run check` | Formato, ESLint y tipos correctos. 1004 pruebas en 76 archivos. En una primera tanda, dos pruebas de pantalla (cocina y salón) superaron los 5 s mientras el equipo seguía cargado por Playwright; repetidas, pasan todas |
| Integración de SQL Connect | 118 pruebas, incluido el traslado con dos traslados simultáneos a la misma mesa |
| Integración del backend | 94 pruebas, con la regresión de 4a, 4b, 4c y caja (bloque 5) |
| SDK generado | Regenerado en `tavelyo-emu`; coincide con `packages/data-access/dataconnect-generated` |
| Chrome con emuladores | `caja-comprobante.spec.ts` y `mesero-comanda-traslado.spec.ts` pasan (1,7 min) |
| `npm run check:secrets` | Sin secretos en 508 archivos |

Pendiente: los otros navegadores de D-15 (los corre la CI), la impresión en papel del comprobante y la aprobación del propietario de la 6a. La 6b y la 6c tienen ya pruebas, pero se revisan y aprueban después de la 6a.

El propietario aprueba el bloque 4 (4a, 4b y 4c) el 2026-11-21, con la regresión anterior como nueva verificación.

El propietario aprueba la parte 6a (pantalla de caja y comprobante con NIT, commit `59d5fe6`) el 2026-11-21, con la CI #73 de `fase-4-caja-pagos` en verde, y autoriza la 6b. Siguen pendientes, sin bloquear la 6a, la impresión en papel del comprobante y la prueba en el Android real (bloque 9).
