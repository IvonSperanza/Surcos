"""Insights operables de una parcela: reglas deterministas con evidencia.

Cada regla mira hechos ya medidos (pasadas de Sentinel-2, ciclos detectados,
clima diario, climatología de heladas) y devuelve un Insight con su evidencia
y su confianza, o un Descartado que explica por qué no se puede afirmar. Los
textos salen de plantillas: ningún número aparece en un texto sin estar en la
evidencia.
"""

from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Literal

from surco_datos.ciclos import cobertura_de_pasada
from surco_datos.power import ClimatologiaHeladas
from surco_datos.sentinel2 import NDVI_CULTIVO

VERSION_REGLAS = "1.0"

FUENTE_S2 = "Sentinel-2 L2A"
FUENTE_POWER = "NASA POWER"

LLUVIA_FUERTE_MM = 50
# Distancia máxima entre la tormenta y la pasada más lejana de las dos que la
# rodean, para afirmar cómo estaba el suelo ese día.
DIAS_PASADA_CONFIANZA_ALTA = 10
DIAS_PASADA_CONFIANZA_MEDIA = 20
# Un hueco con el suelo desnudo desde este largo se señala como ventana para
# una cobertura. Es un criterio de Surco, no un dato agronómico citado.
HUECO_LARGO_DIAS = 30
# Para afirmar el largo de un hueco, el satélite no puede haber dejado de ver
# la parcela más que esto entre dos pasadas.
MAX_DIAS_ENTRE_PASADAS_ALTA = 15
MAX_DIAS_ENTRE_PASADAS_MEDIA = 30
DIAS_DESPUES_DE_COSECHA = 30

MESES = ("ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic")

Tipo = Literal["alerta", "oportunidad", "bien", "planificar"]
Confianza = Literal["alta", "media", "baja"]


@dataclass(frozen=True)
class Evidencia:
    dato: str
    fuente: str
    fecha: str | None = None
    escena: str | None = None


@dataclass(frozen=True)
class Insight:
    id: str
    tipo: Tipo
    titulo: str
    hallazgo: str
    accion: str
    confianza: Confianza
    motivo_confianza: str
    evidencia: list[Evidencia] = field(default_factory=list)
    version_regla: str = VERSION_REGLAS


@dataclass(frozen=True)
class Descartado:
    id: str
    motivo: str


Resultado = Insight | Descartado


# --- Ayudas -----------------------------------------------------------------


def texto_fecha(f: date | str, con_anio: bool = True) -> str:
    f = date.fromisoformat(f) if isinstance(f, str) else f
    return f"{f.day} {MESES[f.month - 1]}" + (f" {f.year}" if con_anio else "")


def texto_duracion(dias: int) -> str:
    if dias < 14:
        return f"unos {dias} días"
    if dias < 60:
        return f"unas {round(dias / 7)} semanas"
    return f"unos {round(dias / 30)} meses"


def cobertura(pasada: dict) -> str:
    return "cultivo" if pasada["ndvi"] >= NDVI_CULTIVO else cobertura_de_pasada(pasada["ndti"])


def evidencia_de_pasada(pasada: dict) -> Evidencia:
    return Evidencia(
        dato=f"{cobertura(pasada)} · NDVI {pasada['ndvi']:.2f} · NDTI {pasada['ndti']:.2f}",
        fuente=FUENTE_S2,
        fecha=str(pasada["fecha"]),
        escena=pasada["escena"],
    )


def fecha_de(pasada: dict) -> date:
    return date.fromisoformat(str(pasada["fecha"]))


def confianza_por_distancia(dias: int) -> Confianza:
    if dias <= DIAS_PASADA_CONFIANZA_ALTA:
        return "alta"
    return "media" if dias <= DIAS_PASADA_CONFIANZA_MEDIA else "baja"


def bajar(confianza: Confianza) -> Confianza:
    return {"alta": "media", "media": "baja", "baja": "baja"}[confianza]


def mayor_hueco(fechas: list[date]) -> int:
    return max(((b - a).days for a, b in zip(fechas, fechas[1:])), default=0)


# --- Regla 1: tormentas fuertes y estado del suelo ----------------------------


