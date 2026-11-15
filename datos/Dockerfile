# syntax=docker/dockerfile:1
FROM python:3.12-slim
WORKDIR /app

# Las ruedas de rasterio traen GDAL pero no libexpat.
RUN apt-get update && apt-get install -y --no-install-recommends libexpat1 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt

COPY surco_datos surco_datos
COPY referencias referencias

# En el one-box de Thorque este servicio ocupa el lugar de la API, que Traefik
# busca en el puerto 3000.
EXPOSE 3000
CMD ["uvicorn", "surco_datos.api:app", "--host", "0.0.0.0", "--port", "3000"]
