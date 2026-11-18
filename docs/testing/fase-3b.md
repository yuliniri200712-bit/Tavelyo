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

## 2026-11-17 — Bloque 2: cliente

| Comprobación | Comando | Resultado |
|---|---|---|
| Lógica de la carta y del seguimiento | `npx vitest run packages/features/table-session/src/application` | ✅ 8 pruebas nuevas. Buscador: sin filtro deja la carta igual; busca en nombre, descripción y alérgenos sin distinguir tildes ni mayúsculas; exige todas las palabras y quita las secciones vacías; combina búsqueda y categoría. Seguimiento: pasos hechos, en curso y pendientes según el estado derivado del pedido (también «una parte ya está lista»); entregado completa todo y cancelado no tiene seguimiento |
| Pantallas del cliente | `npx vitest run packages/features/table-session` | ✅ 30 pruebas; nuevas: el buscador filtra la carta y explica cuando no hay resultados; «Mis pedidos» marca el paso en curso y lo actualiza en vivo |
| **Recorridos en navegador** | `npx playwright test --config playwright.emulators.config.ts customer-order customer-live accessibility-fase-2 accessibility-fase-3` | ✅ **5 navegadores** de D-15: 31 superadas y 4 omitidas (Tab en Safari, como antes). Sin cambiar lo que comprueban: los nombres accesibles y los textos se conservan. axe sin infracciones; 320 px y texto al 200 % sin desplazamiento horizontal |
| Conjunto | `npm run check` | ✅ 706 pruebas unitarias, tipos, ESLint y Prettier |
| Capturas de antes y después | `npm run capturas -- --output=capturas/<etiqueta>` (nuevo, fuera de CI) | ✅ 7 pantallas en móvil (Pixel 7) y escritorio (1280 px) con datos fijos: carta, opciones, carta con pedido, tu pedido, resumen y pago, pedido enviado y «Mis pedidos» |

Hallazgos:
- **Del equipo local, no del código:** compilada desde `c:\…` (unidad en minúscula), la app empaqueta React dos veces y sale en blanco («Cannot read properties of null (reading 'useSyncExternalStore')»). Desde `C:\…` funciona; la CI no lo sufre. Las compilaciones y Playwright se lanzan desde `C:\`.
- **Corregido en la revisión de capturas:** en escritorio, al abrir las opciones de un plato, la tarjeta vecina se estiraba y dejaba un hueco vacío; ahora el plato abierto ocupa toda la fila.
- Playwright vacía `test-results` al empezar cada ejecución, así que las capturas van a `capturas/` (excluida de git).
- **CI #50 (bloque 1):** la prueba de concurrencia falló una vez en Safari de iPhone porque miraba el aviso «Esta línea ya cambió» una sola vez, justo cuando la pantalla que pierde ya tenía el cambio en vivo pero aún no la respuesta de su pulsación. Ahora espera hasta 15 s a que exactamente una pantalla lo muestre. No es un fallo de la app.
- **Fuera de alcance, a propósito:** el «consumo acumulado» de las referencias suma importes en el teléfono; la cuenta y sus totales son de la Fase 4 y los calcula el servidor.
