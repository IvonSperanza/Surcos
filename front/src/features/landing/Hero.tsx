import { ArrowRight, MapPin, Satellite } from "lucide-react";
import { EnlaceBoton } from "../../design-system";
import { EscenaMarca } from "./EscenaMarca";
import styles from "./landing.module.css";

function HojaDecorativa({ className, color }: { className: string; color: string }) {
    return (
        <div className={`${styles.hoja} ${className}`} aria-hidden="true">
            <svg viewBox="0 0 64 64">
                <path d="M54 8c0 26-18 44-44 44H6C6 26 24 8 54 8z" style={{ fill: `var(--${color})` }} />
            </svg>
        </div>
    );
}

export function Hero() {
    return (
        <section className={styles.hero} id="inicio">
            <HojaDecorativa className={styles.hoja1} color="hoja-soft" />
            <HojaDecorativa className={styles.hoja2} color="sol-soft" />

            <div className={`${styles.contenedor} ${styles.heroGrilla}`}>
                <div>
                    {/* El título grande de la pantalla: `display` va una sola vez. */}
                    <h1 className={styles.heroTitulo}>
                        Comé con historia. Cuidá <span className={styles.resaltado}>la tierra</span>.
                    </h1>
                    <p className={styles.bajada}>
                        Surco es la feria donde cada alimento muestra de dónde viene. Escaneá el código y mirá el campo, el productor y la cosecha. Y el
                        productor cobra mejor por cuidar el suelo, con datos de satélite que lo prueban.
                    </p>
                    <div className={styles.heroAcciones}>
                        <EnlaceBoton to="#feria" variante="primario" grande>
                            Ver la feria
                            <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
                        </EnlaceBoton>
                        <EnlaceBoton to="/productor" variante="secundario" grande>
                            Soy productor
                        </EnlaceBoton>
                    </div>
                    <ul className={styles.confianza} aria-label="Qué ofrece Surco">
                        <li>
                            <span className={`${styles.punto} ${styles.puntoHoja}`} aria-hidden="true" /> Origen real
                        </li>
                        <li>
                            <span className={`${styles.punto} ${styles.puntoCielo}`} aria-hidden="true" /> Suelo verificado
                        </li>
                        <li>
                            <span className={`${styles.punto} ${styles.puntoSol}`} aria-hidden="true" /> Precio justo
                        </li>
                    </ul>
                </div>

                <div className={styles.heroVisual}>
                    <div className={styles.marcoEscena}>
                        <EscenaMarca />
                        <div className={`small ${styles.cartel}`}>
                            <span>
                                <MapPin size={14} strokeWidth={1.5} aria-hidden />
                                Cinturón hortícola de Rosario
                            </span>
                            <span className="dato">Sentinel-2 · NASA POWER</span>
                        </div>
                    </div>
                    <span className={`${styles.etiquetaFlotante} ${styles.etiqueta1}`}>
                        <Satellite size={14} strokeWidth={1.5} aria-hidden /> NDVI <b>0,72</b>
                    </span>
                    <span className={`${styles.etiquetaFlotante} ${styles.etiqueta2}`}>Suelo cubierto todo el año</span>
                </div>
            </div>
        </section>
    );
}
