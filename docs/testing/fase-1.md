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

## 2026-11-13 — `packages/design-system`

| Comprobación | Comando | Resultado |
|---|---|---|
| Conjunto completo | `npm run check` (Prettier, ESLint, `tsc` de cada paquete, Vitest) | ✅ 6 archivos, **149 pruebas** (70 de `core` y 79 de `design-system`) |

Cobertura de `design-system`:

- Contraste: 38 pares realmente usados por los componentes, cada uno con su mínimo AA (4,5:1 texto; 3:1 bordes, foco y señales). La paleta oficial no cambia; el botón primario no usa el tomate de la marca como fondo de texto.
- `tokens.css` sincronizado con `tokens.ts`; tamaños tipográficos y táctiles en `rem` (respetan el zoom y el texto al 200 %).
- Sin valores sueltos: ningún HEX ni `px` en los componentes ni en sus estilos (criterio 5).
- Componentes con Testing Library en jsdom: nombres accesibles, variantes del botón, carga sin doble envío y con foco conservado, campo con etiqueta persistente, ayuda y error enlazados (`aria-describedby`, `aria-invalid`), chips con texto, tarjeta como región con nombre, diálogo (confirmar, cancelar, Escape bloqueado durante la operación, foco inicial en «Cancelar» si es destructivo), aviso sin conexión, aviso de nueva versión que no se aplica sin aceptación, estados de carga (`status`), error (`alert`) y vacío.

## 2026-11-13 — Apps y `packages/pwa-shell`

| Comprobación | Comando | Resultado |
|---|---|---|
| Conjunto completo | `npm run check` | ✅ 10 archivos, **163 pruebas** |
| Compilación | `npm run build -w @tavelyo/menu-web` y `-w @tavelyo/operations` (`tsc` + `vite build`) | ✅ Ambas; *service worker* `generateSW` con 22 entradas precacheadas |
| *Service worker* generado | Inspección de `dist/sw.js` | ✅ Solo `NavigationRoute` hacia `/index.html` con `/__/` excluido; ninguna estrategia de caché en tiempo de ejecución |
| Manifiesto generado | Inspección de `dist/manifest.webmanifest` e `index.html` | ✅ Nombre, `standalone`, `lang: es`, iconos any y maskable 192/512, `theme-color` desde el token, enlace al manifiesto inyectado |

Pruebas nuevas: configuración del *service worker* (sin `runtimeCaching`, solo extensiones estáticas, rutas `/__/` excluidas, actualización con aviso), manifiesto (iconos declarados existen con el tamaño real leído del PNG), marco común (logotipo con texto alternativo, salto al contenido, aviso sin conexión, aviso de nueva versión) y rutas de ambas apps (catálogo y página no encontrada).

## 2026-11-13 — Navegadores (Playwright 1.64.1 + axe-core 4.14.0)

Comando: `npm run test:e2e` (compila las dos apps y las sirve con `vite preview`). Matriz D-15: Chrome 157.0.8103.78 y Edge 157.0.4341.46 instalados (canales `chrome` y `msedge`), WebKit 27.2 de Playwright como Safari de escritorio, Chrome en Android emulado (Pixel 7) y Safari en iPhone emulado (iPhone 15).

| Prueba (en cada app) | Resultado |
|---|---|
| Manifiesto instalable; los iconos declarados responden 200 como PNG | ✅ 5 navegadores |
| Sin conexión: tras activarse el *service worker*, la app arranca desde la caché y muestra «ningún pedido ni pago se confirma» | ✅ 5 navegadores |
| La caché del *service worker* solo contiene recursos del build (JS, CSS, HTML, imágenes, fuentes y manifiesto) | ✅ 5 navegadores |
| axe sin infracciones WCAG 2.0/2.1/2.2 A y AA (inicio de ambas apps y catálogo) | ✅ 5 navegadores |
| *Reflow*: sin desplazamiento horizontal a 320 px; catálogo con texto al 200 % a 640 px | ✅ 5 navegadores |
| Diálogo destructivo real: modal, foco inicial en «Cancelar», Tab no sale a la página de detrás, Escape lo cierra | ✅ 5 navegadores |
| Primer Tab al enlace «Saltar al contenido» y Enter enfoca el `main` | ✅ Chrome, Edge, Chrome Android · ⏭️ Safari (por defecto Safari no enfoca enlaces con Tab; se revisa en dispositivo real con la opción activada) |

Total: **71 superadas, 4 omitidas** (las de Safari indicadas), 0 fallidas. Una primera ejecución falló porque el filtro de la prueba trataba `manifest.webmanifest` (precacheado por `vite-plugin-pwa`) como dato; es un archivo estático del build y se corrigió el filtro, no el *service worker*.

Pendiente en navegador: actualización controlada entre dos versiones del build (el aviso y `registerType: 'prompt'` ya tienen prueba unitaria), instalación real en dispositivos Android e iOS y revisión con lector de pantalla (VoiceOver y TalkBack).

Limitaciones conocidas: jsdom no implementa `showModal()`; la prueba usa un sustituto que solo alterna `open`. El foco atrapado, el fondo inerte y la tecla Escape reales se verifican con Playwright en navegadores (bloque 9).

No ejecutado todavía: integración con emuladores, PWA, matriz de navegadores y auditoría axe (siguientes bloques de la fase).
