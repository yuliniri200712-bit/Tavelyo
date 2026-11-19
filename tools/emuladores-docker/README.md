# Emuladores de Firebase en Docker

En este equipo Windows, el Control inteligente de aplicaciones bloquea el ejecutable del emulador de SQL Connect. Por eso, los emuladores de Auth, SQL Connect y Cloud Functions corren en un contenedor de Linux, y el SDK web también se genera allí.

- **No toques la seguridad de Windows.**
- **Otros contenedores que veas en Docker** (nodaveli, mysql…) son de otros proyectos: no los toques.

| Archivo | Para qué |
|---|---|
| `start.sh` | Arranca los emuladores dentro del contenedor. Copia el esquema y el backend compilado; nunca escribe en el repositorio |
| `gen-sdk.sh` | Genera el SDK web (`dataconnect:sdk:generate`) y lo deja en `salida/sdk`. Esa carpeta está ignorada por Git |

El contenedor `tavelyo-emu` está autorizado por el propietario **solo durante la fase en curso**. Al cerrar la fase se borran el contenedor y la imagen `node:24-bookworm-slim`. Crearlo en otra fase requiere preguntar antes.

## Uso (Git Bash, desde la raíz del repositorio)

**Docker Desktop** está en `%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe`. A veces se cierra solo: si los emuladores no responden (ECONNREFUSED en 9399), comprueba `docker info` y vuelve a abrirlo.

```sh
# 1. Compilar el backend (el contenedor usa backend/lib).
npm run build -w backend

# 2. Crear el contenedor (una sola vez por fase).
MSYS_NO_PATHCONV=1 docker run -d --name tavelyo-emu \
  -p 127.0.0.1:9099:9099 -p 127.0.0.1:9399:9399 -p 127.0.0.1:5001:5001 \
  -v "C:/Users/Usuario/OneDrive/Desktop/Tavelyo/Tavelyo:/src:ro" \
  -v "C:/Users/Usuario/OneDrive/Desktop/Tavelyo/Tavelyo/tools/emuladores-docker:/scripts:ro" \
  -v "C:/Users/Usuario/OneDrive/Desktop/Tavelyo/Tavelyo/tools/emuladores-docker/salida:/out" \
  node:24-bookworm-slim sh /scripts/start.sh

# 3. Ya creado: arrancarlo, o reiniciarlo tras cambiar el esquema, los conectores o el backend.
#    start.sh vuelve a copiar /src en cada arranque.
docker start tavelyo-emu
docker restart tavelyo-emu

# 4. Esperar «All emulators ready» y revisar errores del esquema.
docker logs --tail 30 tavelyo-emu
MSYS_NO_PATHCONV=1 docker exec tavelyo-emu sh -c "grep -i error /work/dataconnect-debug.log | tail"

# 5. Generar el SDK y copiarlo al paquete (la CI comprueba que coincide con el generador).
MSYS_NO_PATHCONV=1 docker exec tavelyo-emu sh /scripts/gen-sdk.sh
cp -r tools/emuladores-docker/salida/sdk/. packages/data-access/dataconnect-generated/
```

**Puertos:** Auth 9099, SQL Connect 9399 y Functions 5001, solo en `127.0.0.1`.

**Datos:** se pierden al reiniciar el contenedor. Las pruebas crean los suyos.

**`reconcilePayments`:** el emulador de Functions la ignora porque no hay emulador de Pub/Sub. Es lo esperado: además, desde ADR-0012 no se exporta.
