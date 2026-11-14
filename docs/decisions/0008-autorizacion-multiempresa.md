# ADR-0008 — Autorización multiempresa y revocación

**Estado:** Aceptada · **Fecha:** 2026-11-13 · Aprobada por el propietario tras el spike D-13

## Contexto

El aislamiento entre empresas y sucursales es el requisito de seguridad más crítico (RNF-01, amenaza T1). La autenticación de Firebase identifica al usuario, pero no prueba su membresía vigente.

## Evidencia (spike D-13, emulador)

- Autorización por membresía, roles, pertenencia del recurso, idempotencia y atomicidad: 23/23 comprobaciones.
- Una consulta que solo exige `@auth(level: USER)` filtra datos de otra empresa (control negativo deliberado). La sesión iniciada no aísla por sí sola.
- La revocación se aplica en la siguiente operación con el mismo ID token y corta las suscripciones activas.
- Con credenciales de servidor, `executeGraphql` elude el conector, pero no las FK compuestas; `impersonateQuery`/`impersonateMutation` conservan `@auth`/`@check` (T10: 9/9).

## Decisión

1. **Fuente de verdad de permisos:** tablas `Membership`, `MembershipBranch`, `Role` y `RolePermission` en PostgreSQL.
2. **Patrón obligatorio en conectores:** búsqueda de `membership(key: {tenantId, userId_expr: "auth.uid"})` con `@check` + `@redact` en mutaciones y lecturas de detalle; el filtro relacional `exist` se admite en listados. Además, cada operación comprueba que el recurso pertenece a la empresa indicada. `@auth(level: USER)` sin comprobación de membresía solo se admite en operaciones sobre el propio usuario (`auth.uid`).
3. **Identidad:** la identidad del llamador sale siempre de `auth.uid`, nunca de una variable.
4. **Revocación:** efectiva en la siguiente operación y en las suscripciones activas, porque cada operación consulta la base. Además, se revocan los *refresh tokens* del usuario si no tiene otras membresías activas.
5. **Custom claims:** solo como optimización de UX (mostrar menús), nunca como única comprobación.
6. **Integridad:** claves foráneas compuestas `(…, tenant_id)` en todas las relaciones dentro de una empresa; protegen incluso frente al servidor.
7. **Backend:** las acciones iniciadas por un usuario se ejecutan como **operaciones del conector suplantando a ese usuario** (`impersonateQuery`/`impersonateMutation`). `executeGraphql` arbitrario queda reservado a tareas de sistema, con comprobaciones propias en el código del backend y pruebas de autorización del backend. Mínimo privilegio en IAM para las cuentas de servicio.
8. **Cliente PWA:** la caché de SQL Connect se crea por sesión y se vacía al cerrar sesión o cambiar de empresa.
9. **Defensa adicional opcional:** RLS en PostgreSQL solo si se demuestra con el modelo de conexión real.

## Controles de proceso (criterios de salida de cada fase)

- *Lint* de los `.gql` en CI: falla si una operación con `@auth(level: USER)` no contiene `membership(` ni `eq_expr: "auth.uid"`, salvo una lista blanca justificada.
- Prueba automatizada de aislamiento **por operación** con dos empresas, incluidos IDs alterados.
- Comprobación en CI de que ningún conector expone `_delete`/`_deleteMany` sobre entidades con historia (las FK obligatorias de SQL Connect borran en cascada).
- Lista de verificación de revisión de código para `.gql`.

## Implementación (Fase 1, 2026-11-13)

