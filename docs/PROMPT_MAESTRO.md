# Tavelyo — Prompt maestro de desarrollo para Claude Code

Versión: 1.0 consolidada · Fecha: 13 de noviembre de 2026 · Idioma: español.

## 1. Encargo y forma de trabajar

Actúa como arquitecto de software e ingeniero responsable de construir Tavelyo, una plataforma SaaS de gestión gastronómica multiempresa y multisucursal. Desarrolla un sistema mantenible, verificable y seguro; no una demostración con pantallas desconectadas.

Lee este archivo completo y `IDENTIDAD_VISUAL.md` antes de proponer cambios. Inspecciona el repositorio, su `CLAUDE.md`, documentación, dependencias, pruebas y estado de Git. Conserva el trabajo existente. Identifica contradicciones y registra decisiones; no elimines requisitos técnicos para ajustar una maqueta.

Este documento define el comportamiento y la arquitectura; `IDENTIDAD_VISUAL.md` define la marca y la experiencia. La seguridad, integridad financiera y accesibilidad prevalecen sobre la decoración. Las instrucciones expresas del propietario prevalecen sobre supuestos de estos documentos.

**Al comenzar, trabaja solamente en Fase 0**, salvo que el propietario ya haya autorizado otra fase. Entrega el diagnóstico, los diseños de arquitectura y el plan verificable de la fase siguiente. Avanza únicamente dentro de la fase autorizada; resuelve autónomamente los detalles reversibles dentro de ella. Antes de solicitar una decisión, prepara alternativas concretas y explica su efecto.

No declares implementadas funciones simuladas. Distingue claramente código operativo, pruebas, prototipos, decisiones pendientes y limitaciones. No inventes credenciales, recursos de marca, resultados de pruebas ni capacidades de una pasarela.

## 2. Producto y alcance

Tavelyo conecta cinco experiencias:

1. **Menu — Cliente:** carta digital, sesión de mesa, carrito, pedido, seguimiento y cuenta.
2. **Staff — Meseros:** sectores, mesas, comandas, solicitudes y entregas.
3. **Kitchen — Cocina:** cola de preparación, estaciones, tiempos y pedidos listos.
4. **POS — Caja:** cuentas, preautorizaciones, cobros, comprobantes y cierres.
5. **Manager — Administración:** empresas, sucursales, personal, catálogo, inventario y reportes.

El alcance inicial cubre consumo en mesa. Reservas, reparto, fidelización, marketplace, facturación fiscal certificada y suscripciones comerciales del SaaS son extensiones que requieren requisitos específicos; no simularlas como terminadas. Distingue el cobro del restaurante a sus clientes de la eventual suscripción del restaurante a Tavelyo.

Parámetros por empresa/sucursal: moneda, zona horaria, impuestos, precios con o sin impuestos, horarios, cargos de servicio, propinas, redondeo y políticas de cancelación. No inferir país, moneda o normativa fiscal por el idioma del proyecto. No admitir monedas mezcladas en una cuenta.

## 3. Plataforma obligatoria y límites

- **Flutter y Dart** para interfaces adaptables. Propuesta inicial: web para cliente y administración; Android/iOS y tabletas para operación. Confirmar plataformas prioritarias en Fase 0.
- **Firebase Authentication** para identidad del personal y sesiones de cliente según el flujo aprobado.
- **Firebase Data Connect y Cloud SQL PostgreSQL** como núcleo relacional. La documentación oficial consultada redirige actualmente a **Firebase SQL Connect**: es la denominación actual del servicio solicitado; comprobar nombres de paquetes, CLI y compatibilidad antes de instalarlos.
- Esquemas y operaciones GraphQL definidos y versionados; SDK Dart generado para las operaciones compatibles. No editar archivos generados manualmente.
- **Backend de confianza** en Cloud Functions o Cloud Run para pagos, webhooks, tareas y operaciones privilegiadas. Seleccionar una opción y justificarla mediante una decisión de arquitectura.
- Storage para fotografías y recursos, con autorización, límites de tamaño y validación de tipo. Notificaciones como apoyo, nunca como registro autoritativo de pedidos.
- PostgreSQL es la fuente de verdad de pedidos, cuentas, inventario y pagos. No sustituirlo por Firestore ni duplicar el negocio en dos bases sin decisión explícita y estrategia de consistencia.
- No conectar Flutter directamente a PostgreSQL ni distribuir credenciales de base de datos o claves de pasarela en la aplicación.

