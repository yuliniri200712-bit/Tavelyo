# Plan de Fase 3 — Pedidos

Estado: **aprobado por el propietario el 2026-11-16**, con las recomendaciones de D-23 a D-26 y la aclaración de D-04 sobre clientes sin teléfono y pago en efectivo (sección 2). Rama de trabajo: `fase-3-pedidos`.

## 1. Objetivo

Según PM §11: envío a cocina, estaciones, cocina, solicitudes de servicio, recogida y entrega.

**Condición para terminar:**
- flujo completo con concurrencia y reconexión;
- estados inválidos rechazados por el servidor;
- **no liberar un flujo sujeto a garantía sin adaptador válido**.

Por D-04, todo pedido está sujeto a garantía. Mientras no haya pasarela real (D-02, Fase 4), la Fase 3 funciona **solo con el adaptador simulado, en los emuladores**, y no se puede llevar a producción.

## 2. Decisiones

### Ya tomadas

| ID | Decisión |
|---|---|
| D-04 (2026-11-16) | **Preautorización obligatoria y sin excepciones**: ningún pedido llega a cocina sin un pago autorizado que el servidor haya verificado |
| ADR-0007 | Cocina y meseros se actualizan con suscripciones de SQL Connect, y al abrir la pantalla, reconectar o volver a primer plano se recupera todo lo pendiente (caso 11) |
| D-06 (carrito) | Cada persona tiene su carrito y ve solo sus pedidos |

### Consecuencias de D-04 que este plan asume

- **Aclaración del propietario (2026-11-16):**
  - **Un cliente sin teléfono puede pedir por medio de otra persona de la mesa que sí lo tenga.** Esa persona se une a la mesa y hace el pedido desde su teléfono.
  - **Quien paga en efectivo también puede pedir.** La preautorización es la garantía para que el pedido llegue a cocina; el pago final de la cuenta puede hacerse en efectivo, y entonces la retención se libera (Fase 4, caja).
  - Sigue sin haber pedidos sin una preautorización verificada.
- **Cada envío a cocina tiene su propia preautorización.** Si la mesa pide una segunda ronda, se revisa y se autoriza ese pedido nuevo. No se aumenta en silencio la retención anterior (PM §8, paso 5).
- **Cancelar una línea no devuelve dinero en esta fase.** Lo autorizado sigue reservado. En la Fase 4 se captura solo lo consumido y se libera el resto, según lo que permita la pasarela.

### Decididas al aprobar el plan (2026-11-16: el propietario aprobó las recomendaciones)

| ID | Pregunta | Decisión |
|---|---|---|
| D-23 | **¿El mesero puede tomar pedidos?** Por D-04, el pedido necesita la preautorización del cliente, y sin pasarela real no hay datáfono ni enlace de pago | **No en la Fase 3: los pedidos salen del teléfono del cliente.** La toma de comandas por el mesero (RF-ME-02) pasa a la Fase 4, cuando la pasarela permita autorizar con datáfono o con un enlace de pago |
| D-24 | **Estaciones de cocina:** ¿cada persona de cocina tiene estaciones asignadas, o elige en pantalla? | **Elige en pantalla** entre las estaciones de su sucursal. La asignación por persona queda para cuando haga falta |
| D-25 | **Cierre por inactividad en la pantalla de cocina:** hoy toda sesión se cierra a los 15 minutos sin uso (D-19), y cocina mira la pantalla sin tocarla | **La pantalla de cocina no se cierra por inactividad mientras está visible.** El resto de la app sigue con los 15 minutos, y cerrar la sesión sigue disponible |
| D-26 | **Retroceder un estado** (por ejemplo, de «en preparación» a «recibido»): ¿se permite? | **No.** Un error se corrige cancelando la línea con motivo (y, si hace falta, con un pedido nuevo). Queda todo auditado |

## 3. Diseño propuesto

### Del resumen autorizado al pedido

1. El cliente revisa su pedido (`quoteOrder`, Fase 2) y acepta la preautorización. Se guarda **qué texto aceptó y en qué versión** (RF-PA-02).
2. `authorizeQuote` autoriza el importe del resumen guardado. Si la autorización se confirma, el **mismo backend crea el pedido**:
   - una sola vez por resumen, por la unicidad del pedido sobre el resumen;
   - con una operación del conector, para que cocina reciba la señal al instante (ADR-0007, regla 3).
3. Si el pedido no se pudo crear después de autorizar (caída entre los dos pasos), reintentar la misma solicitud lo crea sin volver a autorizar. Una tarea de conciliación revisa los resúmenes autorizados sin pedido.
4. Antes de crear el pedido, el servidor vuelve a comprobar:
   - que la mesa sigue abierta;
   - que la persona sigue siendo participante;
   - que el resumen no venció.

   Si algo falla, el pedido no se envía y la autorización queda **para liberar** (simulado ahora, real en la Fase 4).

### Pedido y líneas

