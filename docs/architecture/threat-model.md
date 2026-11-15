# Modelo de amenazas

Estado: **borrador de Fase 0**. Método: STRIDE sobre los activos y fronteras de confianza de `overview.md`. Las mitigaciones son requisitos de diseño; ninguna está implementada todavía.

## 1. Activos

Datos de cada empresa y sucursal · cuentas y operaciones de pago · datos personales de personal y clientes · integridad de pedidos e inventario · credenciales de servidor y de pasarela · registro de auditoría.

## 2. Fronteras de confianza

1. Dispositivo del cliente (QR, navegador) ↔ SQL Connect / backend.
2. Dispositivos del personal ↔ SQL Connect / backend.
3. Backend ↔ pasarela de pago (salida y webhooks entrantes).
4. Backend / SQL Connect ↔ PostgreSQL (credenciales de servidor que pueden eludir el conector).

## 3. Amenazas priorizadas

| # | Amenaza | STRIDE | Impacto | Mitigación prevista | Prueba (PM §12) |
|---|---|---|---|---|---|
| T1 | Usuario de la empresa A altera `tenant_id`, `branch_id` o un ID para leer/escribir datos de B | I, E | Crítico | Autorización en servidor por operación, claves compuestas, IDs no predecibles, denegar por defecto | Caso 1 |
| T2 | Membresía revocada sigue operando con un token vigente | E | Alto | Verificar membresía en base en operaciones privilegiadas; estrategia de revocación (ADR-0008) | Caso 2 |
| T3 | Doble envío o reintento tras timeout duplica pedido, cobro o descuento de inventario | T | Crítico | Claves idempotentes, `IdempotencyRecord`, unicidad por evento | Caso 3 |
| T4 | Webhook falsificado, duplicado o fuera de orden altera estados | S, T | Crítico | Verificar firma, antigüedad, cuenta, moneda, importe y referencia interna; deduplicar; no retroceder estados confirmados | Caso 8 |
| T5 | Captura confirmada en la pasarela y caída antes de persistir: reintento cobra dos veces | T | Crítico | Intención persistente + idempotencia del proveedor + conciliación programada | Caso 7 |
| T6 | QR o token de una sesión cerrada expone la cuenta siguiente | I | Alto | Credencial de sesión con expiración y rotación; QR solo identifica la mesa | Caso 12 |
| T7 | Cliente manipula precio o total enviado | T | Alto | El servidor recalcula con la versión de precio vigente; cambios requieren confirmación | Caso 5 |
| T8 | Escalamiento de rol mediante invitación o asignación masiva de campos | E | Alto | Validación de `rank`; listas explícitas de campos editables | Caso 1–2 |
| T9 | Fuga de credenciales de base de datos o claves de pasarela en la app o el repositorio | I | Crítico | Gestor de secretos, cuentas de servicio por función, revisión de secretos en CI | CI |
| T10 | Credenciales de servidor eluden las restricciones del conector | E | Alto | Controles explícitos en el backend y pruebas de autorización del propio backend | Caso 1 |
| T11 | Abuso de QR o sesiones anónimas (spam de pedidos, enumeración) | D | Medio | Límites de solicitudes, App Check como capa adicional, expiración | Fase 2: ✅ mesa abierta por el mesero, participación con vencimiento, máximo de participantes, expulsión, rotación del QR y límites de solicitudes en la base (ADR-0011). App Check, pendiente de aprobación |
| T12 | Logs con tokens, datos de tarjeta o personales | I | Alto | Política de logs y revisión | Revisión de código |
| T13 | Modificación del registro de auditoría por roles de negocio | R | Medio | Solo inserción; sin permisos de actualización o borrado | Fase 1 |
| T14 | Dos cajeros capturan o cierran la misma cuenta a la vez | T | Alto | Versionado optimista / bloqueo de cuenta al cerrar | Caso 9 |

## 4. Riesgos técnicos abiertos (no son amenazas, pero afectan la seguridad)

- **R1** Capacidad real de `@auth` y expresiones de SQL Connect para filtrar por membresía. Se verifica en el spike (D-13).
- **R2** Si se añade RLS en PostgreSQL como defensa adicional, debe demostrarse con el modelo de conexión real.
- **R3** Capacidades de la pasarela (autorización incremental, captura parcial, vencimientos) desconocidas hasta D-02.
