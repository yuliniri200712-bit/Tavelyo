# Manifiesto de recursos de marca

Estado: **Fase 1** (2026-11-13). Registro de cada recurso de marca: archivo, versión, origen, licencia y uso permitido (IV §3, §12).
El logotipo maestro está **aprobado** y se guarda en `assets/branding/` (ver «Logotipo maestro»).

## Recursos recibidos (solo como referencia)

| Recurso | Formato | Origen | Estado | Observaciones |
|---|---|---|---|---|
| Composición del logotipo (isotipo T, `tavelyo.`, eslogan, variante horizontal e iconos de app sobre tomate, paprika y durazno) | Imagen raster (WebP) adjunta en la conversación del 2026-11-13 | Propietario | **Referencia, no maestro** | Coincide con el concepto aprobado (IV §3). No es vectorial; no se copió al repositorio. Necesita el archivo original para registrarse como maestro |
| Cinco composiciones de interfaz (Cliente, Personal, Cocina, Caja, Administración) | Imágenes raster (WebP) | Propietario | **Referencia visual** | Analizadas en `reference-review.md`. Usan un logotipo distinto (gorro de chef), por lo que no son fuente de marca |

## Logotipo maestro (aprobado)

**Aprobado por el propietario el 2026-11-13: propuesta A · Mesa conectada** (D-12). Diseño original de Claude según IV §3, por encargo del propietario. Versión **1.0.0**.

- **Maestro:** `assets/branding/tavelyo-logo-master.svg` (horizontal, fondo claro). Todas las variantes derivan de la misma geometría.
- **Isotipo:** T formada por el tablero de mesa (tomate) y el soporte vertical (tomate), con dos curvas de conectividad (paprika) que nacen del tablero.
- **Palabra:** «tavelyo.» en Plus Jakarta Sans ExtraBold 2.7.1 (SIL OFL 1.1), convertida a trazos (no depende de la fuente instalada) con interletrado −0,025 em y kerning de la fuente. Punto final en tomate. La OFL permite usar la fuente en logotipos; los trazos no son una redistribución de la fuente.
- **Conversión a trazos y exportaciones:** `opentype.js` 1.3.4 (MIT) y Chrome sin interfaz, ejecutados fuera del repositorio; no son dependencias del proyecto.
- **Área de protección:** X = altura de las minúsculas de la palabra (43,68 unidades a cuerpo 80). Cada SVG ya incluye **0,5X** libre alrededor del conjunto. Para el isotipo aislado, la unidad equivalente es la misma X medida en el horizontal (0,49 veces la altura del isotipo).

| Variante | Archivo | Uso |
|---|---|---|
| Maestro · horizontal fondo claro | `tavelyo-logo-master.svg` | Cabeceras, acceso y documentos sobre crema o blanco |
| Horizontal fondo oscuro | `tavelyo-logo-horizontal-dark.svg` | Sobre espresso. Palabra crema; isotipo tomate y paprika |
| Vertical fondo claro / oscuro | `tavelyo-logo-vertical-light.svg`, `tavelyo-logo-vertical-dark.svg` | Composiciones con espacio suficiente |
| Monocromático | `tavelyo-monochrome.svg` (espresso), `tavelyo-monochrome-cream.svg` (crema sobre tomate o espresso) | Una tinta |
| Isotipo | `tavelyo-isotype.svg` (color), `tavelyo-isotype-mono.svg` (espresso) | Navegación compacta |
| Icono de aplicación | `app-icon/tavelyo-app-icon.svg` (esquinas redondeadas, *purpose any*), `app-icon/tavelyo-app-icon-maskable.svg` (fondo completo; el isotipo ocupa el 50 % y queda dentro de la zona segura del 80 %), `app-icon/tavelyo-apple-touch-icon.svg` (fondo completo; iOS redondea) | Manifiestos de las PWA |
| Exportaciones PNG | `png/` (maestro a 1×, 2× y 4×; horizontal oscuro, verticales y monocromático a 2×; isotipo 512 px) y `app-icon/` (`icon-192.png`, `icon-512.png`, `icon-maskable-192.png`, `icon-maskable-512.png`, `apple-touch-icon-180.png`, `favicon-32.png`, `favicon-48.png`, `favicon.svg`) | Donde no se admita SVG |

Contraste de los gráficos (mínimo 3:1): tomate sobre crema 3,67; tomate sobre espresso 3,73; crema sobre tomate 3,67; paprika sobre espresso 5,84. La paprika sobre crema (2,34) solo se usa en las curvas secundarias, nunca en la forma que identifica la T; por eso el icono de aplicación usa el isotipo entero en crema.

Revisión visual a 24 px de isotipo y a 120 px de ancho del horizontal: las curvas se distinguen. **A 16 px las curvas casi desaparecen**: el favicon de 16 px necesita una variante simplificada que el propietario apruebe expresamente (IV §3); mientras tanto se publica `favicon.svg` y los PNG de 32 y 48 px.

La página de propuestas (`proposals/propuestas-logo.html`) se conserva como registro de la elección; B y C quedan descartadas.

## Recursos pendientes

| Recurso | Ruta prevista | Estado |
|---|---|---|
| Favicon simplificado de 16 px | Propuesta: `assets/branding/proposals/favicon-16-propuesta.svg` (comparación: `favicon-16-comparacion.png`) | ⏳ **Pendiente de aprobación del propietario.** Una sola curva, abierta sobre el tablero, y formas alineadas a la cuadrícula de 16 px; crema sobre tomate (3,67:1). Tras aprobarse, se exporta como `favicon-16.png` y se enlaza en las dos apps |
| Icono de notificación | — | ⏳ Variante de una tinta en la fase de notificaciones |
| Pantalla de inicio (*splash*) | — | ⏳ En iOS se genera desde el manifiesto y `apple-touch-icon`; recursos propios si se necesitan |
| Fuente Plus Jakarta Sans | `packages/design-system/assets/fonts/` | ✅ **Confirmada** por el propietario (2026-11-13). Origen: repositorio oficial `tokotype/PlusJakartaSans`, versión 2.7.1. Licencia: SIL Open Font License 1.1 (se copia `OFL.txt` junto a los archivos). Se sirve desde la propia app, sin CDN |

## Reglas

- Usar siempre los archivos de `assets/branding/` sin modificarlos. Cualquier cambio de geometría, color o palabra es una nueva versión que aprueba el propietario.
- No descargar logos parecidos de internet ni recrear el logo con iconos, CSS o caracteres.
