# ADR-0011 — Sesión de mesa del cliente y niveles de acceso de los conectores

**Estado:** Aceptada · **Fecha:** 2026-11-14 · Aprobada por el propietario con el plan de la Fase 2 (D-21, D-06 carrito y sesión anónima de Firebase Authentication)

## Contexto

En la Fase 2 el cliente escanea el QR de la mesa, ve la carta y arma un pedido desde su teléfono, sin crear una cuenta. PM §7 exige lo siguiente:
- El QR solo identifica la mesa.
- Leer o modificar una cuenta requiere una credencial de alcance reducido, con expiración y rotación.
- Una sesión cerrada no expone la siguiente (caso 12 de PM §12).

Hasta ahora todas las operaciones de los conectores exigían una persona del personal (`@auth(level: USER)` y membresía, ADR-0008).

## Decisión

1. **El QR es una URL de `menu-web` con el `qrPublicId` de la mesa.**
   - Es un UUID aleatorio, rotable desde administración y sin secretos.
   - Rotarlo invalida los QR impresos anteriores.
2. **La carta es pública.**
   - Una única consulta `@auth(level: PUBLIC)` recibe el `qrPublicId` y devuelve solo la carta de esa sucursal: productos no archivados y disponibles, con precio vigente.
   - No devuelve mesas, sesiones, pedidos ni datos del personal.
   - Ninguna otra operación es pública.
3. **El cliente usa una sesión anónima de Firebase Authentication** para pedir; no hay correo ni contraseña.
   - Las operaciones de cliente usan `@auth(level: USER_ANON)` y comprueban que el `auth.uid` es un **participante vigente** de una sesión de mesa **abierta**.
   - Las operaciones del personal siguen en `@auth(level: USER)`, que **no admite** usuarios anónimos. Así un cliente nunca alcanza una operación del personal, aunque conozca su nombre.
4. **El mesero abre la mesa (D-21).**
   - `joinTableSession` (backend) solo crea el participante si la mesa del `qrPublicId` tiene una sesión abierta.
   - El participante guarda `authUid` y `expiresAt` y puede ser expulsado por el personal.
   - Al cerrar la sesión, ningún participante de ella vuelve a tener acceso; para la sesión siguiente hay que unirse de nuevo.
5. **Operaciones solo de servidor.** Las que escriben importes calculados o resúmenes verificables (`OrderQuote`) se declaran en el conector con `@auth(level: NO_ACCESS)`.
   - Solo el Admin SDK del backend puede ejecutarlas; ningún cliente ni miembro del personal puede llamarlas.
   - El backend las ejecuta después de sus propias comprobaciones (ADR-0008 §7) y de validar al usuario con operaciones suplantadas.
6. **Sucursales desde la app.**
   - El propietario crea y edita sucursales con mutaciones del conector que exigen `tenant.settings`, membresía activa y `AuditEvent` en la misma transacción.
   - Las empresas, roles y permisos siguen creándose solo por aprovisionamiento.
7. **Carrito local por persona (D-06).** No se guarda en el servidor hasta «Revisar pedido». Nadie ve el carrito de otra persona.

## Controles de proceso (amplían los de ADR-0008)

`dataconnect/tests/connector-rules.test.ts` exige:

| Nivel | Uso permitido | Condición |
|---|---|---|
| `PUBLIC` | Solo la lista blanca (carta pública) | Filtra por `qrPublicId` |
| `USER_ANON` | Solo la lista blanca de operaciones del cliente | Comprueban el participante por `auth.uid` |
| `NO_ACCESS` | Solo la lista blanca de operaciones de servidor | — |
| `USER` | Operaciones del personal | Mantiene las reglas de ADR-0008 |

Además, `branch_insert` y `branch_update` solo aparecen en las operaciones autorizadas del propietario.

## Consecuencias

- Hay que habilitar el proveedor anónimo de Firebase Authentication en `tavelyo-e2b57` al desplegar. Es configuración sin coste.
- **Riesgo T11, QR fotografiado:**
  - la mesa la abre el mesero;
  - el backend aplica límites de solicitudes;
  - el mesero ve y puede expulsar a los participantes;
  - un código por sesión queda como mejora si hiciera falta.
- **Riesgo, cuentas anónimas sin límite de tiempo:** Firebase no borra solo las cuentas anónimas. La limpieza periódica se define antes de producción.
- **Verificación pendiente:** que el emulador y el servicio real aplican `USER_ANON`, `NO_ACCESS` y las comparaciones de fechas en `@check` como se describe aquí. Lo comprueban las pruebas de integración del bloque 2.
