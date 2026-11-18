# Plan de Fase 3B — Diseño visual

Estado: **aprobado por el propietario el 2026-11-17**, con las decisiones D-27 y D-28 (sección 2) y la instalación de `lucide-react` 1.66.0. Rama de trabajo: `fase-3b-diseno-visual`, desde `main` tras cerrar la Fase 3.

## 1. Objetivo

Llevar las pantallas que ya existen al estilo de las referencias del propietario (`docs/brand/referencias/`, analizadas en `brand/reference-review.md`), **con la paleta oficial, el logotipo aprobado, Plus Jakarta Sans y WCAG 2.2 AA**.

Es una fase de presentación: **no cambia reglas de negocio, permisos, datos ni el backend**. Lo que se ve debe seguir mostrando solo estados reales y acciones permitidas.

**Condición para terminar:**
- el propietario aprueba las capturas de antes y después de cada pantalla;
- todos los recorridos existentes siguen pasando en los 5 navegadores de D-15;
- accesibilidad sin retrocesos: contraste medido, 320 px, texto al 200 %, teclado y lector de pantalla.

## 2. Decisiones

### Tomadas por el propietario (2026-11-17)

| ID | Pregunta | Decisión |
|---|---|---|
| D-27 | Iconos | **Lucide** con `lucide-react` **1.66.0** (2026-10-31, más de dos semanas; licencia ISC; sin dependencias; compatible con React 19). Solo los iconos importados llegan al navegador. Se instala al aprobar el plan |
| D-22 (se mantiene) | Fotos de los platos | **Todavía no.** Requieren Cloud Storage. Las tarjetas de producto se diseñan para recibir una foto más adelante, pero hoy no muestran ningún marcador vacío |
| D-28 | Letra serif en títulos | **No.** Solo Plus Jakarta Sans en toda la interfaz, como dice IV §5 |

### Reglas de esta fase

- **Los iconos acompañan, no sustituyen:** cada icono va con su texto visible o es decorativo (`aria-hidden`). Las acciones ambiguas llevan texto (IV §6). Los nombres accesibles actuales no cambian, para no romper lectores de pantalla ni recorridos.
- **Los módulos no importan Lucide directamente.** Usan un componente `Icon` del sistema de diseño con un catálogo cerrado de iconos. Así se mantiene un mismo tamaño y grosor, y cambiar de biblioteca solo toca un archivo.
- **El estado nunca depende solo del color:** cada estado de mesa, línea o pedido tiene texto e icono, además de su color.
- **Colores nuevos solo como tokens**, con su contraste medido en `brand/contrast-matrix.md` antes de usarlos.
- **No se reproducen las inconsistencias** de `reference-review.md` §3:
  - gorro de chef;
  - otra paleta o letra serif;
  - «Recoger» y «Entregar» activos a la vez;
  - «Devolver a Recibida»;
  - estados por orden completa;
  - textos de preautorización que prometen ajustes.

## 3. Qué se adopta de las referencias

| Pantalla | De las referencias | Notas |
|---|---|---|
| **Común** | Cabecera de marca con el logotipo; pestañas y filtros en píldora con contador; tarjetas con más jerarquía; iconos en botones, estados y secciones | La cabecera de `operations` en superficie oscura (espresso o un rojo funcional medido) y la de `menu-web` clara |
| **Carta** (`/mesa/<qr>`) | Portada con sucursal y «Mesa M1»; buscador; categorías en píldoras con icono; tarjetas de producto con precio destacado y botón «+»; botón fijo «Mi pedido (n)» | Sin fotos (D-22). El buscador filtra la carta ya cargada, sin llamar al servidor |
| **Revisar pedido** | Líneas en tarjetas, resumen de importes, aviso de preautorización destacado con icono | El texto de la preautorización no cambia |
| **Mis pedidos** | Línea de tiempo vertical por pedido (recibido → en preparación → listo → entregado), tarjeta del consumo, «Llamar al mesero» y «Pedir la cuenta» con icono | Estados por línea; el pedido muestra el derivado |
| **Salón** (`/salon`) | Cuadrícula de mesas por sector, con color, icono y texto del estado; filtro por sector; leyenda; solicitudes destacadas | Los estados son los reales: libre, abierta, con solicitud, con platos listos |
| **Listos para recoger** (`/entregas`) | Tarjetas con franja de color, mesa grande, espera «hace 4 min» y acciones grandes | Solo una acción a la vez según el estado: «Recogido» y después «Entregado» |
| **Cocina** (`/cocina`) | Tickets grandes con bloque de mesa en color, cronómetro grande y filtros por estado con contador | Posición estable al actualizar (IV §9); sin parpadeos; los alérgenos siguen siempre visibles |
| **Administración** (inicio, carta, estaciones, mesas, sucursales) y **acceso** | Tarjetas de módulo con icono, encabezados de sección con icono, pestañas en píldora | Sin datos nuevos |

