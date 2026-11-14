"""Imagen en color real de una zona, con grilla de lat/lon, para elegir lotes.

Uso: python -m scripts.vista_zona LAT LON LADO_KM FECHA SALIDA.png
"""

import sys
from datetime import date, timedelta

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import rasterio
from rasterio.vrt import WarpedVRT

from surco_datos.geometria import poligono_desde_bbox
from surco_datos.sentinel2 import GDAL_ENV, buscar_escenas, reflectancia

GRADOS_POR_KM_LAT = 1 / 111.32


def bbox_cuadrado(lat: float, lon: float, lado_km: float) -> tuple[float, float, float, float]:
    medio_lat = lado_km / 2 * GRADOS_POR_KM_LAT
    medio_lon = medio_lat / np.cos(np.radians(lat))
    return (lon - medio_lon, lat - medio_lat, lon + medio_lon, lat + medio_lat)


def leer_en_lonlat(href: str, bbox, ancho: int, alto: int) -> np.ndarray:
    with rasterio.Env(**GDAL_ENV), rasterio.open(href) as src:
        transform = rasterio.transform.from_bounds(*bbox, ancho, alto)
        with WarpedVRT(src, crs="EPSG:4326", transform=transform, width=ancho, height=alto) as vrt:
            return vrt.read(1)


def estirar(rgb: np.ndarray) -> np.ndarray:
    # La vegetación refleja poco en el visible: un corte lineal la deja negra.
    # Percentiles + gamma la hacen distinguible del suelo desnudo.
    bajo, alto = np.nanpercentile(rgb, (2, 98))
    return np.clip((rgb - bajo) / (alto - bajo), 0, 1) ** 0.6


def main(lat: float, lon: float, lado_km: float, fecha: date, salida: str) -> None:
    bbox = bbox_cuadrado(lat, lon, lado_km)
    escenas = buscar_escenas(poligono_desde_bbox(*bbox), fecha - timedelta(days=1), fecha + timedelta(days=1), max_nubes_escena=30)
    escena = escenas[0]
    pixeles = int(lado_km * 100)  # 10 m por píxel

    bandas = [
        reflectancia(escena, b, leer_en_lonlat(escena.assets[b].href, bbox, pixeles, pixeles))
        for b in ("red", "green", "blue")
    ]
    rgb = estirar(np.dstack(bandas))

    fig, ax = plt.subplots(figsize=(14, 14), dpi=100)
    ax.imshow(rgb, extent=(bbox[0], bbox[2], bbox[1], bbox[3]))
    ax.set_xticks(np.round(np.linspace(bbox[0], bbox[2], 11), 3))
    ax.set_yticks(np.round(np.linspace(bbox[1], bbox[3], 11), 3))
    ax.tick_params(labelsize=8)
    plt.xticks(rotation=45)
    ax.grid(color="yellow", alpha=0.35, linewidth=0.6)
    ax.set_title(f"{escena.id} · {escena.datetime.date()}")
    fig.savefig(salida, bbox_inches="tight")
    print(salida, escena.id)


if __name__ == "__main__":
    lat, lon, lado, fecha, salida = sys.argv[1:6]
    main(float(lat), float(lon), float(lado), date.fromisoformat(fecha), salida)
