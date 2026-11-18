# Revisión de referencias visuales

Estado: **Fase 0** · Fecha: 2026-11-13. Revisión de las seis imágenes adjuntas por el propietario (IV §12). Las referencias orientan el diseño, pero las reglas escritas, la accesibilidad y los estados reales prevalecen sobre ellas. Desde el 2026-11-17 las cinco composiciones de interfaz (imágenes 2 a 6) están en `docs/brand/referencias/`: `cliente.webp` (2), `personal.webp` (3), `cocina.webp` (4), `caja.webp` (5) y `administracion.webp` (6). La del logotipo (1) no se guardó; el logotipo aprobado está en `assets/branding/`.

## 1. Logotipo (imagen 1)

**Coincide con el concepto aprobado:** isotipo en T con superficie de mesa/plato, soporte vertical, curvas de conectividad, palabra `tavelyo.` en minúsculas con punto tomate y eslogan «El corazón de tu restaurante, conectado.». Incluye variante horizontal e iconos de app sobre tomate, paprika y durazno.

Observaciones:
- Es raster; el plato tiene volumen y degradado. Validar a 24 px de altura (mínimo del isotipo) si las curvas siguen siendo legibles; si no, se necesita una variante simplificada aprobada.
- El icono sobre paprika usa espresso para el soporte; el contraste del isotipo sobre cada fondo debe medirse con el arte real.

## 2. Patrones aprovechables (imágenes 2–6)

- Fondos crema, tarjetas blancas, texto espresso y acentos rojos: coherente con IV §4.
- Chips de estado con icono y texto, no solo color (mesas en Staff).
- Detalle de pedido con desglose de subtotal, impuestos y total.
- Seguimiento del pedido como línea temporal con estados.
- Cocina: tarjetas grandes con número de mesa y tiempo transcurrido.
- Caja: lista de cuentas abiertas con total y estado.
- Administración: selector de sucursal visible en la cabecera.

## 3. Inconsistencias que no deben reproducirse

| # | Imagen | Hallazgo | Regla afectada | Corrección |
|---|---|---|---|---|
| 1 | 2–6 | Logotipo con **gorro de chef**; wordmark «Tavelyo» con mayúscula, subrayado, ® y sin punto | IV §3 | Usar solo el logo de la imagen 1 cuando exista el maestro |
| 2 | 2 | Paleta distinta: `#C12B2B`, `#E65A2E`, `#FFF3E7`, `#4B2E22`, `#FFD8C2` | IV §4 | Usar la paleta oficial y los tokens funcionales |
| 3 | 2 | Serif elegante para títulos | IV §5 | Plus Jakarta Sans en la interfaz; serif solo promocional tras revisión |
| 4 | 2 | Preautorización: «Se ajustará automáticamente al total de tu consumo» | IV §7, PM §8 | Texto que explique que es una reserva, no el cobro final, sin prometer ajustes automáticos |
| 5 | 3 | «Recoger» y «Entregar» habilitados a la vez | PM §7 (secuencia) | «Entregar» solo tras «Recoger», salvo excepción con permiso |
| 6 | 3 | Errata «3 ítema» | IV §12 | «3 ítems» con plurales localizados |
| 7 | 4 | Estados de cocina por orden completa | PM §7, RF-CO-02 | Estados por línea; la orden se deriva |
| 8 | 4 | Botón «Marcar En preparación» cuando la orden ya está en preparación | Estados válidos | Mostrar solo transiciones permitidas |
| 9 | 4 | Botón naranja con texto blanco (≈2,52:1) | WCAG 2.2 AA | Paprika con texto espresso o `action.primary` |
| 10 | 4 | «Devolver a Recibida» sin indicación de permiso | PM §7 | Retroceso solo como excepción auditada, si se admite |
| 11 | 5 | Mesa M4 muestra $1,740.00; su cuenta suma $1,786.40 | Integridad financiera | Un único cálculo de servidor para todos los resúmenes |
| 12 | 5 | «Vigencia: 30 min» en la preautorización | PM §8 | Mostrar el vencimiento que informe la pasarela, no un valor fijo |
| 13 | 6 | Sector «Delivery» | PM §2 (fuera de alcance) | No incluir hasta que se definan sus requisitos |
| 14 | 6 | Fotografías de personas del personal | IV §12 (derechos de uso) | Avatares con iniciales salvo foto propia con consentimiento |
| 15 | 6 | Emoji 👋 en el saludo | IV §6 (sin emojis operativos) | Aceptable solo como decoración no informativa; preferir omitirlo |
| 16 | 2 vs 5 | Impuestos 12 % y 16 % (IVA) | PM §2 | Confirma que los impuestos deben ser configurables (D-01) |

## 4. Pendiente

- Repetir esta revisión con las pantallas reales a medida que se implementen (pruebas visuales de referencia, IV §13).
