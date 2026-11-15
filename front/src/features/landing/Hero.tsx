import { ArrowRight, MapPin } from "lucide-react";
import { EnlaceBoton } from "../../design-system";
import { EscenaMarca } from "./EscenaMarca";
import styles from "./landing.module.css";

const BANDERINES = Array.from({ length: 18 }, (_, i) => i);

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
            <div className={styles.banderines} aria-hidden="true">
                {BANDERINES.map((i) => (
                    <span key={i} />
                ))}
            </div>
            <HojaDecorativa className={styles.hoja1} color="oliva-soft" />
            <HojaDecorativa className={styles.hoja2} color="trigo" />

            <div className={`${styles.contenedor} ${styles.heroGrilla}`}>
                <div>
                    <span className={styles.pastilla}>
                        <span className={styles.puntoPulso} aria-hidden="true" /> Feria directa · del productor a tu mesa
                    </span>
                    {/* `display` va una sola vez por pantalla: es este título. */}
                    <h1 className={styles.heroTitulo}>
                        Comé con historia.
                        <br />
                        Cuidá <span className={styles.resaltado}>la tierra</span>.
                    </h1>
                    <p className={styles.bajada}>
                        Surco es la feria donde cada alimento muestra de dónde viene. Escaneá el código y mirá el campo, el productor y la cosecha. Y el
                        productor cobra mejor por cuidar el suelo.
                    </p>
                    <div className={styles.heroAcciones}>
                        <EnlaceBoton to="#feria" variante="primario" grande>
                            Ver la feria
                            <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
                        </EnlaceBoton>
                        <EnlaceBoton to="/productor" variante="contorno" grande>
                            Soy productor
                        </EnlaceBoton>
                    </div>
                    <ul className={styles.confianza} aria-label="Qué ofrece Surco">
                        <li>
                            <span className={`${styles.punto} ${styles.puntoTrigo}`} aria-hidden="true" /> Origen real
                        </li>
                        <li>
                            <span className={`${styles.punto} ${styles.puntoCielo}`} aria-hidden="true" /> Suelo cuidado
                        </li>
                        <li>
                            <span className={`${styles.punto} ${styles.puntoArcilla}`} aria-hidden="true" /> Precio justo
                        </li>
                    </ul>
                </div>

                <div className={styles.heroVisual}>
                    <div className={styles.puesto}>
                        <div className={`${styles.toldo} ${styles.toldoHero}`} aria-hidden="true" />
                        <div className={styles.puestoInterior}>
                            <EscenaMarca />
                            <div className={styles.cartel}>
                                <MapPin size={14} strokeWidth={1.5} aria-hidden />
                                Cinturón hortícola de Rosario
                            </div>
                        </div>
                    </div>
                    <span className={`${styles.etiquetaPrecio} ${styles.etiqueta1}`}>
                        <i className={styles.agujero} aria-hidden="true" /> Tomate <b>$1.200/kg</b>
                    </span>
                    <span className={`${styles.etiquetaPrecio} ${styles.etiqueta2}`}>
                        <i className={styles.agujero} aria-hidden="true" /> Recién cosechado
                    </span>
                </div>
            </div>
        </section>
    );
}
