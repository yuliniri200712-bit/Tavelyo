# Plan de Fase 4 — Caja y pagos

Estado: **plan y recomendaciones aprobados por el propietario el 2026-11-18** (D-05, D-06, D-29, D-30 y D-31, sección 2). **Fase autorizada** el mismo día, junto con volver a crear el contenedor de Docker de los emuladores. Rama de trabajo: `fase-4-caja-pagos`.

## 0. Cambio de alcance del 2026-11-18 (ADR-0012): la pasarela solo cobra las suscripciones

**Esta sección prevalece sobre el resto del plan.** El propietario decidió que la pasarela de pago solo se use para que los restaurantes le paguen su plan a Tavelyo. Los comensales pagan en el restaurante y Tavelyo solo registra el pago. Decisiones: D-32 a D-35, con D-04 cambiada y D-29 y D-31 anuladas (`requirements.md`).

| Bloque | Antes | Ahora |
|---|---|---|
| 1. Esquema | ✅ | Se conserva. Las tablas de la preautorización quedan sin uso |
| 2. Dinero de la cuenta | ✅ | Igual. `planSettlement` queda para las suscripciones |
| 3. Pagos en el backend | ✅ | **Se conserva desconectado** para la fase de suscripciones (D-35): no se exporta ni se usa en el restaurante |
| **3A. Ajuste (nuevo)** | ✅ Hecho (2026-11-18) | Quitar la preautorización del pedido del comensal: «Enviar pedido» en lugar de «Autorizar pago». Modo de envío por sucursal (D-32): ajuste en administración, bandeja «Pedidos por aprobar» del mesero, estado «esperando al mesero» y retiro del pedido por el comensal. Permisos nuevos `order.approve` y `branch.settings`. El backend ya no crea el adaptador simulado al arrancar |
| 4. Cuenta y cierre | Captura y liberación | El cajero **registra** efectivo, datáfono o transferencia con su comprobante (D-33); división; cierre (D-30, sin retenciones que liberar); reembolsos registrados con permiso, motivo y tope (D-34); concurrencia de dos cajeros |
| 5. Caja | — | Igual |
| 6. Operaciones | Caja, QR de pago y traslado | Caja y comprobante; el mesero toma pedidos que van directo a cocina (sin QR, D-29 anulada); traslado de mesa |
| 7. Cliente | Pagar su parte | «Mi cuenta»: lo pedido, lo pagado, la propina sugerida y cómo pagar con el mesero o en caja |
| 8. Pasarela real | Entorno de pruebas | **Sale de la fase** (fase «Suscripciones a Tavelyo») |
| 9. Cierre | — | Igual, sin pruebas de pasarela |

**Condición para terminar (nueva):** cuenta, cobro registrado, división, reembolso registrado, caja y cierre de mesa, con pruebas de duplicados, concurrencia y aislamiento. Los criterios de pasarela de PM §11 se cumplen en la fase de suscripciones.

Las secciones siguientes se escribieron antes del cambio: donde hablan de preautorización, captura, liberación, QR de pago o pasarela real, aplica esta sección.

### Bloque 4 por partes (autorización del 2026-11-19)

Cada parte termina con sus pruebas, su commit, CI en verde y un resumen al propietario. La siguiente parte requiere autorización expresa; no se integra en `main`.

- **4a — Cuenta y pagos (autorizada):** la cuenta incluye solo pedidos que llegaron a cocina, sin líneas canceladas. Pendientes de aprobación, rechazados y retirados no se cobran. El servidor calcula consumo, impuesto contenido, saldo por persona y mesa y propina sugerida; registra efectivo, datáfono propio (`TERMINAL`) o transferencia (`TRANSFER`). Los dos últimos exigen número de comprobante, nunca datos de tarjeta, ni últimos dígitos. Nuevo permiso aprobado `payment.record`: propietario, administrador de sucursal y cajero, con su ámbito de sucursal. `payment.capture` se conserva para la pasarela desconectada. Efectivo sin turno (`cashSessionId = null`) hasta el bloque 5, que exigirá caja abierta para registros nuevos sin reasignar los anteriores. Pago, asignaciones y auditoría se guardan juntos; clave idempotente con huella de intención. Las líneas con pagos confirmados no se cancelan directamente: deben revisarse con el flujo de reembolso de 4b.
- **4b — División y reembolsos (autorizada el 2026-11-19, con D-37 y D-38):** división exacta y registro de reembolsos con motivo y D-34: cajero hasta $ 50.000, administrador de sucursal hasta $ 300.000 y propietario sin tope de rol, nunca más de lo pagado menos reembolsos previos.
- **4c — Cierre y concurrencia (autorizada el 2026-11-19, con D-39):** cierre D-30 y protección del cierre existente del salón, con los escenarios completos de dos cajeros y cambios simultáneos en pedidos. 4a no declara resuelto este cierre.

