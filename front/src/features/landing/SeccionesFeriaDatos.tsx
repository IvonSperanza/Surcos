import type { ReactNode } from "react";
import { CloudRain, Droplets, Info, Layers, Sprout } from "lucide-react";
import { ChipCategoria, EnlaceBoton, SelloVerificacion, type Categoria } from "../../design-system";
import { HojaMarca } from "./HojaMarca";
import { Revelar } from "./Revelar";
import styles from "./landing.module.css";

const relleno = (token: string) => ({ fill: `var(--${token})` });

type Puesto = {
    categoria: Categoria;
    fondoArte: string;
    titulo: string;
    texto: string;
    precio: string;
    unidad: string;
    arte: ReactNode;
};

const PUESTOS: Puesto[] = [
    {
        categoria: "hortalizas",
        fondoArte: styles.arteHoja,
        titulo: "Bolsón de estación",
        texto: "Tomate, lechuga, acelga y lo que dé la quinta esa semana.",
        precio: "$ 4.800",
        unidad: "bolsón",
        arte: (
            <svg viewBox="0 0 240 150">
                <rect x="0" y="120" width="240" height="30" style={relleno("cobre")} />
                <rect x="60" y="70" width="120" height="54" rx="4" style={relleno("cobre")} />
                {[70, 90, 110].map((y) => (
                    <rect key={y} x="60" y={y} width="120" height="14" rx="4" style={relleno("cobre")} />
                ))}
                <circle cx="95" cy="62" r="18" style={relleno("hoja")} />
                <circle cx="120" cy="54" r="20" style={relleno("hoja")} />
                <circle cx="146" cy="62" r="17" style={relleno("hoja")} />
                <circle cx="108" cy="60" r="12" style={relleno("cobre")} />
                <circle cx="134" cy="58" r="11" style={relleno("sol")} />
            </svg>
        )
    },
    {
        categoria: "frutas",
        fondoArte: styles.arteCobre,
        titulo: "Cajón de frutas",
        texto: "De estación y del cinturón verde, cosechadas cerca.",
        precio: "$ 6.200",
        unidad: "cajón",
        arte: (
            <svg viewBox="0 0 240 150">
                <rect x="0" y="120" width="240" height="30" style={relleno("cobre")} />
                <path d="M50 84h140l-14 40H64z" style={relleno("sol")} />
                <path d="M50 84h140" style={{ stroke: "var(--hoja)", strokeWidth: 5, strokeLinecap: "round" }} />
                <circle cx="96" cy="74" r="18" style={relleno("cobre")} />
                <circle cx="124" cy="64" r="20" style={relleno("cobre")} />
                <circle cx="150" cy="76" r="16" style={relleno("sol")} />
                <circle cx="110" cy="66" r="10" style={relleno("hoja")} />
                <circle cx="140" cy="68" r="9" style={relleno("hoja")} />
            </svg>
        )
    },
    {
        categoria: "vinos",
        fondoArte: styles.arteUva,
        titulo: "Malbec con cobertura",
        texto: "Cobertura entre filas verificada durante todo el invierno.",
        precio: "$ 9.500",
        unidad: "botella",
        arte: (
            <svg viewBox="0 0 240 150">
                <rect x="0" y="120" width="240" height="30" style={relleno("cobre")} />
                <rect x="104" y="36" width="32" height="88" rx="6" style={relleno("cobre")} />
                <path d="M104 42c0-14 10-16 10-24h12c0 8 10 10 10 24z" style={relleno("cobre")} />
                <rect x="110" y="20" width="20" height="10" rx="2" style={relleno("uva")} />
                <rect x="108" y="64" width="24" height="34" rx="3" style={relleno("uva-soft")} />
                <rect x="110" y="70" width="20" height="6" style={relleno("sol")} />
                {[
                    [168, 92], [184, 92], [176, 106], [192, 106], [184, 120]
                ].map(([cx, cy]) => (
                    <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="9" style={relleno("uva")} />
                ))}
            </svg>
        )
    }
];

export function Feria() {
    return (
        <section className={styles.seccion} id="feria">
            <div className={styles.contenedor}>
                <Revelar className={styles.cabeceraSeccion}>
                    <h2 className={styles.tituloSeccion}>Rico, cercano y con historia.</h2>
                    <p className={styles.subtituloSeccion}>
                        Cada puesto lleva el sello de la práctica verificada en su lote. Esto es una muestra de cómo se va a ver la feria.
                    </p>
                </Revelar>

                <div className={styles.grillaProductos}>
                    {PUESTOS.map((p, i) => (
                        <Revelar as="article" key={p.titulo} orden={i}>
                            <div className={styles.puestoFeria}>
                                <div className={`${styles.arteFeria} ${p.fondoArte}`} aria-hidden="true">
                                    {p.arte}
                                </div>
                                <div className={styles.cuerpoFeria}>
                                    <div className={styles.filaChips}>
                                        <ChipCategoria categoria={p.categoria} />
                                        <SelloVerificacion estado="verificado" />
                                    </div>
                                    <h3 className="subtitulo">{p.titulo}</h3>
                                    <p className="small">{p.texto}</p>
                                    <span className={styles.precioFeria}> <span className="dato">{p.precio}</span> <em>/ {p.unidad}</em>
                                    </span>
                                </div>
                            </div>
                        </Revelar>
                    ))}
                </div>
                <p className={`small ${styles.notaDemo}`}>Productos y precios de demostración. Cuando esté en marcha, cada puesto va a tener su productor y su lote real.</p>
            </div>
        </section>
    );
}

