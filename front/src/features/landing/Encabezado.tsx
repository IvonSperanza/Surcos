import { useState } from "react";
import { Menu, X } from "lucide-react";
import { EnlaceBoton } from "../../design-system";
import { HojaMarca } from "./HojaMarca";
import styles from "./landing.module.css";

const SECCIONES = [
    { ancla: "#feria", nombre: "La feria" },
    { ancla: "#como-funciona", nombre: "Cómo funciona" },
    { ancla: "#productores", nombre: "Productores" },
    { ancla: "#consumidores", nombre: "Consumidores" }
];

export function Encabezado() {
    const [abierto, setAbierto] = useState(false);
    const cerrar = () => setAbierto(false);

    return (
        <header className={styles.encabezado}>
            <div className={`${styles.contenedor} ${styles.encabezadoInterior}`}>
                <a className={styles.marca} href="#inicio">
                    <HojaMarca />
                    Surco
                </a>
                <button
                    className={styles.botonMenu}
                    type="button"
                    aria-expanded={abierto}
                    aria-controls="nav-principal"
                    aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
                    onClick={() => setAbierto((a) => !a)}
                >
                    {abierto ? <X size={22} strokeWidth={1.5} aria-hidden /> : <Menu size={22} strokeWidth={1.5} aria-hidden />}
                </button>
                <nav id="nav-principal" className={`${styles.nav} ${abierto ? styles.navAbierta : ""}`} aria-label="Principal" onClick={cerrar}>
                    {SECCIONES.map((s) => (
                        <a key={s.ancla} href={s.ancla}>
                            {s.nombre}
                        </a>
                    ))}
                    <EnlaceBoton to="/productor" variante="secundario">
                        Soy productor
                    </EnlaceBoton>
                </nav>
            </div>
        </header>
    );
}
