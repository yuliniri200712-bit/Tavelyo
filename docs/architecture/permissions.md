# Matriz de permisos

Estado: **borrador de Fase 0**. Base: PM §5. Los permisos se modelan **por acción**; los roles son agrupaciones de permisos. Toda comprobación ocurre en el servidor; ocultar botones o rutas en la PWA solo mejora la experiencia.

## 1. Reglas generales

1. Denegar por defecto. Autenticarse no concede acceso a ningún dato.
2. Cada lectura y escritura comprueba: membresía activa → rol → ámbito (empresa y sucursal) → permiso de la acción.
3. El `tenant_id`/`branch_id` enviado por el cliente **selecciona** contexto; nunca demuestra autorización.
4. No confiar solo en roles dentro del token: la membresía se verifica contra la base en operaciones privilegiadas (estrategia de revocación en ADR-0008).
5. Una invitación no puede asignar un rol con `rank` superior al del invitador.
6. Excepciones (saltar secuencia, superar topes) requieren permiso específico, motivo y auditoría.

## 2. Roles

| Código | Rol | Ámbito |
|---|---|---|
| `platform_operator` | Operador de plataforma | Aprovisionamiento y soporte; sin lectura general de consumos ni datos personales; acceso excepcional temporal, motivado y auditado |
| `tenant_owner` | Propietario de empresa | Toda su empresa |
| `branch_admin` | Administrador de sucursal | Sucursales asignadas |
| `waiter` | Mesero | Sucursal asignada; mesas asignadas cuando aplique |
| `kitchen` | Cocina | Estaciones asignadas |
| `cashier` | Cajero | Su caja y cuentas de su sucursal |
| `customer` | Cliente | Su sesión de mesa |

## 3. Matriz acción × rol

Leyenda: ✅ permitido · 🔸 permitido con tope, motivo o autenticación reforzada · — denegado.

| Acción | Owner | Br. admin | Mesero | Cocina | Cajero | Cliente |
|---|---|---|---|---|---|---|
| `menu.read` (publicado) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `catalog.manage` | ✅ | 🔸 catálogo local | — | — | — | — |
| `price.change` | 🔸 | 🔸 | — | — | — | — |
| `table.manage` (sectores/mesas) | ✅ | ✅ | — | — | — | — |
| `session.open` / `session.close` | ✅ | ✅ | ✅ | — | ✅ | — |
| `session.transfer` / `session.merge` | ✅ | ✅ | 🔸 | — | — | — |
| `order.create` | ✅ | ✅ | ✅ | — | — | ✅ propia sesión |
| `order.amend` (tras envío) | ✅ | ✅ | 🔸 | — | — | — |
| `order.approve` (pedidos del cliente, D-32) | ✅ | ✅ | ✅ | — | — | — |
| `order_item.cancel` | ✅ | 🔸 | 🔸 | 🔸 | — | — |
| `kitchen.advance` (→ `en_preparacion`, `listo`) | — | — | — | ✅ | — | — |
| `delivery.pickup` / `delivery.deliver` | — | — | ✅ | — | — | — |
| `delivery.skip_sequence` | ✅ | 🔸 | — | — | — | — |
| `service_request.create` | — | — | — | — | — | ✅ |
| `service_request.handle` (marcar como atendida) | ✅ | ✅ | ✅ | — | ✅ | — |
| `bill.read` | ✅ | ✅ | ✅ sin datos de pago | — | ✅ | ✅ propia cuenta |
| `bill.split` | ✅ | ✅ | — | — | ✅ | — |
| `bill.discount` | ✅ | 🔸 | — | — | 🔸 tope | — |
| `payment.authorize` (iniciar; sin uso en el restaurante desde ADR-0012) | — | — | — | — | ✅ | ✅ propia cuenta |
| `payment.capture` | ✅ | ✅ | — | — | ✅ | — |
| `payment.record` (efectivo, datáfono propio o transferencia) | ✅ | ✅ | — | — | ✅ | — |
| `payment.void_authorization` | ✅ | ✅ | — | — | 🔸 | — |
| `payment.refund` (registrado, D-34; siempre con motivo) | 🔸 sin tope | 🔸 hasta $ 300.000 | — | — | 🔸 hasta $ 50.000 | — |
| `cash_session.open` / `close` | ✅ | ✅ | — | — | ✅ su caja | — |
| `inventory.manage` | ✅ | ✅ | — | — | — | — |
| `staff.invite` | ✅ | 🔸 rango inferior | — | — | — | — |
| `role.assign` | 🔸 | 🔸 rango inferior | — | — | — | — |
| `report.read` | ✅ | ✅ su sucursal | — | — | 🔸 su turno | — |
| `report.export` | 🔸 | 🔸 | — | — | — | — |
| `tenant.settings` | 🔸 | — | — | — | — | — |
| `branch.settings` (modo de envío a cocina, D-32) | ✅ | ✅ su sucursal | — | — | — | — |