Verifica en documentación oficial las versiones y capacidades reales. No asumir suscripciones en tiempo real, persistencia sin conexión o transacciones arbitrarias por el solo hecho de usar Firebase. Hacer una prueba técnica mínima de autorización, generación Dart, atomicidad y actualización de cocina antes de comprometer la arquitectura. Si una operación no puede expresar sus invariantes en el conector, implementarla en el backend con una transacción PostgreSQL y permisos mínimos.

## 4. Arquitectura modular

Usa arquitectura limpia por funcionalidades, con dependencias dirigidas hacia el dominio:

```text
tavelyo/
  CLAUDE.md
  docs/
    PROMPT_MAESTRO.md
    IDENTIDAD_VISUAL.md
    architecture/
    decisions/
  apps/                         # Separar aplicaciones solo cuando esté justificado
  packages/
    core/                       # Errores, dinero, fechas, contratos compartidos
    design_system/              # Tokens, tema y componentes
    features/
      identity/
      tenancy/
      catalog/
      tables/
      orders/
      kitchen/
      billing/
      payments/
      inventory/
      reporting/
  dataconnect/                  # O directorio requerido por la CLI verificada
  backend/
  assets/branding/
  tests/
```

Adapta esta propuesta al repositorio existente. No crees paquetes vacíos por formalismo. En cada módulo separa `domain`, `application`, `data` y `presentation` cuando aporte claridad. El dominio no debe depender de widgets ni de SDK de Firebase o pagos. Encapsula proveedores externos detrás de contratos y repositorios; utiliza inyección de dependencias.

Selecciona y documenta una sola estrategia principal de estado y navegación, preferiblemente la que ya utilice el proyecto. Evita mezclar patrones sin necesidad. Centraliza el tratamiento de errores, localización, telemetría y permisos. No ejecutar lógica de cobro ni cálculo financiero autoritativo dentro de widgets.

## 5. Multiempresa, sucursales y autorización

Una empresa es el límite de aislamiento del SaaS; una sucursal es un ámbito operativo dentro de ella. Un usuario puede pertenecer a varias empresas con permisos diferentes.

- Todas las entidades de negocio deben incluir `tenant_id`; las operativas, también `branch_id` cuando corresponda.
- Comprueba membresía activa, rol, ámbito y permiso en el servidor en **cada lectura y escritura**, incluso al consultar por ID, exportar, agregar estadísticas o acceder a imágenes.
- El identificador de empresa enviado por el cliente selecciona un contexto; nunca demuestra autorización.
- Usa claves foráneas compuestas o controles equivalentes para impedir vínculos entre empresas o sucursales incompatibles. Los índices y restricciones únicas deben considerar el ámbito correcto.
- Deniega por defecto. La autenticación por sí sola no otorga acceso a toda la base.
- Ocultar un botón o proteger una ruta Flutter mejora la experiencia, pero no reemplaza autorización del servidor.
- Cambiar de empresa limpia estado, cachés, suscripciones y selección de sucursal. Revocar una membresía debe bloquear nuevas operaciones en servidor aunque queden datos de sesión en el cliente.
- No confiar exclusivamente en roles obsoletos de un token. Definir verificación de membresías y estrategia de revocación.
- Proteger también operaciones privilegiadas: las credenciales de servidor pueden eludir restricciones del conector; exigir controles explícitos y pruebas.
- Si se utiliza RLS de PostgreSQL como defensa adicional, demostrar que funciona con el modelo de conexiones real; no asumir que está habilitada automáticamente.

### Matriz base de roles

