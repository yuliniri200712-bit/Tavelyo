# AGENTS.md — Instrucciones para agentes de código (Codex y otros)

Este archivo lo leen automáticamente los agentes de código que trabajan en este repositorio. **Las reglas obligatorias del proyecto están en [`CLAUDE.md`](CLAUDE.md): léelo completo antes de cualquier cambio y cúmplelo exactamente igual que si estuviera dirigido a ti.** Aquí se añade lo que el trabajo hecho hasta ahora enseñó y que no está escrito en otro lugar.

Ante cualquier duda o conflicto: **detente y pregunta al propietario antes de actuar.**

## 1. Idioma

**Responde siempre en español**, en todos los mensajes, incluidos los avisos cortos entre pasos. El propietario lo ha pedido varias veces. También en español:

- la documentación;
- los comentarios del código;
- los textos de la interfaz;
- los mensajes de commit.

## 2. Antes de empezar cada sesión

1. Lee `CLAUDE.md`, `docs/progress.md` y el plan de la fase en curso en `docs/plans/`.
2. Revisa `git status`, la rama actual y `git log --oneline -10`.
3. Confirma con el propietario qué bloque está autorizado. **Terminar un bloque no autoriza el siguiente.** Al cerrar cada bloque, presenta el resumen y las pruebas, y espera su respuesta.

## 3. Estado al 2026-11-19

- **Fase en curso:** Fase 4, caja y pagos. Rama `fase-4-caja-pagos`. Plan: `docs/plans/fase-4.md`; **la sección 0 prevalece sobre el resto del plan**.
- **Hechos:**
  - bloques 1 (esquema), 2 (dinero de la cuenta en `packages/core`) y 3 (pagos en el backend);
  - bloque 3A (cambio de alcance, ADR-0012). CI #65 en verde.
- **Cambio de alcance (ADR-0012, decisiones D-32 a D-35 en `docs/requirements.md`):**
  - **La pasarela de pago solo se usará para cobrar los planes de los restaurantes a Tavelyo**, en una fase futura «Suscripciones a Tavelyo».
  - Los comensales pagan en el restaurante, y el cajero lo registra: efectivo, datáfono propio o transferencia, con número de comprobante y nunca con datos de tarjeta (D-33).
  - Cada sucursal elige si los pedidos del teléfono del cliente van directo a cocina o los aprueba el mesero (D-32).
- **El bloque 3 está DESCONECTADO a propósito:**
  - `backend/src/payments/`, `data/payments.ts`, `pagos.gql`, `presentation/payment-endpoints.ts`.
  - Se conserva para las suscripciones. No lo borres.
  - Tampoco lo vuelvas a conectar: ni exportes `paymentWebhook` ni `reconcilePayments`, ni crees el adaptador simulado al arrancar el backend.
- **Siguiente:** bloque 4, cuenta y cierre. El cajero registra pagos (D-33) y reembolsos con los topes de D-34: cajero hasta $ 50.000, administrador de sucursal hasta $ 300.000 y propietario sin tope, siempre con motivo. Además, división exacta, cierre de mesa (D-30) y la concurrencia de dos cajeros. **Empiézalo solo si el propietario lo autoriza.**
- **Pendientes anotados:** `docs/progress.md`, secciones «Pendiente» y «Bloqueos».

## 4. Lo que nunca debes hacer sin autorización expresa

- Integrar en `main`, hacer `push --force`, `reset --hard` o borrar ramas. **El propietario quiere conservar todas las ramas.**
- Desplegar, o activar recursos facturables. Antes de cualquier cosa con coste, muestra el coste.
- Añadir dependencias, paquetes, servicios o tecnologías nuevas.
- Editar `docs/PROMPT_MAESTRO.md` o `docs/IDENTIDAD_VISUAL.md`. Los cambios se registran como decisiones en `docs/decisions/`.
- Borrar tablas, columnas o datos del esquema: «nada se borra». Los errores se corrigen con operaciones nuevas y auditadas.
- Guardar datos de tarjeta, o escribir secretos o claves en el código.
- Tocar la seguridad de Windows (Control inteligente de aplicaciones) o los contenedores de Docker de otros proyectos.
- Poner el correo del propietario en peticiones externas o en la documentación.

## 5. Entorno de este equipo (Windows)

- **Pruebas, compilaciones y Playwright, siempre desde PowerShell con la unidad en mayúscula:**
  `Set-Location 'C:\Users\Usuario\OneDrive\Desktop\Tavelyo\Tavelyo'`.
  Con `c:` en minúscula, Vitest falla en todos los archivos y las apps salen en blanco.
