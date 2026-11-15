"""Contraste de los eventos declarados por el productor con lo que vio el satélite.

Cada evento vuelve con un veredicto y la medición que lo respalda: el índice
que tendría que cambiar, su valor en la pasada despejada de antes y en la de
después. Como en insights.py, los textos salen de plantillas y todo número que
aparece en un texto está en la medición o en la evidencia.

Los umbrales de cambio son criterios de Surco, todavía provisorios: no son
valores agronómicos citados.
"""

from collections.abc import Callable
from dataclasses import dataclass, field, replace
from datetime import date, timedelta
from typing import Literal

from surco_datos.insights import FUENTE_POWER, FUENTE_S2, Confianza, Evidencia, bajar, texto_fecha
from surco_datos.sentinel2 import NDTI_RASTROJO, NDVI_CULTIVO

VERSION_REGLAS = "1.0"

# La pasada de antes y la de después no pueden quedar más lejos que esto del
# evento: si no, el cambio puede deberse a cualquier otra cosa del medio.
DIAS_MAX_PASADA = 20
# Hasta acá la confianza es la máxima de la regla; más lejos, baja un escalón.
DIAS_PASADA_CERCANA = 10
# Un trasplante se ve en 2–4 semanas; una siembra directa, en 4–8.
DIAS_VER_SIEMBRA = 56
# La ventana de siembra que detectó ciclos.py puede quedar hasta esto antes del
# evento declarado (la siembra se ve cuando el cultivo ya cubre algo de suelo).
DIAS_SIEMBRA_ANTES = 14
DIAS_HOLGURA_COSECHA = 10
DIAS_VER_RIEGO = 12
DIAS_VER_FERTILIZACION = (14, 42)
DIAS_HELADA_ANTES = 2

SUBA_NDVI_SIEMBRA = 0.15
CAIDA_NDVI = 0.15
CAIDA_NDTI_LABRANZA = 0.03
SUBA_BSI_LABRANZA = 0.05
SUBA_NDMI_RIEGO = 0.05
SUBA_NDRE_FERTILIZACION = 0.05
NDVI_YA_VERDE = 0.6
LLUVIA_QUE_CONFUNDE_MM = 10
TEMPERATURA_HELADA = 0.0

# "indicio": el satélite ve algo compatible, pero no alcanza para confirmar
# (la clorofila también sube cuando el cultivo crece solo).
Veredicto = Literal["confirma", "indicio", "no_se_ve", "sin_pasadas", "declarado"]
Indice = Literal["ndvi", "ndti", "ndmi", "ndre", "bsi", "temperatura_minima"]

NOMBRES_INDICE: dict[str, str] = {
    "ndvi": "Verde (NDVI)",
    "ndti": "Rastrojo (NDTI)",
    "ndmi": "Agua en la planta (NDMI)",
    "ndre": "Clorofila (NDRE)",
    "bsi": "Suelo expuesto (BSI)",
    "temperatura_minima": "Temperatura mínima (°C)",
}

# Lo que se espera ver de cada evento: va en la ficha aunque no haya pasadas.
SENAL_ESPERADA: dict[str, str] = {
    "siembra": "El verde sube en las semanas siguientes",
    "cosecha": "El verde cae de golpe",
    "labranza": "Se va el rastrojo y queda el suelo expuesto",
    "cobertura": "Aparece verde en un período sin cultivo",
    "incorporacion": "Baja el verde y queda rastrojo o suelo trabajado",
    "riego": "Sube el agua en la planta",
    "fertilizacion": "Sube la clorofila semanas después",
    "dano_climatico": "La mínima de la zona llega a 0 °C",
    "fitosanitario": "Nada: no se ve desde el espacio",
    "desmalezado": "Casi nada: no se ve desde el espacio",
    "foto": "No es un dato del satélite",
}


@dataclass(frozen=True)
class Punto:
    fecha: str
    valor: float
    escena: str | None = None


@dataclass(frozen=True)
class Medicion:
    indice: Indice
    nombre: str
    antes: Punto | None
    despues: Punto
    # El cambio mínimo que la regla pide para confirmar (con su signo).
    cambio_esperado: float | None


@dataclass(frozen=True)
class Contraste:
    evento_id: str
    tipo: str
    fecha: str
    veredicto: Veredicto
    titulo: str
    hallazgo: str
    senal_esperada: str
    confianza: Confianza | None = None
    motivo_confianza: str | None = None
    medicion: Medicion | None = None
    evidencia: list[Evidencia] = field(default_factory=list)


