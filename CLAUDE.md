# CLAUDE.md — Instrucciones permanentes del proyecto Tavelyo

Este archivo define las reglas obligatorias para cualquier trabajo realizado en este repositorio.
Se aplica en todas las sesiones y tiene prioridad sobre las preferencias por defecto del asistente.
Ante cualquier ambigüedad o conflicto entre reglas, **detenerse y consultar al responsable del proyecto antes de actuar**.

### Fuentes y precedencia

1. Instrucciones expresas del responsable del proyecto.
2. Este `CLAUDE.md`.
3. `docs/PROMPT_MAESTRO.md`: comportamiento, arquitectura, seguridad, pagos, fases y pruebas.
4. `docs/IDENTIDAD_VISUAL.md`: marca, experiencia y sistema de diseño.

La seguridad, la integridad financiera y la accesibilidad prevalecen sobre la decoración. Las imágenes de referencia orientan, pero no prevalecen sobre las reglas escritas (ver `docs/brand/reference-review.md`).

---

## 1. Inicio de sesión y continuidad

Antes de crear o modificar cualquier archivo, en cada sesión:

1. Leer este `CLAUDE.md` completo.
2. Revisar `docs/progress.md` y la documentación relacionada con la tarea (ver sección 10).
3. Revisar el estado del repositorio: rama actual, cambios sin confirmar (`git status`) y commits recientes (`git log`).
4. Identificar cuál es la fase autorizada en curso y su estado.
5. Si algo no coincide (documentación desactualizada, cambios inesperados, fase no clara), informarlo antes de continuar.

---

## 2. Desarrollo por fases

- Implementar **únicamente la fase autorizada** de forma explícita por el responsable del proyecto.
- **No avanzar a otra fase sin aprobación expresa.** Terminar una fase no autoriza a comenzar la siguiente.
- Al cerrar una fase, presentar un resumen de lo realizado, los resultados de las pruebas y lo pendiente, y esperar aprobación.
- Si durante una fase surge trabajo que pertenece a otra, registrarlo en la documentación de progreso como pendiente, sin implementarlo.

---

## 3. Arquitectura

- **Clean Architecture** con separación estricta de capas (cuando aporten claridad en el módulo):
  - **Presentación**: componentes React, páginas y estado de interfaz. Sin lógica de negocio ni acceso directo a datos.
  - **Aplicación**: casos de uso que orquestan el dominio y los contratos de repositorio.
  - **Dominio**: entidades, objetos de valor, reglas e interfaces de repositorio. TypeScript puro, sin dependencias de React, Firebase ni pasarelas de pago.
  - **Datos**: implementaciones de repositorios, fuentes de datos (SQL Connect, Auth, backend, FCM) y modelos/mapeadores.
- No ejecutar lógica de cobro ni cálculos financieros autoritativos en el cliente: el servidor es la autoridad.
- **Regla de dependencia**: las dependencias apuntan siempre hacia el dominio. El dominio no conoce a las capas externas.
- Organización **modular por funcionalidad** (feature), con cada módulo conteniendo sus propias capas.
- Aplicar los principios **SOLID** y la inyección de dependencias para desacoplar componentes y facilitar las pruebas.
- Cada clase, función y archivo debe tener una única responsabilidad clara.
- **Prohibido el código espagueti**: nada de lógica de negocio en componentes de interfaz, acoplamiento directo entre módulos, funciones extensas con múltiples responsabilidades ni dependencias circulares.

---

## 4. Tecnologías

| Área | Tecnología |
|---|---|
| Aplicación | Web instalable como **PWA**: React + Vite + TypeScript, en dos aplicaciones, `menu-web` y `operations` (ADR-0009). **No se usa Flutter** |
| Autenticación | Firebase Authentication |
| Capa de datos | Firebase Data Connect, denominado actualmente **SQL Connect** (la CLI conserva los comandos `firebase dataconnect:*`) |
| Base de datos | Cloud SQL para PostgreSQL (fuente de verdad de pedidos, cuentas, inventario y pagos) |
| Lógica de servidor | Cloud Functions (Cloud Run como alternativa, según `docs/decisions/`) |
| Notificaciones | Firebase Cloud Messaging (apoyo, nunca registro autoritativo) |

- Componentes previstos en `docs/PROMPT_MAESTRO.md` pero pendientes de decisión (Cloud Run, Storage, App Check, pasarela) y bibliotecas web (ADR-0010): se adoptan solo mediante una decisión de arquitectura aprobada en `docs/decisions/`.
- Las referencias a Flutter y Dart de los documentos de origen se interpretan según la tabla de equivalencias de ADR-0009.
- No introducir otras tecnologías, servicios ni paquetes sin aprobación previa.
- No conectar la aplicación web directamente a PostgreSQL ni distribuir credenciales de base de datos, claves de pasarela o secretos en el código que llega al navegador.
- El *service worker* de la PWA solo cachea recursos estáticos; nunca respuestas de datos. Sin conexión no se confirma ningún pedido ni pago (ADR-0009).
- **Verificar las APIs y dependencias antes de usarlas**: confirmar en la documentación oficial que el paquete existe, que la versión es compatible y que la API se usa correctamente. No suponer firmas ni comportamientos.

---

## 5. Identidad visual

La marca es **Tavelyo**. La paleta oficial es:

