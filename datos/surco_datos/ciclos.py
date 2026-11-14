"""Ciclos de cultivo y períodos de suelo desnudo a partir de una serie de NDVI.

Un ciclo es un pico de verdor: el cultivo crece (sube el NDVI), llega a su
máximo y se cosecha (cae). Las fechas se informan como ventanas entre dos
pasadas despejadas, porque el satélite no ve la parcela todos los días.
"""

from dataclasses import dataclass
from datetime import date
from typing import Literal

import numpy as np
from scipy.signal import find_peaks

from surco_datos.sentinel2 import NDTI_DESNUDO, NDTI_RASTROJO

# Un cultivo en pie supera este NDVI en su pico; por debajo es maleza rala o
# rastrojo verdeando.
NDVI_MINIMO_PICO = 0.4
# Entre el mínimo y esto, el verde existe pero es ralo: maleza, rebrote o una
# cobertura que no llegó a cerrar. No se presenta como un cultivo.
NDVI_CULTIVO_PLENO = 0.6
# Cuánto tiene que subir y bajar la curva alrededor del pico para contar como
# ciclo propio y no como ruido de una pasada con bruma.
PROMINENCIA_MINIMA = 0.15
# Dos picos más cerca que esto son el mismo cultivo (ej. un día con sombra en
# el medio), no dos ciclos.
DIAS_MINIMOS_ENTRE_PICOS = 30
# Cosechar deja el suelo casi desnudo: si entre dos picos la curva no baja de
# acá, no hubo cosecha sino un bache del mismo cultivo (bruma, estrés).
VALLE_MAXIMO_ENTRE_CICLOS = 0.45
# Fracción de la subida a la que se considera que el cultivo "ya se ve": la
# siembra fue antes, mientras el suelo todavía se veía desnudo.
FRACCION_SIEMBRA = 0.2
# Fracción de la bajada que marca la cosecha: la caída es abrupta, así que la
# mitad del camino ubica bien el corte.
FRACCION_COSECHA = 0.5
# Una pasada que se aparta así de sus dos vecinas, cuando ellas coinciden, es
# casi siempre una nube o sombra que la máscara no detectó.
DESVIO_ATIPICO = 0.3
ACUERDO_VECINAS = 0.1


@dataclass(frozen=True)
class Ventana:
    """El evento ocurrió entre estas dos pasadas despejadas."""

    desde: date
    hasta: date


@dataclass(frozen=True)
class Ciclo:
    numero: int
    tipo: Literal["cultivo", "verdeo_leve"]
    siembra: Ventana | None  # None: ya estaba en pie al empezar el período
    pico: date
    ndvi_pico: float
    cosecha: Ventana | None  # None: seguía en pie al terminar el período
    dias_estimados: int | None


@dataclass(frozen=True)
class PeriodoSinCultivo:
    desde: date  # primera pasada vista sin cultivo
    hasta: date  # última pasada vista sin cultivo
    dias_estimados: int
    # Qué cubría el suelo, según el NDTI de cada pasada del período. Los días
    # se reparten en proporción a las pasadas de cada clase.
    cobertura: Literal["rastrojo", "desnudo", "incierta", "mixta"]
    dias_rastrojo: int
    dias_desnudo: int
    dias_inciertos: int


@dataclass(frozen=True)
class AnalisisCiclos:
    ciclos: list[Ciclo]
    sin_cultivo: list[PeriodoSinCultivo]
    dias_sin_cultivo: int
    dias_suelo_desnudo: int
    dias_con_rastrojo: int
    dias_inciertos: int
    pasadas_atipicas: list[date]


def pasadas_atipicas(valores: np.ndarray) -> np.ndarray:
    atipica = np.zeros(len(valores), dtype=bool)
    for i in range(1, len(valores) - 1):
        anterior, actual, siguiente = valores[i - 1 : i + 2]
        vecinas_coinciden = abs(anterior - siguiente) < ACUERDO_VECINAS
        atipica[i] = vecinas_coinciden and abs(actual - (anterior + siguiente) / 2) > DESVIO_ATIPICO
    return atipica


def picos(fechas: list[date], valores: np.ndarray) -> list[int]:
    indices, _ = find_peaks(valores, height=NDVI_MINIMO_PICO, prominence=PROMINENCIA_MINIMA)
    elegidos: list[int] = []
    for i in indices:
        if elegidos and es_mismo_cultivo(fechas, valores, elegidos[-1], int(i)):
            if valores[i] > valores[elegidos[-1]]:
                elegidos[-1] = int(i)
            continue
        elegidos.append(int(i))
    return elegidos


def es_mismo_cultivo(fechas: list[date], valores: np.ndarray, pico_anterior: int, pico: int) -> bool:
    muy_cerca = (fechas[pico] - fechas[pico_anterior]).days < DIAS_MINIMOS_ENTRE_PICOS
    sin_cosecha = valores[pico_anterior : pico + 1].min() > VALLE_MAXIMO_ENTRE_CICLOS
    return muy_cerca or sin_cosecha


def ventana_de_subida(fechas: list[date], valores: np.ndarray, base: int, pico: int) -> Ventana | None:
    umbral = valores[base] + FRACCION_SIEMBRA * (valores[pico] - valores[base])
    for j in range(base + 1, pico + 1):
        if valores[j] >= umbral:
            return Ventana(fechas[j - 1], fechas[j])
    return None