// Las fuentes son las que usa hoy el servicio de datos (datos/FUENTES.md).
const DATOS = [
    { Icono: CloudRain, clase: styles.iconoCielo, titulo: "Lluvia y temperatura", texto: "El clima de cada campaña, día por día.", fuente: "NASA POWER" },
    { Icono: Sprout, clase: styles.iconoHoja, titulo: "Verde y ciclos del campo", texto: "Cuántos cultivos hubo y cuánto tiempo el suelo quedó desnudo o con rastrojo.", fuente: "Sentinel-2 · 10 m" },
    { Icono: Droplets, clase: styles.iconoCobre, titulo: "Agua en el suelo", texto: "Si la tierra tiene agua disponible para las raíces.", fuente: "NASA POWER" },
    { Icono: Layers, clase: styles.iconoSol, titulo: "Tipo de suelo", texto: "Textura, carbono orgánico y acidez del lugar.", fuente: "SoilGrids" }
];

const TABLA_TECNICA = [
    { dato: "Verde (NDVI) y cobertura de la parcela", fuente: "Sentinel-2 L2A (ESA) · 10 m, cada ~5 días", demo: "Real: se consulta al momento sobre la parcela que dibuja el productor" },
    { dato: "Clima y agua en las raíces", fuente: "NASA POWER · celda de ~50 km", demo: "Real, por coordenadas de la parcela" },
    { dato: "Suelo", fuente: "SoilGrids (ISRIC) · 250 m", demo: "Real: estimación de modelo, no una muestra" },
    { dato: "Productos, precios y productores", fuente: "—", demo: "De demostración" }
];

export function DatosClaros() {
    return (
        <section className={`${styles.seccion} ${styles.seccionDatos}`} id="datos">
            <div className={styles.contenedor}>
                <Revelar className={styles.cabeceraSeccion}>
                    <h2 className={styles.tituloSeccion}>Cada dato dice de dónde sale.</h2>
                    <p className={styles.subtituloSeccion}>No inventamos números. Si algo es de ejemplo, lo decimos. Y si querés el detalle técnico, está a un clic.</p>
                </Revelar>

                <div className={styles.grillaDatos}>
                    {DATOS.map(({ Icono, clase, titulo, texto, fuente }, i) => (
                        <Revelar as="article" key={titulo} orden={i} className={styles.tarjetaDato}>
                            <span className={`${styles.icono} ${clase}`}>
                                <Icono size={20} strokeWidth={1.5} aria-hidden />
                            </span>
                            <h3 className="subtitulo">{titulo}</h3>
                            <p className="small">{texto}</p>
                            <span className={`dato ${styles.fuenteDato}`}>{fuente}</span>
                        </Revelar>
                    ))}
                </div>

                <Revelar className={styles.aviso}>
                    <Info size={24} strokeWidth={1.5} aria-hidden />
                    <div>
                        <h3 className="subtitulo">Lo que el satélite ve y lo que no</h3>
                        <p className="body">
                            El satélite ve el verde y los ciclos del campo, pero no distingue una lechuga de un tomate. Por eso el productor declara qué plantó y
                            el satélite confirma el patrón. “Sin verificar” es neutro: significa que no se pudo confirmar, no una acusación.
                        </p>
                    </div>
                </Revelar>

                <Revelar as="details" className={styles.tecnico}>
                    <summary>Ver el detalle técnico</summary>
                    <div className={styles.envolturaTabla}>
                        <table className={styles.tabla}>
                            <thead>
                                <tr className="etiqueta">
                                    <th scope="col">Dato</th>
                                    <th scope="col">Fuente</th>
                                    <th scope="col">En la demo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {TABLA_TECNICA.map((fila) => (
                                    <tr key={fila.dato}>
                                        <td>{fila.dato}</td>
                                        <td className="dato">{fila.fuente}</td>
                                        <td>{fila.demo}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Revelar>
            </div>
        </section>
    );
}

export function Sumate() {
    return (
        <section className={styles.franjaSumate} id="sumate">
            <div className={`${styles.contenedor} ${styles.interiorSumate}`}>
                <div>
                    <h2 className={styles.tituloSumate}>Empezá por un producto. O por tu quinta.</h2>
                    <p className={styles.bajadaSumate}>Comprá con historia o sumá tu lote y vendé mejor. Surco funciona para los dos lados del mostrador.</p>
                </div>
                <div className={styles.accionesSumate}>
                    <EnlaceBoton to="#feria" variante="secundario" grande>
                        Quiero comprar
                    </EnlaceBoton>
                    <EnlaceBoton to="/productor" variante="contorno" grande>
                        Soy productor
                    </EnlaceBoton>
                </div>
            </div>
        </section>
    );
}

export function Pie() {
    return (
        <footer className={styles.pie} data-theme="noche">
            <div className={`${styles.contenedor} ${styles.grillaPie}`}>
                <div>
                    <p className={styles.marcaPie}>
                        <HojaMarca tamano={22} />
                        Surco
                    </p>
                    <p className="small" style={{ marginTop: "var(--space-2)" }}>
                        Del satélite a tu mesa.
                    </p>
                </div>
                <nav className={styles.navPie} aria-label="Secundaria">
                    <a href="#feria">La feria</a>
                    <a href="#como-funciona">Cómo funciona</a>
                    <a href="/productor">Panel del productor</a>
                    <a href="#datos">Datos</a>
                </nav>
                <div className={styles.metaPie}>
                    <p>NASA Space Apps Challenge 2026 · Sede Rosario (UCEL).</p>
                    <p>Datos reales: verde y cobertura con Sentinel-2, clima y agua en el suelo con NASA POWER, suelo con SoilGrids. Productos y precios de demostración.</p>
                </div>
            </div>
        </footer>
    );
}
