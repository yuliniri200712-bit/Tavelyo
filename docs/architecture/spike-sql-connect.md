# Resultado del spike de SQL Connect (D-13)

Estado: **cerrado**. Las propuestas de §9 fueron **aprobadas por el propietario el 2026-11-13 y aplicadas** en ADR-0005, ADR-0007 y ADR-0008.
Fecha: 2026-11-13 · Rama: `spike/sql-connect` (código desechable, no se integra en `main`) · Plan: [`plans/spike-sql-connect.md`](../plans/spike-sql-connect.md)

> El código, los scripts y la evidencia citados aquí (`spike/sql-connect/…`) viven solo en la rama `spike/sql-connect`, que no se integra en `main`. Este documento es el entregable que sí se integra.

> **Cambio de plataforma (ADR-0009):** el cliente pasó de Flutter a una PWA con React + Vite + TypeScript. La parte de cliente del spike se **repitió con el SDK web** generado por SQL Connect. Los resultados con Flutter se conservan en §5.3 y §6.4 solo como antecedente. Los resultados de servidor no dependen del cliente y siguen vigentes.

## 1. Resumen

| Objetivo del plan | Resultado |
|---|---|
| 1. Autorización por membresía (ADR-0008) | ✅ **Viable.** Aislamiento, roles, revocación inmediata y pertenencia del recurso verificados en emulador (23/23) |
| 2. SDK del cliente (web, TypeScript) | ✅ **Genera, compila y funciona.** `Int64` llega como cadena exacta (también por encima de 2⁵³). ⚠️ Dos defectos menores del generador con solución sin parchear (§5.1) |
| 3. Atomicidad | ✅ **Viable** dentro de una mutación `@transaction`; las FK compuestas son expresables |
| 4. Tiempo real (ADR-0007) | ✅ **Funciona** entre clientes con aislamiento por empresa, y los rechazos (incluida la revocación) **llegan al cliente como error**. ⚠️ Solo emiten señal las operaciones del conector |
| T10 (credenciales de servidor) | ✅ 9/9 en emulador: el servidor elude el conector, pero no la base. ⚠️ El control de acceso de producción (IAM) no se puede verificar en local |

## 2. Entorno

| Elemento | Versión / valor |
|---|---|
| Firebase CLI | 15.30.2 (experimento `fdcrealtime` activo por defecto). Última publicada: 15.36.0 (2026-11-11) |
| Emulador SQL Connect | `dataconnect-emulator-3.4.20` con PGlite local |
| Proyecto | `demo-tavelyo-spike` (prefijo `demo-`: solo emulador, sin recursos reales ni facturables) |
| Cliente web | `firebase` 12.19.0 (`@firebase/data-connect` 0.7.4) y TypeScript 7.0.2, en Node.js 24.19.0 |
| Referencias de protocolo | `firebase-admin` 14.5.1 (endpoints de servidor), leído sin instalarlo |
| Histórico (Flutter) | Flutter 3.47.7, `firebase_data_connect` 0.4.1 y Chrome 157 |

Documentación oficial consultada: *Authorization and security*, *Use generated web/Flutter SDKs* y *Get real-time updates* (firebase.google.com/docs/sql-connect). Sintaxis de directivas comprobada en el `prelude.gql` que genera el emulador.

## 3. Cómo reproducir

Desde `spike/sql-connect` (antes, `npm install` dentro de `web/`). Cada orden arranca emuladores limpios, ejecuta y los apaga:

```sh
firebase emulators:exec --only auth,dataconnect --project demo-tavelyo-spike "node scripts/run-spike.mjs"
firebase emulators:exec --only auth,dataconnect --project demo-tavelyo-spike "node scripts/t10-server-credentials.mjs"
firebase emulators:exec --only auth,dataconnect --project demo-tavelyo-spike "node scripts/realtime-run.mjs"
```

| Pieza | Qué hace |
|---|---|
| `dataconnect/schema/schema.gql` | `Tenant`, `UserProfile`, `Membership` (clave `tenant`+`user`), `Order` (único `tenant`+`idempotencyKey`), `OrderItem` (FK compuesta `order_id`+`tenant_id`) |
| `dataconnect/connector/` | Operaciones de las pruebas P (incluye un control negativo deliberadamente inseguro) y `OrderItemsByOrder` para comprobar `Int64` |
| `dataconnect/realtime/` | Conector de la prueba de tiempo real |
| `web/` | SDK web generado de los dos conectores (`generate.javascriptSdk`) y `realtime-probe.ts`; `npx tsc -p tsconfig.json` comprueba los tipos |
| `scripts/lib/emulator-client.mjs` | Cliente HTTP sin dependencias: cabecera de cliente `X-Firebase-Auth-Token`; vía de servidor con el token `owner` del emulador, `executeGraphql` e `impersonateQuery/Mutation` |
| `scripts/run-spike.mjs` | Pruebas P0–P19 |
| `scripts/t10-server-credentials.mjs` | Pruebas T10-1 a T10-9 |
| `scripts/realtime-run.mjs` | Lanza la sonda web y, en paralelo, actúa como backend |
| `evidence/` | Salida de la última ejecución de cada prueba (`tiempo-real-flutter.txt` es histórico) |

