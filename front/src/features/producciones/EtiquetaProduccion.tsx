import { QRCodeSVG } from "qrcode.react";
import { formatearFecha } from "../../lib/fecha";
import { nombreEspecie } from "../eventos/textoEvento";
import { HojaMarca } from "../landing/HojaMarca";
import type { ProduccionDeParcela } from "./useProducciones";
import styles from "./etiqueta.module.css";

type Props = { produccion: ProduccionDeParcela; url: string };

// La etiqueta que va pegada en el producto, en milímetros reales. Siempre en
// tema Día: se imprime sobre papel blanco aunque el panel esté en Noche.
export function EtiquetaProduccion({ produccion, url }: Props) {
    const { cultivo, cosecha, parcela } = produccion;
    return (
        <article className={styles.etiqueta} data-theme="dia">
            <div className={styles.texto}>
                <span className={styles.marca}>
                    <HojaMarca tamano={12} />
                    Surco
                </span>
                <div>
                    <p className={styles.cultivo}>{nombreEspecie(cultivo)}</p>
                    <p className={styles.linea}>
                        {cultivo.cultivar}
                        {cultivo.numeroInase && ` · INASE n.º ${cultivo.numeroInase}`}
                    </p>
                </div>
                <dl className={styles.datos}>
                    <div>
                        <dt>Cosecha</dt>
                        <dd>{cosecha ? formatearFecha(cosecha.fecha) : "—"}</dd>
                    </div>
                    <div>
                        <dt>Parcela</dt>
                        <dd>{parcela.nombre}</dd>
                    </div>
                </dl>
                <p className={styles.linea}>Escaneá el código para ver su historial.</p>
            </div>
            <div className={styles.qr}>
                {/* currentColor: el QR toma el color del texto, sin hardcodear uno. */}
                <QRCodeSVG value={url} level="M" marginSize={0} fgColor="currentColor" bgColor="transparent" />
                <span className={styles.codigo}>{produccion.codigo}</span>
            </div>
        </article>
    );
}