El operador de plataforma no aparece en la matriz operativa: solo tiene permisos de aprovisionamiento y un mecanismo de acceso excepcional (pendiente de diseño en Fase 1).

## 4. Datos visibles por rol (minimización)

- **Cocina**: sin importes, medios de pago ni datos personales del cliente.
- **Mesero**: estado de la cuenta, pero no referencias de pago ni datos de tarjeta.
- **Cliente**: solo su sesión; en mesas compartidas, según D-06.
- **Nadie**: PAN ni CVV (no se almacenan).

## 5. Implementación (Fase 1)

- Catálogo en código: `packages/contracts/src/authorization.ts`. Una prueba compara cada rol con la tabla de la sección 3 de este documento (✅ y 🔸 conceden); si cambia una sin la otra, CI falla. `service_request.create` es del cliente y no forma parte del catálogo del personal.
- Permiso añadido: **`audit.read`** (ver el registro de auditoría), solo para el propietario.
- Permiso añadido en la Fase 3 (bloque 1, 2026-11-16): **`service_request.handle`** (marcar como atendida una solicitud de servicio), para propietario, administrador de sucursal, mesero y cajero. La matriz solo tenía el del cliente (`service_request.create`). Las estaciones de cocina y la asignación de productos se gestionan con **`catalog.manage`**, porque se editan junto con la carta de la sucursal.
- Rangos: propietario 100, administrador de sucursal 80, cajero 40, mesero 30, cocina 30. Nadie agrega, modifica, asigna sucursales ni revoca a alguien de rango igual o superior al propio, ni asigna un rol igual o superior (incluye cambiar el propio rol).
- Gestión del personal: `staff.invite` cubre agregar, listar y revocar; `role.assign` cubre cambiar el rol y asignar o quitar sucursales. Quien no es propietario solo asigna sucursales que tiene asignadas.
- Pendiente de fases siguientes: invitar por correo (requiere el backend para buscar al usuario), reactivar una membresía revocada y roles personalizados por empresa.

### Backend (Fase 1, 2026-11-14)

- **`revokeMember`** (función callable): ejecuta la mutación `RevokeMember` del conector **suplantando a quien llama**, así que aplican sus reglas (membresía, `staff.invite`, rango, auditoría). Si a la persona revocada no le queda ninguna membresía activa, el backend revoca sus *refresh tokens* (cierra todas sus sesiones) y lo registra como `auth.sessions_revoked`. Si conserva otra membresía, mantiene la sesión y el acceso a esa otra empresa.
- **`provisionTenant`** (función callable): crea empresa, primera sucursal, membresía `tenant_owner` y `AuditEvent` (`tenant.provision`) en una sola transacción. Moneda y zona horaria son obligatorias (no se infieren, D-01). Si el correo de la persona propietaria no tiene cuenta, se crea sin contraseña y ella la define con «¿Olvidaste tu contraseña?».
- **Operador de plataforma:** afirmación personalizada `platform_operator: true` en Firebase Auth, que solo concede el Admin SDK. El backend la lee **del servidor de Auth en cada llamada** (`getUser`), no solo del token: retirarla o revocar las sesiones del operador surte efecto en la llamada siguiente, y una afirmación metida en un token pero no guardada en la cuenta se rechaza. El operador no obtiene membresía ni acceso a los datos de las empresas que crea.
- Toda entrada se valida en el servidor y se rechazan campos no admitidos.

### Salón y carta (Fase 2, 2026-11-14)