Los usuarios son reales del emulador de Auth y las llamadas usan sus ID tokens: se ejerce el camino de un cliente, no el de un administrador. La sonda web corre en Node con el mismo SDK `firebase` que usará el navegador. **No** se probaron aspectos propios del navegador (PWA, *service worker*, almacenamiento); quedan para Fase 1.

## 4. Autorización, atomicidad e integridad (P0–P19): 23/23 con el resultado esperado

Cada denegación se verificó por su mensaje para confirmar que la rechazó la regla prevista.

| # | Comprobación | Esperado | Resultado y motivo |
|---|---|---|---|
| P0 | OWNER A agrega mesero y cocina a A | Permitido | ✅ |
| P1 | `MyMemberships` (filtro `eq_expr: "auth.uid"`) | Solo la membresía propia | ✅ |
| P2 | Mesero A crea un pedido en A | Permitido | ✅ pedido y línea en una transacción |
| P3 | OWNER B crea un pedido en A | Denegado | ✅ «Sin membresía en la empresa» |
| P4 | Cocina A crea un pedido | Denegado | ✅ «Rol sin permiso para crear pedidos» |
| P5 | Cantidad 0 | Denegado | ✅ `@check(expr: "vars.quantity > 0")` |
| P6 | Clave de idempotencia repetida | Denegado | ✅ índice único `(tenant_id, idempotency_key)` |
| P7 / P8 | Lectura con búsqueda previa `@check` + `@redact` | A sí; B no | ✅ B recibe error y `orders: null` |
| P9 / P10 | Lectura con filtro relacional `memberships_on_tenant: {exist: …}` | A sí; B lista vacía | ✅ |
| P11 | **Control negativo**: consulta con solo `@auth(level: USER)` | Fuga | ✅ B lee los pedidos de A, lo que confirma que `level: USER` no aísla |
| P12 | Llamada sin token | Denegado | ✅ HTTP 401 |
| P13 / P14 | B se agrega como OWNER de A; mesero se autoasciende | Denegado | ✅ «Se requiere OWNER» |
| P15 | B cambia el estado de un pedido de A pasando su propia empresa | Denegado | ✅ «El pedido no pertenece a la empresa» |
| P16 | Cocina A cambia el estado de un pedido de A | Permitido | ✅ |
| P17 | B cuelga una línea de un pedido de A | Denegado por la base | ✅ FK compuesta `order_item_order_id_tenant_id_fkey` |
| P19 | Falla la segunda escritura de una mutación `@transaction` | Error y nada guardado | ✅ se revierte también la primera escritura |
| P18 | Revocación: el mesero revocado lee y escribe **con el mismo ID token** | Denegado | ✅ «Membresía no activa», sin esperar a que caduque el token |

Hallazgos:

- Los dos patrones aíslan entre empresas: (a) búsqueda previa de `membership(key: {tenantId, userId_expr: "auth.uid"})` con `@check` + `@redact`, que **falla con error**; (b) filtro relacional `exist`, que **devuelve vacío**.
- `@check` admite `vars.*` y sirve para validar entradas en el servidor. No hay `CHECK` en el esquema.
- Las FK compuestas exigen declarar las columnas de forma explícita (`tenantId: UUID!`, `orderId: UUID!` y `@ref(fields: [...], references: [...])`) y un `@unique(fields: [...])` en la tabla referida.
- Toda FK **obligatoria** se genera con `ON DELETE CASCADE` y toda FK **opcional** con `SET NULL` (`prelude.gql`). `@ref` no permite cambiarlo. Mitigaciones en §7.1.
- `dataconnect:compile` exige credenciales del proyecto remoto incluso con un proyecto `demo-`. La validación local se hace con el emulador.

## 5. SDK del cliente

### 5.1 SDK web (TypeScript), vigente