### Bloque 5: caja (autorizado el 2026-11-19)

Solo servidor y conectores; la pantalla de caja es del bloque 6. Reglas de D-40, aprobadas por el propietario el 2026-11-20 junto con el bloque:

- cajas de la sucursal (`cajas.gql`): crear, renombrar y archivar con `branch.settings`;
- turno: apertura con fondo, entradas y salidas con motivo, efectivo esperado, conteo y cierre con diferencia y motivo (RF-PA-07), en `openCashSession`, `readCashSession`, `recordCashMovement` y `closeCashSession`;
- una caja abierta por persona y un turno por caja; el cajero opera solo la suya, propietario y administrador cualquiera de su sucursal;
- el efectivo de `recordPayment` y `refundPayment` pasa por la caja abierta de quien lo registra (venta y reembolso como movimientos), con bloqueo del turno frente a un cierre simultáneo;
- los cobros en efectivo anteriores, sin turno, se conservan.

## 1. Objetivo

Según PM §11: pasarela en entorno de pruebas, autorización, captura, división de la cuenta, reembolso y cierre.

**Condición para terminar (PM §11):**
- conciliación correcta;
- pruebas de duplicados, fallos y vencimientos aprobadas;
- **la habilitación real queda separada**: esta fase no cobra dinero real ni despliega nada. Pasar a cobros reales exige otra autorización expresa.

Hoy cada pedido llega a cocina con una preautorización **simulada** (D-04, Fase 3), y esa retención nunca se cobra ni se libera. Esta fase cierra el ciclo:
1. la cuenta de la mesa;
2. el cobro de lo consumido;
3. la liberación de lo sobrante;
4. el efectivo;
5. la caja;
6. los reembolsos;
7. la conciliación.

Todo esto primero con el adaptador simulado y después con una pasarela real en su entorno de pruebas.

## 2. Decisiones

### Ya tomadas

| ID | Decisión | Efecto en esta fase |
|---|---|---|
| D-01, D-01b | Colombia, COP, precios con impuestos incluidos | La cuenta desglosa el impuesto contenido; una sola moneda por cuenta |
| D-04 | Preautorización obligatoria antes de cocina; quien paga en efectivo puede pedir, y su retención se libera en esta fase | El cierre captura o libera cada preautorización |
| D-23 | El mesero no tomaba pedidos en la Fase 3; pasa a esta fase con datáfono o enlace de pago | Ver D-29 |
| ADR-0006 | Contrato `PaymentGateway` con autorizar, consultar, capturar, liberar y reembolsar | Ya existe en `packages/contracts`; se amplía, no se reemplaza |

### Pendientes que esta fase necesita

**D-02 — Pasarela de pago (la más importante).** La pasarela tiene que permitir, en Colombia, **autorizar ahora y capturar después** (D-04), capturar **menos** de lo autorizado y liberar el resto. Lo que dicen las documentaciones oficiales que revisé hoy, por orden de idoneidad:

| Proveedor | Autorizar y capturar después en Colombia | Observaciones |
|---|---|---|
| **Kushki** | Sí, documentado para Colombia | Marcado como **beta**; la documentación completa está protegida con contraseña (hay que pedirla al comercial). Según su API, la captura admite hasta un 10 % más de lo autorizado; su guía de Perú indica una sola captura por autorización (falta confirmarlo para Colombia) |
| **PayU** | **Solo bajo solicitud** al representante comercial | Sin la habilitación, solo cobra en un paso |
| **Mercado Pago** | Sí, con `capture=false` | **Solo Visa y Mastercard de Bancolombia** (la página en inglés añade BBVA) y la reserva **vence a los 7 días**. Dejaría fuera a la mayoría de las tarjetas |
| **Wompi** | No encontré documentación de preautorización | Habría que preguntarlo directamente |

