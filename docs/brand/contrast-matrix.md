# Matriz de contraste

Estado: **Fase 1** — los pares usados por los componentes se comprueban en cada ejecución de las pruebas (sección «Pares de los componentes»). Las tablas siguientes son los valores de la Fase 0.
Método: fórmula de luminancia relativa y relación de contraste de WCAG 2.2, calculada con un script Node.js el 2026-11-13 sobre los valores HEX de `IDENTIDAD_VISUAL.md` §4.
Umbrales: texto normal 4,5:1 · texto grande 3:1 · componentes de interfaz y señales gráficas 3:1.

Esta matriz no sustituye la verificación en pantalla: en Fase 1 se repetirá para cada par realmente usado por los componentes, en todos sus estados (normal, foco, pulsado, deshabilitado, seleccionado).

## Pares de los componentes (Fase 1)

Fuente: `packages/design-system/src/contrast-pairs.ts`. La prueba `tokens.test.ts` falla si un par baja de su mínimo, así que la tabla no puede quedar desactualizada sin que CI lo detecte. Generada el 2026-11-13.

Colores funcionales nuevos, medidos antes de adoptarlos: `text.secondary #6B5650`, `border.control #8A766F`, `action.primaryHover #A62F22`, `action.primaryPressed #9A2B1F`, `surface.disabled #F0E4DA` con `text.disabled #7D6A63` (los controles deshabilitados están exentos del criterio 1.4.3; se exige 3:1), `border.subtle #EBD9CC` (solo decorativo, no informa nada). El anillo de foco es espresso sobre superficies claras y crema sobre espresso. La casilla de verificación (`CheckboxField`, 2026-11-14) es nativa con `accent-color: action.primary`: su marca usa el par «action.primary (límite del botón)», ≥ 4,81:1 sobre las tres superficies claras.

