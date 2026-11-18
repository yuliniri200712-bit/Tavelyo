# Registro de pruebas — Fase 3B (diseño visual)

Plan: [`plans/fase-3b-diseno-visual.md`](../plans/fase-3b-diseno-visual.md). Las pruebas unitarias se lanzan desde `C:\…` (con la unidad en minúscula, Vitest falla en todos los archivos; ver `testing/fase-3.md`, bloque 7).

## 2026-11-17 — Bloque 1: base del sistema de diseño

| Comprobación | Comando | Resultado |
|---|---|---|
| Componentes nuevos | `npx vitest run packages/design-system` | ✅ 11 pruebas nuevas en `visual-components.test.tsx`: `Icon` decorativo oculto y con etiqueta anunciado, y los 39 nombres del catálogo dibujan un icono; `FilterPills` agrupa, anuncia la opción elegida con `aria-pressed` y lee el contador con el nombre; `TableTile` dice la mesa y su estado en texto; `StatusTimeline` marca el paso en curso con `aria-current` y dice el estado de cada paso en texto; `KitchenTicket` con el título como encabezado, la espera en texto y el bloque de color oculto; `ProductCard` con encabezado, precio, alérgenos y motivo cuando no se puede pedir; `SearchField` con nombre propio; `ActionBar` como región con nombre |
| Contraste | ídem (`tokens.test.ts`) | ✅ 19 pares nuevos (`brand/contrast-matrix.md`, «Pares de la Fase 3B») |
| Sin valores sueltos | ídem (`no-loose-values.test.ts`) | ✅ Los componentes y estilos nuevos solo usan tokens |
| Cabecera | `npx vitest run packages/pwa-shell` | ✅ Sin cambios en lo existente; el tono oscuro es opcional |
| Catálogo en el navegador | Capturas de `/catalogo` en Chromium a 390 y 1280 px | ✅ Sin desplazamiento horizontal; mesas, seguimiento, tickets, productos, filtros y buscador revisados a ojo |
| Conjunto | `npm run check` | ✅ 697 pruebas unitarias (38 más: 11 de componentes, 19 de contraste y 8 archivos más sin valores sueltos), tipos, ESLint y Prettier |

Hallazgo corregido: en `FilterPills` el nombre accesible se leía «Todas8», sin espacio entre el nombre y el contador. Ahora se lee «Todas 8».
