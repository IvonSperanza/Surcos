import { Encabezado } from "./Encabezado";
import { Hero } from "./Hero";
import { ComoFunciona, Consumidores, Productores, Ticker } from "./SeccionesPublico";
import { DatosClaros, Feria, Pie, Sumate } from "./SeccionesFeriaDatos";
import styles from "./landing.module.css";

export function LandingPage() {
    return (
        <div className={styles.pagina}>
            <Encabezado />
            <main>
                <Hero />
                <Ticker />
                <ComoFunciona />
                <Productores />
                <Consumidores />
                <Feria />
                <DatosClaros />
                <Sumate />
            </main>
            <Pie />
        </div>
    );
}
