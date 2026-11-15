import { Check, Clock } from "lucide-react";
import type { Produccion } from "./producciones";
import styles from "./producciones.module.css";

// Color + ícono + palabra: en curso pide atención (sol); cosechada, listo.
export function EstadoProduccion({ produccion }: { produccion: Produccion }) {
    return produccion.cosecha ? (
        <span className={`etiqueta ${styles.estado} ${styles.cosechada}`}>
            <Check size={14} strokeWidth={2} aria-hidden />
            Cosechada
        </span>
    ) : (
        <span className={`etiqueta ${styles.estado} ${styles.enCurso}`}>
            <Clock size={14} strokeWidth={2} aria-hidden />
            En curso
        </span>
    );
}
