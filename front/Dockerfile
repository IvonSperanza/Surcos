# syntax=docker/dockerfile:1
# Se buildea con el contexto en la raíz del repo: el front importa los tokens
# de /design-system, que está fuera de front/.

FROM node:22-alpine AS build
WORKDIR /app/front

COPY front/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY design-system /app/design-system
COPY front .

# Vite las fija en el bundle al compilar.
ARG VITE_API_URL
ARG VITE_DATOS_URL
ARG VITE_URL_PUBLICA
ENV VITE_API_URL=$VITE_API_URL VITE_DATOS_URL=$VITE_DATOS_URL VITE_URL_PUBLICA=$VITE_URL_PUBLICA
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY front/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/front/dist /usr/share/nginx/html
EXPOSE 3000
