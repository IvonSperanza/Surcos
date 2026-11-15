import { Check, LoaderCircle, Minus } from "lucide-react";
import type { EstadoGeneral } from "./almacenDatos";
import styles from "./parcelas.module.css";

// Color + palabra + ícono, nunca sólo color. "Generando" usa sol (lo que está
// en curso y pide atención); un error es neutro, sin rojo.
const ESTADOS: Record<EstadoGeneral, { palabra: string; clase: string; Icono: typeof Check }> = {
    generando: { palabra: "Generando datos", clase: styles.chipGenerando, Icono: LoaderCircle },
    listo: { palabra: "Datos listos", clase: styles.chipListo, Icono: Check },
    con_errores: { palabra: "Datos incompletos", clase: styles.chipIncompleto, Icono: Minus }
};

export function ChipEstadoDatos({ estado }: { estado: EstadoGeneral }) {
    const { palabra, clase, Icono } = ESTADOS[estado];
    return (
        <span className={`etiqueta ${styles.chip} ${clase}`} role="status">
            <Icono size={14} strokeWidth={2} aria-hidden className={estado === "generando" ? styles.girando : undefined} />
            {palabra}
        </span>
    );
}
