# Registro de pruebas — Fase 4 (caja y pagos)

Plan: [`plans/fase-4.md`](../plans/fase-4.md). Las pruebas unitarias se lanzan desde `C:\…` en PowerShell (con la unidad en minúscula, Vitest falla en todos los archivos; ver `testing/fase-3.md`, bloque 7). Los emuladores corren en el contenedor de Docker `tavelyo-emu`, autorizado para esta fase (ver `testing/fase-2.md`).

## 2026-11-18 — Bloque 1: decisiones y esquema

| Comprobación | Comando | Resultado |
|---|---|---|
| Esquema nuevo | Emulador de SQL Connect (`cuenta.gql` y `caja.gql`) | ✅ Compila y crea las 12 tablas con sus FK compuestas, unicidades e índices |
| Capacidades del esquema | `npx vitest run --config vitest.integration.config.ts dataconnect/tests/capacidades-fase-4.int.test.ts` | ✅ 17 pruebas: una cuenta por sesión; cuenta, caja y operaciones rechazadas con la sesión o la sucursal de otra empresa o sucursal (caso 1); la versión de la cuenta gana una sola vez (caso 9); una preautorización por resumen; misma clave sin pagos, reembolsos ni operaciones duplicados (casos 3, 7 y 10); una línea no se asigna dos veces al mismo pago ni se asigna una de otra empresa; aviso repetido de la pasarela descartado (caso 8); tarea pendiente con su empresa; nombre de caja único por sucursal; una sesión abierta por caja y, cerrada, otra nueva; un conteo por turno; movimientos sin pagos ajenos |
| Regresión de SQL Connect | `npx vitest run --config vitest.integration.config.ts dataconnect` | ✅ 115 pruebas en 7 archivos |
| SDK generado | `firebase-tools@15.30.2 dataconnect:sdk:generate` en el contenedor | ✅ Solo añade las interfaces `*_Key` de las tablas nuevas; el repositorio queda igual que la salida del generador |
| Conjunto | `npm run check` | ✅ 713 pruebas unitarias, tipos, ESLint y Prettier |

## 2026-11-18 — Bloque 2: dinero de la cuenta

| Comprobación | Comando | Resultado |
|---|---|---|
| Cuenta (`bill.ts`) | `npx vitest run packages/core` | ✅ La cuenta suma las líneas que se cobran (sin las canceladas) con su impuesto contenido y lo de cada persona (D-06); rechaza cobrar una línea más de su importe, asignar a una línea cancelada o ajena, importes negativos y monedas mezcladas. Un pago se reparte por las líneas elegidas sin pasar de lo que falta; probado con 43 importes distintos: lo asignado suma siempre el importe exacto. La división en partes iguales va en pesos enteros y suma siempre el total exacto (35 combinaciones de total y partes), con diferencias de a lo sumo un peso. La mesa no se cierra con saldo o con líneas sin entregar (D-30) |
| Propina (`tip.ts`) | ídem | ✅ Sugerida en 10 % y redondeada al peso con mitades hacia arriba (D-05); acepta cero; rechaza negativas, centavos o más que el consumo |
| Cobro de preautorizaciones y reembolsos (`payment-settlement.ts`) | ídem | ✅ Captura lo consumido y libera el resto (captura menor, caso 6); nunca captura más de lo autorizado y deja el faltante para otro pago; sin consumo solo libera; vencida, ya usada o en otra moneda no se captura; sin captura parcial en la pasarela no la intenta. En 25 importes, captura más liberación da lo autorizado y captura más faltante da lo debido. Reembolsos: descuentan los confirmados y los que siguen en curso, no los rechazados; uno mayor que lo disponible, vacío, repetido o sobre el tope del rol se rechaza (caso 10) |
| Caja (`cash.ts`) | ídem | ✅ Cambio y faltante en efectivo; efectivo esperado del turno; cierre con diferencia exige motivo |
| Paquete `core` | `npx vitest run packages/core`, `tsc` y ESLint | ✅ 140 pruebas (30 nuevas) |
