import type { ReactNode } from "react";
import { Fuente } from "../../design-system";
import styles from "./vistas.module.css";

type Props = {
    seccion: string;
    titulo: string;
    bajada: string;
    fuente: ReactNode;
    acciones?: ReactNode;
};

export function CabeceraVista({ seccion, titulo, bajada, fuente, acciones }: Props) {
    return (
        <header className={styles.cabecera}>
            <div className={styles.textoCabecera}>
                <p className={`etiqueta ${styles.seccion}`}>{seccion}</p>
                <h1 className="titulo">{titulo}</h1>
                <p className={`body ${styles.bajada}`}>{bajada}</p>
                <Fuente>{fuente}</Fuente>
            </div>
            {acciones && <div className={styles.accionesCabecera}>{acciones}</div>}
        </header>
    );
}
