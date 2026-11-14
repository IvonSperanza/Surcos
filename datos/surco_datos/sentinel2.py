"""NDVI de una parcela a partir de Sentinel-2 L2A (catálogo público Earth Search)."""

from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from datetime import date

import numpy as np
import rasterio
from pystac import Item
from pystac_client import Client
from rasterio.enums import Resampling
from rasterio.features import bounds, geometry_mask
from rasterio.transform import from_bounds as transform_desde_limites
from rasterio.warp import transform_geom
from rasterio.windows import from_bounds

from surco_datos.geometria import Geometria

STAC_URL = "https://earth-search.aws.element84.com/v1"
COLECCION = "sentinel-2-l2a"
FUENTE = "Sentinel-2 L2A (ESA Copernicus) vía Earth Search"
RESOLUCION_M = 10

# Clases de la banda SCL que muestran el suelo o el cultivo sin nubes ni
# sombras: 4 vegetación, 5 suelo desnudo, 6 agua, 7 sin clasificar. El resto
# (nubes, sombras, cirros, saturados, sin dato) contaminaría el NDVI.
SCL_DESPEJADO = (4, 5, 6, 7)

# Una pasada sólo cuenta si se ve casi toda la parcela: con menos, un borde de
# nube o una sombra puede bajar la mediana y simular suelo desnudo.
FRACCION_MINIMA_DESPEJADA = 0.8

# GDAL lista el directorio del COG antes de abrirlo si no se le dice lo
# contrario: en S3 público eso es una request extra por banda y fecha.
GDAL_ENV = {
    "GDAL_DISABLE_READDIR_ON_OPEN": "EMPTY_DIR",
    "AWS_NO_SIGN_REQUEST": "YES",
    "GDAL_HTTP_MULTIPLEX": "YES",
    "GDAL_HTTP_MERGE_CONSECUTIVE_RANGES": "YES",
}


@dataclass(frozen=True)
class PuntoNdvi:
    fecha: date
    ndvi: float
    fraccion_despejada: float
    escena: str


@dataclass(frozen=True)
class Recorte:
    """Ventana de una banda alrededor de la parcela, en la grilla de la escena."""

    datos: np.ndarray
    dentro: np.ndarray  # True en los píxeles cuyo centro cae dentro de la parcela
    crs: rasterio.crs.CRS
    transform: rasterio.Affine


def buscar_escenas(geometria: Geometria, desde: date, hasta: date, max_nubes_escena: float = 90) -> list[Item]:
    catalogo = Client.open(STAC_URL)
    busqueda = catalogo.search(
        collections=[COLECCION],
        intersects=geometria,
        datetime=f"{desde.isoformat()}/{hasta.isoformat()}",
        query={"eo:cloud_cover": {"lt": max_nubes_escena}},
        max_items=1000,
    )
    return una_escena_por_dia(list(busqueda.items()))


def una_escena_por_dia(escenas: list[Item]) -> list[Item]:
    # La parcela puede caer en dos tiles que solapan: la misma pasada aparece
    # dos veces. Se queda la de menos nubes.
    por_dia: dict[date, Item] = {}
    for escena in escenas:
        dia = escena.datetime.date()
        actual = por_dia.get(dia)
        if actual is None or escena.properties["eo:cloud_cover"] < actual.properties["eo:cloud_cover"]:
            por_dia[dia] = escena
    return [por_dia[dia] for dia in sorted(por_dia)]


def pixeles_dentro(geometria_src: Geometria, transform: rasterio.Affine, forma: tuple[int, int]) -> np.ndarray:
    centros = ~geometry_mask([geometria_src], out_shape=forma, transform=transform, all_touched=False)
    if centros.any():
        return centros
    # Parcela más angosta que un píxel: ningún centro cae adentro. Mejor un
    # dato con borde mezclado que ninguno.
    return ~geometry_mask([geometria_src], out_shape=forma, transform=transform, all_touched=True)


def leer_recorte(escena: Item, banda: str, geometria: Geometria, forma: tuple[int, int] | None = None) -> Recorte:
    with rasterio.Env(**GDAL_ENV), rasterio.open(escena.assets[banda].href) as src:
        geometria_src = transform_geom("EPSG:4326", src.crs, geometria)
        limites = bounds(geometria_src)
        datos = src.read(
            1,
            window=from_bounds(*limites, transform=src.transform),
            out_shape=forma,
            resampling=Resampling.nearest,
            boundless=True,
            fill_value=0,
        )
        crs = src.crs
    transform = transform_desde_limites(*limites, datos.shape[1], datos.shape[0])
    return Recorte(datos=datos, dentro=pixeles_dentro(geometria_src, transform, datos.shape), crs=crs, transform=transform)


def reflectancia(escena: Item, banda: str, crudo: np.ndarray) -> np.ndarray:
    # Desde la línea base 04.00 (2022) ESA suma +1000 a los números digitales,
    # pero Earth Search ya lo descuenta al armar los COG. Su metadato no es
    # confiable: deja `offset: -0.1` en `raster:bands` y a veces marca
    # `earthsearch:boa_offset_applied: False` en escenas que sí lo tienen
    # aplicado (ej. S2A_20HQJ_20260502_1_L2A, mismos niveles que sus vecinas).
    # Restarlo da rojos negativos y NDVI mayores a 1, así que sólo se escala.
    meta = escena.assets[banda].extra_fields.get("raster:bands", [{}])[0]
    return crudo.astype("float32") * meta.get("scale", 1e-4)


def calcular_ndvi(rojo: np.ndarray, nir: np.ndarray) -> np.ndarray:
    suma = nir + rojo
    with np.errstate(divide="ignore", invalid="ignore"):
        return np.where(suma > 0, (nir - rojo) / suma, np.nan)


def ndvi_de_escena(escena: Item, geometria: Geometria) -> PuntoNdvi | None:
    rojo = leer_recorte(escena, "red", geometria)
    forma = rojo.datos.shape
    nir = leer_recorte(escena, "nir", geometria, forma=forma).datos
    # SCL viene a 20 m: se lleva a la grilla de 10 m del rojo.
    scl = leer_recorte(escena, "scl", geometria, forma=forma).datos

    ndvi = calcular_ndvi(reflectancia(escena, "red", rojo.datos), reflectancia(escena, "nir", nir))
    valido = rojo.dentro & np.isin(scl, SCL_DESPEJADO) & (rojo.datos > 0) & (ndvi >= -1) & (ndvi <= 1)
    fraccion = float(valido.sum() / rojo.dentro.sum())
    if fraccion < FRACCION_MINIMA_DESPEJADA:
        return None

    return PuntoNdvi(
        fecha=escena.datetime.date(),
        ndvi=float(np.median(ndvi[valido])),
        fraccion_despejada=round(fraccion, 3),
        escena=escena.id,
    )


def serie_ndvi(geometria: Geometria, desde: date, hasta: date, hilos: int = 16) -> list[PuntoNdvi]:
    escenas = buscar_escenas(geometria, desde, hasta)
    with ThreadPoolExecutor(max_workers=hilos) as pool:
        puntos = pool.map(lambda escena: ndvi_de_escena(escena, geometria), escenas)
    return [punto for punto in puntos if punto is not None]
