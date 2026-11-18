# ADR-0010 — Bibliotecas y herramientas del stack web

**Estado:** Aceptada · **Fecha:** 2026-11-13 · Aprobada por el propietario (D-16), con Prettier como formateador; queda pendiente lo indicado en «Pendiente de decisión»
**Depende de:** ADR-0009 (React + Vite + TypeScript, dos PWA).

## Contexto

ADR-0009 fija la plataforma. Falta elegir las piezas concretas que antes cubrían Riverpod, go_router, `flutter_test` y *pub workspaces*. Criterios: pocas dependencias, mantenidas, compatibles entre sí, y compatibles con el tiempo real de SQL Connect (ADR-0007).

Versiones y compatibilidad (*peer dependencies*) consultadas en npm el 2026-11-13. Node.js instalado: 24.19.0.

## Decisión

| Necesidad | Propuesta | Versión vigente | Motivo |
|---|---|---|---|
| Lenguaje | TypeScript en modo estricto, con `skipLibCheck: true` | **6.0.3** (instalada en Fase 1; ver nota de versiones) | Mismo lenguaje que el backend; tipos del SDK generado. `skipLibCheck` es necesario: el `.d.ts` generado (CLI 15.30.2) tiene `};` tras cada `enum`, que TypeScript 6 y 7 rechazan (spike D-13) |
| Empaquetador y servidor de desarrollo | Vite | 8.3.x | Decidido en ADR-0009 |
| Integración React | `@vitejs/plugin-react` | 6.3.x | Requiere Vite 8 |
| UI | React + React DOM | 19.3.x | Decidido en ADR-0009 |
| Rutas | React Router | 8.5.x | Rutas declarativas, guardas de UX y URL compartibles para el menú; requiere React ≥ 19.2.7 |
| Datos y estado | **SDK web generado de SQL Connect (núcleo) + *hooks* propios mínimos**; estado de UI con el estado y el contexto de React | — | Ver «Por qué no TanStack Query» |
| PWA | `vite-plugin-pwa` (Workbox) | 2.0.x | Manifiesto y *service worker* con caché solo de recursos estáticos; admite Vite 8 |
| Firebase | `firebase` (Auth, SQL Connect) | **12.x** (12.19.0 verificada en el spike); la última es 13.3.0 | El SDK generado por la CLI 15.30.2 declara `firebase` ^12.11.0 como *peer*. Subir a 13 cuando el generador lo admita |
| Pruebas unitarias y de componentes | Vitest + Testing Library (`@testing-library/react`) | **4.1.12** (instalada) / 16.3.x | Integradas con Vite |
| Pruebas de recorrido, PWA y accesibilidad | Playwright + `@axe-core/playwright` | 1.65.x / 4.14.x | Navegadores reales, modo sin conexión, auditoría automática de accesibilidad |
| Calidad | ESLint (+ `typescript-eslint`) y **Prettier** | 10.15.x / vigente al crear el monorepo | Análisis estático y formato; Prettier aprobado por el propietario el 2026-11-13 |
| Monorepo | **npm workspaces** | npm incluido con Node | Sin herramienta adicional; reemplaza a *pub workspaces* |
| Alojamiento | **Firebase Hosting** con dos sitios (`menu-web`, `operations`) | — | Mismo proveedor; cabeceras de seguridad por sitio. **Servicio nuevo**: requiere aprobación |

### Por qué no TanStack Query

La integración React que genera SQL Connect usa `@tanstack-query-firebase/react` 2.1.1 (admite `firebase` ^11 o ^12, compatible con la 12.x propuesta). El motivo para no usarla es otro: la documentación de SQL Connect recomienda **no** combinarla con su tiempo real nativo, que es el mecanismo previsto para cocina (ADR-0007) y el que se verificó en el spike, incluida la entrega de errores en `onErr`. Además, ahorra una dependencia. Por eso se propone el SDK núcleo con *hooks* propios: `useQuery` sobre `execute()` y `useSubscription` sobre `subscribe()` con `useSyncExternalStore`, de unas decenas de líneas, en `packages/data-access`.

## Estructura del repositorio

```text
apps/menu-web/            # PWA del cliente
apps/operations/          # PWA del personal
packages/core/            # Money, Result, fechas UTC (TypeScript puro)
packages/contracts/       # Tipos compartidos con el backend
packages/design-system/   # Tokens (CSS + TS), componentes y catálogo visual
packages/pwa-shell/       # Configuración común de Vite/PWA y marco de las dos apps (Fase 1)
packages/data-access/     # SDK generado de SQL Connect y hooks propios
packages/features/*       # Un paquete por módulo, con sus capas
dataconnect/  backend/  docs/
```

