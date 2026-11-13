# Manifiesto de recursos de marca

Estado: **Fase 0**. Registro de cada recurso de marca: archivo, versión, origen, licencia y uso permitido (IV §3, §12).
A la fecha **no hay ningún recurso maestro aprobado en el repositorio**. `assets/branding/` no existe todavía.

## Recursos recibidos (solo como referencia)

| Recurso | Formato | Origen | Estado | Observaciones |
|---|---|---|---|---|
| Composición del logotipo (isotipo T, `tavelyo.`, eslogan, variante horizontal e iconos de app sobre tomate, paprika y durazno) | Imagen raster (WebP) adjunta en la conversación del 2026-11-13 | Propietario | **Referencia, no maestro** | Coincide con el concepto aprobado (IV §3). No es vectorial; no se copió al repositorio. Necesita el archivo original para registrarse como maestro |
| Cinco composiciones de interfaz (Cliente, Personal, Cocina, Caja, Administración) | Imágenes raster (WebP) | Propietario | **Referencia visual** | Analizadas en `reference-review.md`. Usan un logotipo distinto (gorro de chef), por lo que no son fuente de marca |

## Recursos pendientes

| Recurso | Ruta prevista | Estado |
|---|---|---|
| Maestro del logotipo | `assets/branding/tavelyo-logo-master.svg` | ⏳ **Encargado a Claude** (2026-11-13). Propuestas vectoriales en `assets/branding/proposals/`; se registra como maestro solo la aprobada (D-12) |
| Horizontal fondo claro | `assets/branding/tavelyo-logo-horizontal-light.svg` | ⏳ Derivar del maestro |
| Horizontal fondo oscuro | `assets/branding/tavelyo-logo-horizontal-dark.svg` | ⏳ Derivar del maestro |
| Isotipo | `assets/branding/tavelyo-isotype.svg` | ⏳ Derivar del maestro |
| Monocromático | `assets/branding/tavelyo-monochrome.svg` | ⏳ Derivar del maestro |
| Vertical | — | ⏳ Derivar del maestro |
| Iconos de las PWA (manifiesto 192 y 512 px, variante *maskable* y `apple-touch-icon`) | — | ⏳ Derivar del isotipo con áreas seguras (ADR-0009) |
| Icono de notificación | — | ⏳ Variante simplificada aprobada |
| Favicon y splash | — | ⏳ Recursos específicos, no capturas |
| Fuente Plus Jakarta Sans | `packages/design-system/` (Fase 1) | ✅ **Confirmada** por el propietario (2026-11-13). Origen: repositorio oficial `tokotype/PlusJakartaSans`, versión 2.7.1. Licencia: SIL Open Font License 1.1 (se copia `OFL.txt` junto a los archivos). Se sirve desde la propia app, sin CDN |

## Reglas

- Mientras falte el maestro, la interfaz usa solo la etiqueta textual neutra «Tavelyo» como marcador de desarrollo.
- Si solo existe un raster, se documentan sus límites y se prepara una propuesta de vectorización para revisión del propietario; no se presenta como oficial hasta su aprobación.
- No descargar logos parecidos de internet ni recrear el logo con iconos, CSS o caracteres.