- Se genera con `generate.javascriptSdk` (`outputDir`, `package`, `packageJsonDir`, `clientCache`). Produce un paquete npm local con ESM, CJS y tipos, y lo añade como dependencia `file:`. Funciones por operación (`createOrder(dc, vars)`, `rtKitchenOrdersRef(dc, vars)`), enums como objetos de cadenas y `connectorConfig`.
- **`Int64` → `Int64String = string`.** Prueba I1: el valor `9007199254740993` (2⁵³ + 1, que un `number` de JavaScript no puede representar) se envió y se leyó **idéntico, como cadena**. Es exactamente la «cadena decimal canónica» de ADR-0005: no hace falta ninguna corrección para el cliente web.
- Defectos del generador (CLI 15.30.2), con solución sin tocar el código generado:
  1. El `.d.ts` escribe `};` tras cada `enum`; TypeScript 6.0.3 y 7.0.2 lo rechazan (TS1036). `skipLibCheck: true`, el valor por defecto en las plantillas de Vite, lo evita. El resto del código sí se comprueba en modo estricto.
  2. El paquete generado declara `firebase` **^12.11.0** como *peer*, pero la versión vigente es la 13.3.0. Se usó la 12.19.0. ADR-0010 debe fijar `firebase` 12.x hasta que el generador admita la 13.
- **Caché compartida:** `dataConnectSettings` crea **un único** proveedor de caché en memoria a nivel de módulo, compartido por todas las instancias de la página. En dispositivos compartidos de la sucursal, la caché se debe crear por sesión y vaciar al cerrar sesión o cambiar de empresa (criterio 3 del plan de Fase 1).

### 5.2 Versiones (búsqueda hecha para el SDK Dart)

| Fuente | Resultado |
|---|---|
| pub.dev `firebase_data_connect` | La última es 0.4.1 (2026-10-23), sin corrección de `bigIntFromJson`/`bigIntToJson` |
| FlutterFire `main` y PR #17673 | Sin esas funciones; el PR (2025-09-12) es `Int64 → int` en `nativeFromJson`, ya incluido en 0.4.1 |
| `firebase-tools` 15.31–15.36 | Notas de versión sin menciones a Dart, `Int64` ni `BigInt` |
| CLI 15.36.0 | No se pudo probar: el *Control de aplicaciones* de Windows bloquea `dataconnect-emulator-3.4.26.exe` (no se eludió) |

Con ADR-0009 este bloqueo **deja de afectar** a Tavelyo.

### 5.3 SDK Dart (histórico, obsoleto por ADR-0009)

Generaba y funcionaba sin `Int64`. Con `Int64` producía 4 errores de compilación por funciones inexistentes en `firebase_data_connect` 0.4.1.

## 6. Tiempo real (punto 4)

### 6.1 Montaje

- Sonda `web/realtime-probe.ts` con tres usuarios en apps de Firebase separadas (`appId` y caché propios): cocina/dueño de A, mesero de A y dueño de B.
- Suscripciones con `subscribe(ref, {onNext, onErr})` a `RtKitchenOrders`, que usa `@refresh(onMutationExecuted: {operation, condition: "request.variables.tenantId == mutation.variables.tenantId"})` sobre `RtCreateOrder` y `RtUpdateOrderStatus`.
- En paralelo, `realtime-run.mjs` actúa como backend sobre el pedido `backend-*`: **paso 1** con `executeGraphql` de administrador y, 8 s después, **paso 2** con `impersonateMutation` de la operación del conector.

### 6.2 Resultados con el SDK web (`evidence/tiempo-real-web.txt`)

| # | Comprobación | Resultado |
|---|---|---|
| I1 | `Int64` por encima de 2⁵³ de ida y vuelta | ✅ `"9007199254740993"` enviado y leído igual, tipo `string` |
| R1 | La cocina recibe un pedido creado por **otro cliente** | ✅ en **69 ms** (emulador local, no representativo de producción) |
| R2 | La cocina recibe el cambio de estado hecho por otro cliente | ✅ en **88 ms** |
| R3 | B suscrito a la lista de A | ✅ nunca recibe datos |
| R3 | Suscripción de B a su propia empresa | ✅ no recibe pedidos de A; la `condition` descarta las señales de A (0 eventos) |
| R5 | ¿Llegan los rechazos al cliente? | ✅ **Sí**: B recibió 4 errores `PERMISSION_DENIED` en `onErr` durante la medición |
| R4 paso 1 | Cambio del backend con `executeGraphql` | ❌ **No emite señal**: la cocina siguió mostrando `SUBMITTED` 8 s |
| R4 paso 2 | Cambio del backend con `impersonateMutation` | ✅ La cocina se actualizó **20 ms** después |
| R6 | Se revoca al mesero mientras está suscrito y luego cambia un pedido | ✅ El mesero **no recibe datos nuevos** y **recibe `onErr`** («Membresía no activa»); la cocina sí recibe el cambio |

