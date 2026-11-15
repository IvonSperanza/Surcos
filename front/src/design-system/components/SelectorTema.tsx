import { Moon, Sun } from "lucide-react";
import type { Tema } from "../../lib/tema";
import styles from "./SelectorTema.module.css";

const OPCIONES = [
    { tema: "dia", palabra: "Día", Icono: Sun },
    { tema: "noche", palabra: "Noche", Icono: Moon }
] as const;

// Toggle de tema (radius-pill, design-system/README.md "Espacio, forma y foco"):
// cada opción lleva ícono y palabra, y aria-pressed dice cuál está activa.
export function SelectorTema({ tema, onCambiar }: { tema: Tema; onCambiar: (tema: Tema) => void }) {
    return (
        <div className={styles.selector} role="group" aria-label="Tema de la pantalla">
            {OPCIONES.map(({ tema: opcion, palabra, Icono }) => (
                <button
                    key={opcion}
                    type="button"
                    className={`etiqueta ${styles.opcion}`}
                    aria-pressed={tema === opcion}
                    onClick={() => onCambiar(opcion)}
                >
                    <Icono size={14} strokeWidth={1.5} aria-hidden />
                    {palabra}
                </button>
            ))}
        </div>
    );
}
