import styles from "./panel.module.css";

// La región viva existe siempre, vacía o no: si se monta junto con el texto,
// algunos lectores de pantalla no lo anuncian.
export function Toast({ mensaje }: { mensaje: string }) {
    return (
        <div role="status" aria-live="polite" className={`body ${styles.toast} ${mensaje ? styles.toastVisible : ""}`}>
            {mensaje}
        </div>
    );
}