@dataclass(frozen=True)
class Datos:
    """Lo medido en la parcela, ya sin las pasadas atípicas."""

    pasadas: list[dict]
    ciclos: list[dict]
    diario: list[dict]


TITULOS: dict[Veredicto, str] = {
    "confirma": "El satélite lo confirma",
    "indicio": "Hay un indicio",
    "no_se_ve": "No se ve en los datos",
    "sin_pasadas": "Sin imágenes cerca",
    "declarado": "Dato del productor",
}


# --- Ayudas -------------------------------------------------------------------


def fecha_de(pasada: dict) -> date:
    return date.fromisoformat(str(pasada["fecha"]))


def pasada_antes(pasadas: list[dict], dia: date) -> dict | None:
    previas = [p for p in pasadas if dia - timedelta(days=DIAS_MAX_PASADA) <= fecha_de(p) < dia]
    return previas[-1] if previas else None


def pasada_despues(pasadas: list[dict], dia: date, dias: int = DIAS_MAX_PASADA) -> dict | None:
    siguientes = [p for p in pasadas if dia < fecha_de(p) <= dia + timedelta(days=dias)]
    return siguientes[0] if siguientes else None


def pasadas_entre(pasadas: list[dict], desde: date, hasta: date) -> list[dict]:
    return [p for p in pasadas if desde < fecha_de(p) <= hasta]


def pasada_del_dia(pasadas: list[dict], dia: str) -> dict | None:
    return next((p for p in pasadas if str(p["fecha"]) == str(dia)), None)


def punto(pasada: dict, indice: str) -> Punto:
    return Punto(str(pasada["fecha"]), round(float(pasada[indice]), 3), pasada["escena"])


def medicion(indice: Indice, antes: dict | None, despues: dict, cambio_esperado: float | None) -> Medicion:
    return Medicion(indice, NOMBRES_INDICE[indice], punto(antes, indice) if antes else None, punto(despues, indice), cambio_esperado)


def evidencia_de(pasada: dict, *indices: str) -> Evidencia:
    dato = " · ".join(f"{i.upper()} {numero(pasada[i])}" for i in indices)
    return Evidencia(dato=dato, fuente=FUENTE_S2, fecha=str(pasada["fecha"]), escena=pasada["escena"])


def numero(valor: float) -> str:
    return f"{valor:.2f}".replace(".", ",")


def grados(valor: float) -> str:
    return f"{valor:.1f} °C".replace(".", ",")


def texto_ventana(desde: str, hasta: str) -> str:
    """"entre el 1 y el 11 mar 2026", sin repetir mes y año."""
    a, b = date.fromisoformat(str(desde)), date.fromisoformat(str(hasta))
    if (a.year, a.month) == (b.year, b.month):
        return f"entre el {a.day} y el {texto_fecha(b)}"
    if a.year == b.year:
        return f"entre el {texto_fecha(a, con_anio=False)} y el {texto_fecha(b)}"
    return f"entre el {texto_fecha(a)} y el {texto_fecha(b)}"


def dias_hasta(dia: date, pasada: dict) -> int:
    return abs((fecha_de(pasada) - dia).days)


def confianza_por_cercania(maxima: Confianza, dia: date, *pasadas: dict) -> Confianza:
    lejos = max(dias_hasta(dia, p) for p in pasadas) > DIAS_PASADA_CERCANA
    return bajar(maxima) if lejos else maxima


def motivo_cercania(dia: date, *pasadas: dict) -> str:
    return f"imágenes sin nubes a {max(dias_hasta(dia, p) for p in pasadas)} días o menos del evento"


def contraste(evento: dict, veredicto: Veredicto, hallazgo: str, **resto) -> Contraste:
    return Contraste(
        evento_id=evento["id"],
        tipo=evento["tipo"],
        fecha=evento["fecha"],
        veredicto=veredicto,
        titulo=TITULOS[veredicto],
        hallazgo=hallazgo,
        senal_esperada=SENAL_ESPERADA.get(evento["tipo"], ""),
        **resto,
    )


def sin_pasadas(evento: dict, dias: int = DIAS_MAX_PASADA) -> Contraste:
    return contraste(evento, "sin_pasadas", f"No hay imágenes sin nubes de la parcela a menos de {dias} días del {texto_fecha(evento['fecha'])}, así que no se puede comparar el antes con el después.")