| Rol | Ámbito y acciones | Restricciones |
|---|---|---|
| Operador de plataforma | Aprovisionamiento y soporte técnico | Sin lectura general de consumos o datos personales; acceso excepcional temporal, motivado y auditado |
| Propietario de empresa | Configuración, sucursales, personal, informes y políticas | Solo su empresa; acciones críticas con autenticación reforzada |
| Administrador de sucursal | Operación, catálogo local y personal autorizado | Solo sucursales asignadas y límites delegados |
| Mesero | Mesas asignadas, pedidos, solicitudes, recoger y entregar | Sin capturas, reembolsos o cambios de roles |
| Cocina | Comandas de sus estaciones y estados de preparación | Sin información financiera ni datos personales innecesarios |
| Cajero | Cuentas, cobros y cierre de su caja | Descuentos, anulaciones y reembolsos sujetos a permisos y topes |
| Cliente | Menú publicado y sus pedidos/cuenta autorizados | No puede leer otras sesiones, mesas o clientes |

Modela permisos por acción, además de los roles. Define quién puede aprobar excepciones y registra actor, motivo, alcance, antes/después y fecha. Una invitación nunca debe permitir asignar un rol superior al del actor que invita.

## 6. Modelo de datos y reglas comunes

Diseña un diagrama entidad-relación y un diccionario antes de las migraciones. Entidades mínimas:

| Grupo | Entidades |
|---|---|
| Organización | Tenant, Branch, UserProfile, Membership, Role, Permission |
| Salón | Sector, DiningTable, TableSession, SessionParticipant, ServiceRequest |
| Carta | Category, Product, BranchProduct, ModifierGroup, ModifierOption, Price, TaxRule |
| Operación | Order, OrderItem, OrderItemModifier, KitchenTicket, Station, StateEvent |
| Cuenta y pagos | Bill, BillItem, PaymentAttempt, Authorization, Capture, Refund, PaymentAllocation, ProviderEvent |
| Caja | Register, CashSession, CashMovement, CashCount |
| Inventario | Ingredient, Recipe, RecipeItem, StockMovement, StockBalance, Supplier, PurchaseReceipt |
| Control | AuditEvent, IdempotencyRecord, OutboxEvent |

Reglas obligatorias:

- IDs no predecibles para recursos expuestos; aun así comprobar permisos.
- Fechas de servidor en UTC y presentación en zona de sucursal; no ordenar eventos críticos por el reloj del teléfono.
- Importes en unidades menores enteras y moneda explícita, o decimal exacto con escala definida. Nunca `double` para cálculos financieros autoritativos.
- Guardar instantáneas de nombre, precio, modificadores, impuesto y reglas aplicadas en cada línea vendida. Cambiar el catálogo no cambia ventas históricas.
- Definir descuentos, impuestos, propinas, reparto y redondeo deterministas. La suma de asignaciones debe coincidir exactamente con el total.
- Restricciones de cantidades positivas, relaciones válidas y unicidad; índices sobre consultas reales con empresa, sucursal, estado y fecha.
- Paginación y límites en listados. Evitar consultas sin límite y consultas repetidas por fila.
- Versionado optimista o bloqueos adecuados para modificaciones simultáneas. Un conflicto debe ser visible y recuperable.
- No borrar ventas, cobros o movimientos contables para corregirlos: registrar ajustes o reversos auditados. Archivar entidades de catálogo conservando referencias.
- Retención, anonimización, exportación y borrado de datos personales se definen según jurisdicción y obligaciones de conservación pendientes de confirmar.

## 7. Flujos funcionales

### Cliente y sesión de mesa

El QR identifica el contexto de una mesa, pero no debe conceder acceso indefinido a cuentas anteriores. Crear o validar una sesión activa con credencial de alcance reducido, rotación y expiración. No incluir secretos persistentes en la URL. Un QR público puede abrir el menú; leer o modificar una cuenta exige autorización específica.

Mostrar carta disponible por sucursal, horarios, precios, modificadores y restricciones alimentarias informadas. No inferir alergias ni garantizar ausencia de alérgenos. Validar nuevamente disponibilidad, versión de precio y total en servidor al confirmar. Si cambian, presentar el cambio y obtener confirmación, sin cobrar silenciosamente un importe distinto.

