import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { LoaderCircle, Trash2 } from "lucide-react";
import { eliminarParcela, type Parcela } from "../../api/parcelas";
import { Button, Card, EnlaceBoton, PanelPestana, Pestanas, type Pestana } from "../../design-system";
import { eliminarEventosDeParcela } from "../../api/eventos";
import { HistoriaParcela } from "../eventos/HistoriaParcela";
import { TIPOS_EVENTO } from "../eventos/tiposEvento";
import { useEventos } from "../eventos/useEventos";
import { TablaProducciones } from "../producciones/TablaProducciones";
import { conParcela } from "../producciones/useProducciones";
import { derivarProducciones } from "../producciones/producciones";
import { TarjetaSatelite } from "../parcela/DatosParcela";
import { SegunEstado } from "../parcela/SegunEstado";
import { TarjetaClima } from "../parcela/TarjetaClima";
import { TarjetaSuelo } from "../parcela/TarjetaSuelo";
import type { EstadoConsulta } from "../parcela/useConsultaParcela";
import { TarjetaInsights } from "../parcela/TarjetaInsights";
import { CabeceraVista } from "../productor/CabeceraVista";
import vistas from "../productor/vistas.module.css";
import { asegurarDatos, estadoGeneral, olvidarDatos, reintentarDatos, useDatosParcela } from "./almacenDatos";
import { ChipEstadoDatos } from "./ChipEstadoDatos";
import { PanelGeneracion } from "./PanelGeneracion";
import { ResumenParcela } from "./ResumenParcela";
import { useParcela } from "./useParcelas";
import styles from "./parcelas.module.css";
import { rutasPanel } from "../productor/rutas";

type Vista = "resumen" | "producciones" | "historia" | "satelite" | "clima";

const VISTAS: Vista[] = ["resumen", "producciones", "historia", "satelite", "clima"];

const ID_PESTANAS = "ficha-parcela";

// El ícono que gira junto al nombre: dice qué pestaña todavía espera datos.
function insigniaCarga(cargando: boolean) {
    return cargando ? <LoaderCircle size={14} strokeWidth={2} className={styles.girando} aria-label="Generando datos" /> : undefined;
}

const contador = (n: number) => (n > 0 ? <span className={`dato ${styles.contador}`}>{n}</span> : undefined);

const enCurso = (...estados: EstadoConsulta<unknown>[]) => estados.some((e) => e.tipo === "cargando" || e.tipo === "inactivo");

