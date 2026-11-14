"""Caché en disco de respuestas: las fuentes satelitales tardan del orden de un minuto."""

import hashlib
import json
from collections.abc import Callable
from pathlib import Path
from typing import Any

DIRECTORIO = Path(__file__).resolve().parent.parent / ".cache"


def clave(*partes: Any) -> str:
    texto = json.dumps(partes, sort_keys=True, default=str)
    return hashlib.sha1(texto.encode()).hexdigest()


def con_cache(espacio: str, clave_: str, calcular: Callable[[], Any]) -> Any:
    ruta = DIRECTORIO / espacio / f"{clave_}.json"
    if ruta.exists():
        return json.loads(ruta.read_text())

    valor = calcular()
    ruta.parent.mkdir(parents=True, exist_ok=True)
    ruta.write_text(json.dumps(valor, default=str))
    return valor