El cliente puede gestionar su carrito, enviar pedido, ver seguimiento y consumo autorizado, solicitar mesero y pedir la cuenta. En mesas compartidas definir expresamente quién ve o paga qué; no exponer automáticamente los datos de todos los comensales.

### Meseros

Gestionar sectores y mesas; abrir sesión; registrar pedidos y notas; atender solicitudes; recoger y entregar. Traslados y uniones de mesas deben ser transaccionales, conservar trazabilidad y requerir permisos. Pedidos ya enviados se corrigen mediante cambios auditados, no sobreescribiendo silenciosamente lo recibido en cocina.

### Cocina

Distribuir líneas por estación, mostrar prioridad, antigüedad, cantidades, modificadores y notas. Admitir preparación parcial: el estado de una orden se deriva de sus líneas, sin marcar todo listo por terminar un plato. Las alertas no pueden ocultar información alimentaria importante.

Estado de línea: `recibido → en_preparacion → listo → recogido → entregado`. Las cancelaciones siguen una transición explícita con motivo y permisos; después de preparar, definir tratamiento de merma. Cocina controla hasta `listo`; meseros gestionan recogida y entrega. Las excepciones a la secuencia requieren autorización y auditoría.

### Caja y cuentas

Mostrar consumo, impuestos, descuentos, propina opcional, autorizado, capturado, reembolsado y saldo. Separar y unir cuentas solo con reglas de asignación que impidan cobrar dos veces una línea. Admitir pagos divididos y mixtos mediante asignaciones exactas, sin exceder el saldo.

Una cuenta no puede cerrarse como pagada por una redirección del navegador o una preautorización. Requiere confirmación de captura o registro autorizado de otro medio de pago. Si existe una operación de resultado desconocido, conciliarla antes de reintentar o aceptar un pago que pueda duplicar el cobro.

Caja: apertura, fondo inicial, entradas/salidas con motivo, efectivo esperado, conteo, diferencia y cierre auditable. Un recibo comercial no equivale a factura fiscal certificada. Documentar integración fiscal pendiente cuando corresponda.

### Administración e inventario

Gestionar empresas, sucursales, personal, mesas, estaciones, catálogo, recetas, precios, impuestos y disponibilidad. Registrar entradas, consumo, merma, ajuste y devolución de inventario como movimientos; definir unidades y conversiones.

Elegir y documentar cuándo reservar y descontar existencias. Una repetición del mismo evento no debe descontar inventario otra vez. Cancelar una preparación no implica devolver ingredientes físicamente usados. Definir política de stock negativo y concurrencia para la última unidad disponible.

Reportes por empresa/sucursal/período: ventas, medios de pago, impuestos, descuentos, reembolsos, productos, tiempos, inventario y diferencias de caja. Explicar si una métrica mide ventas, capturas o liquidaciones; nunca sumarlas como si fueran equivalentes. Exportaciones con permisos y límites.

## 8. Preautorización, captura y conciliación

Implementa un contrato `PaymentGateway` que separe autorizar, consultar estado, capturar, cancelar autorización y reembolsar. La pasarela concreta se decide según país, moneda, titular de la cuenta comercial, disponibilidad y capacidades verificadas. No asumir que Tavelyo puede custodiar o distribuir fondos de terceros.

Preautorizar reserva un importe; no significa cobro final. Antes de la autorización, mostrar monto, moneda, propósito, consentimiento y condiciones de liberación. Registrar la versión del texto aceptado, sin guardar datos completos de tarjeta. Usar componentes/tokenización del proveedor; nunca almacenar PAN completo ni CVV.

### Secuencia requerida

