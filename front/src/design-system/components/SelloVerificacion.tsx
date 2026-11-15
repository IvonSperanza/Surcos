import { Check, Clock, Minus } from "lucide-react";
import styles from "./SelloVerificacion.module.css";

export type EstadoVerificacion = "verificado" | "pendiente" | "sin_verificar";

// design-system/README.md, "Estados de verificación": cada estado lleva
// siempre su palabra y su ícono, nunca sólo el color. "Sin verificar" es
// neutro: el satélite no lo pudo confirmar, no es una acusación.
const ESTADOS = {
    verificado: { palabra: "Verificado", Icono: Check },
    pendiente: { palabra: "Pendiente", Icono: Clock },
    sin_verificar: { palabra: "Sin verificar", Icono: Minus }
} as const;

export function SelloVerificacion({ estado, palabra }: { estado: EstadoVerificacion; palabra?: string }) {
    const { palabra: palabraEstado, Icono } = ESTADOS[estado];
    return (
        <span className={`etiqueta ${styles.sello} ${styles[estado]}`}>
            <Icono size={14} strokeWidth={2} aria-hidden />
            {palabra ?? palabraEstado}
        </span>
    );
}
