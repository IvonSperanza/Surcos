import { ParcelaContenido } from "../parcela/ParcelaContenido";
import styles from "./vistas.module.css";

// Mi lote muestra los datos reales de la parcela (Sentinel-2, NASA POWER,
// SoilGrids), no los de demostración del resto del panel.
export function VistaLote() {
    return (
        <section className={styles.vista} aria-label="Mi lote">
            <p className={`etiqueta ${styles.seccion}`}>Mi lote · datos satelitales reales</p>
            <ParcelaContenido />
        </section>
    );
}
