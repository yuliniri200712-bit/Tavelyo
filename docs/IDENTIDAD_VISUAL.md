# Tavelyo — Identidad visual, logotipo y UX/UI para Claude Code

Versión: 1.0 consolidada · Fecha: 13 de noviembre de 2026 · Idioma: español.

## 1. Encargo y relación con el desarrollo

Actúa como diseñador de producto e ingeniero Flutter responsable de aplicar una identidad gastronómica coherente a Tavelyo. Lee también `PROMPT_MAESTRO.md`: este anexo complementa sus requisitos y no sustituye arquitectura, permisos, estados, reglas de pago ni pruebas.

Trabaja solamente en la fase autorizada. En Fase 0 documenta el sistema visual, los recorridos y los recursos faltantes; no implementes pantallas de producción todavía. Respeta los componentes existentes cuando sean compatibles y corrige inconsistencias mediante reglas compartidas.

Esta guía recupera las normas escritas de la conversación «Requerimientos sistema restaurante». **Los archivos originales del logo y las cinco imágenes de interfaz no están incluidos en esta entrega.** No afirmar que se inspeccionaron ni que los valores nuevos reproducen exactamente esas imágenes. Las medidas propuestas aquí son una base de implementación sujeta a validación visual; el arte maestro debe aportarse para cerrar la marca.

## 2. Identidad gastronómica

- Nombre del producto en textos: **Tavelyo**.
- Nombre en el logotipo principal: **tavelyo.**, minúsculas y punto final.
- Eslogan: **El corazón de tu restaurante, conectado.**
- Categoría: plataforma SaaS de gestión gastronómica multiempresa y multisucursal.
- Personalidad: cálida, cercana, profesional, confiable, ágil, organizada y sencilla.
- Concepto: gastronomía conectada; mesas, personas, cocina y caja coordinadas.

Usar calidez en fondos, fotografía y tono. La operación debe ser clara y rápida. Evitar paneles genéricos fríos, saturación de naranja/rojo y decoración que compita con precios, alergias, tiempos o acciones. Los cinco módulos pertenecen al mismo producto, aunque la densidad de información cambie.

## 3. Logotipo: concepto y recurso maestro

El concepto aprobado por escrito contiene:

1. Isotipo estilizado en forma de **T**.
2. Superficie superior que recuerda una mesa o plato.
3. Soporte vertical que completa la T.
4. Curvas superiores que evocan conectividad.
5. Marca tipográfica en minúsculas y punto final rojo tomate.

No sustituirlo por sombrero de chef, cubiertos genéricos, emojis o un símbolo de wifi independiente. Las variaciones de las referencias no crean identidades nuevas. No dibujar una aproximación con CSS, caracteres o iconos y presentarla como logo oficial.

Cuando se reciba el arte maestro, conservarlo sin modificaciones y registrar archivo, versión, origen, licencia y variantes autorizadas. Si solo existe una imagen rasterizada, documentar límites y preparar una propuesta de vectorización para revisión. Mientras falte, utilizar una etiqueta textual neutra «Tavelyo» como marcador de desarrollo, sin presentarla como logotipo final; bloquear únicamente la aprobación definitiva de los recursos de marca.

### Variantes necesarias

| Recurso | Uso |
|---|---|
| Horizontal | Cabeceras, acceso, documentos y administración |
| Vertical | Composiciones con espacio suficiente |
| Isotipo | Navegación compacta y aplicaciones |
| Fondo claro | Símbolo tomate/paprika, palabra espresso y punto tomate |
| Fondo oscuro | Palabra blanca o crema, símbolo aprobado con contraste comprobado |
| Monocromático | Una tinta de alto contraste |
| Icono de aplicación | Isotipo adaptado a máscaras y áreas seguras de cada plataforma |
| Notificaciones | Variante compatible con requisitos técnicos de la plataforma |
| Favicon y splash | Recursos específicos, no capturas de una composición completa |

Derivar todas las variantes del mismo maestro. Guardar SVG cuando sea compatible y exportaciones PNG nítidas a las escalas necesarias. No generar recursos finales inexistentes ni descargar un logo parecido de internet.

### Protección y tamaños

Define X como la altura de las minúsculas de la marca tipográfica. Mantén como mínimo inicial **0,5X** libres alrededor del conjunto. Para el isotipo aislado, documenta en el maestro una unidad equivalente; no improvisar un margen distinto en cada pantalla.