1. El servidor calcula una propuesta de importe a partir del pedido y política aprobada. Devuelve un resumen verificable al cliente.
2. Tras consentimiento, crea un intento persistente con clave de idempotencia, empresa, cuenta, moneda e importe.
3. Solicita autorización al proveedor. Gestiona autenticación adicional cuando corresponda. Persistir referencia, monto autorizado y vencimiento informado por el proveedor.
4. Si la política exige garantía, no liberar el pedido a cocina hasta confirmación verificable de autorización. Las excepciones, por ejemplo efectivo o clientes atendidos por mesero, requieren una política explícita.
5. Cada consumo adicional vuelve a calcular cobertura. No incrementar silenciosamente la retención. Si la pasarela admite autorización incremental, usarla con las condiciones y consentimiento requeridos; si no, solicitar una nueva autorización o un medio alternativo y gestionar la anterior para evitar retenciones duplicadas.
6. Al solicitar cierre, bloquear o versionar la cuenta, calcular saldo y capturar únicamente el importe final autorizado y permitido. Excesos, propinas o cambios requieren un flujo compatible, no una promesa de ajuste automático.
7. Confirmar mediante webhook verificado o consulta autenticada al proveedor. Aplicar el resultado y la asignación a la cuenta de forma idempotente.
8. Liberar autorizaciones sobrantes según capacidades reales. No prometer disponibilidad inmediata de fondos: depende del proveedor y emisor.
9. Conciliar estados pendientes y vencimientos mediante tareas programadas; alertar antes de perder cobertura. Una autorización vencida exige una nueva solución de pago, no una captura ficticia.

### Estados e invariantes

Estados internos orientativos: `creado`, `requiere_accion`, `procesando`, `autorizado`, `captura_pendiente`, `capturado`, `cancelado`, `vencido`, `fallido`, `resultado_desconocido`. Modelar reembolsos como operaciones independientes con estados y sumas propias. Documentar el mapeo a la pasarela; no asumir correspondencia uno a uno.

- Separar el estado financiero del pedido, de la cocina y de la sesión de mesa.
- Capturas acumuladas no pueden superar la autorización válida; reembolsos confirmados no pueden superar lo capturado menos reembolsos anteriores.
- No asumir captura múltiple, parcial, incremental o extendida: habilitar solo capacidades probadas del proveedor.
- Verificar firma del webhook sobre el cuerpo requerido por la pasarela, antigüedad cuando aplique, cuenta comercial, moneda, importe y referencia interna. No confiar en metadatos controlados por el cliente.
- Deduplificar por evento externo y operación de negocio. Soportar webhooks duplicados, tardíos y fuera de orden sin retroceder estados confirmados.
- Una transacción de PostgreSQL no incluye atómicamente a la pasarela: usar intención persistente, claves idempotentes, outbox/tareas y conciliación para resolver fallos entre ambos sistemas.
- En timeout no crear inmediatamente otro cobro: consultar o reintentar la misma operación idempotente. Si el proveedor no ofrece garantías suficientes, pasar a revisión.
- Reembolsos y anulaciones requieren permiso, motivo, límites y auditoría. El botón de reembolso no debe marcarlo completado antes de la confirmación.

## 9. Actualización, desconexión y rendimiento

Definir un mecanismo verificable de actualización de cocina y meseros: suscripción compatible, canal de eventos del backend o consultas periódicas incrementales. Las notificaciones pueden perderse o repetirse; al reconectar, consultar la fuente de verdad y recuperar cambios por versión/cursor.

Permitir caché de lectura y borradores cuando sea útil, mostrando última actualización y estado de conexión. No confirmar un pedido como recibido ni un pago como exitoso estando sin conexión. Las operaciones en cola necesitan ID estable, validación al reconectar y resolución de conflictos.

Fijar en Fase 0 una carga objetivo por sucursal, simultaneidad, volumen de catálogo, latencia aceptable y presupuesto. Medir percentiles de operaciones críticas con datos representativos. Optimizar imágenes y paginación. No prometer escalabilidad sin pruebas o estimación de costos de Cloud SQL, backend, almacenamiento y tráfico.

## 10. Seguridad y operación