| Operaciones | Permiso | Ámbito |
|---|---|---|
| Vista del salón, participantes, abrir mesa | `session.open` | Sucursal asignada (propietario: todas) |
| Cerrar mesa, expulsar participante | `session.close` | Sucursal asignada |
| Sectores, mesas, archivado y rotación del QR | `table.manage` | Sucursal asignada |
| Categorías, productos, modificadores y alérgenos | `catalog.manage` **y** rol propietario | Empresa |
| Disponibilidad y horario por sucursal | `catalog.manage` | Sucursal asignada: es el «catálogo local» 🔸 del administrador de sucursal |
| Precio por sucursal (versión nueva en `Price`) | `price.change` | Sucursal asignada |
| Consultar la carta de administración | `catalog.manage` o `price.change` | Empresa; la de la sucursal, con la sucursal asignada |
| Impuestos (`TaxRule`) | `tenant.settings` | Empresa (D-01b: la tasa la decide la empresa con su contador) |
| Listar todas las sucursales (archivadas incluidas), crearlas, editarlas, archivarlas y restaurarlas | `tenant.settings` | Empresa; la moneda es la de la empresa y no cambia |

- El mesero no ve el `qrPublicId` (solo quien gestiona las mesas, para imprimirlo) ni el uid de Firebase Auth de los clientes que se unen a la mesa.
- El cliente (`customer`) no tiene operaciones de personal: solo la carta pública por QR y su propia participación (ADR-0011).
- Pendiente: tope o motivo en `price.change` (🔸 de la matriz), y si un administrador de sucursal puede tener productos propios de su sucursal.

### Aprobación de pedidos (Fase 4, bloque 3A, 2026-11-18; D-32, ADR-0012)

| Operaciones | Permiso | Ámbito |
|---|---|---|
| Ver y cambiar el modo de la sucursal (`BranchOrderApproval`, `SetBranchOrderApproval`), auditado | `branch.settings` | Sucursal asignada (propietario: todas) |
| Bandeja «Pedidos por aprobar», aprobar (llega a cocina) o rechazar con motivo (`PendingApprovalOrders`, `ApproveOrder`, `RejectOrder`), auditado | `order.approve` | Sucursal asignada |
| Retirar su propio pedido mientras espera (`WithdrawMyOrder`) | Cliente: su participación vigente en una mesa abierta | Su pedido |

### Pedidos, cocina y solicitudes (Fase 3, bloque 2, 2026-11-16)

| Operaciones | Permiso | Ámbito |
|---|---|---|
| Estaciones: listar, crear, editar, archivar y asignar productos (`BranchStations`, `CreateStation`, `UpdateStation`, `SetProductStation`) | `catalog.manage` | Sucursal asignada. La predeterminada no se archiva |
| Estaciones activas y cola de cocina (`KitchenStations`, `KitchenQueue`); «Empezar» y «Listo» | `kitchen.advance` | Sucursal asignada. Sin importes ni datos del cliente |
| «Listos para recoger» (`PickupQueue`) y «Recogido» | `delivery.pickup` | Sucursal asignada |
| «Entregado» | `delivery.deliver` | Sucursal asignada |
| Entregar sin pasar por «recogido» | `delivery.skip_sequence` y motivo (3 a 200 caracteres) | Sucursal asignada; el motivo queda en `AuditEvent` |
| Cancelar una línea que no salió de cocina | `order_item.cancel` y motivo | Sucursal asignada; merma si ya se empezó |
| Pedidos de una mesa y salón con líneas y solicitudes (`SessionOrders`, `FloorView`) | `session.open` | Sucursal asignada |
| Solicitudes pendientes y «Atendida» | `service_request.handle` | Sucursal asignada; solo mesas abiertas |
| «Mis pedidos» (`MyOrders`, `USER_ANON`) | Participación vigente propia | Solo los pedidos de quien consulta (D-06), en una sesión abierta |
| Envío a cocina, solicitudes, estación predeterminada y consultas del pedido (`Server*`) | `NO_ACCESS` | Solo el backend |

- Cada cambio de estado comprueba en el servidor el estado y la versión que vio quien lo pide; si otra persona se adelantó, se rechaza con «Esta línea ya cambió» y no se escribe nada (caso 4).
- El propietario no tiene `kitchen.advance`, `delivery.pickup` ni `delivery.deliver` (matriz §3): esas pantallas son del personal de cocina y del salón.