- **Pedido (`Order`):** pertenece a la sesión de mesa y a quien lo pidió. Guarda las instantáneas del resumen: nombres, precios, opciones y notas. Su estado se **deriva** de sus líneas (RF-CO-02).
- **Línea (`OrderItem`):** cantidad, opciones, nota, **estación** y estado:

  `recibido → en preparación → listo → recogido → entregado`

  y además `cancelado`, con motivo y permiso (ver `architecture/state-machines.md`).
  - Cocina controla hasta «listo»; el mesero, «recogido» y «entregado» (RF-CO-03).
  - Saltarse «recogido» exige `delivery.skip_sequence` y motivo.
  - Cancelar exige `order_item.cancel` y motivo; si la línea ya estaba en preparación, queda marcada como merma (el inventario es de la Fase 5).
- **Concurrencia:** cada cambio de estado comprueba en el servidor el estado actual y la versión de la línea.
  - Si dos personas avanzan la misma línea a la vez, una gana y la otra ve «Esta línea ya cambió» con el estado real (RNF-05, caso 4).
  - Un avance incompatible (por ejemplo, «listo» desde «recibido») se rechaza.

### Estaciones

- Cada sucursal define sus estaciones (por ejemplo, Cocina caliente, Bar). Cada producto de la carta de la sucursal se asigna a una estación.
- Un producto sin estación va a la estación predeterminada de la sucursal, que siempre existe.

### Cocina (`operations`, permiso `kitchen.advance`)

- **Cola por estación:**
  - orden por antigüedad;
  - en cada línea: mesa, hora, **minutos transcurridos**, cantidad, opciones y nota;
  - los alérgenos declarados del producto siempre visibles;
  - **sin importes ni datos del cliente** (permisos §4).
- **Botones grandes:** «Empezar» y «Listo». La línea cambia también para el mesero y el cliente al instante.
- **Pedido nuevo:** se avisa con texto, un cambio visual y, si la persona lo activa, un sonido. Ninguno es la única señal, y un aviso nunca tapa la información de alérgenos (PM §7).
- **Sin conexión:**
  - lo dice y muestra la hora de la última actualización;
  - no deja avanzar estados;
  - al volver, recupera todo lo pendiente (caso 11).

### Meseros (`operations`)

- **Salón** (RF-ME-01): cada mesa muestra su ocupación y, en texto, si tiene pedidos en curso, líneas listas para recoger o solicitudes pendientes.
- **«Listos para recoger»:** lista por sucursal; «Recogido» y «Entregado».
- **Solicitudes de servicio:** «Llamar al mesero» y «Pedir la cuenta», con su mesa y su hora; «Atendida».
- **Cancelar una línea** con motivo, según la matriz de permisos.

### Cliente (`menu-web`)

- «Autorizar pago simulado» pasa a ser **«Autorizar y enviar a cocina»**. Antes muestra el texto de la preautorización, con el importe, la moneda y para qué es.
- **«Mis pedidos»:** cada pedido con el estado de cada línea, en vivo y en texto. La persona ve solo los suyos (D-06).
- **«Llamar al mesero»** y **«Pedir la cuenta»:** el backend aplica límites para evitar abusos (T11). La cuenta en sí es de la Fase 4; aquí solo se avisa al mesero.
- Puede hacer **más de un pedido** en la misma sesión, cada uno con su revisión y su preautorización.

## 4. Alcance por bloques

1. **Decisiones y esquema:**
   - D-23 a D-26 registradas;
   - entidades `Station`, estación en `ProductBranch`, `Order`, `OrderItem`, `OrderItemModifier`, `ServiceRequest` y la versión del texto de consentimiento;
   - FK compuestas con `tenantId`, versión en las líneas y estado derivado del pedido.
2. **Conectores y autorización:**
   - cola de cocina por estación, suscribible y con consulta incremental;
   - avanzar, recoger, entregar, saltar secuencia y cancelar, con comprobación de estado y versión;
   - estaciones;
   - solicitudes de servicio;
   - «mis pedidos» del cliente.

   Pruebas con dos empresas, IDs alterados, sesiones cerradas, transiciones inválidas y carreras.
3. **Backend:**
   - `authorizeQuote` crea el pedido tras autorizar, sin duplicados por doble pulsación o reintento (caso 3);
   - recuperación si se cae entre autorizar y crear el pedido;
   - `requestService` con límites;
   - consentimiento con versión del texto.
4. **Operaciones, administración y cocina:**
   - estaciones de la sucursal y asignación de productos;
   - pantalla de cocina en tiempo real con recuperación al reconectar.
5. **Operaciones, meseros:**
   - salón con pedidos y solicitudes;
   - «Listos para recoger», recoger y entregar;
   - solicitudes;
   - cancelar con motivo.
6. **Cliente (`menu-web`):**
   - autorizar y enviar a cocina;
   - «Mis pedidos» en vivo;
   - llamar al mesero y pedir la cuenta.
7. **Cierre:**
   - concurrencia (dos personas sobre la misma línea);
   - desconexión y reconexión de cocina (caso 11);
   - recorridos de mesero, cocina y cliente en los 5 navegadores;
   - accesibilidad (teclado, 320 px, texto al 200 %, TalkBack);
   - prueba en tu Android, con el teléfono como cliente y el computador como cocina;
   - documentación y resumen para aprobación.

