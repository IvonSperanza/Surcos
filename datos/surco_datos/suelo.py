"""Suelo del lugar de una parcela con SoilGrids 2.0 (ISRIC)."""

import math

import requests

URL = "https://rest.isric.org/soilgrids/v2.0/properties/query"
FUENTE = "SoilGrids 2.0 (ISRIC)"
RESOLUCION = "250 m"
PROFUNDIDADES = ("0-5cm", "5-15cm", "15-30cm")

# Propiedad de SoilGrids -> nombre en la respuesta de Surco. La unidad sale de
# `target_units` de cada respuesta: el valor crudo dividido por `d_factor`.
PROPIEDADES = {
    "clay": "arcilla",
    "sand": "arena",
    "silt": "limo",
    "soc": "carbono_organico",
    "phh2o": "ph",
    "nitrogen": "nitrogeno",
    "bdod": "densidad_aparente",
    "cec": "capacidad_intercambio",
}

# SoilGrids enmascara lo que su modelo considera urbano o agua: si el centro
# de la parcela cae ahí, se prueban puntos alrededor, cada vez más lejos.
DISTANCIAS_ALTERNATIVAS_M = (250, 500)
METROS_POR_GRADO_LAT = 111_320


def consultar(lat: float, lon: float) -> dict:
    respuesta = requests.get(
        URL,
        params=[("lon", lon), ("lat", lat), ("value", "mean")]
        + [("property", p) for p in PROPIEDADES]
        + [("depth", d) for d in PROFUNDIDADES],
        timeout=60,
    )
    respuesta.raise_for_status()
    return respuesta.json()


def capas(crudo: dict) -> tuple[list[dict], dict[str, str]]:
    por_profundidad: dict[str, dict] = {p: {"profundidad": p} for p in PROFUNDIDADES}
    unidades: dict[str, str] = {}
    for capa in crudo["properties"]["layers"]:
        nombre = PROPIEDADES[capa["name"]]
        factor = capa["unit_measure"]["d_factor"]
        unidades[nombre] = capa["unit_measure"]["target_units"]
        for prof in capa["depths"]:
            valor = prof["values"]["mean"]
            por_profundidad[prof["label"]][nombre] = None if valor is None else round(valor / factor, 2)
    return [por_profundidad[p] for p in PROFUNDIDADES], unidades


def tiene_datos(lista_capas: list[dict]) -> bool:
    return lista_capas[0].get("arcilla") is not None


def puntos_alternativos(lat: float, lon: float):
    for distancia in DISTANCIAS_ALTERNATIVAS_M:
        dlat = distancia / METROS_POR_GRADO_LAT
        dlon = dlat / math.cos(math.radians(lat))
        for flat, flon in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            yield round(lat + flat * dlat, 5), round(lon + flon * dlon, 5), distancia


def clase_textural(arcilla: float, arena: float, limo: float) -> str:
    """Triángulo textural del USDA, con los nombres que usa INTA."""
    if limo + 1.5 * arcilla < 15:
        return "arenoso"
    if limo + 2 * arcilla < 30:
        return "arenoso franco"
    if arcilla >= 40:
        if arena > 45:
            return "arcillo arenoso"
        return "arcillo limoso" if limo >= 40 else "arcilloso"
    if arcilla >= 35 and arena > 45:
        return "arcillo arenoso"
    if arcilla >= 27:
        if arena <= 20:
            return "franco arcillo limoso"
        return "franco arcilloso" if arena <= 45 else "franco arcillo arenoso"
    if arcilla >= 20 and limo < 28 and arena > 45:
        return "franco arcillo arenoso"
    if limo >= 80 and arcilla < 12:
        return "limoso"
    if limo >= 50:
        return "franco limoso"
    if arcilla >= 7 and limo >= 28 and arena <= 52:
        return "franco"
    return "franco arenoso"


def suelo(lat: float, lon: float) -> dict:
    candidatos = [(lat, lon, 0), *puntos_alternativos(lat, lon)]
    for punto_lat, punto_lon, distancia in candidatos:
        lista_capas, unidades = capas(consultar(punto_lat, punto_lon))
        if tiene_datos(lista_capas):
            superficie = lista_capas[0]
            return {
                "fuente": FUENTE,
                "resolucion": RESOLUCION,
                "punto": {"lat": punto_lat, "lon": punto_lon},
                "distancia_al_centro_m": distancia,
                "textura_superficial": clase_textural(superficie["arcilla"], superficie["arena"], superficie["limo"]),
                "unidades": unidades,
                "capas": lista_capas,
            }
    return {
        "fuente": FUENTE,
        "resolucion": RESOLUCION,
        "punto": {"lat": lat, "lon": lon},
        "distancia_al_centro_m": None,
        "textura_superficial": None,
        "unidades": {},
        "capas": [],
    }