## 4. Alcance por bloques

1. **Base del sistema de diseño:**
   - `lucide-react` 1.66.0 y el componente `Icon`;
   - tokens nuevos (estados de mesa, cabecera oscura, franjas) con contraste medido;
   - componentes nuevos en el catálogo (`/catalogo`): cabecera de app, pestañas y filtros con contador, tarjeta de mesa, línea de tiempo, ticket de cocina, tarjeta de producto, barra fija de acción y buscador.
2. **Cliente (`menu-web`):** carta, revisar pedido y «Mis pedidos».
3. **Personal (`operations`):** salón, «Listos para recoger» y cocina.
4. **Administración y acceso:** inicio, carta, estaciones, mesas, QR, sucursales y entrada.
5. **Cierre:**
   - capturas de antes y después de cada pantalla, con datos fijos, para que las apruebes;
   - recorridos completos en los 5 navegadores;
   - 320 px, texto al 200 %, teclado y TalkBack;
   - prueba en tu Android;
   - documentación y resumen para aprobación.

Al final de los bloques 2, 3 y 4 te envío capturas para que apruebes el aspecto antes de seguir.

**Fuera de alcance:**
- fotos de los platos (D-22) y «Recomendados de la casa», que necesita decidir qué platos se recomiendan y guardarlo en la carta;
- comanda del mesero, caja y POS (Fase 4);
- panel del gerente con ventas, gráficas e inventario (Fase 5);
- sector «Delivery», fotos del personal y campana de notificaciones;
- modo oscuro y letra serif (D-28).

## 5. Archivos y áreas afectadas

| Área | Contenido |
|---|---|
| `packages/design-system` | `Icon`, tokens nuevos, componentes nuevos y catálogo |
| `packages/features/*/presentation` | Solo presentación: componentes y estilos. La lógica de aplicación y dominio no cambia |
| `apps/menu-web`, `apps/operations` | Cabecera y disposición general |
| `e2e/` | Ajustes mínimos si cambia la estructura; capturas de referencia |
| `docs/` | Plan, decisiones D-27 y D-28, matriz de contraste, ADR-0010 (paquete nuevo), pruebas y progreso |

**Paquete nuevo:** `lucide-react` 1.66.0 (D-27). Ninguno más.

## 6. Pruebas

- **Unitarias de componentes:** cada componente nuevo, con sus estados (vacío, carga, error, foco, deshabilitado, sin conexión) y su nombre accesible; `Icon` decorativo sin nombre y con texto cuando es la única señal.
- **Contraste:** cada par de colores nuevo en `contrast-pairs.ts`, comprobado en las pruebas como ya se hace.
- **Sin valores sueltos:** la prueba `no-loose-values` sigue impidiendo colores y tamaños fuera de los tokens.
- **Regresión:** `npm run check`, integración y todos los recorridos con emuladores en los 5 navegadores, sin cambiar lo que comprueban.
- **Accesibilidad:** axe en cada recorrido, 320 px y texto al 200 %, teclado, y TalkBack en el Android real.
- **Visual:** capturas con datos fijos de cada pantalla, antes y después (IV §13.5), revisadas por el propietario. Las comparaciones automáticas de capturas no entran en esta fase: dependen del sistema operativo y del navegador.

## 7. Criterios de aceptación

1. El propietario aprueba el aspecto de cada pantalla con las capturas.
2. Paleta oficial, logotipo aprobado y Plus Jakarta Sans; sin valores sueltos fuera de los tokens.
3. Contraste AA medido para cada par nuevo; ningún estado depende solo del color o del icono.
4. Los recorridos de las fases 1 a 3 pasan en los 5 navegadores sin cambiar lo que comprueban, y axe no encuentra infracciones.
5. Reglas de negocio, permisos y datos sin cambios. CI en verde y documentación al día.

## 8. Aprobaciones que pide este plan

- ✅ El plan y su alcance (secciones 3 y 4), aprobados el 2026-11-17.
- ✅ La instalación de `lucide-react` 1.66.0 (D-27), aprobada el 2026-11-17.

## 9. Riesgos

- **Recorridos de prueba que buscan por estructura:** se buscan por rol y nombre accesible, que no cambian. Si un rediseño cambia un nombre, se corrige la pantalla, no la prueba.
- **Más densidad visual en cocina:** las referencias muestran tickets grandes; con varias líneas pueden no caber. Se prioriza leer de un vistazo y la posición estable sobre la decoración.
- **Color de la cabecera oscura:** el rojo oscuro de las referencias no es de la paleta. Se usa espresso o el rojo funcional `action.primary`, según la matriz de contraste.
- **Tamaño de la descarga:** Lucide es grande completo, pero solo llegan los iconos usados; se comprueba el tamaño del build antes y después.