def pasadas_alrededor(pasadas: list[dict], dia: date) -> tuple[dict | None, dict | None]:
    antes = [p for p in pasadas if fecha_de(p) <= dia]
    despues = [p for p in pasadas if fecha_de(p) >= dia]
    return (antes[-1] if antes else None), (despues[0] if despues else None)


def tormenta(dia_clima: dict, pasadas: list[dict]) -> Resultado:
    dia = date.fromisoformat(dia_clima["fecha"])
    lluvia = dia_clima["lluvia_mm"]
    id_regla = f"tormenta_{dia.isoformat()}"
    antes, despues = pasadas_alrededor(pasadas, dia)
    if antes is None or despues is None:
        return Descartado(id_regla, f"Tormenta del {texto_fecha(dia)}: no hay pasadas del satélite de los dos lados para saber cómo estaba el suelo.")

    distancia = max((dia - fecha_de(antes)).days, (fecha_de(despues) - dia).days)
    confianza = confianza_por_distancia(distancia)
    estados = {cobertura(antes), cobertura(despues)}
    evidencia = [
        Evidencia(dato=f"lluvia {lluvia:.0f} mm en el día", fuente=f"{FUENTE_POWER} (celda de ~50 km)", fecha=dia.isoformat()),
        evidencia_de_pasada(antes),
        evidencia_de_pasada(despues),
    ]
    motivo = f"pasadas despejadas a {distancia} días o menos de la tormenta, antes y después; la lluvia es la de la zona"

    if estados == {"incierta"}:
        return Descartado(id_regla, f"Tormenta del {texto_fecha(dia)}: el satélite vio la parcela sin cultivo, pero no alcanza para distinguir si tenía rastrojo o estaba desnuda.")

    if estados <= {"desnudo", "incierta"}:
        confianza = confianza if estados == {"desnudo"} else bajar(confianza)
        if confianza == "baja":
            return Descartado(id_regla, f"Tormenta del {texto_fecha(dia)}: las pasadas quedan lejos o no alcanzan para afirmar que el suelo estaba desnudo.")
        return Insight(
            id=id_regla,
            tipo="alerta",
            titulo="Tormenta fuerte con el suelo desnudo",
            hallazgo=f"El {texto_fecha(dia)} llovieron {lluvia:.0f} mm en la zona y tu parcela estaba con el suelo desnudo.",
            accion="Con el suelo desnudo, una lluvia así arrastra la capa de arriba, que es la más fértil. Entre ciclos, dejá el rastrojo o sembrá una cobertura.",
            confianza=confianza,
            motivo_confianza=motivo,
            evidencia=evidencia,
        )

    if estados <= {"cultivo", "rastrojo"}:
        if confianza == "baja":
            return Descartado(id_regla, f"Tormenta del {texto_fecha(dia)}: las pasadas quedan lejos para afirmar cómo estaba el suelo.")
        return Insight(
            id=id_regla,
            tipo="bien",
            titulo="La tormenta encontró el suelo cubierto",
            hallazgo=f"El {texto_fecha(dia)} llovieron {lluvia:.0f} mm en la zona y tu parcela estaba cubierta con {' y '.join(sorted(estados))}.",
            accion="Así el suelo aguanta la lluvia sin perder la capa de arriba. Seguí manteniéndolo cubierto.",
            confianza=confianza,
            motivo_confianza=motivo,
            evidencia=evidencia,
        )

    return Descartado(id_regla, f"Tormenta del {texto_fecha(dia)}: la cobertura cambió entre la pasada de antes y la de después (por ejemplo, una cosecha), así que no sabemos cómo la encontró.")


def tormentas(pasadas: list[dict], diario: list[dict]) -> list[Resultado]:
    fuertes = [d for d in diario if d["lluvia_mm"] is not None and d["lluvia_mm"] >= LLUVIA_FUERTE_MM]
    return [tormenta(d, pasadas) for d in fuertes]


# --- Regla 2: huecos largos con el suelo desnudo ------------------------------


