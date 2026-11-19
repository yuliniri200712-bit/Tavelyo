# Requisitos de Tavelyo

Estado: **borrador de Fase 0** · Fuente: `PROMPT_MAESTRO.md` (PM) e `IDENTIDAD_VISUAL.md` (IV).
Este documento ordena los requisitos de origen, los convierte en identificadores trazables y separa lo decidido de lo pendiente. No describe funciones implementadas: a la fecha no existe código de producto.

Convenciones: `RF` requisito funcional · `RNF` no funcional · `SUP` supuesto vigente hasta que se decida lo contrario · `D` decisión pendiente del propietario.

---

## 1. Producto y alcance

Plataforma SaaS de gestión gastronómica **multiempresa y multisucursal**. El alcance inicial es el **consumo en mesa** (PM §2).

| Experiencia | Usuarios | Propósito |
|---|---|---|
| Menu — Cliente | Comensales | Carta, sesión de mesa, carrito, pedido, seguimiento y cuenta |
| Staff — Meseros | Meseros | Sectores, mesas, comandas, solicitudes, recogida y entrega |
| Kitchen — Cocina | Cocina | Cola por estación, preparación, tiempos y pedidos listos |
| POS — Caja | Cajeros | Cuentas, preautorizaciones, capturas, comprobantes y cierres |
| Manager — Administración | Propietarios y administradores | Empresas, sucursales, personal, catálogo, inventario y reportes |

**Fuera del alcance inicial** (requieren requisitos propios; no se simulan como terminados): reservas, reparto/delivery, fidelización, marketplace, facturación fiscal certificada y suscripción comercial del restaurante a Tavelyo.

---

## 2. Requisitos funcionales

### 2.1 Identidad, empresas y permisos

- **RF-ID-01** Autenticación del personal con Firebase Authentication.
- **RF-ID-02** Un usuario puede pertenecer a varias empresas con roles distintos (membresías).
- **RF-ID-03** Selector visible de empresa y sucursal; cambiar de contexto limpia estado, cachés, suscripciones y selección previa.
- **RF-ID-04** Invitaciones de personal sin poder asignar un rol superior al del invitador.
- **RF-ID-05** Revocar o degradar una membresía bloquea la siguiente operación privilegiada en servidor.
- **RF-ID-06** Permisos por acción, además de roles (ver `architecture/permissions.md`).
- **RF-ID-07** Auditoría de excepciones y acciones sensibles: actor, empresa, recurso, operación, motivo, antes/después, fecha y correlación.

### 2.2 Salón y sesión de mesa

- **RF-SA-01** Gestión de sectores y mesas por sucursal.
- **RF-SA-02** El QR identifica el contexto de una mesa; un QR público puede abrir el menú, pero leer o modificar una cuenta exige una sesión con credencial de alcance reducido, expiración y rotación.
- **RF-SA-03** Una sesión cerrada no expone la siguiente cuenta de la misma mesa.
- **RF-SA-04** Traslados y uniones de mesas transaccionales, auditados y con permiso.
- **RF-SA-05** Solicitudes de servicio (llamar al mesero, pedir la cuenta).

### 2.3 Carta y pedido del cliente

- **RF-CA-01** Carta por sucursal con categorías, productos, modificadores, precios, horarios y disponibilidad.
- **RF-CA-02** Información de alérgenos declarada, sin garantizar ausencia de alérgenos.
- **RF-CA-03** Carrito con cantidades, modificadores y observaciones; desglose de subtotal, descuentos, impuestos, cargos, propina y total.
- **RF-CA-04** Al confirmar, el servidor revalida disponibilidad, versión de precio y total; si cambian, se pide nueva confirmación.
- **RF-CA-05** Seguimiento del pedido: recibido, en preparación, listo y entregado, con estados parciales.

### 2.4 Meseros

