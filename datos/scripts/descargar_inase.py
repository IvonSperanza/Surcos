"""Descarga el Catálogo Nacional de Cultivares del INASE.

Uso: python -m scripts.descargar_inase

Usa la misma exportación que el botón "Exportar a CSV" de la página pública
https://gestion.inase.gob.ar/registroCultivares/publico/catalogo, sin filtros
(el catálogo completo). Guarda el CSV y, al lado, de dónde y cuándo salió,
para que todo dato derivado pueda citar su fuente.
"""

import csv
import io
import json
import time
from datetime import date
from pathlib import Path

import requests

PAGINA = "https://gestion.inase.gob.ar/registroCultivares/publico/catalogo"
EXPORTAR = "https://gestion.inase.gob.ar/registroCultivares/publico/catalogo/downloadcsv/%7B%7D/surco{marca}"
DESTINO = Path(__file__).resolve().parent.parent / "referencias"


def main() -> None:
    respuesta = requests.get(EXPORTAR.format(marca=int(time.time())), timeout=300, headers={"User-Agent": "Surco (NASA Space Apps 2026)"})
    respuesta.raise_for_status()
    texto = respuesta.content.decode("utf-8")
    filas = list(csv.DictReader(io.StringIO(texto)))

    DESTINO.mkdir(exist_ok=True)
    (DESTINO / "inase_catalogo_cultivares.csv").write_text(texto, encoding="utf-8")
    (DESTINO / "inase_catalogo_cultivares.json").write_text(
        json.dumps(
            {
                "fuente": "INASE · Catálogo Nacional de Cultivares",
                "pagina": PAGINA,
                "descargado": date.today().isoformat(),
                "cultivares": len(filas),
                "inscripcion_mas_reciente": max(f["inscripcion_rnc"] for f in filas if f["inscripcion_rnc"]),
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(len(filas), "cultivares guardados en", DESTINO)


if __name__ == "__main__":
    main()
