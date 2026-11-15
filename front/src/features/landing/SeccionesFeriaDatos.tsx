import { CloudRain, Droplets, Info, Layers, Sprout } from "lucide-react";
import { ChipCategoria, EnlaceBoton, SelloVerificacion, type Categoria } from "../../design-system";
import { HojaMarca } from "./HojaMarca";
import { Revelar } from "./Revelar";
import styles from "./landing.module.css";

type Puesto = {
    categoria: Categoria;
    titulo: string;
    texto: string;
    precio: string;
    unidad: string;
    foto: string;
    alt: string;
};

// Fotos reales con licencia libre (Wikimedia Commons), recortadas a la
// tarjeta y sin metadatos. Los créditos van en la nota de abajo.
const PUESTOS: Puesto[] = [
    {
        categoria: "hortalizas",
        titulo: "Bolsón de estación",
        texto: "Tomate, lechuga, acelga y lo que dé la quinta esa semana.",
        precio: "$ 4.800",
        unidad: "bolsón",
        foto: "/feria/hortalizas.jpg",
        alt: "Puesto de verduras agroecológicas en una plaza de Santa Fe"
    },
    {
        categoria: "frutas",
        titulo: "Cajón de frutas",
        texto: "De estación y del cinturón verde, cosechadas cerca.",
        precio: "$ 6.200",
        unidad: "cajón",
        foto: "/feria/frutas.jpg",
        alt: "Cajones de frutillas, arándanos y frutas de estación en un mercado"
    },
    {
        categoria: "vinos",
        titulo: "Malbec con cobertura",
        texto: "Cobertura entre filas verificada durante todo el invierno.",
        precio: "$ 9.500",
        unidad: "botella",
        foto: "/feria/vinos.jpg",
        alt: "Viñedo en invierno con cultivo de cobertura verde entre las filas"
    }
];

const CREDITOS = [
    { autor: "Berna Gaitán Otarán", licencia: "CC BY-SA 4.0", pagina: "https://commons.wikimedia.org/wiki/File:Puesto_de_verduras_agroecol%C3%B3gicas_en_ciudad_de_Santa_Fe.jpg" },
    { autor: "domdomegg", licencia: "CC BY 4.0", pagina: "https://commons.wikimedia.org/wiki/File:Fruit_stalls_at_Ljubljana_Central_Market_03.JPG" },
    { autor: "Lore Sjoberg", licencia: "CC BY 2.0", pagina: "https://commons.wikimedia.org/wiki/File:Vineyard_in_Winter,_Sonoma_with_cover_crop.jpg" }
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
                                <img className={styles.fotoFeria} src={p.foto} alt={p.alt} loading="lazy" width={960} height={600} />
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
                <p className={`small ${styles.notaDemo}`}>
                    Productos y precios de demostración. Cuando esté en marcha, cada puesto va a tener su productor y su lote real. Fotos de Wikimedia Commons:{" "}
                    {CREDITOS.map((c, i) => (
                        <span key={c.pagina}>
                            {i > 0 && (i === CREDITOS.length - 1 ? " y " : ", ")}
                            <a href={c.pagina} target="_blank" rel="noreferrer">
                                {c.autor} ({c.licencia})
                            </a>
                        </span>
                    ))}
                    .
                </p>
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
