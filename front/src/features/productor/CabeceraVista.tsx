import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Fuente } from "../../design-system";
import styles from "./vistas.module.css";

type Props = {
    titulo: string;
    bajada?: string;
    // Pantallas de detalle: el camino de vuelta a la lista de la que salen.
    volver?: { to: string; etiqueta: string };
    // De dónde salen los datos de la vista; se dice una sola vez, acá.
    fuente?: ReactNode;
    acciones?: ReactNode;
    // Pestañas de la vista: cierran la cabecera y su línea hace de único divisor.
    pestanas?: ReactNode;
};

export function CabeceraVista({ titulo, bajada, volver, fuente, acciones, pestanas }: Props) {
    return (
        <header className={`${styles.cabecera} ${pestanas ? styles.cabeceraConPestanas : ""}`}>
            <div className={styles.filaCabecera}>
                <div className={styles.textoCabecera}>
                    {volver && (
                        <Link to={volver.to} className={`small ${styles.volver}`}>
                            <ArrowLeft size={16} strokeWidth={1.5} aria-hidden />
                            {volver.etiqueta}
                        </Link>
                    )}
                    <h1 className="titulo">{titulo}</h1>
                    {bajada && <p className={`body ${styles.bajada}`}>{bajada}</p>}
                    {fuente && <Fuente>{fuente}</Fuente>}
                </div>
                {acciones && <div className={styles.accionesCabecera}>{acciones}</div>}
            </div>
            {pestanas}
        </header>
    );
}
