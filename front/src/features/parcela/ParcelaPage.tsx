import { ParcelaContenido } from "./ParcelaContenido";
import styles from "./parcela.module.css";

export function ParcelaPage() {
    return (
        <main className={styles.pagina}>
            <ParcelaContenido />
        </main>
    );
}