Los límites entre módulos se aplican con las dependencias declaradas en cada `package.json` y con una regla de ESLint que prohíbe importar internos de otro paquete.

## Consecuencias

- Se elimina Riverpod como contenedor de inyección de dependencias: la composición se hace en el arranque de cada app y se pasa por contexto de React.
- El dominio (`packages/core` y la capa `domain` de cada módulo) es TypeScript puro, sin React, Firebase ni SDK de pagos.
- CI: `tsc --noEmit`, ESLint, formateador, Vitest y Playwright en cada cambio; además, compilación de las dos PWA y auditoría de la PWA.

## Pendiente de decisión

- Validación de formularios y entradas en el cliente (p. ej. un validador de esquemas): se decide en Fase 1 si hace falta.
- Biblioteca de internacionalización: no hace falta mientras solo haya español (SUP-01).

## Nota de versiones (Fase 1, 2026-11-13)

Al crear el monorepo se fijaron versiones exactas con al menos dos semanas de publicadas: TypeScript 6.0.3, ESLint 10.13.0, `@eslint/js` 10.0.1, `typescript-eslint` 8.72.1, Prettier 3.9.10 y Vitest 4.1.12. TypeScript baja de 7.0 a **6.0.3** porque `typescript-eslint` 8.72.1 solo admite TypeScript < 6.1. Vitest 5 se descarta por ser más reciente que dos semanas.

`npm audit` informa 8 avisos **moderados** de `minimatch` (posible denegación de servicio con patrones *glob*) dentro de ESLint y `typescript-eslint`. Solo afectan a herramientas de desarrollo y los patrones los define el proyecto. Se acepta temporalmente; se revisa al actualizar ESLint (≥ 10.15.0) cuando cumpla dos semanas.

### Complementos de prueba y tipos (Fase 1, 2026-11-13)

Para ejecutar las pruebas de componentes aprobadas (Vitest + Testing Library) hacen falta piezas que la tabla no nombraba. Se instalan como dependencias de desarrollo, sin llegar al navegador: `jsdom` 30.1.3 (entorno DOM de Vitest; MIT), `@testing-library/dom` 10.4.2 (*peer* obligatorio de `@testing-library/react`; MIT), `@types/react` y `@types/react-dom` 19.3.0 y `@types/node` 24.19.2 (solo tipos; MIT). React y React DOM: **19.3.1**. Con `jsdom` 30 el mínimo de Node.js pasa a 22.22.2 (o 24.15.0).

### Versiones de las apps (Fase 1, 2026-11-13)

Instaladas con al menos dos semanas de publicadas: Vite **8.3.5**, `@vitejs/plugin-react` **6.1.2** (la 6.3.0 es del 2026-11-09, demasiado reciente), React Router **8.5.1**, `vite-plugin-pwa` **2.0.0**. Licencias MIT. `firebase` 12.19.0 se instala con el bloque de autenticación.

Con `vite-plugin-pwa`, `npm audit` sube a **13 avisos (2 bajos, 11 moderados)**. Los nuevos vienen de `workbox-build` (`glob`, `@rollup/plugin-node-resolve` → `deepmerge`), que solo se ejecuta al compilar para generar el *service worker*; no llega al navegador y procesa únicamente archivos del propio proyecto. Se acepta temporalmente con el mismo criterio que los de ESLint; no se usa `npm audit fix --force` porque cambiaría versiones mayores.

Playwright: `@playwright/test` **1.64.1** y `@axe-core/playwright` **4.14.0** (la 1.65.1 es del 2026-11-13). Se fija también `playwright-core` 1.64.1 como dependencia de desarrollo para que `@axe-core/playwright` use la misma versión que `@playwright/test` (sin ello npm instalaba 1.65.1 y los tipos no coincidían).

### Avisos de `npm audit` resueltos (2026-11-13)

A petición del propietario se eliminan los 13 avisos. `npm audit fix --force` no sirve: bajaría `vite-plugin-pwa` a 1.1.0 y `typescript-eslint` a 8.36.0. En su lugar, `overrides` en el `package.json` raíz:

| Paquete | Aviso | Solución |
|---|---|---|
| `minimatch` 10.2.6 (ESLint, `typescript-eslint`, `glob`) | GHSA-g3hv-75wg-m249 (< 11.0.1) | Forzado a **11.0.3** (2026-10-28) solo para versiones afectadas; `minimatch` 5.x de `filelist` no está afectado y no se toca |
| `glob` 11.1.0 (`workbox-build`) | GHSA-3g3m-2fjr-6pw4 (≤ 14.0.1) | Forzado a **14.0.3** (2026-10-28). `workbox-build` solo usa `globSync`, que existe igual en la 14 |
| `deepmerge` 4.3.1 (`@rollup/plugin-node-resolve`, dentro de `workbox-build`) | GHSA-gcqx-w48m-w2h4 (≤ 4.3.1, **sin versión corregida**; sin publicaciones desde 2023) | Sustituido por `tools/deepmerge-safe`: misma API y lógica que el original (MIT, licencia incluida), sin copiar `__proto__`, `constructor` ni `prototype` y definiendo propiedades con `defineProperty`. Probado (5 pruebas, incluida la contaminación de prototipo). Solo se usa al compilar el *service worker* |

