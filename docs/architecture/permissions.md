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
| `order_item.cancel` | ✅ | 🔸 | 🔸 | 🔸 | — | — |
| `kitchen.advance` (→ `en_preparacion`, `listo`) | — | — | — | ✅ | — | — |
| `delivery.pickup` / `delivery.deliver` | — | — | ✅ | — | — | — |
| `delivery.skip_sequence` | ✅ | 🔸 | — | — | — | — |
| `service_request.create` | — | — | — | — | — | ✅ |
| `bill.read` | ✅ | ✅ | ✅ sin datos de pago | — | ✅ | ✅ propia cuenta |
| `bill.split` | ✅ | ✅ | — | — | ✅ | — |
| `bill.discount` | ✅ | 🔸 | — | — | 🔸 tope | — |
| `payment.authorize` (iniciar) | — | — | — | — | ✅ | ✅ propia cuenta |
| `payment.capture` | ✅ | ✅ | — | — | ✅ | — |
| `payment.void_authorization` | ✅ | ✅ | — | — | 🔸 | — |
| `payment.refund` | 🔸 | 🔸 tope | — | — | 🔸 tope | — |
| `cash_session.open` / `close` | ✅ | ✅ | — | — | ✅ su caja | — |
| `inventory.manage` | ✅ | ✅ | — | — | — | — |
| `staff.invite` | ✅ | 🔸 rango inferior | — | — | — | — |
| `role.assign` | 🔸 | 🔸 rango inferior | — | — | — | — |
| `report.read` | ✅ | ✅ su sucursal | — | — | 🔸 su turno | — |
| `report.export` | 🔸 | 🔸 | — | — | — | — |
| `tenant.settings` | 🔸 | — | — | — | — | — |

El operador de plataforma no aparece en la matriz operativa: solo tiene permisos de aprovisionamiento y un mecanismo de acceso excepcional (pendiente de diseño en Fase 1).

## 4. Datos visibles por rol (minimización)

- **Cocina**: sin importes, medios de pago ni datos personales del cliente.
- **Mesero**: estado de la cuenta, pero no referencias de pago ni datos de tarjeta.
- **Cliente**: solo su sesión; en mesas compartidas, según D-06.
- **Nadie**: PAN ni CVV (no se almacenan).

## 5. Implementación (Fase 1)

- Catálogo en código: `packages/contracts/src/authorization.ts`. Una prueba compara cada rol con la tabla de la sección 3 de este documento (✅ y 🔸 conceden); si cambia una sin la otra, CI falla. `service_request.create` es del cliente y no forma parte del catálogo del personal.
- Permiso añadido: **`audit.read`** (ver el registro de auditoría), solo para el propietario.
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

## 6. Pendiente

- Topes concretos de descuento y reembolso por rol (configurables por empresa).
- Política de autenticación reforzada para propietarios (según capacidades verificadas de Firebase Auth).
- Asignación de mesas a meseros: obligatoria u opcional.
