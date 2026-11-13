# Registro de pruebas — Fase 1

Rama: `fase-1-base`. Se registra cada ejecución con el comando, el resultado real y lo que no se pudo ejecutar.

## 2026-11-13 — Base del monorepo y `packages/core`

| Comprobación | Comando | Resultado |
|---|---|---|
| Formato | `npx prettier --check .` | ✅ Todos los archivos con el estilo de Prettier |
| Análisis estático | `npx eslint .` | ✅ Sin errores |
| Tipos | `npm run typecheck` (TypeScript 6.0.3 estricto, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) | ✅ Sin errores |
| Unitarias | `npx vitest run` | ✅ 3 archivos, **70 pruebas** |
| Límite entre paquetes | Archivo temporal que importa `@tavelyo/core/src/money` | ✅ ESLint lo rechaza (`no-restricted-imports`); archivo eliminado |

Cobertura funcional de `packages/core` (ADR-0005):

- `Money`: frontera `Int64` como cadena, incluido 2⁵³ + 1 sin pérdida; rechazo de cadenas no canónicas y de monedas no admitidas; aritmética inmutable; error al mezclar monedas; cantidades enteras seguras.
- Puntos básicos con los cuatro modos de redondeo, incluidas mitades exactas y negativos.
- Reparto: la suma de las partes es exactamente el total en 63 combinaciones de importes y pesos; residuo por mayor resto y luego por índice; signo conservado; pesos cero.
- `UtcInstant`: solo ISO 8601 con `Z`; rechaza fechas inexistentes (31 de febrero, 29 de febrero en año no bisiesto); compara por instante.

No ejecutado todavía: integración con emuladores, componentes, PWA y matriz de navegadores (siguientes bloques de la fase).
