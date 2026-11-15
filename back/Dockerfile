# syntax=docker/dockerfile:1

# build: compila TypeScript. Necesita devDependencies (tsc, tsc-alias).
FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY tsconfig.json ./
COPY src/ src/
RUN npm run build

# deps: sólo dependencias de producción.
FROM node:22-bookworm-slim AS deps
WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# runtime
FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=prod \
    TZ=America/Argentina/Buenos_Aires

COPY --from=deps  --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
# Migraciones versionadas: permiten correr `node dist/src/db/migrate.js` sin
# volver a construir la imagen.
COPY --chown=node:node db/migrations ./db/migrations

# Las fotos subidas (STORAGE_DIR). En el one-box va montada en un volumen.
RUN mkdir -p /app/storage && chown node:node /app/storage

USER node
EXPOSE 3000
CMD ["node", "dist/src/index.js"]