def hueco_largo(periodo: dict, pasadas: list[dict]) -> Resultado:
    desde, hasta = date.fromisoformat(str(periodo["desde"])), date.fromisoformat(str(periodo["hasta"]))
    id_regla = f"hueco_{desde.isoformat()}"
    # Las pasadas que lo delimitan (la última con cultivo antes y la primera
    # después) también cuentan para saber cuánto tiempo no se vio la parcela.
    antes, _ = pasadas_alrededor(pasadas, desde - timedelta(days=1))
    _, despues = pasadas_alrededor(pasadas, hasta + timedelta(days=1))
    dentro = [p for p in pasadas if desde <= fecha_de(p) <= hasta]
    fechas = [fecha_de(p) for p in [antes, *dentro, despues] if p is not None]
    hueco = mayor_hueco(fechas)

    if len(dentro) >= 2 and hueco <= MAX_DIAS_ENTRE_PASADAS_ALTA:
        confianza: Confianza = "alta"
    elif hueco <= MAX_DIAS_ENTRE_PASADAS_MEDIA:
        confianza = "media"
    else:
        return Descartado(id_regla, f"Suelo desnudo desde el {texto_fecha(desde)}: el satélite dejó de ver la parcela {hueco} días seguidos, no podemos medir bien cuánto duró.")

    rango = f"alrededor del {texto_fecha(desde)}" if desde == hasta else f"del {texto_fecha(desde)} al {texto_fecha(hasta)}"
    sin_cultivo = texto_duracion(periodo["dias_estimados"])
    desnudo = texto_duracion(periodo["dias_desnudo"])
    hallazgo = (
        f"{rango[0].upper()}{rango[1:]} tu parcela estuvo {sin_cultivo} sin cultivo, y {desnudo} de ese tiempo con el suelo desnudo."
        if periodo["dias_desnudo"] < periodo["dias_estimados"]
        else f"{rango[0].upper()}{rango[1:]} tu parcela estuvo {sin_cultivo} sin cultivo y con el suelo desnudo."
    )
    return Insight(
        id=id_regla,
        tipo="oportunidad",
        titulo="Una ventana para cubrir el suelo",
        hallazgo=hallazgo,
        accion="Si este hueco se repite cada año, se puede planificar una cobertura o un abono verde para esa ventana: protege el suelo de la lluvia y el viento y le suma materia orgánica.",
        confianza=confianza,
        motivo_confianza=f"{len(dentro)} pasadas despejadas en el período; el satélite nunca dejó de verla más de {hueco} días",
        evidencia=[evidencia_de_pasada(p) for p in dentro],
    )


def huecos(analisis: dict, pasadas: list[dict]) -> list[Resultado]:
    largos = [p for p in analisis["sin_cultivo"] if p["dias_desnudo"] >= HUECO_LARGO_DIAS]
    return [hueco_largo(p, pasadas) for p in largos]


# --- Regla 3: qué pasó con el suelo después de cada cosecha ---------------------


def despues_de_cosecha(ciclo: dict, pasadas: list[dict]) -> tuple[str, list[dict]]:
    inicio = date.fromisoformat(str(ciclo["cosecha"]["desde"]))
    fin = date.fromisoformat(str(ciclo["cosecha"]["hasta"])) + timedelta(days=DIAS_DESPUES_DE_COSECHA)
    siguientes = [p for p in pasadas if inicio < fecha_de(p) <= fin]
    estados = [cobertura(p) for p in siguientes]
    if not estados:
        return "sin_dato", siguientes
    sin_cultivo = [e for e in estados if e != "cultivo"]
    if not sin_cultivo:
        return "encadenado", siguientes
    dominante = max(set(sin_cultivo), key=sin_cultivo.count)
    return (dominante if sin_cultivo.count(dominante) > len(sin_cultivo) / 2 else "incierta"), siguientes


