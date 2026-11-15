import { Link } from "react-router-dom";
import { EnlaceBoton, SelectorTema } from "../../design-system";
import type { Tema } from "../../lib/tema";
import styles from "./panel.module.css";

export function Encabezado({ tema, onCambiarTema }: { tema: Tema; onCambiarTema: (tema: Tema) => void }) {
    return (
        <header className={styles.encabezado}>
            <Link to="/" className={styles.marca} aria-label="Surco, ir al sitio">
                Surco
                <span className={`etiqueta ${styles.rolMarca}`}>Productor</span>
            </Link>

            <div className={styles.accionesEncabezado}>
                <SelectorTema tema={tema} onCambiar={onCambiarTema} />
                <EnlaceBoton to="/" className={styles.verLanding}>
                    Ir al sitio
                </EnlaceBoton>
            </div>
        </header>
    );
}