**Fuera de alcance:**
- toma de comandas por el mesero (D-23, propuesta para la Fase 4);
- traslados y uniones de mesas (`session.transfer` y `session.merge`, propuestos para la Fase 4 junto con la cuenta);
- cuenta, propinas (D-05), división de cuentas (D-06), captura, reembolsos y pasarela real (Fase 4);
- inventario y merma valorizada (Fase 5);
- notificaciones fuera de la app (Web Push);
- despliegue.

## 5. Archivos y áreas afectadas

| Área | Contenido |
|---|---|
| `dataconnect/` | Esquema de pedidos, estaciones y solicitudes; conectores de cocina, meseros y cliente, con sus pruebas |
| `backend/` | Creación del pedido tras autorizar, recuperación, `requestService` y consentimiento |
| `packages/core` | Máquina de estados de la línea y estado derivado del pedido (lógica pura con pruebas) |
| `packages/contracts` | Contratos nuevos del cliente y permisos si faltara alguno |
| `packages/data-access` | Pasarelas nuevas, suscripciones y SDK regenerado |
| `packages/features/` | Módulos nuevos: `kitchen` (cocina), `orders` (pedidos del mesero y del cliente) y `service-requests` (solicitudes) |
| `packages/design-system` | Lo que haga falta: tarjeta de línea de cocina, temporizador y aviso de pedido nuevo |
| `apps/operations`, `apps/menu-web` | Pantallas de esta fase |
| `e2e/` | Recorridos nuevos, concurrencia y reconexión |
| `docs/` | Progreso, pruebas, ADR-0011 y ADR-0007 (implementación), modelo de datos, permisos, estados y amenazas |

**Paquetes nuevos:** ninguno previsto. Las suscripciones están en el SDK de Firebase ya aprobado, y el sonido del aviso usa la API del navegador.

## 6. Pruebas

- **Unitarias:**
  - máquina de estados de la línea: transiciones válidas e inválidas;
  - estado derivado del pedido;
  - minutos transcurridos en la zona de la sucursal;
  - textos y avisos.
- **Integración (emuladores):**
  - dos empresas e IDs alterados en cada operación (caso 1);
  - doble pulsación y reintento al autorizar: un solo pedido (caso 3);
  - dos personas avanzan la misma línea: una gana y la otra recibe el conflicto (caso 4);
  - sesión cerrada sin acceso a pedidos (caso 12);
  - sin autorización no hay pedido (D-04);
  - caída entre autorizar y crear el pedido;
  - límites de solicitudes.
- **Tiempo real:**
  - cocina recibe un pedido nuevo sin recargar;
  - al cortar y recuperar la conexión, recupera lo pendiente y no pierde avances confirmados (caso 11).
- **Navegador:**
  - recorridos de cocina, mesero y cliente en los 5 navegadores de D-15;
  - axe, teclado, 320 px y texto al 200 %.
- **Dispositivo real:** tu Android como cliente y el computador como pantalla de cocina y del mesero.

## 7. Criterios de aceptación

1. **Ningún pedido llega a cocina sin una preautorización verificada por el servidor (D-04)**, y un reintento o una doble pulsación nunca crea dos pedidos.
2. Los estados avanzan solo en el orden permitido y por el rol permitido. Lo inválido o concurrente se rechaza con un mensaje claro y sin perder lo ya confirmado.
3. Cocina y meseros ven los cambios sin recargar. Tras una desconexión, recuperan el estado real.
4. Una persona de otra empresa, sucursal o mesa no ve ni cambia pedidos ajenos. Cocina no ve importes ni datos del cliente.
5. Las pantallas nuevas cumplen las reglas de accesibilidad de las fases anteriores. El estado nunca depende solo del color, del sonido o de una animación.
6. CI en verde, sin secretos y con la documentación al día. El flujo sigue **solo con pago simulado**: no se libera en producción hasta tener la pasarela real (Fase 4).

## 8. Aprobaciones que pide este plan

- ✅ El plan, con las decisiones **D-23 a D-26** (sección 2), aprobado el 2026-11-16.
- ✅ Aclaración de D-04: un cliente sin teléfono pide por medio de otra persona de la mesa, y quien paga en efectivo puede pedir; la preautorización sigue siendo obligatoria antes de cocina.

## 9. Riesgos

- **Es la primera fase con tiempo real en producción de pantallas.** El emulador no reproduce la latencia real; las suscripciones se verifican de nuevo al desplegar.
- **Autorizar y crear el pedido no es atómico:** la pasarela y la base de datos son sistemas distintos (PM §8). Se cubre con idempotencia por resumen, reintento y conciliación, y se prueba la caída entre los dos pasos.
- **D-04 sin excepciones puede frenar la operación real:** una mesa donde nadie tenga teléfono o tarjeta no puede pedir, y los pedidos al mesero llegan en la Fase 4. Si en el piloto resulta un problema, se revisa como una decisión nueva.
- **Una pantalla de cocina siempre abierta** (D-25) aumenta el riesgo si el equipo queda sin vigilancia. Se mitiga con el permiso mínimo (`kitchen.advance`, sin importes ni datos del cliente) y con el cierre de sesión visible.