- **RF-ME-01** Vista por sectores con estado de ocupación, pedido y cuenta diferenciados (no un solo color).
- **RF-ME-02** Toma de comandas con búsqueda, modificadores, notas y resumen antes de enviar; sin reenvíos duplicados.
- **RF-ME-03** Recogida y entrega en secuencia; excepciones con permiso y motivo.
- **RF-ME-04** Correcciones a pedidos enviados mediante cambios auditados, sin sobrescribir lo recibido en cocina.

### 2.5 Cocina

- **RF-CO-01** Cola por estación y estado, con mesa, hora, tiempo transcurrido, cantidades, modificadores, notas y prioridad.
- **RF-CO-02** Estados **por línea**; el estado de la orden se deriva de sus líneas.
- **RF-CO-03** Cocina controla hasta `listo`; meseros gestionan `recogido` y `entregado`.
- **RF-CO-04** Cancelaciones con transición explícita, motivo, permisos y tratamiento de merma.
- **RF-CO-05** Recuperación tras desconexión consultando la fuente de verdad.

### 2.6 Caja y pagos

> **ADR-0012 (2026-11-18):** RF-PA-01, RF-PA-02 y RF-PA-06 pasan a la fase «Suscripciones a Tavelyo». En el restaurante, RF-PA-03 se cumple con «otro medio registrado y autorizado» (efectivo, datáfono propio o transferencia, D-33).

- **RF-PA-01** Contrato `PaymentGateway` con autorizar, consultar, capturar, cancelar autorización y reembolsar como operaciones separadas.
- **RF-PA-02** Preautorización con monto, moneda, propósito y consentimiento explícito; se registra la versión del texto aceptado.
- **RF-PA-03** Una cuenta solo se cierra como pagada con captura confirmada (webhook verificado o consulta autenticada) u otro medio registrado y autorizado.
- **RF-PA-04** Cuentas divididas y pagos mixtos con asignaciones exactas, sin exceder el saldo.
- **RF-PA-05** Reembolsos con permiso, motivo, límites y auditoría; no superan lo capturado menos lo ya reembolsado.
- **RF-PA-06** Conciliación programada de estados pendientes, desconocidos y vencimientos.
- **RF-PA-07** Caja: apertura, fondo inicial, movimientos con motivo, efectivo esperado, conteo, diferencia y cierre auditable.
- **RF-PA-08** Recibo comercial diferenciado de factura fiscal certificada (esta última fuera de alcance inicial).

### 2.7 Administración, inventario y reportes

- **RF-AD-01** Gestión de empresas, sucursales, personal, mesas, estaciones, catálogo, recetas, precios, impuestos y disponibilidad.
- **RF-AD-02** Inventario como movimientos (entrada, consumo, merma, ajuste, devolución) con unidades y conversiones; idempotente ante eventos repetidos.
- **RF-AD-03** Reportes por empresa, sucursal y período que distinguen ventas, capturas, reembolsos y liquidaciones.
- **RF-AD-04** Exportaciones con permisos, límites y auditoría.

---

## 3. Requisitos no funcionales

| ID | Requisito |
|---|---|
| RNF-01 | Aislamiento estricto entre empresas y sucursales, verificado en servidor en cada lectura y escritura |
| RNF-02 | Importes en unidades menores enteras con moneda explícita; nunca `double` para cálculos autoritativos |
| RNF-03 | Fechas de servidor en UTC; presentación en la zona horaria de la sucursal |
| RNF-04 | Idempotencia en pedidos, operaciones financieras e inventario |
| RNF-05 | Control de concurrencia (versionado optimista o bloqueos) con conflictos visibles y recuperables |
| RNF-06 | Sin borrado de ventas, cobros o movimientos: correcciones mediante ajustes o reversos auditados |
| RNF-07 | Accesibilidad WCAG 2.2 AA; color, sonido o animación nunca son la única señal |
| RNF-08 | Sin datos completos de tarjeta (PAN, CVV) en ningún componente de Tavelyo |
| RNF-09 | Entornos separados (desarrollo, pruebas, producción); secretos en un gestor de secretos |
| RNF-10 | Paginación y límites en todos los listados |
| RNF-11 | Operación sin conexión limitada a lectura en caché y borradores; nunca confirmar pedidos o pagos sin conexión |
| RNF-12 | Carga objetivo, latencia y presupuesto definidos y medidos (pendiente, ver D-09) |