def todavia_pronto(evento: dict, hoy: date) -> Contraste:
    return contraste(evento, "sin_pasadas", f"Todavía es pronto: el cambio se ve unas semanas después, y la última imagen sin nubes es del {texto_fecha(hoy)}.")


def comparar_antes_y_despues(
    evento: dict,
    datos: Datos,
    indice: Indice,
    cambio_esperado: float,
    confirma: Callable[[dict, dict], bool],
    maxima: Confianza,
    textos: tuple[str, str],
    dias_despues: int = DIAS_MAX_PASADA,
    indices_evidencia: tuple[str, ...] = (),
) -> Contraste:
    """La regla común: una pasada de cada lado, cerca, y un cambio en un índice."""
    dia = date.fromisoformat(evento["fecha"])
    antes, despues = pasada_antes(datos.pasadas, dia), pasada_despues(datos.pasadas, dia, dias_despues)
    if antes is None or despues is None:
        return sin_pasadas(evento, dias_despues if antes else DIAS_MAX_PASADA)

    medido = medicion(indice, antes, despues, cambio_esperado)
    medida = f"el {indice.upper()} pasó de {numero(medido.antes.valor)} a {numero(medido.despues.valor)}"
    cuando = texto_ventana(antes["fecha"], despues["fecha"]).capitalize()
    evidencia = [evidencia_de(antes, indice, *indices_evidencia), evidencia_de(despues, indice, *indices_evidencia)]
    si, no = textos
    if confirma(antes, despues):
        return contraste(
            evento,
            "confirma",
            f"{cuando} {si}: {medida}.",
            confianza=confianza_por_cercania(maxima, dia, antes, despues),
            motivo_confianza=motivo_cercania(dia, antes, despues),
            medicion=medido,
            evidencia=evidencia,
        )
    return contraste(evento, "no_se_ve", f"{cuando} {no}: {medida}.", medicion=medido, evidencia=evidencia)


# --- Siembra y cobertura ---------------------------------------------------------


def ciclo_que_empieza_cerca(ciclos: list[dict], dia: date, dias_despues: int) -> dict | None:
    for ciclo in ciclos:
        if not ciclo["siembra"]:
            continue
        desde, hasta = date.fromisoformat(str(ciclo["siembra"]["desde"])), date.fromisoformat(str(ciclo["siembra"]["hasta"]))
        if hasta >= dia - timedelta(days=DIAS_SIEMBRA_ANTES) and desde <= dia + timedelta(days=dias_despues):
            return ciclo
    return None


def aparece_verde(evento: dict, datos: Datos, hoy: date, que: str) -> Contraste:
    dia = date.fromisoformat(evento["fecha"])
    antes = pasada_antes(datos.pasadas, dia)
    siguientes = pasadas_entre(datos.pasadas, dia, dia + timedelta(days=DIAS_VER_SIEMBRA))
    if antes is None or not siguientes:
        return sin_pasadas(evento)

    maximo = max(siguientes, key=lambda p: p["ndvi"])
    medido = medicion("ndvi", antes, maximo, SUBA_NDVI_SIEMBRA)
    evidencia = [evidencia_de(antes, "ndvi"), evidencia_de(maximo, "ndvi")]

    ciclo = ciclo_que_empieza_cerca(datos.ciclos, dia, DIAS_VER_SIEMBRA)
    if ciclo:
        ventana = ciclo["siembra"]
        # La subida se mide desde el arranque del ciclo hasta su pico: la
        # pasada de antes del evento puede tener todavía el cultivo anterior.
        base = pasada_del_dia(datos.pasadas, ventana["desde"]) or antes
        pico = pasada_del_dia(datos.pasadas, ciclo["pico"]) or maximo
        return contraste(
            evento,
            "confirma",
            f"El satélite vio aparecer {que} {texto_ventana(ventana['desde'], ventana['hasta'])}: el verde (NDVI) subió de {numero(base['ndvi'])} a {numero(pico['ndvi'])} hasta el {texto_fecha(pico['fecha'])}.",
            confianza=confianza_por_cercania("alta", dia, antes),
            motivo_confianza="ciclo detectado en la curva de NDVI, con la subida y el pico",
            medicion=medicion("ndvi", base, pico, SUBA_NDVI_SIEMBRA),
            evidencia=[evidencia_de(base, "ndvi"), evidencia_de(pico, "ndvi")],
        )

    if maximo["ndvi"] - antes["ndvi"] >= SUBA_NDVI_SIEMBRA and maximo["ndvi"] >= NDVI_CULTIVO:
        return contraste(
            evento,
            "confirma",
            f"En las semanas siguientes el verde (NDVI) subió de {numero(antes['ndvi'])} a {numero(maximo['ndvi'])}, hasta el {texto_fecha(maximo['fecha'])}. El cultivo sigue creciendo: todavía no llegó a su punto más alto.",
            confianza="media",
            motivo_confianza="se ve la subida, pero el ciclo todavía no se completó",
            medicion=medido,
            evidencia=evidencia,
        )

    if (hoy - dia).days < DIAS_VER_SIEMBRA and fecha_de(siguientes[-1]) < dia + timedelta(days=28):
        return todavia_pronto(evento, fecha_de(siguientes[-1]))

    if antes["ndvi"] >= NDVI_YA_VERDE:
        hallazgo = f"La parcela ya estaba verde antes (NDVI {numero(antes['ndvi'])} el {texto_fecha(antes['fecha'])}) y siguió igual: el satélite no ve que empiece {que}."
    else:
        hallazgo = f"En las {DIAS_VER_SIEMBRA // 7} semanas siguientes el verde no subió como sube cuando crece {que}: pasó de {numero(antes['ndvi'])} a {numero(maximo['ndvi'])} como mucho."
    return contraste(evento, "no_se_ve", hallazgo, medicion=medido, evidencia=evidencia)


