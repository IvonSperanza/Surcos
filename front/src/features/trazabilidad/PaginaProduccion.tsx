import { Link, useParams } from "react-router-dom";
import { formatearFecha } from "../../lib/fecha";
import { useTema } from "../../lib/tema";
import { nombreCultivo } from "../eventos/textoEvento";
import { HojaMarca } from "../landing/HojaMarca";
import { DetalleProduccion } from "../producciones/DetalleProduccion";
import { EstadoProduccion } from "../producciones/EstadoProduccion";
import type { ProduccionPublica } from "../../api/producciones";
import { useProduccionPublica } from "./useProduccionPublica";
import styles from "./trazabilidad.module.css";

function Cabecera({ produccion }: { produccion: ProduccionPublica }) {
    const { cosecha, parcela, productor } = produccion;
    return (
        <header className={styles.cabecera}>
            <EstadoProduccion produccion={produccion} />
            <h1 className="titulo">{nombreCultivo(produccion.cultivo)}</h1>
            <p className={`body ${styles.secundario}`}>
                {cosecha ? (
                    <>
                        Cosechado el <span className="dato">{formatearFecha(cosecha.fecha)}</span> en {parcela.nombre}
                    </>
                ) : (
                    <>En pie en {parcela.nombre}</>
                )}
            </p>
            {productor && (
                <p className="body">
                    {productor.nombre} · {productor.localidad}
                </p>
            )}
        </header>
    );
}

function NoEncontrada({ codigo }: { codigo: string }) {
    return (
        <section className={styles.cabecera}>
            <h1 className="titulo">Producción no encontrada</h1>
            <p className="body">
                No hay ninguna producción con el código <span className="dato">{codigo}</span>.
            </p>
            {/* Mientras no exista el endpoint del back, los datos están en el navegador del productor. */}
            <p className={`small ${styles.secundario}`}>Por ahora las producciones se guardan en el navegador donde se cargaron.</p>
        </section>
    );
}

// Lo que ve quien compra al escanear el QR de la etiqueta. Va sin el panel y en
// tema Día, como el resto de lo público.
export function PaginaProduccion() {
    useTema("dia");
    const codigo = (useParams().codigo ?? "").toUpperCase();
    const produccion = useProduccionPublica(codigo);

    return (
        <div className={styles.pagina}>
            <header className={styles.barra}>
                <Link to="/" className={styles.marca}>
                    <HojaMarca />
                    Surco
                </Link>
                <span className={`dato ${styles.secundario}`}>{codigo}</span>
            </header>
            <main className={styles.contenido}>
                {produccion === undefined ? (
                    <p className="body">Cargando…</p>
                ) : produccion ? (
                    <>
                        <Cabecera produccion={produccion} />
                        <DetalleProduccion produccion={produccion} />
                    </>
                ) : (
                    <NoEncontrada codigo={codigo} />
                )}
            </main>
        </div>
    );
}