def ventana_de_bajada(fechas: list[date], valores: np.ndarray, pico: int, base: int) -> Ventana | None:
    umbral = valores[base] + FRACCION_COSECHA * (valores[pico] - valores[base])
    for j in range(pico, base):
        if valores[j + 1] < umbral:
            return Ventana(fechas[j], fechas[j + 1])
    return None


def medio(ventana: Ventana) -> date:
    return ventana.desde + (ventana.hasta - ventana.desde) / 2


def detectar_ciclos(fechas: list[date], valores: np.ndarray) -> list[Ciclo]:
    indices_pico = picos(fechas, valores)
    ciclos: list[Ciclo] = []
    for n, pico in enumerate(indices_pico):
        inicio = indices_pico[n - 1] if n > 0 else 0
        fin = indices_pico[n + 1] if n + 1 < len(indices_pico) else len(valores) - 1
        base_izquierda = inicio + int(np.argmin(valores[inicio : pico + 1]))
        base_derecha = pico + int(np.argmin(valores[pico : fin + 1]))

        # Si la curva no bajó lo suficiente antes (o después) del pico, el
        # período empezó (o terminó) con el cultivo ya en pie.
        hubo_siembra = valores[pico] - valores[base_izquierda] >= PROMINENCIA_MINIMA and base_izquierda < pico
        hubo_cosecha = valores[pico] - valores[base_derecha] >= PROMINENCIA_MINIMA and base_derecha > pico
        siembra = ventana_de_subida(fechas, valores, base_izquierda, pico) if hubo_siembra else None
        cosecha = ventana_de_bajada(fechas, valores, pico, base_derecha) if hubo_cosecha else None

        dias = (medio(cosecha) - medio(siembra)).days if siembra and cosecha else None
        tipo = "cultivo" if valores[pico] >= NDVI_CULTIVO_PLENO else "verdeo_leve"
        ciclos.append(Ciclo(n + 1, tipo, siembra, fechas[pico], round(float(valores[pico]), 3), cosecha, dias))
    return ciclos


def cobertura_de_pasada(ndti: float) -> str:
    if ndti >= NDTI_RASTROJO:
        return "rastrojo"
    if ndti <= NDTI_DESNUDO:
        return "desnudo"
    return "incierta"


def periodo_sin_cultivo(fechas: list[date], ndti: np.ndarray, i: int, j: int) -> PeriodoSinCultivo:
    # El período real empezó en algún momento entre la última pasada con
    # cultivo y la primera sin él: se toma la mitad de cada hueco.
    comienzo = medio(Ventana(fechas[i - 1], fechas[i])) if i > 0 else fechas[i]
    final = medio(Ventana(fechas[j], fechas[j + 1])) if j + 1 < len(fechas) else fechas[j]
    dias = max((final - comienzo).days, 1)

    clases = [cobertura_de_pasada(v) for v in ndti[i : j + 1]]
    cuenta = {c: clases.count(c) for c in ("rastrojo", "desnudo", "incierta")}
    dias_por_clase = {c: round(dias * n / len(clases)) for c, n in cuenta.items()}
    dominante = max(cuenta, key=cuenta.get)
    cobertura = dominante if cuenta[dominante] > len(clases) / 2 else "mixta"
    return PeriodoSinCultivo(
        fechas[i], fechas[j], dias, cobertura, dias_por_clase["rastrojo"], dias_por_clase["desnudo"], dias_por_clase["incierta"]
    )


def detectar_sin_cultivo(fechas: list[date], ndvi: np.ndarray, ndti: np.ndarray, umbral: float) -> list[PeriodoSinCultivo]:
    periodos: list[PeriodoSinCultivo] = []
    i = 0
    while i < len(ndvi):
        if ndvi[i] >= umbral:
            i += 1
            continue
        j = i
        while j + 1 < len(ndvi) and ndvi[j + 1] < umbral:
            j += 1
        periodos.append(periodo_sin_cultivo(fechas, ndti, i, j))
        i = j + 1
    return periodos


def analizar(fechas: list[date], ndvi: list[float], ndti: list[float], umbral_sin_cultivo: float) -> AnalisisCiclos:
    valores = np.array(ndvi, dtype=float)
    atipica = pasadas_atipicas(valores)
    fechas_limpias = [f for f, a in zip(fechas, atipica) if not a]
    valores_limpios = valores[~atipica]
    ndti_limpio = np.array(ndti, dtype=float)[~atipica]

    sin_cultivo = detectar_sin_cultivo(fechas_limpias, valores_limpios, ndti_limpio, umbral_sin_cultivo)
    return AnalisisCiclos(
        ciclos=detectar_ciclos(fechas_limpias, valores_limpios),
        sin_cultivo=sin_cultivo,
        dias_sin_cultivo=sum(p.dias_estimados for p in sin_cultivo),
        dias_suelo_desnudo=sum(p.dias_desnudo for p in sin_cultivo),
        dias_con_rastrojo=sum(p.dias_rastrojo for p in sin_cultivo),
        dias_inciertos=sum(p.dias_inciertos for p in sin_cultivo),
        pasadas_atipicas=[f for f, a in zip(fechas, atipica) if a],
    )
