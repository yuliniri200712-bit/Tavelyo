# Plan de Fase 2 — Salón y carta

Estado: **aprobado por el propietario el 2026-11-14**, junto con `qrcode-generator` 2.0.4 y la sesión anónima de Firebase Authentication para clientes (ADR-0011). Rama de trabajo: `fase-2-salon-carta`.

## 1. Objetivo

Según PM §11: sucursales, sectores, mesas, catálogo, QR y sesión de mesa, y carrito.

**Condición para terminar:** precios validados por el servidor; sesiones aisladas; flujo de pedido preparado con un adaptador de pago **simulado y explícito**. El envío a cocina es de la Fase 3.

## 2. Decisiones del propietario (2026-11-14)

| ID | Decisión |
|---|---|
| D-01 | Colombia y peso colombiano (COP); zona horaria de referencia `America/Bogota` |
| D-01b | **Los precios de la carta incluyen impuestos.** La cuenta desglosa el impuesto contenido. La tasa (impoconsumo, IVA o ninguna) la configura cada empresa con su contador; Tavelyo no fija tasas |
| D-21 | **El mesero abre la mesa.** El QR siempre muestra la carta, pero para pedir hace falta que la mesa esté abierta |
| D-22 | **Fotos de los platos más adelante.** Carta sin fotos en esta fase; las fotos requieren aprobar Cloud Storage |
| D-06 (parcial) | **Cada persona tiene su propio carrito** y nadie ve el de los demás. Quién ve y paga qué en la cuenta se decide en las fases de pedidos y caja |

Pendiente para la Fase 3: **D-04** (si la preautorización es obligatoria antes de enviar a cocina). En esta fase el adaptador simulado se ejercita sin decidirlo. **Resuelta el 2026-11-16:** obligatoria y sin excepciones (`requirements.md`).

## 3. Diseño propuesto

### Sesión de mesa del cliente (ADR-0011, aceptada)

- **QR:** es solo una URL de `menu-web` con el `qrPublicId` de la mesa, aleatorio y rotable desde administración. No lleva secretos.
- **Carta pública:** cualquiera con el QR ve la carta de esa sucursal, solo con productos disponibles. Nunca ve datos de mesas, sesiones ni pedidos.
- **Para pedir:**
  1. La app inicia una **sesión anónima de Firebase Auth**. Es un proveedor de Firebase Authentication, que ya está aprobada; hay que habilitarlo en el proyecto, sin coste.
  2. Luego llama al backend `joinTableSession`, que comprueba que un mesero abrió la mesa y crea un `SessionParticipant`. Este guarda el `auth.uid` del cliente y una expiración.
- **Reglas de acceso:**
  - Las operaciones del cliente exigen ser participante vigente de una sesión **abierta**, comprobado con `@check` por `auth.uid`.
  - Al cerrar la mesa, sus participantes dejan de tener acceso, y la sesión siguiente exige volver a unirse (caso 12 de PM §12).
- **Riesgo T11 (QR fotografiado desde fuera):**
  - mitigado porque el mesero abre la mesa (D-21);
  - con límites de solicitudes en el backend;
  - y con la lista de participantes visible para el mesero, que puede **expulsarlos**.
  - Un código de mesa por sesión queda como mejora posible si hiciera falta.

### Carta y precios

- **Catálogo por empresa:** categorías, productos, grupos de modificadores (mínimo y máximo) con sus opciones, alérgenos declarados (sin garantizar ausencia), y archivado en lugar de borrado.
- **Por sucursal:**
  - disponibilidad y horarios, en la zona horaria de la sucursal;
  - **precio versionado**, con importe en unidades menores (COP, exponente 2 de ISO 4217) e impuestos incluidos.