def siembra(evento: dict, datos: Datos, hoy: date) -> Contraste:
    return aparece_verde(evento, datos, hoy, "el cultivo")


def cobertura(evento: dict, datos: Datos, hoy: date) -> Contraste:
    return aparece_verde(evento, datos, hoy, "la cobertura")


# --- Cosecha ------------------------------------------------------------------------


def ciclo_que_termina_cerca(ciclos: list[dict], dia: date) -> dict | None:
    holgura = timedelta(days=DIAS_HOLGURA_COSECHA)
    for ciclo in ciclos:
        if not ciclo["cosecha"]:
            continue
        desde, hasta = date.fromisoformat(str(ciclo["cosecha"]["desde"])), date.fromisoformat(str(ciclo["cosecha"]["hasta"]))
        if desde - holgura <= dia <= hasta + holgura:
            return ciclo
    return None


def cosecha(evento: dict, datos: Datos, hoy: date) -> Contraste:
    dia = date.fromisoformat(evento["fecha"])
    ciclo = ciclo_que_termina_cerca(datos.ciclos, dia)
    if ciclo:
        ventana = ciclo["cosecha"]
        antes, despues = pasada_del_dia(datos.pasadas, ventana["desde"]), pasada_del_dia(datos.pasadas, ventana["hasta"])
        if antes and despues:
            return contraste(
                evento,
                "confirma",
                f"El satélite vio caer el verde {texto_ventana(antes['fecha'], despues['fecha'])}, como después de cosechar: el NDVI pasó de {numero(antes['ndvi'])} a {numero(despues['ndvi'])}.",
                confianza=confianza_por_cercania("alta", dia, antes, despues),
                motivo_confianza="caída detectada en la curva de NDVI después del pico del cultivo",
                medicion=medicion("ndvi", antes, despues, -CAIDA_NDVI),
                evidencia=[evidencia_de(antes, "ndvi"), evidencia_de(despues, "ndvi")],
            )
    return comparar_antes_y_despues(
        evento,
        datos,
        "ndvi",
        -CAIDA_NDVI,
        lambda a, d: a["ndvi"] - d["ndvi"] >= CAIDA_NDVI,
        "media",
        ("cayó el verde, como después de cosechar", "el verde no cayó como cae después de una cosecha"),
    )


# --- Labores sobre el suelo -----------------------------------------------------------


def labranza(evento: dict, datos: Datos, hoy: date) -> Contraste:
    def se_trabajo(antes: dict, despues: dict) -> bool:
        return antes["ndti"] - despues["ndti"] >= CAIDA_NDTI_LABRANZA and despues["bsi"] - antes["bsi"] >= SUBA_BSI_LABRANZA

    resultado = comparar_antes_y_despues(
        evento,
        datos,
        "bsi",
        SUBA_BSI_LABRANZA,
        se_trabajo,
        "media",
        ("se fue el rastrojo y quedó más suelo a la vista, como después de una labor", "no se ve el suelo recién trabajado"),
        indices_evidencia=("ndti",),
    )
    if resultado.veredicto == "confirma":
        return replace(resultado, motivo_confianza="el rastrojo (NDTI) y el suelo expuesto (BSI) usan umbrales todavía provisorios")
    return resultado


