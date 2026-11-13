# ADR-0008 — Autorización multiempresa y revocación

**Estado:** Propuesta (requiere spike D-13) · **Fecha:** 2026-11-13

## Contexto

El aislamiento entre empresas y sucursales es el requisito de seguridad más crítico (RNF-01, amenaza T1). La autenticación de Firebase identifica al usuario, pero no prueba su membresía vigente.

## Propuesta

1. **Fuente de verdad de permisos:** tablas `Membership`, `MembershipBranch`, `Role` y `RolePermission` en PostgreSQL.
2. **Conectores de SQL Connect:** cada operación declara `@auth` y filtra por `auth.uid` unido a una membresía activa del `tenant_id` solicitado. Ninguna operación expone datos sin ese filtro.
3. **Backend:** verifica la membresía en la base en cada operación privilegiada (pagos, reembolsos, cambios de rol, cierres), sin confiar solo en *custom claims*.
4. **Custom claims (opcional):** solo como optimización de UX (mostrar menús), nunca como única comprobación.
5. **Revocación:** al revocar o degradar una membresía, la siguiente operación del servidor la rechaza porque consulta la base; adicionalmente se revocan los *refresh tokens* del usuario si el usuario no tiene otras membresías activas.
6. **Integridad:** claves foráneas compuestas con `tenant_id` impiden vínculos entre empresas.
7. **Defensa adicional opcional:** RLS en PostgreSQL solo si se demuestra con el modelo de conexión real.

## Verificación pendiente (spike D-13)

- Expresividad de `@auth` y filtros de SQL Connect para unir con `Membership` por `auth.uid`.
- Comportamiento con credenciales de servidor que eluden el conector (T10).
- Prueba automatizada: dos empresas de prueba no pueden leerse ni escribirse entre sí (criterio de salida de Fase 1).
