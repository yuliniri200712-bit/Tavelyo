# ADR-0010 — Bibliotecas y herramientas del stack web

**Estado:** Propuesta (requiere aprobación del propietario: son paquetes y servicios nuevos, `CLAUDE.md` §4) · **Fecha:** 2026-11-13
**Depende de:** ADR-0009 (React + Vite + TypeScript, dos PWA).

## Contexto

ADR-0009 fija la plataforma. Falta elegir las piezas concretas que antes cubrían Riverpod, go_router, `flutter_test` y *pub workspaces*. Criterios: pocas dependencias, mantenidas, compatibles entre sí, y compatibles con el tiempo real de SQL Connect (ADR-0007).

Versiones y compatibilidad (*peer dependencies*) consultadas en npm el 2026-11-13. Node.js instalado: 24.19.0.

## Propuesta

| Necesidad | Propuesta | Versión vigente | Motivo |
|---|---|---|---|
| Lenguaje | TypeScript en modo estricto | 7.0.x | Mismo lenguaje que el backend; tipos del SDK generado |
| Empaquetador y servidor de desarrollo | Vite | 8.3.x | Decidido en ADR-0009 |
| Integración React | `@vitejs/plugin-react` | 6.3.x | Requiere Vite 8 |
| UI | React + React DOM | 19.3.x | Decidido en ADR-0009 |
| Rutas | React Router | 8.5.x | Rutas declarativas, guardas de UX y URL compartibles para el menú; requiere React ≥ 19.2.7 |
| Datos y estado | **SDK web generado de SQL Connect (núcleo) + *hooks* propios mínimos**; estado de UI con el estado y el contexto de React | — | Ver «Por qué no TanStack Query» |
| PWA | `vite-plugin-pwa` (Workbox) | 2.0.x | Manifiesto y *service worker* con caché solo de recursos estáticos; admite Vite 8 |
| Firebase | `firebase` (Auth, SQL Connect) | 13.3.x | SDK oficial |
| Pruebas unitarias y de componentes | Vitest + Testing Library (`@testing-library/react`) | 5.1.x / 16.3.x | Integradas con Vite |
| Pruebas de recorrido, PWA y accesibilidad | Playwright + `@axe-core/playwright` | 1.65.x / 4.14.x | Navegadores reales, modo sin conexión, auditoría automática de accesibilidad |
| Calidad | ESLint (+ `typescript-eslint`) y un formateador | 10.15.x | Equivalente a `dart analyze` y `dart format`; formateador por confirmar |
| Monorepo | **npm workspaces** | npm incluido con Node | Sin herramienta adicional; reemplaza a *pub workspaces* |
| Alojamiento | **Firebase Hosting** con dos sitios (`menu-web`, `operations`) | — | Mismo proveedor; cabeceras de seguridad por sitio. **Servicio nuevo**: requiere aprobación |

### Por qué no TanStack Query

La integración React que genera SQL Connect usa `@tanstack-query-firebase/react` 2.1.1, que solo admite `firebase` ^11 o ^12, mientras que la versión vigente es la 13.3.0. Además, la documentación de SQL Connect recomienda **no** combinar esa integración con su tiempo real nativo, que es el mecanismo previsto para cocina (ADR-0007). Por eso se propone el SDK núcleo con *hooks* propios: `useQuery` sobre `execute()` y `useSubscription` sobre `subscribe()` con `useSyncExternalStore`, de unas decenas de líneas, en `packages/data-access`.

## Estructura del repositorio propuesta

```text
apps/menu-web/            # PWA del cliente
apps/operations/          # PWA del personal
packages/core/            # Money, Result, fechas UTC (TypeScript puro)
packages/contracts/       # Tipos compartidos con el backend
packages/design-system/   # Tokens (CSS + TS), componentes y catálogo visual
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

- Aprobación de esta lista (o cambios).
- Formateador (Prettier u otro).
- Validación de formularios y entradas en el cliente (p. ej. un validador de esquemas): se decide en Fase 1 si hace falta.
- Biblioteca de internacionalización: no hace falta mientras solo haya español (SUP-01).

## Verificación pendiente

- Repetir la compatibilidad exacta de versiones al crear el monorepo en Fase 1. TypeScript 7.0.2 se publicó el mismo día de esta consulta: preferir el último parche con al menos dos semanas.
- Licencias de cada paquete.
