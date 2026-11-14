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

## Verificación pendiente

- Repetir la compatibilidad exacta de versiones al crear el monorepo en Fase 1 y fijar versiones con al menos dos semanas de publicadas.
- Licencias de cada paquete.
