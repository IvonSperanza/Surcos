import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { Evento } from "../../api/eventos";
import { Card, DatoFicha, FichaTecnica, Fuente } from "../../design-system";
import { formatearFecha } from "../../lib/fecha";
import { areaHa } from "../../lib/geometria";
import { formatearNumero } from "../../lib/numero";
import { CreditoFoto } from "../eventos/CreditoFoto";
import { LineaTiempo } from "../eventos/LineaTiempo";
import { nombreCultivo, nombreEspecie } from "../eventos/textoEvento";
import { TIPOS_EVENTO } from "../eventos/tiposEvento";
import { MapaParcelas } from "../parcelas/MapaParcelas";
import { diasDeCultivo, fotoDeProduccion, type Produccion } from "./producciones";
import type { ProduccionDeParcela } from "./useProducciones";
import styles from "./producciones.module.css";

const APLICACIONES = new Set<Evento["tipo"]>(["fertilizacion", "fitosanitario"]);

const juntar = (...partes: (string | undefined)[]) => partes.filter(Boolean).join(" · ");

function DatosClave({ produccion, enlaceParcela }: { produccion: ProduccionDeParcela; enlaceParcela?: string }) {
    const { cultivo, siembra, cosecha, parcela, kg } = produccion;
    const dias = diasDeCultivo(produccion);
    return (
        <Card className={styles.datosClave}>
            <FichaTecnica>
                <DatoFicha etiqueta="Cultivo" detalle={<i>{cultivo.nombreCientifico}</i>}>
                    {nombreEspecie(cultivo)}
                </DatoFicha>
                <DatoFicha etiqueta="Cultivar" detalle={cultivo.numeroInase ? <span className="dato">INASE n.º {cultivo.numeroInase}</span> : "No inscripto en el INASE"}>
                    {cultivo.cultivar}
                </DatoFicha>
                <DatoFicha etiqueta="Familia">{cultivo.nombreFamilia ?? "Sin dato"}</DatoFicha>
                <DatoFicha etiqueta="Parcela" detalle={<span className="dato">{formatearNumero(areaHa(parcela.geometria), 2)} ha</span>}>
                    {enlaceParcela ? <Link to={enlaceParcela}>{parcela.nombre}</Link> : parcela.nombre}
                </DatoFicha>
                <DatoFicha etiqueta="Siembra" detalle={juntar(siembra.detalles.metodo, siembra.detalles.semilla && `semilla ${siembra.detalles.semilla.toLocaleLowerCase("es-AR")}`)}>
                    <span className="dato">{formatearFecha(siembra.fecha)}</span>
                </DatoFicha>
                <DatoFicha etiqueta="Cosecha" detalle={dias !== null ? <span className="dato">{dias} días de cultivo</span> : undefined}>
                    {cosecha ? <span className="dato">{formatearFecha(cosecha.fecha)}</span> : "En pie"}
                </DatoFicha>
                <DatoFicha etiqueta="Cosechado">{kg ? <span className="dato">{formatearNumero(kg)} kg</span> : "—"}</DatoFicha>
            </FichaTecnica>
            <Fuente>Declarado por el productor · Catálogo Nacional de Cultivares (INASE)</Fuente>
        </Card>
    );
}

// Lo que más pregunta quien compra: qué se le puso a la planta.
function Aplicaciones({ eventos }: { eventos: Evento[] }) {
    return (
        <Card className={styles.seccion}>
            <h2 className="subtitulo">Aplicaciones</h2>
            {eventos.length > 0 ? (
                <ul className={styles.aplicaciones}>
                    {eventos.map((e) => (
                        <li key={e.id} className={styles.aplicacion}>
                            <div>
                                <p className="body">{e.detalles.producto}</p>
                                <p className={`small ${styles.secundario}`}>
                                    {juntar(e.detalles.origen ?? e.detalles.clase, e.detalles.dosis, e.detalles.carencia && `carencia de ${e.detalles.carencia} días`)}
                                </p>
                            </div>
                            <span className={`dato ${styles.secundario}`}>{formatearFecha(e.fecha)}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="body">Sin fertilizantes ni fitosanitarios registrados.</p>
            )}
        </Card>
    );
}

function FotoProduccion({ produccion }: { produccion: Produccion }) {
    const conFoto = fotoDeProduccion(produccion);
    if (!conFoto) return null;
    const { foto, evento } = conFoto;
    return (
        <figure className={styles.foto}>
            <img src={foto.url} alt={nombreCultivo(produccion.cultivo)} />
            <figcaption className="small">
                {TIPOS_EVENTO[evento.tipo].nombre} del {formatearFecha(evento.fecha)} · <CreditoFoto foto={foto} />
            </figcaption>
        </figure>
    );
}

type Props = { produccion: ProduccionDeParcela; enlaceParcela?: string };

// Toda la información de una producción. Es la misma que va a ver quien
// compre al escanear el QR del producto, así que no depende del panel.
export function DetalleProduccion({ produccion, enlaceParcela }: Props) {
    const soloSuParcela = useMemo(() => [produccion.parcela], [produccion.parcela]);
    const delCultivo = [produccion.siembra, ...produccion.durante, ...(produccion.cosecha ? [produccion.cosecha] : [])];

    return (
        <>
            <FotoProduccion produccion={produccion} />

            <div className={styles.grillaDetalle}>
                <MapaParcelas parcelas={soloSuParcela} compacto />
                <DatosClave produccion={produccion} enlaceParcela={enlaceParcela} />
            </div>

            <Aplicaciones eventos={produccion.durante.filter((e) => APLICACIONES.has(e.tipo))} />

            <Card className={styles.seccion}>
                <h2 className="subtitulo">Historial</h2>
                <LineaTiempo eventos={[...delCultivo].reverse()} />
            </Card>

            <section className={styles.historial} aria-labelledby={`historial-${produccion.id}`}>
                <h2 id={`historial-${produccion.id}`} className="subtitulo">
                    Antes de la siembra
                </h2>
                {produccion.antes.length > 0 ? (
                    <LineaTiempo eventos={[...produccion.antes].reverse()} />
                ) : (
                    <p className="body">Sin eventos desde la cosecha anterior.</p>
                )}
            </section>
        </>
    );
}
