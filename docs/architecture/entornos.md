# Entornos

Estado: **Fase 1** (2026-11-14). Configuración sin secretos en el repositorio.

| Entorno | Proyecto de Firebase | Uso | Estado |
|---|---|---|---|
| Local y pruebas automatizadas | `demo-tavelyo` (proyecto *demo*: solo emuladores, sin acceso a la nube) | Desarrollo diario, Vitest, Playwright y CI | ✅ Por defecto en `.firebaserc` |
| Desarrollo en la nube | `tavelyo-e2b57` (alias `dev`), creado por el propietario | Verificación de IAM, reglas y despliegues de prueba | ⏳ Sin apps web registradas ni servicios activados. **Registrar apps, activar Cloud SQL o el plan Blaze y desplegar requieren autorización expresa** |
| Producción | — | Clientes reales | ⏳ Se crea antes de salir a producción; proyecto separado de desarrollo |

## Reglas

- **Proyecto por defecto `demo-tavelyo`:** un `firebase deploy` sin `--project dev` no puede llegar a la nube. Para usar el proyecto real hay que nombrarlo de forma explícita.
- **Configuración web por variables `VITE_*`:** las dos apps leen un único `.env.local` en la raíz (git lo ignora). `.env.example` documenta los nombres con valores ficticios del proyecto *demo*.
- **La configuración web de Firebase no es secreta:** llega al navegador. La protección real está en Firebase Auth, las reglas `@auth` de SQL Connect y el backend (ADR-0008).
- **Nada secreto en `VITE_*`:** `parseFirebaseEnvironment` (`packages/data-access`) rechaza el arranque si falta una variable, si un proyecto *demo* no usa emuladores o si una variable `VITE_*` tiene nombre de secreto (`SECRET`, `PRIVATE`, `PASSWORD`, `SERVICE_ACCOUNT`, `DATABASE_URL`, `GATEWAY_KEY`).
- **Secretos del servidor** (pasarela, cuentas de servicio): en Secret Manager o en la configuración segura de Cloud Functions, nunca en el repositorio ni en el código del navegador. El backend actual no necesita ninguno: en Cloud Functions usa la cuenta de servicio del entorno, sin claves en archivos.

## Emuladores

`VITE_EMULATOR_HOST` (opcional) indica la IP del equipo cuando se prueba desde un teléfono en la misma red; por defecto `127.0.0.1`. Comandos: `npm run test:integration` (conectores, pasarelas y backend) y `npm run test:e2e:emulators` (recorrido en navegador), que arrancan y detienen los emuladores con la CLI 15.30.2.

`firebase.json` define Auth (puerto 9099), SQL Connect (puerto 9399, servicio `tavelyo`, PostgreSQL embebido con PGlite) y Cloud Functions (puerto 5001, código en `backend/`, runtime `nodejs24`). `npm run test:integration` compila el backend antes de arrancar los emuladores; la CLI define `FIREBASE_AUTH_EMULATOR_HOST` y `DATA_CONNECT_EMULATOR_HOST` para que el Admin SDK use los emuladores.
