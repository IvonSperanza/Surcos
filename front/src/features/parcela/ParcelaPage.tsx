import { Button, Card, Fuente } from "../../design-system";
import type { HistoricoNdvi } from "../../api/ndvi";
import { formatearFecha } from "../../lib/fecha";
import { GraficoNdvi } from "./GraficoNdvi";
import { MapaParcela } from "./MapaParcela";
import { ReporteCiclos } from "./ReporteCiclos";
import { resumirNdvi } from "./resumenNdvi";
import { useDibujoParcela } from "./useDibujoParcela";
import { useHistoricoNdvi } from "./useHistoricoNdvi";
import styles from "./parcela.module.css";

function Instrucciones({ cantidadVertices, cerrada }: { cantidadVertices: number; cerrada: boolean }) {
    if (cerrada) return <p className="body">Esta es tu parcela. Abajo ves cómo la vio el satélite en el último año.</p>;
    if (cantidadVertices === 0) return <p className="body">Hacé clic en cada esquina de tu parcela, sobre la imagen satelital.</p>;
    return <p className="body">Seguí marcando esquinas. Para cerrar la parcela, tocá el primer punto o el botón de abajo.</p>;
}

function Historico({ historico }: { historico: HistoricoNdvi }) {
    const resumen = resumirNdvi(historico);

    return (
        <Card className={styles.historico}>
            <h2 className="subtitulo">Cómo la vio el satélite</h2>
            <p className="body">
                En <span className="dato">{resumen.pasadas}</span> pasadas despejadas, el suelo se vio desnudo en{" "}
                <span className="dato">{resumen.pasadasSueloDesnudo}</span>. La franja marrón marca el suelo desnudo; la curva verde, el cultivo.
            </p>
            <GraficoNdvi historico={historico} />
            <ReporteCiclos historico={historico} />
            <Fuente>
                {historico.fuente} · {formatearFecha(historico.desde)} a {formatearFecha(historico.hasta)} · píxel de {historico.resolucion_m} m ·
                parcela de <span className="dato">{historico.area_ha} ha</span> · consultado {formatearFecha(historico.consultado)}
            </Fuente>
        </Card>
    );
}

export function ParcelaPage() {
    const dibujo = useDibujoParcela();
    const estado = useHistoricoNdvi(dibujo.geometria);

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

            {estado.tipo === "cargando" && (
                <Card>
                    <p className="body">Buscando las pasadas de Sentinel-2 sobre tu parcela. La primera vez tarda alrededor de un minuto.</p>
                </Card>
            )}
            {estado.tipo === "error" && (
                <Card>
                    <p className="body">No pudimos traer los datos del satélite: {estado.mensaje}</p>
                </Card>
            )}
            {estado.tipo === "listo" && <Historico historico={estado.historico} />}
        </main>
    );
}
