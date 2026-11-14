"""Casos conocidos de detección de ciclos y cobertura: si un ajuste de umbrales
rompe alguno, el cambio tiene que justificarse."""


def cultivos(analisis: dict) -> list[dict]:
    return [c for c in analisis["ciclos"] if c["tipo"] == "cultivo"]


def test_el_casco_nunca_da_cultivo(lote):
    _, analisis = lote("C_casco")
    assert analisis["ciclos"] == []


def test_monocultivo_extensivo_tiene_un_solo_cultivo_y_meses_sin_cultivo(lote):
    _, analisis = lote("E_extensivo")
    assert len(cultivos(analisis)) == 1
    assert analisis["dias_sin_cultivo"] > 120


def test_doble_cultivo_no_se_parte_por_una_pasada_con_bruma(lote):
    # Antes de la regla del valle, un bache a 0,66 en enero partía el cultivo
    # de verano en dos.
    _, analisis = lote("D_verde")
    assert len(cultivos(analisis)) == 2


def test_hueco_con_rastrojo_no_cuenta_como_suelo_desnudo(lote):
    _, analisis = lote("A_franjas")
    assert analisis["dias_con_rastrojo"] > 0
    assert analisis["dias_suelo_desnudo"] == 0


def test_canteros_tienen_varios_ciclos_cortos(lote):
    _, analisis = lote("F_canteros_casco")
    assert len(analisis["ciclos"]) >= 4
    assert analisis["dias_sin_cultivo"] < 60