- **No edites archivos con `Get-Content` o `Set-Content` de PowerShell**, porque estropean el UTF-8 (tildes, «», ñ). Usa el editor o scripts de Node.
- En Git Bash, los heredocs con comillas invertidas o apóstrofos fallan. Escribe el script en un archivo y ejecútalo con `node`.
- **Emuladores de Firebase:** solo en el contenedor de Docker `tavelyo-emu`. Mira [`tools/emuladores-docker/README.md`](tools/emuladores-docker/README.md). Tras cambiar el esquema, los conectores o el backend:
  1. `npm run build -w backend`;
  2. `docker restart tavelyo-emu`;
  3. genera el SDK y cópialo a `packages/data-access/dataconnect-generated`. La CI comprueba que coincide.

## 6. Comprobaciones antes de dar algo por terminado

No digas que algo está hecho sin ejecutar y leer el resultado de las comprobaciones que correspondan. Si algo falla o no se pudo ejecutar, dilo con claridad.

| Qué                                                                                        | Comando (PowerShell, desde `C:\…`)                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Formato, lint, tipos y pruebas unitarias                                                   | `npm run check`                                                                                                                                                                                               |
| Secretos                                                                                   | `npm run check:secrets`                                                                                                                                                                                       |
| Integración de SQL Connect (sin variables de entorno)                                      | `npx vitest run --config vitest.integration.config.ts dataconnect`                                                                                                                                            |
| Integración del backend (en otra ejecución: estas variables rompen `gateways.int.test.ts`) | `$env:FIREBASE_AUTH_EMULATOR_HOST='127.0.0.1:9099'; $env:DATA_CONNECT_EMULATOR_HOST='127.0.0.1:9399'; $env:GCLOUD_PROJECT='demo-tavelyo'; npx vitest run --config vitest.integration.config.ts backend/tests` |
| Recorridos en el navegador (libera antes los puertos 6173 y 6174)                          | `$env:FIREBASE_AUTH_EMULATOR_HOST='127.0.0.1:9099'; npx playwright test --config playwright.emulators.config.ts --project=chrome <archivos>`                                                                  |

- **Navegadores:** la CI corre los recorridos en los cinco navegadores de la matriz D-15.
- **Ver la CI sin agotar el límite de la API de GitHub (60 consultas por hora):** consulta la página `https://github.com/yuliniri200712-bit/Tavelyo/actions?query=branch%3A<rama>` y busca `aria-label="… Run NN of CI …"`.
- **Estados de la CI:**
  - finales: «completed successfully», «failed», «cancelled»;
  - en curso: «queued», «currently running», «waiting for another serialized run»;
  - una subida nueva cancela la ejecución anterior.

## 7. Patrones del código que hay que respetar

- **Por funcionalidad, con capas:**
  - `packages/features/<módulo>/src/` con `domain` (tipos y contrato de la pasarela de datos), `application` (lógica y textos) y `presentation` (React);
  - la implementación de datos va en `packages/data-access`;
  - las apps (`apps/menu-web`, `apps/operations`) solo componen.
- **Backend** (`backend/src`):
  - casos de uso con dependencias inyectadas (puertos);
  - almacenes de SQL Connect en `data/`;
  - las funciones se declaran en `presentation/` y se componen en `index.ts`.
- **Conectores** (`dataconnect/connector/*.gql`), con las reglas que verifica `dataconnect/tests/connector-rules.test.ts`:
  - las operaciones solo de servidor se llaman `Server*` y son `NO_ACCESS`;
  - las del personal llevan `@auth(level: USER)` y comprueban membresía, permiso y sucursal;
  - si escriben, además: `@transaction`, `@redact` y `AuditEvent`.
- **Concurrencia:** `_updateMany` condicionado (versión o estado) y después `@check(expr: "response.X_updateMany == 1")`. Así dos cambios simultáneos no pasan los dos.
- **Dinero:** `Money` de `packages/core`, en unidades menores con `bigint` y la moneda explícita; nunca números con decimales. El servidor es la autoridad en todo cálculo de dinero.
- **Permisos:**
  - viven en `packages/contracts/src/authorization.ts`;
  - la matriz `docs/architecture/permissions.md` debe coincidir con el código: hay una prueba que lo comprueba;
  - la autorización real siempre la decide el servidor.
- **Interfaz:**
  - componentes y tokens de `packages/design-system`, sin colores ni tamaños sueltos;
  - todo estado se dice también en texto, no solo con color;
  - los avisos van en `role="status"`;
  - objetivo de accesibilidad: WCAG 2.2 AA, con revisión axe en los recorridos.
- **Documentación en el mismo bloque:**
  - `docs/progress.md`;
  - `docs/testing/fase-N.md`, con comandos y resultados reales;
  - el plan, las decisiones y la arquitectura que cambien.
- **Commits:** pequeños y descriptivos, en español. Nunca en `main`.
