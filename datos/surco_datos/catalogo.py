"""Catálogo Nacional de Cultivares del INASE: especies, cultivares y familia botánica.

El CSV lo baja scripts/descargar_inase.py a referencias/. La familia botánica
no viene en el catálogo: se deduce del género del nombre científico, y es lo
que usa la verificación de la rotación (no repetir familia en la parcela).
"""

import csv
import json
import unicodedata
from dataclasses import dataclass
from functools import cache
from pathlib import Path

REFERENCIAS = Path(__file__).resolve().parent.parent / "referencias"
CSV = REFERENCIAS / "inase_catalogo_cultivares.csv"
METADATOS = REFERENCIAS / "inase_catalogo_cultivares.json"

# Grupos del catálogo que usa Surco: lo que se cultiva para vender
# (hortícolas, frutales, que incluyen la vid) y lo que se siembra como
# cobertura o abono verde (forrajeras y cereales: vicia, avena, centeno…).
GRUPOS_CULTIVO = ("HT", "FR")
GRUPOS_COBERTURA = ("FO", "CE")

FAMILIAS = {
    "solanaceas": ("Lycopersicon", "Solanum", "Capsicum"),
    "asteraceas": ("Lactuca", "Cichorium", "Cynara", "Helianthus"),
    "amarantaceas": ("Spinacia", "Beta"),
    "brasicaceas": ("Brassica", "Raphanus", "Eruca"),
    "amarilidaceas": ("Allium",),
    "apiaceas": ("Daucus", "Apium", "Foeniculum", "Petroselinum"),
    "cucurbitaceas": ("Cucurbita", "Curcubita", "Cucumis", "Citrullus"),
    "fabaceas": ("Phaseolus", "Pisum", "Vicia", "Cicer", "Lens", "Lupinus", "Trifolium", "Medicago", "Melilotus", "Lotus", "Glycine", "Vigna", "Macroptilium", "Desmanthus", "Dolichos", "Onobrychis", "Kummerowia", "Leucaena", "Lespedeza", "Stylosanthes"),
    "poaceas": ("Zea", "Avena", "Secale", "Lolium", "Hordeum", "Triticum", "Sorghum", "Setaria", "Panicum", "Festuca", "Bromus", "Dactylis", "Phalaris", "Chloris", "Agropyron", "Paspalum", "Brachiaria", "Poa", "Eragrostis", "Trichloris", "Elytrigia", "Agrostis", "Oryza", "Cenchrus", "Axonopus", "Dichantium", "Digitaria", "xFestulolium", "Arrhenatherum", "Pennisetum", "Acroceras", "Triticale", "×Triticosecale"),
    "rosaceas": ("Prunus", "Malus", "Pyrus", "Fragaria", "Rubus", "Cydonia", "P.salicina"),
    "vitaceas": ("Vitis",),
    "rutaceas": ("Citrus", "Poncirus", "Fortunella"),
    "ericaceas": ("Vaccinium",),
    "oleaceas": ("Olea",),
    "juglandaceas": ("Juglans", "Carya"),
    "betulaceas": ("Corylus",),
    "actinidiaceas": ("Actinidia",),
    "convolvulaceas": ("Ipomoea",),
    "lamiaceas": ("Ocimum", "Ocimun"),
    "asparagaceas": ("Asparagus",),
    "malvaceas": ("Abelmoschus",),
    "poligonaceas": ("Fagopyron", "Fagopyrum"),
}

NOMBRES_FAMILIA = {
    "solanaceas": "Solanáceas",
    "asteraceas": "Asteráceas",
    "amarantaceas": "Amarantáceas",
    "brasicaceas": "Brasicáceas",
    "amarilidaceas": "Amarilidáceas",
    "apiaceas": "Apiáceas",
    "cucurbitaceas": "Cucurbitáceas",
    "fabaceas": "Fabáceas (leguminosas)",
    "poaceas": "Poáceas (gramíneas)",
    "rosaceas": "Rosáceas",
    "vitaceas": "Vitáceas",
    "rutaceas": "Rutáceas",
    "ericaceas": "Ericáceas",
    "oleaceas": "Oleáceas",
    "juglandaceas": "Juglandáceas",
    "betulaceas": "Betuláceas",
    "actinidiaceas": "Actinidiáceas",
    "convolvulaceas": "Convolvuláceas",
    "lamiaceas": "Lamiáceas",
    "asparagaceas": "Asparagáceas",
    "malvaceas": "Malváceas",
    "poligonaceas": "Poligonáceas",
}

FAMILIA_POR_GENERO = {genero.lower(): familia for familia, generos in FAMILIAS.items() for genero in generos}
# El catálogo abrevia algunos géneros ("S. tuberosum"): se resuelven por especie.
FAMILIA_POR_ESPECIE = {"PAPA": "solanaceas", "BERENJENA": "solanaceas", "PORTAINJERTO DE TOMATE INTERESPECIFICO": "solanaceas"}


@dataclass(frozen=True)
class Cultivar:
    numero: str
    nombre: str
    especie: str
    nombre_cientifico: str
    grupo: str
    familia: str | None
    inscripcion: str | None
    solicitante: str | None


def sin_acentos(texto: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", texto) if unicodedata.category(c) != "Mn").upper()


def familia_de(nombre_cientifico: str, especie: str) -> str | None:
    genero = nombre_cientifico.strip().lstrip("(").split(" ")[0].lower()
    return FAMILIA_POR_GENERO.get(genero) or FAMILIA_POR_ESPECIE.get(especie)


@cache
def cultivares() -> tuple[Cultivar, ...]:
    with CSV.open(encoding="utf-8") as archivo:
        return tuple(
            Cultivar(
                numero=fila["numero"],
                nombre=fila["cultivar"].strip(),
                especie=fila["especie"].strip(),
                nombre_cientifico=fila["nombre_cientifico"].strip(),
                grupo=fila["grupo"],
                familia=familia_de(fila["nombre_cientifico"], fila["especie"].strip()),
                inscripcion=fila["inscripcion_rnc"] or None,
                solicitante=fila["solicitante_rnc"] or None,
            )
            for fila in csv.DictReader(archivo)
        )


@cache
def metadatos() -> dict:
    return json.loads(METADATOS.read_text(encoding="utf-8"))


def especies(grupos: tuple[str, ...]) -> list[dict]:
    por_especie: dict[str, dict] = {}
    for c in cultivares():
        if c.grupo not in grupos:
            continue
        actual = por_especie.setdefault(
            c.especie,
            {"especie": c.especie, "nombre_cientifico": c.nombre_cientifico, "familia": c.familia, "grupo": c.grupo, "cultivares": 0},
        )
        actual["cultivares"] += 1
    return sorted(por_especie.values(), key=lambda e: e["especie"])


def buscar_cultivares(especie: str, texto: str = "", limite: int = 20) -> list[Cultivar]:
    buscado = sin_acentos(texto.strip())
    candidatos = [c for c in cultivares() if c.especie == especie and buscado in sin_acentos(c.nombre)]
    # Primero los que empiezan con lo escrito: es lo que el productor espera ver arriba.
    candidatos.sort(key=lambda c: (not sin_acentos(c.nombre).startswith(buscado), c.nombre))
    return candidatos[:limite]
