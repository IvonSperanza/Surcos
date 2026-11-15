import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./Button.module.css";

export type VarianteBoton = "primario" | "secundario" | "contorno";

type Props = {
    to: string; // ruta de la app ("/productor") o ancla de la página ("#feria")
    variante?: VarianteBoton;
    grande?: boolean;
    className?: string;
    children: ReactNode;
};

// Mismo aspecto que Button, pero navega. `contorno` es para fondos oscuros
// (oliva, tierra, arcilla), donde el secundario claro pesaría demasiado.
export function EnlaceBoton({ to, variante = "secundario", grande = false, className, children }: Props) {
    const clases = [styles.boton, styles[variante], grande && styles.grande, className].filter(Boolean).join(" ");
    if (to.startsWith("#")) {
        return (
            <a href={to} className={clases}>
                {children}
            </a>
        );
    }
    return (
        <Link to={to} className={clases}>
            {children}
        </Link>
    );
}
