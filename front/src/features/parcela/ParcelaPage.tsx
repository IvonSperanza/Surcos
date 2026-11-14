import { getClima, type ClimaParcela } from "../../api/clima";
import { getInsights } from "../../api/insights";
import { getHistoricoNdvi, type HistoricoNdvi } from "../../api/ndvi";
import { getSuelo } from "../../api/suelo";
import { Button, Card, Fuente } from "../../design-system";
import { formatearFecha } from "../../lib/fecha";
import { GraficoAguaVigor } from "./GraficoAguaVigor";
import { GraficoCobertura } from "./GraficoCobertura";
import { GraficoNdvi } from "./GraficoNdvi";
import { MapaParcela } from "./MapaParcela";
import { ReporteCiclos } from "./ReporteCiclos";
import { SegunEstado } from "./SegunEstado";
import { TarjetaClima } from "./TarjetaClima";
import { TarjetaInsights } from "./TarjetaInsights";
import { TarjetaSuelo } from "./TarjetaSuelo";
import { useConsultaParcela } from "./useConsultaParcela";
import { useDibujoParcela } from "./useDibujoParcela";
import styles from "./parcela.module.css";

function Instrucciones({ cantidadVertices, cerrada }: { cantidadVertices: number; cerrada: boolean }) {
    if (cerrada) return <p className="body">Esta es tu parcela. Abajo ves cómo la vio el satélite en el último año.</p>;
    if (cantidadVertices === 0) return <p className="body">Hacé clic en cada esquina de tu parcela, sobre la imagen satelital.</p>;
    return <p className="body">Seguí marcando esquinas. Para cerrar la parcela, tocá el primer punto o el botón de abajo.</p>;
}

function Historico({ historico, clima }: { historico: HistoricoNdvi; clima: ClimaParcela | null }) {
    const { serie, analisis } = historico;
    const pasadasSinCultivo = serie.filter((p) => p.ndvi < historico.umbral_suelo_desnudo).length;

    return (
        <Card className={styles.tarjeta}>
            <h2 className="subtitulo">Cómo la vio el satélite</h2>
            <p className="body">
                En <span className="dato">{serie.length}</span> pasadas despejadas, la parcela se vio sin cultivo en{" "}
                <span className="dato">{pasadasSinCultivo}</span>. La curva verde es el cultivo; la franja marrón, el nivel por debajo del cual no hay
                cultivo en pie; los números, cada ciclo que se detectó ({analisis.ciclos.length}).
            </p>
            <GraficoNdvi historico={historico} />

            <h3 className="subtitulo">Qué cubrió tu parcela</h3>
            <p className="body">En cada pasada, qué parte de la parcela tenía cultivo, rastrojo o el suelo desnudo.</p>
            <GraficoCobertura historico={historico} />

            <h3 className="subtitulo">Agua y vigor del cultivo</h3>
            <p className="body">
                Sólo cuando hay cultivo en pie. Si el agua en la planta baja mientras el cultivo crece, puede estar pasando sed; la clorofila sigue
                mostrando diferencias cuando el verde ya está al máximo.
            </p>
            <GraficoAguaVigor historico={historico} />

            <ReporteCiclos historico={historico} clima={clima} />
            <Fuente>
                {historico.fuente} · {formatearFecha(historico.desde)} a {formatearFecha(historico.hasta)} · píxel de {historico.resolucion_m} m ·
                parcela de <span className="dato">{historico.area_ha} ha</span> · consultado {formatearFecha(historico.consultado)}
            </Fuente>
        </Card>
    );
}

export function ParcelaPage() {
    const dibujo = useDibujoParcela();
    const ndvi = useConsultaParcela(dibujo.geometria, getHistoricoNdvi);
    const clima = useConsultaParcela(dibujo.geometria, getClima);
    const suelo = useConsultaParcela(dibujo.geometria, getSuelo);
    // Los insights reutilizan lo que ya calcularon /ndvi y /clima: se piden
    // cuando los dos llegaron, así el servicio los toma de su caché.
    const listos = ndvi.tipo === "listo" && clima.tipo === "listo";
    const insights = useConsultaParcela(listos ? dibujo.geometria : null, getInsights);

    return (
        <main className={styles.pagina}>
            <header>
                <h1 className="titulo">Tu parcela</h1>
                <Instrucciones cantidadVertices={dibujo.vertices.length} cerrada={dibujo.cerrada} />
            </header>

            <MapaParcela
                vertices={dibujo.vertices}
                cerrada={dibujo.cerrada}
                onAgregarVertice={dibujo.agregarVertice}
                onCerrar={dibujo.cerrar}
            />

            <div className={styles.acciones}>
                <Button variante="primario" onClick={dibujo.cerrar} disabled={!dibujo.puedeCerrar}>
                    Cerrar parcela
                </Button>
                <Button onClick={dibujo.deshacer} disabled={dibujo.cerrada || dibujo.vertices.length === 0}>
                    Deshacer punto
                </Button>
                <Button onClick={dibujo.reiniciar} disabled={dibujo.vertices.length === 0}>
                    Empezar de nuevo
                </Button>
            </div>

            <SegunEstado estado={insights} titulo="Qué podés hacer" mensajeCargando="Revisando qué dicen los datos de tu parcela.">
                {(datos) => <TarjetaInsights datos={datos} />}
            </SegunEstado>

            <SegunEstado
                estado={ndvi}
                titulo="Cómo la vio el satélite"
                mensajeCargando="Buscando las pasadas de Sentinel-2 sobre tu parcela. La primera vez tarda alrededor de un minuto."
            >
                {(historico) => <Historico historico={historico} clima={clima.tipo === "listo" ? clima.datos : null} />}
            </SegunEstado>

            <div className={styles.grillaTarjetas}>
                <SegunEstado estado={clima} titulo="Clima de la zona" mensajeCargando="Consultando el clima del último año en NASA POWER.">
                    {(datos) => <TarjetaClima clima={datos} />}
                </SegunEstado>
                <SegunEstado estado={suelo} titulo="Suelo del lugar" mensajeCargando="Consultando el suelo en SoilGrids.">
                    {(datos) => <TarjetaSuelo suelo={datos} />}
                </SegunEstado>
            </div>
        </main>
    );
}