---

## 4. Parámetros configurables por empresa o sucursal

Moneda, zona horaria, impuestos, precios con o sin impuestos, horarios, cargos de servicio, propinas, redondeo y políticas de cancelación. No se infieren por el idioma del proyecto. Una cuenta no admite monedas mezcladas.

---

## 5. Supuestos vigentes

| ID | Supuesto | Se revisa cuando |
|---|---|---|
| SUP-01 | Idioma de la interfaz: español, con localización preparada para importes, fechas y plurales | Se decida otro idioma |
| SUP-02 | ~~Plataformas iniciales~~ → resuelto por D-03 | — |
| SUP-03 | Una sola moneda por empresa en el alcance inicial: COP (D-01) | Se opere en otro país |
| SUP-04 | Tavelyo no custodia ni distribuye fondos: cada restaurante cobra con su propia cuenta comercial | Cumplido por ADR-0012: el restaurante cobra por su cuenta (efectivo, datáfono propio o transferencia) y Tavelyo solo lo registra |
| SUP-05 | Tema claro únicamente en Fase 1; el oscuro se diseña y revisa aparte | Se decida incluirlo |

---

## 6. Decisiones del propietario

### Resueltas

| ID | Decisión | Respuesta (2026-11-13) | Efecto |
|---|---|---|---|
| D-03 | Plataformas prioritarias | ~~Web y Android~~. **Sustituida por D-14** (2026-11-13): sin apps nativas; los navegadores soportados se deciden en D-15 | ADR-0002 reemplazado por ADR-0009 |
| D-07 | Backend de confianza y lenguaje | **Cloud Functions con TypeScript** | ADR-0003 aceptado |
| D-08 | Gestor de estado y navegación | ~~Riverpod + go_router~~. **Sustituida por D-14**; las bibliotecas web se deciden en D-16 | ADR-0004 reemplazado por ADR-0009 |
| D-13 | Spike de SQL Connect | **Autorizado**, solo con emuladores locales y en rama aparte que no se integra a `main` | `plans/spike-sql-connect.md` |
| D-14 | Tecnología de la aplicación | **Sin Flutter. Sistema web instalable como PWA con React + Vite + TypeScript, en dos aplicaciones** (`menu-web` y `operations`) | ADR-0009 aceptado; reemplaza ADR-0002 y ADR-0004 y la herramienta de ADR-0001 |
| D-12 (fuente) | Tipografía | **Plus Jakarta Sans confirmada** por el propietario. Licencia SIL Open Font License 1.1, repositorio oficial `tokotype/PlusJakartaSans`, versión 2.7.1 | `brand/asset-manifest.md` |
| D-12 (logotipo) | Logotipo | **Aprobada la propuesta A · Mesa conectada** (diseño de Claude por encargo del propietario). Maestro v1.0.0 con variantes horizontal, vertical, monocromática, isotipo e iconos de las PWA. El favicon actual se conserva en todos los tamaños (2026-11-14) | `brand/asset-manifest.md` |
| D-15 | Navegadores soportados | **Móvil:** Chrome en Android; Safari en iPhone y iPad (en iOS/iPadOS todos los navegadores usan WebKit). **Escritorio:** Chrome y Edge (Windows y macOS) y Safari (macOS). Versiones: las dos últimas mayores de cada uno | Matriz de pruebas con Playwright (Chromium y WebKit) más revisión en dispositivos reales |
| D-17 | Acceso del personal | **Correo y contraseña** con Firebase Auth (2026-11-13), con recuperación de contraseña por correo. Sin acceso con Google por ahora | `features/identity`; autenticación reforzada para propietarios pendiente (PM §8) |
| D-18 | Integración continua | **GitHub Actions** (2026-11-13) | `.github/workflows/` |
| D-19 | Inactividad del personal | **Cerrar la sesión tras 15 minutos sin uso**, con aviso «¿Sigues ahí?» en el último minuto (2026-11-14). La actividad en otra pestaña de la misma persona cuenta | `features/identity` (`InactivityGuard`); PM §8 |
| D-20 | Equipos compartidos de la sucursal | **Casilla «Equipo compartido» al entrar, marcada por defecto** (2026-11-14): la sesión vive solo en esa pestaña y se borra al cerrarla. Desmarcada (teléfono propio), la sesión se recuerda. El cierre por inactividad aplica siempre | `features/identity`, `data-access`; ADR-0009 |
| D-01 (país y moneda) | País inicial y moneda | **Colombia, peso colombiano (COP)** (2026-11-14). Zona horaria de referencia `America/Bogota`. Impuestos: ver D-01b | `core` ya admite COP (ISO 4217, 2 decimales); el aprovisionamiento sigue exigiendo moneda y zona horaria explícitas por empresa |
| D-01b | Precios e impuestos | **Los precios de la carta incluyen impuestos** (2026-11-14); la cuenta desglosa el impuesto contenido. Cada empresa configura su tasa (impoconsumo, IVA o ninguna) con su contador | `core` (impuesto contenido), `TaxRule` por empresa; `plans/fase-2.md` |
| D-21 | Quién abre la mesa | **El mesero** (2026-11-14). El QR muestra siempre la carta; para pedir, la mesa debe estar abierta | Sesión de mesa (ADR-0011, propuesta) |
| D-22 | Fotos de los platos | **Más adelante** (2026-11-14; confirmado el 2026-11-17 para la Fase 3B). Requieren aprobar Cloud Storage | Fuera de las fases 2, 3 y 3B |
| D-06 (carrito) | Carrito en mesa compartida | **Un carrito por persona**, privado (2026-11-14). Quién ve y paga qué en la cuenta sigue pendiente | `plans/fase-2.md` |
| D-04 | Garantía antes de cocina | **Cambiada el 2026-11-18 (ADR-0012, D-32):** ya no hay preautorización. Cada sucursal elige si los pedidos del teléfono del comensal van **directo a cocina** (por defecto) o **los aprueba el mesero**. Los que toma el mesero van siempre directo. *Versión anterior (2026-11-16): preautorización obligatoria y sin excepciones, reemplazada.* | ADR-0012; `plans/fase-4.md` (bloque 3A) |
| D-23 | Pedidos tomados por el mesero | **No en la Fase 3** (2026-11-16): los pedidos salen del teléfono del cliente; la toma de comandas (RF-ME-02) pasa a la Fase 4, con datáfono o enlace de pago | `plans/fase-3.md` |
| D-24 | Estaciones de cocina | **Cada persona de cocina elige la estación en pantalla** entre las de su sucursal (2026-11-16); la asignación por persona, cuando haga falta | `plans/fase-3.md` |
| D-25 | Inactividad en la pantalla de cocina | Implementado en el bloque 4 de la Fase 3 (`InactivityHoldProvider` y `useInactivityHold` en `identity`). **La pantalla de cocina no se cierra por inactividad mientras está visible** (2026-11-16); el resto de la app sigue con D-19 | `plans/fase-3.md`; `features/identity` |
| D-26 | Retroceder el estado de una línea | **No se permite** (2026-11-16): los errores se corrigen cancelando con motivo, auditado | `plans/fase-3.md`; `architecture/state-machines.md` |
| D-27 | Iconos de la interfaz | **Lucide** (2026-11-17), con `lucide-react` 1.66.0 (ISC) a través de un componente `Icon` del sistema de diseño; se instala al aprobar el plan de la Fase 3B | `plans/fase-3b-diseno-visual.md` |
| D-28 | Letra serif en títulos | **No** (2026-11-17): solo Plus Jakarta Sans en toda la interfaz (IV §5) | `plans/fase-3b-diseno-visual.md` |
| D-05 | Propinas | **Voluntaria, sugerida en 10 % al pagar la cuenta** (2026-11-18): la persona la cambia o la quita y nunca se incluye sin que la elija. No forma parte de la preautorización: se paga en el pago final (efectivo o un cobro aparte con tarjeta). El reparto al personal queda fuera de la Fase 4 | `plans/fase-4.md` |
| D-06 (cuenta) | Quién ve y quién paga qué en la mesa compartida | **Cada persona paga lo que pidió y en su teléfono ve solo su parte** (2026-11-18); la caja y el mesero ven la cuenta de toda la mesa. Pagar por otros o dividir en partes iguales lo hace la caja a petición de la mesa, con reparto exacto | `plans/fase-4.md` |
| D-29 | Pedidos tomados por el mesero (D-23) | **Anulada el 2026-11-18 (ADR-0012):** sin pasarela para el restaurante ya no hay QR de pago. El mesero envía el pedido directamente a cocina | ADR-0012 |
| D-30 | Cerrar la mesa | **Solo con saldo cero y sin líneas en cocina o por entregar** (2026-11-18); al cerrar, toda retención sin capturar se libera | `plans/fase-4.md` |
| D-31 | Fase 4 sin pasarela | **Reemplazada el 2026-11-18 por ADR-0012:** la Fase 4 no usa pasarela. La pasarela real pasa a la fase nueva «Suscripciones a Tavelyo» (D-35) | ADR-0012 |
| D-32 | Cómo llegan a cocina los pedidos del comensal | **Lo elige cada sucursal** (2026-11-18): directo a cocina (por defecto) o el mesero aprueba cada pedido. La cambian el propietario y el administrador de sucursal, con auditoría. Pendiente de aprobación, el pedido espera hasta que el mesero lo aprueba o lo rechaza con motivo; el comensal puede retirarlo y el mesero ve cuánto lleva esperando | ADR-0012; `plans/fase-4.md` (bloque 3A) |
| D-33 | Medios de pago del comensal | **Efectivo, datáfono propio del restaurante y transferencia** (2026-11-18), registrados por el cajero. Del datáfono y de la transferencia solo se guarda el número de comprobante, nunca datos de la tarjeta | ADR-0012; bloque 4 |
| D-34 | Topes de reembolso | **Cajero hasta $ 50.000, administrador de sucursal hasta $ 300.000 y propietario sin tope, siempre con motivo** (2026-11-18). Nunca más de lo pagado | Bloque 4; `architecture/permissions.md` |
| D-35 | Pasarela de pago | **Solo para cobrar los planes de los restaurantes a Tavelyo** (2026-11-18, ADR-0012). Fase nueva «Suscripciones a Tavelyo» después de la Fase 4. El bloque 3 se conserva desconectado para reutilizarlo allí | ADR-0012 |
| D-16 | Bibliotecas y herramientas del stack web, y Firebase Hosting | **Aceptadas** según ADR-0010; formateador **Prettier** (2026-11-13); validación de formularios se decide en Fase 1 | ADR-0010 aceptado |

### Pendientes

| ID | Decisión | Bloquea |
|---|---|---|
| D-02 | Pasarela de pago. **Desde el 2026-11-18 (ADR-0012) solo para las suscripciones de los restaurantes a Tavelyo:** el criterio pasa a ser el cobro recurrente en Colombia; la comparación de preautorización de `plans/fase-4.md` ya no aplica | Fase «Suscripciones a Tavelyo» (D-35) |
| D-09 | Carga objetivo por sucursal, latencia aceptable y presupuesto mensual | RNF-12, dimensionamiento de Cloud SQL |
| D-10 | Jurisdicción de datos personales (Colombia, por D-01), retención y anonimización | Modelo de datos personales |
| D-11 | RPO/RTO para copias y restauración | Fase 6 |