Mínimos digitales iniciales: **24 px de altura del isotipo** y **120 px de ancho del logotipo horizontal**. Validarlos con el arte real. Si las curvas de conectividad se pierden, usar una variante simplificada expresamente aprobada. No comprimir el logo completo para un favicon de 16 px.

Mantener proporción, orientación y espaciado del maestro. Prohibido deformar, recolorear arbitrariamente, cambiar tipografía, añadir contornos, sombras fuertes, degradados no aprobados o fondos que destruyan contraste. No colocar texto, bordes o controles en el área de protección. El logo del restaurante puede convivir con Tavelyo según una jerarquía definida; no alterar la marca Tavelyo por empresa.

## 4. Paleta oficial y aplicación accesible

| Token de marca | Nombre | HEX | Uso |
|---|---|---|---|
| `brand.tomato` | Rojo tomate | `#E54835` | Identidad, selección y acentos principales |
| `brand.paprika` | Naranja paprika | `#EE8A34` | Acentos gastronómicos y detalles secundarios |
| `brand.cream` | Crema cálido | `#FFF5E9` | Fondo principal claro |
| `brand.espresso` | Café espresso | `#35241F` | Texto, títulos y superficies oscuras |
| `brand.peach` | Durazno suave | `#FCE6D8` | Contenedores secundarios y agrupaciones |
| `neutral.white` | Blanco | `#FFFFFF` | Tarjetas y superficies |

Predominan crema, blanco y texto espresso. Reservar los tonos intensos para jerarquía; no pintar todos los botones y tarjetas de rojo. Evitar grandes superficies contiguas de rojo y naranja y degradados generalizados.

### Contraste y colores funcionales

El color de marca no garantiza accesibilidad. Antes de aprobar un token, medir su contraste en el par real de texto/fondo y en todos sus estados. Objetivo: WCAG 2.2 AA, incluyendo contraste de texto normal de 4,5:1 y texto grande de 3:1 bajo la definición del estándar; componentes y señales visuales relevantes, 3:1 cuando aplique.

**No adoptar automáticamente texto blanco pequeño sobre `#E54835`**: ese par no alcanza 4,5:1. Para el botón primario puede utilizarse una variante funcional más oscura, propuesta inicial `action.primary = #BA3526`, con `action.onPrimary = #FFFFFF`, verificándola en la implementación. No cambiar el rojo del logo para solucionar el contraste de un botón. El naranja paprika funciona mejor como acento o superficie con texto espresso que como texto pequeño sobre crema.

Colores semánticos base heredados de las reglas de referencia:

| Token | HEX | Significado |
|---|---|---|
| `status.success` | `#15803D` | Operación confirmada |
| `status.warning` | `#B45309` | Atención o demora |
| `status.error` | `#B91C1C` | Error o acción destructiva |
| `status.info` | `#1D4ED8` | Información |

Estos colores no amplían la paleta del logotipo. Usar siempre texto y, cuando ayude, icono: «Listo», «Pago pendiente», «Sin conexión». El rojo de marca no significa automáticamente error. Validar pares de fondo/primer plano, bordes, foco, estados seleccionados y modo oscuro; no asumir que reutilizar un HEX funciona sobre cualquier superficie.

## 5. Tipografía, espacio y composición

Tipografía de interfaz: **Plus Jakarta Sans**, con fuentes y licencia registradas. Empaquetar archivos autorizados y definir una fuente de respaldo. Evitar depender de una descarga remota para que caja o cocina puedan leer la interfaz.

Escala inicial propuesta en unidades lógicas Flutter, respetando escalado del sistema:

| Token | Tamaño / interlineado | Peso | Uso |
|---|---|---|---|
| Display | 32 / 40 | 700 | Título destacado ocasional |
| H1 | 28 / 36 | 700 | Título de pantalla |
| H2 | 24 / 32 | 700 | Sección |
| H3 | 20 / 28 | 600 | Tarjeta o grupo |
| Body large | 18 / 28 | 400 | Lectura destacada |
| Body | 16 / 24 | 400 | Texto y formularios |
| Label | 14 / 20 | 600 | Etiquetas y controles |
| Caption | 12 / 16 | 400 | Información secundaria no crítica |

Precios, tiempos y totales deben seguir siendo legibles y usar cifras tabulares cuando la fuente lo permita. No usar texto de 12 px para advertencias financieras o notas críticas. Una serif editorial es opcional para contenidos promocionales tras revisión; no introducirla en comandas, formularios, caja o tablas.

