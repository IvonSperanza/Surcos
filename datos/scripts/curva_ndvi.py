"""Curva de NDVI de uno o más lotes con Sentinel-2.

Uso: python -m scripts.curva_ndvi DESDE HASTA LADO_M SALIDA.png nombre:lat,lon [nombre:lat,lon ...]
Cada lote es un cuadrado de LADO_M metros centrado en el punto.
"""

import csv
import sys
from datetime import date
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import numpy as np

from surco_datos.geometria import poligono_desde_bbox
from surco_datos.sentinel2 import FUENTE, PuntoNdvi, serie_ndvi

UMBRAL_SUELO_DESNUDO = 0.3
METROS_POR_GRADO_LAT = 111_320

# Colores de design-system/tokens.json: el gráfico de prueba ya sigue la marca.
OLIVA = "#556229"
SUELO_DESNUDO = "#a07d58"
INK_MUTED = "#6e5b49"
SURFACE = "#fbf6ec"


def bbox_lote(lat: float, lon: float, lado_m: float) -> tuple[float, float, float, float]:
    medio_lat = lado_m / 2 / METROS_POR_GRADO_LAT
    medio_lon = medio_lat / np.cos(np.radians(lat))
    return (lon - medio_lon, lat - medio_lat, lon + medio_lon, lat + medio_lat)


def parsear_lote(texto: str) -> tuple[str, float, float]:
    nombre, coords = texto.split(":")
    lat, lon = coords.split(",")
    return nombre, float(lat), float(lon)


def guardar_csv(ruta: Path, nombre: str, serie: list[PuntoNdvi]) -> None:
    with ruta.open("w", newline="") as f:
        escritor = csv.writer(f)
        escritor.writerow(["lote", "fecha", "ndvi", "fraccion_despejada", "escena"])
        for p in serie:
            escritor.writerow([nombre, p.fecha.isoformat(), round(p.ndvi, 4), p.fraccion_despejada, p.escena])


def graficar(ax, nombre: str, lat: float, lon: float, serie: list[PuntoNdvi]) -> None:
    fechas = [p.fecha for p in serie]
    valores = np.array([p.ndvi for p in serie])
    ax.set_facecolor(SURFACE)
    ax.axhspan(-0.1, UMBRAL_SUELO_DESNUDO, color=SUELO_DESNUDO, alpha=0.18, linewidth=0)
    ax.plot(fechas, valores, color=OLIVA, linewidth=2, marker="o", markersize=3)
    ax.set_ylim(-0.05, 1)
    ax.set_title(f"{nombre}  ({lat:.4f}, {lon:.4f}) · {len(serie)} pasadas despejadas", loc="left", fontsize=10)
    ax.tick_params(colors=INK_MUTED, labelsize=8)
    ax.xaxis.set_major_locator(mdates.MonthLocator())
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %y"))
    ax.grid(alpha=0.25)


def main(desde: date, hasta: date, lado_m: float, salida: str, lotes: list[str]) -> None:
    lotes_parseados = [parsear_lote(t) for t in lotes]
    fig, ejes = plt.subplots(len(lotes_parseados), 1, figsize=(13, 2.6 * len(lotes_parseados)), sharex=True, squeeze=False)

    for ax, (nombre, lat, lon) in zip(ejes[:, 0], lotes_parseados):
        serie = serie_ndvi(poligono_desde_bbox(*bbox_lote(lat, lon, lado_m)), desde, hasta)
        guardar_csv(Path(salida).with_name(f"ndvi_{nombre}.csv"), nombre, serie)
        graficar(ax, nombre, lat, lon, serie)
        print(nombre, len(serie), "pasadas despejadas")

    fig.text(0.01, 0.0, f"Fuente: {FUENTE} · {desde} a {hasta} · lote de {lado_m:.0f} × {lado_m:.0f} m · franja marrón: NDVI < {UMBRAL_SUELO_DESNUDO} (suelo desnudo)", fontsize=8, color=INK_MUTED)
    fig.tight_layout(rect=(0, 0.02, 1, 1))
    fig.savefig(salida, dpi=110)
    print(salida)


if __name__ == "__main__":
    desde, hasta, lado, salida, *lotes = sys.argv[1:]
    main(date.fromisoformat(desde), date.fromisoformat(hasta), float(lado), salida, lotes)
