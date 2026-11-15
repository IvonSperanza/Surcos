from datetime import date, timedelta

from surco_datos import ciclos, contraste
from surco_datos.sentinel2 import NDVI_CULTIVO

HOY = date(2026, 11, 15)
INICIO = date(2026, 1, 1)


def pasada(dia: int, ndvi: float, ndti: float = 0.1, ndmi: float = 0.0, ndre: float = 0.3, bsi: float = 0.0) -> dict:
    fecha = (INICIO + timedelta(days=dia)).isoformat()
    return {"fecha": fecha, "ndvi": ndvi, "ndti": ndti, "ndmi": ndmi, "ndre": ndre, "bsi": bsi, "escena": f"S2_{fecha}"}


def datos(pasadas: list[dict], diario: list[dict] | None = None) -> contraste.Datos:
    from dataclasses import asdict

    analisis = asdict(
        ciclos.analizar([date.fromisoformat(p["fecha"]) for p in pasadas], [p["ndvi"] for p in pasadas], [p["ndti"] for p in pasadas], NDVI_CULTIVO)
    )
    return contraste.Datos(pasadas, analisis["ciclos"], diario or [])


def evento(tipo: str, dia: int, **detalles: str) -> dict:
    return {"id": tipo, "tipo": tipo, "fecha": (INICIO + timedelta(days=dia)).isoformat(), "detalles": detalles}


# Un cultivo que se siembra el día 30, se ve desde el 45, llega al pico el 75 y se cosecha el 95.
CICLO = [pasada(d, v) for d, v in [(10, 0.2), (25, 0.22), (40, 0.25), (50, 0.45), (60, 0.65), (75, 0.8), (85, 0.75), (92, 0.7), (100, 0.25), (110, 0.22)]]


def test_siembra_con_ciclo_detectado_se_confirma():
    r = contraste.contrastar_evento(evento("siembra", 30), datos(CICLO), HOY)
    assert r.veredicto == "confirma"
    assert r.medicion.indice == "ndvi"
    assert r.medicion.despues.valor == 0.8
    # Todo número del texto está en la medición.
    assert "0,80" in r.hallazgo


def test_siembra_sobre_una_parcela_ya_verde_no_se_ve():
    verde = [pasada(d, 0.85) for d in range(0, 120, 10)]
    r = contraste.contrastar_evento(evento("siembra", 30), datos(verde), HOY)
    assert r.veredicto == "no_se_ve"
    assert "ya estaba verde" in r.hallazgo


def test_cosecha_dentro_de_la_ventana_detectada():
    r = contraste.contrastar_evento(evento("cosecha", 96), datos(CICLO), HOY)
    assert r.veredicto == "confirma"
    assert r.medicion.antes.valor > r.medicion.despues.valor


def test_cosecha_sin_caida_no_se_ve():
    r = contraste.contrastar_evento(evento("cosecha", 70), datos(CICLO), HOY)
    assert r.veredicto == "no_se_ve"


def test_labranza_con_menos_rastrojo_y_mas_suelo():
    pasadas = [pasada(0, 0.2, ndti=0.15, bsi=0.0), pasada(10, 0.2, ndti=0.06, bsi=0.2)]
    r = contraste.contrastar_evento(evento("labranza", 5), datos(pasadas), HOY)
    assert r.veredicto == "confirma"
    # Los umbrales del rastrojo son provisorios: nunca confianza alta.
    assert r.confianza == "media"


def test_sin_pasadas_cerca_no_se_afirma_nada():
    pasadas = [pasada(0, 0.2, ndti=0.15), pasada(60, 0.2, ndti=0.05, bsi=0.3)]
    r = contraste.contrastar_evento(evento("labranza", 30), datos(pasadas), HOY)
    assert r.veredicto == "sin_pasadas"
    assert r.medicion is None


def test_riego_con_lluvia_en_el_medio_no_se_atribuye():
    pasadas = [pasada(0, 0.6, ndmi=0.1), pasada(8, 0.6, ndmi=0.3)]
    lluvia = [{"fecha": (INICIO + timedelta(days=5)).isoformat(), "lluvia_mm": 40, "temperatura_minima": 15}]
    r = contraste.contrastar_evento(evento("riego", 3), datos(pasadas, lluvia), HOY)
    assert r.veredicto == "no_se_ve"
    assert "40 mm" in r.hallazgo


def test_riego_sin_lluvia_se_confirma():
    pasadas = [pasada(0, 0.6, ndmi=0.1), pasada(8, 0.6, ndmi=0.3)]
    r = contraste.contrastar_evento(evento("riego", 3), datos(pasadas), HOY)
    assert r.veredicto == "confirma"


def test_fertilizacion_nunca_pasa_de_indicio():
    pasadas = [pasada(0, 0.6, ndre=0.3), pasada(25, 0.7, ndre=0.45)]
    r = contraste.contrastar_evento(evento("fertilizacion", 3), datos(pasadas), HOY)
    # La clorofila también sube cuando el cultivo crece solo: nunca confirma.
    assert r.veredicto == "indicio"


def test_helada_cruzada_con_la_minima():
    diario = [{"fecha": "2026-07-03", "temperatura_minima": -2.18, "lluvia_mm": 0}]
    ev = {"id": "h", "tipo": "dano_climatico", "fecha": "2026-07-03", "detalles": {"causa": "Helada"}}
    r = contraste.contrastar_evento(ev, datos(CICLO, diario), HOY)
    assert r.veredicto == "confirma"
    assert "-2,2 °C" in r.hallazgo


def test_granizo_y_fitosanitario_quedan_declarados():
    granizo = {**evento("dano_climatico", 30), "detalles": {"causa": "Granizo"}}
    assert contraste.contrastar_evento(granizo, datos(CICLO), HOY).veredicto == "declarado"
    assert contraste.contrastar_evento(evento("fitosanitario", 30), datos(CICLO), HOY).veredicto == "declarado"


def test_resumen_cuenta_cada_veredicto():
    eventos = [evento("siembra", 30), evento("cosecha", 96), evento("fitosanitario", 60)]
    resultado = contraste.contrastar(eventos, CICLO, {"pasadas_atipicas": [], **{"ciclos": datos(CICLO).ciclos}}, [], HOY)
    assert resultado["resumen"]["confirma"] == 2
    assert resultado["resumen"]["declarado"] == 1
    assert resultado["resumen"]["contrastables"] == 2