Propuesta de espaciado: 4, 8, 12, 16, 24, 32 y 48. Radios: 8 para controles, 12 para tarjetas y 16 para contenedores destacados. Sombras discretas; bordes y separación deben distinguir superficies sin depender exclusivamente de sombras.

Adaptar la composición al espacio disponible, no al nombre del dispositivo. Como punto de partida: compacto menor de 600 unidades lógicas, medio de 600 a 1023, amplio desde 1024. Validar con contenido real, rotación, teclado y escalado de texto. No encoger una tabla completa hasta volverla ilegible: priorizar columnas, usar detalle o desplazamiento explícito.

## 6. Sistema de diseño Flutter

Centraliza en `packages/design_system` o equivalente:

- Tokens de marca, semánticos, superficies, texto, tipografía, espacios, radios, elevación, movimiento y tamaños táctiles.
- Tema claro; tema oscuro como variante revisada por separado si se incluye en la fase. No invertir colores automáticamente.
- Componentes compartidos: `TavelyoButton`, campo, selector, búsqueda, tarjeta de producto, tarjeta de mesa, chip de estado, ticket de cocina, resumen de cuenta, línea de importe, diálogo de confirmación, aviso de conexión y estados de carga/error/vacío.
- Catálogo visual con variantes, tamaños, estados y ejemplos de contenido realista.

Los nombres son orientativos; respeta las convenciones del repositorio. Ningún módulo debe duplicar colores o tamaños arbitrarios en sus pantallas. Los componentes muestran estados autorizados por el dominio; no redefinen reglas de negocio.

### Componentes y comportamiento

- Botón primario: una acción principal clara por zona de decisión; alto contraste y estados normal, foco, pulsado, carga y deshabilitado.
- Secundario: superficie clara con borde o texto suficientemente contrastante. No competir visualmente con confirmar.
- Destructivo: texto inequívoco, estilo semántico de error y confirmación contextual para acciones irreversibles. Indicar recurso, monto y efecto cuando corresponda.
- Campos: etiquetas persistentes, ayuda cuando se necesite, validación asociada y error comprensible. No usar placeholder como única etiqueta.
- Carga: conservar contexto y prevenir doble envío. Tras timeout, indicar que se está verificando el resultado; no invitar a pagar de nuevo sin conciliación.
- Vacío: explicar qué falta y ofrecer una acción disponible para ese rol. Diferenciar «sin pedidos» de «no se pudieron cargar».
- Iconos: una familia coherente, con grosor y tamaño consistentes; acciones ambiguas necesitan texto. No usar emojis como iconografía operativa.
- Movimiento: breve y funcional; respetar reducción de movimiento. No animar continuamente tiempos o alertas de cocina.
- Objetivos táctiles internos: mínimo propuesto de 48 × 48 unidades lógicas; en cocina favorecer 56 cuando haya espacio. Mantener separación para evitar errores.

## 7. Tavelyo Menu — Cliente

**Objetivo:** elegir y pedir con claridad, comprender el consumo y el estado financiero.

Pantalla de entrada: identificar restaurante, sucursal y mesa; mostrar marca con jerarquía coherente, búsqueda, categorías, recomendados y carrito accesible. Si el QR es inválido o la sesión terminó, explicar cómo volver a entrar sin exponer consumos anteriores.

Carta: fotografía real y autorizada del producto, nombre, descripción breve, precio, disponibilidad y acción de añadir. No usar imágenes que prometan ingredientes o porciones diferentes. Mantener proporciones y recortes consistentes; cuando falte imagen, usar un marcador neutro, nunca una fotografía engañosa.

Detalle: modificadores obligatorios/opcionales, límites, cambios de precio y observaciones. Distinguir información declarada de alérgenos de una garantía de seguridad alimentaria. El carrito conserva cantidades y modificaciones; muestra subtotal, descuentos, impuestos, cargos, propina elegida y total, sin cargos ocultos.

Preautorización: explicar el importe reservado antes del consentimiento. Texto orientativo: «Se solicitará una reserva de {importe}. No es el cobro final. Al cerrar la cuenta se confirmará el importe a cobrar». Adaptar la frase a la política y capacidades reales; no prometer tiempos de liberación ni incrementos automáticos.

Seguimiento: recibido, en preparación, listo y entregado; incluir estados parciales cuando existan. Mostrar consumo autorizado, solicitar mesero y solicitar cuenta. Separar etiquetas «Reservado», «Cobrado» y «Saldo pendiente». No usar una pantalla de éxito de pago por una autorización.