function Ficha({ parcela }: { parcela: Parcela }) {
    const datos = useDatosParcela(parcela.id);
    const estado = estadoGeneral(datos);
    const navegar = useNavigate();
    // La pestaña va en la URL: se puede compartir y "Atrás" vuelve a la anterior.
    const [parametros, setParametros] = useSearchParams();
    const pedida = parametros.get("vista") as Vista | null;
    const vista: Vista = pedida && VISTAS.includes(pedida) ? pedida : "resumen";
    // Array estable: el mapa encuadra la parcela una vez y no en cada render.
    const soloEsta = useMemo(() => [parcela], [parcela]);
    const { eventos, recargar } = useEventos(parcela.id);
    const marcas = useMemo(() => (eventos ?? []).filter((e) => e.tipo !== "foto").map((e) => ({ id: e.id, fecha: e.fecha, etiqueta: TIPOS_EVENTO[e.tipo].nombre.split(" ")[0] })), [eventos]);
    const producciones = useMemo(() => (eventos ? conParcela(derivarProducciones(eventos), parcela) : null), [eventos, parcela]);
    const climaListo = datos.clima.tipo === "listo" ? datos.clima.datos : null;

    useEffect(() => asegurarDatos(parcela), [parcela]);

    const eliminar = async () => {
        if (!window.confirm(`¿Eliminar "${parcela.nombre}"? También se borran su historia y sus producciones. No se puede deshacer.`)) return;
        await eliminarParcela(parcela.id);
        await eliminarEventosDeParcela(parcela.id);
        olvidarDatos(parcela.id);
        navegar(rutasPanel.parcelas);
    };

    const pestanas: Pestana<Vista>[] = [
        { id: "resumen", etiqueta: "Resumen" },
        { id: "producciones", etiqueta: "Producciones", insignia: contador(producciones?.length ?? 0) },
        { id: "historia", etiqueta: "Historial", insignia: contador(eventos?.length ?? 0) },
        { id: "satelite", etiqueta: "Satélite", insignia: insigniaCarga(enCurso(datos.ndvi)) },
        { id: "clima", etiqueta: "Clima y suelo", insignia: insigniaCarga(enCurso(datos.clima, datos.suelo)) }
    ];

    return (
        <section className={vistas.vista} aria-label={parcela.nombre}>
            <CabeceraVista
                titulo={parcela.nombre}
                volver={{ to: rutasPanel.parcelas, etiqueta: "Mis parcelas" }}
                acciones={<ChipEstadoDatos estado={estado} />}
                pestanas={
                    <Pestanas
                        pestanas={pestanas}
                        activa={vista}
                        onCambiar={(v) => setParametros(v === "resumen" ? {} : { vista: v })}
                        etiqueta="Información de la parcela"
                        idBase={ID_PESTANAS}
                    />
                }
            />

            <PanelPestana idBase={ID_PESTANAS} id={vista}>
                {vista === "resumen" && (
                    <>
                        <ResumenParcela parcela={parcela} parcelas={soloEsta} datos={datos} eventos={eventos} />
                        {/* Mientras se generan los datos, el avance; cuando están, lo accionable. */}
                        {estado === "listo" && datos.insights.tipo === "listo" ? (
                            <TarjetaInsights datos={datos.insights.datos} />
                        ) : (
                            <PanelGeneracion datos={datos} onReintentar={() => reintentarDatos(parcela)} />
                        )}
                    </>
                )}

                {vista === "producciones" &&
                    (producciones === null ? null : producciones.length > 0 ? (
                        <TablaProducciones producciones={producciones} mostrarParcela={false} />
                    ) : (
                        <Card>
                            <h2 className="subtitulo">Sin producciones</h2>
                            <p className="body">Se crean al registrar una siembra en el historial.</p>
                        </Card>
                    ))}

                {vista === "historia" && <HistoriaParcela parcelaId={parcela.id} eventos={eventos} onCambio={recargar} />}

                {vista === "satelite" && (
                    <SegunEstado
                        estado={datos.ndvi}
                        titulo="Satélite"
                        mensajeCargando="Consultando Sentinel-2. La primera vez tarda 1 a 2 min."
                    >
                        {(historico) => <TarjetaSatelite historico={historico} clima={climaListo} marcas={marcas} />}
                    </SegunEstado>
                )}

                {vista === "clima" && (
                    <div className={styles.grillaDos}>
                        <SegunEstado estado={datos.clima} titulo="Clima" mensajeCargando="Consultando NASA POWER…">
                            {(clima) => <TarjetaClima clima={clima} />}
                        </SegunEstado>
                        <SegunEstado estado={datos.suelo} titulo="Suelo" mensajeCargando="Consultando SoilGrids…">
                            {(suelo) => <TarjetaSuelo suelo={suelo} />}
                        </SegunEstado>
                    </div>
                )}
            </PanelPestana>

            <Button onClick={eliminar} className={styles.eliminar}>
                <Trash2 size={16} strokeWidth={1.5} aria-hidden />
                Eliminar parcela
            </Button>
        </section>
    );
}

export function FichaParcela() {
    const { id = "" } = useParams();
    const parcela = useParcela(id);

    if (parcela === undefined) return <p className="body">Cargando…</p>;
    if (parcela === null) {
        return (
            <Card>
                <h1 className="subtitulo">Parcela no encontrada</h1>
                <EnlaceBoton to={rutasPanel.parcelas}>Ver mis parcelas</EnlaceBoton>
            </Card>
        );
    }
    return <Ficha parcela={parcela} />;
}
