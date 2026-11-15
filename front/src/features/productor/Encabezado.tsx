import { Link } from "react-router-dom";
import { PRODUCTOR } from "../../api/fixtures/productor";
import { EnlaceBoton } from "../../design-system";
import styles from "./panel.module.css";

export function Encabezado() {
    return (
        <header className={styles.encabezado}>
            <Link to="/" className={styles.marca} aria-label="Surco, volver a la landing">
                Surco
                <span className={`etiqueta ${styles.rolMarca}`}>Productor</span>
            </Link>

            <div className={styles.contexto}>
                <strong className="small">{PRODUCTOR.nombre}</strong>
                <span className={`small ${styles.textoSecundario}`}>
                    Lote <span className="dato">{PRODUCTOR.lote}</span> · {PRODUCTOR.zona}
                </span>
            </div>

            <EnlaceBoton to="/" className={styles.verLanding}>
                Ver landing
            </EnlaceBoton>
        </header>
    );
}