Navegación breve, carrito persistente sin tapar contenido, botones accesibles con una mano. No saturar con promociones. Estados de fuera de horario, agotado, cambio de precio, error, red lenta y sesión vencida son parte del diseño.

## 8. Tavelyo Staff — Meseros

**Objetivo:** identificar qué mesa necesita atención y completar acciones con pocas pulsaciones.

Inicio por sectores: tarjetas de mesa con número, estado textual, comensales cuando se registren, solicitudes, pedidos listos y cuenta abierta. Diferenciar ocupación, estado del pedido y situación de cuenta; no resumir todo en un solo color ambiguo.

Comanda: mesa y sector siempre visibles, búsqueda rápida, categorías, cantidades, modificadores, notas y resumen antes de enviar. Tras confirmación, mostrar el resultado real y evitar reenvíos duplicados.

Entregas: priorizar mesa, pedido, tiempo listo, mesero asignado y acciones «Recoger» / «Entregar». Respetar la secuencia; una excepción requiere permiso y motivo. No permitir que un gesto accidental dé por entregados todos los platos.

Usar controles grandes, jerarquía operativa y formularios cortos. Tras cambiar de mesa, conservar un contexto inequívoco y evitar mezclar borradores. Avisar de cambios realizados por otro operador y de pérdida de conexión.

## 9. Tavelyo Kitchen — Cocina

**Objetivo:** leer comandas de un vistazo y preparar correctamente cada línea.

Diseñar para móvil, tableta y orientación horizontal. Cola por estación y estado, con número de pedido, mesa, hora, tiempo transcurrido, cantidades, productos, modificadores y prioridad. Las notas alimentarias relevantes deben estar próximas al producto y no ocultas detrás de un icono.

Tickets con acciones grandes: «Iniciar preparación» y «Marcar listo» según estado permitido. Diferenciar platos parcialmente completados; no marcar toda la orden por error. Mostrar pedidos listos con tiempo de espera y recogida pendiente.

Alertas por demora con texto e icono, sin parpadeos continuos ni depender solo de sonido. Mantener posición estable durante actualizaciones para evitar tocar un pedido distinto. Evitar fotografías grandes, banners y animaciones decorativas. Mostrar claramente si los datos están desactualizados.

## 10. Tavelyo POS — Caja

**Objetivo:** cobrar el importe correcto una sola vez y comprender cualquier incidencia.

Inicio: caja y turno activos, cuentas abiertas, solicitudes de cuenta, filtros por mesa y resumen del turno. En escritorio/tableta usar lista y detalle; en móvil mantener pasos claros y el total visible.

Detalle: mesa, identificador de cuenta, productos, cantidades, precios, descuentos, impuestos, propina, total y saldo. Mostrar por separado monto autorizado, captura confirmada y reembolsos. Importes alineados y moneda inequívoca.

Acciones separadas: autorizar, capturar, cancelar autorización y reembolsar. No etiquetar todas como «Pagar». Al dividir una cuenta, mostrar qué se asigna, cuánto queda y a quién corresponde. Confirmar monto y medio antes de ejecutar una operación financiera.

Resultados visuales distintos para autorizado, capturado, rechazado, pendiente, resultado desconocido y reembolso en proceso. Si no se conoce el resultado, mostrar «Estamos verificando el pago» con una acción segura de consulta; no presentar fracaso definitivo ni sugerir repetir el cobro.

Cierre de caja: fondo inicial, movimientos, total esperado, conteo y diferencia, con motivo cuando corresponda. Recibo comercial y factura fiscal deben nombrarse correctamente según la integración disponible.

## 11. Tavelyo Manager — Administración

**Objetivo:** administrar varias sucursales sin perder contexto ni modificar la empresa equivocada.

Selector visible de empresa y sucursal, navegación consistente y permisos claros. Cambio de contexto debe limpiar selección y datos anteriores. Mostrar alcance en títulos de informes, exportaciones y acciones masivas.

Panel: indicadores con definición, moneda, período y zona horaria; diferenciar ventas de capturas y reembolsos. Gráficos necesitan etiquetas y alternativa tabular, no depender del color.

Tablas: búsqueda, filtros persistentes razonables, orden, paginación y estado vacío/error. Formularios agrupados para catálogo, mesas, personal, recetas, inventario y configuración. Guardado con confirmación visible y advertencia sobre cambios sin guardar cuando sea relevante.