El servidor registró 7 refrescos rechazados (6 de B sobre A y 1 del mesero revocado), lo que coincide con lo observado en los clientes.

### 6.3 Hallazgos

1. El refresco se dispara **por nombre de operación del conector**. Los cambios fuera del conector (GraphQL arbitrario de administrador y, por extensión, SQL directo) **no** se propagan. Según la documentación, `_updateMany`/`_deleteMany` tampoco emiten señales.
2. Cada refresco se ejecuta con la identidad del suscriptor y vuelve a aplicar `@auth`/`@check`. La revocación corta los datos de inmediato y el SDK web **lo comunica con `onErr`**, lo que permite cerrar sesión o mostrar el estado.
3. Requiere `clientCache` en el SDK generado.
4. **No verificado:** navegador real (Chrome/Safari) con *service worker*, límites de suscripciones, coste, producción y reconexión tras cortes de red.

### 6.4 Antecedente con Flutter (histórico)

Con `firebase_data_connect` 0.4.1 en Flutter web, el tiempo real y el aislamiento se comportaron igual, pero **los rechazos no llegaban al listener** (excepción no capturada en `ref.dart`). También apareció un artefacto de la prueba: varias instancias con el mismo `appId` se cerraban el WebSocket entre sí en modo depuración. Ninguno de los dos aplica al SDK web. Evidencia: `evidence/tiempo-real-flutter.txt`.

## 7. Mitigaciones propuestas

### 7.1 `ON DELETE CASCADE` en FK obligatorias

| # | Mitigación | Estado |
|---|---|---|
| 1 | **No exponer `_delete`/`_deleteMany`** en conectores sobre entidades con historia (empresa, sucursal, pedido, cuenta, pago, inventario). Archivado lógico (`archivedAt`/estado) | Aplicable en Fase 1 |
| 2 | Comprobación automática en CI: ningún `.gql` de conector contiene `_delete` sobre tablas protegidas, salvo una lista blanca revisada | Aplicable en Fase 1 |
| 3 | El backend no borra entidades con historia; retención y anonimización (D-10) actualizan, no borran en cascada | Diseño |
| 4 | FK opcional (`SET NULL`) solo donde perder el vínculo es aceptable; **nunca** en dinero ni en pedidos | Diseño |
| 5 | Mínimo privilegio en IAM y en la base: cuentas de servicio sin `DELETE` sobre tablas financieras | Requiere el proyecto real |
| 6 | Migración manual a `ON DELETE RESTRICT` o un *trigger* que impida `DELETE`, con `schemaValidation: COMPATIBLE` | **No verificado**: riesgo de que SQL Connect lo revierta o lo marque como divergente |

### 7.2 Operaciones que solo exigen `@auth(level: USER)`

| # | Mitigación | Estado |
|---|---|---|
| 1 | Toda operación sobre datos de una empresa incluye la búsqueda de membresía con `@check` + `@redact` (o el filtro `exist` en listados). `level: USER` por sí solo, únicamente en operaciones sobre el propio usuario (`auth.uid`) | Aplicable en Fase 1 |
| 2 | *Lint* de `.gql` en CI: falla si una operación con `@auth(level: USER)` no contiene `membership(` ni `eq_expr: "auth.uid"`, salvo una lista blanca justificada | Aplicable en Fase 1 |
| 3 | Prueba de aislamiento **por operación** con dos empresas (como P3/P8/P10/P15), criterio de salida de cada fase | Aplicable en Fase 1 |
| 4 | `@check` + `@redact` (error explícito) en mutaciones y detalle; el filtro silencioso solo en listados | Guía |
| 5 | Comprobar también la pertenencia del recurso (P15), no solo la membresía | Guía |
| 6 | La identidad del llamador sale siempre de `auth.uid`, nunca de una variable | Guía |
| 7 | Lista de verificación de revisión de código para `.gql` | Aplicable en Fase 1 |

## 8. T10: credenciales de servidor (`evidence/t10-credenciales-servidor.txt`): 9/9