- **Captura y presentación:** los precios se escriben en pesos enteros y se muestran sin decimales (`$ 25.000`, formato `es-CO`).
- **`TaxRule` por empresa:** tasa en puntos básicos, siempre incluida en el precio (D-01b). El impuesto contenido se calcula como `total × tasa / (1 + tasa)` con una regla de redondeo explícita y probada (`core`).

### Carrito y validación en el servidor

- **Carrito:** local en el dispositivo de cada persona (D-06). No se guarda en el servidor hasta «Revisar pedido».
- **Validación (`quoteOrder`):** función del backend, idempotente. Recibe las líneas (producto, opciones, cantidad y nota) y las versiones de precio que vio el cliente. Después:
  1. revalida la sesión, la disponibilidad, el horario, las reglas de modificadores y los precios vigentes;
  2. calcula subtotal, impuesto contenido y total con `Money`;
  3. guarda un **resumen verificable** (`OrderQuote`, con identificador, huella y expiración) que la Fase 3 usará para enviar a cocina.
- **Si algo cambió** (precio, disponibilidad), devuelve los cambios para que el cliente los confirme. Nunca cambia un importe en silencio (caso 5).

### Pago simulado

- **Contrato `PaymentGateway`** en `packages/contracts`, con operaciones separadas: autorizar, consultar, capturar, cancelar autorización y reembolsar (RF-PA-01).
- **`SimulatedPaymentGateway`** en el backend, rotulado como simulado en código, interfaz y registros:
  - Solo funciona con los emuladores o el proyecto *demo*; **el backend se niega a arrancar si se configura en un proyecto real**.
  - Permite forzar los resultados aprobado, rechazado, requiere acción y tiempo agotado.
  - En esta fase se usa para autorizar el importe del resumen, **sin** enviar nada a cocina.

## 4. Alcance por bloques

1. **Decisiones, ADR-0011 y esquema:**
   - salón: `Sector`, `DiningTable`, `TableSession`, `SessionParticipant`;
   - carta: `Category`, `Product`, `ProductBranch` (disponibilidad y horario), `Price`, `ModifierGroup`, `ModifierOption`, `TaxRule`;
   - control: `OrderQuote`, `IdempotencyRecord`.
   Con FK compuestas con `tenantId`, `version` donde hay edición concurrente y archivado.
2. **Conectores y autorización:**
   - administración (`catalog.manage`, `price.change`, `table.manage`);
   - meseros (`session.open`, `session.close`);
   - carta pública;
   - cliente participante.
   Más pruebas con dos empresas, IDs alterados y sesiones cerradas.
3. **Backend:**
   - `joinTableSession` y `quoteOrder` (la rotación del QR y la expulsión de participantes se resolvieron en el conector, en el bloque 2);
   - adaptador de pago simulado;
   - límites de solicitudes.
4. **Operaciones, administración:**
   - sucursales (crear y editar, propietario);
   - sectores y mesas con **QR imprimible**;
   - carta: categorías, productos, modificadores, alérgenos, precios, disponibilidad y horarios;
   - impuestos.
5. **Operaciones, meseros:** vista del salón por sectores (mesa libre o abierta, sin depender solo del color), abrir y cerrar mesa, y ver o expulsar participantes.
6. **Clientes (`menu-web`):**
   1. el QR lleva a la carta de la sucursal;
   2. el cliente se une a la mesa;
   3. arma el carrito (cantidades, modificadores, notas y desglose);
   4. «Revisar pedido» devuelve el resumen validado por el servidor, con cambios a confirmar si los hay;
   5. la autorización simulada termina en «Pedido listo; el envío a cocina llega en la Fase 3».
7. **Cierre:**
   - recorridos completos en los 5 navegadores y con emuladores;
   - accesibilidad (axe, teclado, texto al 200 %, TalkBack en Android);
   - documentación y resumen para aprobación.

**Fuera de alcance:**
- envío a cocina, estaciones y seguimiento;
- solicitudes de servicio (llamar al mesero, pedir la cuenta);
- traslados y uniones de mesas;
- cuenta, propinas y pagos reales;
- fotos;
- inventario;
- modo oscuro;
- despliegue.

