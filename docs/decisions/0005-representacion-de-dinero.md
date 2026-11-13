# ADR-0005 — Representación de importes

**Estado:** Aceptada (impuesta por PM §6) · **Fecha:** 2026-11-13

## Decisión

- Los importes se representan como **enteros en unidades menores** (`bigint` en PostgreSQL; en TypeScript, cliente y backend, `bigint` o cadena decimal canónica en la frontera de datos, nunca `number` para cálculos; ver ADR-0009) con **moneda ISO 4217 explícita**.
- Nunca se usa `double` ni `float` para cálculos autoritativos.
- Objeto de valor `Money(amountMinor, currency)` en `packages/core` (TypeScript puro); operar entre monedas distintas es un error.
- Los porcentajes (impuestos, propinas, descuentos) se expresan en **puntos básicos** enteros.
- El redondeo es determinista y configurable por sucursal; el reparto entre partes usa un algoritmo que garantiza que la suma de las partes es exactamente el total (asignación del residuo documentada).

## Frontera de datos (añadido el 2026-11-13, aprobado por el propietario tras el spike D-13)

- SQL Connect entrega y recibe los campos `Int64` como **cadena decimal** (`Int64String`) en el SDK web. Verificado en el spike con un valor mayor que 2⁵³, que llegó exacto.
- `Money` se construye desde esa cadena a `bigint` (`Money.fromMinorString`) y se serializa de vuelta a cadena. **Prohibido** convertir un importe a `number` en cualquier punto.
- CI genera el SDK de SQL Connect y lo compila en cada cambio, para detectar desfases entre la CLI y los paquetes (como la dependencia *peer* `firebase` ^12 del SDK generado).

## Consecuencias

- Las monedas sin decimales o con tres decimales se soportan mediante la tabla de exponentes de ISO 4217.
- Las pruebas unitarias de `Money`, impuestos, redondeo y reparto son obligatorias (PM §12), incluida la conversión desde y hacia cadena con valores mayores que 2⁵³.
