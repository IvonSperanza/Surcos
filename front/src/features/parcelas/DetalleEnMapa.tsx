import { ArrowRight } from "lucide-react";
import type { Parcela } from "../../api/parcelas";
import { formatearDuracion, formatearFecha } from "../../lib/fecha";
import { areaHa } from "../../lib/geometria";
import { formatearNumero } from "../../lib/numero";
import { tituloEvento } from "../eventos/textoEvento";
import { useEventos } from "../eventos/useEventos";
import { estadoGeneral, useDatosParcela } from "./almacenDatos";
import { ChipEstadoDatos } from "./ChipEstadoDatos";
import styles from "./parcelas.module.css";

// Lo justo para decidir si entrar a la ficha: estado de los datos, qué vio el
// satélite y qué fue lo último que se hizo en la parcela.
export function DetalleEnMapa({ parcela, onAbrir }: { parcela: Parcela; onAbrir: () => void }) {
    const datos = useDatosParcela(parcela.id);
    const { eventos } = useEventos(parcela.id);
    const ultimo = eventos?.[0];
    const ndvi = datos.ndvi.tipo === "listo" ? datos.ndvi.datos : null;
    const cultivos = ndvi?.analisis.ciclos.filter((c) => c.tipo === "cultivo").length ?? 0;

    return (
        <div className={styles.detalleMapa}>
            <p className="subtitulo">{parcela.nombre}</p>
            <div className={styles.filaTarjeta}>
                <span className="dato">{formatearNumero(areaHa(parcela.geometria), 2)} ha</span>
                <ChipEstadoDatos estado={estadoGeneral(datos)} />
            </div>
            {ndvi && (
                <p className="small">
                    <span className="dato">{cultivos}</span> {cultivos === 1 ? "cultivo" : "cultivos"} en el último año · sin cultivo{" "}
                    {ndvi.analisis.dias_sin_cultivo > 0 ? formatearDuracion(ndvi.analisis.dias_sin_cultivo) : "nunca"}
                </p>
            )}
            <p className={`small ${styles.textoSecundario}`}>
                {ultimo ? (
                    <>
                        Último evento: {tituloEvento(ultimo)} · <span className="dato">{formatearFecha(ultimo.fecha)}</span>
                    </>
                ) : (
                    "Sin eventos"
                )}
            </p>
            <button type="button" className={`small ${styles.verParcela}`} onClick={onAbrir}>
                Ver parcela
                <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
            </button>
        </div>
    );
}