## 5. Archivos y áreas afectadas

| Área | Contenido |
|---|---|
| `dataconnect/` | Esquema y conectores nuevos, más sus pruebas |
| `backend/` | Funciones nuevas y el adaptador simulado |
| `packages/core` | Impuesto contenido y formato COP |
| `packages/contracts` | `PaymentGateway` y permisos si faltara alguno |
| `packages/data-access` | Pasarelas nuevas y SDK regenerado |
| `packages/features/` | Nuevos módulos: `floor` (salón), `catalog` (carta), `table-session` (sesión del cliente) y `cart` (carrito) |
| `packages/design-system` | Componentes que hagan falta: selector, campo numérico, línea de importe, tarjeta de producto, tarjeta de mesa |
| `apps/operations`, `apps/menu-web` | Pantallas de esta fase |
| `e2e/` | Recorridos nuevos |
| `docs/` | Progreso, pruebas, ADR-0011, modelo de datos, permisos, estados y amenazas |

## 6. Pruebas

- **Unitarias:**
  - impuesto contenido y redondeo en COP, con totales que siempre cuadran;
  - reglas de modificadores;
  - horarios en la zona de la sucursal;
  - estados de la sesión de mesa;
  - cálculo del carrito.
- **Integración (emuladores):**
  - cada operación con dos empresas e IDs alterados (caso 1);
  - sesión cerrada sin acceso y sesión siguiente aislada (caso 12);
  - precio cambiado con el carrito abierto (caso 5);
  - doble pulsación y reintento en «Revisar pedido» (caso 3, parcial);
  - expulsión de participantes;
  - el adaptador simulado no arranca fuera de los emuladores;
  - límites de solicitudes.
- **Componentes y navegador:**
  - recorridos del cliente y del mesero en los 5 navegadores de D-15;
  - axe sin infracciones;
  - teclado, texto al 200 % y estados de carga, error y vacío.
- **Dispositivo real:** el recorrido del cliente desde el QR en tu Android.

## 7. Criterios de aceptación

1. El servidor recalcula y valida todo importe. Un precio cambiado con el carrito abierto exige confirmar el nuevo importe.
2. Una persona de otra empresa, otra sucursal u otra mesa no lee ni modifica nada ajeno, ni siquiera alterando IDs. Una sesión cerrada no da acceso a la siguiente.
3. El flujo de pedido llega hasta el resumen verificable y la autorización con un adaptador **simulado**, que no puede activarse en un proyecto real.
4. Las pantallas nuevas cumplen las reglas de la Fase 1: contraste medido, foco visible, nombres accesibles, texto al 200 % y nada definido fuera de `design-system`.
5. CI en verde, sin secretos y con la documentación al día.

## 8. Aprobaciones que pide este plan

- **Paquete nuevo:** `qrcode-generator` 2.0.4 (MIT, sin dependencias, con tipos), para generar el QR de cada mesa en la app de operaciones. Alternativa descartada: `qrcode` 1.5.4, porque arrastra dependencias de línea de comandos que no hacen falta.
- **Proveedor anónimo de Firebase Authentication** para los clientes. Es configuración del servicio ya aprobado: en los emuladores no requiere nada y en `tavelyo-e2b57` se habilitaría al desplegar.

## 9. Riesgos

- Es la fase más grande hasta ahora. Se entrega por bloques, con commits y CI en cada uno.
- Puede que SQL Connect no exprese alguna regla nueva, por ejemplo la de participante con expiración. En ese caso la regla se lleva al backend, con sus pruebas (ADR-0008).
- QR fotografiado: ver la sesión de mesa en la sección 3.
- El redondeo del impuesto contenido debe conciliarse con la facturación real del restaurante. Se documenta y se revisa con D-02 y la facturación electrónica, que queda fuera de alcance.