def incorporacion(evento: dict, datos: Datos, hoy: date) -> Contraste:
    def se_incorporo(antes: dict, despues: dict) -> bool:
        cayo_el_verde = antes["ndvi"] - despues["ndvi"] >= CAIDA_NDVI
        quedo_rastrojo_o_suelo = despues["ndti"] >= NDTI_RASTROJO or despues["bsi"] - antes["bsi"] >= SUBA_BSI_LABRANZA
        return cayo_el_verde and quedo_rastrojo_o_suelo

    return comparar_antes_y_despues(
        evento,
        datos,
        "ndvi",
        -CAIDA_NDVI,
        se_incorporo,
        "media",
        ("bajó el verde y quedó rastrojo o suelo trabajado", "no se ve la cobertura cortada"),
        indices_evidencia=("ndti", "bsi"),
    )


# --- Riego y fertilización ------------------------------------------------------------


def lluvia_entre(diario: list[dict], desde: str, hasta: str) -> float:
    return sum(d["lluvia_mm"] or 0 for d in diario if desde < d["fecha"] <= hasta)


def riego(evento: dict, datos: Datos, hoy: date) -> Contraste:
    dia = date.fromisoformat(evento["fecha"])
    antes = pasada_antes(datos.pasadas, dia)
    if antes is not None and antes["ndvi"] < NDVI_CULTIVO:
        return contraste(evento, "declarado", "Todavía no había plantas que cubrieran el suelo, y sin plantas el satélite no ve el agua del riego. Queda el dato del productor.")

    resultado = comparar_antes_y_despues(
        evento,
        datos,
        "ndmi",
        SUBA_NDMI_RIEGO,
        lambda a, d: d["ndmi"] - a["ndmi"] >= SUBA_NDMI_RIEGO,
        "media",
        ("subió el agua en la planta", "no subió el agua en la planta"),
        dias_despues=DIAS_VER_RIEGO,
    )
    if resultado.veredicto != "confirma" or resultado.medicion is None or resultado.medicion.antes is None:
        return resultado

    lluvia = lluvia_entre(datos.diario, resultado.medicion.antes.fecha, resultado.medicion.despues.fecha)
    if lluvia < LLUVIA_QUE_CONFUNDE_MM:
        return resultado
    return replace(
        resultado,
        veredicto="no_se_ve",
        titulo=TITULOS["no_se_ve"],
        hallazgo=f"{resultado.hallazgo} Pero en esos días también llovieron {lluvia:.0f} mm en la zona, así que no se puede atribuir al riego.",
        confianza=None,
        motivo_confianza=None,
        evidencia=[*resultado.evidencia, Evidencia(f"lluvia {lluvia:.0f} mm entre las dos imágenes", f"{FUENTE_POWER} (celda de ~50 km)", resultado.medicion.despues.fecha)],
    )


def fertilizacion(evento: dict, datos: Datos, hoy: date) -> Contraste:
    dia = date.fromisoformat(evento["fecha"])
    antes = pasada_antes(datos.pasadas, dia)
    if antes is None:
        return sin_pasadas(evento)
    if antes["ndvi"] < NDVI_CULTIVO:
        return contraste(evento, "declarado", "Todavía no había plantas que cubrieran el suelo, así que la clorofila no se puede medir. Queda el dato del productor.")

    desde, hasta = (dia + timedelta(days=d) for d in DIAS_VER_FERTILIZACION)
    siguientes = pasadas_entre(datos.pasadas, desde, hasta)
    if not siguientes:
        return todavia_pronto(evento, hoy) if hoy < hasta else sin_pasadas(evento, DIAS_VER_FERTILIZACION[1])

    maximo = max(siguientes, key=lambda p: p["ndre"])
    medido = medicion("ndre", antes, maximo, SUBA_NDRE_FERTILIZACION)
    evidencia = [evidencia_de(antes, "ndre"), evidencia_de(maximo, "ndre")]
    detalle = f"la clorofila (NDRE) pasó de {numero(antes['ndre'])} a {numero(maximo['ndre'])} {texto_ventana(antes['fecha'], maximo['fecha'])}"
    if maximo["ndre"] - antes["ndre"] >= SUBA_NDRE_FERTILIZACION:
        return contraste(
            evento,
            "indicio",
            f"El cultivo ganó vigor en las semanas siguientes: {detalle}. Es un indicio, no una prueba de la fertilización.",
            # El cultivo gana clorofila al crecer aunque no se fertilice.
            confianza="baja",
            motivo_confianza="la clorofila también sube cuando el cultivo crece solo",
            medicion=medido,
            evidencia=evidencia,
        )
    return contraste(evento, "no_se_ve", f"No se ve más vigor en las semanas siguientes: {detalle}.", medicion=medido, evidencia=evidencia)


