import type { ReactNode } from "react";
import styles from "./FichaTecnica.module.css";

// Ficha técnica: etiqueta a la izquierda, valor a la derecha, una fila por dato.
export function FichaTecnica({ children }: { children: ReactNode }) {
    return <dl className={styles.ficha}>{children}</dl>;
}

export function DatoFicha({ etiqueta, children, detalle }: { etiqueta: string; children: ReactNode; detalle?: ReactNode }) {
    return (
        <div className={styles.fila}>
            <dt className={`etiqueta ${styles.secundario}`}>{etiqueta}</dt>
            <dd className="body">
                {children}
                {detalle && <span className={`small ${styles.secundario}`}>{detalle}</span>}
            </dd>
        </div>
    );
}
