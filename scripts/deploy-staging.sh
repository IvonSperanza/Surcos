#!/usr/bin/env bash
set -euo pipefail
# Deploya Surco en el one-box de staging de Thorque (repo Thorque/onebox), sin
# GitHub Actions: buildea las imágenes acá, las sube a GHCR y le pide al VPS
# que las baje.
#
#   VPS_HOST=… scripts/deploy-staging.sh
#
# Son dos stacks del one-box:
#   surcos-staging        back (API + Postgres) y front
#   surcos-datos-staging  servicio de datos (Python), en el lugar de la API
#
# Requisitos:
#   - docker login ghcr.io con un token que tenga write:packages
#   - acceso SSH al VPS como deploy (o VPS_USER)
#   - los stacks creados una vez en el VPS (ver infra/README.md)

: "${VPS_HOST:?definí VPS_HOST (la IP del one-box)}"
VPS_USER="${VPS_USER:-deploy}"
ENTORNO=staging
DOMINIO=thorque.com.ar
REGISTRO=ghcr.io/thorque-software

URL_WEB="https://surcos-${ENTORNO}.${DOMINIO}"
URL_API="https://surcos-${ENTORNO}-api.${DOMINIO}"
URL_DATOS="https://surcos-datos-${ENTORNO}-api.${DOMINIO}"
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

docker build --platform linux/amd64 -t "${REGISTRO}/surcos-api:${ENTORNO}" "${RAIZ}/back"
docker build --platform linux/amd64 -t "${REGISTRO}/surcos-datos-api:${ENTORNO}" "${RAIZ}/datos"
docker build --platform linux/amd64 -f "${RAIZ}/front/Dockerfile" \
    --build-arg VITE_API_URL="${URL_API}" \
    --build-arg VITE_DATOS_URL="${URL_DATOS}" \
    --build-arg VITE_URL_PUBLICA="${URL_WEB}" \
    -t "${REGISTRO}/surcos-web:${ENTORNO}" "${RAIZ}"

for imagen in surcos-api surcos-datos-api surcos-web; do
    docker push "${REGISTRO}/${imagen}:${ENTORNO}"
done

ssh "${VPS_USER}@${VPS_HOST}" "
    /opt/onebox/bin/deploy.sh surcos-datos ${ENTORNO} &&
    /opt/onebox/bin/deploy.sh surcos ${ENTORNO} &&
    /opt/onebox/bin/migrate.sh surcos ${ENTORNO}
"
echo "Front: ${URL_WEB}"
echo "API:   ${URL_API}/salud"
echo "Datos: ${URL_DATOS}/salud"
