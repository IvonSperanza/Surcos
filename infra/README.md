# Staging en el one-box de Thorque

Mismo esquema que disden (repo `Thorque/onebox`): Traefik rutea por
subdominio y cada stack es un Docker Compose. Surco usa dos stacks:

| Stack | Qué corre | Direcciones |
|---|---|---|
| `surcos-staging` | back (API + Postgres) y front | https://surcos-staging.thorque.com.ar · https://surcos-staging-api.thorque.com.ar |
| `surcos-datos-staging` | servicio de datos (Python) en el lugar de la API; su Postgres no se usa | https://surcos-datos-staging-api.thorque.com.ar |

## Una sola vez, en el VPS

```bash
cd /opt/onebox
export BASE_DOMAIN=thorque.com.ar GHCR_OWNER=thorque-software

bin/new-env.sh surcos-datos staging
echo "CORS_ORIGIN=https://surcos-staging.thorque.com.ar" >> stacks/surcos-datos-staging/.env

# surcos-staging ya existe: le faltan el HOST del back y el volumen de fotos.
echo "HOST=https://surcos-staging-api.thorque.com.ar" >> stacks/surcos-staging/.env
# copiar infra/surcos-staging.override.yml a stacks/surcos-staging/docker-compose.override.yml
```

`CORS_ORIGIN=https://surcos-staging.thorque.com.ar` ya está en
`stacks/surcos-staging/.env`: lo usa el back igual que lo usaba datos.

## Cada deploy

```bash
VPS_HOST=… scripts/deploy-staging.sh
```

Después del primer deploy, cargar la quinta de ejemplo:

```bash
curl -X POST https://surcos-staging-api.thorque.com.ar/demo/reiniciar
```
