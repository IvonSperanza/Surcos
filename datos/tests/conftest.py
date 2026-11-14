"""Lotes reales del oeste de Rosario (Sentinel-2, 01/11/2025–13/11/2026) como datos fijos.

Interpretación esperada de cada lote, leída de la imagen y de la curva (no
hay datos de campo): A franjas con ciclos y rastrojo; B canteros mezclados;
C casco de la quinta (techos y patio); D doble cultivo extensivo; E
monocultivo extensivo de verano; F canteros junto al casco.
"""

import csv
from datetime import date
from pathlib import Path

import pytest

from surco_datos import ciclos
from surco_datos.sentinel2 import NDVI_CULTIVO

FIXTURES = Path(__file__).parent / "fixtures"


def cargar_pasadas(nombre: str) -> list[dict]:
    with (FIXTURES / f"{nombre}.csv").open() as f:
        return [
            {**fila, "ndvi": float(fila["ndvi"]), "ndti": float(fila["ndti"]), "fecha": fila["fecha"]}
            for fila in csv.DictReader(f)
        ]


def analizar(pasadas: list[dict]) -> dict:
    from dataclasses import asdict

    resultado = ciclos.analizar(
        [date.fromisoformat(p["fecha"]) for p in pasadas],
        [p["ndvi"] for p in pasadas],
        [p["ndti"] for p in pasadas],
        NDVI_CULTIVO,
    )
    return asdict(resultado)


@pytest.fixture
def lote():
    def _lote(nombre: str) -> tuple[list[dict], dict]:
        pasadas = cargar_pasadas(nombre)
        return pasadas, analizar(pasadas)

    return _lote
