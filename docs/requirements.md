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
| SUP-03 | Una sola moneda por empresa en el alcance inicial | Se resuelva D-01 |
| SUP-04 | Tavelyo no custodia ni distribuye fondos: cada restaurante cobra con su propia cuenta comercial | Se resuelva D-02 |
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
| D-16 | Bibliotecas y herramientas del stack web, y Firebase Hosting | **Aceptadas** según ADR-0010; formateador **Prettier** (2026-11-13); validación de formularios se decide en Fase 1 | ADR-0010 aceptado |

### Pendientes

| ID | Decisión | Bloquea |
|---|---|---|
| D-01 | País inicial, moneda y si los precios incluyen impuestos | Modelo de impuestos, pasarela, Fase 2 |
| D-02 | Pasarela de pago (debe admitir autorización y captura separadas en el país elegido) | Fase 4; ADR-0006 |
| D-04 | Política de garantía: ¿preautorización obligatoria antes de enviar a cocina? Excepciones (efectivo, atención por mesero) | Flujo de pedido de Fase 2–3 |
| D-05 | Propinas: momento, cálculo y si se capturan con la cuenta | Modelo de cuenta |
| D-06 | Sesión de mesa compartida: quién ve y quién paga qué | RF-SA-02, división de cuentas |
| D-09 | Carga objetivo por sucursal, latencia aceptable y presupuesto mensual | RNF-12, dimensionamiento de Cloud SQL |
| D-10 | Jurisdicción de datos personales, retención y anonimización | Modelo de datos personales |
| D-11 | RPO/RTO para copias y restauración | Fase 6 |
