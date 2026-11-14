"""Parcelas como polígonos GeoJSON en lon/lat (EPSG:4326)."""

from typing import Any

import numpy as np

Geometria = dict[str, Any]

RADIO_TIERRA_M = 6_371_008.8


def poligono_desde_bbox(lon_min: float, lat_min: float, lon_max: float, lat_max: float) -> Geometria:
    anillo = [[lon_min, lat_min], [lon_max, lat_min], [lon_max, lat_max], [lon_min, lat_max], [lon_min, lat_min]]
    return {"type": "Polygon", "coordinates": [anillo]}


def area_anillo_m2(anillo: list[list[float]]) -> float:
    # Proyección equirectangular local: para parcelas de pocas hectáreas el
    # error es despreciable y evita depender de pyproj sólo para validar.
    puntos = np.radians(np.array(anillo, dtype=float))
    lat_media = puntos[:, 1].mean()
    x = puntos[:, 0] * np.cos(lat_media) * RADIO_TIERRA_M
    y = puntos[:, 1] * RADIO_TIERRA_M
    return float(abs(np.dot(x, np.roll(y, -1)) - np.dot(y, np.roll(x, -1))) / 2)


def centroide(geometria: Geometria) -> tuple[float, float]:
    """(lat, lon) del promedio de vértices: alcanza para fuentes de 250 m o más."""
    exterior = np.array(geometria["coordinates"][0][:-1], dtype=float)
    lon, lat = exterior.mean(axis=0)
    return round(float(lat), 5), round(float(lon), 5)


def area_ha(geometria: Geometria) -> float:
    exterior, *huecos = geometria["coordinates"]
    return (area_anillo_m2(exterior) - sum(area_anillo_m2(h) for h in huecos)) / 10_000
