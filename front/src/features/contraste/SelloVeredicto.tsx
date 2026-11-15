import type { Veredicto } from "../../api/contraste";
import { VEREDICTOS } from "./veredictos";
import styles from "./contraste.module.css";

export function SelloVeredicto({ veredicto }: { veredicto: Veredicto }) {
    const { palabra, Icono } = VEREDICTOS[veredicto];
    return (
        <span className={`etiqueta ${styles.sello} ${styles[veredicto]}`}>
            <Icono size={14} strokeWidth={2} aria-hidden />
            {palabra}
        </span>
    );
}