Roles, impuestos, descuentos, anulaciones y cambios de precios requieren resumen del impacto. Acciones masivas y cambios sensibles deben permitir revisar selección y ámbito. No mostrar datos financieros o personales a quien no tenga permiso.

## 12. Consistencia y contenido

Mantener una sola versión del logo, paleta, tipografía, componentes y vocabulario. Usar «pedido», «comanda», «cuenta», «autorización», «captura» y «reembolso» con significados documentados; para clientes, explicar los términos financieros en lenguaje sencillo.

Textos breves, español claro y mensajes accionables. No culpar al usuario ni mostrar códigos internos como única explicación. No inventar tiempos de preparación, disponibilidad o confirmaciones. Importes, fechas, cantidades y plurales deben usar localización configurable.

Las referencias visuales son orientación, no prueba de funciones implementadas. Si se adjuntan más adelante, analizar cada una, identificar patrones e inconsistencias y registrar una comparación. Las reglas escritas, accesibilidad y estados reales prevalecen sobre errores de una imagen.

Recursos sugeridos, **pendientes de aportar/exportar**, no archivos incluidos:

```text
assets/branding/
  tavelyo-logo-master.svg
  tavelyo-logo-horizontal-light.svg
  tavelyo-logo-horizontal-dark.svg
  tavelyo-isotype.svg
  tavelyo-monochrome.svg
docs/brand/
  asset-manifest.md
  contrast-matrix.md
  reference-review.md
```

Registrar en el manifiesto versión y uso permitido de cada recurso. No incorporar capturas completas como iconos ni fotografías sin derechos de uso. Mantener los archivos originales fuera del proceso de exportación destructivo.

## 13. Pruebas visuales y de experiencia

1. Crear catálogo de componentes con variantes y estados: carga, error, vacío, seleccionado, foco, deshabilitado y sin conexión.
2. Medir contraste de cada par usado; guardar resultados en una matriz. Incluir botón primario, etiquetas, chips, campos y modo oscuro si existe.
3. Probar navegación por teclado, orden de foco, foco visible y no oculto, lector de pantalla, nombres accesibles e indicación de errores.
4. Verificar texto ampliado al 200 %, pantallas compactas y anchas, orientación horizontal y contenido largo sin recortes de precios o acciones. Complementar con requisitos de reflujo aplicables en web.
5. Hacer pruebas visuales de referencia con datos deterministas para las cinco experiencias; revisar cambios de capturas antes de aceptarlos. Las capturas no reemplazan pruebas funcionales.
6. Validar logo real a tamaños mínimos, fondos claros/oscuros y máscaras de iconos. Hasta recibir el maestro, marcar esta validación como pendiente.
7. Ensayar los recorridos críticos: pedido con modificadores, cambio de precio, cocina parcial, recogida/entrega, preautorización, captura, pago incierto, reembolso y cambio de empresa.
8. Verificar que color, sonido o animación nunca sean la única señal de un estado importante.
9. Probar doble toque, red lenta, pérdida de conexión, sesiones vencidas y actualizaciones concurrentes sin mostrar éxitos falsos.
10. Revisar con personas representativas de cliente, mesero, cocina, caja y administración. Registrar tareas, errores observados y correcciones, sin inventar resultados de pruebas con usuarios.

## 14. Criterios de aceptación y entregables

La implementación visual de una fase se acepta cuando usa tokens y componentes centralizados; respeta las cinco experiencias y estados reales; no presenta desbordamientos en tamaños objetivo; supera las comprobaciones de accesibilidad pertinentes; mantiene operaciones financieras inequívocas; y conserva el aislamiento visual de empresa/sucursal.

Entregar catálogo de componentes, documentación de tokens, mapa de recorridos, inventario de recursos, matriz de contraste, capturas verificadas y registro de pruebas con pendientes explícitos. Cualquier recurso de marca ausente se declara pendiente, no se simula como aprobado.

No aprobar cambios al isotipo, tipografía del logo, punto final o paleta oficial sin decisión del propietario. Las variantes funcionales de interfaz se documentan y verifican sin modificar el maestro. No dar por terminada la accesibilidad solo porque exista un tema de colores.

## 15. Referencia de accesibilidad

Objetivo de conformidad: [WCAG 2.2](https://www.w3.org/TR/WCAG22/). Para los umbrales de texto, consultar [W3C: contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Las medidas de componentes, espaciado y organización de esta guía son decisiones de diseño propuestas para Tavelyo, no requisitos literales del estándar.