Resultado: `npm audit` → **0 vulnerabilidades**. Verificado con `npm run check` (174 pruebas), compilación de las dos PWA (mismas 22 entradas precacheadas que antes) y Playwright en los 5 navegadores (71 superadas, 4 omitidas, igual que antes). Revisar los `overrides` al actualizar ESLint, `typescript-eslint` o `vite-plugin-pwa`: cuando sus dependencias incluyan versiones corregidas, se eliminan.

### Firebase y SDK generado (Fase 1, 2026-11-13)

- `firebase` **12.19.0** (Apache-2.0). El SDK web del conector se genera en `packages/data-access/dataconnect-generated` (`@tavelyo/dataconnect-sdk`) y se guarda en el repositorio para compilar sin la CLI; se regenera con `npx firebase-tools@15.30.2 dataconnect:sdk:generate --project demo-tavelyo`.
- `firebase` incluye Firestore, que arrastra `@grpc/grpc-js` 1.9.16 con 4 avisos **altos** (GHSA-m9gg-hp2v-232j y GHSA-f596-whhp-79r4, de lado servidor gRPC; en el navegador Firebase no usa gRPC). Se fuerza **1.13.7** (2026-10-08) con `overrides`. Por un fallo de npm 11.17, la sustitución no se aplica a dependencias que solo declara un *workspace*: `firebase` 12.19.0 se declara también en el `package.json` raíz. Resultado: `npm audit` 0.
- `qrcode-generator` **2.0.4** (MIT, sin dependencias, con tipos), aprobado por el propietario con el plan de la Fase 2 (2026-11-14). Solo lo usa `packages/features/floor` para el QR de cada mesa: se toma la matriz de módulos (`isDark`) y el SVG se dibuja en React, sin insertar HTML generado.
- npm bloquea por defecto los scripts de instalación de `protobufjs` (aviso de versiones) y `@firebase/util` (lee `FIREBASE_WEBAPP_CONFIG`, que no usamos). No se aprueban: no son necesarios.

### Regla de `npm audit` en la CI (2026-11-17)

Aprobada por el propietario el 2026-11-17, tras la ejecución #44 de la CI. El aviso **GHSA-fc5q-39xc-vjpf** (alto) afecta a `picomatch` ≤ 4.0.7 (denegación de servicio con patrones *glob* hechos a propósito), que usan Vite, Vitest y `vite-plugin-pwa` al compilar y probar. **No hay versión corregida**: la 4.0.7 es la última, y `npm audit fix --force` bajaría Vite de la 8 a la 6. Los patrones los define el proyecto y el paquete no llega al navegador.

Regla nueva del paso «Auditoría de dependencias»:

- `npm audit --omit=dev`: cualquier aviso en dependencias de producción bloquea la CI;
- `npm audit --audit-level=critical`: en el resto (herramientas de desarrollo), solo bloquean los críticos. Los demás siguen apareciendo en el informe del paso.

Un aviso de desarrollo que no bloquea se registra aquí y se corrige en cuanto exista versión corregida (con `overrides` si hace falta, como en 2026-11-13). Pendiente: quitar la excepción de `picomatch` cuando se publique la corrección.

### Iconos: Lucide (Fase 3B, 2026-11-17)

Aprobado por el propietario con el plan de la Fase 3B (D-27). `lucide-react` **1.66.0** (2026-10-31, más de dos semanas), licencia **ISC**, sin dependencias, compatible con React 19 (`peerDependencies` `^16.5.1 || ^17 || ^18 || ^19`). Se instala solo en `@tavelyo/design-system`.

- Verificado en el paquete instalado: cada icono es un componente que acepta `size`, `strokeWidth`, `className` y atributos SVG, y sin `aria-label` ni `title` sale con `aria-hidden`.
- Los módulos no importan la biblioteca: usan `Icon` del sistema de diseño con un catálogo cerrado de nombres (`components/Icon.tsx`). Solo los iconos de ese catálogo llegan al navegador.
- `npm audit --omit=dev`: 0 vulnerabilidades tras instalarlo.

## Verificación pendiente

- Repetir la compatibilidad exacta de versiones al crear el monorepo en Fase 1 y fijar versiones con al menos dos semanas de publicadas.
- Licencias de cada paquete.
