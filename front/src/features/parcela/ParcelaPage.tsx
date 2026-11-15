import { SelectorTema } from "../../design-system";
import { usePreferenciaTema } from "../../lib/tema";
import { ParcelaContenido } from "./ParcelaContenido";
import styles from "./parcela.module.css";

export function ParcelaPage() {
    const { tema, cambiar } = usePreferenciaTema();
    return (
        <main className={styles.pagina}>
            <div className={styles.barraTema}>
                <SelectorTema tema={tema} onCambiar={cambiar} />
            </div>
            <ParcelaContenido />
        </main>
    );
}