| Uso | Primer plano | Fondo | Relación | Mínimo | Resultado |
|---|---|---|---|---|---|
| text.primary sobre surface.page | `#35241F` | `#FFF5E9` | 13,69:1 | 4,5:1 | ✅ |
| text.primary sobre surface.card | `#35241F` | `#FFFFFF` | 14,75:1 | 4,5:1 | ✅ |
| text.primary sobre surface.grouped | `#35241F` | `#FCE6D8` | 12,26:1 | 4,5:1 | ✅ |
| text.secondary sobre surface.page | `#6B5650` | `#FFF5E9` | 6,34:1 | 4,5:1 | ✅ |
| text.secondary sobre surface.card | `#6B5650` | `#FFFFFF` | 6,84:1 | 4,5:1 | ✅ |
| text.secondary sobre surface.grouped | `#6B5650` | `#FCE6D8` | 5,68:1 | 4,5:1 | ✅ |
| border.control sobre surface.page | `#8A766F` | `#FFF5E9` | 3,98:1 | 3:1 | ✅ |
| border.control sobre surface.card | `#8A766F` | `#FFFFFF` | 4,28:1 | 3:1 | ✅ |
| border.control sobre surface.grouped | `#8A766F` | `#FCE6D8` | 3,56:1 | 3:1 | ✅ |
| focus.ring sobre surface.page | `#35241F` | `#FFF5E9` | 13,69:1 | 3:1 | ✅ |
| focus.ring sobre surface.card | `#35241F` | `#FFFFFF` | 14,75:1 | 3:1 | ✅ |
| focus.ring sobre surface.grouped | `#35241F` | `#FCE6D8` | 12,26:1 | 3:1 | ✅ |
| action.primary (límite del botón) sobre surface.page | `#BA3526` | `#FFF5E9` | 5,38:1 | 3:1 | ✅ |
| action.primary (límite del botón) sobre surface.card | `#BA3526` | `#FFFFFF` | 5,79:1 | 3:1 | ✅ |
| action.primary (límite del botón) sobre surface.grouped | `#BA3526` | `#FCE6D8` | 4,81:1 | 3:1 | ✅ |
| status.error (texto de error de campo) sobre surface.page | `#B91C1C` | `#FFF5E9` | 6,00:1 | 4,5:1 | ✅ |
| status.error (texto de error de campo) sobre surface.card | `#B91C1C` | `#FFFFFF` | 6,47:1 | 4,5:1 | ✅ |
| status.error (texto de error de campo) sobre surface.grouped | `#B91C1C` | `#FCE6D8` | 5,38:1 | 4,5:1 | ✅ |
| text.onAction sobre action.primary | `#FFFFFF` | `#BA3526` | 5,79:1 | 4,5:1 | ✅ |
| text.onAction sobre action.primaryHover | `#FFFFFF` | `#A62F22` | 6,88:1 | 4,5:1 | ✅ |
| text.onAction sobre action.primaryPressed | `#FFFFFF` | `#9A2B1F` | 7,67:1 | 4,5:1 | ✅ |
| text.onAction sobre status.error (botón destructivo) | `#FFFFFF` | `#B91C1C` | 6,47:1 | 4,5:1 | ✅ |
| text.primary sobre action.secondary | `#35241F` | `#FFFFFF` | 14,75:1 | 4,5:1 | ✅ |
| text.primary sobre action.secondaryHover | `#35241F` | `#FFF5E9` | 13,69:1 | 4,5:1 | ✅ |
| text.primary sobre action.secondaryPressed | `#35241F` | `#FCE6D8` | 12,26:1 | 4,5:1 | ✅ |
| text.onInverse sobre surface.inverse | `#FFF5E9` | `#35241F` | 13,69:1 | 4,5:1 | ✅ |
| focus.ringOnInverse sobre surface.inverse | `#FFF5E9` | `#35241F` | 13,69:1 | 3:1 | ✅ |
| accent.identity (indicador de selección) sobre surface.page | `#E54835` | `#FFF5E9` | 3,67:1 | 3:1 | ✅ |
| accent.identity (indicador de selección) sobre surface.card | `#E54835` | `#FFFFFF` | 3,95:1 | 3:1 | ✅ |
| text.disabled sobre surface.disabled | `#7D6A63` | `#F0E4DA` | 4,09:1 | 3:1 | ✅ |
| status.success sobre surface.card | `#15803D` | `#FFFFFF` | 5,02:1 | 4,5:1 | ✅ |
| status.success sobre surface.page | `#15803D` | `#FFF5E9` | 4,65:1 | 4,5:1 | ✅ |
| status.warning sobre surface.card | `#B45309` | `#FFFFFF` | 5,02:1 | 4,5:1 | ✅ |
| status.warning sobre surface.page | `#B45309` | `#FFF5E9` | 4,66:1 | 4,5:1 | ✅ |
| status.error sobre surface.card | `#B91C1C` | `#FFFFFF` | 6,47:1 | 4,5:1 | ✅ |
| status.error sobre surface.page | `#B91C1C` | `#FFF5E9` | 6,00:1 | 4,5:1 | ✅ |
| status.info sobre surface.card | `#1D4ED8` | `#FFFFFF` | 6,70:1 | 4,5:1 | ✅ |
| status.info sobre surface.page | `#1D4ED8` | `#FFF5E9` | 6,22:1 | 4,5:1 | ✅ |

## Texto y elementos sobre fondos claros