| Color | Hex | Uso |
|---|---|---|
| Rojo tomate | `#E54835` | Identidad, selección y acentos principales |
| Naranja paprika | `#EE8A34` | Acentos gastronómicos y detalles secundarios |
| Crema cálido | `#FFF5E9` | Fondo principal claro |
| Café espresso | `#35241F` | Texto, títulos y superficies oscuras |
| Durazno suave | `#FCE6D8` | Contenedores secundarios y agrupaciones |

- La paleta oficial no se modifica. Los colores funcionales de interfaz (por ejemplo, `action.primary = #BA3526` para botones con texto blanco, porque blanco sobre `#E54835` no alcanza 4,5:1) y los colores semánticos se definen en `docs/IDENTIDAD_VISUAL.md` y se verifican en `docs/brand/contrast-matrix.md`.
- Objetivo de accesibilidad: WCAG 2.2 AA. Ningún par de colores se aprueba sin medir su contraste.
- Tipografía de interfaz: Plus Jakarta Sans, servida por la propia aplicación (sin CDN de fuentes) y con licencia registrada.
- Definir colores, tipografía, espacios y radios **una sola vez** en el sistema de diseño (`packages/design-system`, como propiedades CSS personalizadas y tokens TypeScript) y consumirlos siempre desde ahí. No escribir valores hexadecimales ni tamaños sueltos en los componentes ni en sus estilos.
- Logotipo: no usar sombrero de chef ni recrear el logo con iconos, CSS o caracteres. Mientras no exista el archivo maestro registrado en `docs/brand/asset-manifest.md`, usar solo la etiqueta textual neutra «Tavelyo» como marcador de desarrollo.

---

## 6. Buenas prácticas

- **No generar funcionalidades no solicitadas.** Implementar exactamente el alcance acordado.
- **No modificar código estable sin justificación.** Todo cambio a código existente debe ser necesario para la tarea en curso y explicarse.
- **Evitar duplicaciones**: reutilizar componentes, utilidades y lógica existentes antes de crear nuevas.
- Código legible, con nombres descriptivos, manejo explícito de errores y sin código muerto ni comentado.
- Respetar el análisis estático y el formato: TypeScript en modo estricto (`tsc --noEmit`) más el linter y el formateador que fije ADR-0010.

---

## 7. Seguridad

- **Pagos**: procesar los pagos exclusivamente mediante un proveedor certificado y tokenización. **Nunca almacenar datos sensibles de tarjetas** (número completo, CVV, fecha de vencimiento) en la aplicación, la base de datos, los registros ni las Cloud Functions.
- **Datos personales**: recopilar solo los datos necesarios, protegerlos en tránsito y en reposo, y no exponerlos en registros, mensajes de error ni notificaciones.
- **Aislamiento por restaurante y sucursal**: cada restaurante y sucursal solo puede acceder a su propia información. La autorización se valida **en el servidor** (reglas de autorización de Data Connect y validaciones en Cloud Functions), nunca solo en el cliente.
- Aplicar el principio de mínimo privilegio en roles, consultas y permisos.
- No incluir secretos, claves ni credenciales en el código ni en el repositorio.
- Validar y sanear todas las entradas, tanto en el cliente como en el servidor.

---

## 8. Pruebas

Aplicar, según corresponda a cada cambio:

- **Unitarias**: casos de uso, entidades, repositorios y lógica de presentación.
- **De integración**: interacción entre capas y con los servicios de Firebase.
- **De interfaz (componentes / UI)**: pantallas y flujos de usuario, incluidos instalación, funcionamiento sin conexión y actualización de la PWA.
- **De seguridad**: autorización, aislamiento entre restaurantes y sucursales, y manejo de datos sensibles.
- **De regresión**: confirmar que la funcionalidad existente sigue operando tras cada cambio.

**No declarar una fase ni una tarea como terminada sin ejecutar las pruebas pertinentes y verificar sus resultados.** Si una prueba falla o no se pudo ejecutar, informarlo con claridad.

---

## 9. Control de versiones (Git)

- Trabajar en **ramas** por fase o funcionalidad (por ejemplo, `fase-0-arquitectura`). No trabajar directamente sobre `main`.
- **Commits descriptivos**, pequeños y coherentes, que expliquen qué cambia y por qué.
- **Revisar los cambios** (diff y resultados de pruebas) antes de integrarlos. La integración en `main` requiere la aprobación del responsable del proyecto.
- No ejecutar operaciones destructivas (por ejemplo, `push --force`, `reset --hard` o eliminación de ramas) sin autorización expresa.

---

## 10. Documentación

Mantener actualizada la documentación del proyecto en `docs/`:

| Aspecto | Ubicación |
|---|---|
| Encargo y reglas de origen | `docs/PROMPT_MAESTRO.md`, `docs/IDENTIDAD_VISUAL.md` (no editar; registrar cambios como decisiones) |
| Requisitos, supuestos y decisiones abiertas | `docs/requirements.md` |
| Arquitectura | `docs/architecture/` (visión general, modelo de datos, permisos, amenazas, estados y flujos) |
| Decisiones de arquitectura (ADR) | `docs/decisions/` |
| Marca y accesibilidad visual | `docs/brand/` |
| Pruebas | `docs/testing/` |
| Planes de fase | `docs/plans/` |
| Progreso | `docs/progress.md` |

La documentación debe actualizarse junto con los cambios que la afectan, dentro de la misma fase. Distinguir siempre lo implementado, lo propuesto, los supuestos y lo pendiente.
