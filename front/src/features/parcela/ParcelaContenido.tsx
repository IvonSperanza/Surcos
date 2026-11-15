import { getClima } from "../../api/clima";
import { getInsights } from "../../api/insights";
import { getHistoricoNdvi } from "../../api/ndvi";
import { getSuelo } from "../../api/suelo";
import { Button } from "../../design-system";
import { DatosParcela } from "./DatosParcela";
import { SegunEstado } from "./SegunEstado";
import { TarjetaInsights } from "./TarjetaInsights";
import { MapaParcela } from "./MapaParcela";
import { useConsultaParcela } from "./useConsultaParcela";
import { useDibujoParcela } from "./useDibujoParcela";
import styles from "./parcela.module.css";

function Instrucciones({ cantidadVertices, cerrada }: { cantidadVertices: number; cerrada: boolean }) {
    if (cerrada) return null;
    if (cantidadVertices === 0) return <p className="body">Marcá las esquinas sobre el mapa.</p>;
    return <p className="body">Tocá el primer punto para cerrar.</p>;
}

export function ParcelaContenido() {
    const dibujo = useDibujoParcela();
    const ndvi = useConsultaParcela(dibujo.geometria, getHistoricoNdvi);
    const clima = useConsultaParcela(dibujo.geometria, getClima);
    const suelo = useConsultaParcela(dibujo.geometria, getSuelo);
    // Los insights reutilizan lo que ya calcularon /ndvi y /clima: se piden
    // cuando los dos llegaron, así el servicio los toma de su caché.
    const listos = ndvi.tipo === "listo" && clima.tipo === "listo";
    const insights = useConsultaParcela(listos ? dibujo.geometria : null, getInsights);

    return (
        <div className={styles.contenido}>
            <header>
                <h1 className="titulo">Parcela</h1>
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
                    Cerrar polígono
                </Button>
                <Button onClick={dibujo.deshacer} disabled={dibujo.cerrada || dibujo.vertices.length === 0}>
                    Deshacer punto
                </Button>
                <Button onClick={dibujo.reiniciar} disabled={dibujo.vertices.length === 0}>
                    Borrar dibujo
                </Button>
            </div>

            <SegunEstado estado={insights} titulo="Recomendaciones" mensajeCargando="Esperando satélite y clima…">
                {(datos) => <TarjetaInsights datos={datos} />}
            </SegunEstado>
            <DatosParcela ndvi={ndvi} clima={clima} suelo={suelo} />
        </div>
    );
}