| # | Comprobación | Resultado |
|---|---|---|
| T10-1 | El servidor lee pedidos de cualquier empresa con `executeGraphql` | Acceso total: no aplican `@auth` ni membresía |
| T10-2 | El servidor nombra OWNER de A a un usuario de B | Permitido: **el conector no protege al backend** |
| T10-3 | El servidor cuelga una línea de B en un pedido de A | **Denegado por la FK compuesta**: la base protege incluso frente al servidor |
| T10-4 | GraphQL arbitrario suplantando a B | Denegado: solo se acepta como administrador. *La expectativa inicial era otra; se corrigió tras observar el resultado* |
| T10-5 / T10-6 | Operación del conector (`impersonateQuery`) suplantando a B / a A | B denegado por `@check`; A permitido: **suplantar mantiene las reglas** |
| T10-7 | Operación como no autenticado | Denegado por `@auth(level: USER)` |
| T10-8 / T10-9 | `executeGraphql` con el ID token de un cliente, o sin credencial | **Aceptado en el emulador**, que no aplica IAM. En producción depende de IAM: **no verificable en local** |

No probado: acceso por SQL directo (no hay cliente de PostgreSQL instalado; añadirlo requería una dependencia no aprobada). Por razonamiento, con credenciales de base solo aplican las restricciones de PostgreSQL, como en T10-3.

## 9. Propuestas de cambio a las ADR (**aprobadas y aplicadas el 2026-11-13**)

### ADR-0005 — Representación de importes

- **Sin cambios** en la decisión de fondo. ADR-0009 ya adaptó la frase de Dart a TypeScript.
- Precisar la frontera: SQL Connect entrega y recibe `Int64` como **cadena decimal** (verificado, I1). `Money` se construye desde esa cadena a `bigint` (`Money.fromMinorString`) y se serializa de vuelta a cadena. Prohibido convertirlo a `number`.
- Añadir una comprobación en CI: generar el SDK y compilarlo, para detectar desfases entre la CLI y los paquetes (como la dependencia *peer* `firebase` ^12).

### ADR-0007 — Actualización de cocina y meseros

Proponer el estado **Aceptada** con:

1. **Mecanismo principal:** suscripciones de SQL Connect (`subscribe()` con `@refresh(onMutationExecuted)` y `condition` por empresa/sucursal), verificadas con el SDK web.
2. **Base y recuperación (se mantiene):** consulta incremental por cursor (opción B) al abrir la pantalla, al reconectar, al volver la PWA a primer plano y tras cualquier `onErr`.
3. **Regla para el backend:** todo cambio que deba verse en tiempo real se hace con una **operación del conector** (`impersonateMutation` o una operación de servidor del conector), nunca con `executeGraphql` arbitrario, `_updateMany`/`_deleteMany` ni SQL directo.
4. **Cliente:** tratar `onErr` según su código. `PERMISSION_DENIED` o `UNAUTHENTICATED` (p. ej. revocación) → salir del contexto de la empresa y volver al selector o al inicio de sesión. Errores de red → indicador de conexión y re-consulta.
5. **FCM (opción C):** descartado para cocina; solo para avisos fuera de la app (Web Push, sujeto a los navegadores de D-15).
6. **Verificación pendiente:** navegadores reales con *service worker*, producción (latencia, límites, coste con la carga de D-09) y reconexión tras cortes.

### ADR-0008 — Autorización multiempresa y revocación

Proponer el estado **Aceptada** con:

1. Patrón obligatorio: `membership(key: {tenantId, userId_expr: "auth.uid"})` con `@check` + `@redact` en mutaciones y lecturas de detalle; filtro `exist` admitido en listados; comprobación de pertenencia del recurso (P15).
2. **Revocación:** efectiva en la siguiente operación (P18) y en suscripciones activas (R6). Las *custom claims*, solo como optimización de UX. Se mantiene revocar los *refresh tokens* cuando el usuario no tiene otras membresías.
3. **Integridad:** FK compuestas `(…, tenant_id)` en todas las relaciones dentro de una empresa (P17, T10-3).
4. **Backend (T10):** las acciones iniciadas por un usuario se ejecutan como **operaciones del conector suplantando a ese usuario** (`impersonateQuery`/`impersonateMutation`); `executeGraphql` arbitrario, solo para tareas de sistema con comprobaciones y pruebas propias; mínimo privilegio en IAM.
5. **Cliente PWA:** caché de SQL Connect por sesión, vaciada al cerrar sesión o cambiar de empresa (§5.1).
6. **Controles de proceso:** *lint* de `.gql` y prueba de aislamiento por operación como criterios de salida (§7.2).
7. **RLS en PostgreSQL:** opcional y sin verificar.
8. **Verificación pendiente:** IAM real de `executeGraphql`/`impersonate*` (T10-8/9) y acceso por SQL directo.