- Esquema y conector `tavelyo` en `dataconnect/`, con el patrón de la decisión en todas las operaciones de empresa: membresía activa por `auth.uid`, empresa activa, permiso consultado en `RolePermission` (`rolePermissions_on_role(...) @check(expr: "this.size() > 0")`), rango comparado dentro del mismo paso (`response.query.membership.role.rank`), pertenencia de los recursos a la empresa y `AuditEvent` en la misma transacción.
- Limitaciones verificadas en el emulador: una mutación no admite dos pasos `query` (se agrupan en uno) y un filtro no mezcla `_or` con campos directos (se envuelve en `_and`).
- Controles de proceso: `dataconnect/tests/connector-rules.test.ts` (en `npm run check`) exige `@auth`, comprobación de membresía salvo operaciones sobre uno mismo, `@transaction` + `@redact` + `AuditEvent` en mutaciones, ningún `_delete` fuera de la lista blanca (`UnassignMemberBranch`) y ninguna creación de empresas, sucursales, roles o permisos desde el conector. `dataconnect/tests/authorization.int.test.ts` (en `npm run test:integration`) prueba cada operación con dos empresas e IDs alterados: 33/33. Una prueba de mutación (quitar la comprobación de membresía de `TenantMembers`) hace fallar 4 pruebas, así que los controles detectan la regresión.
- Punto 8 (cliente): el SDK generado no tiene `clientCache` y las consultas usan `QueryFetchPolicy.SERVER_ONLY`, así que no hay caché de datos que vaciar; el estado de la interfaz se desmonta al cambiar de contexto (`key` por empresa y sucursal) y al cerrar sesión (`key` por usuario).
- Punto 4 (2026-11-14): la función `revokeMember` del backend revoca los *refresh tokens* cuando no quedan membresías activas (`permissions.md` §5).
- Punto 7 (2026-11-14): en `firebase-admin` 14.5.0 la suplantación es `executeMutation(nombre, variables, { impersonate: { authClaims } })` (el spike usaba la API REST equivalente, `impersonateMutation`). `revokeMember` la usa con las afirmaciones del ID token verificado; el aprovisionamiento es una tarea de sistema con `executeGraphql`, documento fijo con variables y comprobación propia del operador. `backend/tests/backend.int.test.ts`: 23/23 contra los emuladores, con dos empresas e IDs alterados. Pruebas de mutación: sin la suplantación fallan 4 pruebas; sin la comprobación del operador fallan 3.

## Implementación (Fase 2, 2026-11-14)

- Conectores nuevos con el mismo patrón: `salon.gql` (vista del salón, participantes, abrir y cerrar mesa, expulsar), `mesas.gql` (sectores, mesas y rotación del QR), `carta.gql` (impuestos, categorías, productos, modificadores, disponibilidad y precios) y `sucursales.gql` (crear y editar sucursales). Además de la membresía y el permiso, cada operación de sucursal exige tenerla asignada (salvo el propietario) y comprueba que cada recurso pertenece a la empresa **y** a la sucursal declaradas: declarar la sucursal propia no sirve para tocar una mesa de otra.
- **Hallazgo verificado en el emulador: una variable omitida o nula en un filtro `where` anula ese filtro** (el campo devuelve todo). Además, `vars.x == null` falla si la variable se omite; hay que usar `has(vars.x)`. Por eso una regla nueva de `connector-rules.test.ts` exige que toda variable usada en un filtro sea obligatoria (`!`), salvo una lista blanca donde la expresión de `@check` descarta antes la variable nula (`taxRuleId` en `CreateProduct`/`UpdateProduct`). Una operación de prueba con un filtro opcional hace fallar la regla.
- También verificado: varios `@check` en un mismo campo, ternarios en `_expr` (`vars.archived ? request.time : null`), `uuidV4()` en una actualización (rotación del QR sin backend), referencias a pasos anteriores (`response.price_insert.id`) y que `_upsert` conserva los campos que no recibe.
- En consultas, la comprobación de sucursal referencia `response.membership.role.code` (sin `query.`, que solo existe en mutaciones).
- `dataconnect/tests/salon-carta.int.test.ts`: 25 pruebas con dos empresas, dos sucursales, seis roles y un cliente anónimo; con IDs alterados de la otra empresa, cada operación falla con su mensaje concreto.

## Verificación pendiente

- IAM real de `executeGraphql` e `impersonate*` en un proyecto de desarrollo: el emulador no aplica IAM.
- Acceso por SQL directo con credenciales de base.
