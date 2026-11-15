from surco_datos import catalogo


def test_familia_por_genero_incluye_abreviaturas_y_errores_del_catalogo():
    assert catalogo.familia_de("Lycopersicon lycopersicum (L.) Karst.", "TOMATE") == "solanaceas"
    assert catalogo.familia_de("Curcubita maxima", "ZAPALLO") == "cucurbitaceas"
    assert catalogo.familia_de("(Prunus persica x P. davidiana)", "PORTAINJERTO") == "rosaceas"
    assert catalogo.familia_de("S. tuberosum", "PAPA") == "solanaceas"
    assert catalogo.familia_de("Mangifera indica L.", "MANGO") is None


def test_las_hortalizas_principales_tienen_familia():
    especies = {e["especie"]: e["familia"] for e in catalogo.especies(catalogo.GRUPOS_CULTIVO)}
    for especie, familia in [("TOMATE", "solanaceas"), ("LECHUGA", "asteraceas"), ("ACELGA", "amarantaceas"), ("VID", "vitaceas")]:
        assert especies[especie] == familia


def test_busqueda_ignora_acentos_y_ordena_primero_lo_que_empieza_con_el_texto():
    resultados = [c.nombre for c in catalogo.buscar_cultivares("TOMATE", "plá")]
    assert resultados
    assert resultados[0].startswith("PLA")


def test_busqueda_respeta_el_limite_y_la_especie():
    resultados = catalogo.buscar_cultivares("LECHUGA", "", limite=5)
    assert len(resultados) == 5
    assert all(c.especie == "LECHUGA" for c in resultados)


def test_cobertura_incluye_vicia_y_avena_con_su_familia():
    especies = {e["especie"]: e["familia"] for e in catalogo.especies(catalogo.GRUPOS_COBERTURA)}
    assert especies["VICIA VILLOSA ROTH"] == "fabaceas"
    assert especies["AVENA"] == "poaceas"
