#!/bin/sh
# Genera el SDK web con la CLI de Linux (en Windows está bloqueada) a partir de la copia de solo
# lectura del repositorio, y deja el resultado en /out para compararlo y copiarlo.
set -e
rm -rf /gen && mkdir -p /gen/packages/data-access
cp -r /src/dataconnect /gen/
cp /src/packages/data-access/package.json /gen/packages/data-access/
cp -r /src/packages/data-access/dataconnect-generated /gen/packages/data-access/
echo '{ "dataconnect": { "source": "dataconnect" } }' > /gen/firebase.json
cd /gen
npx --yes firebase-tools@15.30.2 dataconnect:sdk:generate --project demo-tavelyo
rm -rf /out/sdk && cp -r /gen/packages/data-access/dataconnect-generated /out/sdk
cp /gen/packages/data-access/package.json /out/package.json
