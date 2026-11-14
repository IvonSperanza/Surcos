"""Clima de la zona de una parcela con NASA POWER (comunidad agrícola, diario)."""

import math
from collections import defaultdict
from collections.abc import Iterable
from dataclasses import dataclass
from datetime import date

import requests

URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
FUENTE = "NASA POWER (comunidad AG, datos diarios)"
RESOLUCION = "~50 km (celda de 0,5° × 0,625°)"
VALOR_FALTANTE = -999

# Nombre de POWER -> nombre en la respuesta de Surco.
PARAMETROS = {
    "T2M": "temperatura_media",
    "T2M_MAX": "temperatura_maxima",
    "T2M_MIN": "temperatura_minima",
    "PRECTOTCORR": "lluvia_mm",
    "GWETROOT": "humedad_raiz",
    "GWETTOP": "humedad_superficie",
    "EVLAND": "evaporacion_mm",
    "FROST_DAYS": "helada",
    "GDD10": "grados_dia_10",
}

UMBRAL_DIA_DE_LLUVIA_MM = 1
UMBRAL_LLUVIA_INTENSA_MM = 50


def consultar(lat: float, lon: float, desde: date, hasta: date, parametros: Iterable[str] = PARAMETROS) -> dict:
    respuesta = requests.get(
        URL,
        params={
            "parameters": ",".join(parametros),
            "community": "AG",
            "latitude": lat,
            "longitude": lon,
            "start": desde.strftime("%Y%m%d"),
            "end": hasta.strftime("%Y%m%d"),
            "format": "JSON",
        },
        timeout=90,
    )
    respuesta.raise_for_status()
    return respuesta.json()


def serie_diaria(crudo: dict) -> list[dict]:
    por_parametro = crudo["properties"]["parameter"]
    fechas = sorted(next(iter(por_parametro.values())))
    dias = []
    for clave_fecha in fechas:
        valores = {nombre: por_parametro[codigo][clave_fecha] for codigo, nombre in PARAMETROS.items()}
        # Los últimos días todavía no procesados vienen en -999: es un dato
        # faltante, nunca un número.
        if all(v == VALOR_FALTANTE for v in valores.values()):
            continue
        dia = {nombre: (None if v == VALOR_FALTANTE else round(v, 2)) for nombre, v in valores.items()}
        dia["helada"] = None if dia["helada"] is None else dia["helada"] > 0
        dia["fecha"] = date(int(clave_fecha[:4]), int(clave_fecha[4:6]), int(clave_fecha[6:])).isoformat()
        dias.append(dia)
    return dias


def presentes(dias: list[dict], campo: str) -> list[dict]:
    return [d for d in dias if d[campo] is not None]


def promedio(dias: list[dict], campo: str) -> float | None:
    valores = [d[campo] for d in presentes(dias, campo)]
    return round(sum(valores) / len(valores), 2) if valores else None


def extremo(dias: list[dict], campo: str, mayor: bool) -> dict | None:
    candidatos = presentes(dias, campo)
    if not candidatos:
        return None
    elegido = (max if mayor else min)(candidatos, key=lambda d: d[campo])
    return {"valor": elegido[campo], "fecha": elegido["fecha"]}


def suma(dias: list[dict], campo: str) -> float:
    return round(sum(d[campo] for d in presentes(dias, campo)), 1)


def resumir(dias: list[dict]) -> dict:
    return {
        "lluvia_total_mm": suma(dias, "lluvia_mm"),
        "dias_con_lluvia": sum(1 for d in presentes(dias, "lluvia_mm") if d["lluvia_mm"] >= UMBRAL_DIA_DE_LLUVIA_MM),
        "dias_lluvia_intensa": sum(1 for d in presentes(dias, "lluvia_mm") if d["lluvia_mm"] >= UMBRAL_LLUVIA_INTENSA_MM),
        "lluvia_maxima_diaria": extremo(dias, "lluvia_mm", mayor=True),
        "dias_con_helada": sum(1 for d in presentes(dias, "helada") if d["helada"]),
        "temperatura_media": promedio(dias, "temperatura_media"),
        "temperatura_minima_absoluta": extremo(dias, "temperatura_minima", mayor=False),
        "temperatura_maxima_absoluta": extremo(dias, "temperatura_maxima", mayor=True),
        "grados_dia_10": suma(dias, "grados_dia_10"),
        "humedad_raiz_media": promedio(dias, "humedad_raiz"),
        "ultimo_dato": dias[-1]["fecha"] if dias else None,
    }


