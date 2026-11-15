import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { Tono } from "./estadosVisuales";
import styles from "./Chip.module.css";

type Props = { tono?: Tono; Icono?: LucideIcon; children: ReactNode };

// Chip local del panel (estados de pedido y pago, tipo de comprador, metas).
// Los sellos de verificación usan SelloVerificacion del sistema de diseño.
export function Chip({ tono = "neutro", Icono, children }: Props) {
    return (
        <span className={`etiqueta ${styles.chip} ${styles[tono]}`}>
            {Icono && <Icono size={14} strokeWidth={1.5} aria-hidden />}
            {children}
        </span>
    );
}

export function Barra({ porcentaje }: { porcentaje: number }) {
    return (
        <span className={styles.barra} aria-hidden>
            <span className={styles.relleno} style={{ width: `${Math.min(100, Math.max(0, porcentaje))}%` }} />
        </span>
    );
}