| Primer plano | Fondo | Relación | Resultado |
|---|---|---|---|
| espresso `#35241F` | cream `#FFF5E9` | 13.69:1 | ✅ AA |
| espresso `#35241F` | white `#FFFFFF` | 14.75:1 | ✅ AA |
| espresso `#35241F` | peach `#FCE6D8` | 12.26:1 | ✅ AA |
| tomato `#E54835` | cream `#FFF5E9` | 3.67:1 | ⚠️ solo texto grande / no textual |
| tomato `#E54835` | white `#FFFFFF` | 3.95:1 | ⚠️ solo texto grande / no textual |
| tomato `#E54835` | peach `#FCE6D8` | 3.29:1 | ⚠️ solo texto grande / no textual |
| action.primary `#BA3526` | cream `#FFF5E9` | 5.38:1 | ✅ AA |
| action.primary `#BA3526` | white `#FFFFFF` | 5.79:1 | ✅ AA |
| action.primary `#BA3526` | peach `#FCE6D8` | 4.81:1 | ✅ AA |
| paprika `#EE8A34` | cream `#FFF5E9` | 2.34:1 | ❌ |
| paprika `#EE8A34` | white `#FFFFFF` | 2.52:1 | ❌ |
| paprika `#EE8A34` | peach `#FCE6D8` | 2.10:1 | ❌ |
| status.success `#15803D` | cream `#FFF5E9` | 4.65:1 | ✅ AA (margen escaso) |
| status.success `#15803D` | white `#FFFFFF` | 5.02:1 | ✅ AA |
| status.success `#15803D` | peach `#FCE6D8` | 4.17:1 | ⚠️ solo texto grande / no textual |
| status.warning `#B45309` | cream `#FFF5E9` | 4.66:1 | ✅ AA (margen escaso) |
| status.warning `#B45309` | white `#FFFFFF` | 5.02:1 | ✅ AA |
| status.warning `#B45309` | peach `#FCE6D8` | 4.17:1 | ⚠️ solo texto grande / no textual |
| status.error `#B91C1C` | cream `#FFF5E9` | 6.00:1 | ✅ AA |
| status.error `#B91C1C` | white `#FFFFFF` | 6.47:1 | ✅ AA |
| status.error `#B91C1C` | peach `#FCE6D8` | 5.38:1 | ✅ AA |
| status.info `#1D4ED8` | cream `#FFF5E9` | 6.22:1 | ✅ AA |
| status.info `#1D4ED8` | white `#FFFFFF` | 6.70:1 | ✅ AA |
| status.info `#1D4ED8` | peach `#FCE6D8` | 5.57:1 | ✅ AA |

## Texto sobre fondos de color (botones, chips, cabeceras)

| Primer plano | Fondo | Relación | Resultado |
|---|---|---|---|
| white | tomato `#E54835` | 3.95:1 | ⚠️ solo texto grande |
| white | action.primary `#BA3526` | 5.79:1 | ✅ AA |
| white | paprika `#EE8A34` | 2.52:1 | ❌ |
| espresso `#35241F` | paprika `#EE8A34` | 5.84:1 | ✅ AA |
| espresso `#35241F` | tomato `#E54835` | 3.73:1 | ⚠️ solo texto grande |
| white | espresso `#35241F` | 14.75:1 | ✅ AA |
| cream `#FFF5E9` | espresso `#35241F` | 13.69:1 | ✅ AA |
| white | status.success `#15803D` | 5.02:1 | ✅ AA |
| white | status.warning `#B45309` | 5.02:1 | ✅ AA |
| white | status.error `#B91C1C` | 6.47:1 | ✅ AA |
| white | status.info `#1D4ED8` | 6.70:1 | ✅ AA |

## Conclusiones para el sistema de diseño

1. **Botón primario:** fondo `action.primary #BA3526` con texto blanco. No usar `#E54835` como fondo de botón con texto normal.
2. **Rojo tomate:** identidad, acentos, indicadores de selección grandes o texto ≥ tamaño grande. No para texto normal.
3. **Paprika:** no alcanza 3:1 sobre fondos claros, así que **no sirve como texto, icono aislado ni borde informativo** sobre crema, blanco o durazno. Usarlo como superficie con texto espresso, o como decoración no informativa.
4. **Estados sobre durazno:** éxito y aviso no alcanzan 4,5:1 sobre `#FCE6D8`; en superficies durazno usar texto espresso con icono del color semántico o un fondo blanco/crema.
5. **Éxito y aviso sobre crema:** cumplen con poco margen (≈4,65:1); evitar tamaños pequeños con peso ligero.
6. **Modo oscuro:** no evaluado (fuera de Fase 1 según SUP-05).