def mensual(dias: list[dict]) -> list[dict]:
    por_mes: dict[str, list[dict]] = defaultdict(list)
    for dia in dias:
        por_mes[dia["fecha"][:7]].append(dia)
    return [
        {
            "mes": mes,
            "lluvia_mm": suma(grupo, "lluvia_mm"),
            "temperatura_media": promedio(grupo, "temperatura_media"),
            "dias_con_helada": sum(1 for d in presentes(grupo, "helada") if d["helada"]),
            "humedad_raiz_media": promedio(grupo, "humedad_raiz"),
            "dias_con_dato": len(grupo),
        }
        for mes, grupo in sorted(por_mes.items())
    ]


def clima(lat: float, lon: float, desde: date, hasta: date) -> dict:
    crudo = consultar(lat, lon, desde, hasta)
    dias = serie_diaria(crudo)
    return {
        "fuente": FUENTE,
        "fuentes_originales": crudo.get("header", {}).get("sources", []),
        "resolucion": RESOLUCION,
        "punto": {"lat": lat, "lon": lon},
        "desde": desde.isoformat(),
        "hasta": hasta.isoformat(),
        "resumen": resumir(dias),
        "mensual": mensual(dias),
        "diario": dias,
    }


# --- Climatología de heladas --------------------------------------------------

ANIOS_CLIMATOLOGIA = 20
# Helada meteorológica: mínima a 2 m de 0 °C o menos. En el cultivo puede helar
# con mínimas algo mayores (la hoja se enfría más que el aire), así que el
# calendario es orientativo y del lado optimista.
TEMPERATURA_HELADA = 0.0
PROBABILIDAD_SEGURA = 0.9


@dataclass(frozen=True)
class ClimatologiaHeladas:
    anios: list[int]
    anios_con_helada: int
    # "MM-DD": en el 90 % de los años no heló después (antes) de esta fecha.
    ultima_helada_segura: str | None
    primera_helada_segura: str | None
    anios_sin_helada_despues_de_la_segura: int  # incluye los años sin heladas
    ultima_helada_mas_tardia: str | None  # "YYYY-MM-DD"
    primera_helada_mas_temprana: str | None
    temperatura_helada: float


def dias_con_helada(crudo: dict) -> list[date]:
    minimas = crudo["properties"]["parameter"]["T2M_MIN"]
    return [
        date(int(k[:4]), int(k[4:6]), int(k[6:]))
        for k, v in minimas.items()
        if v != VALOR_FALTANTE and v <= TEMPERATURA_HELADA
    ]


def percentil_de_fechas(fechas: list[date], probabilidad: float, ultima: bool) -> str | None:
    """Fecha "MM-DD" que deja del lado seguro a esa proporción de los años."""
    if not fechas:
        return None
    # Se compara por día del año en un año fijo para que el año no influya.
    ordenadas = sorted(date(2001, f.month, f.day) for f in fechas)
    indice = math.ceil(probabilidad * len(ordenadas)) - 1
    elegida = ordenadas[indice] if ultima else ordenadas[len(ordenadas) - 1 - indice]
    return elegida.strftime("%m-%d")


def calcular_climatologia(heladas: list[date], anios: list[int]) -> ClimatologiaHeladas:
    # En la región pampeana la temporada de heladas va de mayo a septiembre y
    # no cruza el fin de año: la primera y la última de cada año calendario son
    # las de su invierno.
    por_anio = [[h for h in heladas if h.year == anio] for anio in anios]
    primeras = [min(del_anio) for del_anio in por_anio if del_anio]
    ultimas = [max(del_anio) for del_anio in por_anio if del_anio]
    # Un año sin heladas cuenta del lado seguro: no suma fechas al percentil,
    # pero sí al total de años contra el que se mide.
    proporcion = min(PROBABILIDAD_SEGURA * len(anios) / max(len(ultimas), 1), 1.0)
    segura = percentil_de_fechas(ultimas, proporcion, ultima=True)
    sin_helada_despues = len(anios) - sum(1 for u in ultimas if segura and u.strftime("%m-%d") > segura)
    return ClimatologiaHeladas(
        anios=anios,
        anios_con_helada=len(ultimas),
        ultima_helada_segura=segura,
        anios_sin_helada_despues_de_la_segura=sin_helada_despues,
        primera_helada_segura=percentil_de_fechas(primeras, proporcion, ultima=False),
        ultima_helada_mas_tardia=max(ultimas, key=lambda f: (f.month, f.day)).isoformat() if ultimas else None,
        primera_helada_mas_temprana=min(primeras, key=lambda f: (f.month, f.day)).isoformat() if primeras else None,
        temperatura_helada=TEMPERATURA_HELADA,
    )


def climatologia_heladas(lat: float, lon: float, hoy: date) -> ClimatologiaHeladas:
    anios = list(range(hoy.year - ANIOS_CLIMATOLOGIA, hoy.year))
    crudo = consultar(lat, lon, date(anios[0], 1, 1), date(anios[-1], 12, 31), parametros=["T2M_MIN"])
    return calcular_climatologia(dias_con_helada(crudo), anios)
