import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type Variante = "primario" | "secundario";

// `primario` (hoja) va una sola vez por vista; el resto, `secundario`.
export function Button({ variante = "secundario", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
    return <button className={[styles.boton, styles[variante], className].filter(Boolean).join(" ")} {...props} />;
}