Fuentes: [Kushki, autorización y captura (Colombia)](https://docs.kushki.com/co/en/card-payments/two-steps-payments/authorization-capture-overview), [Kushki, API de Colombia](https://api-docs.kushkipagos.com/colombia/online-payments/card-payments/pre-authorization), [PayU, pagos](https://developers-payu-latam.github.io/latam/en/docs/services/payments.html), [Mercado Pago, reservar fondos (Colombia)](https://www.mercadopago.com.co/developers/es/docs/checkout-api-payments/payment-management/make-value-reserve). Lo comercial (tarifas, requisitos y titular de la cuenta) lo confirma el propietario con cada proveedor.

**Qué preguntar a cada proveedor:**
1. ¿Preautorización y captura posterior para tarjetas de cualquier banco colombiano?
2. ¿Cuántos días dura la autorización?
3. ¿Se puede capturar menos de lo autorizado y liberar el resto?
4. ¿Hay entorno de pruebas (sandbox) gratuito?
5. ¿Avisan por *webhook* firmado?
6. ¿Ofrecen campos de tarjeta propios (tokenización), para que Tavelyo nunca vea el número?

**Si ninguno ofrece preautorización amplia**, D-04 tendría que revisarse como una decisión nueva. La alternativa sería **cobrar cada pedido al enviarlo a cocina** y devolver lo cancelado. Funciona con más medios de pago, pero quien paga en efectivo ya no podría pedir desde su teléfono.

**Cómo se avanza sin pasarela (D-31, decidido):** primero se construye todo lo que no depende del proveedor (bloques 1 a 7, con el adaptador simulado). El bloque 8 conecta la pasarela real en su entorno de pruebas cuando el propietario la tenga. **Si al terminar el bloque 7 todavía no hay pasarela, la Fase 4 se cierra sin el bloque 8**, y la pasarela real pasa a una fase propia, **«Fase 4B — Pasarela real»**. Es una decisión expresa del propietario que aparta la condición de PM §11 sobre la pasarela en pruebas. Mientras tanto, nada sale a producción: el adaptador simulado sigue bloqueado fuera de los emuladores.

**D-05 — Propina (aprobada).** propina voluntaria que se ofrece **al pagar la cuenta**:
- sugerida en 10 %;
- la persona la cambia o la quita;
- nunca se incluye sin que la elija.

No forma parte de la preautorización. Se paga en el pago final: en efectivo, o con un cobro aparte con tarjeta. Así no hay que capturar más de lo autorizado. El reparto de propinas entre el personal queda fuera de esta fase.

**D-06 — Quién ve y quién paga qué en la mesa compartida (aprobada):**
- **cada persona paga lo que pidió**, que es lo que cubren sus preautorizaciones;
- en su teléfono ve solo su parte;
- la caja y el mesero ven la cuenta de toda la mesa;
- si alguien quiere pagar por otros, o dividir en partes iguales, lo hace la caja a petición de la mesa, con reparto exacto (la suma de las partes es igual al total, al peso).

**D-29 — Pedidos tomados por el mesero (D-23, aprobada).** el mesero arma el pedido en su equipo y le muestra al cliente un **QR de pago**. El cliente lo escanea y autoriza en su teléfono, y solo entonces el pedido va a cocina. Así se cumple D-04 sin datáfono.

Alternativas:
- **Datáfono:** depende de la pasarela; se vería al elegirla.
- **Excepción para efectivo con permiso de un administrador:** cambia D-04; descartada por ahora.

**D-30 — Cerrar la mesa (aprobada).** Una mesa se cierra solo cuando:
- su saldo es cero;
- no le quedan líneas en cocina o por entregar (se entregan o se cancelan con motivo).

Al cerrar, toda retención sin capturar se libera.

### Tomadas en el bloque 1 (2026-11-18, dentro del alcance aprobado)

- **Sin tablas `BillItem`, `Authorization` ni `Capture` separadas.** La línea de la cuenta es la propia línea del pedido; la preautorización es `PaymentAuthorization` (una por resumen, con lo capturado); la captura es un pago `CARD_CAPTURE` con su operación ante la pasarela. Menos tablas que sincronizar y las mismas garantías (`architecture/data-model.md`).
- **`PaymentOperation` reúne el intento y la idempotencia:** una fila por llamada a la pasarela, guardada antes de llamar, con la clave que recibe la pasarela.
- **Los totales de la cuenta no se guardan mientras está abierta:** se calculan en el servidor desde las líneas, para que nunca difieran; al saldarla se guarda el total.

### Tomadas en el bloque 2 (2026-11-18, dentro del alcance aprobado)

- **Redondeo al peso:** la división en partes iguales y la propina sugerida se redondean a la unidad entera de la moneda (en COP, el peso), porque en efectivo no circulan centavos. En la división, los pesos que sobran van a las primeras partes; la suma es siempre el total exacto.
- **Tope de la propina:** como máximo el consumo de la cuenta, para evitar errores al escribir (un cero de más). Una propina mayor se puede dar en efectivo fuera de la cuenta.
- **Lo que no cubre una preautorización** (por ejemplo, si la pasarela no admite capturar más de lo autorizado) queda como faltante y se paga con otro medio; nunca se captura de más.
- **Reembolsos en curso cuentan** como ya usados al calcular lo reembolsable, para no pasarse si terminan confirmándose.

### Tomadas en el bloque 3 (2026-11-18, dentro del alcance aprobado)

- **Toda llamada a la pasarela tiene antes su operación guardada**, también la autorización del cliente: `authorizeQuote` guarda la operación AUTHORIZE y, al confirmarse, registra en una sola transacción el resumen autorizado, su `PaymentAuthorization` y el cierre de la operación. Sustituye a `ServerSetQuotePayment`.
- **Claves deterministas:**
  - autorización, `quote_<resumen>`;
  - captura, `capture_<pago>`;
  - reembolso, `refund_<reembolso>`;
  - liberación, `void_<autorización>`.

  La misma intención usa siempre la misma clave. Solo la liberación, que no mueve dinero, pasa a `void_<autorización>_2` (hasta 5) **después de un rechazo definitivo**. Sin respuesta, se repite la misma clave.
- **Cada captura pertenece a un pago** `CARD_CAPTURE` que el cobro (bloque 4) crea en PENDING; la captura lo confirma o lo deja FAILED.
- **Autorización perdida:** si la respuesta no llegó y la consulta no la encuentra, el cliente puede reintentar mientras el resumen está vigente (15 minutos). Después, la conciliación pregunta a la pasarela:
  - si la autorizó, registra la retención y la libera, porque nadie se la confirmó al cliente y el pedido no fue a cocina;
  - si no la conoce, la operación falla.

  Para esto, `PaymentOperation` guarda el resumen (`quoteId`, única columna nueva del esquema).
- **Avisos de la pasarela:**
  - **Punto de entrada:** `paymentWebhook`, una función HTTP pública porque la llama la pasarela. La autenticación es la firma.
  - **Verificación:** con el cuerpo tal como llegó, la firma HMAC-SHA256 y como máximo 5 minutos de antigüedad. Se rechazan los cuerpos de más de 64 KB.
  - **Qué se guarda:** solo la huella del cuerpo. Un aviso se procesa una sola vez por proveedor e id; el mismo id con otro cuerpo se rechaza.
  - **Qué se aplica:** solo sobre una operación propia con el mismo importe, moneda y referencia. Nunca crea cobros.
- **Conciliación cada 5 minutos** (`reconcilePayments`, con Cloud Scheduler al desplegar):
  - revisa las operaciones abiertas sin cambios en 2 minutos;
  - informa para revisión manual las que llegan a 10 intentos;
  - marca vencidas las autorizaciones que pasaron su plazo y avisa 24 horas antes;
  - libera las retenciones RELEASE_PENDING;
  - reintenta las tareas del outbox con espera de 1 minuto a 1 hora, hasta 10 veces.
- **Adaptador simulado:**
  - autorización de 7 días, como la más corta de las pasarelas estudiadas;
  - declara captura parcial y reembolso parcial, y no autorización incremental;
  - firma sus avisos con un secreto aleatorio por instancia: nadie de fuera puede firmar avisos, y en el repositorio no hay ningún secreto;
  - las pruebas le inyectan rechazos, tiempos agotados, vencimientos, reembolsos en curso y avisos repetidos o desordenados.
- **Capacidades del contrato (ADR-0006):**
  - se declaran `partialCapture`, `incrementalAuthorization` y `partialRefund` (esta última es nueva);
  - el plazo de la autorización llega en cada una como `expiresAt`;
  - `multipleCaptures` no se usa, porque hay una captura por preautorización (D-06).

## 3. Diseño propuesto

### La cuenta de la mesa

- **Qué incluye:** la cuenta de una sesión de mesa reúne sus pedidos. Las líneas canceladas no se cobran. El impuesto se desglosa como contenido (D-01b).
- **Cómo se calcula:** lo calcula **el servidor**, siempre desde las instantáneas de cada línea (PM §6). Los importes van en unidades menores enteras; nunca hay números con decimales flotantes.
- **Reparto:** las asignaciones de pago suman exactamente el total. El redondeo es determinista y la diferencia de un peso va a una sola parte conocida.
- **Concurrencia:** la cuenta tiene versión. Si dos cajeros cobran o cierran a la vez, uno gana y el otro ve el conflicto, sin cobrar dos veces (caso 9).

### Pagos

- **Con tarjeta**, por cada preautorización:
  - al cobrar se **captura** solo lo consumido de ese pedido;
  - lo sobrante se **libera**.
  - Una autorización vencida no se captura: se pide un pago nuevo (PM §8, paso 9).
- **En efectivo:** la caja lo registra con el importe recibido y el cambio, y libera las preautorizaciones que cubría.
- **Reembolsos:**
  - operación aparte, con permiso, **motivo** y tope;
  - nunca superan lo capturado menos lo ya reembolsado (caso 10);
  - no se marcan como hechos hasta que la pasarela los confirma.
- **Fiabilidad entre Tavelyo y la pasarela:**
  - cada operación tiene un intento guardado antes de llamar a la pasarela, con una clave de idempotencia;
  - si se agota el tiempo, se consulta o se repite la misma operación; nunca se crea un cobro nuevo (caso 7).
- **Avisos de la pasarela (*webhooks*):**
  - se verifica la firma, el importe, la moneda y la referencia;
  - los repetidos, los tardíos o los que llegan fuera de orden no retroceden un estado confirmado (caso 8).
- **Conciliación:** una tarea revisa cada cierto tiempo:
  - las operaciones con resultado desconocido;
  - las autorizaciones a punto de vencer, y avisa;
  - las retenciones pendientes de liberar.

  En producción la lanzaría Cloud Scheduler (tarea de despliegue ya aprobada); aquí se prueba en los emuladores.
- **Adaptador simulado:**
  - se amplía para reproducir lo que hace una pasarela real: rechazos, tiempo agotado, resultado desconocido, vencimiento, avisos repetidos o desordenados y capacidades declaradas (captura parcial, autorización incremental);
  - **sigue bloqueado fuera de los emuladores**.

### Caja (POS, `operations`)

- **Sesión de caja:**
  - apertura con fondo inicial;
  - entradas y salidas con motivo;
  - efectivo esperado, conteo, diferencia y cierre auditado (RF-PA-07).
- **Pantalla de caja:**
  - mesas con cuenta abierta;
  - detalle por persona y total;
  - cobrar con tarjeta (captura) o en efectivo;
  - dividir;
  - reembolsar;
  - cerrar la mesa.
- **Comprobante comercial** del pago, para ver e imprimir. **No es factura electrónica:** en Colombia la factura electrónica de la DIAN es otra obligación, que sigue fuera del alcance (RF-PA-08) y hay que tratar aparte con tu contador.

### Meseros

- **Pedido con QR de pago** (D-29).
- **Trasladar una mesa:** pasar la sesión abierta a otra mesa libre. Es transaccional, auditado y con `session.transfer`.
- **Unir mesas** se propone para más adelante: mezcla dos cuentas con personas y retenciones distintas, y conviene hacerlo cuando la cuenta ya esté probada.

### Cliente (`menu-web`)

- **«Mi cuenta»:**
  - lo que pidió y lo que ya está pagado;
  - la propina voluntaria (D-05);
  - el pago de su parte;
  - su comprobante.
- «Pedir la cuenta» (Fase 3) lleva a esta pantalla y avisa al mesero.

## 4. Alcance por bloques

1. **Decisiones y esquema:**
   - D-02 (si ya está), D-05, D-06, D-29 y D-30 registradas;
   - entidades de cuenta, intentos de pago, capturas, liberaciones, reembolsos, asignaciones, avisos de la pasarela, idempotencia, tareas pendientes (*outbox*) y caja (sesión, movimientos y conteo);
   - claves foráneas con empresa y sucursal en todas;
   - permisos de la matriz (`bill.*`, `payment.*`, `cash_session.*`) con sus topes.
2. **Dinero de la cuenta (`core`, lógica pura con pruebas):**
   - cálculo de la cuenta y del impuesto contenido;
   - reparto exacto y redondeo;
   - propina;
   - qué capturar y qué liberar de cada autorización.
3. **Pagos en el backend con el adaptador simulado:**
   - captura, liberación, reembolso y consulta de estado;
   - idempotencia;
   - *webhooks* firmados;
   - conciliación;
   - fallos simulados.
4. **Cuenta y cierre:**
   - cobro por persona (D-06), efectivo y división;
   - cierre de mesa (D-30);
   - reembolsos con permiso y tope;
   - concurrencia de dos cajeros.
5. **Caja:** apertura, movimientos, conteo y cierre.
6. **Operaciones:**
   - pantalla de caja y comprobante;
   - el mesero toma pedidos con QR de pago (D-29);
   - trasladar mesa.
7. **Cliente:** «Mi cuenta», propina, pago de su parte y comprobante.
8. **Pasarela real en su entorno de pruebas (necesita D-02; si no la hay al terminar el bloque 7, pasa a la Fase 4B por D-31):**
   - adaptador del proveedor;
   - campos de tarjeta del proveedor (Tavelyo nunca ve el número ni el CVV);
   - *webhooks* verificados;
   - pruebas contra el entorno de pruebas: rechazo, autenticación adicional (3DS), vencimiento, captura menor, liberación y reembolso.
9. **Cierre:**
   - recorridos de caja, mesero y cliente en los 5 navegadores;
   - accesibilidad;
   - prueba en tu Android;
   - documentación y resumen para aprobación.

**Fuera de alcance:**
- cobros reales y despliegue (habilitación real separada);
- factura electrónica de la DIAN;
- datáfono físico;
- descuentos y cargos de servicio (necesitan su política: quién los aprueba y con qué tope);
- unir mesas;
- reparto de propinas al personal;
- informes de ventas e inventario (Fase 5);
- notificaciones fuera de la app.

## 5. Archivos y áreas afectadas

| Área | Contenido |
|---|---|
| `dataconnect/` | Esquema de cuenta, pagos y caja; conectores de caja, mesero y cliente, con pruebas de aislamiento |
| `backend/` | Cobro, liberación, reembolso, efectivo, cierre, *webhooks*, conciliación y adaptadores (simulado y real) |
| `packages/core` | Cálculo de la cuenta, reparto, redondeo y propina |
| `packages/contracts` | Ampliación de `PaymentGateway` (capacidades declaradas) y contratos nuevos |
| `packages/data-access` | Pasarelas nuevas y SDK regenerado |
| `packages/features/` | Módulos nuevos `billing` (cuenta y cobro) y `cash` (caja); cambios en `floor`, `orders` y `table-session` |
| `apps/operations`, `apps/menu-web` | Pantallas de caja, del mesero y «Mi cuenta» |
| `e2e/` | Recorridos nuevos de caja, efectivo, división, reembolso y conciliación |
| `docs/` | Plan, decisiones, modelo de datos, permisos, estados, amenazas, ADR-0006 (proveedor) y pruebas |

**Paquetes nuevos:** ninguno en los bloques 1 a 7. Para el bloque 8 intentaré usar la API del proveedor con `fetch`, sin SDK. Si el proveedor exige su script de campos de tarjeta, o un paquete, lo traigo como aprobación aparte, con su efecto en la seguridad de la página.

## 6. Pruebas

- **Unitarias:**
  - cuenta, impuesto contenido, reparto exacto y redondeo (la suma de las partes es siempre el total);
  - propina;
  - qué capturar y liberar;
  - estados del intento de pago y del reembolso.
- **Integración (emuladores):**
  - empresas e IDs alterados en cada operación (caso 1);
  - membresía revocada (caso 2);
  - doble pulsación y reintento tras tiempo agotado: un solo cobro (caso 3);
  - dos cajeros a la vez (casos 4 y 9);
  - rechazo, autenticación adicional, vencimiento, consumo mayor que lo autorizado y captura menor (caso 6);
  - captura hecha en la pasarela y caída antes de guardarla: la conciliación la recupera sin volver a cobrar (caso 7);
  - *webhook* inválido, repetido o fuera de orden (caso 8);
  - reembolso repetido o mayor que lo disponible (caso 10);
  - mesa cerrada sin acceso a la cuenta siguiente (caso 12).
- **Navegador:**
  - caja, mesero y cliente en los 5 navegadores de D-15;
  - axe, teclado, 320 px y texto al 200 %.
- **Pasarela real (bloque 8):** las mismas situaciones contra el entorno de pruebas del proveedor, con sus tarjetas de prueba.
- **Dispositivo real:** tu Android como cliente que paga y el computador como caja.

## 7. Criterios de aceptación

1. **Nunca se cobra dos veces** y nunca se captura más de lo autorizado. Los reembolsos no superan lo capturado.
2. Una cuenta solo queda pagada con capturas confirmadas o efectivo registrado. La suma de los pagos es exactamente el total, y ninguna retención queda olvidada: se captura o se libera.
3. Los fallos entre Tavelyo y la pasarela (tiempo agotado, caída, avisos repetidos o desordenados) se resuelven con la conciliación sin cobros dobles.
4. La caja cuadra: efectivo esperado, conteo y diferencia, con auditoría.
5. Aislamiento por empresa, sucursal y mesa, y permisos con topes, validados en el servidor.
6. Pantallas accesibles como en las fases anteriores; el estado de un pago nunca depende solo del color.
7. La pasarela elegida funciona en su entorno de pruebas (bloque 8) o, por D-31, queda como Fase 4B con el contrato y el adaptador simulado listos para conectarla. CI en verde, sin secretos y con la documentación al día. Sin cobros reales ni despliegue.

## 8. Aprobaciones que pide este plan

- ✅ El plan y su alcance (secciones 3 y 4), aprobados el 2026-11-18.
- ✅ **D-05, D-06, D-29 y D-30** (sección 2), aprobadas el 2026-11-18.
- ✅ **D-31:** sin pasarela al terminar el bloque 7, la Fase 4 se cierra sin el bloque 8 y la pasarela real pasa a la Fase 4B.
- **D-02:** no hace falta decidirla para empezar, pero sí antes del bloque 8 (o de la Fase 4B).
- **Volver a crear el contenedor de Docker de los emuladores** (`tavelyo-emu`, el mismo de las fases 3 y 3B), que se borró al cerrar la Fase 3B. Se borra al cerrar esta fase.
- Más adelante, en el bloque 8 y por separado:
  - las credenciales de prueba del proveedor, que van fuera del repositorio;
  - cómo recibir sus *webhooks* de prueba, que necesitan una dirección pública (desplegar el backend en el proyecto de desarrollo o usar un túnel). Te mostraré el costo, si lo tiene, antes de activar nada.

## 9. Riesgos

- **La pasarela es la mayor incertidumbre:** en Colombia la preautorización no está disponible en todos los proveedores ni para todas las tarjetas. Si no hay una opción amplia, D-04 tendría que revisarse.
- **Autorizar, capturar y guardar no es atómico** entre Tavelyo y la pasarela (PM §8). Se cubre con intentos persistentes, idempotencia, conciliación y pruebas de caídas.
- **Las autorizaciones vencen** (por ejemplo, 7 días en Mercado Pago). Una cena dura horas, pero una mesa olvidada abierta podría perder cobertura. La conciliación avisa antes del vencimiento.
- **El adaptador simulado no garantiza el comportamiento real:** por eso el bloque 8 es obligatorio para cerrar la fase.
- **Factura electrónica:** el comprobante de Tavelyo no la sustituye. Hay que decidir aparte cómo se factura (con tu contador o un proveedor de facturación).
- **Es la fase más grande hasta ahora.** Por D-31, el bloque 8 va a la Fase 4B si la pasarela tarda.
- **Lógica probada solo con el simulado hasta la Fase 4B:** si la pasarela elegida no permite preautorizar, habrá que ajustar parte del cobro (cobrar cada pedido al enviarlo). El contrato separado del proveedor limita ese ajuste.
