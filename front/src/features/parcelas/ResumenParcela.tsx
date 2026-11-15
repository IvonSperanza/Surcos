import type { Evento } from "../../api/eventos";
import type { Parcela } from "../../api/parcelas";
import { Card, DatoFicha as Dato, FichaTecnica, Fuente } from "../../design-system";
import { formatearDuracion, formatearFecha } from "../../lib/fecha";
import { areaHa } from "../../lib/geometria";
import { formatearNumero } from "../../lib/numero";
import { nombreCultivo, tituloEvento } from "../eventos/textoEvento";
import { produccionAbierta } from "../producciones/producciones";
import type { DatosDeParcela } from "./almacenDatos";
import { MapaParcelas } from "./MapaParcelas";
import styles from "./parcelas.module.css";

const GENERANDO = <span className={styles.textoSecundario}>Generando…</span>;

type Props = { parcela: Parcela; parcelas: Parcela[]; datos: DatosDeParcela; eventos: Evento[] | null };

// Lo esencial de la parcela en un vistazo: cada dato en una línea, con el
// detalle a un clic en su pestaña.
export function ResumenParcela({ parcela, parcelas, datos, eventos }: Props) {
    const ndvi = datos.ndvi.tipo === "listo" ? datos.ndvi.datos : null;
    const clima = datos.clima.tipo === "listo" ? datos.clima.datos : null;
    const suelo = datos.suelo.tipo === "listo" ? datos.suelo.datos : null;
    const cultivos = ndvi?.analisis.ciclos.filter((c) => c.tipo === "cultivo").length ?? 0;
    const ultimoEvento = eventos?.[0];
    const enPie = eventos ? produccionAbierta(eventos) : null;
    const ultimaPasada = ndvi?.serie.at(-1)?.fecha;

    return (
        <div className={styles.grillaResumen}>
            <MapaParcelas parcelas={parcelas} compacto />
            <Card className={styles.datosClave}>
                <FichaTecnica>
                    <Dato etiqueta="Superficie">
                        <span className="dato">{formatearNumero(areaHa(parcela.geometria), 2)} ha</span>
                    </Dato>
                    <Dato etiqueta="Cultivo en pie" detalle={enPie ? `Plantado el ${formatearFecha(enPie.siembra.fecha)}` : undefined}>
                        {eventos === null ? GENERANDO : enPie ? nombreCultivo(enPie.cultivo) : "Ninguno"}
                    </Dato>
                    <Dato etiqueta="Cultivos en 12 meses">{ndvi ? <span className="dato">{cultivos}</span> : GENERANDO}</Dato>
                    <Dato
                        etiqueta="Sin cultivo"
                        detalle={
                            ndvi && ndvi.analisis.dias_sin_cultivo > 0
                                ? `${formatearDuracion(ndvi.analisis.dias_con_rastrojo)} con rastrojo · ${formatearDuracion(ndvi.analisis.dias_suelo_desnudo)} desnudo`
                                : undefined
                        }
                    >
                        {ndvi ? (ndvi.analisis.dias_sin_cultivo > 0 ? formatearDuracion(ndvi.analisis.dias_sin_cultivo) : "Nunca") : GENERANDO}
                    </Dato>
                    <Dato etiqueta="Último evento" detalle={ultimoEvento ? formatearFecha(ultimoEvento.fecha) : undefined}>
                        {eventos === null ? GENERANDO : ultimoEvento ? tituloEvento(ultimoEvento) : "Sin eventos registrados"}
                    </Dato>
                    <Dato etiqueta="Suelo" detalle={suelo?.capas[0]?.carbono_organico != null ? `${formatearNumero(suelo.capas[0].carbono_organico, 1)} g/kg de carbono orgánico` : undefined}>
                        {suelo ? suelo.textura_superficial.charAt(0).toUpperCase() + suelo.textura_superficial.slice(1) : datos.suelo.tipo === "error" ? "Sin dato" : GENERANDO}
                    </Dato>
                    <Dato etiqueta="Lluvia en 12 meses">
                        {clima ? <span className="dato">{formatearNumero(clima.resumen.lluvia_total_mm)} mm</span> : GENERANDO}
                    </Dato>
                </FichaTecnica>
                <Fuente>
                    Sentinel-2{ultimaPasada && ` · última pasada ${formatearFecha(ultimaPasada)}`} · NASA POWER · SoilGrids
                </Fuente>
            </Card>
        </div>
    );
}
