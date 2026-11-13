# Estrategia de pruebas

Estado: **Fase 0**, adaptada a la plataforma web/PWA (ADR-0009). Las herramientas son las propuestas en ADR-0010, pendientes de aprobación (D-16). Base: PM §12, IV §13, CLAUDE.md §8. Prioriza la cobertura de riesgos e invariantes; no se impone un porcentaje decorativo de cobertura.

## 1. Niveles

| Nivel | Qué cubre | Herramienta prevista |
|---|---|---|
| Unitarias de dominio | `Money`, impuestos, redondeo, descuentos, reparto, máquinas de estado, permisos, inventario | Vitest (TypeScript puro) |
| Componentes | Componentes del sistema de diseño, formularios, estados de carga/error/vacío | Vitest + Testing Library |
| Integración | Conectores SQL Connect, backend, transacciones, autorización | Emulador local de Firebase (Auth y SQL Connect) + pruebas del backend |
| Recorridos completos | Flujos de los cinco roles | Playwright contra entorno de pruebas aislado, en los navegadores de D-15 |
| PWA | Instalación, arranque sin conexión, aviso de conexión, actualización controlada, que el *service worker* no cachee datos | Playwright |
| Seguridad | Aislamiento entre empresas, revocación, webhooks, idempotencia | Integración + casos dedicados |
| Regresión | Toda la suite en CI en cada cambio | CI (Fase 1) |
| Visuales y accesibilidad | Contraste, foco, lector de pantalla, texto al 200 %, tamaños | Playwright (capturas con datos deterministas) + `@axe-core/playwright` + revisión manual con lector de pantalla |

Los dobles de prueba no sustituyen comprobar la pasarela en su entorno de pruebas ni las reglas desplegadas. Una herramienta ausente es una limitación documentada, no una prueba aprobada.

## 2. Casos de aceptación obligatorios (PM §12) y fase en que se cubren

| # | Caso | Fase |
|---|---|---|
| 1 | Alterar `tenant_id`/`branch_id`/ID para acceder a otra empresa → denegado (incl. agregados, archivos, exportaciones) | 1 (base), ampliado en cada fase |
| 2 | Membresía revocada o degradada → siguiente operación privilegiada rechazada | 1 |
| 3 | Doble pulsación y reintento tras timeout → un solo pedido/operación | 3 (pedidos), 4 (pagos) |
| 4 | Dos operadores sobre la misma cuenta o última unidad → integridad y conflicto visible | 3–5 |
| 5 | Precio modificado con carrito abierto → revisión obligatoria | 2 |
| 6 | Preautorización rechazada, 3DS, vencimiento, consumo superior, captura menor | 4 |
| 7 | Captura exitosa y caída antes de persistir → conciliación sin doble cobro | 4 |
| 8 | Webhook inválido, duplicado o fuera de orden | 4 |
| 9 | Dos cajeros capturan o cierran a la vez | 4 |
| 10 | Reembolso repetido o excesivo | 4 |
| 11 | Desconexión y reconexión de cocina | 3 |
| 12 | Sesión de mesa cerrada no expone la siguiente | 2 |
| 13 | Restauración de respaldo en entorno aislado | 6 |
| 14 | Recorridos de los cinco roles con accesibilidad | 1 (componentes) → 6 |

## 3. Datos de prueba

Sintéticos y deterministas: al menos dos empresas (A y B), cada una con dos sucursales y usuarios de cada rol. Nunca datos de producción.

## 4. Registro de resultados

Cada fase registra en `docs/testing/` los comandos ejecutados, los resultados reales y lo que no se pudo ejecutar, con su motivo.

## 5. Verificación de Fase 0

Fase 0 no produce código; su verificación consiste en:

- Copias de `PROMPT_MAESTRO.md` e `IDENTIDAD_VISUAL.md` idénticas a los originales (hash SHA-256).
- Enlaces relativos entre documentos válidos.
- Matriz de contraste recalculada con script.
- Revisión de coherencia: cada decisión pendiente aparece en `requirements.md` y en el ADR correspondiente.

Resultados en [`fase-0-verificacion.md`](fase-0-verificacion.md).