def manejo_despues_de_cosechas(analisis: dict, pasadas: list[dict]) -> list[Resultado]:
    cosechas = [c for c in analisis["ciclos"] if c["tipo"] == "cultivo" and c["cosecha"]]
    if not cosechas:
        return [Descartado("despues_de_cosecha", "No se detectó ninguna cosecha completa en el período.")]

    resultados = [(c, *despues_de_cosecha(c, pasadas)) for c in cosechas]
    con_dato = [(c, estado, ps) for c, estado, ps in resultados if estado not in ("sin_dato", "incierta")]
    cubiertas = [(c, estado, ps) for c, estado, ps in con_dato if estado in ("rastrojo", "encadenado")]
    if not cubiertas:
        return []  # Las cosechas que dejaron el suelo desnudo ya las cuenta la regla de huecos.

    rastrojo = sum(1 for _, e, _ in cubiertas if e == "rastrojo")
    encadenado = len(cubiertas) - rastrojo
    detalle = [texto for n, texto in ((rastrojo, "con rastrojo"), (encadenado, "con el cultivo siguiente")) if n > 0]
    # El rastrojo depende del NDTI, con umbrales todavía provisorios: si alguna
    # cosecha se apoya en él, la confianza no pasa de media.
    confianza: Confianza = "media" if rastrojo > 0 else "alta"
    return [
        Insight(
            id="despues_de_cosecha",
            tipo="bien",
            titulo="El suelo quedó cubierto después de cosechar",
            hallazgo=(
                f"Después de la única cosecha el suelo siguió cubierto: {' y '.join(detalle)}."
                if len(cosechas) == 1
                else f"Después de {len(cubiertas)} de {len(cosechas)} cosechas el suelo siguió cubierto: {' y '.join(detalle)}."
            ),
            accion="Es una de las prácticas que Surco verifica: dejar el rastrojo o encadenar el cultivo siguiente protege el suelo entre ciclos.",
            confianza=confianza,
            motivo_confianza="el rastrojo se detecta con el índice NDTI, con umbrales todavía provisorios" if rastrojo else "se ve el cultivo siguiente en las pasadas posteriores a la cosecha",
            evidencia=[evidencia_de_pasada(p) for _, _, ps in cubiertas for p in ps[:2]],
        )
    ]


# --- Regla 4: calendario de heladas de la zona ----------------------------------


def calendario_heladas(clima: ClimatologiaHeladas) -> list[Resultado]:
    if clima.ultima_helada_segura is None:
        return [Descartado("calendario_heladas", "En la zona no hubo heladas en los últimos años: no hace falta un calendario.")]

    def a_fecha(mm_dd: str) -> date:
        return date(2001, int(mm_dd[:2]), int(mm_dd[3:]))

    total = len(clima.anios)
    ultima = a_fecha(clima.ultima_helada_segura)
    primera = a_fecha(clima.primera_helada_segura) if clima.primera_helada_segura else None
    desde, hasta = clima.anios[0], clima.anios[-1]
    hallazgo = (
        f"En los últimos {total} años ({desde}–{hasta}), en tu zona heló hasta el {texto_fecha(ultima, con_anio=False)} "
        f"o antes en {clima.anios_sin_helada_despues_de_la_segura} de esos {total} años."
    )
    if clima.ultima_helada_mas_tardia:
        hallazgo += f" La helada más tardía fue el {texto_fecha(clima.ultima_helada_mas_tardia)}."
    accion = f"Para cultivos que no aguantan la helada, planificá el trasplante después del {texto_fecha(ultima, con_anio=False)}."
    if primera:
        accion += f" En otoño, las heladas pueden empezar desde el {texto_fecha(primera, con_anio=False)}."

    return [
        Insight(
            id="calendario_heladas",
            tipo="planificar",
            titulo="Cuándo deja de helar en tu zona",
            hallazgo=hallazgo,
            accion=accion,
            confianza="media",
            motivo_confianza=f"{total} años de datos, pero es la temperatura del aire de la zona (celda de ~50 km): en los bajos de cada lote puede helar más tarde",
            evidencia=[
                Evidencia(
                    dato=f"{clima.anios_con_helada} de {total} años con heladas (mínima ≤ {clima.temperatura_helada:.0f} °C)",
                    fuente=f"{FUENTE_POWER} (T2M_MIN diaria)",
                    fecha=f"{desde}-01-01/{hasta}-12-31",
                )
            ],
        )
    ]


# --- Todo junto ------------------------------------------------------------------

ORDEN_TIPOS = {"alerta": 0, "oportunidad": 1, "bien": 2, "planificar": 3}


def generar(pasadas: list[dict], analisis: dict, diario: list[dict], heladas: ClimatologiaHeladas) -> dict:
    resultados = [
        *tormentas(pasadas, diario),
        *huecos(analisis, pasadas),
        *manejo_despues_de_cosechas(analisis, pasadas),
        *calendario_heladas(heladas),
    ]
    insights = [r for r in resultados if isinstance(r, Insight)]
    return {
        "version_reglas": VERSION_REGLAS,
        "insights": sorted(insights, key=lambda i: ORDEN_TIPOS[i.tipo]),
        "descartados": [r for r in resultados if isinstance(r, Descartado)],
    }
