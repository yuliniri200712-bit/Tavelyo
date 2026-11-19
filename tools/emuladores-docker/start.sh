#!/bin/sh
# Emuladores de Auth, SQL Connect y Cloud Functions dentro del contenedor (Linux): el ejecutable de
# Windows está bloqueado por el Control inteligente de aplicaciones. Se copian el esquema y el
# backend compilado para no escribir en el repositorio.
set -e
mkdir -p /work/backend
cp -r /src/dataconnect /work/
cp -r /src/backend/lib /work/backend/
# El emulador genera el SDK al cargar el conector: necesita el paquete de destino.
mkdir -p /work/packages/data-access
cp /src/packages/data-access/package.json /work/packages/data-access/
cp -r /src/packages/data-access/dataconnect-generated /work/packages/data-access/
# Solo las dependencias externas del backend (las del monorepo ya van empaquetadas en lib/).
node -e "
const pkg = require('/src/backend/package.json');
const out = { name: pkg.name, private: true, type: pkg.type, main: pkg.main, engines: pkg.engines, dependencies: pkg.dependencies };
require('fs').writeFileSync('/work/backend/package.json', JSON.stringify(out, null, 2));
"
(cd /work/backend && npm install --omit=dev --no-audit --no-fund --loglevel=error)
cat > /work/firebase.json <<'EOF'
{
  "dataconnect": { "source": "dataconnect" },
  "functions": [{ "source": "backend", "codebase": "default", "runtime": "nodejs24" }],
  "emulators": {
    "auth": { "host": "0.0.0.0", "port": 9099 },
    "dataconnect": { "host": "0.0.0.0", "port": 9399 },
    "functions": { "host": "0.0.0.0", "port": 5001 },
    "ui": { "enabled": false },
    "singleProjectMode": true
  }
}
EOF
cd /work
# Tras encender Docker, el primer arranque es lento: más margen para leer las funciones.
export FUNCTIONS_DISCOVERY_TIMEOUT=60
exec npx --yes firebase-tools@15.30.2 emulators:start --project demo-tavelyo --only auth,dataconnect,functions
