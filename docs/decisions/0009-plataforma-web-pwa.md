# ADR-0009 — Plataforma: aplicaciones web instalables (PWA) con React, Vite y TypeScript

**Estado:** Aceptada · **Fecha:** 2026-11-13 · Decisión expresa del propietario (precedencia 1 de `CLAUDE.md`)
**Reemplaza a:** ADR-0002 (división en apps Flutter), ADR-0004 (Riverpod + go_router) y la herramienta de ADR-0001 (*pub workspaces*). El principio de monorepo de ADR-0001 se mantiene.

## Contexto

`PROMPT_MAESTRO.md` (§ tecnologías) e `IDENTIDAD_VISUAL.md` (§5–6) proponían Flutter y Dart. El propietario decide que **no se use Flutter**: Tavelyo será un sistema web que se pueda instalar como **PWA**. Los documentos de origen no se editan (`CLAUDE.md` §10); esta ADR registra la desviación y cómo se traducen sus reglas.

El spike D-13 ya había mostrado dos problemas del cliente Dart: el SDK generado con `Int64` no compila con `firebase_data_connect` 0.4.1, y los errores de las suscripciones no llegan al listener. Ninguno de los dos aplica automáticamente al SDK web; hay que verificarlo (ver Consecuencias).

## Decisión

1. **Plataforma:** aplicaciones web instalables como PWA (manifiesto de aplicación web y *service worker*), sin apps nativas ni Flutter.
2. **Framework:** **React + Vite + TypeScript** (aplicación de una sola página, sin renderizado en servidor).
3. **División:** **dos PWA separadas**, que mantienen el razonamiento de ADR-0002:
   - `menu-web`: Tavelyo Menu para el cliente (entrada por QR). Ligera, sin código de operación.
   - `operations`: Staff, Kitchen, POS y Manager, con navegación por rol.
4. **Lenguaje único:** TypeScript en cliente y backend (ADR-0003). Los contratos compartidos viven en paquetes del monorepo.
5. **Bibliotecas concretas** (rutas, estado, PWA, pruebas, monorepo, alojamiento): se proponen en **ADR-0010** y requieren aprobación aparte.

## Traducción de reglas de los documentos de origen

| Regla de origen (Flutter) | Equivalente web |
|---|---|
| «No conectar Flutter directamente a PostgreSQL» | La PWA solo habla con SQL Connect o con el backend; nunca con PostgreSQL, la pasarela ni claves privadas |
| «SDK Dart generado» | SDK web generado por SQL Connect (`generate.javascriptSdk`), importado solo en la capa `data` |
| `packages/design_system` y tema Flutter | `packages/design-system`: tokens como propiedades CSS personalizadas y TypeScript, y componentes React |
| Unidades lógicas Flutter (tipografía, 48 × 48, 56 en cocina) | Píxeles CSS con `rem` para respetar el tamaño de texto del usuario; objetivos táctiles ≥ 48 × 48 px CSS (56 en cocina) |
| Puntos de quiebre 600 / 1024 unidades lógicas | *Media/container queries* a 600 px y 1024 px CSS |
| Empaquetar Plus Jakarta Sans | Archivos `woff2` servidos por la propia app y cacheados por el *service worker*; sin CDN de fuentes (D-12) |
| «Proteger una ruta Flutter no reemplaza la autorización» | Igual para rutas React: las guardas son UX; la autorización es del servidor (ADR-0008) |
| Persistencia sin conexión y borradores (PM) | Ver «PWA y modo sin conexión» |

## PWA y modo sin conexión

- El *service worker* cachea **solo la estructura de la app y los recursos estáticos** (JS, CSS, fuentes, iconos). **No** cachea respuestas de SQL Connect ni del backend.
- Sin conexión se puede mostrar la última lectura **con su hora y el estado de conexión**. **Nunca** se confirma un pedido como recibido ni un pago como exitoso estando sin conexión (PM). Las operaciones en cola, si se habilitan, llevan un ID de idempotencia estable y se validan en el servidor al reconectar.
- Las actualizaciones de la app se aplican de forma controlada: aviso de «nueva versión» y recarga en un momento seguro. Nunca en mitad de un cobro o de una comanda.
- **Seguridad web añadida:** cabeceras estrictas (CSP sin `unsafe-inline` para scripts, `frame-ancestors`, `Referrer-Policy`, HSTS), sin HTML sin sanear, y sesión de Firebase Auth con persistencia por pestaña en dispositivos compartidos de la sucursal.

## Consecuencias

- **ADR-0002, ADR-0004:** pasan a «Reemplazada por 0009». **ADR-0001:** la herramienta deja de aplicar; el monorepo se mantiene y su herramienta se propone en ADR-0010.
- **D-03 (plataformas) debe revisarse:** la PWA funciona en navegadores modernos de Android, escritorio e iOS/iPadOS, con diferencias de instalación, notificaciones y API de dispositivo entre ellos. Qué navegadores se soportan oficialmente es una decisión pendiente del propietario.
- **ADR-0005:** en el cliente, los importes son TypeScript (`bigint` o cadena decimal canónica en la frontera de datos, nunca `number` para cálculos). La representación de `Int64` en el SDK web está **pendiente de verificar** en el spike.
- **ADR-0007:** el tiempo real verificado con el SDK Dart debe **repetirse con el SDK web**, incluido si los errores de suscripción llegan al listener.
- **Spike D-13:** la parte Flutter (SDK Dart, app de prueba) queda **obsoleta**. Se mantienen sin cambios los resultados de servidor: autorización, revocación, atomicidad, FK compuestas y T10.
- Las pruebas de interfaz pasan a herramientas web (ADR-0010) y se añaden pruebas de PWA: instalación, funcionamiento sin conexión y actualización.
- Se pierde el acceso nativo que tendría una app: impresoras de cocina, lectores y cajón de dinero dependerán de las API web disponibles o de un puente aparte, que se decide en la fase que lo necesite.

## Verificación pendiente

- SDK web de SQL Connect: `Int64`, suscripciones y errores (repetir el spike).
- Comportamiento de instalación, *service worker* y notificaciones en los navegadores que fije D-03.
- Tamaño de carga de `menu-web` en Fase 2.

## Implementación (Fase 1, 2026-11-14)

- **Sesión por pestaña en equipos compartidos:** casilla «Equipo compartido» en el acceso, marcada por defecto (D-20). Marcada, `setPersistence(browserSessionPersistence)`: recargar conserva la sesión, pero otra pestaña o la app reabierta empiezan sin ella. Desmarcada, `browserLocalPersistence`. Cierre por inactividad a los 15 minutos con aviso (D-19).
- **Actualización controlada:** probada entre dos builds reales en los 5 navegadores de D-15 (`e2e/pwa-update.spec.ts`). Cada build lleva su versión en `<meta name="tavelyo-build">` desde `TAVELYO_BUILD_ID` (validada; «local» si falta).
