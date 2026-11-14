"""Sugerir el polígono de una parcela a partir de un clic (prueba).

Idea: una parcela es tierra que se maneja igual, así que sus píxeles crecen y
se cosechan juntos. Desde el píxel del clic se suman los vecinos cuya curva
anual de NDVI se parece a la suya.
"""

from collections import deque
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from datetime import date

import numpy as np
import rasterio
from pystac import Item
from rasterio.features import shapes
from rasterio.warp import transform_geom

from surco_datos.geometria import Geometria
from surco_datos.sentinel2 import SCL_DESPEJADO, buscar_escenas, calcular_ndvi, leer_recorte, reflectancia

# Una fecha entra al cubo sólo si casi toda la zona está despejada: con
# muchos huecos, la comparación entre píxeles depende de qué fechas tiene cada
# uno y no de su manejo.
FRACCION_ZONA_DESPEJADA = 0.9


@dataclass(frozen=True)
class Cubo:
    fechas: list[date]
    ndvi: np.ndarray  # (fechas, filas, columnas)
    crs: rasterio.crs.CRS
    transform: rasterio.Affine


def ndvi_de_zona(escena: Item, zona: Geometria, forma: tuple[int, int] | None) -> tuple[date, np.ndarray, rasterio.crs.CRS, rasterio.Affine] | None:
    rojo = leer_recorte(escena, "red", zona, forma=forma)
    forma_real = rojo.datos.shape
    nir = leer_recorte(escena, "nir", zona, forma=forma_real).datos
    scl = leer_recorte(escena, "scl", zona, forma=forma_real).datos

    despejado = np.isin(scl, SCL_DESPEJADO) & (rojo.datos > 0)
    if despejado.mean() < FRACCION_ZONA_DESPEJADA:
        return None
    ndvi = calcular_ndvi(reflectancia(escena, "red", rojo.datos), reflectancia(escena, "nir", nir))
    return escena.datetime.date(), np.where(despejado, ndvi, np.nan), rojo.crs, rojo.transform


def armar_cubo(zona: Geometria, desde: date, hasta: date) -> Cubo:
    escenas = buscar_escenas(zona, desde, hasta)
    # Todas las fechas tienen que caer en la misma grilla: la forma la fija la
    # primera escena y el resto se lee con esa forma.
    forma = leer_recorte(escenas[0], "red", zona).datos.shape
    with ThreadPoolExecutor(max_workers=16) as pool:
        capas = [c for c in pool.map(lambda e: ndvi_de_zona(e, zona, forma), escenas) if c is not None]

    ndvi = rellenar_huecos(np.stack([c[1] for c in capas]))
    _, _, crs, transform = capas[0]
    return Cubo(fechas=[c[0] for c in capas], ndvi=ndvi, crs=crs, transform=transform)


def rellenar_huecos(ndvi: np.ndarray) -> np.ndarray:
    # Los pocos píxeles nublados que quedan se completan interpolando en el
    # tiempo, para que todos tengan una curva completa comparable.
    t = np.arange(ndvi.shape[0])
    plano = ndvi.reshape(ndvi.shape[0], -1)
    for k in range(plano.shape[1]):
        serie = plano[:, k]
        validos = ~np.isnan(serie)
        if validos.sum() >= 2 and not validos.all():
            serie[~validos] = np.interp(t[~validos], t[validos], serie[validos])
    return plano.reshape(ndvi.shape)


def distancia_curvas(cubo: Cubo, fila: int, columna: int) -> np.ndarray:
    """RMS de la diferencia de NDVI entre cada píxel y el del clic, en unidades de NDVI."""
    semilla = cubo.ndvi[:, fila, columna][:, None, None]
    return np.sqrt(np.nanmean((cubo.ndvi - semilla) ** 2, axis=0))


def crecer_region(distancia: np.ndarray, fila: int, columna: int, umbral: float) -> np.ndarray:
    region = np.zeros(distancia.shape, dtype=bool)
    pendientes = deque([(fila, columna)])
    region[fila, columna] = True
    while pendientes:
        f, c = pendientes.popleft()
        for df, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nf, nc = f + df, c + dc
            dentro = 0 <= nf < distancia.shape[0] and 0 <= nc < distancia.shape[1]
            if dentro and not region[nf, nc] and distancia[nf, nc] <= umbral:
                region[nf, nc] = True
                pendientes.append((nf, nc))
    return region


def pixel_del_punto(cubo: Cubo, lat: float, lon: float) -> tuple[int, int]:
    x, y = transform_geom("EPSG:4326", cubo.crs, {"type": "Point", "coordinates": [lon, lat]})["coordinates"]
    fila, columna = rasterio.transform.rowcol(cubo.transform, x, y)
    return int(fila), int(columna)


def region_a_poligono(cubo: Cubo, region: np.ndarray) -> Geometria:
    partes = [geom for geom, valor in shapes(region.astype("uint8"), mask=region, transform=cubo.transform) if valor == 1]
    # Un clic da una región conexa: hay una sola parte.
    return transform_geom(cubo.crs, "EPSG:4326", partes[0])


def sugerir(cubo: Cubo, lat: float, lon: float, umbral: float) -> tuple[np.ndarray, Geometria]:
    fila, columna = pixel_del_punto(cubo, lat, lon)
    region = crecer_region(distancia_curvas(cubo, fila, columna), fila, columna, umbral)
    return region, region_a_poligono(cubo, region)
