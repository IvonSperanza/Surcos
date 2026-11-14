from datetime import date

from surco_datos import insights
from surco_datos.insights import Descartado, Insight
from surco_datos.power import ClimatologiaHeladas, calcular_climatologia


def dia_de_lluvia(fecha: str, mm: float) -> dict:
    return {"fecha": fecha, "lluvia_mm": mm}


# --- Tormentas ------------------------------------------------------------------


def test_tormenta_con_suelo_desnudo_es_alerta(lote):
    # E: pasadas del 2 y 17 sep 2026 sin cultivo y con NDTI bajo.
    pasadas, _ = lote("E_extensivo")
    resultado = insights.tormenta(dia_de_lluvia("2026-09-10", 80), pasadas)
    assert isinstance(resultado, Insight)
    assert resultado.tipo == "alerta"
    assert resultado.confianza in ("alta", "media")
    assert "80 mm" in resultado.hallazgo
    # Toda afirmación lleva su evidencia: la lluvia y las dos pasadas.
    assert len(resultado.evidencia) == 3


def test_tormenta_con_cultivo_es_un_bien(lote):
    # D: cultivo de verano en pie en febrero.
    pasadas, _ = lote("D_verde")
    resultado = insights.tormenta(dia_de_lluvia("2026-02-20", 70), pasadas)
    assert isinstance(resultado, Insight)
    assert resultado.tipo == "bien"


def test_tormenta_sin_pasadas_cercanas_se_descarta(lote):
    # A: entre el 9 jul y el 8 ago 2026 no hay pasadas despejadas. Una
    # tormenta el 11 jul queda a 28 días de la pasada siguiente.
    pasadas, _ = lote("A_franjas")
    resultado = insights.tormenta(dia_de_lluvia("2026-07-11", 90), pasadas)
    assert isinstance(resultado, Descartado)


def test_lluvias_menores_no_generan_nada(lote):
    pasadas, _ = lote("E_extensivo")
    assert insights.tormentas(pasadas, [dia_de_lluvia("2026-09-10", 30)]) == []


# --- Huecos y cosechas ------------------------------------------------------------


def test_hueco_largo_de_suelo_desnudo_es_oportunidad(lote):
    pasadas, analisis = lote("E_extensivo")
    resultados = insights.huecos(analisis, pasadas)
    oportunidades = [r for r in resultados if isinstance(r, Insight)]
    assert oportunidades
    assert all(r.tipo == "oportunidad" for r in oportunidades)


def test_canteros_sin_huecos_largos_no_generan_oportunidad(lote):
    pasadas, analisis = lote("F_canteros_casco")
    assert insights.huecos(analisis, pasadas) == []


def test_rastrojo_despues_de_cosechar_es_un_bien(lote):
    pasadas, analisis = lote("E_extensivo")
    resultados = insights.manejo_despues_de_cosechas(analisis, pasadas)
    assert len(resultados) == 1
    assert resultados[0].tipo == "bien"
    # El rastrojo depende de umbrales provisorios: nunca confianza alta.
    assert resultados[0].confianza == "media"


# --- Heladas ------------------------------------------------------------------------


def test_climatologia_toma_primera_y_ultima_helada_de_cada_anio():
    heladas = [date(2010, 6, 1), date(2010, 8, 20), date(2011, 5, 30), date(2011, 9, 5)]
    clima = calcular_climatologia(heladas, [2010, 2011])
    assert clima.anios_con_helada == 2
    assert clima.ultima_helada_mas_tardia == "2011-09-05"
    assert clima.primera_helada_mas_temprana == "2011-05-30"


def test_anio_sin_heladas_cuenta_del_lado_seguro():
    # Un único año con helada tardía entre diez: el corte del 90 % no puede
    # quedar en esa fecha extrema.
    heladas = [date(2015, 9, 20)]
    clima = calcular_climatologia(heladas, list(range(2010, 2020)))
    assert clima.anios_sin_helada_despues_de_la_segura >= 9


def test_calendario_de_heladas_no_inventa_numeros():
    clima = ClimatologiaHeladas(
        anios=list(range(2006, 2026)),
        anios_con_helada=20,
        ultima_helada_segura="08-27",
        anios_sin_helada_despues_de_la_segura=18,
        primera_helada_segura="05-30",
        ultima_helada_mas_tardia="2025-09-05",
        primera_helada_mas_temprana="2007-05-30",
        temperatura_helada=0.0,
    )
    [resultado] = insights.calendario_heladas(clima)
    assert "27 ago" in resultado.hallazgo
    assert "18 de esos 20 años" in resultado.hallazgo
    assert resultado.confianza == "media"
