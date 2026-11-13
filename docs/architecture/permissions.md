# Matriz de permisos

Estado: **borrador de Fase 0**. Base: PM §5. Los permisos se modelan **por acción**; los roles son agrupaciones de permisos. Toda comprobación ocurre en el servidor; ocultar botones en Flutter solo mejora la experiencia.

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

## 5. Pendiente

- Topes concretos de descuento y reembolso por rol (configurables por empresa).
- Política de autenticación reforzada para propietarios (según capacidades verificadas de Firebase Auth).
- Asignación de mesas a meseros: obligatoria u opcional.
