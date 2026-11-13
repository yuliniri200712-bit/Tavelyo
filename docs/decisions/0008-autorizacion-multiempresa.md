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

## Verificación pendiente

- IAM real de `executeGraphql` e `impersonate*` en un proyecto de desarrollo: el emulador no aplica IAM.
- Acceso por SQL directo con credenciales de base.
