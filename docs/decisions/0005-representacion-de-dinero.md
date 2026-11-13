# ADR-0005 — Representación de importes

**Estado:** Aceptada (impuesta por PM §6) · **Fecha:** 2026-11-13

## Decisión

- Los importes se representan como **enteros en unidades menores** (`bigint` en PostgreSQL; en TypeScript, cliente y backend, `bigint` o cadena decimal canónica en la frontera de datos, nunca `number` para cálculos; ver ADR-0009) con **moneda ISO 4217 explícita**.
- Nunca se usa `double` ni `float` para cálculos autoritativos.
- Objeto de valor `Money(amountMinor, currency)` en `packages/core` (TypeScript puro); operar entre monedas distintas es un error.
- Los porcentajes (impuestos, propinas, descuentos) se expresan en **puntos básicos** enteros.
- El redondeo es determinista y configurable por sucursal; el reparto entre partes usa un algoritmo que garantiza que la suma de las partes es exactamente el total (asignación del residuo documentada).

## Consecuencias

- Las monedas sin decimales o con tres decimales se soportan mediante la tabla de exponentes de ISO 4217.
- Las pruebas unitarias de `Money`, impuestos, redondeo y reparto son obligatorias (PM §12).