# --- Clima ------------------------------------------------------------------------------


def dano_climatico(evento: dict, datos: Datos, hoy: date) -> Contraste:
    causa = evento.get("detalles", {}).get("causa", "")
    if causa != "Helada":
        return contraste(evento, "declarado", f"{causa or 'Este daño'} no se puede medir con el clima de la zona (NASA POWER mide una celda de ~50 km). Queda el dato del productor.")

    dia = date.fromisoformat(evento["fecha"])
    desde = (dia - timedelta(days=DIAS_HELADA_ANTES)).isoformat()
    dias = [d for d in datos.diario if desde <= d["fecha"] <= dia.isoformat() and d["temperatura_minima"] is not None]
    if not dias:
        return contraste(evento, "sin_pasadas", "NASA POWER todavía no publicó la temperatura de esos días.")

    mas_frio = min(dias, key=lambda d: d["temperatura_minima"])
    minima = mas_frio["temperatura_minima"]
    medido = Medicion("temperatura_minima", NOMBRES_INDICE["temperatura_minima"], None, Punto(mas_frio["fecha"], round(minima, 1)), TEMPERATURA_HELADA)
    evidencia = [Evidencia(f"mínima {minima:.1f} °C", f"{FUENTE_POWER} (T2M_MIN, celda de ~50 km)", mas_frio["fecha"])]
    if minima <= TEMPERATURA_HELADA:
        return contraste(
            evento,
            "confirma",
            f"El {texto_fecha(mas_frio['fecha'])} la mínima de la zona fue de {grados(minima)}: heló.",
            confianza="media",
            motivo_confianza="es la temperatura del aire de la zona (celda de ~50 km): en los bajos de cada lote puede helar más",
            medicion=medido,
            evidencia=evidencia,
        )
    return contraste(
        evento,
        "no_se_ve",
        f"La mínima de la zona no bajó de {grados(minima)} esos días; pudo helar sólo en los bajos del lote.",
        medicion=medido,
        evidencia=evidencia,
    )


# --- Lo que el satélite no ve -----------------------------------------------------------

DECLARADOS = {
    "fitosanitario": "Una aplicación no se ve desde el espacio. Queda el dato del productor: el producto, la dosis y la carencia.",
    "desmalezado": "Casi no se ve desde el espacio. Queda el dato del productor.",
    "foto": "Es una foto del productor, no un dato del satélite.",
}


def declarado(evento: dict, datos: Datos, hoy: date) -> Contraste:
    return contraste(evento, "declarado", DECLARADOS.get(evento["tipo"], "Queda el dato del productor."))


# --- Todo junto ----------------------------------------------------------------------------

REGLAS: dict[str, Callable[[dict, Datos, date], Contraste]] = {
    "siembra": siembra,
    "cobertura": cobertura,
    "cosecha": cosecha,
    "labranza": labranza,
    "incorporacion": incorporacion,
    "riego": riego,
    "fertilizacion": fertilizacion,
    "dano_climatico": dano_climatico,
}


def contrastar_evento(evento: dict, datos: Datos, hoy: date) -> Contraste:
    return REGLAS.get(evento["tipo"], declarado)(evento, datos, hoy)


def sin_atipicas(pasadas: list[dict], atipicas: list) -> list[dict]:
    excluidas = {str(f) for f in atipicas}
    return [p for p in pasadas if str(p["fecha"]) not in excluidas]


def contrastar(eventos: list[dict], pasadas: list[dict], analisis: dict, diario: list[dict], hoy: date) -> dict:
    datos = Datos(sin_atipicas(pasadas, analisis["pasadas_atipicas"]), analisis["ciclos"], diario)
    resultados = [contrastar_evento(e, datos, hoy) for e in sorted(eventos, key=lambda e: e["fecha"])]
    cuenta = {v: sum(1 for r in resultados if r.veredicto == v) for v in TITULOS}
    return {
        "version_reglas": VERSION_REGLAS,
        "resumen": {**cuenta, "contrastables": cuenta["confirma"] + cuenta["indicio"] + cuenta["no_se_ve"]},
        "eventos": resultados,
    }