- Entornos separados de desarrollo, pruebas y producción, con bases y credenciales distintas. Datos de prueba sintéticos; nunca copiar producción sin proceso aprobado.
- Secretos en un gestor de secretos; mínimos privilegios IAM y cuentas de servicio por función. `.env.example` solo con nombres y valores ficticios.
- Validación de identidad y autorización en backend y conectores; protección contra enumeración, acceso por ID ajeno, escalamiento de roles y asignación masiva de campos.
- Límites de solicitudes, tamaños, cantidades y tiempo; defensa ante abuso de QR y sesiones anónimas. App Check cuando sea compatible como capa adicional, no sustituto de autenticación o autorización.
- Validar entradas, tipos y parámetros. Evitar SQL concatenado. Restringir orígenes y proteger flujos web según su mecanismo de sesión.
- Autenticación reforzada para administradores y acciones sensibles cuando esté disponible en la configuración elegida. Política de dispositivos compartidos, bloqueo de sesión y cierre de sesión visible.
- Cifrado en tránsito y controles de almacenamiento. Logs sin tokens, tarjetas, secretos o datos personales innecesarios.
- Auditoría resistente a modificaciones por roles de negocio; registrar actor, empresa, recurso, operación, motivo, fecha y correlación.
- Alertas por fallos de pago, divergencias de conciliación, pedidos atascados, retraso de eventos y errores de autorización.
- Copias de seguridad, recuperación a un punto en el tiempo cuando se configure, ensayo de restauración y objetivos RPO/RTO acordados. Una copia no está verificada hasta probar su restauración.
- Migraciones versionadas con estrategia de expansión/contracción; respaldo, compatibilidad entre versiones y reversión o corrección hacia delante probadas antes de cambios destructivos.
- Revisar dependencias y secretos en CI. No afirmar cumplimiento PCI, fiscal o de privacidad solo por integrar un proveedor.

## 11. Fases y criterios de salida

| Fase | Entrega | Condición para terminar |
|---|---|---|
| 0 — Análisis | Inventario del repositorio, requisitos, ERD, permisos, amenazas, flujos, arquitectura, decisiones y plan | Incertidumbres identificadas; alcance y criterios de Fase 1 revisables; sin implementar producto ni desplegar infraestructura |
| 1 — Base | Flutter, entornos, CI, autenticación, aislamiento y sistema visual base | Dos empresas de prueba no pueden acceder a datos de la otra; navegación y componentes accesibles |
| 2 — Salón y carta | Sucursales, sectores, mesas, catálogo, QR/sesión y carrito | Precios validados por servidor; sesiones aisladas; flujo de pedido preparado con adaptador de pago simulado explícito |
| 3 — Pedidos | Envío, estaciones, cocina, solicitudes, recogida y entrega | Flujo completo con concurrencia, reconexión y estados inválidos rechazados; no liberar un flujo sujeto a garantía sin adaptador válido |
| 4 — Caja y pagos | Pasarela en entorno de prueba, autorización, captura, división, reembolso y cierre | Conciliación correcta y pruebas de duplicados, fallos y vencimientos aprobadas; habilitación real separada |
| 5 — Gestión | Inventario, compras, informes, permisos administrativos | Movimientos y totales reconciliados; exportaciones aisladas y auditadas |
| 6 — Piloto | Rendimiento, accesibilidad, restauración, monitoreo, manuales y despliegue controlado | Criterios críticos aprobados, plan de soporte/reversión y autorización explícita de producción |

Antes de implementar cada fase: presentar alcance, dependencias, archivos afectados y pruebas. Al finalizar: demostrar recorridos, informar pruebas ejecutadas y pendientes, actualizar documentación y solicitar la siguiente fase si aún no está autorizada. No reducir seguridad para cumplir una fecha.

## 12. Estrategia de pruebas

Pruebas unitarias de dominio para dinero, impuestos, redondeo, descuentos, reparto, estados, inventario y permisos; pruebas de widgets para componentes y formularios; integración para conectores, transacciones y backend; recorridos completos en entornos de prueba.

Casos de aceptación obligatorios:

1. Usuario A altera `tenant_id`, `branch_id` o el ID de pedido para leer/escribir datos de B: denegado, también en agregados, archivos y exportaciones.
2. Membresía revocada o degradada: la siguiente operación privilegiada se rechaza.
3. Doble pulsación y reintento tras timeout: un pedido y una operación financiera, sin duplicar cocina o inventario.
4. Dos operadores actualizan la misma cuenta o venden la última unidad: se conserva la integridad y se informa el conflicto.
5. Precio modificado mientras existe un carrito: el servidor exige revisión del nuevo importe.
6. Preautorización rechazada, autenticación adicional, vencimiento, consumo superior a cobertura y captura menor: respuesta correcta según capacidades reales.
7. Captura exitosa en pasarela y caída antes de guardar localmente: conciliación recupera el pago sin volver a cobrar.
8. Webhook inválido, duplicado o fuera de orden: no altera indebidamente estados ni duplica efectos.
9. Dos cajeros intentan capturar/cerrar a la vez: no sobrecobran; pagos parciales y redondeo conservan el total exacto.
10. Reembolso repetido o superior al disponible: rechazado sin borrar historial.
11. Desconexión y reconexión de cocina: recupera pedidos; no permite avances incompatibles ni pierde cambios confirmados.
12. Sesión de mesa cerrada: un QR o token anterior no expone la cuenta siguiente.
13. Restauración de respaldo en un entorno aislado: datos y relaciones verificadas.
14. Recorridos de los cinco roles con teclado, lector de pantalla, escalado de texto, distintos tamaños y estados vacíos/error/carga.

Usar los emuladores realmente disponibles y un entorno de integración aislado para lo no emulable. Los dobles de prueba no sustituyen comprobar la pasarela de pruebas ni las reglas desplegadas. Priorizar cobertura de riesgos e invariantes; no imponer un porcentaje decorativo.

## 13. Git, CI y entrega

Inspecciona `git status` antes de editar. No sobrescribas cambios ajenos, hagas `reset --hard`, borrados masivos o push forzado. Trabaja en ramas pequeñas por fase o funcionalidad si la política del repositorio lo requiere. Haz commits coherentes solo conforme a la autorización y práctica del proyecto; no publiques ni fusiones automáticamente.

Versiona esquemas, operaciones, migraciones, reglas, pruebas y archivos de bloqueo de dependencias. Define una política reproducible para código generado. No versionar secretos ni datos personales. Cada revisión debe explicar problema, solución, pruebas y riesgos relevantes.

CI debe ejecutar formato, análisis estático, pruebas pertinentes, validación de generación/esquemas, controles de secretos y compilaciones de las plataformas objetivo disponibles. Registrar comandos y resultados reales. Una herramienta ausente es una limitación, no una prueba aprobada.

La entrega incluye instrucciones de configuración y ejecución, variables necesarias sin valores secretos, migraciones, usuarios/datos ficticios, recorridos de prueba, monitoreo y recuperación. No crear recursos facturables, desplegar producción ni ejecutar cobros reales sin autorización explícita.

## 14. Primera respuesta esperada de Claude Code

Entrega: (1) estado verificable del repositorio; (2) requisitos cubiertos y faltantes; (3) propuesta de arquitectura y esquema; (4) matriz de permisos y riesgos prioritarios; (5) decisiones pendientes sobre país, pasarela, plataformas, impuestos, propinas, sesión compartida y política de garantía; (6) plan de Fase 0 y aceptación de Fase 1. Pregunta solo lo que bloquee una decisión relevante; documenta los supuestos restantes.

## 15. Fuentes técnicas y alcance de la consolidación

Este archivo consolida el encargo y las reglas recuperadas de la conversación «Requerimientos sistema restaurante»; desarrolla especificaciones nuevas donde el historial disponible no contiene el prompt técnico completo. Es una base de implementación, no evidencia de un sistema ya construido.

Referencias oficiales consultadas el 13 de noviembre de 2026; verificar de nuevo al implementar:

- [Firebase SQL Connect, antes Data Connect](https://firebase.google.com/docs/sql-connect): servicio relacional basado en Cloud SQL PostgreSQL, operaciones y SDK.
- [Autorización y atestación de SQL Connect](https://firebase.google.com/docs/sql-connect/authorization-and-security): controles de acceso del conector; no confundirlos con reglas de Firestore.
- [Stripe: separar autorización y captura](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method): ejemplo de capacidades y vencimientos dependientes del proveedor. Es una referencia técnica, no una selección de pasarela para Tavelyo.