## 6. Cuenta y registro de pagos (Fase 4, parte 4a, 2026-11-19)

- `readBill`: exige `bill.read`, membresía y empresa activas, sucursal activa y asignada (el propietario accede a todas las de su empresa) y pertenencia de la sesión. Devuelve consumo, impuesto, pagado y saldo por persona y mesa; no devuelve números de comprobante, cajero ni medios de pago al mesero.
- `recordPayment`: exige el nuevo permiso aprobado `payment.record` (propietario, administrador de sucursal y cajero), el mismo aislamiento y una sesión abierta. Vuelve a validar el acceso en la transacción de escritura. No acepta identidades del actor ni campos de tarjeta del cliente; usa el uid verificado por Firebase Auth. Los cálculos y las asignaciones proceden del servidor.
- El backend usa documentos GraphQL con variables mediante el Admin SDK, como para insertar las listas de líneas de pedido. No hay operación web que acepte totales o asignaciones de pago autoritativas. `payment.capture` permanece separado, en el módulo de pasarela desconectado.

## 7. División y reembolsos (Fase 4, parte 4b, 2026-11-19)

- `readBill` admite `parts` (2 a 20) y devuelve la división en partes iguales y lo reembolsado de la cuenta; mismos permisos que en 4a.
- `readBillPayments`: exige `payment.refund` y el mismo aislamiento. Devuelve los pagos con medio, comprobante, lo reembolsado y lo que queda por devolver; por eso no lo ve el mesero.
- `refundPayment`: exige `payment.refund`, motivo y el tope de D-34 del rol (cajero $ 50.000, administrador de sucursal $ 300.000, propietario sin tope) por solicitud. Dentro de la transacción se vuelve a comprobar el permiso, la sucursal y que el rol sea el mismo que se usó para el tope. El reembolso por plato cancela el plato sin exigir `order_item.cancel`: es parte del reembolso (D-37).

## 8. Cierre de mesa (Fase 4, parte 4c, 2026-11-19)

- `closeTable`: exige `session.close` (propietario, administrador de sucursal, mesero y cajero) y el mismo aislamiento que `readBill`. La operación de servidor vuelve a comprobar dentro de la transacción la membresía activa y el permiso de quien cierra (revocación).
- `CloseTableSession` (cierre directo del conector): mismos permisos, solo para mesas sin consumo ni cuenta (D-39).
- La pantalla «Salón» de `operations` usa `closeTable` y muestra el motivo si no se puede cerrar.

## 9. Caja (Fase 4, bloque 5, 2026-11-20; D-40)

- Conector `cajas.gql`: `BranchRegisters` (cajas de la sucursal con su turno abierto, sin importes; `cash_session.open` o `branch.settings`), `CreateRegister` y `UpdateRegister` (`branch.settings`, con `AuditEvent`; una caja con turno abierto no se archiva). Membresía y empresa activas, sucursal asignada salvo el propietario y pertenencia de la caja.
- `openCashSession`: `cash_session.open` (propietario, administrador de sucursal y cajero). La caja debe ser de la sucursal y no estar archivada; una caja abierta por persona y un turno por caja.
- `readCashSession`: `cash_session.open`. Sin `cashSessionId` devuelve el turno abierto propio; con él, el cajero solo ve el suyo y propietario y administrador cualquiera de la sucursal. Un turno de otra sucursal o empresa responde «no existe».
- `recordCashMovement`: `cash_session.open`, mismas reglas de dueño. Motivo obligatorio, revisión del turno y clave idempotente.
- `closeCashSession`: `cash_session.close`, mismas reglas de dueño.
- Las escrituras vuelven a comprobar en la transacción la membresía activa, el permiso, la sucursal y el estado del turno.
- `recordPayment` y `refundPayment` en efectivo usan la caja abierta de quien llama (D-40).

## 10. Pendiente

- Topes concretos de descuento por rol (los de reembolso, D-34, están implementados desde 4b).
- Política de autenticación reforzada para propietarios (según capacidades verificadas de Firebase Auth).
- Asignación de mesas a meseros: obligatoria u opcional.
